// Single Page Apps for GitHub Pages
// MIT License
// This script checks to see if a redirect is present in the query string,
// converts it back into the correct url and adds it to the browser's history
(function(l) {
  if (l.search[1] === '/' ) {
    var decoded = l.search.slice(1).split('&').map(function(s) { 
      return s.replace(/~and~/g, '&')
    }).join('?');
    window.history.replaceState(null, null,
        l.pathname.slice(0, -1) + decoded + l.hash
    );
  }
  
  // Redirect any non-existent paths to home
  var validPaths = ['/', '/search', '/timeline', '/reminders', '/settings'];
  var currentPath = l.pathname.replace(/\/paperlessplus$|\/paperlessplus\/$/, '/');
  
  if (!validPaths.includes(currentPath) && currentPath !== '/') {
    window.history.replaceState(null, null, l.origin + '/paperlessplus/');
  }
}(window.location))