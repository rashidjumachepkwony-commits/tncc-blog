/* Legacy page redirect (Great Chepsaita Run -> Teso North Cross Country).
   Kept as an external file so the strict Content-Security-Policy is not violated.
   The page also has a <meta http-equiv="refresh"> fallback for no-JS clients. */
(function () {
  var target = document.currentScript && document.currentScript.getAttribute('data-redirect-to');
  if (target) window.location.replace(target);
})();
