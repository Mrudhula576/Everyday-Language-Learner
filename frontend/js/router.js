// Small hash router: URLs look like  /#/lessons/3/oral
// Hash URLs work on any static host (and python's http.server) with no server config.

const routes = [];
let notFound = null;
let onChange = () => {};

/** path like '/lessons/:id/oral' -> regex with named groups */
function compile(path) {
  const pattern = path
    .split('/')
    .map((part) => (part.startsWith(':') ? `(?<${part.slice(1)}>[^/]+)` : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/');
  return new RegExp(`^${pattern}/?$`);
}

export function addRoute(route) {
  routes.push({ ...route, regex: compile(route.path) });
}

export function setNotFound(route) {
  notFound = route;
}

export function currentPath() {
  const path = location.hash.replace(/^#/, '') || '/';
  return path.split('?')[0];
}

export function match(path) {
  for (const route of routes) {
    const m = route.regex.exec(path);
    if (m) return { route, params: m.groups || {} };
  }
  return { route: notFound, params: {} };
}

export function navigate(path) {
  location.hash = path;
}

/** Turn a pattern + params into a link: link('/lessons/:id/oral', {id: 3}) -> '#/lessons/3/oral' */
export function link(path, params = {}) {
  return '#' + path.replace(/:(\w+)/g, (_, name) => encodeURIComponent(params[name] ?? name));
}

export function startRouter(handler) {
  onChange = handler;
  window.addEventListener('hashchange', () => onChange(match(currentPath())));
  onChange(match(currentPath()));
}
