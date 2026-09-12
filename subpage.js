const header = document.querySelector("[data-header]");
const drawer = document.querySelector("[data-drawer]");
const menuButton = document.querySelector("[data-menu-open]");

const updateHeader = () => {
  header?.classList.toggle("site-header--scrolled", window.scrollY > 16);
};

const closeDrawer = (shouldFocus = false) => {
  if (!drawer || !menuButton) return;

  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "メニューを開く");
  document.body.classList.remove("menu-open");

  if (shouldFocus) menuButton.focus();
};

const toggleDrawer = () => {
  if (!drawer || !menuButton) return;

  const isOpen = drawer.classList.toggle("is-open");
  drawer.setAttribute("aria-hidden", String(!isOpen));
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
  document.body.classList.toggle("menu-open", isOpen);
};

menuButton?.addEventListener("click", toggleDrawer);
drawer?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => closeDrawer());
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && drawer?.classList.contains("is-open")) {
    closeDrawer(true);
  }
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  formStatus?.classList.add("is-visible");
  formStatus?.focus();
  contactForm.reset();
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && window.gsap) {
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTimeline
    .from(".site-header", { y: -18, opacity: 0, duration: 0.75 })
    .from(".subpage-hero__media", { scale: 1.1, opacity: 0, filter: "blur(10px)", duration: 1.5 }, 0)
    .from(".subpage-hero__title span", { y: 24, opacity: 0, filter: "blur(10px)", stagger: 0.1, duration: 0.9 }, 0.35)
    .from(".subpage-hero__index", { opacity: 0, duration: 0.7 }, 0.85);

  gsap.to(".subpage-hero__media img", {
    yPercent: 8,
    ease: "none",
    scrollTrigger: {
      trigger: ".subpage-hero",
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });

  gsap.utils.toArray("[data-reveal]").forEach((element) => {
    gsap.from(element, {
      y: 34,
      opacity: 0,
      filter: "blur(8px)",
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 90%",
        once: true,
      },
    });
  });
}
