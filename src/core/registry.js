
class PluginRegistry {
  constructor() {
    this.plugins = new Map();
    this.storageKey = 'mod_settings_v1';
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.warn('[Mod] Failed to load settings from localStorage', e);
      return {};
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    } catch (e) {
      console.error('[Mod] Failed to save settings', e);
    }
  }

  isPluginEnabled(id, defaultEnabled = true) {
    if (this.settings[id] !== undefined) {
      return Boolean(this.settings[id]);
    }
    return defaultEnabled;
  }

  setPluginEnabled(id, enabled) {
    this.settings[id] = Boolean(enabled);
    this.saveSettings();
    const plugin = this.plugins.get(id);
    if (!plugin) return;

    try {
      if (enabled && typeof plugin.init === 'function') {
        plugin.init();
        console.log(`[Mod] Plugin [${id}] enabled.`);
      } else if (!enabled && typeof plugin.destroy === 'function') {
        plugin.destroy();
        console.log(`[Mod] Plugin [${id}] disabled.`);
      }
    } catch (e) {
      console.error(`[Mod] Error toggling plugin [${id}]:`, e);
    }
  }

  getPlugin(id) {
    return this.plugins.get(id);
  }

  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  register(plugin) {
    if (!plugin || !plugin.id) {
      console.error('[Mod] Invalid plugin registration:', plugin);
      return;
    }
    this.plugins.set(plugin.id, plugin);
    console.log(`[Mod] Registered plugin: ${plugin.id}`);
  }

  initAll() {
    console.log(`[Mod] Initializing ${this.plugins.size} plugins...`);
    for (const [id, plugin] of this.plugins.entries()) {
      const enabled = this.isPluginEnabled(id, plugin.defaultEnabled !== false);
      if (enabled && typeof plugin.init === 'function') {
        try {
          plugin.init();
          console.log(`[Mod] Plugin [${id}] initialized.`);
        } catch (err) {
          console.error(`[Mod] Error initializing plugin [${id}]:`, err);
        }
      }
    }
  }
}

export const registry = new PluginRegistry();
