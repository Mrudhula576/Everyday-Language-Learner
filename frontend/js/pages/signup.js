// Page 2 · Sign up (issue #4).
// Email + username + password with Supabase Auth, or Continue with Google.
// The username travels as user metadata; the handle_new_user() trigger
// (backend/supabase/schema.sql) copies it into profiles.
// After sign-up the learner goes to the Level check, not the dashboard.

import { bi, esc, t } from '../i18n.js';
import { link, navigate } from '../router.js';

// Same rule as the profiles.username check in schema.sql.
const USERNAME_RE = /^[A-Za-z0-9_.]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const loadAuth = () => import('../auth.js');

function field({ id, label, type, autocomplete, hint, extra = '' }) {
  const describedBy = [hint ? `${id}Hint` : '', `${id}Error`].filter(Boolean).join(' ');
  return `
    <div class="field" data-field="${id}">
      <label class="field-label" for="${id}">${bi(label)}</label>
      <div class="field-control">
        <input class="input" id="${id}" name="${id}" type="${type}" autocomplete="${autocomplete}"
               autocapitalize="off" spellcheck="false" aria-describedby="${describedBy}">
        ${extra}
      </div>
      ${hint ? `<p class="field-hint muted" id="${id}Hint">${bi(hint)}</p>` : ''}
      <p class="field-error" id="${id}Error" aria-live="polite"></p>
    </div>`;
}

function whyPanel() {
  const items = [['🔊', 'why1'], ['🎙️', 'why2'], ['🎮', 'why3'], ['📈', 'why4']];
  return `
    <aside class="auth-why" aria-labelledby="whyTitle">
      <h2 id="whyTitle">${bi('whyTitle')}</h2>
      <ul>
        ${items.map(([icon, key]) => `<li><span class="auth-why-icon" aria-hidden="true">${icon}</span>${bi(key)}</li>`).join('')}
      </ul>
    </aside>`;
}

