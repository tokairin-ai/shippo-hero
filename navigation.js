const MENU_TRANSLATIONS = {
  About: "私たちについて",
  Products: "プロダクト",
  News: "日々の便り",
  FAQ: "よくある質問",
  Stores: "取り扱い店舗",
  Contact: "お問い合わせ",
};

const initializeMenuRollovers = () => {
  const menuLinks = document.querySelectorAll(
    ".site-header__nav a, .site-footer__nav a"
  );

  menuLinks.forEach((link) => {
    const englishLabel = link.textContent.trim();
    const japaneseLabel = MENU_TRANSLATIONS[englishLabel];

    if (!japaneseLabel || link.classList.contains("menu-rollover")) {
      return;
    }

    const englishSpan = document.createElement("span");
    const japaneseSpan = document.createElement("span");

    englishSpan.className = "menu-rollover__label menu-rollover__label--en";
    japaneseSpan.className = "menu-rollover__label menu-rollover__label--ja";
    englishSpan.textContent = englishLabel;
    japaneseSpan.textContent = japaneseLabel;
    japaneseSpan.setAttribute("aria-hidden", "true");

    link.classList.add("menu-rollover");
    link.setAttribute("aria-label", `${englishLabel} / ${japaneseLabel}`);
    link.replaceChildren(englishSpan, japaneseSpan);
  });
};

initializeMenuRollovers();
