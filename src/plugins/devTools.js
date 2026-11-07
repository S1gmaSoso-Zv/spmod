/**
 * Plugin: Developer Tools
 * Enhanced logging in DevTools (F12) and access to Spotify internals
 */
export const devToolsPlugin = {
  id: 'devTools',
  name: 'Режим разработчика',
  description: 'Расширенное логирование в консоли F12 и быстрый доступ к window.__MOD__',
  defaultEnabled: false,

  init() {
    console.log('[Mod:Dev] Developer Mode enabled. window.__MOD__ is active.');
    window.__MOD_DEBUG__ = true;
  },

  destroy() {
    console.log('[Mod:Dev] Developer Mode disabled.');
    window.__MOD_DEBUG__ = false;
  }
};
