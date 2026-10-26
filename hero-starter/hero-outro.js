// 動画が途中(SHOW_AT)まで進んだら、ノイズの粒が集まって中央に文字ロゴができ、周りがじんわり浮かぶ。
// スクロールで巻き戻すと消え、もう一度そこまで来ると最初から再生する。

(() => {
  const hero = document.querySelector("[data-shippo-hero]");
  const outro = document.querySelector("[data-hero-outro]");
  if (!hero || !outro) return;

  const header = document.querySelector("[data-header]");
  const canvas = outro.querySelector(".hero-outro__canvas");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const LOGO_TEXT = "Shippo"; // 文字ロゴ(仮)
  const LOGO_FONT = '500 {size}px "Cormorant Garamond", "Times New Roman", serif';
  // 動画の進み具合(0〜1)。カメラが回り込んでいる途中から集まり始めると、止まる頃に組み上がる
  const SHOW_AT = 0.5; // この進み具合まで来たら再生する
  const HIDE_BELOW = 0.45; // ここより戻したら消す
  const SAMPLE_STEP = 2.5; // 粒の間隔(px)。小さいほど粒が増えて精細になる
  const GATHER = 1.15; // 粒が集まりきるまでの秒数
  const SETTLE = 0.35; // 粒からくっきりした文字に切り替える秒数

  const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
  const easeOutCubic = (t) => 1 - (1 - t) ** 3;
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

  let w = 0;
  let h = 0;
  let dpr = 1;
  let logo = null; // { size, x, y } 文字ロゴを描く位置
  let particles = [];
  let state = "idle"; // idle | playing | done
  let startTime = 0;
  let rafId = null;

  const fontFor = (size) => LOGO_FONT.replace("{size}", size);

  // 文字ロゴの大きさと位置。画面幅に対する比率で決める
  const layoutLogo = () => {
    const targetWidth = w < 768 ? w * 0.74 : Math.min(w * 0.33, 760);
    ctx.font = fontFor(100);
    const widthAt100 = ctx.measureText(LOGO_TEXT).width || 1;
    const size = Math.round((targetWidth / widthAt100) * 100);
    return { size, x: w / 2, y: h * 0.5 };
  };

  // 文字ロゴを裏の canvas に描き、塗られた位置を粒の行き先にする
  const sampleTargets = () => {
    const off = document.createElement("canvas");
    off.width = Math.ceil(w);
    off.height = Math.ceil(h);
    const octx = off.getContext("2d");
    octx.font = fontFor(logo.size);
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillStyle = "#fff";
    octx.fillText(LOGO_TEXT, logo.x, logo.y);

    const { data } = octx.getImageData(0, 0, off.width, off.height);
    const targets = [];
    for (let y = 0; y < off.height; y += SAMPLE_STEP) {
      for (let x = 0; x < off.width; x += SAMPLE_STEP) {
        const i = (Math.floor(y) * off.width + Math.floor(x)) * 4 + 3;
        if (data[i] > 128) targets.push([x, y]);
      }
    }
    return targets;
  };

  const buildParticles = () => {
    particles = sampleTargets().map(([tx, ty]) => ({
      tx,
      ty,
      // 最初は画面全体に散らばったノイズ
      sx: Math.random() * w,
      sy: Math.random() * h,
      delay: Math.random() * 0.3,
      dur: 0.6 + Math.random() * 0.25,
      size: 0.8 + Math.random() * 1.4,
      alpha: 0.55 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      // 明るい雪景色の上でも砂嵐に見えるよう、半分は暗い粒にする(着く頃には消える)
      dark: Math.random() < 0.5,
    }));
  };

  const drawLogo = (alpha) => {
    ctx.globalAlpha = alpha;
    ctx.font = fontFor(logo.size);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText(LOGO_TEXT, logo.x, logo.y);
    ctx.globalAlpha = 1;
  };

  const frame = (now) => {
    const t = (now - startTime) / 1000;
    ctx.clearRect(0, 0, w, h);

    // 最後の粒が着くまで(GATHER)は粒だけ。その後 SETTLE 秒で文字に溶かす
    const settle = clamp01((t - GATHER) / SETTLE);
    const particleAlpha = 1 - easeInOutCubic(settle);

    if (particleAlpha > 0) {
      // 暗い粒と白い粒を色ごとにまとめて描く(fillStyle の切り替えを減らす)
      for (const dark of [true, false]) {
        ctx.fillStyle = dark ? "#1b241f" : "#fff";
        for (const p of particles) {
          if (p.dark !== dark) continue;
          const local = clamp01((t - p.delay) / p.dur);
          const e = easeOutCubic(local);
          // 着くまではざわざわと揺れ、近づくほど静まる
          const jitter = (1 - e) ** 2 * 26;
          const x = p.sx + (p.tx - p.sx) * e + Math.sin(t * 9 + p.phase) * jitter;
          const y = p.sy + (p.ty - p.sy) * e + Math.cos(t * 7.3 + p.phase) * jitter;
          // 飛んでいる間はテレビの砂嵐のように明滅させる
          const flicker = local < 1 ? 0.35 + Math.random() * 0.65 : 1;
          const presence = dark ? (1 - e) * 0.8 : 0.25 + 0.75 * e;
          ctx.globalAlpha = p.alpha * flicker * particleAlpha * presence;
          ctx.fillRect(x, y, p.size, p.size);
        }
      }
      ctx.globalAlpha = 1;
    }

    if (settle > 0) drawLogo(easeInOutCubic(settle));

    if (settle < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      rafId = null;
      state = "done";
      outro.classList.add("is-logo-done");
    }
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    logo = layoutLogo();
    // 再生後に画面サイズが変わったら、完成形をそのまま描き直す
    if (state === "done") {
      ctx.clearRect(0, 0, w, h);
      drawLogo(1);
    } else if (state === "playing") {
      buildParticles();
    }
  };

  const play = async () => {
    state = "playing";
    outro.classList.add("is-active");
    if (header) header.classList.add("is-revealed");
    // フォントが読めていないと別の書体の形に集まってしまう
    await document.fonts.load(fontFor(logo.size)).catch(() => {});
    if (state !== "playing") return;
    logo = layoutLogo();

    if (reduceMotion) {
      ctx.clearRect(0, 0, w, h);
      drawLogo(1);
      state = "done";
      outro.classList.add("is-logo-done");
      return;
    }
    buildParticles();
    startTime = performance.now();
    rafId = requestAnimationFrame(frame);
  };

  const reset = () => {
    state = "idle";
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    ctx.clearRect(0, 0, w, h);
    outro.classList.remove("is-active", "is-logo-done");
    if (header) header.classList.remove("is-revealed");
  };

  hero.addEventListener("shippo-hero:progress", (event) => {
    const { progress } = event.detail;
    if (state === "idle" && progress >= SHOW_AT) play();
    else if (state !== "idle" && progress < HIDE_BELOW) reset();
  });

  window.addEventListener("resize", resize);
  resize();
})();
