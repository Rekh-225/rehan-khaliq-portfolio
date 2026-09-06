document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  const currentYear = document.getElementById("currentYear");
  const nav = document.getElementById("navbar");
  const navLinksContainer = document.getElementById("navLinks");
  const hamburger = document.getElementById("hamburger");
  const backToTop = document.getElementById("backToTop");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  const closeMenu = (returnFocus = false) => {
    navLinksContainer?.classList.remove("active");
    hamburger?.classList.remove("active");
    hamburger?.setAttribute("aria-expanded", "false");
    hamburger?.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-open");

    if (returnFocus) {
      hamburger?.focus();
    }
  };

  hamburger?.addEventListener("click", () => {
    const isOpen = !navLinksContainer?.classList.contains("active");
    navLinksContainer?.classList.toggle("active", isOpen);
    hamburger.classList.toggle("active", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    document.body.classList.toggle("menu-open", isOpen);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinksContainer?.classList.contains("active")) {
      closeMenu(true);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) {
      closeMenu();
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (link.classList.contains("skip-link")) return;

      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const navHeight = nav?.offsetHeight ?? 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({
        top: targetTop,
        behavior: reducedMotion.matches ? "auto" : "smooth",
      });
      if (window.location.hash !== targetId) {
        window.history.pushState(null, "", targetId);
      }
      closeMenu();
    });
  });

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
  });

  const trackedLinks = Array.from(document.querySelectorAll(".nav-link[data-section-link]"));
  const trackedSections = trackedLinks
    .map((link) => {
      const target = link.getAttribute("href");
      return target ? document.querySelector(target) : null;
    })
    .filter((section) => section instanceof HTMLElement);

  let scrollTicking = false;

  const updateNavigation = () => {
    const scrollY = window.scrollY;
    const navHeight = nav?.offsetHeight ?? 0;
    nav?.classList.toggle("scrolled", scrollY > 16);

    const showBackToTop = scrollY > 560;
    backToTop?.classList.toggle("active", showBackToTop);
    backToTop?.setAttribute("aria-hidden", String(!showBackToTop));
    if (backToTop) backToTop.tabIndex = showBackToTop ? 0 : -1;

    const marker = scrollY + navHeight + Math.min(window.innerHeight * 0.24, 180);
    let currentId = "";

    trackedSections.forEach((section) => {
      const isVisible = !section.hidden && section.offsetParent !== null;
      if (isVisible && marker >= section.offsetTop) {
        currentId = section.id;
      }
    });

    trackedLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("active", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    scrollTicking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateNavigation);
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  const filterToolbar = document.getElementById("projectFilters");
  const filterButtons = Array.from(filterToolbar?.querySelectorAll(".filter-btn") ?? []);
  const projectCards = Array.from(document.querySelectorAll("[data-project-card]"));
  const filterStatus = document.getElementById("filterStatus");
  const featuredWorkGroup = document.getElementById("featuredWorkGroup");
  const featuredGroupHeading = featuredWorkGroup?.querySelector(".group-heading");
  const moreWorkGroup = document.getElementById("moreWorkGroup");
  const featuredGrid = document.getElementById("featuredGrid");
  const moreWorkGrid = document.getElementById("moreWorkGrid");

  const updateGroupVisibility = (group, groupName, grid) => {
    if (!group || !grid) return;
    const visibleCards = projectCards.filter(
      (card) => card.dataset.group === groupName && !card.hidden
    );
    group.hidden = visibleCards.length === 0;
    grid.classList.toggle("single-result", visibleCards.length === 1);
  };

  const applyProjectFilter = (filter, label) => {
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const categories = (card.dataset.categories ?? "").split(/\s+/);
      const isMatch = filter === "all" || categories.includes(filter);
      card.hidden = !isMatch;
      card.setAttribute("aria-hidden", String(!isMatch));
      if (isMatch) visibleCount += 1;
    });

    updateGroupVisibility(featuredWorkGroup, "featured", featuredGrid);
    updateGroupVisibility(moreWorkGroup, "more", moreWorkGrid);

    if (featuredGroupHeading) {
      featuredGroupHeading.hidden = filter !== "featured";
    }

    if (filterStatus) {
      filterStatus.textContent = `${visibleCount} ${visibleCount === 1 ? "project" : "projects"} shown for ${label}.`;
    }
  };

  const activateFilter = (button) => {
    filterButtons.forEach((candidate) => {
      const isActive = candidate === button;
      candidate.classList.toggle("active", isActive);
      candidate.setAttribute("aria-pressed", String(isActive));
      candidate.tabIndex = isActive ? 0 : -1;
    });

    applyProjectFilter(button.dataset.filter ?? "featured", button.textContent.trim());
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => activateFilter(button));
  });

  filterToolbar?.addEventListener("keydown", (event) => {
    const supportedKeys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!supportedKeys.includes(event.key) || filterButtons.length === 0) return;

    event.preventDefault();
    const currentIndex = Math.max(0, filterButtons.indexOf(document.activeElement));
    let nextIndex = currentIndex;

    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = filterButtons.length - 1;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % filterButtons.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + filterButtons.length) % filterButtons.length;

    filterButtons[nextIndex].focus();
    activateFilter(filterButtons[nextIndex]);
  });

  const initialFilter = filterButtons.find((button) => button.getAttribute("aria-pressed") === "true");
  if (initialFilter) {
    activateFilter(initialFilter);
  }

  const alignWithCurrentHash = () => {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    const navHeight = nav?.offsetHeight ?? 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
    const inlineScrollBehaviour = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, targetTop);
    document.documentElement.style.scrollBehavior = inlineScrollBehaviour;
    updateNavigation();
  };

  const queueHashAlignment = () => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(alignWithCurrentHash));
  };

  if (document.readyState === "complete") {
    queueHashAlignment();
  } else {
    window.addEventListener("load", queueHashAlignment, { once: true });
  }

  document.fonts?.ready.then(queueHashAlignment);
  window.addEventListener("popstate", queueHashAlignment);

  updateNavigation();
});
