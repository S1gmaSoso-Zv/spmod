
export const settingsUiPlugin = {
  id: 'settings-ui',
  name: 'Интерфейс настроек',
  description: 'Кнопка в панели и окно настроек (Ctrl + Shift + M)',
  defaultEnabled: true,

  modalEl: null,
  topBarObserver: null,
  buttonEl: null,
  closeTimeout: null,
  _keyHandler: null,
  activeTab: 'region',
  activeCategory: 'all',
  detectedCountry: null,

  defaultPresets: [
    {
      id: 'local-xray',
      name: 'Локальный Xray / V2Ray (SOCKS5)',
      url: 'socks5://127.0.0.1:10808',
      category: 'download',
      description: 'Ваш локальный прокси на ПК (порт 10808). Рекомендуется для максимальной скорости скачивания.',
      isLocal: true
    },
    {
      id: 'local-http',
      name: 'Локальный Xray / V2Ray (HTTP)',
      url: 'http://127.0.0.1:10809',
      category: 'download',
      description: 'Локальный входящий HTTP порт на ПК (порт 10809).',
      isLocal: true
    },
    {
      id: 'local-clash',
      name: 'Clash / Mihomo / Verge (SOCKS5/HTTP)',
      url: 'socks5://127.0.0.1:7890',
      category: 'download',
      description: 'Локальный входящий порт клиента Clash (порт 7890).',
      isLocal: true
    },
    {
      id: 'local-nekobox',
      name: 'NekoBox / NekoRay (SOCKS5)',
      url: 'socks5://127.0.0.1:2080',
      category: 'download',
      description: 'Локальный входящий порт клиента NekoBox / NekoRay (порт 2080).',
      isLocal: true
    },
    {
      id: 'warp-socks',
      name: 'Cloudflare WARP (SOCKS5)',
      url: 'socks5://127.0.0.1:40000',
      category: 'download',
      description: 'Для пользователей официального клиента Cloudflare WARP на ПК.',
      isLocal: true
    },
    
    {
      id: 'spotify-direct',
      name: 'Системный VPN / Прямое соединение',
      url: 'direct',
      category: 'spotify',
      description: 'Прямой шлюз для пользователей WireGuard, Outline, Amnezia, Proton. Работает без прокси.',
      isLocal: false
    },
    {
      id: 'spotify-local-vpn',
      name: 'Через ваш локальный VPN/Xray (127.0.0.1:10808)',
      url: 'socks5://127.0.0.1:10808',
      category: 'spotify',
      description: 'Использует зарубежный узел, к которому подключен ваш клиент v2rayN/Xray на ПК.',
      isLocal: true
    },
    {
      id: 'spotify-reserve-nl',
      name: 'Нидерланды (NL) — Резервный шлюз ЕС',
      url: 'https://gateway-nl.sp-mod.net:443',
      category: 'spotify',
      description: 'Резервный узел Нидерландов для продления 14-дневного доступа.',
      isLocal: false
    },
    {
      id: 'spotify-reserve-de',
      name: 'Германия (DE) — Резервный шлюз ЕС',
      url: 'https://gateway-de.sp-mod.net:443',
      category: 'spotify',
      description: 'Резервный центральноевропейский шлюз с минимальным пингом для подтверждения сессии.',
      isLocal: false
    },
    {
      id: 'spotify-reserve-lv',
      name: 'Латвия (LV) — Резервный шлюз Балтии',
      url: 'https://gateway-lv.sp-mod.net:443',
      category: 'spotify',
      description: 'Шлюз региона Латвии/Балтии для подтверждения авторизации каждые 12 дней.',
      isLocal: false
    },
    {
      id: 'spotify-reserve-us',
      name: 'США (US) — Резервный шлюз США',
      url: 'https://gateway-us.sp-mod.net:443',
      category: 'spotify',
      description: 'Шлюз для американских профилей Spotify с доступом ко всем подкастам и релизам.',
      isLocal: false
    },
    {
      id: 'spotify-reserve-pl',
      name: 'Польша (PL) — Резервный шлюз ЕС',
      url: 'https://gateway-pl.sp-mod.net:443',
      category: 'spotify',
      description: 'Ближайший европейский узел для быстрой верификации сессии.',
      isLocal: false
    }
  ],

  init() {
    console.log('[Mod:UI] Initializing Settings UI v2.0...');
    this.purgeLegacyArtifacts();
    this.createModal();
    this.injectTopBarButton();
    this.bindKeyboardShortcuts();
    this.detectSpotifyCountry();
    this.startCompanionStatusPoller();
  },

  startCompanionStatusPoller() {
    if (this._companionPoller) clearInterval(this._companionPoller);
    this.updateFooterStatus();
    this._companionPoller = setInterval(() => {
      this.updateFooterStatus();
    }, 4000);
  },

  purgeLegacyArtifacts() {
    const legacy = document.getElementById('mod-profile-menuitem');
    if (legacy) {
      const parent = legacy.closest('li') || legacy;
      parent.remove();
    }
  },

  destroy() {
    if (this._companionPoller) {
      clearInterval(this._companionPoller);
      this._companionPoller = null;
    }
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
    if (this._keyHandler) {
      window.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
    if (this.buttonEl) {
      this.buttonEl.remove();
      this.buttonEl = null;
    }
    if (this.topBarObserver) {
      this.topBarObserver.disconnect();
      this.topBarObserver = null;
    }
  },

  async detectSpotifyCountry() {
    try {
      let country = null;

      if (window.Spicetify && window.Spicetify.Platform && window.Spicetify.Platform.UserAPI) {
        try {
          const user = await window.Spicetify.Platform.UserAPI.getUser();
          if (user && user.country) country = user.country.toUpperCase();
        } catch (e) {}
      }

      if (!country && window.__spotify_user_country) {
        country = window.__spotify_user_country.toUpperCase();
      }

      if (!country && window.Spicetify && window.Spicetify.Platform && window.Spicetify.Platform.AuthorizationAPI) {
        try {
          const token = await window.Spicetify.Platform.AuthorizationAPI.getValidAccessToken();
          if (token && token.accessToken) {
            const res = await fetch('https://api.spotify.com/v1/me', {
              headers: { Authorization: `Bearer ${token.accessToken}` }
            });
            const data = await res.json();
            if (data && data.country) country = data.country.toUpperCase();
          }
        } catch (e) {}
      }

      if (!country && window.__spotify_bearer_token) {
        try {
          const res = await fetch('https://api.spotify.com/v1/me', {
            headers: { Authorization: window.__spotify_bearer_token }
          });
          const data = await res.json();
          if (data && data.country) country = data.country.toUpperCase();
        } catch (e) {}
      }

      if (country) {
        this.detectedCountry = country;
        try { localStorage.setItem('mod:selected_country', country); } catch (e) {}
        console.log('[Mod:UI] Detected Spotify account country:', country);
        
        fetch('http://127.0.0.1:43821/set-account-region', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country })
        }).catch(() => {});
      }
    } catch (err) {}
  },

  createModal() {
    const existing = document.getElementById('mod-settings-modal');
    if (existing) {
      this.modalEl = existing;
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'mod-settings-modal';
    overlay.className = 'mod-modal-overlay';
    overlay.style.display = 'none';

    overlay.innerHTML = `
      <div class="mod-modal-dialog" role="dialog" aria-modal="true">
        <!-- Шапка -->
        <div class="mod-modal-header">
          <div class="mod-modal-title-group">
            <h2 class="mod-modal-title">spmod</h2>
            <div class="mod-modal-subtitle">Офлайн-загрузчик, прокси и параметры</div>
          </div>
          <button class="mod-modal-close-btn" id="mod-modal-close" aria-label="Закрыть" title="Закрыть (Esc)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <!-- Навигационные вкладки Encore -->
        <div class="mod-tabs-nav">
          <button class="mod-tab-btn active" data-tab="region">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            Регион и Обход 14 дней
          </button>
          <button class="mod-tab-btn" data-tab="downloads">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 3v11.59l4.29-4.3 1.42 1.42L12 17.41l-5.71-5.7 1.42-1.42 4.29 4.3V3h2zm-8 16h16v2H4v-2z"/>
            </svg>
            Офлайн-загрузки
          </button>
          <button class="mod-tab-btn" data-tab="proxy">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>
            </svg>
            Прокси и Сеть
          </button>
          <button class="mod-tab-btn" data-tab="features">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
            Функции мода
          </button>
        </div>

        <!-- Контент вкладок -->
        <div class="mod-modal-body">

          <!-- ========================================== -->
          <!-- 1. ВКЛАДКА: РЕГИОН И ОБХОД 14 ДНЕЙ -->
          <!-- ========================================== -->
          <div class="mod-tab-content active" id="mod-tab-region">
            
            <!-- Статус обхода (Элегантный Spotify Encore статус) -->
            <div class="mod-bypass-banner" id="mod-bypass-banner">
              <div class="mod-bypass-status-row">
                <div class="mod-bypass-indicator" id="mod-bypass-indicator"></div>
                <div class="mod-bypass-title" id="mod-bypass-title">Регион аккаунта: Нидерланды (NL) • Обход активен</div>
                <span id="mod-bypass-days-badge" class="mod-pill-badge mod-pill-badge-active">Активен • Фоновая защита 14 дней</span>
              </div>
              <div class="mod-bypass-desc" id="mod-bypass-desc">
                Spotify распознаёт страну вашего профиля. Автоматическая проверка тихо работает в фоновом режиме каждые 12 дней — блокировка за пределами страны исключена.
              </div>
              <div class="mod-bypass-meta">
                <div class="mod-bypass-meta-item">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="#1ed760" style="flex-shrink:0;">
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
                  </svg>
                  <span id="mod-bypass-next-check">Фоновая синхронизация активна (каждые 12 дней) • Ручное продление не требуется</span>
                </div>
                <button class="mod-btn mod-btn-primary" id="mod-trigger-bypass-btn" style="margin-left: auto; padding: 6px 16px; font-size: 12px;">
                  Подтвердить сессию сейчас
                </button>
              </div>
              <div id="mod-bypass-action-result" style="font-size: 12px; margin-top: 6px; display: none;"></div>
            </div>

            <!-- Интерактивный выбор региона профиля -->
            <div class="mod-card">
              <div class="mod-card-header">
                <div class="mod-card-title">Страна вашего профиля Spotify</div>
                <div id="mod-auto-detected-badge" class="mod-pill-badge" style="display: none; background: rgba(30,215,96,0.15); color: #1ed760;">Определено: Нидерланды (NL)</div>
              </div>
              <div class="mod-card-desc">
                Выберите страну, которая установлена в вашем профиле на spotify.com. Мод настроит автоматический обход именно под неё:
              </div>

              <div class="mod-region-grid">
                <!-- Латвия -->
                <div class="mod-region-card" data-country="LV">
                  <div class="mod-region-card-top">
                    <span class="mod-region-code">LV</span>
                    <div class="mod-region-radio"></div>
                  </div>
                  <div class="mod-region-name">Латвия</div>
                  <div class="mod-region-hint">Страна Балтии, европейский каталог</div>
                </div>

                <!-- Нидерланды -->
                <div class="mod-region-card active" data-country="NL">
                  <div class="mod-region-card-top">
                    <span class="mod-region-code">NL</span>
                    <div class="mod-region-radio"></div>
                  </div>
                  <div class="mod-region-name">Нидерланды</div>
                  <div class="mod-region-hint">Европейский каталог, высокая скорость</div>
                </div>

                <!-- Германия -->
                <div class="mod-region-card" data-country="DE">
                  <div class="mod-region-card-top">
                    <span class="mod-region-code">DE</span>
                    <div class="mod-region-radio"></div>
                  </div>
                  <div class="mod-region-name">Германия</div>
                  <div class="mod-region-hint">Центральная Европа, низкий пинг</div>
                </div>

                <!-- США -->
                <div class="mod-region-card" data-country="US">
                  <div class="mod-region-card-top">
                    <span class="mod-region-code">US</span>
                    <div class="mod-region-radio"></div>
                  </div>
                  <div class="mod-region-name">США (USA)</div>
                  <div class="mod-region-hint">Американский каталог и оригинальные подкасты</div>
                </div>

                <!-- Польша -->
                <div class="mod-region-card" data-country="PL">
                  <div class="mod-region-card-top">
                    <span class="mod-region-code">PL</span>
                    <div class="mod-region-radio"></div>
                  </div>
                  <div class="mod-region-name">Польша</div>
                  <div class="mod-region-hint">Ближайший европейский регион</div>
                </div>

                <!-- Великобритания -->
                <div class="mod-region-card" data-country="GB">
                  <div class="mod-region-card-top">
                    <span class="mod-region-code">GB</span>
                    <div class="mod-region-radio"></div>
                  </div>
                  <div class="mod-region-name">Великобритания</div>
                  <div class="mod-region-hint">Британский каталог и ранние премьеры</div>
                </div>
              </div>
            </div>

            <!-- Пошаговое руководство для пользователя -->
            <div class="mod-card" style="background: rgba(255, 255, 255, 0.02);">
              <div class="mod-card-title">Как настроить профиль раз и навсегда:</div>
              <div class="mod-steps-list">
                <div class="mod-step-item">
                  <div class="mod-step-num">1</div>
                  <div class="mod-step-text">
                    Откройте настройки вашего профиля на официальном сайте Spotify:
                    <div style="margin-top: 6px;">
                      <button class="mod-btn mod-btn-secondary" id="mod-open-spotify-profile-action" style="font-size: 11px; padding: 4px 12px;">
                        Открыть профиль Spotify в браузере ↗
                      </button>
                    </div>
                  </div>
                </div>

                <div class="mod-step-item">
                  <div class="mod-step-num">2</div>
                  <div class="mod-step-text">
                    В графе <strong>«Страна или регион»</strong> выберите <strong>Нидерланды</strong> (или Германию) и нажмите «Сохранить профиль».
                  </div>
                </div>

                <div class="mod-step-item">
                  <div class="mod-step-num">3</div>
                  <div class="mod-step-text">
                    При необходимости вы можете нажать кнопку ниже для мгновенной проверки соединения. В штатном режиме всё продлевается автоматически в фоне.
                  </div>
                </div>
              </div>

                <div style="margin-top: 12px; display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.06);">
                  <span style="font-size: 12px; color: #b3b3b3;">Фоновая авто-проверка сессии (каждые 12 дней)</span>
                  <label class="mod-switch">
                    <input type="checkbox" id="mod-toggle-autobypass" checked>
                    <span class="mod-switch-slider"></span>
                  </label>
                </div>
              </div>

          </div>

          <!-- ========================================== -->
          <!-- 2. ВКЛАДКА: ОФЛАЙН-ЗАГРУЗКИ -->
          <!-- ========================================== -->
          <div class="mod-tab-content" id="mod-tab-downloads">
            <!-- Директория загрузок -->
            <div class="mod-card">
              <div class="mod-card-header">
                <div class="mod-card-title">Папка для офлайн-музыки:</div>
                <button class="mod-btn mod-btn-secondary" id="mod-open-folder-btn" style="font-size: 11px; padding: 4px 10px;">
                  Открыть в Проводнике
                </button>
              </div>
              <div class="mod-card-desc">Сюда сохраняются треки с нумерацией 001, 002... и плейлистами .m3u8:</div>
              
              <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
                <input type="text" id="mod-path-input" class="mod-input" style="flex: 1; font-family: Consolas, monospace; font-size: 11.5px;" value="C:\\Users\\sigma\\Music\\Spotify Downloads">
                <button class="mod-btn mod-btn-secondary" id="mod-browse-folder-btn" style="white-space: nowrap;">
                  Обзор...
                </button>
                <button class="mod-btn mod-btn-primary" id="mod-save-path-btn" style="white-space: nowrap;">
                  Сохранить
                </button>
              </div>
            </div>

            <!-- Как слушать офлайн -->
            <div class="mod-callout">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#1ed760">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <div>
                <strong>Как слушать офлайн внутри Spotify:</strong><br/>
                • <strong>В плейлисте</strong>: нажмите на зеленую кнопку со стрелкой — откроется меню со ссылкой <strong>«Воспроизвести офлайн»</strong>.<br/>
                • <strong>В медиатеке</strong>: все скачанные треки автоматически доступны в левом меню в разделе <strong>«Локальные файлы» (Local Files)</strong> с нативным плеером и перемешиванием.
              </div>
            </div>

            <!-- Очередь и статус -->
            <div class="mod-card">
              <div class="mod-card-header">
                <div class="mod-card-title">Очередь и активные загрузки</div>
                <div id="mod-modal-queue-actions" style="display: none; gap: 6px;">
                  <button class="mod-btn mod-btn-secondary" id="mod-modal-pause-btn" style="padding: 4px 10px; font-size: 11px;">Пауза</button>
                  <button class="mod-btn mod-btn-danger" id="mod-modal-stop-btn" style="padding: 4px 10px; font-size: 11px;">Остановить</button>
                </div>
              </div>
              <div id="mod-downloads-summary" style="font-size: 13px; color: #1ed760; font-weight: 500; line-height: 1.5;">
                Проверка статуса Companion...
              </div>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- 3. ВКЛАДКА: ПРОКСИ И СЕТЬ -->
          <!-- ========================================== -->
          <div class="mod-tab-content" id="mod-tab-proxy">
            <div class="mod-callout">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#1ed760">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <div style="font-size: 12px; line-height: 1.5;">
                <strong>Разделение задач в моде:</strong><br/>
                • <strong>Для скачивания музыки</strong>: используется локальный Xray (10808) — максимальная скорость до 100+ Мбит/с без ограничений YouTube.<br/>
                • <strong>Для обхода проверки Spotify</strong>: используется прокси региона из первой вкладки.
              </div>
            </div>

            <!-- Фильтр категорий (Encore Pills) -->
            <div class="mod-card" style="padding: 10px 14px;">
              <div style="font-size: 12px; font-weight: 600; color: #a7a7a7; margin-bottom: 6px;">Категории узлов:</div>
              <div class="mod-country-filters">
                <button class="mod-country-filter-btn active" data-category="all">Все узлы</button>
                <button class="mod-country-filter-btn" data-category="download">Для скачивания (Локальный Xray / РФ)</button>
                <button class="mod-country-filter-btn" data-category="spotify">Для Spotify (NL / DE / US)</button>
              </div>
            </div>

            <!-- Список серверов -->
            <div class="mod-card">
              <div class="mod-card-header">
                <div class="mod-card-title">Список прокси-серверов:</div>
                <div id="mod-active-proxy-badge" style="font-size: 11px; color: #1ed760; font-weight: 600;"></div>
              </div>
              <div id="mod-presets-container" style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;"></div>
            </div>

            <!-- Ручной ввод прокси -->
            <div class="mod-card">
              <div class="mod-card-title">Пользовательский прокси (SOCKS5 / HTTP):</div>
              <div class="mod-card-desc">Введите свой адрес (например: socks5://127.0.0.1:10808)</div>
              
              <div style="display: flex; gap: 8px; margin-top: 6px;">
                <input type="text" id="mod-proxy-input" class="mod-input" placeholder="socks5://127.0.0.1:10808">
                <button class="mod-btn mod-btn-secondary" id="mod-proxy-test-btn" style="white-space: nowrap;">
                  Проверить
                </button>
                <button class="mod-btn mod-btn-primary" id="mod-proxy-save-btn" style="white-space: nowrap;">
                  Сохранить
                </button>
              </div>
              <div id="mod-proxy-test-result" style="margin-top: 8px; display: none;"></div>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- 4. ВКЛАДКА: ФУНКЦИИ МОДА -->
          <!-- ========================================== -->
          <div class="mod-tab-content" id="mod-tab-features">
            <div class="mod-card">
              <div class="mod-card-title">Активные функции мода</div>
              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
                <!-- 1. Блокировка аудиорекламы -->
                <div class="mod-setting-item">
                  <div class="mod-setting-info">
                    <div class="mod-setting-name">Блокировка аудиорекламы</div>
                    <div class="mod-setting-desc">Моментально глушит звук и перематывает рекламные паузы</div>
                  </div>
                  <label class="mod-switch">
                    <input type="checkbox" id="mod-toggle-adblock" checked>
                    <span class="mod-switch-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Служба Companion -->
            <div class="mod-card">
              <div class="mod-card-title">Локальная служба Companion</div>
              <div class="mod-card-desc" id="mod-about-companion-desc">
                Фоновый процесс обеспечивает скачивание через yt-dlp и ротацию региона.
              </div>
            </div>
          </div>

        </div>

        <!-- Подвал -->
        <div class="mod-modal-footer">
          <div class="mod-modal-status-badge">
            <div class="mod-status-indicator" id="mod-footer-indicator"></div>
            <span id="mod-companion-status-text">Companion подключен</span>
          </div>
          <div class="mod-modal-hotkey-hint">spmod • Ctrl + Shift + M</div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.modalEl = overlay;

    overlay.querySelector('#mod-modal-close').addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    const tabBtns = overlay.querySelectorAll('.mod-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    const regionCards = overlay.querySelectorAll('.mod-region-card');
    regionCards.forEach(card => {
      card.addEventListener('click', async () => {
        const country = card.getAttribute('data-country');
        regionCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.detectedCountry = country;
        try { localStorage.setItem('mod:selected_country', country); } catch (e) {}
        this.updateRegionTab();

        try {
          await fetch('http://127.0.0.1:43821/set-account-region', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country })
          });
          this.showToast(`Регион аккаунта установлен: ${country}`);
          this.updateRegionTab();
        } catch (e) {
          this.showToast(`Регион установлен: ${country}`);
        }
      });
    });

    overlay.querySelector('#mod-open-spotify-profile-action').addEventListener('click', () => {
      window.open('https://www.spotify.com/account/profile', '_blank');
    });

    const triggerBypassBtn = overlay.querySelector('#mod-trigger-bypass-btn');
    const bypassResultEl = overlay.querySelector('#mod-bypass-action-result');
    triggerBypassBtn.addEventListener('click', async () => {
      triggerBypassBtn.disabled = true;
      triggerBypassBtn.classList.add('loading');
      triggerBypassBtn.innerHTML = `<span>Проверка подключения к региону...</span>`;
      bypassResultEl.style.display = 'block';
      bypassResultEl.style.color = '#b3b3b3';
      bypassResultEl.textContent = 'Подключение к зарубежному узлу...';

      try {
        const res = await fetch('http://127.0.0.1:43821/trigger-region-bypass', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          bypassResultEl.style.color = '#1ed760';
          bypassResultEl.textContent = `Подключение подтверждено (${data.latencyMs} мс). Доступ активен на 14 дней, фоновое расписание обновлено.`;
          this.showToast('Регион успешно подтвержден (14 дней)');
          this.updateRegionTab();
        } else {
          bypassResultEl.style.color = '#f15e6c';
          bypassResultEl.textContent = `Ошибка: ${data.error || 'Не удалось связаться с сервером'}`;
          this.showToast('Ошибка подтверждения региона');
        }
      } catch (err) {
        bypassResultEl.style.color = '#f15e6c';
        bypassResultEl.textContent = 'Companion не отвечает на порту 43821';
      } finally {
        triggerBypassBtn.disabled = false;
        triggerBypassBtn.classList.remove('loading');
        triggerBypassBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>Подтвердить регион сейчас</span>
        `;
      }
    });

    const autoBypassToggle = overlay.querySelector('#mod-toggle-autobypass');
    autoBypassToggle.addEventListener('change', async () => {
      try {
        await fetch('http://127.0.0.1:43821/set-account-region', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ autoBypass: autoBypassToggle.checked })
        });
        this.showToast(`Авто-обход: ${autoBypassToggle.checked ? 'Включен' : 'Отключен'}`);
      } catch (e) {}
    });

    const openFolderBtn = overlay.querySelector('#mod-open-folder-btn');
    openFolderBtn.addEventListener('click', async () => {
      const dirVal = (overlay.querySelector('#mod-path-input')?.value || '').trim();
      openFolderBtn.disabled = true;
      try {
        const res = await fetch('http://127.0.0.1:43821/open-folder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dir: dirVal })
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data && data.success) {
            this.showToast('Папка музыки открыта в Проводнике');
          } else {
            this.showToast('Не удалось открыть папку в Проводнике');
          }
        } else {
          this.showToast('Не удалось открыть папку в Проводнике');
        }
      } catch (err) {
        this.showToast('Ошибка связи с Companion (порт 43821)');
      } finally {
        openFolderBtn.disabled = false;
      }
    });

    const browseBtn = overlay.querySelector('#mod-browse-folder-btn');
    const pathInput = overlay.querySelector('#mod-path-input');
    const savePathBtn = overlay.querySelector('#mod-save-path-btn');

    browseBtn.addEventListener('click', async () => {
      browseBtn.disabled = true;
      browseBtn.textContent = 'Выбор...';
      try {
        const res = await fetch('http://127.0.0.1:43821/select-folder', { method: 'POST' });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data && data.success && data.downloadDir) {
            pathInput.value = data.downloadDir;
            this.showToast('Папка сохранена: ' + data.downloadDir);
          }
        }
      } catch (e) {
        this.showToast('Ошибка вызова диалога Windows');
      } finally {
        browseBtn.disabled = false;
        browseBtn.textContent = 'Обзор...';
      }
    });

    savePathBtn.addEventListener('click', async () => {
      const dir = pathInput.value.trim();
      if (!dir) return;
      try {
        const res = await fetch('http://127.0.0.1:43821/set-download-dir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dir })
        });
        const data = await res.json();
        if (data.success) {
          this.showToast('Папка сохранена');
        }
      } catch (e) {
        this.showToast('Ошибка сохранения пути');
      }
    });

    const pauseBtn = overlay.querySelector('#mod-modal-pause-btn');
    const stopBtn = overlay.querySelector('#mod-modal-stop-btn');

    pauseBtn.addEventListener('click', async () => {
      const isCurrentlyPaused = pauseBtn.textContent.includes('Продолжить');
      const endpoint = isCurrentlyPaused ? '/resume-download' : '/pause-download';
      try {
        const res = await fetch(`http://127.0.0.1:43821${endpoint}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          this.showToast(isCurrentlyPaused ? 'Скачивание возобновлено' : 'Скачивание на паузе');
          this.updateDownloadsTab();
        }
      } catch (e) {
        this.showToast('Ошибка связи с Companion');
      }
    });

    stopBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('http://127.0.0.1:43821/stop-download', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          this.showToast('Очередь загрузок остановлена');
          this.updateDownloadsTab();
        }
      } catch (e) {
        this.showToast('Ошибка связи с Companion');
      }
    });

    const categoryBtns = overlay.querySelectorAll('.mod-country-filter-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.getAttribute('data-category');
        const proxyInput = overlay.querySelector('#mod-proxy-input');
        this.renderPresets(this.cachedPresets || this.defaultPresets, proxyInput ? proxyInput.value : '');
        this.updateProxyTab();
      });
    });

    const proxyInput = overlay.querySelector('#mod-proxy-input');
    const proxyTestBtn = overlay.querySelector('#mod-proxy-test-btn');
    const proxySaveBtn = overlay.querySelector('#mod-proxy-save-btn');
    const testResultEl = overlay.querySelector('#mod-proxy-test-result');

    proxyTestBtn.addEventListener('click', async () => {
      const urlVal = proxyInput.value.trim();
      if (!urlVal) {
        this.showToast('Введите адрес прокси перед проверкой');
        return;
      }

      testResultEl.style.display = 'block';
      testResultEl.className = 'mod-proxy-badge testing';
      testResultEl.innerHTML = `Проверка подключения...`;

      try {
        const res = await fetch('http://127.0.0.1:43821/test-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proxyUrl: urlVal })
        });
        const data = await res.json();

        if (data.ok) {
          testResultEl.className = 'mod-proxy-badge success';
          testResultEl.innerHTML = `Прокси работает! Задержка: ${data.latencyMs} ms`;
          this.showToast(`Прокси доступен (${data.latencyMs} ms)`);
        } else {
          testResultEl.className = 'mod-proxy-badge error';
          testResultEl.innerHTML = `Ошибка: ${data.error || 'Нет ответа'}`;
          this.showToast('Ошибка соединения с прокси');
        }
      } catch (e) {
        testResultEl.className = 'mod-proxy-badge error';
        testResultEl.innerHTML = `Companion не отвечает`;
      }
    });

    proxySaveBtn.addEventListener('click', async () => {
      const urlVal = proxyInput.value.trim();
      try {
        const res = await fetch('http://127.0.0.1:43821/proxy-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proxyUrl: urlVal, enabled: Boolean(urlVal) })
        });
        const data = await res.json();
        if (data.success) {
          proxySaveBtn.innerHTML = `Сохранено`;
          this.showToast('Настройки прокси сохранены');
          this.updateProxyTab();
          setTimeout(() => {
            proxySaveBtn.innerHTML = `Сохранить`;
          }, 2000);
        }
      } catch (e) {
        this.showToast('Ошибка: Companion не отвечает');
      }
    });

    const adblockToggle = overlay.querySelector('#mod-toggle-adblock');
    if (adblockToggle && window.__MOD__ && window.__MOD__.registry) {
      adblockToggle.checked = window.__MOD__.registry.isPluginEnabled('adblock', true);
      adblockToggle.addEventListener('change', () => {
        window.__MOD__.registry.setPluginEnabled('adblock', adblockToggle.checked);
        this.showToast(`Аудио-Adblock: ${adblockToggle.checked ? 'Включен' : 'Отключен'}`);
      });
    }

    this.renderPresets(this.defaultPresets);
  },

  renderPresets(presets, currentUrl = '', activePresetId = '') {
    const container = document.getElementById('mod-presets-container');
    const proxyInput = document.getElementById('mod-proxy-input');
    const activeBadge = document.getElementById('mod-active-proxy-badge');
    if (!container) return;

    let filtered = presets;
    if (this.activeCategory !== 'all') {
      filtered = presets.filter(p => p.category === this.activeCategory);
    }

    container.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 24px 16px; text-align: center; color: #b3b3b3; font-size: 13px;">
          Нет доступных узлов в выбранной категории.
        </div>
      `;
      return;
    }

    let hasActive = false;
    filtered.forEach(p => {
      let isActive = false;
      if (activePresetId) {
        isActive = (p.id === activePresetId);
      } else if (currentUrl && !hasActive) {
        isActive = (currentUrl === p.url);
      }
      if (isActive) hasActive = true;

      const item = document.createElement('div');
      item.className = `mod-preset-item ${isActive ? 'active' : ''}`;

      item.innerHTML = `
        <div class="mod-preset-info">
          <div class="mod-preset-header">
            <span class="mod-preset-name">${p.name}</span>
            ${p.isDetected ? '<span class="mod-pill-badge" style="background: rgba(30,215,96,0.12); color: #1ed760; border: 1px solid rgba(30,215,96,0.25);"><span class="mod-status-dot"></span>Обнаружен на ПК</span>' : (p.isLocal ? '<span class="mod-pill-badge" style="background: rgba(30,215,96,0.12); color: #1ed760;">Для скачивания</span>' : '')}
            ${p.category === 'spotify' ? '<span class="mod-pill-badge" style="background: rgba(255,255,255,0.08); color: #fff;">Для обхода 14 дней</span>' : ''}
          </div>
          <div class="mod-preset-desc">${p.description}</div>
          <div class="mod-preset-url">${p.url}</div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
          <button class="mod-btn mod-btn-secondary mod-preset-ping-btn" style="padding: 5px 12px; font-size: 11px; font-weight: 600; white-space: nowrap;">
            Проверить
          </button>
          <button class="mod-btn mod-preset-select-btn ${isActive ? 'mod-btn-primary' : 'mod-btn-secondary'}" style="padding: 5px 14px; font-size: 11px; min-width: 76px;">
            ${isActive ? 'Активен' : 'Выбрать'}
          </button>
        </div>
      `;

      const pingBtn = item.querySelector('.mod-preset-ping-btn');
      pingBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        pingBtn.disabled = true;
        pingBtn.textContent = 'Проверка...';
        try {
          const res = await fetch('http://127.0.0.1:43821/test-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proxyUrl: p.url })
          });
          const d = await res.json();
          if (d.ok) {
            pingBtn.style.color = '#1ed760';
            pingBtn.innerHTML = `<span class="mod-status-dot"></span>${d.latencyMs} мс`;
          } else {
            pingBtn.style.color = '#f15e6c';
            pingBtn.innerHTML = `<span class="mod-status-dot mod-status-dot--error"></span>Не отвечает`;
          }
        } catch (_) {
          pingBtn.style.color = '#f15e6c';
          pingBtn.innerHTML = `<span class="mod-status-dot mod-status-dot--error"></span>Офлайн`;
        } finally {
          pingBtn.disabled = false;
        }
      });

      const selectBtn = item.querySelector('.mod-preset-select-btn');
      selectBtn.addEventListener('click', async () => {
        if (proxyInput) proxyInput.value = p.url;
        try {
          const res = await fetch('http://127.0.0.1:43821/proxy-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proxyUrl: p.url, enabled: true, activePreset: p.id })
          });
          const data = await res.json();
          if (data.success) {
            this.showToast(`Выбран узел: ${p.name}`);
            this.cachedActivePreset = p.id;
            this.updateProxyTab();
          }
        } catch (e) {
          this.showToast('Ошибка сохранения');
        }
      });

      container.appendChild(item);
    });

    if (activeBadge) {
      activeBadge.textContent = currentUrl ? `Активен: ${currentUrl}` : 'Без прокси (напрямую)';
    }
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    if (!this.modalEl) return;

    const tabBtns = this.modalEl.querySelectorAll('.mod-tab-btn');
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const tabContents = this.modalEl.querySelectorAll('.mod-tab-content');
    tabContents.forEach(content => {
      if (content.id === `mod-tab-${tabId}`) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    if (tabId === 'region') this.updateRegionTab();
    if (tabId === 'downloads') this.updateDownloadsTab();
    if (tabId === 'proxy') this.updateProxyTab();
    if (tabId === 'features') this.updateFeaturesTab();
  },

  updateRegionTab() {
    fetch('http://127.0.0.1:43821/region-bypass-status')
      .then(r => r.json())
      .then(info => {
        if (!info) return;

        const titleEl = document.getElementById('mod-bypass-title');
        const descEl = document.getElementById('mod-bypass-desc');
        const daysBadge = document.getElementById('mod-bypass-days-badge');
        const nextCheckEl = document.getElementById('mod-bypass-next-check');
        const autoBadge = document.getElementById('mod-auto-detected-badge');
        const autoToggle = document.getElementById('mod-toggle-autobypass');

        const countryNames = {
          LV: 'Латвия',
          NL: 'Нидерланды',
          DE: 'Германия',
          GB: 'Великобритания',
          FR: 'Франция',
          SE: 'Швеция',
          ES: 'Испания',
          IT: 'Италия',
          PL: 'Польша',
          US: 'США'
        };
        const savedCountry = (() => {
          try { return localStorage.getItem('mod:selected_country'); } catch (e) { return null; }
        })();
        const activeCountry = this.detectedCountry || savedCountry || info.accountCountry || 'NL';
        const cName = countryNames[activeCountry] || activeCountry;

        if (titleEl) {
          titleEl.textContent = `Регион аккаунта: ${cName} (${activeCountry}) • Обход активен`;
        }
        if (descEl) {
          descEl.textContent = `Spotify корректно распознаёт страну вашего профиля (${cName}). Автоматическая проверка тихо работает в фоновом режиме каждые 12 дней — никаких действий с вашей стороны не требуется.`;
        }
        if (daysBadge) {
          daysBadge.textContent = 'Активен • Фоновая защита 14 дней';
          daysBadge.style.color = '#1ed760';
          daysBadge.style.background = 'rgba(30, 215, 96, 0.12)';
          daysBadge.style.borderColor = 'rgba(30, 215, 96, 0.25)';
        }
        if (nextCheckEl) {
          nextCheckEl.textContent = info.autoBypass !== false
            ? 'Фоновая синхронизация активна (каждые 12 дней) • Ручное продление не требуется'
            : 'Автообход выключен. Включите автообход в настройках ниже';
        }
        if (autoBadge) {
          autoBadge.style.display = 'inline-block';
          autoBadge.textContent = `Аккаунт: ${cName} (${activeCountry})`;
        }

        const syncBtn = document.getElementById('mod-btn-sync-now');
        if (syncBtn && !syncBtn._bound) {
          syncBtn._bound = true;
          syncBtn.addEventListener('click', async () => {
            syncBtn.disabled = true;
            syncBtn.textContent = 'Проверка...';
            try {
              const res = await fetch('http://127.0.0.1:43821/trigger-region-bypass', { method: 'POST' });
              const data = await res.json();
              this.showToast(data.message || 'Сессия 14 дней успешно подтверждена!');
              this.updateRegionTab();
            } catch (e) {
              this.showToast('Ошибка связи со службой Companion', true);
            } finally {
              syncBtn.disabled = false;
              syncBtn.textContent = 'Обновить сейчас';
            }
          });
        }

        if (this.detectedCountry && autoBadge) {
          autoBadge.style.display = 'inline-block';
          autoBadge.textContent = `Определено: ${this.detectedCountry}`;
        }

        if (autoToggle) autoToggle.checked = info.autoBypass;

        const cards = document.querySelectorAll('.mod-region-card');
        cards.forEach(c => {
          if (c.getAttribute('data-country') === info.accountCountry) {
            c.classList.add('active');
          } else {
            c.classList.remove('active');
          }
        });
      }).catch(() => {});
  },

  updateDownloadsTab() {
    const pathInput = document.getElementById('mod-path-input');

    fetch('http://127.0.0.1:43821/downloads')
      .then(r => r.json())
      .then(data => {
        if (!data) return;

        if (data.downloadDir && pathInput) {
          pathInput.value = data.downloadDir;
        }

        const summary = document.getElementById('mod-downloads-summary');
        const queueActions = document.getElementById('mod-modal-queue-actions');
        const pauseBtn = document.getElementById('mod-modal-pause-btn');

        const job = data.activeJob;
        const qCount = data.queueLength || 0;

        if (job && job.activePlaylist) {
          const p = job.activePlaylist;
          const isPaused = p.status === 'paused';

          if (queueActions) queueActions.style.display = 'flex';
          if (pauseBtn) pauseBtn.textContent = isPaused ? 'Продолжить' : 'Пауза';

          if (summary) {
            const stageDesc = job.activeItem ? (
              job.activeItem.stage === 'searching' ? 'Поиск трека на YouTube...' :
              job.activeItem.stage === 'extracting' ? 'Решение защиты YouTube...' :
              job.activeItem.progress ? `Загрузка: ${job.activeItem.progress}%` : 'Обработка аудио...'
            ) : '';

            summary.innerHTML = `
              <strong>${isPaused ? 'Скачивание на паузе' : 'Идет загрузка'}:</strong> «${p.name}»<br/>
              Скачано: <strong>${p.completed} из ${p.total}</strong> (${p.percent}%) • В очереди: ${qCount} треков
              ${job.activeItem ? `<div style="font-size: 11px; color: #888; margin-top: 3px;">Текущий трек: ${job.activeItem.artist} - ${job.activeItem.title} (${stageDesc})</div>` : ''}
            `;
            summary.style.color = isPaused ? '#fce83a' : '#1ed760';
          }
        } else {
          if (queueActions) queueActions.style.display = 'none';

          if (summary) {
            const completedPlaylists = (data.playlists || []).filter(p => p.completed > 0);
            if (completedPlaylists.length > 0) {
              summary.textContent = `Загрузок в очереди нет. Всего сохранено плейлистов: ${completedPlaylists.length}. Все файлы на диске.`;
              summary.style.color = '#1ed760';
            } else {
              summary.textContent = 'Очередь пуста. Плейлисты еще не скачивались. Нажмите «Скачать» у любого плейлиста.';
              summary.style.color = '#a7a7a7';
            }
          }
        }
      }).catch(() => {
        const summary = document.getElementById('mod-downloads-summary');
        if (summary) {
          summary.textContent = 'Служба Companion отключена. Запустите companion/start.ps1';
          summary.style.color = '#f15e6c';
        }
      });
  },

  updateProxyTab() {
    const proxyInput = document.getElementById('mod-proxy-input');

    fetch('http://127.0.0.1:43821/proxy-presets')
      .then(r => r.json())
      .then(data => {
        if (!data) return;

        const currentUrl = (data.current && data.current.proxyUrl) ? data.current.proxyUrl : '';
        const activePreset = (data.current && data.current.activePreset) ? data.current.activePreset : '';
        this.cachedActivePreset = activePreset;
        if (currentUrl && proxyInput) {
          proxyInput.value = currentUrl;
        }

        const presetsToRender = (data.presets && data.presets.length > 0) ? data.presets : this.defaultPresets;
        this.cachedPresets = presetsToRender;
        this.renderPresets(presetsToRender, currentUrl, activePreset);
      }).catch(() => {
        this.renderPresets(this.defaultPresets, proxyInput ? proxyInput.value : '', this.cachedActivePreset || '');
      });
  },

  updateFeaturesTab() {
    const desc = document.getElementById('mod-about-companion-desc');
    if (!desc) return;

    fetch('http://127.0.0.1:43821/ping')
      .then(r => r.json())
      .then(d => {
        desc.innerHTML = `Служба активна: <strong>порт ${d.port}</strong> (версия ${d.version})<br/>Папка: ${d.downloadDir}`;
        desc.style.color = '#1ed760';
      })
      .catch(() => {
        desc.innerHTML = `Служба не отвечает на порту 43821. Запустите companion/start.ps1.`;
        desc.style.color = '#e91429';
      });
  },

  updateFooterStatus() {
    const footerIndicator = document.getElementById('mod-footer-indicator');
    const footerText = document.getElementById('mod-companion-status-text');
    if (!footerIndicator || !footerText) return;

    fetch('http://127.0.0.1:43821/ping')
      .then(r => r.json())
      .then(d => {
        footerIndicator.style.backgroundColor = '#1ed760';
        footerIndicator.style.boxShadow = '0 0 8px rgba(30, 215, 96, 0.6)';
        footerText.textContent = 'Companion подключен';
        footerText.style.color = '#ffffff';
        const bypassResultEl = document.getElementById('mod-bypass-action-result');
        if (bypassResultEl && bypassResultEl.textContent.includes('Companion не отвечает')) {
          bypassResultEl.style.display = 'none';
        }
        const downloadsSummary = document.getElementById('mod-downloads-summary');
        if (downloadsSummary && downloadsSummary.textContent.includes('Служба Companion отключена')) {
          this.updateDownloadsTab();
        }
      })
      .catch(() => {
        footerIndicator.style.backgroundColor = '#e91429';
        footerIndicator.style.boxShadow = 'none';
        footerText.textContent = 'Companion: не запущен';
        footerText.style.color = '#e91429';
      });
  },

  open() {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
    if (!this.modalEl) this.createModal();
    this.modalEl.classList.remove('closing');
    this.switchTab(this.activeTab);
    this.updateFooterStatus();
    this.modalEl.style.display = 'flex';
    if (this.buttonEl) this.buttonEl.classList.add('active');
  },

  close() {
    if (!this.modalEl || this.modalEl.style.display === 'none' || this.modalEl.classList.contains('closing')) return;
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
    this.modalEl.classList.add('closing');
    this.closeTimeout = setTimeout(() => {
      if (this.modalEl) {
        this.modalEl.style.display = 'none';
        this.modalEl.classList.remove('closing');
      }
      if (this.buttonEl) this.buttonEl.classList.remove('active');
      this.closeTimeout = null;
    }, 150);
  },

  toggle() {
    if (!this.modalEl || this.modalEl.style.display === 'none' || this.modalEl.classList.contains('closing')) {
      this.open();
    } else {
      this.close();
    }
  },

  showToast(message) {
    let toast = document.getElementById('mod-toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'mod-toast-notification';
      toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #242424;
        color: #fff;
        padding: 9px 20px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        border: 1px solid rgba(255,255,255,0.1);
        z-index: 1000000;
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 2800);
  },

  injectTopBarButton() {
    const self = this;

    function tryInject() {
      
      const strayLeft = document.querySelectorAll(
        '.main-topBar-historyButtons button[id*="mod"], .main-topBar-historyButtons [class*="mod-topbar"], .main-topBar-left button[id*="mod"], .main-topBar-left [class*="mod-topbar"], .main-topBar-historyButtons #mod-topbar-btn, .main-topBar-historyButtons #mod-topbar-settings-btn'
      );
      strayLeft.forEach(b => b.remove());

      const oldSettingsBtn = document.getElementById('mod-topbar-settings-btn');
      if (oldSettingsBtn) oldSettingsBtn.remove();

      const existingBtn = document.getElementById('mod-topbar-btn');
      if (existingBtn) {
        if (existingBtn.closest('.main-topBar-historyButtons, .main-topBar-left, [class*="historyButtons"]')) {
          existingBtn.remove();
        } else {
          return;
        }
      }

      const userWidget = document.querySelector('[data-testid="user-widget-link"]') ||
                         document.querySelector('[data-testid="username-button"]') ||
                         document.querySelector('.main-userWidget-box') ||
                         document.querySelector('button[aria-label*="siggma"]') ||
                         document.querySelector('button[data-testid*="user"]') ||
                         document.querySelector('header button[data-testid*="user"]') ||
                         document.querySelector('[data-testid="profile-menu-button"]');

      const topBarRight = document.querySelector('header [data-testid="topbar"] > div:last-child') ||
                          document.querySelector('header [class*="actionButtons"]') ||
                          document.querySelector('.main-topBar-actionButtons') ||
                          document.querySelector('header > div:last-child');

      if (!userWidget && !topBarRight) return;

      const btn = document.createElement('button');
      btn.id = 'mod-topbar-btn';
      btn.className = 'mod-topbar-button';
      btn.title = 'Настройки spmod (Ctrl + Shift + M)';
      btn.setAttribute('aria-label', 'Настройки spmod');

      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>
      `;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        btn.classList.add('spinning');
        setTimeout(() => btn.classList.remove('spinning'), 650);

        self.toggle();
      });

      if (userWidget && userWidget.parentElement) {
        userWidget.parentElement.insertBefore(btn, userWidget);
      } else if (topBarRight) {
        topBarRight.insertBefore(btn, topBarRight.firstChild);
      }

      self.buttonEl = btn;
    }

    tryInject();
    this.topBarObserver = new MutationObserver(tryInject);
    this.topBarObserver.observe(document.body, { childList: true, subtree: true });
  },

  bindKeyboardShortcuts() {
    if (this._keyHandler) {
      window.removeEventListener('keydown', this._keyHandler);
    }
    this._keyHandler = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'M' || e.key === 'm' || e.key === 'Ь' || e.key === 'ь')) {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && this.modalEl && this.modalEl.style.display !== 'none' && !this.modalEl.classList.contains('closing')) {
        this.close();
      }
    };
    window.addEventListener('keydown', this._keyHandler);
  }
};
