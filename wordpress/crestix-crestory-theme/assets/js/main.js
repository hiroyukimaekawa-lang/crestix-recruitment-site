(() => {
  const hamburger = document.getElementById("cx-hamburger");
  const drawer = document.getElementById("cx-drawer");

  if (hamburger && drawer) {
    hamburger.addEventListener("click", () => {
      const open = drawer.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        drawer.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  const feedTabs = document.querySelectorAll("#cx-tabs [data-feed]");
  feedTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      feedTabs.forEach((item) => item.classList.remove("is-active"));
      tab.classList.add("is-active");
    });
  });

  const floatingCasualCta = document.querySelector(".crestory-floating-casual-cta");
  if (floatingCasualCta) {
    const toggleFloatingCta = () => {
      document.body.classList.toggle("crestory-has-scrolled", window.scrollY > 120);
    };

    toggleFloatingCta();
    window.addEventListener("scroll", toggleFloatingCta, { passive: true });
  }
})();
