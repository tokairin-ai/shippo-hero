// hero-starter の2ページで共通の動き(ヘッダーの切り替えと、文字の浮かび上がり)
const header = document.querySelector("[data-header]");
const hero = document.querySelector("[data-shippo-hero]");

// ヒーローがあるページは、ヒーローを抜けてからヘッダーに背景を付ける。
// ヒーローの無いページは HTML 側で最初から is-solid にしておく
if (hero) {
  const updateHeader = () => {
    header.classList.toggle("is-solid", window.scrollY > hero.offsetHeight - window.innerHeight * 0.5);
  };
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", updateHeader);
  updateHeader();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { rootMargin: "0px 0px -12% 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// data-highlight の文を一語ずつ包み、要素が画面を通り過ぎるのに合わせて先頭から明るくしていく
const highlights = [...document.querySelectorAll("[data-highlight]")].map((el) => {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  const spans = words.map((word, i) => {
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = word;
    el.append(span);
    if (i < words.length - 1) el.append(" ");
    return span;
  });
  return { el, spans };
});

const updateHighlights = () => {
  const vh = window.innerHeight;
  for (const { el, spans } of highlights) {
    const rect = el.getBoundingClientRect();
    // 文の上端が画面の下から 85% の位置に来たら始め、40% の位置で全部明るくなる
    const progress = Math.min(1, Math.max(0, (vh * 0.85 - rect.top) / (vh * 0.45 + rect.height * 0.5)));
    const lit = Math.round(progress * spans.length);
    spans.forEach((span, i) => span.classList.toggle("is-lit", i < lit));
  }
};
if (highlights.length) {
  window.addEventListener("scroll", updateHighlights, { passive: true });
  window.addEventListener("resize", updateHighlights);
  updateHighlights();
}

// 作業風景などの動画は、画面に近づいてから読み込み、見えている間だけ再生する
const lazyVideos = document.querySelectorAll("video[data-src]");
if (lazyVideos.length) {
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target: video, isIntersecting }) => {
        if (isIntersecting) {
          if (!video.src) video.src = video.dataset.src;
          if (!still) video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { rootMargin: "200px 0px" }
  );
  lazyVideos.forEach((video) => videoObserver.observe(video));
}
