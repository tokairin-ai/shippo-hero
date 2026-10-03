/*!
 * Shippo Hero — スクロール量に同期して木の映像が進み、終盤でロゴが浮かび上がるヒーロー。
 * 依存ライブラリなし。<div data-shippo-hero> を見つけると自動で起動する。
 * 使い方は同じフォルダの README.md を参照。
 */
(() => {
  // このスクリプトの置き場所。frames/ はここからの相対パスで読む
  const SCRIPT_BASE = document.currentScript
    ? new URL(".", document.currentScript.src).href
    : "./";

  const DEFAULTS = {
    base: SCRIPT_BASE, // frames/ を含むフォルダ
    priorityCount: 48, // ローディングで待つ枚数。スクロール開始直後に使う分
    ease: 0.14, // 表示中の位置がスクロール位置に追従する速さ(小さいほど慣性が強い)
    focus: { x: 0.5, y: 0.5 }, // object-position 相当。木の見え方はここで微調整する
    outroStart: 0.7, // ロゴが組み上がり始めるスクロール位置
    scrubScreens: 3, // 映像を進めるのに使う画面数
    holdScreens: 2, // 組み上がったあと、次のセクションに入るまで静止させる画面数
    narrowQuery: "(max-width: 767px)", // スマホ用の演出に切り替える幅
    resetScroll: true, // 読み込み時にページ先頭へ戻す
  };

  // outroStart〜1.0 を 0〜1 に均した中での、各要素の出現区間。
  // スマホは先に雪で画面を埋めきってから、その白の上にロゴを浮かべる。
  const REVEAL = {
    wide: {
      mark: [0.0, 0.52],
      tag: [0.2, 0.7],
      foot: [0.54, 1.0],
    },
    narrow: {
      snow: [0.0, 0.62],
      mark: [0.56, 0.94],
      tag: [0.68, 1.0],
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
  function initSnowfield(canvas, root) {
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
          getComputedStyle(root).getPropertyValue("--shippo-hero-snow").trim() || white;
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
      destroy: () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
      },
    };
  }

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`failed to load ${src}`));
      img.src = src;
    });

  /**
   * スクロール量を 0〜1 に正規化し、対応するフレーム画像を canvas に描画する。
   * 終盤の出現量は --p-* 変数としてヒーロー要素に入れる(巻き戻せばそのまま逆再生される)。
   */
  function initScrollScrubFrames({ root, canvas, images, ui, snowfield, opts, onProgress }) {
    const ctx = canvas.getContext("2d");
    let target = 0;
    let displayed = 0;
    let rafId = null;
    let drawnIndex = -1;
    let lastImg = null;
    let pendingIndex = -1;
    let narrow = false;

    const getProgress = () => {
      const rect = root.getBoundingClientRect();
      // 末尾の holdScreens 分はスクラブに使わない。
      // 最終フレームまで来たあと、その画面のまま静止してから次のセクションへ抜ける
      const distance = rect.height - window.innerHeight * (1 + opts.holdScreens);
      if (distance <= 0) return 0;
      return clamp01(-rect.top / distance);
    };

    const paint = (img) => {
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(
        img,
        (canvas.width - w) * opts.focus.x,
        (canvas.height - h) * opts.focus.y,
        w,
        h
      );
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
      const outro = clamp01((displayed - opts.outroStart) / (1 - opts.outroStart));
      const reveal = narrow ? REVEAL.narrow : REVEAL.wide;

      // 積もる量だけは等速。イーズをかけると途中で止まって見える
      const snowP = narrow ? rangeAt(outro, reveal.snow) : 0;
      root.style.setProperty("--p-snow", snowP.toFixed(4));
      snowfield.setAmount(snowP);
      root.style.setProperty("--p-mark", easeOut(rangeAt(outro, reveal.mark)).toFixed(4));
      root.style.setProperty("--p-tag", easeOut(rangeAt(outro, reveal.tag)).toFixed(4));
      root.style.setProperty("--p-foot", easeOut(rangeAt(outro, reveal.foot)).toFixed(4));
      ui.classList.toggle("is-interactive", outro > 0.92);
      root.classList.toggle("is-complete", displayed >= 1);

      onProgress(displayed);
      draw(Math.round(displayed * (images.length - 1)));
    };

    const tick = () => {
      displayed += (target - displayed) * opts.ease;
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
      narrow = window.matchMedia(opts.narrowQuery).matches;
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
        snowfield.destroy();
      },
    };
  }

  // data-* 属性で上書きできる数値オプション(例: data-hold-screens="1")
  const readDataOptions = (root) => {
    const out = {};
    const num = (key, attr) => {
      const v = root.getAttribute(attr);
      if (v !== null && v !== "" && !Number.isNaN(Number(v))) out[key] = Number(v);
    };
    num("priorityCount", "data-priority-count");
    num("ease", "data-ease");
    num("outroStart", "data-outro-start");
    num("scrubScreens", "data-scrub-screens");
    num("holdScreens", "data-hold-screens");
    const base = root.getAttribute("data-base");
    if (base) out.base = new URL(base, document.baseURI).href;
    return out;
  };

  /**
   * ヒーローを起動する。戻り値の destroy() で後片付けできる。
   * @param {HTMLElement} root  class="shippo-hero" の要素
   * @param {object} [options]  DEFAULTS を上書きする値
   */
  function mount(root, options = {}) {
    const opts = { ...DEFAULTS, ...readDataOptions(root), ...options };
    if (!opts.base.endsWith("/")) opts.base += "/";

    const html = document.documentElement;
    const $ = (sel) => root.querySelector(sel);
    const canvas = $(".shippo-hero__canvas");
    const ui = $(".shippo-hero__ui");
    const hint = $(".shippo-hero__hint");
    const loader = $(".shippo-hero__loader");
    const loaderBar = $(".shippo-hero__loader-bar > span");
    const loaderCount = $(".shippo-hero__loader-count > span");
    const snowCanvas = $(".shippo-hero__snow-canvas");

    // トラックの長さは CSS の calc で決まる。オプションと必ず一致させる
    root.style.setProperty("--shippo-hero-scrub-screens", opts.scrubScreens);
    root.style.setProperty("--shippo-hero-hold-screens", opts.holdScreens);

    let scrub = null;
    let destroyed = false;
    const emit = (name, detail) =>
      root.dispatchEvent(new CustomEvent(`shippo-hero:${name}`, { detail, bubbles: true }));

    // SCROLL ボタン: リンク先が無ければヒーローの直後へ送る
    const scrollButton = $(".shippo-hero__scroll");
    const onScrollButton = (event) => {
      const href = scrollButton.getAttribute("href") || "";
      const target = href.startsWith("#") && href.length > 1 && document.querySelector(href);
      if (target) return;
      event.preventDefault();
      const end = root.getBoundingClientRect().bottom + window.scrollY;
      window.scrollTo({ top: end, behavior: "smooth" });
    };
    if (scrollButton) scrollButton.addEventListener("click", onScrollButton);

    const finishLoading = () => {
      html.classList.remove("shippo-hero-loading");
      if (loader) loader.classList.add("is-hidden");
    };

    const start = async () => {
      if (opts.resetScroll) {
        history.scrollRestoration = "manual";
        // サイト側が scroll-behavior: smooth でも、巻き戻る様子を見せない
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      html.classList.add("shippo-hero-loading");

      const framePath = (index) =>
        `${opts.base}frames/frame_${String(index + 1).padStart(4, "0")}.webp`;
      const { count } = await fetch(`${opts.base}frames/manifest.json`).then((res) => {
        if (!res.ok) throw new Error(`frames/manifest.json: ${res.status}`);
        return res.json();
      });
      const images = new Array(count);

      const fill = (index) =>
        loadImage(framePath(index)).then((img) => {
          images[index] = img;
          if (scrub) scrub.frameLoaded(index);
        });

      const priority = Math.min(opts.priorityCount, count);
      let loaded = 0;
      await Promise.all(
        Array.from({ length: priority }, (_, i) =>
          fill(i).then(() => {
            loaded += 1;
            if (loaderBar) loaderBar.style.width = `${(loaded / priority) * 100}%`;
            if (loaderCount) loaderCount.textContent = Math.round((loaded / priority) * 100);
          })
        )
      );
      if (destroyed) return;

      finishLoading();

      let wasComplete = false;
      scrub = initScrollScrubFrames({
        root,
        canvas,
        ui,
        images,
        opts,
        snowfield: initSnowfield(snowCanvas, root),
        onProgress: (progress) => {
          if (hint) hint.classList.toggle("is-hidden", progress > 0.02);
          emit("progress", { progress });
          const complete = progress >= 1;
          if (complete !== wasComplete) {
            wasComplete = complete;
            if (complete) emit("complete", { progress });
          }
        },
      });
      emit("ready", { frames: count });

      // 残りはバックグラウンドで読み込む
      for (let i = priority; i < count; i += 1) fill(i).catch(() => {});
    };

    start().catch((error) => {
      console.error("[shippo-hero]", error);
      finishLoading();
    });

    return {
      root,
      destroy: () => {
        destroyed = true;
        if (scrub) scrub.destroy();
        if (scrollButton) scrollButton.removeEventListener("click", onScrollButton);
        finishLoading();
      },
    };
  }

  window.ShippoHero = { mount, defaults: DEFAULTS };

  // data-shippo-hero の要素は自動で起動する(手動で mount したいときは data-shippo-hero="manual")
  const autoMount = () => {
    document.querySelectorAll("[data-shippo-hero]").forEach((root) => {
      if (root.getAttribute("data-shippo-hero") === "manual" || root.shippoHero) return;
      root.shippoHero = mount(root);
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMount);
  } else {
    autoMount();
  }
})();
