
(function() {
  'use strict';

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

  function injectStyles() {
    const styleId = 'mod-bundled-styles';
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = "\n/* --- theme.css --- */\n\n:root {\n  --mod-accent: #1db954;\n  --mod-bg-overlay: rgba(0, 0, 0, 0.7);\n  --mod-font-family: var(--encore-body-font-stack, var(--font-family, inherit));\n}\n\n\n#mod-root {\n  display: contents;\n}\n\n/* --- adblock.css --- */\n\n\n\n.Root__top-bar [data-testid=\"upgrade-button\"],\nbutton[data-testid=\"upgrade-button\"],\na[data-testid=\"upgrade-button\"],\n[data-testid=\"top-bar-upgrade-button\"],\n[data-testid=\"action-bar-button-upgrade\"],\n.main-topBar-UpgradeButton,\n[data-testid=\"user-widget-dropdown-menu\"] [data-testid=\"loggedin_upgrade_menu\"],\n[id*=\"loggedin_upgrade_menu\"],\na[href*=\"spotify.com/premium\"]:not([data-testid=\"user-widget-link\"]),\na[href*=\"spotify.com/purchase\"]:not([data-testid=\"user-widget-link\"]),\nbutton[aria-label*=\"Upgrade\"]:not([data-testid*=\"user\"]),\nbutton[aria-label*=\"Улучшить\"]:not([data-testid*=\"user\"]),\na[aria-label*=\"Upgrade\"]:not([data-testid*=\"user\"]),\na[aria-label*=\"Улучшить\"]:not([data-testid*=\"user\"]) {\n  display: none !important;\n  opacity: 0 !important;\n  pointer-events: none !important;\n  width: 0 !important;\n  height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\n\n\n#leaderboard-ad-element,\n.uAHPSe7bihFdDS76WWIg,\n.VMAxhgsNK7QdtS6kLrYW,\n[data-testid=\"hpto-parent-container\"],\n.GBFjEce25V0Iu4r0ElZX,\n.main-leaderboardComponent-container,\n[data-testid=\"test-ref-div\"] {\n  display: none !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  overflow: hidden !important;\n}\n\n\ndiv[data-testid=\"ad-banner\"],\ndiv[data-testid=\"billboard-ad\"],\ndiv[data-testid=\"leaderboard-ad\"],\ndiv[data-testid=\"in-feed-ad\"],\n[data-testid=\"test-ad-container\"],\n[data-testid=\"home-upsell-card\"],\n.home-ads-container,\n[class*=\"home-ads-container\"],\n.b1RJ1EmDQKXxEdRfS3VV,\n.y8zgGn9TRryk8aSMwRag,\n.main-home-upsell,\n.main-billboardComponent-container,\n.banner-ad-container,\n.ad-iframe,\n.ad-placeholder,\n.sponsor-container,\n[class*=\"ad-container\"],\ndiv[data-testid*=\"upsell\"],\ndiv[data-testid*=\"ad-slot\"],\n[data-testid=\"home-ad-card\"],\n.GdrmVD6TSeSu2IGKWHm7 {\n  display: none !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  overflow: hidden !important;\n}\n\n\n[data-testid=\"leavebehinds-wrapper\"],\n[data-testid=\"leavebehind\"],\n[data-testid=\"leavebehinds-list-wrapper\"],\n[data-testid=\"leavebehinds-see-all\"],\ndiv[data-testid=\"feed-upsell-banner\"],\ndiv[data-testid=\"download-cta-banner\"],\n[class*=\"SponsoredPlaceholder\"],\n[class*=\"sponsored-container\"],\n[class*=\"AdvertContainer\"] {\n  display: none !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  overflow: hidden !important;\n}\n\n\n[data-testid=\"desktop-update-banner\"],\ndiv[data-testid=\"desktop-update-banner\"],\n.riCDTx8wwIkR8ilEuxOA,\n.desktop-update-notification,\n[class*=\"UpsellBanner\"] {\n  display: none !important;\n  height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n}\n\n\n.ZzU_KGHiP55yEoQV7TkV,\niframe[src*=\"sponsored-recommendations.spotify.com\"],\n[data-testid*=\"upsell-tooltip\"],\n[data-testid*=\"premium-upsell\"],\ndiv[class*=\"upsellTooltip\"],\ndiv[data-theme=\"encore-blue-set\"]:not(:has([role=\"menu\"])),\ndiv[data-theme=\"encore-blue\"]:not(:has([role=\"menu\"])),\ndiv[class*=\"tippy-box\"][data-theme*=\"blue\"]:not(:has([role=\"menu\"])),\ndiv[class*=\"tippy-box\"][data-theme*=\"announcement\"]:not(:has([role=\"menu\"])),\ndiv[class*=\"encore-announcement\"]:not(:has([role=\"menu\"])) {\n  display: none !important;\n  opacity: 0 !important;\n  pointer-events: none !important;\n  visibility: hidden !important;\n}\n\n\nul[role=\"menu\"] li:has(button[aria-label*=\"Скачать\"]),\nul[role=\"menu\"] li:has(button[aria-label*=\"Download\"]),\nul[role=\"menu\"] li:has(a[href*=\"premium\"]),\nul[role=\"menu\"] button:has(svg path[d*=\"M12 3a9\"]):not(#mod-player-download-btn) {\n  display: none !important;\n}\n\n\n[data-testid=\"ad-break-container\"],\n[class*=\"AdBreak\"],\n[class*=\"ad-break\"],\n[data-testid=\"video-ad-overlay\"],\n.main-adBreak-container,\n[data-testid=\"skippable-ad-circle-timer\"],\n[data-testid=\"skippable-ad-delay\"],\n.A_dgCpuNz1P_9_RPygVC,\n[data-testid=\"video-player-parking-surface\"] {\n  display: none !important;\n  pointer-events: none !important;\n  height: 0 !important;\n  width: 0 !important;\n}\n\n\nbody.mod-ad-playing [data-testid=\"video-player-parking-surface\"],\nbody.mod-ad-playing [data-testid=\"video-ad-overlay\"] {\n  opacity: 0 !important;\n  pointer-events: none !important;\n}\n\n/* --- modal.css --- */\n\n\n\n.mod-topbar-button {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  background-color: rgba(0, 0, 0, 0.54);\n  color: #b3b3b3;\n  border: none;\n  border-radius: 50%;\n  cursor: pointer;\n  margin-right: 8px;\n  margin-left: 4px;\n  transition: transform 0.2s cubic-bezier(0.3, 0, 0, 1), color 0.15s ease, background-color 0.15s ease;\n  position: relative;\n  flex-shrink: 0;\n  vertical-align: middle;\n  padding: 0;\n}\n\n.mod-topbar-button:hover {\n  background-color: rgba(255, 255, 255, 0.12);\n  color: #ffffff;\n  transform: scale(1.06);\n}\n\n.mod-topbar-button:active,\n.mod-topbar-button.active {\n  background-color: rgba(255, 255, 255, 0.18);\n  color: #ffffff;\n  transform: scale(0.96);\n}\n\n.mod-topbar-button svg {\n  width: 18px;\n  height: 18px;\n  display: block;\n  fill: currentColor;\n  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n\n.mod-topbar-button.spinning svg {\n  transform: rotate(360deg);\n}\n\n\n.mod-modal-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: rgba(0, 0, 0, 0.72);\n  backdrop-filter: blur(8px);\n  -webkit-backdrop-filter: blur(8px);\n  z-index: 999999;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  animation: modFadeIn 0.15s cubic-bezier(0.3, 0, 0, 1);\n}\n\n.mod-modal-overlay.closing {\n  animation: modFadeOut 0.15s cubic-bezier(0, 0, 0.2, 1) forwards;\n}\n\n.mod-modal-overlay.closing .mod-modal-dialog {\n  animation: modScaleDown 0.15s cubic-bezier(0, 0, 0.2, 1) forwards;\n}\n\n@keyframes modFadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n\n@keyframes modFadeOut {\n  from { opacity: 1; }\n  to { opacity: 0; }\n}\n\n\n.mod-modal-dialog {\n  width: 780px;\n  max-width: 92vw;\n  max-height: 84vh;\n  background-color: #121212;\n  border-radius: 12px;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  font-family: var(--mod-font-family, inherit);\n  animation: modScaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);\n}\n\n@keyframes modScaleUp {\n  from { opacity: 0; transform: scale(0.97); }\n  to { opacity: 1; transform: scale(1); }\n}\n\n@keyframes modScaleDown {\n  from { opacity: 1; transform: scale(1); }\n  to { opacity: 0; transform: scale(0.96); }\n}\n\n\n.mod-modal-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 20px 24px 14px 24px;\n  background-color: #121212;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n}\n\n.mod-modal-title-group {\n  display: flex;\n  flex-direction: column;\n}\n\n.mod-modal-title {\n  margin: 0;\n  font-family: var(--encore-title-font-stack, var(--font-family, inherit));\n  font-size: 20px;\n  font-weight: 700;\n  color: #ffffff;\n  letter-spacing: -0.04em;\n}\n\n.mod-modal-subtitle {\n  font-size: 13px;\n  color: #b3b3b3;\n  margin-top: 3px;\n}\n\n.mod-modal-close-btn {\n  background: transparent;\n  border: none;\n  color: #b3b3b3;\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s ease;\n  padding: 0;\n}\n\n.mod-modal-close-btn:hover {\n  background-color: rgba(255, 255, 255, 0.1);\n  color: #ffffff;\n  transform: scale(1.05);\n}\n\n\n.mod-tabs-nav {\n  display: flex;\n  align-items: center;\n  background-color: #121212;\n  padding: 12px 24px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n  gap: 8px;\n  overflow-x: hidden;\n  flex-wrap: nowrap;\n}\n\n.mod-tab-btn {\n  background-color: rgba(255, 255, 255, 0.07);\n  border: none;\n  color: #ffffff;\n  padding: 8px 16px;\n  font-size: 13px;\n  font-weight: 700;\n  border-radius: 9999px;\n  cursor: pointer;\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);\n  white-space: nowrap;\n  user-select: none;\n}\n\n.mod-tab-btn:hover {\n  background-color: rgba(255, 255, 255, 0.12);\n  transform: scale(1.02);\n}\n\n.mod-tab-btn:active {\n  transform: scale(0.97);\n}\n\n.mod-tab-btn.active {\n  background-color: #ffffff;\n  color: #000000;\n}\n\n.mod-tab-btn.active svg {\n  fill: #000000;\n}\n\n.mod-tab-btn svg {\n  width: 16px;\n  height: 16px;\n  fill: currentColor;\n  transition: fill 0.15s ease;\n}\n\n\n.mod-modal-body {\n  padding: 20px 24px;\n  overflow-y: auto;\n  overflow-x: hidden;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  max-height: calc(84vh - 140px);\n}\n\n.mod-tab-content {\n  display: none;\n  flex-direction: column;\n  gap: 12px;\n  animation: modFadeIn 0.15s ease;\n}\n\n.mod-tab-content.active {\n  display: flex;\n  animation: modTabEnter 0.18s cubic-bezier(0, 0, 0.2, 1);\n}\n\n@keyframes modTabEnter {\n  from { opacity: 0; transform: translateY(4px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n\n.mod-card {\n  padding: 16px 18px;\n  border-radius: 8px;\n  background-color: #181818;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.65);\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  transition: background-color 0.15s ease, border-color 0.15s ease;\n}\n\n.mod-card:hover {\n  background-color: #1e1e1e;\n  border-color: rgba(255, 255, 255, 0.12);\n}\n\n.mod-card-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.mod-card-title {\n  font-family: var(--encore-title-font-stack, var(--font-family, inherit));\n  font-size: 15px;\n  font-weight: 700;\n  color: #ffffff;\n  letter-spacing: -0.02em;\n}\n\n.mod-card-desc {\n  font-size: 13px;\n  color: #b3b3b3;\n  line-height: 1.5;\n}\n\n\n.mod-callout {\n  padding: 12px 16px;\n  border-radius: 8px;\n  background: rgba(30, 215, 96, 0.06);\n  border: 1px solid rgba(30, 215, 96, 0.2);\n  color: #d1d1d1;\n  font-size: 12px;\n  line-height: 1.45;\n  display: flex;\n  gap: 10px;\n  align-items: flex-start;\n}\n\n.mod-callout svg {\n  flex-shrink: 0;\n  margin-top: 1px;\n}\n\n\n.mod-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  padding: 7px 14px;\n  border-radius: 9999px;\n  font-size: 12px;\n  font-weight: 700;\n  border: none;\n  cursor: pointer;\n  transition: transform 0.15s ease, background-color 0.15s ease, color 0.15s ease;\n  user-select: none;\n}\n\n.mod-btn:hover {\n  transform: scale(1.03);\n}\n\n.mod-btn:active {\n  transform: scale(0.97);\n}\n\n.mod-btn-primary {\n  background-color: #1ed760;\n  color: #000000;\n}\n\n.mod-btn-primary:hover {\n  background-color: #1fdf64;\n}\n\n.mod-btn-secondary {\n  background-color: rgba(255, 255, 255, 0.08);\n  color: #ffffff;\n  border: 1px solid rgba(255, 255, 255, 0.12);\n}\n\n.mod-btn-secondary:hover {\n  background-color: rgba(255, 255, 255, 0.15);\n  border-color: rgba(255, 255, 255, 0.2);\n}\n\n.mod-btn-danger {\n  background-color: rgba(241, 94, 108, 0.12);\n  color: #f15e6c;\n  border: 1px solid rgba(241, 94, 108, 0.25);\n}\n\n.mod-btn-danger:hover {\n  background-color: rgba(241, 94, 108, 0.2);\n}\n\n\n.mod-pill-badge {\n  display: inline-flex;\n  align-items: center;\n  padding: 3px 10px;\n  border-radius: 9999px;\n  font-size: 11px;\n  font-weight: 700;\n  letter-spacing: 0.02em;\n  background: rgba(255, 255, 255, 0.08);\n  color: #ffffff;\n}\n\n\n.mod-path-box {\n  background-color: #121212;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 6px;\n  padding: 8px 12px;\n  font-family: Consolas, monospace;\n  font-size: 11.5px;\n  color: #1ed760;\n  word-break: break-all;\n}\n\n\n.mod-input {\n  background-color: #121212;\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 6px;\n  color: #ffffff;\n  padding: 7px 12px;\n  font-size: 12.5px;\n  outline: none;\n  flex: 1;\n  transition: border-color 0.15s ease;\n}\n\n.mod-input:focus {\n  border-color: #1ed760;\n}\n\n\n.mod-country-filters {\n  display: flex;\n  gap: 6px;\n  flex-wrap: wrap;\n  margin-top: 4px;\n}\n\n.mod-country-filter-btn {\n  background: rgba(255, 255, 255, 0.07);\n  border: none;\n  color: #ffffff;\n  padding: 6px 14px;\n  border-radius: 16px;\n  font-size: 12px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.15s ease;\n}\n\n.mod-country-filter-btn:hover {\n  background: rgba(255, 255, 255, 0.12);\n}\n\n.mod-country-filter-btn.active {\n  background: #ffffff;\n  color: #000000;\n}\n\n\n.mod-preset-item {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px;\n  border-radius: 6px;\n  background-color: rgba(255, 255, 255, 0.02);\n  border: 1px solid rgba(255, 255, 255, 0.05);\n  transition: background-color 0.15s ease, border-color 0.15s ease;\n}\n\n.mod-preset-item:hover {\n  background-color: rgba(255, 255, 255, 0.05);\n}\n\n.mod-preset-item.active {\n  background-color: rgba(30, 215, 96, 0.06);\n  border-color: rgba(30, 215, 96, 0.35);\n}\n\n.mod-preset-info {\n  display: flex;\n  flex-direction: column;\n}\n\n.mod-preset-name {\n  font-size: 13px;\n  font-weight: 600;\n  color: #ffffff;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.mod-preset-url {\n  font-size: 11px;\n  color: #888888;\n  font-family: Consolas, monospace;\n}\n\n\n.mod-proxy-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 6px 12px;\n  border-radius: 6px;\n  font-size: 12px;\n  font-weight: 600;\n}\n\n.mod-proxy-badge.success {\n  background: rgba(30, 215, 96, 0.12);\n  border: 1px solid rgba(30, 215, 96, 0.3);\n  color: #1ed760;\n}\n\n.mod-proxy-badge.error {\n  background: rgba(233, 20, 41, 0.12);\n  border: 1px solid rgba(233, 20, 41, 0.3);\n  color: #f15e6c;\n}\n\n.mod-proxy-badge.testing {\n  background: rgba(255, 255, 255, 0.08);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  color: #d1d1d1;\n}\n\n\n.mod-setting-item {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px;\n  background-color: rgba(255, 255, 255, 0.02);\n  border: 1px solid rgba(255, 255, 255, 0.05);\n  border-radius: 8px;\n}\n\n.mod-setting-info {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  padding-right: 14px;\n}\n\n.mod-setting-name {\n  font-size: 13.5px;\n  font-weight: 600;\n  color: #ffffff;\n}\n\n.mod-setting-desc {\n  font-size: 11.5px;\n  color: #a7a7a7;\n  margin-top: 2px;\n}\n\n\n.mod-switch {\n  position: relative;\n  display: inline-block;\n  width: 44px;\n  height: 24px;\n  flex-shrink: 0;\n  cursor: pointer;\n}\n\n.mod-switch input {\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n\n.mod-switch-slider {\n  position: absolute;\n  cursor: pointer;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: #535353;\n  border-radius: 24px;\n  transition: background-color 0.2s cubic-bezier(0.3, 0, 0, 1);\n}\n\n.mod-switch-slider:before {\n  position: absolute;\n  content: \"\";\n  height: 18px;\n  width: 18px;\n  left: 3px;\n  bottom: 3px;\n  background-color: #ffffff;\n  border-radius: 50%;\n  transition: transform 0.2s cubic-bezier(0.3, 0, 0, 1);\n}\n\n.mod-switch input:checked + .mod-switch-slider {\n  background-color: #1ed760;\n}\n\n.mod-switch input:checked + .mod-switch-slider:before {\n  transform: translateX(20px);\n}\n\n\n.mod-modal-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 14px 24px;\n  background-color: #121212;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n}\n\n.mod-modal-status-badge {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 12px;\n  color: #a7a7a7;\n}\n\n.mod-status-indicator {\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  background-color: #1ed760;\n  box-shadow: 0 0 8px rgba(30, 215, 96, 0.6);\n  flex-shrink: 0;\n}\n\n.mod-status-indicator.offline {\n  background-color: #e91429;\n  box-shadow: 0 0 8px rgba(233, 20, 41, 0.6);\n}\n\n.mod-modal-hotkey-hint {\n  font-size: 11px;\n  color: #6a6a6a;\n  background: rgba(255, 255, 255, 0.05);\n  padding: 3px 7px;\n  border-radius: 4px;\n  font-family: monospace;\n}\n\n\n\n\n.mod-bypass-banner {\n  background-color: #181818;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 8px;\n  padding: 16px 18px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  transition: border-color 0.2s ease, background-color 0.2s ease;\n}\n\n.mod-bypass-banner:hover {\n  border-color: rgba(255, 255, 255, 0.14);\n}\n\n.mod-bypass-status-row {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.mod-status-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 3px 10px;\n  border-radius: 9999px;\n  font-size: 11px;\n  font-weight: 700;\n  background: rgba(30, 215, 96, 0.12);\n  color: #1ed760;\n  border: 1px solid rgba(30, 215, 96, 0.25);\n  margin-left: auto;\n}\n\n.mod-status-dot {\n  width: 6px;\n  height: 6px;\n  border-radius: 50%;\n  background-color: #1ed760;\n  flex-shrink: 0;\n  display: inline-block;\n  vertical-align: middle;\n}\n\n.mod-status-dot.error,\n.mod-status-dot--error {\n  background-color: #f15e6c;\n}\n\n.mod-status-dot.muted,\n.mod-status-dot--muted {\n  background-color: #a7a7a7;\n}\n\n.mod-bypass-indicator {\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  background-color: #1ed760;\n  flex-shrink: 0;\n}\n\n.mod-bypass-title {\n  font-family: var(--encore-title-font-stack, var(--font-family, inherit));\n  font-size: 14px;\n  font-weight: 700;\n  color: #ffffff;\n  letter-spacing: -0.02em;\n}\n\n.mod-bypass-desc {\n  font-size: 12px;\n  color: #b3b3b3;\n  line-height: 1.5;\n}\n\n.mod-bypass-meta {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  margin-top: 4px;\n  padding-top: 10px;\n  border-top: 1px solid rgba(255, 255, 255, 0.05);\n}\n\n.mod-bypass-meta-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 11.5px;\n  color: #a7a7a7;\n}\n\n\n.mod-region-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n  margin-top: 6px;\n  max-height: 280px;\n  overflow-y: auto;\n  padding-right: 4px;\n}\n\n.mod-region-card {\n  background-color: #181818;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 6px;\n  padding: 10px 12px;\n  cursor: pointer;\n  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n  position: relative;\n  user-select: none;\n}\n\n.mod-region-card:hover {\n  background-color: #242424;\n  border-color: rgba(255, 255, 255, 0.2);\n  transform: translateY(-1px);\n}\n\n.mod-region-card.active {\n  background-color: #222222;\n  border-color: #1ed760;\n  box-shadow: 0 0 0 1px #1ed760;\n}\n\n.mod-region-card-top {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.mod-country-badge,\n.mod-region-code {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 26px;\n  height: 18px;\n  padding: 0 5px;\n  background: rgba(255, 255, 255, 0.08);\n  border-radius: 4px;\n  font-size: 10px;\n  font-weight: 700;\n  color: #ffffff;\n  letter-spacing: 0.04em;\n}\n\n.mod-region-card.active .mod-country-badge,\n.mod-region-card.active .mod-region-code {\n  background: #1ed760;\n  color: #000000;\n}\n\n.mod-region-radio {\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  border: 1.5px solid #727272;\n  position: relative;\n  transition: all 0.15s ease;\n}\n\n.mod-region-card.active .mod-region-radio {\n  border-color: #1ed760;\n  background-color: #1ed760;\n  box-shadow: inset 0 0 0 3px #181818;\n}\n\n.mod-region-name {\n  font-size: 13px;\n  font-weight: 700;\n  color: #ffffff;\n  line-height: 1.2;\n}\n\n.mod-region-hint {\n  font-size: 11px;\n  color: #888888;\n  line-height: 1.35;\n}\n\n\n.mod-steps-list {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  margin-top: 6px;\n}\n\n.mod-step-item {\n  display: flex;\n  gap: 12px;\n  align-items: flex-start;\n}\n\n.mod-step-num {\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  background: rgba(255, 255, 255, 0.08);\n  color: #1ed760;\n  font-size: 11px;\n  font-weight: 700;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  margin-top: 1px;\n}\n\n.mod-step-text {\n  font-size: 12px;\n  color: #d1d1d1;\n  line-height: 1.45;\n  flex: 1;\n}\n\n\n\n/* --- downloader.css --- */\n\n\n\n.mod-download-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  background: transparent;\n  color: #b3b3b3;\n  border: none;\n  border-radius: 50%;\n  cursor: pointer;\n  margin-left: 8px;\n  transition: transform 0.15s cubic-bezier(0.3, 0, 0, 1), color 0.15s ease;\n  position: relative;\n  flex-shrink: 0;\n  padding: 0;\n}\n\n.mod-download-btn:hover {\n  color: #ffffff;\n  transform: scale(1.05);\n}\n\n.mod-download-btn:active {\n  transform: scale(0.95);\n}\n\n.mod-download-btn svg {\n  width: 16px;\n  height: 16px;\n  display: block;\n  fill: currentColor;\n}\n\n\n.mod-download-btn.downloading {\n  color: #1ed760;\n  animation: modSpin 1.4s linear infinite;\n}\n\n@keyframes modSpin {\n  0% { transform: rotate(0deg); }\n  100% { transform: rotate(360deg); }\n}\n\n\n.mod-download-btn.downloaded {\n  color: #1ed760;\n}\n\n.mod-download-btn.downloaded:hover {\n  color: #1fdf64;\n  transform: scale(1.06);\n}\n\n\n.mod-action-counter {\n  display: inline-flex;\n  align-items: center;\n  font-size: 12px;\n  font-weight: 500;\n  color: #b3b3b3;\n  margin-left: 8px;\n  margin-right: 4px;\n  white-space: nowrap;\n  letter-spacing: -0.01em;\n  vertical-align: middle;\n  pointer-events: none;\n  user-select: none;\n}\n\n\n.mod-encore-circle-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  background: transparent;\n  border: none;\n  color: #b3b3b3;\n  cursor: pointer;\n  transition: transform 0.15s cubic-bezier(0.3, 0, 0, 1), color 0.15s ease, background-color 0.15s ease;\n  margin-left: 4px;\n  padding: 0;\n  vertical-align: middle;\n}\n\n.mod-encore-circle-btn:hover {\n  color: #ffffff;\n  background-color: rgba(255, 255, 255, 0.08);\n  transform: scale(1.06);\n}\n\n.mod-encore-circle-btn:active {\n  transform: scale(0.95);\n}\n\n.mod-encore-circle-btn svg {\n  width: 14px;\n  height: 14px;\n  display: block;\n  fill: currentColor;\n}\n\n.mod-encore-circle-btn.danger:hover {\n  color: #f15e6c;\n  background-color: rgba(241, 94, 108, 0.1);\n}\n\n\n.mod-encore-menu {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  margin-top: 6px;\n  background-color: #282828;\n  border-radius: 6px;\n  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);\n  padding: 4px;\n  min-width: 210px;\n  z-index: 999999;\n  display: flex;\n  flex-direction: column;\n  animation: modMenuFade 0.15s cubic-bezier(0.3, 0, 0, 1);\n}\n\n@keyframes modMenuFade {\n  from { opacity: 0; transform: translateY(-4px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n.mod-encore-menu-item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 9px 12px;\n  border-radius: 4px;\n  color: #eaeaea;\n  font-size: 13px;\n  font-weight: 500;\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  text-align: left;\n  width: 100%;\n  transition: background-color 0.12s ease, color 0.12s ease;\n}\n\n.mod-encore-menu-item:hover {\n  background-color: rgba(255, 255, 255, 0.1);\n  color: #ffffff;\n}\n\n.mod-encore-menu-item.danger {\n  color: #f15e6c;\n}\n\n.mod-encore-menu-item.danger:hover {\n  background-color: rgba(241, 94, 108, 0.15);\n  color: #ff6b7a;\n}\n\n.mod-encore-menu-item svg {\n  width: 16px;\n  height: 16px;\n  fill: currentColor;\n  flex-shrink: 0;\n}\n";
  }

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
  
  const registry = new PluginRegistry();
  
  const helloPlugin = {
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
  
  const adblockPlugin = {
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
  
  const settingsUiPlugin = {
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
  
  const companionPlugin = {
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
  
  const downloaderUiPlugin = {
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
  
  console.log('[Mod] Bootstrapping...');
  injectStyles();
  
  registry.register(helloPlugin);
  registry.register(adblockPlugin);
  registry.register(settingsUiPlugin);
  registry.register(companionPlugin);
  registry.register(downloaderUiPlugin);

  function onReady() {
    console.log('[Mod] Spotify DOM Ready. Starting modules...');
    
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
