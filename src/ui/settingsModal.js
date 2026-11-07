/**
 * Settings UI Component - Spotify Encore Design System
 * Modal Overlay (Option A), TopBar Action Button, and Global Hotkey (Ctrl + Shift + M)
 */
export const settingsUI = {
  registry: null,
  observer: null,

  init(registry) {
    this.registry = registry;
    console.log('[Mod:SettingsUI] Initializing Settings UI...');

    this.initHotkey();
    this.initTopBarButton();
  },

  isOpen() {
    return Boolean(document.getElementById('mod-settings-modal'));
  },

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  },

  open() {
    if (this.isOpen()) return;

    const overlay = document.createElement('div');
    overlay.className = 'mod-modal-overlay';
    overlay.id = 'mod-settings-modal';

    const dialog = document.createElement('div');
    dialog.className = 'mod-modal-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'mod-modal-title');

    // 1. Header
    const header = document.createElement('div');
    header.className = 'mod-modal-header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'mod-modal-title-group';

    const title = document.createElement('h2');
    title.className = 'mod-modal-title';
    title.id = 'mod-modal-title';
    title.textContent = 'Настройки Spotify Mod';

    const subtitle = document.createElement('span');
    subtitle.className = 'mod-modal-subtitle';
    subtitle.textContent = 'Управление модулями и блокировкой рекламы';

    titleGroup.appendChild(title);
    titleGroup.appendChild(subtitle);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'mod-modal-close-btn';
    closeBtn.setAttribute('aria-label', 'Закрыть');
    closeBtn.setAttribute('title', 'Закрыть (Esc)');
    closeBtn.innerHTML = `
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854z"/>
      </svg>
    `;
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(titleGroup);
    header.appendChild(closeBtn);

    // 2. Body: список доступных модулей
    const body = document.createElement('div');
    body.className = 'mod-modal-body';

    const plugins = this.registry ? this.registry.getAllPlugins() : [];
    plugins.forEach(plugin => {
      const item = document.createElement('div');
      item.className = 'mod-setting-item';

      const info = document.createElement('div');
      info.className = 'mod-setting-info';

      const name = document.createElement('div');
      name.className = 'mod-setting-name';
      name.textContent = plugin.name || plugin.id;

      const desc = document.createElement('div');
      desc.className = 'mod-setting-desc';
      desc.textContent = plugin.description || '';

      info.appendChild(name);
      info.appendChild(desc);

      // Свитчер
      const switchLabel = document.createElement('label');
      switchLabel.className = 'mod-switch';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = this.registry.isPluginEnabled(plugin.id, plugin.defaultEnabled !== false);
      checkbox.addEventListener('change', (e) => {
        this.registry.setPluginEnabled(plugin.id, e.target.checked);
      });

      const slider = document.createElement('span');
      slider.className = 'mod-switch-slider';

      switchLabel.appendChild(checkbox);
      switchLabel.appendChild(slider);

      item.appendChild(info);
      item.appendChild(switchLabel);
      body.appendChild(item);
    });

    // 3. Footer
    const footer = document.createElement('div');
    footer.className = 'mod-modal-footer';

    const badge = document.createElement('div');
    badge.className = 'mod-modal-footer-badge';
    badge.innerHTML = `
      <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
        <path d="M13.485 1.929a.75.75 0 0 1 .086 1.056l-7 8.5a.75.75 0 0 1-1.11.05l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.915 2.915 6.493-7.885a.75.75 0 0 1 1.056-.076z"/>
      </svg>
      <span>v0.3.0 • Активен</span>
    `;

    const shortcut = document.createElement('div');
    shortcut.className = 'mod-modal-shortcut';
    shortcut.innerHTML = `
      <span>Горячая клавиша:</span>
      <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd>
    `;

    footer.appendChild(badge);
    footer.appendChild(shortcut);

    // Сборка диалога
    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);
    overlay.appendChild(dialog);

    // Закрытие по клику на фон
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.close();
      }
    });

    document.body.appendChild(overlay);

    // Подсветка кнопки в шапке
    const topBarBtn = document.getElementById('mod-topbar-settings-btn');
    if (topBarBtn) topBarBtn.classList.add('active');
  },

  close() {
    const overlay = document.getElementById('mod-settings-modal');
    if (!overlay) return;

    overlay.classList.add('closing');
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 140);

    const topBarBtn = document.getElementById('mod-topbar-settings-btn');
    if (topBarBtn) topBarBtn.classList.remove('active');
  },

  initHotkey() {
    window.addEventListener('keydown', (e) => {
      // Ctrl + Shift + M или Cmd + Shift + M
      const isM = e.key === 'M' || e.key === 'm' || e.code === 'KeyM' || e.keyCode === 77;
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && isM) {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
        return;
      }

      // Escape закрывает модалку
      if (e.key === 'Escape' || e.code === 'Escape' || e.keyCode === 27) {
        if (this.isOpen()) {
          e.preventDefault();
          e.stopPropagation();
          this.close();
        }
      }
    }, true);

    console.log('[Mod:SettingsUI] Registered hotkey Ctrl + Shift + M.');
  },

  createTopBarButton() {
    const btn = document.createElement('button');
    btn.className = 'mod-topbar-button';
    btn.id = 'mod-topbar-settings-btn';
    btn.setAttribute('title', 'Настройки Spotify Mod (Ctrl + Shift + M)');
    btn.setAttribute('aria-label', 'Настройки Spotify Mod');
    btn.innerHTML = `
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.86z"/>
      </svg>
    `;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });
    return btn;
  },

  attachTopBarButton() {
    if (document.getElementById('mod-topbar-settings-btn')) return;

    // 1. Поиск профиля пользователя / виджета в шапке
    const userWidget = document.querySelector(
      '[data-testid="top-bar-user-widget"], button[data-testid="user-widget-link"], [data-testid="username-button"], .main-userWidget-box, [class*="userWidget"]'
    );
    if (userWidget && userWidget.parentElement) {
      const btn = this.createTopBarButton();
      userWidget.parentElement.insertBefore(btn, userWidget);
      console.log('[Mod:SettingsUI] TopBar button attached next to user widget.');
      return;
    }

    // 2. Поиск скрытой кнопки Upgrade (вставляем перед ней или вместо нее)
    const upgradeBtn = document.querySelector('[data-testid="action-bar-button-upgrade"], button[data-testid="upgrade-button"]');
    if (upgradeBtn && upgradeBtn.parentElement) {
      const btn = this.createTopBarButton();
      upgradeBtn.parentElement.insertBefore(btn, upgradeBtn);
      console.log('[Mod:SettingsUI] TopBar button attached in upgrade button slot.');
      return;
    }

    // 3. Поиск блока action buttons в header
    const actionButtons = document.querySelector('.main-topBar-actionButtons, header [class*="actionButtons"]');
    if (actionButtons) {
      const btn = this.createTopBarButton();
      actionButtons.prepend(btn);
      console.log('[Mod:SettingsUI] TopBar button attached to action buttons container.');
      return;
    }

    // 4. Fallback в контейнер header
    const header = document.querySelector('.main-topBar-container, [data-testid="top-bar"], header');
    if (header) {
      const btn = this.createTopBarButton();
      header.appendChild(btn);
      console.log('[Mod:SettingsUI] TopBar button attached to header fallback.');
    }
  },

  initTopBarButton() {
    this.attachTopBarButton();

    // Следим за изменениями DOM (переходы по страницам Spotify SPA)
    this.observer = new MutationObserver(() => {
      if (!document.getElementById('mod-topbar-settings-btn')) {
        this.attachTopBarButton();
      }
    });

    this.observer.observe(document.body, { childList: true, subtree: true });

    // Дополнительный интервал на первые 10 секунд загрузки
    let retries = 0;
    const retryTimer = setInterval(() => {
      retries++;
      if (document.getElementById('mod-topbar-settings-btn') || retries > 15) {
        clearInterval(retryTimer);
      } else {
        this.attachTopBarButton();
      }
    }, 600);
  }
};
