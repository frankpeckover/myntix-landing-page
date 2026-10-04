(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealItems = document.querySelectorAll(
    ".community-grid article, .feature-row, .section-copy, .illustration-shot, .faq-grid article, .walkthrough-form"
  );
  var ledgerPrintItems = document.querySelectorAll(".ledger-print");
  var ledgers = document.querySelectorAll(".visual-ledger[data-progress]");
  var featureHeadings = document.querySelectorAll(".feature-copy h3");

  featureHeadings.forEach(function (heading) {
    if (heading.querySelector(".written-heading-text")) {
      return;
    }

    var text = heading.textContent.trim();
    var ghost = document.createElement("span");
    var live = document.createElement("span");
    var typedText = document.createElement("span");
    var cursor = document.createElement("span");

    heading.dataset.writtenText = text;
    heading.setAttribute("aria-label", text);

    ghost.className = "written-heading-ghost";
    ghost.setAttribute("aria-hidden", "true");
    ghost.textContent = text;

    live.className = "written-heading-live";
    live.setAttribute("aria-hidden", "true");

    typedText.className = "written-heading-text";
    typedText.textContent = reduceMotion ? text : "";

    cursor.className = "written-heading-cursor";
    cursor.setAttribute("aria-hidden", "true");

    live.appendChild(typedText);
    live.appendChild(cursor);

    heading.textContent = "";
    heading.appendChild(ghost);
    heading.appendChild(live);
  });

  function writeFeatureHeading(row) {
    var heading = row.querySelector(".feature-copy h3");
    var textElement = heading ? heading.querySelector(".written-heading-text") : null;

    if (!heading || !textElement || heading.dataset.written === "true") {
      return;
    }

    heading.dataset.written = "true";

    if (reduceMotion) {
      textElement.textContent = heading.dataset.writtenText || "";
      return;
    }

    var text = heading.dataset.writtenText || "";
    var character = 0;
    var lastTime = null;
    var speed = 24;

    function tick(timestamp) {
      if (!lastTime) {
        lastTime = timestamp;
      }

      if (timestamp - lastTime >= speed) {
        character += 1;
        textElement.textContent = text.slice(0, character);
        lastTime = timestamp;
      }

      if (character < text.length) {
        window.requestAnimationFrame(tick);
      } else {
        heading.classList.add("is-written");
      }
    }

    window.requestAnimationFrame(tick);
  }

  function formatBalance(value, suffix) {
    return Math.round(value).toLocaleString() + suffix;
  }

  function animateLedger(ledger) {
    if (ledger.dataset.animated === "true") {
      return;
    }

    ledger.dataset.animated = "true";

    var balance = ledger.querySelector("[data-count-target]");
    var target = balance ? Number(balance.dataset.countTarget || 0) : 0;
    var suffix = balance ? balance.dataset.countSuffix || "" : "";
    var progressValue = Number(ledger.dataset.progress || 0);
    var progressBar = ledger.querySelector(".visual-progress span");

    ledger.style.setProperty("--progress-value", Math.max(0, Math.min(progressValue, 100)) + "%");

    if (reduceMotion) {
      if (balance) {
        balance.textContent = formatBalance(target, suffix);
      }
      ledger.classList.add("is-animated");
      return;
    }

    if (!balance) {
      ledger.classList.add("is-animated");
      return;
    }

    var duration = 2800;
    var pause = 1900;

    function playCycle() {
      var startTime = null;

      balance.textContent = formatBalance(0, suffix);
      ledger.classList.remove("is-animated");
      if (progressBar) {
        progressBar.style.transition = "none";
        progressBar.getBoundingClientRect();
        progressBar.style.transition = "";
      }

      window.requestAnimationFrame(function () {
        ledger.classList.add("is-animated");
        window.requestAnimationFrame(tick);
      });

      function tick(timestamp) {
        if (!startTime) {
          startTime = timestamp;
        }

        var elapsed = timestamp - startTime;
        var progressRatio = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progressRatio, 3);

        balance.textContent = formatBalance(target * eased, suffix);

        if (progressRatio < 1) {
          window.requestAnimationFrame(tick);
        } else {
          balance.textContent = formatBalance(target, suffix);
          window.setTimeout(playCycle, pause);
        }
      }
    }

    playCycle();
  }

  revealItems.forEach(function (item, index) {
    item.classList.add("reveal");
    item.style.setProperty("--reveal-delay", Math.min(index % 6, 5) * 80 + "ms");
  });

  ledgerPrintItems.forEach(function (item) {
    item.classList.add("reveal");
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
      if (item.classList.contains("feature-row")) {
        writeFeatureHeading(item);
      }
    });
    ledgerPrintItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
    ledgers.forEach(animateLedger);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (entry.target.classList.contains("feature-row")) {
            writeFeatureHeading(entry.target);
          }
          entry.target.querySelectorAll(".visual-ledger[data-progress]").forEach(animateLedger);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -18% 0px",
      threshold: 0.22
    }
  );

  revealItems.forEach(function (item) {
    observer.observe(item);
  });

  var ledgerObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          ledgerObserver.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.7
    }
  );

  ledgerPrintItems.forEach(function (item) {
    ledgerObserver.observe(item);
  });
})();
