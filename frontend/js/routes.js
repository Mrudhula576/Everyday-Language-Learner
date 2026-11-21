// Every page in the app (numbers match wireframes.drawio).
//
// layout:
//   'public' -> top bar with Log in / Sign up (not logged in)
//   'app'    -> sidebar on laptops, bottom menu on phones (logged in)
//   'focus'  -> no menus, just an Exit link (onboarding, lessons, games)
//
// issue: the GitHub issue that builds the real page. Until then a placeholder
// page shows the title and links to the next pages in the flow.
// exit: where the Exit link goes in focus layout (null = no Exit link).
// sections: top-bar links (laptop only) that scroll to a section of the same page.

export const ROUTES = [
  { page: 1, path: '/', title: 'pageLanding', layout: 'public', issue: 3, next: ['/signup', '/login'],
    sections: [{ id: 'how', label: 'navHowItWorks' }, { id: 'accents', label: 'navAccents' }] },
  { page: 2, path: '/signup', title: 'pageSignup', layout: 'public', issue: 4, next: ['/level-check', '/login'] },
  { page: 8, path: '/login', title: 'pageLogin', layout: 'public', issue: 5, next: ['/home', '/forgot-password', '/signup'] },
  { page: 9, path: '/forgot-password', title: 'pageForgot', layout: 'public', issue: 5, next: ['/login'] },
  { page: 9, path: '/reset-password', title: 'pageReset', layout: 'public', issue: 5, next: ['/login'] },

  { page: 3, path: '/level-check', title: 'pageLevel', layout: 'focus', exit: null, issue: 6, next: ['/plan'] },
  { page: 4, path: '/plan', title: 'pagePlan', layout: 'focus', exit: null, issue: 6, next: ['/home'] },

  { page: 5, path: '/home', title: 'pageHome', layout: 'app', nav: 'home', issue: 7,
    next: ['/lessons', '/games/kite', '/games/bridge'] },
  { page: 10, path: '/lessons', title: 'pageLessons', layout: 'app', nav: 'lessons', issue: 10,
    next: ['/lessons/3/oral', '/lessons/3/read'] },
  { page: 6, path: '/progress', title: 'pageProgress', layout: 'app', nav: 'progress', issue: 19, next: ['/home'] },
  { page: 7, path: '/settings', title: 'pageSettings', layout: 'app', nav: 'settings', issue: 20, next: ['/home'] },

  { page: 11, path: '/lessons/:id/oral', title: 'pageLearnOral', layout: 'focus', exit: '/lessons', issue: 12,
    next: ['/lessons/:id/done'] },
  { page: 12, path: '/lessons/:id/read', title: 'pageLearnRead', layout: 'focus', exit: '/lessons', issue: 14,
    next: ['/lessons/:id/done'] },
  { page: 13, path: '/lessons/:id/done', title: 'pageLessonDone', layout: 'focus', exit: '/home', issue: 15,
    next: ['/games/kite', '/games/bridge', '/lessons', '/home'] },

  { page: 15, path: '/games/kite', title: 'pageKite', layout: 'focus', exit: '/home', issue: 17, next: ['/games/result'] },
  { page: 16, path: '/games/bridge', title: 'pageBridge', layout: 'focus', exit: '/home', issue: 16, next: ['/games/result'] },
  { page: 17, path: '/games/result', title: 'pageResult', layout: 'focus', exit: '/home', issue: 18,
    next: ['/games/bridge', '/home'] },
];

export const NOT_FOUND = { path: '*', title: 'pageNotFound', layout: 'public', next: ['/'] };

// Logged-in menu, in order. Same items in the sidebar and the bottom menu.
export const NAV = [
  { id: 'home', path: '/home', label: 'navHome', icon: '🏠' },
  { id: 'lessons', path: '/lessons', label: 'navLessons', icon: '📚' },
  { id: 'progress', path: '/progress', label: 'navProgress', icon: '📈' },
  { id: 'settings', path: '/settings', label: 'navSettings', icon: '⚙️' },
];
