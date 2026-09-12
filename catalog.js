const filterButtons = document.querySelectorAll("[data-filter]");
const productCards = document.querySelectorAll("[data-category]");
const resultCount = document.querySelector("[data-result-count]");

const updateProductFilter = (selectedCategory) => {
  let visibleCount = 0;

  productCards.forEach((card) => {
    const isVisible = selectedCategory === "all" || card.dataset.category === selectedCategory;
    card.classList.toggle("is-hidden", !isVisible);
    card.setAttribute("aria-hidden", String(!isVisible));
    if (isVisible) visibleCount += 1;
  });

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === selectedCategory;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (resultCount) resultCount.textContent = `${String(visibleCount).padStart(2, "0")} PRODUCTS`;
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => updateProductFilter(button.dataset.filter));
});

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!motionQuery.matches && window.gsap) {
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  gsap.from(".catalog-hero__media, .product-detail-hero__media", {
    opacity: 0,
    scale: 1.04,
    filter: "blur(9px)",
    duration: 1.4,
    ease: "power3.out",
  });

  gsap.utils.toArray("[data-catalog-reveal]").forEach((element) => {
    gsap.from(element, {
      y: 30,
      opacity: 0,
      filter: "blur(7px)",
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 91%",
        once: true,
      },
    });
  });

  gsap.utils.toArray("[data-parallax]").forEach((image) => {
    gsap.fromTo(image, { yPercent: -5 }, {
      yPercent: 5,
      ease: "none",
      scrollTrigger: {
        trigger: image.parentElement,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
  });
}
