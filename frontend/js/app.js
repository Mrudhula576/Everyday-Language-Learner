// Starts the app: draws the right layout for each page (public / app / focus),
// puts the page inside it, and registers the service worker for "Add to Home Screen".

import { bi, esc, onTextModeChange, t } from './i18n.js';
import { addRoute, currentPath, link, match, setNotFound, startRouter } from './router.js';
import { NAV, NOT_FOUND, ROUTES } from './routes.js';
import { PAGES } from './pages/index.js';
import placeholder from './pages/placeholder.js';

const chrome = document.getElementById('chrome');
const main = document.getElementById('main');
let cleanup = null;

function brand() {
  return `<a class="brand" href="${link('/')}">
      <span class="brand-te telugu" lang="te">${esc(t('appName', 'te'))}</span>
      <span class="brand-en">${esc(t('appName'))}</span>
    </a>`;
}

function publicBar() {
  return `<header class="topbar">
      ${brand()}
      <nav class="topbar-actions" aria-label="Account">
        <a class="btn btn-ghost btn-sm" href="${link('/login')}">${esc(t('logIn'))}</a>
        <a class="btn btn-primary btn-sm" href="${link('/signup')}">${esc(t('signUp'))}</a>
      </nav>
    </header>`;
}

function navItems(active) {
  return NAV.map((item) => `
      <a class="nav-item${item.id === active ? ' active' : ''}" href="${link(item.path)}"
         ${item.id === active ? 'aria-current="page"' : ''}>
        <span class="nav-icon" aria-hidden="true">${item.icon}</span>${bi(item.label)}
      </a>`).join('');
}

// Both menus are in the page; CSS shows the sidebar on wide screens and the
// bottom menu on narrow ones.
function appChrome(active) {
  return `<aside class="sidebar">
      ${brand()}
      <nav class="sidebar-nav" aria-label="Main">${navItems(active)}</nav>
    </aside>
    <nav class="bottom-nav" aria-label="Main">${navItems(active)}</nav>`;
}

function focusBar(route) {
  return `<header class="focusbar">
      ${route.exit ? `<a class="exit-link" href="${link(route.exit)}">✕ ${esc(t('exit'))}</a>` : brand()}
    </header>`;
}

function render({ route, params }) {
  if (typeof cleanup === 'function') cleanup();
  cleanup = null;

  document.body.dataset.layout = route.layout;
  document.title = `${t(route.title)} · ${t('appName')}`;

  chrome.innerHTML =
    route.layout === 'app' ? appChrome(route.nav) :
    route.layout === 'focus' ? focusBar(route) :
    publicBar();

  const page = PAGES[route.path] || placeholder;
  main.innerHTML = page.render(route, params);
  cleanup = page.mount ? page.mount(main, params) : null;

  window.scrollTo(0, 0);
  // Move keyboard and screen-reader focus to the new page's heading.
  const heading = main.querySelector('h1');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

// The skip link is a button: a "#main" link would be read as a page by the hash router.
document.getElementById('skipLink').addEventListener('click', () => {
  (main.querySelector('h1') || main).focus();
});

ROUTES.forEach(addRoute);
setNotFound(NOT_FOUND);
onTextModeChange(() => render(match(currentPath())));
startRouter(render);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('Service worker not registered:', err));
  });
}
