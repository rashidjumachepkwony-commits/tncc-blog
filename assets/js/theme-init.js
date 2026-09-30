(function() {
  try {
    if (localStorage.getItem('tncc-theme') === 'dark') {
      document.body.classList.add('dark');
    }
  } catch (e) {
    /* localStorage may be unavailable in private mode */
  }
})();
