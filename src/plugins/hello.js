/**
 * Sample Plugin: Hello
 */
export const helloPlugin = {
  id: 'hello',
  name: 'Базовый модуль',
  description: 'Проверка готовности ядра и компонентов мода',
  defaultEnabled: true,
  init() {
    console.log('%c[Mod] Spotify Mod Loaded & Active', 'background: #1db954; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 3px;');
  },
  destroy() {
    console.log('[Mod] Module disabled.');
  }
};
