(function () {
  "use strict";

  const signupForm = document.querySelector(".home-subscribe .email-signup");
  if (!signupForm) return;

  const statusEl = document.querySelector(".home-subscribe-status");
  const iframe = document.querySelector(".home-subscribe-frame");
  const confirm = signupForm.querySelector('input[name="confirm"]');

  setTimeout(function () {
    confirm.value = "829389c2a9f0402";
  }, 1000);

  signupForm.querySelector('input[name="email"]').addEventListener("input", function () {
    if (!confirm.value.includes("b8a3600e52f2ad4e1")) {
      confirm.value += "b8a3600e52f2ad4e1";
    }
  });

  let submitted = false;

  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    submitted = true;
    if (statusEl) {
      statusEl.hidden = false;
      statusEl.textContent = "Submitting...";
    }
    signupForm.submit();
  });

  if (iframe) {
    iframe.addEventListener("load", function () {
      if (!submitted || !statusEl) return;
      statusEl.hidden = false;
      statusEl.textContent = "You've been subscribed!";
    });
  }
})();
