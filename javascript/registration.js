const registrationForm = document.querySelector("#registration-form");

registrationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const requiredFields = [...registrationForm.querySelectorAll("[required]")];
  const missingField = requiredFields.find((field) => !field.value.trim());

  if (missingField) {
    const label = registrationForm.querySelector(`label[for="${missingField.id}"]`).textContent;
    alert(`Please enter your ${label.toLowerCase()}.`);
    missingField.focus();
    return;
  }

  const invalidField = requiredFields.find((field) => !field.checkValidity());
  if (invalidField) {
    alert(`Please enter a valid ${invalidField.labels[0].textContent.toLowerCase()}.`);
    invalidField.focus();
    return;
  }

  const registration = Object.fromEntries(new FormData(registrationForm));
  const submitButton = registrationForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registration)
    });
    const result = await response.json();

    if (!response.ok) {
      const validationDetails = result.fieldErrors
        ? Object.entries(result.fieldErrors).map(([field, reason]) => `${field}: ${reason}`).join("\n")
        : "";
      const errorMessage = [result.message, validationDetails].filter(Boolean).join("\n");
      alert(errorMessage || "Registration could not be completed. Please check your details and try again.");
      return;
    }

    alert("Registration submitted successfully.");
    registrationForm.reset();
    window.location.href = "index.html";
  } catch (error) {
    console.error("Registration request failed:", error);
    alert("Could not reach the registration service. Make sure the Java backend is running and try again.");
  } finally {
    submitButton.disabled = false;
  }
});
