const api = globalThis.browser ?? chrome;

// Rule 1 lets URLs already in the target language through (prevents a redirect loop),
// rule 2 swaps the language segment (/pt/, /fr/, /zh-cn/...) for the target one.
// Pausing just removes the rules, so op.gg links load untouched.
async function sync() {
  const { lang, paused } = await api.storage.local.get({ lang: 'en', paused: false });
  api.action.setBadgeText({ text: paused ? 'OFF' : '' });
  const host = '^https?://(www\\.)?op\\.gg/';
  return api.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2],
    addRules: paused ? [] : [
      { id: 1, priority: 2, action: { type: 'allow' },
        condition: { regexFilter: `${host}${lang}/`, resourceTypes: ['main_frame'] } },
      { id: 2, priority: 1,
        action: { type: 'redirect', redirect: { regexSubstitution: `https://\\1op.gg/${lang}/\\3` } },
        condition: { regexFilter: `${host}[a-z]{2}(-[a-z]{2,4})?/(.*)`, resourceTypes: ['main_frame'] } }
    ]
  });
}

api.runtime.onInstalled.addListener(sync);
api.runtime.onStartup.addListener(sync);
api.storage.onChanged.addListener(sync);
