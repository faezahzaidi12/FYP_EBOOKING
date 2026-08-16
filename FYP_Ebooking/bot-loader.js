(function () {
  // Automatically detect if we are in a subfolder (like USER_PAGE or ADMIN_PAGE)
  const isSubfolder = window.location.pathname.includes('/USER_PAGE/') || window.location.pathname.includes('/ADMIN_PAGE/');
  const prefix = isSubfolder ? '../' : './';

  // Array of scripts to load globally
  const scriptsToLoad = [
    prefix + 'supabase-config.js',
    prefix + 'faq-chatbot.js'
  ];

  scriptsToLoad.forEach(function (src) {
    const script = document.createElement('script');
    script.src = src;
    script.async = false; // Keep execution order
    document.body.appendChild(script);
  });
})();