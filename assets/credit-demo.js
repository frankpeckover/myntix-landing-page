(function () {
  var demo = document.querySelector("[data-credit-demo]");
  if (!demo) return;

  var startingBalance = 8;
  var target = 10;
  var balance = startingBalance;
  var direction = "add";
  var amount = 0;
  var dashboard = demo.querySelector("[data-demo-dashboard]");
  var adjustment = demo.querySelector("[data-demo-adjustment]");
  var open = demo.querySelector("[data-demo-open]");
  var close = demo.querySelector("[data-demo-close]");
  var submit = demo.querySelector("[data-demo-submit]");
  var reset = demo.querySelector("[data-demo-reset]");
  var quickTake = demo.querySelector("[data-demo-quick-take]");
  var reason = demo.querySelector("[data-demo-reason]");
  var customReason = demo.querySelector("[data-demo-custom-reason]");
  var customAmount = demo.querySelector("[data-demo-custom-amount]");
  var balanceOutput = demo.querySelector("[data-demo-balance]");
  var adjustmentBalance = demo.querySelector("[data-demo-adjust-balance]");
  var goalOutput = demo.querySelector("[data-demo-goal-count]");
  var progress = demo.querySelector("[data-demo-progress]");
  var fill = demo.querySelector("[data-demo-fill]");
  var trend = demo.querySelector("[data-demo-trend]");
  var pop = demo.querySelector("[data-demo-pop]");
  var status = demo.querySelector("[data-demo-status]");
  var amountButtons = demo.querySelectorAll("[data-demo-amount]");
  var directionButtons = demo.querySelectorAll("[data-demo-direction]");

  function render() {
    var change = balance - startingBalance;
    balanceOutput.textContent = String(balance);
    adjustmentBalance.textContent = String(balance);
    goalOutput.textContent = balance + " of " + target + " credits";
    progress.setAttribute("aria-valuenow", String(Math.min(balance, target)));
    fill.style.width = Math.min((balance / target) * 100, 100) + "%";
    trend.textContent = change > 0 ? "+" + change : String(change);
    trend.setAttribute("aria-label", (change > 0 ? "Up " : change < 0 ? "Down " : "No change: ") + Math.abs(change) + " credits in this demo");
    trend.dataset.tone = change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
    quickTake.disabled = balance === 0;
    reset.hidden = change === 0;
    submit.disabled = !amount || !(customReason.value.trim() || reason.value) || (direction === "take" && amount > balance);
    submit.textContent = direction === "add" ? "Add credits" : "Take credits";
    submit.dataset.tone = direction;
    directionButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.demoDirection === direction));
    });
    amountButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(Number(button.dataset.demoAmount) === amount));
    });
  }

  function showAdjustment(show) {
    dashboard.hidden = show;
    adjustment.hidden = !show;
    if (show) {
      demo.querySelector("[data-demo-amount='1']").focus();
    } else {
      open.focus();
    }
  }

  function changeBalance(signedAmount, selectedReason) {
    var previousBalance = balance;
    balance = Math.max(0, balance + signedAmount);
    var actualChange = balance - previousBalance;
    render();
    status.textContent = (actualChange >= 0 ? "Added " : "Took ") + Math.abs(actualChange) +
      (Math.abs(actualChange) === 1 ? " credit " : " credits ") +
      (actualChange >= 0 ? "to " : "from ") + "Alex for " + selectedReason + "." +
      (previousBalance < target && balance >= target ? " Savings goal reached." : "");
    pop.textContent = (actualChange > 0 ? "+" : "") + actualChange;
    pop.dataset.tone = actualChange >= 0 ? "add" : "take";
    demo.classList.remove("just-awarded");
    void demo.offsetWidth;
    demo.classList.add("just-awarded");
  }

  demo.querySelector("[data-demo-quick-add]").addEventListener("click", function () {
    changeBalance(1, "Great effort");
  });

  demo.querySelector("[data-demo-quick-take]").addEventListener("click", function () {
    changeBalance(-1, "Class disruption");
  });

  open.addEventListener("click", function () { showAdjustment(true); });
  close.addEventListener("click", function () { showAdjustment(false); });

  directionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      direction = button.dataset.demoDirection;
      render();
    });
  });

  amountButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      amount = Number(button.dataset.demoAmount);
      customAmount.value = String(amount);
      render();
    });
  });

  customAmount.addEventListener("input", function () {
    var enteredAmount = Number(customAmount.value);
    amount = Number.isSafeInteger(enteredAmount) && enteredAmount > 0 && enteredAmount <= 999 ? enteredAmount : 0;
    render();
  });

  reason.addEventListener("change", render);
  customReason.addEventListener("input", render);

  submit.addEventListener("click", function () {
    if (submit.disabled) return;
    var selectedReason = customReason.value.trim() || reason.value;
    showAdjustment(false);
    changeBalance(direction === "add" ? amount : -amount, selectedReason);
  });

  reset.addEventListener("click", function () {
    balance = startingBalance;
    direction = "add";
    amount = 0;
    customAmount.value = "";
    reason.value = "";
    customReason.value = "";
    status.textContent = "Try a quick action or adjust Alex's credits.";
    demo.classList.remove("just-awarded");
    render();
    open.focus();
  });

  render();
})();
