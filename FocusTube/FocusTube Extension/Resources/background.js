/* Background: seed default settings on first install. */
(function () {
  'use strict';
  const api = typeof browser !== 'undefined' ? browser : chrome;

  api.runtime.onInstalled.addListener(async () => {
    const { settings } = await api.storage.local.get('settings');
    if (!settings) {
      await api.storage.local.set({ settings: FT.withDefaults({}) });
    }
  });
})();
