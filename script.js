gsap.registerPlugin(ScrollTrigger);

const header = document.querySelector("[data-header]");
const drawer = document.querySelector("[data-drawer]");
const menuOpenButton = document.querySelector("[data-menu-open]");
const drawerLinks = drawer.querySelectorAll("a");

const heroTrack = document.querySelector("[data-scrub-track]");

// トップはヒーローを抜けてから白背景にする。ヒーローが無いページは従来どおり
const updateHeader = () => {
  const threshold = heroTrack
    ? heroTrack.offsetHeight - window.innerHeight * 0.5
    : 24;
  header.classList.toggle("site-header--scrolled", window.scrollY > threshold);
};

const openDrawer = () => {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  document.documentElement.style.setProperty(
    "--scrollbar-compensation",
    `${scrollbarWidth}px`
  );
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  menuOpenButton.setAttribute("aria-expanded", "true");
  menuOpenButton.setAttribute("aria-label", "メニューを閉じる");
  document.body.classList.add("menu-open");
};

const closeDrawer = (shouldRestoreFocus = true) => {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  menuOpenButton.setAttribute("aria-expanded", "false");
  menuOpenButton.setAttribute("aria-label", "メニューを開く");
  document.body.classList.remove("menu-open");
  document.documentElement.style.setProperty(
    "--scrollbar-compensation",
    "0px"
  );

  if (shouldRestoreFocus) {
    menuOpenButton.focus();
  }
};

const toggleDrawer = () => {
  if (drawer.classList.contains("is-open")) {
    closeDrawer();
  } else {
    openDrawer();
  }
};

