const form = document.querySelector("#forgot-password-form");
const emailInput = document.querySelector("#email");
const message = document.querySelector("#form-message");
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  message.dataset.state = "";

  if (!emailInput.value.trim()) {
    message.textContent = "Enter your email address.";
    emailInput.focus();
    return;
  }

  if (!emailInput.checkValidity()) {
    message.textContent = "Enter a valid email address.";
    emailInput.focus();
    return;
  }

  submitButton.disabled = true;

  try {
    const response = await fetch("/api/password-reset-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailInput.value.trim() })
    });

    const result = await response.json();
    if (!response.ok) {
      message.textContent = result.message || "Your request could not be recorded. Please try again.";
      return;
    }

    message.dataset.state = "success";
    message.textContent = result.message;
    form.reset();
  } catch (error) {
    console.error("Password reset request failed:", error);
    message.textContent = "Could not reach the service. Make sure the Java backend is running and try again.";
  } finally {
    submitButton.disabled = false;
  }
});
