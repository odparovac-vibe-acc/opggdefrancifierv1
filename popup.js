const api = globalThis.browser ?? chrome;
const input = document.getElementById('lang');
const msg = document.getElementById('msg');
const WARNING = 'are you deadass and sure mann (click Save again)';

input.oninput = () => msg.textContent = '';

const toggle = document.getElementById('toggle');

function showPaused(paused) {
  toggle.textContent = paused ? 'Resume' : 'Pause';
  toggle.classList.toggle('paused', paused);
  document.body.classList.toggle('paused', paused);
}

api.storage.local.get({ lang: 'en', paused: false }).then(s => { input.value = s.lang; showPaused(s.paused); });

toggle.onclick = async () => {
  const paused = !toggle.classList.contains('paused');
  await api.storage.local.set({ paused });
  showPaused(paused);
};

document.getElementById('save').onclick = async () => {
  const lang = input.value.trim().toLowerCase();
  if (!/^[a-z]{2}(-[a-z]{2,4})?$/.test(lang)) return msg.textContent = 'Use a code like en, fr, pt, zh-cn';
  // French needs a second click. confirm() doesn't work in Firefox popups, so the warning is inline.
  if (lang === 'fr' && msg.textContent !== WARNING) return msg.textContent = WARNING;
  // Firefox treats host permissions as optional in MV3, so ask for them (no-op elsewhere).
  await api.permissions.request({ origins: ['*://op.gg/*', '*://www.op.gg/*'] });
  await api.storage.local.set({ lang });
  msg.textContent = 'Saved: ' + lang;
};
