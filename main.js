const PRIORITY_COUNT = 48; // スクロール開始直後に使う分を先に読む
const EASE = 0.14; // displayedProgress が targetProgress に追従する速さ
const FOCUS = { x: 0.5, y: 0.5 }; // object-position 相当。木の見え方はここで微調整する

const OUTRO_START = 0.7; // ブランドレイアウトが組み上がり始めるスクロール位置

// OUTRO_START〜1.0 を 0〜1 に均した中での、各要素の出現区間。
// スマホは先に雪で画面を埋めきってから、その白の上にロゴを浮かべる。
const REVEAL = {
  wide: {
    mark: [0.0, 0.52],
    tag: [0.2, 0.7],
    head: [0.38, 0.84],
    foot: [0.54, 1.0],
  },
  narrow: {
    snow: [0.0, 0.62],
    mark: [0.56, 0.94],
    tag: [0.68, 1.0],
    head: [0.78, 1.0],
    foot: [0.84, 1.0],
  },
};

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const rangeAt = (v, [from, to]) => clamp01((v - from) / (to - from));
const easeOut = (t) => 1 - (1 - t) ** 3;

/**
 * 降る雪と、積もっていく吹きだまりを canvas に描く。
 * setAmount(0〜1) が積もり具合。0 になればループごと止まる。
 */
function initSnowfield(canvas) {
  const ctx = canvas.getContext("2d");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WIND = 26; // 横流れ。真下に落ちると嘘っぽくなる
  let flakes = [];
  let amount = 0;
  let rafId = null;
  let last = 0;
  let w = 0;
  let h = 0;
  let scale = 1;
  let white = "#f2f4f7";

  // 粒はぼけた丸のスプライトを拡大縮小して使う(1粒ずつ影を焼くと重い)
  const sprite = document.createElement("canvas");
  sprite.width = 32;
  sprite.height = 32;
  const sctx = sprite.getContext("2d");
  const grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.82)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 32, 32);

  const spawn = (scattered) => {
    // 手前ほど大きく・速く・薄い(被写界深度のかわり)
    const depth = Math.random() ** 1.6;
    const r = (1.1 + depth * 5.4) * scale;
    return {
      x: Math.random() * w,
      y: scattered ? Math.random() * h : -r * 3,
      r,
      speed: (26 + depth * 96) * scale,
      sway: (10 + Math.random() * 30) * scale,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.9 - depth * 0.45,
    };
  };

  // 吹きだまりの上端。うねりを重ねて直線を消す
  const crest = (x, lift, phase) => {
    const y = h - amount * h * lift;
    return (
      y +
      Math.sin(x * 0.0042 + phase) * 22 * scale +
      Math.sin(x * 0.011 + phase * 2.3) * 9 * scale +
      Math.sin(x * 0.027 + phase * 3.7) * 3.5 * scale
    );
  };

  const drawDrift = (lift, phase, alpha) => {
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12 * scale) ctx.lineTo(x, crest(x, lift, phase));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  };

  const tick = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, w, h);

    if (amount <= 0) {
      rafId = null;
      return;
    }

    ctx.fillStyle = white;
    drawDrift(0.58, 2.1, 0.86);

    // 降り始めにすぐ立ち上げ、埋まりきる頃には消しておく
    const falling =
      clamp01(amount * 3.4) * (1 - clamp01((amount - 0.62) / 0.34));
    if (falling > 0) {
      for (const f of flakes) {
        if (!still) {
          f.y += f.speed * dt;
          f.x += (WIND * scale + Math.sin(now * 0.0006 + f.phase) * f.sway) * dt;
        }
        if (f.y > crest(f.x, 0.72, 0.6) || f.x > w + 40 * scale) {
          Object.assign(f, spawn(false));
          f.x = Math.random() * w - 40 * scale;
        }
        const size = f.r * 3;
        ctx.globalAlpha = f.alpha * falling;
        ctx.drawImage(sprite, f.x - size / 2, f.y - size / 2, size, size);
      }
    }

    ctx.fillStyle = white;
    drawDrift(0.72, 0.6, 0.94);
    drawDrift(0.88, 4.4, 1);

    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(tick);
  };

  return {
    resize: () => {
      scale = Math.min(window.devicePixelRatio || 1, 2);
      white =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--snow-white")
          .trim() || white;
      w = canvas.width = Math.round(canvas.clientWidth * scale);
      h = canvas.height = Math.round(canvas.clientHeight * scale);
      flakes = Array.from({ length: 130 }, () => spawn(true));
    },
    setAmount: (next) => {
      const was = amount;
      amount = next;
      if (next > 0 && rafId === null) {
        last = performance.now();
        rafId = requestAnimationFrame(tick);
      } else if (next <= 0 && was > 0) {
        ctx.clearRect(0, 0, w, h);
      }
    },
  };
}

const framePath = (index) =>
  `frames/frame_${String(index + 1).padStart(4, "0")}.webp`;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });

