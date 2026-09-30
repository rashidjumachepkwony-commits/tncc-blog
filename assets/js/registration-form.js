/* Printable registration form controls. Replaces the inline onclick handler
   so the strict Content-Security-Policy does not block it. */
document.addEventListener('DOMContentLoaded', () => {
  const printButton = document.getElementById('printRegistrationFormBtn');
  if (printButton) printButton.addEventListener('click', () => window.print());
});
