
export const companionPlugin = {
  id: 'companion',
  name: 'Локальный Companion (Офлайн & Прокси)',
  description: 'Фоновый сервис на ПК для загрузки треков в высоком качестве и поддержки сессии',
  defaultEnabled: true,

  isConnected: false,
  pollTimer: null,
  apiUrl: 'http://127.0.0.1:43821',

  init() {
    console.log('[Mod:Companion] Initializing Companion client...');
    this.checkHealth();
    this.pollTimer = setInterval(() => this.checkHealth(), 5000);

    if (window.__MOD__) {
      window.__MOD__.downloadCurrentTrack = () => this.downloadCurrentTrack();
      window.__MOD__.companion = this;
    }
  },

  destroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  },

  async checkHealth() {
    try {
      const res = await fetch(`${this.apiUrl}/ping`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        this.isConnected = true;
        this.updateStatusUi(true, 'Companion подключен');
        return data;
      }
    } catch (e) {
      
    }
    this.isConnected = false;
    this.updateStatusUi(false, 'Companion: не запущен');
    return null;
  },

  updateStatusUi(isOnline, text) {
    const indicator = document.querySelector('.mod-status-indicator');
    const label = document.getElementById('mod-companion-status-text');

    if (indicator) {
      if (isOnline) {
        indicator.classList.remove('offline');
      } else {
        indicator.classList.add('offline');
      }
    }

    if (label) {
      label.textContent = text;
    }
  },

  async downloadTrack(track) {
    if (!this.isConnected) {
      const online = await this.checkHealth();
      if (!online) {
        console.warn('[Mod:Companion] Companion daemon is offline.');
        alert('Локальный Companion-демон не запущен.\nЗапустите companion/start.ps1 для работы офлайн-режима.');
        return false;
      }
    }

    try {
      const res = await fetch(`${this.apiUrl}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(track)
      });
      const result = await res.json();
      console.log('[Mod:Companion] Download request response:', result);
      return result;
    } catch (err) {
      console.error('[Mod:Companion] Failed to request download:', err);
      return false;
    }
  },

  getCurrentTrackInfo() {
    const titleEl = document.querySelector('[data-testid="context-item-info-title"]');
    const artistEl = document.querySelector('[data-testid="context-item-info-subtitles"]');
    const coverEl = document.querySelector('[data-testid="cover-art-image"]') ||
                    document.querySelector('[data-testid="now-playing-widget"] img');

    if (!titleEl || !artistEl) return null;

    return {
      title: titleEl.textContent.trim(),
      artist: artistEl.textContent.trim(),
      coverUrl: coverEl ? coverEl.src : ''
    };
  },

  downloadCurrentTrack() {
    const track = this.getCurrentTrackInfo();
    if (!track) {
      console.warn('[Mod:Companion] No track is currently playing.');
      return;
    }
    return this.downloadTrack(track);
  }
};