export default {
  render() {
    const eye = `<button type="button" class="field-eye" data-toggle-password aria-pressed="false"
                   aria-label="${esc(t('showPassword'))}" title="${esc(t('showPassword'))}">👁</button>`;
    return `
      <div class="auth">
        ${whyPanel()}
        <section class="auth-main">
          <a class="back-link" href="${link('/')}"><span aria-hidden="true">←</span> ${esc(t('back'))}</a>
          <h1>${bi('pageSignup')}</h1>

          <p class="form-alert" role="alert" hidden></p>

          <form class="auth-form" novalidate>
            ${field({ id: 'email', label: 'fieldEmail', type: 'email', autocomplete: 'email' })}
            ${field({ id: 'username', label: 'fieldUsername', type: 'text', autocomplete: 'username', hint: 'usernameHint' })}
            ${field({ id: 'password', label: 'fieldPassword', type: 'password', autocomplete: 'new-password', hint: 'passwordHint', extra: eye })}
            <button class="btn btn-primary btn-block" type="submit">${bi('createAccount')}</button>
          </form>

          <div class="auth-or" aria-hidden="true"><span>${esc(t('or'))}</span></div>

          <button class="btn btn-google btn-block" type="button" data-google>
            <span class="google-g" aria-hidden="true">G</span>${bi('continueGoogle')}
          </button>

          <p class="auth-switch">${esc(t('haveAccount'))} <a href="${link('/login')}">${esc(t('logIn'))}</a></p>
        </section>
      </div>`;
  },

  mount(root) {
    const form = root.querySelector('.auth-form');
    const alertBox = root.querySelector('.form-alert');
    const submit = form.querySelector('[type="submit"]');
    const inputs = {
      email: form.querySelector('#email'),
      username: form.querySelector('#username'),
      password: form.querySelector('#password'),
    };
    let alive = true;
    let checkTimer = null;
    let checkSeq = 0;      // ignore answers to older username checks
    let busy = false;

    // ---- messages ----
    function setError(name, key) {
      const box = form.querySelector(`[data-field="${name}"]`);
      box.classList.toggle('has-error', Boolean(key));
      box.classList.remove('is-ok');
      inputs[name].setAttribute('aria-invalid', key ? 'true' : 'false');
      box.querySelector('.field-error').innerHTML = key ? bi(key) : '';
    }
    function setOk(name, key) {
      const box = form.querySelector(`[data-field="${name}"]`);
      box.classList.remove('has-error');
      box.classList.add('is-ok');
      inputs[name].setAttribute('aria-invalid', 'false');
      box.querySelector('.field-error').innerHTML = `<span aria-hidden="true">✓</span> ${bi(key)}`;
    }
    function showAlert(key) {
      alertBox.hidden = !key;
      alertBox.innerHTML = key ? bi(key) : '';
    }

    // ---- checks (run on leaving a field, and all together on submit) ----
    function checkEmail() {
      const value = inputs.email.value.trim();
      const key = !value ? 'errEmailEmpty' : !EMAIL_RE.test(value) ? 'errEmailInvalid' : null;
      setError('email', key);
      return !key;
    }
    function checkPassword() {
      const key = inputs.password.value.length < MIN_PASSWORD ? 'errPasswordShort' : null;
      setError('password', key);
      return !key;
    }
    function usernameFormatError() {
      const value = inputs.username.value.trim();
      return !value ? 'errUsernameEmpty' : !USERNAME_RE.test(value) ? 'errUsernameFormat' : null;
    }
    // Asks the database. Returns true (free), false (taken) or null (couldn't check).
    async function checkUsernameTaken() {
      const formatError = usernameFormatError();
      if (formatError) {
        setError('username', formatError);
        return false;
      }
      const seq = ++checkSeq;
      const box = form.querySelector('[data-field="username"]');
      box.classList.remove('has-error', 'is-ok');
      box.querySelector('.field-error').innerHTML = bi('usernameChecking');
      try {
        const { usernameAvailable } = await loadAuth();
        const free = await usernameAvailable(inputs.username.value.trim());
        if (!alive || seq !== checkSeq) return null;
        if (free) setOk('username', 'usernameFree');
        else setError('username', 'errUsernameTaken');
        return free;
      } catch (err) {
        console.warn('Username check failed:', err);
        if (alive && seq === checkSeq) setError('username', null);
        return null; // let sign-up try; the database still blocks duplicates
      }
    }

    // ---- events ----
    inputs.email.addEventListener('blur', () => inputs.email.value && checkEmail());
    inputs.password.addEventListener('blur', () => inputs.password.value && checkPassword());
    inputs.username.addEventListener('input', () => {
      clearTimeout(checkTimer);
      setError('username', null);
      if (!usernameFormatError()) checkTimer = setTimeout(checkUsernameTaken, 500);
    });
    inputs.username.addEventListener('blur', () => {
      if (!inputs.username.value) return;
      clearTimeout(checkTimer);
      if (usernameFormatError()) setError('username', usernameFormatError());
    });

    root.querySelector('[data-toggle-password]').addEventListener('click', (e) => {
      const button = e.currentTarget;
      const show = inputs.password.type === 'password';
      inputs.password.type = show ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(show));
      const label = t(show ? 'hidePassword' : 'showPassword');
      button.setAttribute('aria-label', label);
      button.title = label;
    });

    function setBusy(on) {
      busy = on;
      submit.disabled = on;
      submit.innerHTML = bi(on ? 'creatingAccount' : 'createAccount');
    }

    // Turn a Supabase error into a message on the right field.
    function showSignUpError(error) {
      const code = error?.code || '';
      const message = error?.message || '';
      if (code === 'user_already_exists' || code === 'email_exists') return setError('email', 'errEmailTaken');
      if (code === 'email_address_invalid' || code === 'validation_failed') return setError('email', 'errEmailInvalid');
      if (code === 'weak_password') return setError('password', 'errPasswordWeak');
      // Someone took the username between the check and the click: the
      // profiles unique index makes the trigger fail.
      if (code === 'unexpected_failure' || /database error saving new user/i.test(message)) {
        return setError('username', 'errUsernameTaken');
      }
      if (code.startsWith('over_') || error?.status === 429) return showAlert('errTooMany');
      if (!navigator.onLine || error?.name === 'AuthRetryableFetchError' || error instanceof TypeError) {
        return showAlert('errOffline');
      }
      console.error('Sign-up failed:', error);
      return showAlert('errGeneric');
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (busy) return;
      showAlert(null);
      clearTimeout(checkTimer);

      const okEmail = checkEmail();
      const okPassword = checkPassword();
      setBusy(true);
      const free = await checkUsernameTaken();
      if (!alive) return;
      if (!okEmail || !okPassword || free === false) {
        setBusy(false);
        showAlert('fixErrors');
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }

      try {
        const { supabase } = await loadAuth();
        const { data, error } = await supabase.auth.signUp({
          email: inputs.email.value.trim(),
          password: inputs.password.value,
          options: { data: { username: inputs.username.value.trim() } },
        });
        if (!alive) return;
        if (error) {
          setBusy(false);
          showSignUpError(error);
          form.querySelector('[aria-invalid="true"]')?.focus();
          return;
        }
        if (data.session) {
          navigate('/level-check');
        } else {
          // Email confirmation is still on in Supabase.
          setBusy(false);
          showAlert('checkEmail');
        }
      } catch (err) {
        if (!alive) return;
        setBusy(false);
        showSignUpError(err);
      }
    });

    root.querySelector('[data-google]').addEventListener('click', async (e) => {
      const button = e.currentTarget;
      button.disabled = true;
      try {
        const { signInWithGoogle } = await loadAuth();
        const { error } = await signInWithGoogle(); // leaves the page on success
        if (error) throw error;
      } catch (err) {
        console.error('Google sign-in failed to start:', err);
        if (alive) {
          button.disabled = false;
          showAlert(navigator.onLine ? 'errGoogle' : 'errOffline');
        }
      }
    });

    // Back from a failed Google sign-in: say so. (Also starts loading the
    // Supabase library early, so Create account responds quickly.)
    loadAuth().then(({ takeRedirectError }) => {
      if (alive && takeRedirectError()) showAlert('errGoogle');
    }).catch(() => {});

    return () => {
      alive = false;
      clearTimeout(checkTimer);
    };
  },
};
