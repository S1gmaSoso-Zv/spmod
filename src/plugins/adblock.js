
export const adblockPlugin = {
  id: 'adblock',
  name: 'Блокировка аудиорекламы',
  description: 'Блокирует рекламный трекинг, моментально глушит звук и мгновенно переключает аудиорекламу без пауз',
  defaultEnabled: true,

  observer: null,
  pollTimer: null,
  spicetifyRetryTimer: null,
  safetyWatchdogTimer: null,
  safetyWatchdogHardTimer: null,
  cosmosRetryTimer: null,
  productStateRetryTimer: null,

  _originalFetch: null,
  _originalXhrOpen: null,
  _originalXhrSend: null,
  _originalXhrSetRequestHeader: null,

  isMutedByMod: false,
  savedVolume: null,
  wasAlreadyMuted: false,
  lastSkipTimestamp: 0,
  lastSkippedTrackUri: null,
  isSkipping: false,
  consecutiveSkips: 0,
  _boundSongChange: null,
  _boundPlayPause: null,

  init() {
    console.log('[Mod:Adblock] Initializing Adblock & Instant Audio Skipper...');
    if (typeof window !== 'undefined' && window) {
      window.__mod_adblock_network_enabled = true;
    }
    this.initNetworkInterceptor();
    this.initAudioSkipper();
    this.initProductStateOverrides();
    this.initCosmosInterceptor();
  },

  destroy() {
    console.log('[Mod:Adblock] Disabling Adblock...');
    const self = this || adblockPlugin;
    if (typeof window !== 'undefined' && window) {
      window.__mod_adblock_network_enabled = false;
      window.__mod_adblock_network_hooked = false;

      if (self._originalFetch && window.fetch) {
        window.fetch = self._originalFetch;
      }
      if (typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest.prototype) {
        if (self._originalXhrSetRequestHeader) {
          XMLHttpRequest.prototype.setRequestHeader = self._originalXhrSetRequestHeader;
        }
        if (self._originalXhrOpen) {
          XMLHttpRequest.prototype.open = self._originalXhrOpen;
        }
        if (self._originalXhrSend) {
          XMLHttpRequest.prototype.send = self._originalXhrSend;
        }
      }
      self._originalFetch = null;
      self._originalXhrOpen = null;
      self._originalXhrSend = null;
      self._originalXhrSetRequestHeader = null;
    }
    window.__mod_instant_ad_kill = null;

    if (window.Spicetify && window.Spicetify.Player) {
      try {
        if (typeof window.Spicetify.Player.removeEventListener === 'function') {
          if (this._boundSongChange) {
            window.Spicetify.Player.removeEventListener('songchange', this._boundSongChange);
          }
          if (this._boundPlayPause) {
            window.Spicetify.Player.removeEventListener('onplaypause', this._boundPlayPause);
          }
        }
      } catch (e) {
        console.warn('[Mod:Adblock] Error removing Spicetify event listeners:', e);
      }
    }
    this._boundSongChange = null;
    this._boundPlayPause = null;

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.spicetifyRetryTimer) {
      clearInterval(this.spicetifyRetryTimer);
      this.spicetifyRetryTimer = null;
    }
    if (this.cosmosRetryTimer) {
      clearInterval(this.cosmosRetryTimer);
      this.cosmosRetryTimer = null;
    }
    if (this.productStateRetryTimer) {
      clearInterval(this.productStateRetryTimer);
      this.productStateRetryTimer = null;
    }

    this.clearSafetyWatchdog();

    this.restoreVolume();
    this.savedVolume = null;
    this.isMutedByMod = false;
    this.lastSkippedTrackUri = null;
    this.isSkipping = false;
    this.consecutiveSkips = 0;
  },

  initNetworkInterceptor() {
    if (typeof window === 'undefined' || !window) return;
    if (window.__mod_adblock_network_hooked) return;
    window.__mod_adblock_network_hooked = true;
    window.__mod_adblock_network_enabled = true;

    const self = this || adblockPlugin;
    const adPatterns = [
      '/ad-logic/',
      '/v1/ads/',
      '/v1/adv/',
      '/commercial/',
      '/commercial-break/',
      '/audio-ads/',
      '/audio-advertising/',
      '/telemetry/',
      '/ad-event/',
      '/desktop-update/',
      'analytics.spotify.com',
      'sp://ads/',
      'sp://audio-ads/',
      'doubleclick.net',
      'omidonlines.net',
      '/gabo-receiver-service/',
      '/event-service/',
      '/in-stream-ad/',
      'admocker.spotify.com'
    ];

    function shouldBlock(url) {
      if (typeof window !== 'undefined' && window.__mod_adblock_network_enabled === false) return false;
      if (!url) return false;

      let urlStr = '';
      if (typeof url === 'string') {
        urlStr = url;
      } else if (url && typeof url.href === 'string') {
        urlStr = url.href;
      } else if (url && typeof url.url === 'string') {
        urlStr = url.url;
      } else if (url && typeof url.toString === 'function') {
        try {
          const s = url.toString();
          if (s && !s.startsWith('[object')) {
            urlStr = s;
          }
        } catch (e) {}
      }

      if (!urlStr || typeof urlStr !== 'string') return false;

      const lower = urlStr.toLowerCase();

      if (
        lower.includes('audio-fa.scdn.co') ||
        lower.includes('audio-ak.spotify.com') ||
        lower.includes('p.scdn.co') ||
        lower.includes('i.scdn.co') ||
        lower.includes('/v1/me') ||
        lower.includes('/playlist') ||
        lower.includes('/search') ||
        lower.includes('/lyrics') ||
        lower.includes('/canvas') ||
        lower.includes('/canvases') ||
        lower.includes('/metadata/') ||
        lower.includes('127.0.0.1:43821') ||
        lower.includes('127.0.0.1:10808') ||
        lower.includes('127.0.0.1:10809') ||
        (lower.includes('/audio/') && !lower.includes('ad') && !lower.includes('commercial'))
      ) {
        return false;
      }

      return adPatterns.some(p => lower.includes(p.toLowerCase()));
    }

    self.shouldBlock = shouldBlock;
    window.__mod_should_block_url = shouldBlock;

    function createEmptyResponse() {
      const emptyPayload = { ads: [], ad: null, slots: [], enabled: false };
      const payloadStr = JSON.stringify(emptyPayload);

      let resp;
      if (typeof Response === 'function') {
        try {
          resp = new Response(payloadStr, {
            status: 200,
            statusText: 'OK',
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (e) {
          resp = {
            status: 200,
            statusText: 'OK',
            headers: {
              get: (h) => (h && h.toLowerCase() === 'content-type' ? 'application/json' : null)
            }
          };
        }
      } else {
        resp = {
          status: 200,
          statusText: 'OK',
          headers: {
            get: (h) => (h && h.toLowerCase() === 'content-type' ? 'application/json' : null)
          }
        };
      }

      resp.json = async () => emptyPayload;
      resp.text = async () => payloadStr;
      return resp;
    }

    if (typeof window.fetch === 'function') {
      if (!self._originalFetch) {
        self._originalFetch = window.fetch;
      }
      const originalFetch = self._originalFetch;
      window.fetch = function(...args) {
        let url = '';
        if (typeof args[0] === 'string') {
          url = args[0];
        } else if (args[0] && typeof args[0].href === 'string') {
          url = args[0].href;
        } else if (args[0] && typeof args[0].url === 'string') {
          url = args[0].url;
        } else if (args[0] && typeof args[0].toString === 'function') {
          try {
            const s = args[0].toString();
            if (s && !s.startsWith('[object')) {
              url = s;
            }
          } catch (e) {}
        }

        try {
          const getAuth = (hdr) => {
            if (!hdr) return null;
            if (typeof hdr.get === 'function') {
              return hdr.get('Authorization') || hdr.get('authorization');
            } else if (typeof hdr === 'object') {
              return hdr['Authorization'] || hdr['authorization'];
            }
            return null;
          };

          const auth = (args[1] && getAuth(args[1].headers)) || (args[0] && getAuth(args[0].headers));
          if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
            if (typeof window !== 'undefined' && window) {
              window.__spotify_bearer_token = auth;
            }
          }
        } catch (e) {}

        if (shouldBlock(url)) {
          return Promise.resolve(createEmptyResponse());
        }
        return originalFetch.apply(this, args);
      };
    }

    if (typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest.prototype) {
      if (!self._originalXhrSetRequestHeader) {
        self._originalXhrSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
      }
      if (!self._originalXhrOpen) {
        self._originalXhrOpen = XMLHttpRequest.prototype.open;
      }
      if (!self._originalXhrSend) {
        self._originalXhrSend = XMLHttpRequest.prototype.send;
      }
      const originalSetRequestHeader = self._originalXhrSetRequestHeader;
      const originalOpen = self._originalXhrOpen;
      const originalSend = self._originalXhrSend;

      XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        if (header && typeof header === 'string' && header.toLowerCase() === 'authorization' && typeof value === 'string' && value.startsWith('Bearer ')) {
          if (typeof window !== 'undefined' && window) {
            window.__spotify_bearer_token = value;
          }
        }
        if (typeof originalSetRequestHeader === 'function') {
          return originalSetRequestHeader.apply(this, [header, value]);
        }
      };

      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (shouldBlock(url)) {
          this.__isBlocked = true;
        }
        if (typeof originalOpen === 'function') {
          return originalOpen.apply(this, [method, url, ...rest]);
        }
      };

      XMLHttpRequest.prototype.send = function(...args) {
        if (this.__isBlocked) {
          const emptyPayload = { ads: [], ad: null, slots: [], enabled: false };
          const emptyPayloadStr = JSON.stringify(emptyPayload);

          try { Object.defineProperty(this, 'readyState', { value: 4, writable: false, configurable: true }); } catch (e) { this.readyState = 4; }
          try { Object.defineProperty(this, 'status', { value: 200, writable: false, configurable: true }); } catch (e) { this.status = 200; }
          try { Object.defineProperty(this, 'statusText', { value: 'OK', writable: false, configurable: true }); } catch (e) { this.statusText = 'OK'; }
          try { Object.defineProperty(this, 'responseText', { value: emptyPayloadStr, writable: false, configurable: true }); } catch (e) { this.responseText = emptyPayloadStr; }
          try {
            Object.defineProperty(this, 'response', {
              get: () => (this.responseType === 'json' ? emptyPayload : emptyPayloadStr),
              configurable: true
            });
          } catch (e) {
            this.response = this.responseType === 'json' ? emptyPayload : emptyPayloadStr;
          }

          this.getResponseHeader = function(name) {
            if (name && name.toLowerCase() === 'content-type') return 'application/json';
            return null;
          };
          this.getAllResponseHeaders = function() {
            return 'content-type: application/json\r\n';
          };

          const fireEvent = (handler, eventName) => {
            let evt;
            try {
              evt = typeof Event === 'function' ? new Event(eventName) : { type: eventName, target: this };
            } catch (e) {
              evt = { type: eventName, target: this };
            }
            if (!evt.target) {
              try { Object.defineProperty(evt, 'target', { value: this, configurable: true }); } catch (e) { evt.target = this; }
            }
            if (typeof handler === 'function') {
              try { handler.call(this, evt); } catch (e) {}
            }
            if (typeof this.dispatchEvent === 'function') {
              try { this.dispatchEvent(evt); } catch (e) {}
            }
          };

          setTimeout(() => {
            fireEvent(this.onreadystatechange, 'readystatechange');
            fireEvent(this.onload, 'load');
            fireEvent(this.onloadend, 'loadend');
          }, 0);
          return;
        }
        if (typeof originalSend === 'function') {
          return originalSend.apply(this, args);
        }
      };
    }

    this.initCosmosInterceptor();
    this.initProductStateOverrides();

    console.log('[Mod:Adblock] Root network interceptor installed.');
  },

  initCosmosInterceptor() {
    if (typeof window === 'undefined' || !window) return;
    const self = this;

    const hookCosmos = (cosmos) => {
      if (!cosmos || cosmos.__mod_cosmos_hooked) return;
      cosmos.__mod_cosmos_hooked = true;

      const emptyPayload = { ads: [], ad: null, slots: [], enabled: false };

      ['get', 'post', 'put', 'del', 'head'].forEach(method => {
        const original = cosmos[method];
        if (typeof original === 'function') {
          cosmos[method] = function(url, ...args) {
            if (typeof url === 'string' && (url.startsWith('sp://ads') || url.startsWith('sp://audio-ads') || (self.shouldBlock && self.shouldBlock(url)))) {
              return Promise.resolve(emptyPayload);
            }
            return original.apply(this, [url, ...args]);
          };
        }
      });

      if (typeof cosmos.sub === 'function') {
        const originalSub = cosmos.sub;
        cosmos.sub = function(url, callback, ...args) {
          if (typeof url === 'string' && (url.startsWith('sp://ads') || url.startsWith('sp://audio-ads') || (self.shouldBlock && self.shouldBlock(url)))) {
            if (typeof callback === 'function') {
              try { callback(emptyPayload); } catch (e) {}
            }
            return { unsubscribe: () => {} };
          }
          return originalSub.apply(this, [url, callback, ...args]);
        };
      }

      try {
        if (typeof cosmos.post === 'function') {
          cosmos.post('sp://ads/v1/testing/playtime', { value: -1e11 }).catch(() => {});
        }
      } catch (e) {}

      console.log('[Mod:Adblock] Spicetify.CosmosAsync intercepted.');
    };

    if (window.Spicetify && window.Spicetify.CosmosAsync) {
      hookCosmos(window.Spicetify.CosmosAsync);
    } else {
      let attempts = 0;
      if (this.cosmosRetryTimer) clearInterval(this.cosmosRetryTimer);
      this.cosmosRetryTimer = setInterval(() => {
        attempts++;
        if (window.Spicetify && window.Spicetify.CosmosAsync) {
          hookCosmos(window.Spicetify.CosmosAsync);
          clearInterval(this.cosmosRetryTimer);
          this.cosmosRetryTimer = null;
        } else if (attempts >= 20) {
          clearInterval(this.cosmosRetryTimer);
          this.cosmosRetryTimer = null;
        }
      }, 500);
    }
  },

  initProductStateOverrides() {
    if (typeof window === 'undefined' || !window) return;
    const pairs = { ads: '0', catalogue: 'premium', product: 'premium', type: 'premium' };

    const applyOverrides = () => {
      let applied = false;
      try {
        const userApi = window.Spicetify?.Platform?.UserAPI;
        const productState = userApi?._product_state || window.Spicetify?.Platform?.ProductStateAPI || window.ProductStateAPI;
        if (productState && typeof productState.putOverridesValues === 'function') {
          productState.putOverridesValues({ pairs });
          applied = true;
        } else if (productState?.productStateApi && typeof productState.productStateApi.putOverridesValues === 'function') {
          productState.productStateApi.putOverridesValues({ pairs });
          applied = true;
        }
      } catch (e) {}

      if (applied) {
        console.log('[Mod:Adblock] ProductState premium overrides applied.');
      }
      return applied;
    };

    if (!applyOverrides()) {
      let attempts = 0;
      if (this.productStateRetryTimer) clearInterval(this.productStateRetryTimer);
      this.productStateRetryTimer = setInterval(() => {
        attempts++;
        if (applyOverrides() || attempts >= 20) {
          clearInterval(this.productStateRetryTimer);
          this.productStateRetryTimer = null;
        }
      }, 500);
    }
  },

  initAudioSkipper() {
    const self = this;

    const checkAdState = () => {
      const isAd = self.detectAd();
      if (isAd) {
        self.handleAdDetected();
      } else if (self.isMutedByMod) {
        self.restoreVolume();
      }
    };

    window.__mod_instant_ad_kill = (player, state) => {
      if (player && !window.__spotify_player) {
        try { window.__spotify_player = player; } catch (e) {}
      }
      if (state && typeof state === 'object') {
        try { window.__spotify_state = state; } catch (e) {}
      }
      setTimeout(() => {
        try {
          if (self.detectAd()) {
            self.handleAdDetected();
          } else if (self.isMutedByMod) {
            self.restoreVolume();
          }
        } catch (e) {}
      }, 0);
    };

    this.attachSpicetifyListeners(checkAdState);

    this.pollTimer = setInterval(checkAdState, 150);

    const target = document && document.body;
    if (typeof MutationObserver !== 'undefined' && target) {
      this.observer = new MutationObserver(() => {
        checkAdState();
      });
      this.observer.observe(target, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-label', 'title', 'href', 'disabled']
      });
    }

    console.log('[Mod:Adblock] Instant audio ad skipper active.');
  },

  attachSpicetifyListeners(callback) {
    if (window.Spicetify && window.Spicetify.Player && typeof window.Spicetify.Player.addEventListener === 'function') {
      try {
        this._boundSongChange = () => callback();
        this._boundPlayPause = () => callback();
        window.Spicetify.Player.addEventListener('songchange', this._boundSongChange);
        window.Spicetify.Player.addEventListener('onplaypause', this._boundPlayPause);
        console.log('[Mod:Adblock] Event-driven songchange & onplaypause listeners attached.');
        return;
      } catch (e) {
        console.warn('[Mod:Adblock] Failed to attach Spicetify event listeners:', e);
      }
    }

    let attempts = 0;
    this.spicetifyRetryTimer = setInterval(() => {
      attempts++;
      if (window.Spicetify && window.Spicetify.Player && typeof window.Spicetify.Player.addEventListener === 'function') {
        try {
          this._boundSongChange = () => callback();
          this._boundPlayPause = () => callback();
          window.Spicetify.Player.addEventListener('songchange', this._boundSongChange);
          window.Spicetify.Player.addEventListener('onplaypause', this._boundPlayPause);
          console.log('[Mod:Adblock] Event-driven songchange attached on retry.');
        } catch (e) {}
        clearInterval(this.spicetifyRetryTimer);
        this.spicetifyRetryTimer = null;
      } else if (attempts >= 10) {
        clearInterval(this.spicetifyRetryTimer);
        this.spicetifyRetryTimer = null;
      }
    }, 500);
  },

  detectAd() {
    const isAdTrack = (track) => {
      if (!track) return false;
      if (track.type === 'ad' || track.provider === 'ad') return true;
      if (typeof track.uri === 'string' && (track.uri.startsWith('spotify:ad:') || (!track.uri.startsWith('spotify:local:') && track.uri.includes(':ad:')))) return true;
      const meta = track.metadata;
      if (meta) {
        if (meta.is_advertisement === 'true' || meta.is_advertisement === true || meta.is_advertisement === '1' || meta.is_advertisement === 1) return true;
        if ((typeof meta.ad_id === 'string' && meta.ad_id.trim().length > 0) || meta['marked_for_ad'] === 'true' || meta['marked_for_ad'] === true) return true;
        if (meta.advertiser || meta.ad_product || meta.ad_format || meta.audio_ad_id || meta.iteration || meta['ad.audio.id'] || meta['ad_pod_id']) return true;
        if (meta.action_url || meta.clickthrough_url) return true;
        const trackTitle = (track.name || meta.title || '').trim().toLowerCase();
        if (trackTitle === 'listen to music, ad-free' || trackTitle === 'listen to music ad-free' || trackTitle === 'слушайте музыку без рекламы') {
          return true;
        }
      }
      return false;
    };

    if (window.__spotify_state) {
      try {
        const s = window.__spotify_state;
        if (isAdTrack(s.item || s.track)) return true;
        const reasons = [
          ...(s.restrictions?.disallowSkippingNextReasons || []),
          ...(s.restrictions?.disallow_skipping_next_reasons || []),
          ...(s.restrictions?.disallowSeekingReasons || []),
          ...(s.restrictions?.disallow_seeking_reasons || [])
        ];
        
        if (reasons.includes('ad_disallow')) return true;
        if (s.ad && typeof s.ad === 'object' && Object.keys(s.ad).length > 0 && s.ad.type === 'ad') return true;
      } catch (e) {}
    }

    if (window.Spicetify && window.Spicetify.Player) {
      try {
        const data = window.Spicetify.Player.data;
        if (data) {
          if (isAdTrack(data.item || data.track)) return true;
          if (data.context && typeof data.context.uri === 'string' && (data.context.uri.startsWith('spotify:ad:') || (!data.context.uri.startsWith('spotify:local:') && data.context.uri.includes(':ad:')))) return true;
          const reasons = [
            ...(data.restrictions?.disallowSkippingNextReasons || []),
            ...(data.restrictions?.disallow_skipping_next_reasons || []),
            ...(data.restrictions?.disallowSeekingReasons || []),
            ...(data.restrictions?.disallow_seeking_reasons || [])
          ];
          if (reasons.includes('ad_disallow')) return true;
          if (data.ad && typeof data.ad === 'object' && Object.keys(data.ad).length > 0 && data.ad.type === 'ad') return true;
        }
      } catch (e) {}
    }

    if (typeof document !== 'undefined' && document && typeof document.querySelector === 'function') {
      try {
        const titleLink = document.querySelector('[data-testid="context-item-info-title"]');
        if (titleLink) {
          let href = '';
          if (typeof titleLink.querySelector === 'function') {
            const a = titleLink.querySelector('a');
            if (a && typeof a.getAttribute === 'function') {
              href = a.getAttribute('href') || '';
            }
          }
          if (!href && typeof titleLink.getAttribute === 'function') {
            href = titleLink.getAttribute('href') || '';
          }
          href = (href || '').toLowerCase();
          if (href.includes('/ad/') || href.includes('spotify:ad') || href.includes('ads.spotify.com')) {
            return true;
          }
          const text = (titleLink.textContent || '').trim().toLowerCase();
          if (text === 'listen to music, ad-free' || text === 'listen to music ad-free' || text === 'слушайте музыку без рекламы') {
            return true;
          }
        }

        if (
          document.querySelector('[data-testid="skippable-ad-delay"]') ||
          document.querySelector('[data-testid="skippable-ad-skip-button"]') ||
          document.querySelector('[data-testid="skippable-ad-circle-timer"]') ||
          document.querySelector('[data-testid="PanelHeader_AdContextMenuButton"]') ||
          document.querySelector('[data-testid="track-info-advertiser"]') ||
          document.querySelector('[data-testid="context-item-info-advertiser"]') ||
          document.querySelector('.A_dgCpuNz1P_9_RPygVC')
        ) {
          return true;
        }
      } catch (e) {}
    }

    return false;
  },

  handleAdDetected() {
    
    this.muteBuffer();
    try {
      if (document.body) document.body.classList.add('mod-ad-playing');
    } catch (e) {}

    const track = (window.Spicetify && window.Spicetify.Player && window.Spicetify.Player.data &&
                   (window.Spicetify.Player.data.item || window.Spicetify.Player.data.track)) ||
                  (window.__spotify_state && (window.__spotify_state.item || window.__spotify_state.track));
    const trackUri = (track && typeof track.uri === 'string' && track.uri.length > 0) ? track.uri : null;

    if (this.isSkipping) return;

    const now = Date.now();
    
    if (trackUri && this.lastSkippedTrackUri === trackUri && (now - this.lastSkipTimestamp < 2000)) {
      return;
    }

    if (now - this.lastSkipTimestamp < 250 || this.consecutiveSkips >= 5) {
      return;
    }

    this.isSkipping = true;
    this.lastSkippedTrackUri = trackUri;
    this.lastSkipTimestamp = now;
    this.consecutiveSkips++;

    try {
      this.triggerInstantSkip();
    } finally {
      this.isSkipping = false;
    }
  },

  muteBuffer() {
    if (this.isMutedByMod) return;

    const player = window.Spicetify && window.Spicetify.Player;
    const domMuteBtn = document.querySelector('button[data-testid="volume-bar-toggle-mute-button"]');
    const isDomMuted = domMuteBtn && (
      domMuteBtn.getAttribute('aria-label') === 'Unmute' ||
      domMuteBtn.getAttribute('aria-label') === 'Включить звук'
    );

    let alreadyMuted = false;
    if (player && typeof player.getMute === 'function') {
      try { alreadyMuted = Boolean(player.getMute()); } catch (e) {}
    }
    if (!alreadyMuted && player && typeof player.getVolume === 'function') {
      try { alreadyMuted = player.getVolume() === 0; } catch (e) {}
    }
    if (!alreadyMuted && isDomMuted) {
      alreadyMuted = true;
    }

    if (alreadyMuted) {
      this.wasAlreadyMuted = true;
      return; 
    }

    this.wasAlreadyMuted = false;

    if (player && typeof player.getVolume === 'function') {
      try {
        const v = player.getVolume();
        if (typeof v === 'number' && v > 0) {
          this.savedVolume = v;
        }
      } catch (e) {}
    }

    let didMute = false;
    if (player && typeof player.mute === 'function') {
      try {
        player.mute();
        didMute = true;
        console.log('[Mod:Adblock] Audio muted via Spicetify.Player.mute()');
      } catch (e) {}
    }

    if (!didMute && player && typeof player.setVolume === 'function') {
      try {
        player.setVolume(0);
        didMute = true;
        console.log('[Mod:Adblock] Audio muted via Spicetify.Player.setVolume(0)');
      } catch (e) {}
    }

    if (!didMute && domMuteBtn && !isDomMuted) {
      try {
        domMuteBtn.click();
        didMute = true;
        console.log('[Mod:Adblock] Audio muted via DOM volume toggle');
      } catch (e) {}
    }

    try {
      const mediaElements = document.querySelectorAll('audio, video');
      mediaElements.forEach(m => {
        try { m.muted = true; } catch (e) {}
      });
      if (mediaElements.length > 0) didMute = true;
    } catch (e) {}

    if (didMute) {
      this.isMutedByMod = true;
    }

    this.armSafetyWatchdog();
  },

  triggerInstantSkip() {
    console.log('[Mod:Adblock] Audio ad detected! Triggering clean single skip...');

    if (window.Spicetify && window.Spicetify.Player && typeof window.Spicetify.Player.skipAd === 'function') {
      try {
        window.Spicetify.Player.skipAd();
        console.log('[Mod:Adblock] Skipped ad via Spicetify.Player.skipAd()');
        return;
      } catch (e) {
        console.warn('[Mod:Adblock] Spicetify.Player.skipAd failed:', e);
      }
    }

    if (window.Spicetify && window.Spicetify.Player && typeof window.Spicetify.Player.next === 'function') {
      try {
        window.Spicetify.Player.next();
        console.log('[Mod:Adblock] Skipped ad via Spicetify.Player.next()');
        return;
      } catch (e) {
        console.warn('[Mod:Adblock] Spicetify.Player.next failed:', e);
      }
    }

    if (window.Spicetify && window.Spicetify.Platform && window.Spicetify.Platform.PlayerAPI && 
        typeof window.Spicetify.Platform.PlayerAPI.skipToNext === 'function') {
      try {
        window.Spicetify.Platform.PlayerAPI.skipToNext();
        console.log('[Mod:Adblock] Skipped ad via Spicetify.Platform.PlayerAPI.skipToNext()');
        return;
      } catch (e) {
        console.warn('[Mod:Adblock] Spicetify.Platform.PlayerAPI.skipToNext failed:', e);
      }
    }

    if (window.Spicetify && window.Spicetify.Player && typeof window.Spicetify.Player.seek === 'function') {
      try {
        window.Spicetify.Player.seek(1);
        console.log('[Mod:Adblock] Fast-forwarded ad to end via Spicetify.Player.seek(1)');
        return;
      } catch (e) {
        console.warn('[Mod:Adblock] Spicetify.Player.seek(1) failed:', e);
      }
    }

    if (window.__spotify_player && typeof window.__spotify_player.skipToNext === 'function') {
      try {
        window.__spotify_player.skipToNext();
        console.log('[Mod:Adblock] Skipped ad via window.__spotify_player.skipToNext()');
        return;
      } catch (e) {
        console.warn('[Mod:Adblock] window.__spotify_player.skipToNext failed:', e);
      }
    }

    try {
      const adSkipBtn = document.querySelector('button[data-testid="skippable-ad-skip-button"]');
      if (adSkipBtn) {
        const reactPropsKey = Object.keys(adSkipBtn).find(k => k.startsWith('__reactProps$'));
        if (reactPropsKey && adSkipBtn[reactPropsKey] && typeof adSkipBtn[reactPropsKey].onClick === 'function') {
          try {
            adSkipBtn[reactPropsKey].onClick({ stopPropagation: () => {}, preventDefault: () => {} });
          } catch (e) {}
        }
        adSkipBtn.click();
        console.log('[Mod:Adblock] Skipped ad via DOM skippable-ad-skip-button');
        return;
      }
    } catch (e) {}

    try {
      const nextBtn = document.querySelector('button[data-testid="control-button-skip-forward"]');
      if (nextBtn) {
        if (nextBtn.disabled) {
          nextBtn.disabled = false;
          nextBtn.removeAttribute('disabled');
        }
        if (nextBtn.getAttribute('aria-disabled') === 'true') {
          nextBtn.setAttribute('aria-disabled', 'false');
        }

        const reactPropsKey = Object.keys(nextBtn).find(k => k.startsWith('__reactProps$'));
        if (reactPropsKey && nextBtn[reactPropsKey] && typeof nextBtn[reactPropsKey].onClick === 'function') {
          try {
            nextBtn[reactPropsKey].onClick({ stopPropagation: () => {}, preventDefault: () => {} });
          } catch (e) {}
        }

        nextBtn.click();
        console.log('[Mod:Adblock] Clicked forced DOM skip button');
        return;
      }
    } catch (e) {}
  },

  restoreVolume() {
    try {
      if (document.body) document.body.classList.remove('mod-ad-playing');
    } catch (e) {}

    if (!this.isMutedByMod) return;
    this.clearSafetyWatchdog();

    if (this.wasAlreadyMuted) {
      this.isMutedByMod = false;
      this.savedVolume = null;
      return;
    }

    const player = window.Spicetify && window.Spicetify.Player;
    const domMuteBtn = document.querySelector('button[data-testid="volume-bar-toggle-mute-button"]');

    if (player && typeof player.unmute === 'function') {
      try {
        player.unmute();
        console.log('[Mod:Adblock] Audio unmuted via Spicetify.Player.unmute()');
      } catch (e) {}
    }

    if (player && typeof player.setVolume === 'function') {
      try {
        const targetVol = (typeof this.savedVolume === 'number' && this.savedVolume > 0)
          ? this.savedVolume
          : (typeof player.getVolume === 'function' && player.getVolume() > 0 ? player.getVolume() : 0.7);
        player.setVolume(targetVol);
        console.log(`[Mod:Adblock] Volume restored to ${targetVol} via Spicetify.Player.setVolume()`);
      } catch (e) {}
    }

    if (domMuteBtn) {
      const isDomMuted = domMuteBtn.getAttribute('aria-label') === 'Unmute' ||
                         domMuteBtn.getAttribute('aria-label') === 'Включить звук';
      if (isDomMuted) {
        try {
          domMuteBtn.click();
          console.log('[Mod:Adblock] Audio unmuted via DOM toggle');
        } catch (e) {}
      }
    }

    try {
      const mediaElements = document.querySelectorAll('audio, video');
      mediaElements.forEach(m => {
        try { m.muted = false; } catch (e) {}
      });
    } catch (e) {}

    this.isMutedByMod = false;
    this.savedVolume = null;
    this.consecutiveSkips = 0;
    this.isSkipping = false;
    this.lastSkippedTrackUri = null;
    console.log('[Mod:Adblock] Real track active. Audio buffer restored.');
  },

  armSafetyWatchdog() {
    
    if (this.safetyWatchdogTimer) return;

    this.safetyWatchdogTimer = setTimeout(() => {
      this.safetyWatchdogTimer = null;
      if (this.isMutedByMod) {
        console.warn('[Mod:Adblock] Safety watchdog: 2000ms deadline reached. Forcing volume restoration.');
        this.restoreVolume();
      }
    }, 2000);
  },

  clearSafetyWatchdog() {
    if (this.safetyWatchdogTimer) {
      clearTimeout(this.safetyWatchdogTimer);
      this.safetyWatchdogTimer = null;
    }
    if (this.safetyWatchdogHardTimer) {
      clearTimeout(this.safetyWatchdogHardTimer);
      this.safetyWatchdogHardTimer = null;
    }
  }
};

try {
  adblockPlugin.initNetworkInterceptor();
} catch (e) {
  
}
