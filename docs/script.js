document.addEventListener("DOMContentLoaded", () => {
  const currentYearEl = document.getElementById("currentYear");
  if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

  const nav = document.getElementById("navbar");
  const backToTopBtn = document.getElementById("backToTop");
  const navLinks = document.querySelectorAll(".nav-link");
  const hamburger = document.getElementById("hamburger");
  const navLinksContainer = document.getElementById("navLinks");
  const sections = document.querySelectorAll("section");

  const handleScroll = () => {
    const scrollY = window.scrollY;
    nav?.classList.toggle("scrolled", scrollY > 20);
    backToTopBtn?.classList.toggle("active", scrollY > 560);

    let current = "";
    const navHeight = nav?.offsetHeight ?? 0;

    sections.forEach((section) => {
      if (scrollY >= section.offsetTop - navHeight - 96) {
        current = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const navHeight = nav?.offsetHeight ?? 0;
      window.scrollTo({
        top: target.offsetTop - navHeight,
        behavior: "smooth",
      });

      navLinksContainer?.classList.remove("active");
      hamburger?.classList.remove("active");
      hamburger?.setAttribute("aria-expanded", "false");
    });
  });

  hamburger?.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("active");
    navLinksContainer?.classList.toggle("active", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const projectFilters = document.querySelector("#projects .project-filters");
  const filterButtons = projectFilters?.querySelectorAll(".filter-btn") ?? [];
  const projectPanels = document.querySelectorAll("#projects .project-panel");

  const applyProjectFilter = (filter) => {
    projectPanels.forEach((panel) => {
      const isMatch = panel.dataset.category === filter;
      panel.hidden = !isMatch;
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter ?? "featured";
      filterButtons.forEach((candidate) => {
        const isActive = candidate === button;
        candidate.classList.toggle("active", isActive);
        candidate.setAttribute("aria-selected", String(isActive));
        candidate.tabIndex = isActive ? 0 : -1;
      });
      applyProjectFilter(filter);
    });
  });

  projectFilters?.addEventListener("keydown", (event) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;

    event.preventDefault();
    const buttons = Array.from(filterButtons);
    const currentIndex = buttons.indexOf(document.activeElement);
    const nextIndex =
      event.key === "Home" ? 0 :
      event.key === "End" ? buttons.length - 1 :
      (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;

    buttons[nextIndex]?.focus();
    buttons[nextIndex]?.click();
  });

  applyProjectFilter("ai");
});
