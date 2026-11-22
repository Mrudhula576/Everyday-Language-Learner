// Real page modules, keyed by route path. Each issue that builds a page adds
// its module here; any route not listed uses the placeholder.
//
// A page module looks like:
//   export default {
//     render(route, params) { return '<section>…</section>'; },  // HTML string
//     mount(root, params) { … return cleanupFn; },             // optional: events, timers
//   };

import landing from './landing.js';
import signup from './signup.js';

export const PAGES = {
  '/': landing, // issue #3
  '/signup': signup, // issue #4
};