/**
 * スクロール量を 0〜1 に正規化し、対応するフレーム画像を canvas に描画する。
 * 終盤ではブランドパネルの露出量に合わせて描画領域を詰め、写真を残りの面に収め直す。
 */
function initScrollScrubFrames({ track, canvas, images, heroUi, snowfield, onProgress }) {
  const ctx = canvas.getContext("2d");
  const root = document.documentElement;
  let target = 0;
  let displayed = 0;
  let rafId = null;
  let drawnIndex = -1;
  let lastImg = null;
  let pendingIndex = -1;
  let narrow = false;

  const getProgress = () => {
    const rect = track.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;
    if (distance <= 0) return 0;
    return clamp01(-rect.top / distance);
  };

  const paint = (img) => {
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (canvas.width - w) * FOCUS.x, (canvas.height - h) * FOCUS.y, w, h);
    lastImg = img;
  };

  const draw = (index) => {
    if (index === drawnIndex) return;
    const img = images[index];
    // 未ロードのフレームは直近のフレームで埋め、届いた時点で描き直す
    // (リサイズ直後は canvas が消えるので、ここを空にすると黒く抜ける)
    if (!img) {
      pendingIndex = index;
      const fallback = lastImg || images.find(Boolean);
      if (fallback) paint(fallback);
      return;
    }
    pendingIndex = -1;
    drawnIndex = index;
    paint(img);
  };

  const render = () => {
    const outro = clamp01((displayed - OUTRO_START) / (1 - OUTRO_START));
    const reveal = narrow ? REVEAL.narrow : REVEAL.wide;

    // 積もる量だけは等速。イーズをかけると途中で止まって見える
    const snowP = narrow ? rangeAt(outro, reveal.snow) : 0;
    root.style.setProperty("--p-snow", snowP.toFixed(4));
    snowfield.setAmount(snowP);
    root.style.setProperty("--p-mark", easeOut(rangeAt(outro, reveal.mark)).toFixed(4));
    root.style.setProperty("--p-tag", easeOut(rangeAt(outro, reveal.tag)).toFixed(4));
    root.style.setProperty("--p-head", easeOut(rangeAt(outro, reveal.head)).toFixed(4));
    root.style.setProperty("--p-foot", easeOut(rangeAt(outro, reveal.foot)).toFixed(4));
    heroUi.classList.toggle("is-interactive", outro > 0.92);

    if (onProgress) onProgress(displayed);
    draw(Math.round(displayed * (images.length - 1)));
  };

  const tick = () => {
    displayed += (target - displayed) * EASE;
    if (Math.abs(target - displayed) < 0.0005) displayed = target;
    render();
    rafId = displayed === target ? null : requestAnimationFrame(tick);
  };

  const requestUpdate = () => {
    target = getProgress();
    if (rafId === null) rafId = requestAnimationFrame(tick);
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    narrow = window.matchMedia("(max-width: 767px)").matches;
    snowfield.resize();
    drawnIndex = -1;
    render();
    requestUpdate();
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", resize);
  resize();

  return {
    // 後追いで届いたフレームが今表示すべきものなら描き直す
    frameLoaded: (index) => {
      if (index === pendingIndex) render();
    },
    destroy: () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", resize);
    },
  };
}

const root = document.documentElement;
const loader = document.querySelector("[data-loader]");
const loaderBar = document.querySelector("[data-loader-bar]");
const loaderCount = document.querySelector("[data-loader-count]");
const hint = document.querySelector("[data-scroll-hint]");
const progressBar = document.querySelector("[data-progress]");

async function start() {
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  root.classList.add("is-loading");

  const { count } = await fetch("frames/manifest.json").then((res) => res.json());
  const images = new Array(count);
  let scrub = null;

  const fill = (index) =>
    loadImage(framePath(index)).then((img) => {
      images[index] = img;
      if (scrub) scrub.frameLoaded(index);
    });

  const priority = Math.min(PRIORITY_COUNT, count);
  let loaded = 0;
  await Promise.all(
    Array.from({ length: priority }, (_, i) =>
      fill(i).then(() => {
        loaded += 1;
        loaderBar.style.width = `${(loaded / priority) * 100}%`;
        loaderCount.textContent = Math.round((loaded / priority) * 100);
      })
    )
  );

  root.classList.remove("is-loading");
  loader.classList.add("is-hidden");

  scrub = initScrollScrubFrames({
    track: document.querySelector("[data-scrub-track]"),
    canvas: document.querySelector("[data-scrub-canvas]"),
    heroUi: document.querySelector("[data-hero-ui]"),
    snowfield: initSnowfield(document.querySelector("[data-snow-canvas]")),
    images,
    onProgress: (progress) => {
      progressBar.style.width = `${progress * 100}%`;
      hint.classList.toggle("is-hidden", progress > 0.02);
    },
  });

  // 残りはバックグラウンドで読み込む
  for (let i = priority; i < count; i += 1) fill(i);
}

start().catch((error) => {
  console.error(error);
  root.classList.remove("is-loading");
});
