(function () {
  const header = document.querySelector(".site-header");
  const threshold = 28;
  const controller = new AbortController();
  let ticking = false;

  if (!header) {
    return;
  }

  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > threshold);
  }

  function requestHeaderUpdate() {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(function () {
      updateHeader();
      ticking = false;
    });
  }

  updateHeader();
  window.addEventListener("scroll", requestHeaderUpdate, {
    passive: true,
    signal: controller.signal
  });
  window.addEventListener("pagehide", function () {
    controller.abort();
  }, { once: true });
})();
