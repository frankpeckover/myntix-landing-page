(function () {
  var target = document.querySelector("[data-rotating-text]");
  var words = ["behaviours", "rewards", "progress", "moments"];
  var index = 0;
  var intervalMs = 2400;

  if (!target) {
    return;
  }

  window.setInterval(function () {
    target.classList.add("is-changing");

    window.setTimeout(function () {
      index = (index + 1) % words.length;
      target.textContent = words[index];
      target.classList.remove("is-changing");
    }, 260);
  }, intervalMs);
})();