const handleDrawerKeydown = (event) => {
  if (!drawer.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closeDrawer();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusableElements = [
    menuOpenButton,
    ...drawer.querySelectorAll("a"),
  ];
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
};

menuOpenButton.addEventListener("click", toggleDrawer);
drawerLinks.forEach((link) => {
  link.addEventListener("click", () => closeDrawer(false));
});
document.addEventListener("keydown", handleDrawerKeydown);
window.addEventListener("scroll", updateHeader, {
  passive: true,
});
updateHeader();

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!prefersReducedMotion) {
  // 家の写真のヒーローは削除したため、その導入アニメーションも撤去した。
  // ヘッダーの出現は hero.css の --p-head が担当する(GSAPが触るとinline styleで固定されてしまう)

  const initializeScrollReveals = () => {
    gsap.utils.toArray(".reveal-blur").forEach((element) => {
      const headingParts = element.querySelectorAll(
        ".section-heading__label, h2"
      );

      gsap.to(headingParts, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        stagger: 0.12,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 92%",
          once: true,
        },
      });
    });

    gsap.utils.toArray(".reveal-text-group").forEach((element) => {
      gsap.to(element.children, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 92%",
          once: true,
        },
      });
    });

    const revealItems = gsap.utils.toArray(
      ".news-item.reveal-group, .faq-item.reveal-group"
    );

    revealItems.forEach((element) => {
      gsap.to(element, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 92%",
          once: true,
        },
      });
    });

    gsap.utils.toArray(".reveal-soft").forEach((element, index) => {
      gsap.from(element, {
        y: 18,
        opacity: 0,
        duration: 0.75,
        delay: (index % 3) * 0.04,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 92%",
          once: true,
        },
      });
    });
  };

  const aboutScenes = gsap.utils.toArray(".about-scene");
  gsap.set(aboutScenes, {
    autoAlpha: 0,
  });

  const aboutTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".about",
      start: "top top",
      end: "+=3400",
      pin: ".about__stage",
      scrub: 0.65,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  aboutScenes.forEach((scene, index) => {
    const number = scene.querySelector(".about-scene__number");
    const image = scene.querySelector(".about-scene__image");
    const text = scene.querySelector(".about-scene__text");
    const textParts = text.querySelectorAll(
      ".section-heading__label, h2, p:last-child"
    );
    const fromLeft = index % 2 === 0;
    const isFirstScene = index === 0;
    const numberStartX = fromLeft
      ? isFirstScene ? "-6vw" : "-12vw"
      : isFirstScene ? "6vw" : "12vw";
    const imageStartX = fromLeft
      ? isFirstScene ? "-4vw" : "-8vw"
      : isFirstScene ? "4vw" : "8vw";
    const textStartX = fromLeft
      ? isFirstScene ? "4vw" : "8vw"
      : isFirstScene ? "-4vw" : "-8vw";

    aboutTimeline.set(scene, {
      autoAlpha: 1,
    });

    aboutTimeline.fromTo(
      number,
      {
        x: numberStartX,
        opacity: isFirstScene ? 0 : 0,
      },
      {
        x: 0,
        opacity: 0.12,
        duration: isFirstScene ? 0.62 : 1,
        ease: "none",
      }
    );

    aboutTimeline.fromTo(
      image,
      {
        x: imageStartX,
        scale: 1,
        opacity: isFirstScene ? 0 : 0,
      },
      {
        x: 0,
        scale: 1.04,
        opacity: 1,
        duration: isFirstScene ? 0.82 : 1.2,
        ease: "none",
      },
      isFirstScene ? "<+0.04" : "<+0.16"
    );

    aboutTimeline.fromTo(
      text,
      {
        x: textStartX,
      },
      {
        x: 0,
        duration: isFirstScene ? 0.68 : 0.9,
        ease: "none",
      },
      isFirstScene ? "<+0.08" : "<+0.18"
    );

    aboutTimeline.fromTo(
      textParts,
      {
        y: 16,
        opacity: 0,
        filter: "blur(12px)",
      },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        stagger: 0.08,
        duration: isFirstScene ? 0.52 : 0.68,
        ease: "none",
      },
      "<"
    );

    aboutTimeline.to({}, {
      duration: 0.45,
    });

    if (index < aboutScenes.length - 1) {
      aboutTimeline.to(number, {
        x: fromLeft ? "-16vw" : "16vw",
        opacity: 0,
        duration: 0.9,
        ease: "none",
      });

      aboutTimeline.to(
        image,
        {
          x: fromLeft ? "-12vw" : "12vw",
          scale: 1.055,
          opacity: 0,
          duration: 1.1,
          ease: "none",
        },
        "<+0.12"
      );

      aboutTimeline.to(
        text,
        {
          x: fromLeft ? "12vw" : "-12vw",
          opacity: 0,
          filter: "blur(10px)",
          duration: 0.9,
          ease: "none",
        },
        "<+0.14"
      );

      aboutTimeline.set(scene, {
        autoAlpha: 0,
      });
    }
  });

  const productCards = gsap.utils.toArray(".product-card");
  const productsMotion = gsap.matchMedia();

  productsMotion.add("(min-width: 834px)", () => {
    const productsTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".products",
        start: "top top",
        end: "+=2200",
        pin: ".products__stage",
        scrub: 0.75,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    gsap.set(productCards, {
      y: "16vh",
      scale: 0.965,
      opacity: 0,
      filter: "blur(10px)",
    });

    gsap.set(".products__guide-line", {
      scaleX: 0,
    });

    productsTimeline
      .to({}, { duration: 0.55 })
      .to(productCards[0], {
        y: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power2.out",
      })
      .to({}, { duration: 0.28 })
      .to(productCards[1], {
        y: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power2.out",
      })
      .to({}, { duration: 0.28 })
      .to(productCards[2], {
        y: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power2.out",
      })
      .to(".product-card__media img", {
        scale: 1.025,
        stagger: 0.08,
        duration: 0.7,
        ease: "none",
      })
      .to({}, { duration: 0.75 });

    productsTimeline.to(".products__guide-line", {
      scaleX: 1,
      duration: productsTimeline.duration(),
      ease: "none",
    }, 0);
  });

  productsMotion.add("(max-width: 833px)", () => {
    const mobileProductsTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".products",
        start: "top top",
        end: "+=2400",
        pin: ".products__stage",
        scrub: 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    gsap.set(productCards, {
      y: "12vh",
      scale: 0.97,
      autoAlpha: 0,
      filter: "blur(9px)",
    });

    gsap.set(".products__guide-line", {
      scaleX: 0,
    });

    mobileProductsTimeline
      .to({}, { duration: 0.5 })
      .to(productCards[0], {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.85,
        ease: "power2.out",
      })
      .to({}, { duration: 0.5 })
      .to(productCards[0], {
        y: "-5vh",
        scale: 0.985,
        autoAlpha: 0,
        filter: "blur(5px)",
        duration: 0.55,
        ease: "power2.in",
      })
      .to(productCards[1], {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.85,
        ease: "power2.out",
      }, "<0.2")
      .to({}, { duration: 0.5 })
      .to(productCards[1], {
        y: "-5vh",
        scale: 0.985,
        autoAlpha: 0,
        filter: "blur(5px)",
        duration: 0.55,
        ease: "power2.in",
      })
      .to(productCards[2], {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.85,
        ease: "power2.out",
      }, "<0.2")
      .to({}, { duration: 0.9 });

    mobileProductsTimeline.to(".products__guide-line", {
      scaleX: 1,
      duration: mobileProductsTimeline.duration(),
      ease: "none",
    }, 0);
  });

  gsap.fromTo(
    ".contact__media",
    {
      yPercent: -7,
    },
    {
      yPercent: 7,
      ease: "none",
      scrollTrigger: {
        trigger: ".contact",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    }
  );

  gsap.from(".site-footer__top > *, .site-footer__bottom", {
    y: 16,
    opacity: 0,
    stagger: 0.08,
    duration: 0.7,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".site-footer",
      start: "top 88%",
      once: true,
    },
  });

  const activateScrollReveals = () => {
    ScrollTrigger.refresh();
    initializeScrollReveals();
  };

  if (document.readyState === "complete") {
    requestAnimationFrame(activateScrollReveals);
  } else {
    window.addEventListener("load", activateScrollReveals, {
      once: true,
    });
  }
}
