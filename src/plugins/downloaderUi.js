
export const downloaderUiPlugin = {
  id: 'downloader-ui',
  name: 'Офлайн скачивание плейлистов и треков',
  description: 'Скачивание плейлистов в высоком качестве, пауза, удаление и офлайн-воспроизведение',
  defaultEnabled: true,

  observer: null,
  tooltipKillerObserver: null,
  activeDownloads: new Map(),
  inFlightDownloads: new Set(),
  syncTimer: null,
  menuEl: null,

  offlinePlayer: {
    audio: new Audio(),
    playlist: null,
    tracks: [],
    currentIndex: 0,
    isPlaying: false
  },

  init() {
    console.log('[Mod:DownloaderUI] Initializing Playlist Downloader...');
    this.injectPlayerButton();
    this.bindPlaylistDownloadInterceptor();
    this.initTooltipKiller();
    this.startPlaylistSync();
    this.initOfflineAudioEngine();
  },

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.tooltipKillerObserver) {
      this.tooltipKillerObserver.disconnect();
      this.tooltipKillerObserver = null;
    }
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    this.closeContextMenu();
    const playerBtn = document.getElementById('mod-player-download-btn');
    if (playerBtn) playerBtn.remove();
    this.cleanupActionBarControls();
  },

  initTooltipKiller() {
    const killTooltips = () => {
      const tooltips = document.querySelectorAll(
        '[data-tippy-root], div[data-theme*="blue"], div[class*="upsellTooltip"], div[role="tooltip"]'
      );
      tooltips.forEach(el => {
        if (
          el.getAttribute('role') === 'menu' ||
          el.querySelector('[role="menu"]') ||
          el.querySelector('ul[role="menu"]') ||
          el.closest('[role="menu"]') ||
          el.id === 'mod-encore-download-menu'
        ) {
          return;
        }

        const text = (el.textContent || '').toLowerCase();
        if (
          (text.includes('premium') || text.includes('скачиван') || text.includes('подпишись')) &&
          !el.querySelector('button[role="menuitem"]') &&
          !el.querySelector('a[role="menuitem"]')
        ) {
          el.style.display = 'none';
          el.remove();
        }
      });
    };

    killTooltips();
    this.tooltipKillerObserver = new MutationObserver(killTooltips);
    this.tooltipKillerObserver.observe(document.body, { childList: true, subtree: true });
  },

  bindPlaylistDownloadInterceptor() {
    const self = this;
    const handledEvents = [
      'click', 'dblclick', 'mousedown', 'mouseup',
      'pointerdown', 'pointerup', 'focusin', 'mouseenter', 'mouseover'
    ];

    handledEvents.forEach(evtName => {
      document.addEventListener(evtName, async (e) => {
        const downloadBtn = e.target.closest(
          'button[aria-label*="Скачать"], button[aria-label*="Download"], button[data-testid*="download"]'
        );

        if (!downloadBtn || downloadBtn.closest('#mod-settings-modal') || downloadBtn.id === 'mod-topbar-btn') {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (evtName !== 'click') return;

        const playlistName = self.getCurrentPlaylistName();
        if (!playlistName) return;

        if (self.inFlightDownloads.has(playlistName)) {
          self.showToast(`Плейлист «${playlistName}» уже обрабатывается`);
          return;
        }

        const status = self.activeDownloads.get(playlistName);
        if (status && status.status === 'completed') {
          self.openContextMenu(downloadBtn, playlistName);
          return;
        }

        if (status && (status.status === 'downloading' || status.status === 'paused')) {
          self.showToast(`Плейлист «${playlistName}» уже загружается: ${status.completed} из ${status.total}`);
          return;
        }

        await self.handlePlaylistDownload(downloadBtn, playlistName);
      }, true);
    });

    document.addEventListener('click', (e) => {
      if (this.menuEl && !this.menuEl.contains(e.target)) {
        this.closeContextMenu();
      }
    });
  },

  startPlaylistSync() {
    const self = this;

    const syncCurrentView = async () => {
      const playlistName = self.getCurrentPlaylistName();
      if (!playlistName) {
        self.cleanupActionBarControls();
        return;
      }

      const downloadBtn = document.querySelector(
        'button[aria-label*="Скачать"], button[aria-label*="Download"], button[data-testid*="download"]'
      );
      if (!downloadBtn || downloadBtn.closest('#mod-settings-modal') || downloadBtn.id === 'mod-topbar-btn') {
        return;
      }

      try {
        const res = await fetch(`http://127.0.0.1:43821/playlist-status?name=${encodeURIComponent(playlistName)}`);
        const data = await res.json();

        if (data && data.status) {
          const st = data.status;
          self.activeDownloads.set(playlistName, st);

          if (st.status === 'completed' || (st.total > 0 && st.completed >= st.total)) {
            self.setButtonState(downloadBtn, 'downloaded', `Скачан (${st.total} треков) • Нажмите для опций`);
            self.cleanupActionBarControls();
          } else if (st.status === 'downloading') {
            const percent = st.total > 0 ? Math.round((st.completed / st.total) * 100) : 0;
            let stageDesc = '';
            const activeItem = data.activeJob ? data.activeJob.activeItem : null;
            if (activeItem) {
              if (activeItem.stage === 'searching') stageDesc = ' • Поиск на YouTube...';
              else if (activeItem.stage === 'extracting') stageDesc = ' • Защита YouTube...';
              else if (activeItem.stage === 'downloading') stageDesc = ` • ${activeItem.progress ? activeItem.progress + '%' : 'Загрузка...'}`;
              else if (activeItem.stage === 'processing') stageDesc = ' • Сохранение...';
            }
            self.setButtonState(downloadBtn, 'downloading', 'Загрузка треков...');
            self.renderActionBarControls(downloadBtn, playlistName, `${st.completed} / ${st.total} (${percent}%)${stageDesc}`, false);
          } else if (st.status === 'paused') {
            const percent = st.total > 0 ? Math.round((st.completed / st.total) * 100) : 0;
            self.setButtonState(downloadBtn, 'downloading', 'На паузе');
            self.renderActionBarControls(downloadBtn, playlistName, `Пауза: ${st.completed} / ${st.total} (${percent}%)`, true);
          } else {
            self.resetButton(downloadBtn);
            self.cleanupActionBarControls();
          }
        } else {
          
          if (data && data.activeJob && data.activeJob.activePlaylist && data.activeJob.activePlaylist.name === playlistName) {
            const p = data.activeJob.activePlaylist;
            self.activeDownloads.set(playlistName, p);
            self.setButtonState(downloadBtn, 'downloading', 'Загрузка...');
            self.renderActionBarControls(downloadBtn, playlistName, `${p.completed} / ${p.total} (${p.percent}%)`, p.status === 'paused');
          } else {
            self.resetButton(downloadBtn);
            self.cleanupActionBarControls();
          }
        }
      } catch (e) {}
    };

    this.syncTimer = setInterval(syncCurrentView, 800);

    const mainEl = document.querySelector('main') || document.body;
    const navObserver = new MutationObserver(() => {
      syncCurrentView();
    });
    navObserver.observe(mainEl, { childList: true, subtree: false });
  },

  renderActionBarControls(buttonEl, playlistName, counterText, isPaused) {
    if (!buttonEl || !buttonEl.parentNode) return;

    let counterEl = document.getElementById('mod-action-counter');
    if (!counterEl) {
      counterEl = document.createElement('span');
      counterEl.id = 'mod-action-counter';
      counterEl.className = 'mod-action-counter';
      buttonEl.parentNode.insertBefore(counterEl, buttonEl.nextSibling);
    }
    counterEl.textContent = counterText;

    let pauseBtn = document.getElementById('mod-action-pause-btn');
    if (!pauseBtn) {
      pauseBtn = document.createElement('button');
      pauseBtn.id = 'mod-action-pause-btn';
      pauseBtn.className = 'mod-encore-circle-btn';
      buttonEl.parentNode.insertBefore(pauseBtn, counterEl.nextSibling);
    }

    pauseBtn.title = isPaused ? 'Продолжить скачивание' : 'Пауза';
    pauseBtn.innerHTML = isPaused
      ? `<svg viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20"/></svg>`
      : `<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>`;

    pauseBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const endpoint = isPaused ? '/resume-download' : '/pause-download';
      try {
        const res = await fetch(`http://127.0.0.1:43821${endpoint}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          this.showToast(isPaused ? 'Скачивание возобновлено' : 'Скачивание на паузе');
        }
      } catch (err) {
        this.showToast('Ошибка связи с Companion');
      }
    };

    let stopBtn = document.getElementById('mod-action-stop-btn');
    if (!stopBtn) {
      stopBtn = document.createElement('button');
      stopBtn.id = 'mod-action-stop-btn';
      stopBtn.className = 'mod-encore-circle-btn danger';
      stopBtn.title = 'Отменить скачивание';
      stopBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      `;
      buttonEl.parentNode.insertBefore(stopBtn, pauseBtn.nextSibling);

      stopBtn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          const res = await fetch('http://127.0.0.1:43821/stop-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlistName })
          });
          const data = await res.json();
          if (data.success) {
            this.showToast(`Скачивание «${playlistName}» остановлено`);
            this.activeDownloads.delete(playlistName);
            this.resetButton(buttonEl);
            this.cleanupActionBarControls();
          }
        } catch (err) {
          this.showToast('Ошибка связи с Companion');
        }
      };
    }
  },

  cleanupActionBarControls() {
    const counter = document.getElementById('mod-action-counter');
    if (counter) counter.remove();
    const pauseBtn = document.getElementById('mod-action-pause-btn');
    if (pauseBtn) pauseBtn.remove();
    const stopBtn = document.getElementById('mod-action-stop-btn');
    if (stopBtn) stopBtn.remove();
  },

  openContextMenu(buttonEl, playlistName) {
    this.closeContextMenu();

    const menu = document.createElement('div');
    menu.id = 'mod-encore-download-menu';
    menu.className = 'mod-encore-menu';

    menu.innerHTML = `
      <button class="mod-encore-menu-item" id="mod-menu-play-offline">
        <svg viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20"/></svg>
        <span>Воспроизвести офлайн</span>
      </button>
      <button class="mod-encore-menu-item" id="mod-menu-open-folder">
        <svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
        <span>Открыть в Проводнике</span>
      </button>
      <button class="mod-encore-menu-item danger" id="mod-menu-delete-offline">
        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        <span>Удалить из офлайна</span>
      </button>
    `;

    buttonEl.parentNode.style.position = 'relative';
    buttonEl.parentNode.appendChild(menu);
    this.menuEl = menu;

    menu.querySelector('#mod-menu-play-offline').onclick = async (e) => {
      e.stopPropagation();
      this.closeContextMenu();
      await this.startOfflinePlayback(playlistName);
    };

    menu.querySelector('#mod-menu-open-folder').onclick = async (e) => {
      e.stopPropagation();
      this.closeContextMenu();
      try {
        const res = await fetch('http://127.0.0.1:43821/open-folder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlist: playlistName })
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data && data.success) {
            this.showToast('Папка плейлиста открыта в Проводнике');
          } else {
            this.showToast('Не удалось открыть папку плейлиста');
          }
        } else {
          this.showToast('Не удалось открыть папку плейлиста');
        }
      } catch (err) {
        this.showToast('Ошибка связи со службой Companion');
      }
    };

    menu.querySelector('#mod-menu-delete-offline').onclick = async (e) => {
      e.stopPropagation();
      this.closeContextMenu();

      if (!confirm(`Удалить все скачанные треки плейлиста «${playlistName}» с диска?`)) {
        return;
      }

      try {
        const res = await fetch('http://127.0.0.1:43821/delete-playlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlistName })
        });
        const data = await res.json();
        if (data.success) {
          this.activeDownloads.delete(playlistName);
          this.resetButton(buttonEl);
          this.cleanupActionBarControls();
          this.showToast(`Плейлист «${playlistName}» удален из офлайн-библиотеки`);
        }
      } catch (err) {
        this.showToast('Ошибка связи с Companion');
      }
    };
  },

  closeContextMenu() {
    if (this.menuEl) {
      this.menuEl.remove();
      this.menuEl = null;
    }
  },

  initOfflineAudioEngine() {
    const audio = this.offlinePlayer.audio;

    audio.onended = () => {
      this.playNextOfflineTrack();
    };

    audio.onerror = (e) => {
      console.warn('[Mod:OfflineAudio] Playback error', e);
    };
  },

  async startOfflinePlayback(playlistName) {
    try {
      this.showToast(`Загрузка локального плейлиста «${playlistName}»...`);
      const res = await fetch(`http://127.0.0.1:43821/local-playlist-tracks?name=${encodeURIComponent(playlistName)}`);
      const data = await res.json();

      if (!data || !data.tracks || data.tracks.length === 0) {
        this.showToast('В папке нет скачанных аудиофайлов');
        return;
      }

      this.offlinePlayer.playlist = playlistName;
      this.offlinePlayer.tracks = data.tracks;
      this.offlinePlayer.currentIndex = 0;

      this.playOfflineTrack(0);
    } catch (e) {
      this.showToast('Не удалось загрузить локальные файлы');
    }
  },

  playOfflineTrack(index) {
    const p = this.offlinePlayer;
    if (index < 0 || index >= p.tracks.length) return;

    p.currentIndex = index;
    const track = p.tracks[index];

    try {
      const playBtn = document.querySelector('button[data-testid="control-button-playpause"]');
      if (playBtn && playBtn.getAttribute('aria-label') === 'Пауза' || playBtn && playBtn.getAttribute('aria-label') === 'Pause') {
        playBtn.click();
      }
    } catch (e) {}

    p.audio.src = track.streamUrl;
    p.audio.play();
    p.isPlaying = true;

    this.showToast(`▶ Офлайн [${index + 1}/${p.tracks.length}]: ${track.artist} - ${track.title}`);
  },

  playNextOfflineTrack() {
    const p = this.offlinePlayer;
    if (p.currentIndex + 1 < p.tracks.length) {
      this.playOfflineTrack(p.currentIndex + 1);
    } else {
      this.showToast('Плейлист завершен');
      p.isPlaying = false;
    }
  },

  async handlePlaylistDownload(buttonEl, playlistName) {
    if (this.inFlightDownloads.has(playlistName)) {
      this.showToast(`Плейлист «${playlistName}» уже обрабатывается`);
      return;
    }
    this.inFlightDownloads.add(playlistName);
    if (buttonEl) {
      buttonEl.disabled = true;
      buttonEl.style.pointerEvents = 'none';
    }

    try {
      try {
        const pingRes = await fetch('http://127.0.0.1:43821/ping').then(r => r.json());
        if (!pingRes || pingRes.status !== 'ok') throw new Error('Offline');
      } catch (e) {
        this.showToast('Ошибка: локальный Companion-демон не запущен на ПК');
        return;
      }

      try {
        const statusRes = await fetch(`http://127.0.0.1:43821/playlist-status?name=${encodeURIComponent(playlistName)}`);
        if (statusRes.ok) {
          const statusData = await statusRes.json().catch(() => null);
          const st = statusData && statusData.status;
          if (st) {
            this.activeDownloads.set(playlistName, st);
            if (st.status === 'completed' || (st.total > 0 && st.completed >= st.total)) {
              this.showToast(`Плейлист «${playlistName}» уже полностью скачан!`);
              this.setButtonState(buttonEl, 'downloaded', `Скачан (${st.total || st.completed} треков)`);
              this.cleanupActionBarControls();
              this.openContextMenu(buttonEl, playlistName);
              return;
            }
            if (st.status === 'downloading' || st.status === 'paused') {
              this.showToast(`Плейлист «${playlistName}» уже загружается: ${st.completed} из ${st.total}`);
              this.setButtonState(buttonEl, 'downloading', `Загрузка ${st.completed}/${st.total}`);
              return;
            }
          }
        }
      } catch (e) {}

      this.activeDownloads.set(playlistName, { total: 0, completed: 0, status: 'downloading' });
      this.setButtonState(buttonEl, 'downloading', 'Сбор треков...');
      this.renderActionBarControls(buttonEl, playlistName, 'Сбор треков...', false);
      this.showToast(`Анализ треков «${playlistName}»...`);

      let tracks = [];
      try {
        tracks = await this.collectPlaylistTracks((current, total) => {
          this.renderActionBarControls(buttonEl, playlistName, `Сбор: ${current} треков`, false);
        });
      } catch (e) {}

      if (!tracks || tracks.length === 0) {
        this.activeDownloads.delete(playlistName);
        this.resetButton(buttonEl);
        this.cleanupActionBarControls();
        this.showToast('Ошибка: не удалось прочесть треки плейлиста');
        return;
      }

      this.activeDownloads.set(playlistName, { total: tracks.length, completed: 0, status: 'downloading' });
      this.renderActionBarControls(buttonEl, playlistName, `В очереди: 0 / ${tracks.length}`, false);
      this.showToast(`В очередь добавлено ${tracks.length} треков («${playlistName}»)!`);

      try {
        const res = await fetch('http://127.0.0.1:43821/download-playlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlistName, tracks })
        });
        const data = await res.json();

        if (data && data.alreadyCompleted) {
          this.showToast(`Плейлист «${playlistName}» уже полностью скачан!`);
          this.setButtonState(buttonEl, 'downloaded', `Скачан (${tracks.length} треков)`);
          this.cleanupActionBarControls();
        } else if (data && data.alreadyDownloading) {
          this.showToast(`Плейлист «${playlistName}» уже находится в процессе скачивания!`);
        }
      } catch (err) {
        this.activeDownloads.delete(playlistName);
        this.resetButton(buttonEl);
        this.cleanupActionBarControls();
        this.showToast('Ошибка связи со службой Companion');
      }
    } finally {
      this.inFlightDownloads.delete(playlistName);
      if (buttonEl) {
        buttonEl.disabled = false;
        buttonEl.style.pointerEvents = '';
      }
    }
  },

  getCurrentPlaylistName() {
    const mainArea = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainArea) {
      const titleEl = mainArea.querySelector('[data-testid="entityTitle"]') ||
                      mainArea.querySelector('.main-entityHeader-title') ||
                      mainArea.querySelector('h1');
      if (titleEl && titleEl.textContent.trim()) {
        return titleEl.textContent.trim();
      }
    }
    return '';
  },

  getExpectedTrackCount() {
    const metaSpans = document.querySelectorAll(
      'main span, [data-testid="playlist-page"] span, .main-entityHeader-metaData span, [data-testid="entityTitle"] ~ div span'
    );
    for (const span of metaSpans) {
      const text = span.textContent.trim();
      const match = text.match(/(\d[\d\s]*)\s*(?:пес|трек|song|track)/i);
      if (match) {
        const num = parseInt(match[1].replace(/\s/g, ''), 10);
        if (!isNaN(num) && num > 0) return num;
      }
    }
    return 0;
  },

  async collectPlaylistTracks(onProgress) {
    const expectedTotal = this.getExpectedTrackCount();
    const trackMap = new Map();

    function harvestVisibleRows() {
      const rows = document.querySelectorAll('[data-testid="tracklist-row"]');
      rows.forEach(row => {
        const titleEl = row.querySelector('[data-testid="internal-track-link"]') ||
                        row.querySelector('div[dir="auto"]') ||
                        row.querySelector('.standalone-ellipsis-one-line');
        const artistEl = row.querySelector('a[href*="/artist/"]') ||
                        row.querySelector('[data-testid="tracklist-row"] span a');
        const albumEl = row.querySelector('a[href*="/album/"]');

        if (titleEl && artistEl) {
          const title = titleEl.textContent.trim();
          const artist = artistEl.textContent.trim();
          const album = albumEl ? albumEl.textContent.trim() : '';

          const key = `${artist} - ${title}`.toLowerCase();
          if (!trackMap.has(key)) {
            trackMap.set(key, { title, artist, album });
          }
        }
      });
    }

    harvestVisibleRows();

    const scroller = document.querySelector('.main-view-container__scroll-node') ||
                     document.querySelector('[data-overlayscrollbars-viewport]') ||
                     document.querySelector('.os-viewport') ||
                     document.querySelector('main > div:nth-child(2)') ||
                     document.documentElement;

    const initialScroll = scroller.scrollTop || 0;
    let noNewCount = 0;
    let lastSize = trackMap.size;
    const maxIterations = Math.max(80, Math.ceil((expectedTotal || 100) / 4));

    for (let i = 0; i < maxIterations; i++) {
      harvestVisibleRows();
      if (typeof onProgress === 'function') {
        onProgress(trackMap.size, expectedTotal);
      }

      if (expectedTotal > 0 && trackMap.size >= expectedTotal) break;

      if (trackMap.size > lastSize) {
        noNewCount = 0;
        lastSize = trackMap.size;
      } else {
        noNewCount++;
        if (noNewCount >= 10 && trackMap.size > 0) break;
      }

      const rows = document.querySelectorAll('[data-testid="tracklist-row"]');
      if (rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        lastRow.scrollIntoView({ behavior: 'auto', block: 'center' });
      }

      const step = Math.max(500, Math.floor((scroller.clientHeight || 800) * 0.85));
      scroller.scrollTop += step;

      await new Promise(r => setTimeout(r, 120));
    }

    scroller.scrollTop = initialScroll;
    harvestVisibleRows();

    return Array.from(trackMap.values());
  },

  injectPlayerButton() {
    const self = this;

    function tryInject() {
      if (document.getElementById('mod-player-download-btn')) return;

      const playerRight = document.querySelector('.main-nowPlayingBar-right') ||
                          document.querySelector('[data-testid="now-playing-bar"] > div:last-child');
      if (!playerRight) return;

      const btn = document.createElement('button');
      btn.id = 'mod-player-download-btn';
      btn.className = 'mod-download-btn';
      btn.title = 'Скачать текущий трек офлайн (spmod)';
      btn.setAttribute('aria-label', 'Скачать трек');

      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v11.59l4.29-4.3 1.42 1.42L12 17.41l-5.71-5.7 1.42-1.42 4.29 4.3V3h2zm-8 16h16v2H4v-2z"/>
        </svg>
      `;

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const trackInfo = self.getCurrentPlayingTrack();
        if (!trackInfo) {
          self.showToast('Сейчас ничего не играет');
          return;
        }

        self.setButtonState(btn, 'downloading', 'Загрузка...');
        self.showToast(`Скачивание: ${trackInfo.artist} - ${trackInfo.title}...`);

        try {
          const res = await fetch('http://127.0.0.1:43821/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trackInfo)
          });
          const data = await res.json();

          if (data && data.success) {
            self.pollTrackDownload(data.item.id, btn, trackInfo);
          } else {
            self.resetButton(btn);
            self.showToast(`Ошибка: ${data.error || 'Служба недоступна'}`);
          }
        } catch (err) {
          self.resetButton(btn);
          self.showToast('Ошибка: Companion не запущен');
        }
      });

      playerRight.insertBefore(btn, playerRight.firstChild);
    }

    tryInject();
    this.observer = new MutationObserver(tryInject);
    this.observer.observe(document.body, { childList: true, subtree: true });
  },

  getCurrentPlayingTrack() {
    const titleEl = document.querySelector('[data-testid="context-item-info-title"]') ||
                    document.querySelector('.main-trackInfo-name');
    const artistEl = document.querySelector('[data-testid="context-item-info-subtitles"]') ||
                     document.querySelector('.main-trackInfo-artists');

    if (!titleEl || !artistEl) return null;

    const title = titleEl.textContent.trim();
    const artist = artistEl.textContent.trim();
    if (!title || !artist) return null;

    return { title, artist };
  },

  pollTrackDownload(itemId, buttonEl, trackInfo) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://127.0.0.1:43821/downloads');
        const data = await res.json();
        const item = (data.downloads || []).find(d => d.id === itemId);

        if (!item) return;

        if (item.status === 'completed') {
          clearInterval(interval);
          this.setButtonState(buttonEl, 'downloaded', 'Скачано');
          this.showToast(`✓ Скачано: ${trackInfo.artist} - ${trackInfo.title}`);
          setTimeout(() => this.resetButton(buttonEl), 5000);
        } else if (item.status === 'error') {
          clearInterval(interval);
          this.resetButton(buttonEl);
          this.showToast(`Ошибка загрузки: ${item.error || 'yt-dlp'}`);
        }
      } catch (e) {
        clearInterval(interval);
        this.resetButton(buttonEl);
      }
    }, 1500);
  },

  setButtonState(btn, state, title) {
    btn.classList.remove('downloading', 'downloaded');
    if (state === 'downloading') {
      btn.classList.add('downloading');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
        </svg>
      `;
    } else if (state === 'downloaded') {
      btn.classList.add('downloaded');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      `;
    }
    if (title) btn.title = title;
  },

  resetButton(btn) {
    btn.classList.remove('downloading', 'downloaded');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v11.59l4.29-4.3 1.42 1.42L12 17.41l-5.71-5.7 1.42-1.42 4.29 4.3V3h2zm-8 16h16v2H4v-2z"/>
      </svg>
    `;
    btn.title = 'Скачать плейлист (spmod)';
  },

  showToast(message) {
    if (window.__MOD__ && window.__MOD__.settingsUI) {
      window.__MOD__.settingsUI.showToast(message);
    }
  }
};
