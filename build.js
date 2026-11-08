const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const OUT_FILE = path.join(DIST_DIR, 'bundle.js');

console.log('[Build] Starting zero-dependency build...');
const startTime = Date.now();

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

const cssFiles = [
  path.join(SRC_DIR, 'theme', 'theme.css'),
  path.join(SRC_DIR, 'theme', 'adblock.css'),
  path.join(SRC_DIR, 'theme', 'modal.css'),
  path.join(SRC_DIR, 'theme', 'downloader.css')
];
let bundledCss = '';
for (const f of cssFiles) {
  if (fs.existsSync(f)) {
    bundledCss += `\n/* --- ${path.basename(f)} --- */\n` + fs.readFileSync(f, 'utf8');
  }
}

const registryCode = fs.readFileSync(path.join(SRC_DIR, 'core', 'registry.js'), 'utf8')
  .replace(/export\s+const\s+registry\s*=\s*new\s+PluginRegistry\(\);?/, 'const registry = new PluginRegistry();')
  .replace(/export\s+/g, '');

const helloPluginCode = fs.readFileSync(path.join(SRC_DIR, 'plugins', 'hello.js'), 'utf8')
  .replace(/export\s+const\s+helloPlugin\s*=/, 'const helloPlugin =')
  .replace(/export\s+/g, '');

const adblockPluginCode = fs.readFileSync(path.join(SRC_DIR, 'plugins', 'adblock.js'), 'utf8')
  .replace(/export\s+const\s+adblockPlugin\s*=/, 'const adblockPlugin =')
  .replace(/export\s+/g, '');

const settingsUiCode = fs.readFileSync(path.join(SRC_DIR, 'plugins', 'settingsUi.js'), 'utf8')
  .replace(/export\s+const\s+settingsUiPlugin\s*=/, 'const settingsUiPlugin =')
  .replace(/export\s+/g, '');

const companionClientCode = fs.readFileSync(path.join(SRC_DIR, 'plugins', 'companionClient.js'), 'utf8')
  .replace(/export\s+const\s+companionPlugin\s*=/, 'const companionPlugin =')
  .replace(/export\s+/g, '');

const downloaderUiCode = fs.readFileSync(path.join(SRC_DIR, 'plugins', 'downloaderUi.js'), 'utf8')
  .replace(/export\s+const\s+downloaderUiPlugin\s*=/, 'const downloaderUiPlugin =')
  .replace(/export\s+/g, '');

const bundledCode = `/**
 * Spotify Mod Bundle v0.5.0 (Offline Download & Polished UI)
 * Generated: ${new Date().toISOString()}
 * Zero-dependency build
 */
(function() {
  'use strict';

  // --- Очистка следов старых сторонних модов ---
  (function purgeLegacyArtifacts() {
    const legacyKeys = [
      'extera_v5_config',
      'extera_v5_custom_css',
      'extera_config',
      'spicetify_exp_features',
      'spicetify_home_config'
    ];
    legacyKeys.forEach(function(key) {
      try {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      } catch (e) {}
    });
    try {
      var oldStyles = document.querySelectorAll('style[id*="extera"], style[id*="spicetify"], link[href*="extera"]');
      oldStyles.forEach(function(s) { s.remove(); });
    } catch (e) {}
  })();

  // --- Внедрение стилей темы, Adblock, UI и Downloader ---
  function injectStyles() {
    const styleId = 'mod-bundled-styles';
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = ${JSON.stringify(bundledCss)};
  }

  // --- Реестр плагинов ---
${registryCode.split('\n').map(l => '  ' + l).join('\n')}

  // --- Плагин: Hello ---
${helloPluginCode.split('\n').map(l => '  ' + l).join('\n')}

  // --- Плагин: Adblock & Audio Skipper ---
${adblockPluginCode.split('\n').map(l => '  ' + l).join('\n')}

  // --- Плагин: Settings UI ---
${settingsUiCode.split('\n').map(l => '  ' + l).join('\n')}

  // --- Плагин: Companion Client ---
${companionClientCode.split('\n').map(l => '  ' + l).join('\n')}

  // --- Плагин: Downloader UI ---
${downloaderUiCode.split('\n').map(l => '  ' + l).join('\n')}

  // --- Точка входа и инициализация ---
  console.log('[Mod] Bootstrapping...');
  injectStyles();
  
  // Регистрация модулей в глобальном реестре
  registry.register(helloPlugin);
  registry.register(adblockPlugin);
  registry.register(settingsUiPlugin);
  registry.register(companionPlugin);
  registry.register(downloaderUiPlugin);

  function onReady() {
    console.log('[Mod] Spotify DOM Ready. Starting modules...');
    
    // Экспорт глобального объекта для отладки и UI
    window.__MOD__ = {
      registry: registry,
      version: '0.5.0'
    };

    registry.initAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
`;

fs.writeFileSync(OUT_FILE, bundledCode, 'utf8');
const elapsed = Date.now() - startTime;
const stats = fs.statSync(OUT_FILE);

console.log(`[Build] Successfully built: dist/bundle.js (${stats.size} bytes) in ${elapsed}ms! 🚀`);
