import { registry } from './core/registry.js';
import { visualAdblockPlugin } from './plugins/visualAdblock.js';
import { adblockPlugin } from './plugins/adblock.js';
import { offlinePlugin } from './plugins/offlineMode.js';
import { devToolsPlugin } from './plugins/devTools.js';
import { settingsUI } from './ui/settingsModal.js';

(function purgeLegacyModArtifacts() {
  const legacyKeys = [
    'extera_v5_config',
    'extera_v5_custom_css',
    'extera_config',
    'spicetify_exp_features',
    'spicetify_home_config'
  ];
  legacyKeys.forEach(key => {
    try {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    } catch (e) {}
  });

  try {
    const oldStyles = document.querySelectorAll('style[id*="extera"], style[id*="spicetify"], link[href*="extera"]');
    oldStyles.forEach(s => s.remove());
  } catch (e) {}
})();

(function() {
  console.log('[Mod] Bootstrapping v0.3.0 (Settings UI & Encore Modal)...');

  registry.register(visualAdblockPlugin);
  registry.register(adblockPlugin);
  registry.register(offlinePlugin);
  registry.register(devToolsPlugin);

  function onReady() {
    console.log('[Mod] Spotify DOM Ready. Initializing modules & Settings UI...');
    registry.initAll();
    settingsUI.init(registry);

    window.__MOD__ = {
      registry,
      settingsUI,
      version: '0.3.0'
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
