/**
 * Plugin: Offline Mode
 * Disables background sync to save data and focus on local/cached playback
 */
export const offlinePlugin = {
  id: 'offlineMode',
  name: 'Офлайн-режим',
  description: 'Ограничивает фоновую передачу данных для экономии трафика и автономного режима',
  defaultEnabled: false,

  init() {
    console.log('[Mod:Offline] Offline mode enabled.');
    window.__mod_offline_active = true;
  },

  destroy() {
    console.log('[Mod:Offline] Offline mode disabled.');
    window.__mod_offline_active = false;
  }
};
