// Stand-in for pages that aren't built yet. Shows the page title, which issue
// builds it, and buttons to the next pages in the flow so the whole app can be
// clicked through from day one.

import { bi, esc, getTextMode, setTextMode, t } from '../i18n.js';
import { link, match } from '../router.js';

const ISSUES_URL = 'https://github.com/Mrudhula576/Everyday-Language-Learner/issues/';

function fill(path, params) {
  return path.replace(/:(\w+)/g, (_, name) => params[name] ?? name);
}

function textModeSwitch() {
  const mode = getTextMode();
  const option = (value, key) => `
    <label class="choice">
      <input type="radio" name="textMode" value="${value}" ${mode === value ? 'checked' : ''}>
      <span>${bi(key)}</span>
    </label>`;
  return `
    <div class="card stack-sm" role="radiogroup" aria-labelledby="textModeLabel" data-text-mode>
      <div class="card-label" id="textModeLabel">${bi('textMode')}</div>
      ${option('both', 'textModeBoth')}
      ${option('en', 'textModeEn')}
    </div>`;
}

export default {
  render(route, params) {
    const next = (route.next || []).map((path) => {
      const target = fill(path, params);
      const { route: dest } = match(target);
      return `<a class="btn btn-ghost" href="${link(target)}">${esc(t('goTo'))}: ${bi(dest ? dest.title : 'pageNotFound')}</a>`;
    });

    return `
      <section class="placeholder stack">
        ${route.page ? `<span class="pill">Page ${route.page}</span>` : ''}
        <h1 class="page-title" tabindex="-1">${bi(route.title)}</h1>
        ${route.issue
          ? `<p class="muted">${esc(t('comingSoon'))}
               <a href="${ISSUES_URL}${route.issue}" target="_blank" rel="noopener">#${route.issue}</a></p>`
          : ''}
        ${route.path === '/settings' ? textModeSwitch() : ''}
        <nav class="next-links" aria-label="Next pages">${next.join('')}</nav>
      </section>`;
  },

  mount(root) {
    root.querySelector('[data-text-mode]')?.addEventListener('change', (e) => setTextMode(e.target.value));
  },
};
