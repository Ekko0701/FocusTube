/* FocusTube content script. Runs at document_start on youtube.com / m.youtube.com.
   Responsibilities:
   - mirror settings onto <html data-ft-*> attributes (content.css does the hiding)
   - page-type detection for SPA navigation
   - redirects (home, Shorts), autoplay/theater automation, ad-skip clicks
   - keyword / channel / regex filtering of video cards and comments
   - focus block overlay, scheduled blocks, opening delay */
(() => {
  'use strict';
  const api = typeof browser !== 'undefined' ? browser : chrome;
  const html = document.documentElement;
  const IS_MOBILE = location.hostname.startsWith('m.');
  const LANG = (navigator.language || 'en').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  const T = {
    ko: {
      blocked: 'YouTube가 차단되어 있습니다',
      blockedUntil: '집중 세션이 끝날 때까지 남은 시간',
      scheduled: '예약된 집중 시간입니다',
      scheduledHint: '설정한 시간대에는 YouTube를 사용할 수 없습니다.',
      delayTitle: '잠깐 멈추고 생각해 보세요',
      delayHint: '정말 지금 YouTube를 봐야 하나요?',
      continueBtn: '계속하기',
      leave: '나가기',
      shortsBlocked: 'Shorts가 차단되어 있습니다'
    },
    en: {
      blocked: 'YouTube is blocked',
      blockedUntil: 'Time left in your focus session',
      scheduled: 'This is a scheduled focus time',
      scheduledHint: 'YouTube is unavailable during the hours you set.',
      delayTitle: 'Pause for a moment',
      delayHint: 'Do you really need YouTube right now?',
      continueBtn: 'Continue',
      leave: 'Leave',
      shortsBlocked: 'Shorts are blocked'
    }
  }[LANG];

  let S = FT.withDefaults({});
  let rulesVersion = 0;
  let compiledRules = [];
  let lastHref = '';
  let lastPage = '';
  let navToken = 0;
  let overlayTimer = null;
  let delayActive = false;
  let scanTimer = null;

  /* ------------------------------------------------------------------ settings */
  async function loadSettings() {
    try {
      const { settings } = await api.storage.local.get('settings');
      S = FT.withDefaults(settings);
    } catch (e) {
      S = FT.withDefaults({});
    }
    compileRules();
    applyAll();
  }

  api.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes.settings) return;
    S = FT.withDefaults(changes.settings.newValue);
    compileRules();
    applyAll();
  });

  /* ------------------------------------------------------------------ page type */
  function pageType() {
    const p = location.pathname;
    if (p === '/' || p === '/index') return 'home';
    if (p.startsWith('/watch')) return 'watch';
    if (p.startsWith('/shorts')) return 'shorts';
    if (p.startsWith('/results')) return 'search';
    if (p.startsWith('/feed/subscriptions')) return 'subscriptions';
    if (p.startsWith('/feed/history') || p.startsWith('/feed/library') || p.startsWith('/feed/you') || p.startsWith('/feed/playlists')) return 'library';
    if (p.startsWith('/feed/trending') || p.startsWith('/feed/explore')) return 'explore';
    if (p.startsWith('/playlist')) return 'playlist';
    if (p.startsWith('/channel/') || p.startsWith('/@') || p.startsWith('/c/') || p.startsWith('/user/')) return 'channel';
    return 'other';
  }

  function homeTarget() {
    switch (S.homeRedirect) {
      case 'library': return '/feed/you';
      case 'history': return '/feed/history';
      case 'custom': return /^https?:\/\//.test(S.homeRedirectUrl) ? S.homeRedirectUrl : '/feed/subscriptions';
      default: return '/feed/subscriptions';
    }
  }

  /* ------------------------------------------------------------------ attributes */
  function setAttr(name, on, value) {
    const attr = 'data-ft-' + name;
    if (on) html.setAttribute(attr, value == null ? '' : String(value));
    else html.removeAttribute(attr);
  }

  function applyAttributes() {
    const on = S.enabled;
    setAttr('mobile', IS_MOBILE);
    setAttr('page', true, pageType());
    setAttr('hide-shorts', on && S.hideShorts);
    setAttr('hide-notifications', on && S.hideNotifications);
    setAttr('hide-create-button', on && S.hideCreateButton);
    setAttr('hide-sidebar', on && S.hideSidebar);
    setAttr('hide-explore-trending', on && S.hideExploreTrending);
    setAttr('hide-chips', on && S.hideChips);
    setAttr('hide-ads', on && S.hideAds);
    setAttr('thumbnails', on && S.thumbnails !== 'normal', S.thumbnails);
    setAttr('hide-view-counts', on && S.hideViewCounts);
    setAttr('hide-durations', on && S.hideDurations);
    setAttr('hide-watched', on && S.hideWatchedVideos);
    setAttr('home', on && S.homeMode !== 'normal', S.homeMode);
    setAttr('search-hide-shelves', on && S.searchHideShelves);
    setAttr('search-hide-channels', on && S.searchHideChannels);
    setAttr('search-hide-playlists', on && S.searchHidePlaylists);
    setAttr('hide-related', on && S.hideRelated);
    setAttr('hide-comments', on && S.hideComments);
    setAttr('hide-end-screens', on && S.hideEndScreens);
    setAttr('hide-live-chat', on && S.hideLiveChat);
    setAttr('hide-description', on && S.hideDescription);
    setAttr('hide-info-cards', on && S.hideInfoCards);
    setAttr('hide-merch', on && S.hideMerch);
    setAttr('hide-playlist-panel', on && S.hidePlaylistPanel);
    setAttr('channel-hide-featured', on && S.channelHideFeatured);
  }

  /* ------------------------------------------------------------------ navigation */
  function onNavigate() {
    const page = pageType();
    navToken++;
    applyAttributes();
    if (!S.enabled) return;

    // Home redirect
    if (page === 'home' && S.homeMode === 'redirect') {
      location.replace(homeTarget());
      return;
    }
    // Shorts handling
    if (page === 'shorts') {
      const id = location.pathname.split('/')[2];
      if (S.shortsMode === 'watch' && id) { location.replace('/watch?v=' + encodeURIComponent(id)); return; }
      if (S.shortsMode === 'block' || S.hideShorts && S.shortsMode !== 'allow') {
        location.replace(S.homeMode === 'redirect' ? homeTarget() : '/feed/subscriptions');
        return;
      }
    }
    if (page === 'watch') {
      const token = navToken;
      let tries = 0;
      const tick = () => {
        if (token !== navToken || tries++ > 20) return;
        watchAutomation();
        setTimeout(tick, 700);
      };
      setTimeout(tick, 300);
    }
    scheduleScan();
  }

  function watchAutomation() {
    if (S.disableAutoplayNext) {
      const d = document.querySelector('.ytp-autonav-toggle-button[aria-checked="true"]');
      if (d) d.click();
      const m = document.querySelector('.ytm-autonav-toggle-button-container[aria-pressed="true"]');
      if (m) m.click();
    }
    if (S.autoTheater && !IS_MOBILE) {
      const flexy = document.querySelector('ytd-watch-flexy');
      if (flexy && !flexy.hasAttribute('theater') && !flexy.hasAttribute('fullscreen')) {
        const btn = document.querySelector('.ytp-size-button');
        if (btn) btn.click();
      }
    }
  }

  function pollNavigation() {
    if (location.href !== lastHref) {
      lastHref = location.href;
      const page = pageType();
      if (page !== lastPage || page === 'watch' || page === 'shorts' || page === 'search') {
        lastPage = page;
        onNavigate();
      } else {
        applyAttributes();
      }
      checkBlock();
    }
  }
  window.addEventListener('yt-navigate-finish', pollNavigation, true);
  window.addEventListener('popstate', () => setTimeout(pollNavigation, 50), true);
  setInterval(pollNavigation, 400);

  /* ------------------------------------------------------------------ ad skip */
  setInterval(() => {
    if (!S.enabled || !S.autoSkipAds) return;
    const btn = document.querySelector('.ytp-skip-ad-button, .ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-ad-skip-button-slot button, button[class*="ytp-ad-skip"]');
    if (btn) btn.click();
  }, 500);

  /* ------------------------------------------------------------------ filters */
  function compileRules() {
    rulesVersion++;
    compiledRules = [];
    for (const r of S.filterRules) {
      if (!r || !r.value) continue;
      const v = String(r.value).trim();
      if (!v) continue;
      let test;
      if (r.type === 'regex') {
        try { const re = new RegExp(v, 'i'); test = (t) => re.test(t.title) || re.test(t.channel); } catch (e) { continue; }
      } else if (r.type === 'channel') {
        const lv = v.toLowerCase().replace(/^@/, '');
        test = (t) => t.channelId.toLowerCase() === lv || t.channel.toLowerCase() === lv || t.handle.toLowerCase() === lv;
      } else {
        const lv = v.toLowerCase();
        test = (t) => t.title.toLowerCase().includes(lv) || t.channel.toLowerCase().includes(lv);
      }
      compiledRules.push({ test, scope: r.scope || 'both' });
    }
    // Reset previous verdicts so they are re-evaluated with the new rule set.
    document.querySelectorAll('[data-ft-checked]').forEach((el) => {
      el.removeAttribute('data-ft-checked');
      el.removeAttribute('data-ft-hidden');
    });
  }

  const VIDEO_CARDS = 'yt-lockup-view-model, ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ytd-playlist-video-renderer, ytd-playlist-panel-video-renderer, ytd-reel-item-renderer, ytd-compact-playlist-renderer, ytm-rich-item-renderer, ytm-video-with-context-renderer, ytm-compact-video-renderer, ytm-playlist-video-renderer, ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2';
  const COMMENT_CARDS = 'ytd-comment-thread-renderer, ytd-comment-view-model, ytm-comment-thread-renderer, ytm-comment-renderer';

  function textOf(el, sel) {
    const n = el.querySelector(sel);
    return n ? (n.getAttribute('title') || n.textContent || '').trim() : '';
  }

  function cardInfo(el, isComment) {
    const info = { title: '', channel: '', channelId: '', handle: '' };
    if (isComment) {
      info.title = textOf(el, '#content-text, .comment-text, yt-attributed-string');
      info.channel = textOf(el, '#author-text, .comment-author, a[href^="/@"], a[href^="/channel/"]');
    } else {
      info.title = textOf(el, '#video-title, .media-item-headline, .ytLockupMetadataViewModelTitle, h3[title], h3, a[title]');
      info.channel = textOf(el, 'ytd-channel-name #text, ytd-channel-name a, .ytContentMetadataViewModelMetadataRow:first-child .ytContentMetadataViewModelMetadataText, .ytm-badge-and-byline-renderer, .byline-separated-item, .media-item-metadata .ytm-badge-and-byline-renderer:first-child');
    }
    const link = el.querySelector('a[href^="/channel/"], a[href^="/@"], a[href^="/c/"], a[href^="/user/"]');
    if (link) {
      const href = link.getAttribute('href') || '';
      const m1 = href.match(/^\/channel\/([^/?#]+)/);
      const m2 = href.match(/^\/@([^/?#]+)/);
      if (m1) info.channelId = m1[1];
      if (m2) info.handle = m2[1];
      if (!info.channel) info.channel = (link.textContent || '').trim();
    }
    return info;
  }

  function scanFilters() {
    if (!S.enabled) return;
    const ver = String(rulesVersion);
    const page = pageType();
    const hasRules = compiledRules.length > 0;

    // Mobile related-videos section on watch pages has no stable identifier; tag it by content.
    if (IS_MOBILE && page === 'watch' && S.hideRelated) {
      document.querySelectorAll('ytm-single-column-watch-next-results-renderer ytm-item-section-renderer:not([data-ft-related])').forEach((sec) => {
        if (sec.getAttribute('section-identifier') === 'comments-entry-point' || sec.getAttribute('section-identifier') === 'comment-item-section') return;
        if (sec.querySelector('ytm-video-with-context-renderer, ytm-compact-video-renderer, ytm-rich-item-renderer, ytm-shelf-renderer')) sec.setAttribute('data-ft-related', '');
      });
    }
    // "Shorts" tabs by text: channel tabs (both layouts) and the mobile bottom pivot bar.
    if (S.hideShorts || (page === 'channel' && S.channelHideShortsTab)) {
      const sel = (page === 'channel' || S.channelHideShortsTab ? 'yt-tab-shape:not([data-ft-shorts-tab]), tp-yt-paper-tab:not([data-ft-shorts-tab]), ytm-tab-renderer:not([data-ft-shorts-tab]), .tab-header:not([data-ft-shorts-tab]), ' : '') +
        (S.hideShorts ? 'ytm-pivot-bar-item-renderer:not([data-ft-shorts-tab]), ytd-guide-entry-renderer:not([data-ft-shorts-tab]), ytd-mini-guide-entry-renderer:not([data-ft-shorts-tab])' : '');
      if (sel) document.querySelectorAll(sel.replace(/,\s*$/, '')).forEach((tab) => {
        const t = (tab.getAttribute('tab-title') || tab.getAttribute('aria-label') || tab.textContent || '').trim().toLowerCase();
        if (t === 'shorts' || t === '쇼츠') tab.setAttribute('data-ft-shorts-tab', '');
      });
    }
    if (!hasRules) return;

    document.querySelectorAll(VIDEO_CARDS).forEach((el) => {
      if (el.getAttribute('data-ft-checked') === ver) return;
      el.setAttribute('data-ft-checked', ver);
      const info = cardInfo(el, false);
      if (!info.title && !info.channel) { el.removeAttribute('data-ft-checked'); return; }
      for (const r of compiledRules) {
        if (r.scope === 'comments') continue;
        if (r.test(info)) { el.setAttribute('data-ft-hidden', ''); return; }
      }
    });
    if (S.filterComments) {
      document.querySelectorAll(COMMENT_CARDS).forEach((el) => {
        if (el.getAttribute('data-ft-checked') === ver) return;
        el.setAttribute('data-ft-checked', ver);
        const info = cardInfo(el, true);
        if (!info.title && !info.channel) { el.removeAttribute('data-ft-checked'); return; }
        for (const r of compiledRules) {
          if (r.scope === 'videos') continue;
          if (r.test(info)) { el.setAttribute('data-ft-hidden', ''); return; }
        }
      });
    }
  }

  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(() => { scanTimer = null; scanFilters(); }, 150);
  }

  const observer = new MutationObserver(scheduleScan);
  function startObserver() {
    if (document.body) observer.observe(document.body, { childList: true, subtree: true, characterData: false });
    else document.addEventListener('DOMContentLoaded', startObserver, { once: true });
  }
  startObserver();

  /* ------------------------------------------------------------------ overlay */
  function overlay(kind) {
    let el = document.getElementById('ft-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ft-overlay';
      (document.body || html).appendChild(el);
    }
    el.setAttribute('data-kind', kind);
    return el;
  }
  function removeOverlay(kind) {
    const el = document.getElementById('ft-overlay');
    if (el && (!kind || el.getAttribute('data-kind') === kind)) el.remove();
  }
  function fmt(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }
  function pauseVideos() { document.querySelectorAll('video').forEach((v) => { try { v.pause(); } catch (e) {} }); }
  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

  function scheduledBlockActive(now) {
    const day = now.getDay();
    const mins = now.getHours() * 60 + now.getMinutes();
    const toMin = (t) => { const [h, m] = String(t || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
    return S.schedules.some((sc) => {
      if (!sc || !sc.enabled || !Array.isArray(sc.days)) return false;
      const start = toMin(sc.start), end = toMin(sc.end);
      if (start === end) return false;
      if (start < end) return sc.days.includes(day) && mins >= start && mins < end;
      // Overnight range (e.g. 22:00 → 06:00): today after start, or previous day before end.
      const prev = (day + 6) % 7;
      return (sc.days.includes(day) && mins >= start) || (sc.days.includes(prev) && mins < end);
    });
  }

  function checkBlock() {
    if (!S.enabled) { setAttr('blocked', false); removeOverlay('block'); return; }
    const now = Date.now();
    const temp = S.blockUntil && S.blockUntil > now;
    const sched = scheduledBlockActive(new Date(now));
    if (!temp && !sched) { setAttr('blocked', false); removeOverlay('block'); return; }

    if (/^https?:\/\//.test(S.blockRedirectUrl)) { location.replace(S.blockRedirectUrl); return; }
    setAttr('blocked', true);
    pauseVideos();
    const el = overlay('block');
    const custom = S.blockMessage ? '<p>' + escapeHtml(S.blockMessage) + '</p>' : '';
    if (temp) {
      el.innerHTML = '<div class="ft-badge">' + ICON + '</div><h1>' + T.blocked + '</h1><p>' + T.blockedUntil + '</p><div class="ft-timer">' + fmt(S.blockUntil - now) + '</div>' + custom;
    } else {
      el.innerHTML = '<div class="ft-badge">' + ICON + '</div><h1>' + T.scheduled + '</h1><p>' + T.scheduledHint + '</p>' + custom;
    }
  }
  setInterval(checkBlock, 1000);

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  function maybeDelay() {
    if (!S.enabled || !S.delaySeconds || delayActive) return;
    if (S.delayOncePerSession) {
      try { if (sessionStorage.getItem('ft-delay-done') === '1') return; } catch (e) {}
    }
    if (html.hasAttribute('data-ft-blocked')) return;
    delayActive = true;
    setAttr('delaying', true);
    pauseVideos();
    let remaining = Math.max(1, Math.min(600, Number(S.delaySeconds) || 0));
    const el = overlay('delay');
    const render = () => {
      el.innerHTML = '<div class="ft-badge">' + ICON + '</div><h1>' + T.delayTitle + '</h1><p>' + T.delayHint + '</p><div class="ft-timer">' + remaining + '</div>' +
        (remaining <= 0 ? '<button id="ft-continue">' + T.continueBtn + '</button>' : '') +
        '<button id="ft-leave">' + T.leave + '</button>';
      const c = el.querySelector('#ft-continue');
      if (c) c.addEventListener('click', finish);
      el.querySelector('#ft-leave').addEventListener('click', () => { history.length > 1 ? history.back() : location.replace('about:blank'); });
    };
    const finish = () => {
      clearInterval(overlayTimer);
      try { sessionStorage.setItem('ft-delay-done', '1'); } catch (e) {}
      setAttr('delaying', false);
      removeOverlay('delay');
      delayActive = false;
      pauseVideos();
    };
    render();
    overlayTimer = setInterval(() => {
      remaining--;
      if (remaining <= 0) { clearInterval(overlayTimer); remaining = 0; render(); return; }
      render();
    }, 1000);
  }

  /* ------------------------------------------------------------------ boot */
  function applyAll() {
    applyAttributes();
    lastHref = '';
    pollNavigation();
    checkBlock();
    scheduleScan();
  }

  loadSettings().then(() => {
    const start = () => { checkBlock(); maybeDelay(); };
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
  });
})();
