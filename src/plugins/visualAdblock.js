
export const visualAdblockPlugin = {
  id: 'visualAdblock',
  name: 'Скрытие баннеров и промо',
  description: 'Вырезает все кнопки «Улучшить аккаунт», спонсорские плашки и рекламные баннеры',
  defaultEnabled: true,
  styleElement: null,

  init() {
    console.log('[Mod:VisualAdblock] Initializing banner & promo blocker...');
    const styleId = 'mod-adblock-visual-styles';
    let style = document.getElementById(styleId);

    const css = typeof __ADBLOCK_CSS__ !== 'undefined' ? __ADBLOCK_CSS__ : '';

    if (!style && css) {
      style = document.createElement('style');
      style.id = styleId;
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);
    } else if (style) {
      style.disabled = false;
    }
    this.styleElement = style;
  },

  destroy() {
    console.log('[Mod:VisualAdblock] Disabling banner blocker...');
    const styleId = 'mod-adblock-visual-styles';
    const style = document.getElementById(styleId) || this.styleElement;
    if (style) {
      style.disabled = true;
    }
  }
};
