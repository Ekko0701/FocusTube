/* FocusTube popup: settings UI. All state lives in browser.storage.local under "settings". */
(() => {
  'use strict';
  const api = typeof browser !== 'undefined' ? browser : chrome;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const LANG = (navigator.language || 'en').toLowerCase().startsWith('ko') ? 'ko' : 'en';

  /* ------------------------------------------------------------------ i18n */
  const L = {
    ko: {
      tagline: 'YouTube 방해 요소 제거', tabHide: '숨기기', tabFilters: '필터', tabFocus: '집중', tabPresets: '프리셋', tabMore: '더보기',
      lockTitle: '설정 잠김', lockHint: 'PIN을 입력하면 설정을 변경할 수 있습니다.', unlock: '잠금 해제', wrongPin: 'PIN이 올바르지 않습니다.',
      secGlobal: '전체', secHome: '홈', secSearch: '검색', secWatch: '동영상 페이지', secShorts: 'Shorts', secChannel: '채널',
      hideShorts: 'Shorts 숨기기', hideShortsSub: '피드, 검색, 사이드바, 하단 탭',
      hideNotifications: '알림 버튼 숨기기', hideCreateButton: '만들기(+) 버튼 숨기기', hideSidebar: '사이드바 숨기기', hideExploreTrending: '탐색/인기 숨기기',
      hideChips: '카테고리 칩 숨기기', hideAds: '광고 배너/프로모션 숨기기', autoSkipAds: '동영상 광고 자동 건너뛰기', autoSkipAdsSub: '"건너뛰기" 버튼이 나타나면 자동 클릭',
      thumbnails: '썸네일', thumbNormal: '기본', thumbGray: '흑백', thumbBlur: '흐림', thumbHidden: '숨김',
      hideViewCounts: '조회수/날짜 숨기기', hideDurations: '재생 시간 숨기기', hideWatchedVideos: '이미 본 동영상 숨기기',
      homeMode: '홈 피드', homeNormal: '그대로', homeHideFeed: '피드 숨기기', homeRedirect: '리디렉션',
      homeRedirectTo: '리디렉션 대상', toSubs: '구독', toLibrary: '내 콘텐츠', toHistory: '시청 기록', toCustom: '직접 입력', homeRedirectUrl: '사용자 지정 URL',
      searchHideShelves: '추천 섹션 숨기기', searchHideShelvesSub: '"다른 사람들이 본 동영상" 등', searchHideChannels: '채널 결과 숨기기', searchHidePlaylists: '재생목록 결과 숨기기',
      hideRelated: '관련/추천 동영상 숨기기', hideComments: '댓글 숨기기', hideEndScreens: '엔드 스크린 숨기기', hideLiveChat: '실시간 채팅 숨기기',
      hideDescription: '설명 숨기기', hideInfoCards: '정보 카드 숨기기', hideMerch: '상품/기부 섹션 숨기기', hidePlaylistPanel: '재생목록 패널 숨기기',
      autoTheater: '극장 모드 자동 적용', autoTheaterSub: '데스크톱 레이아웃(iPad/Mac)', disableAutoplayNext: '다음 동영상 자동재생 끄기',
      shortsMode: 'Shorts 페이지', shortsAllow: '허용', shortsBlock: '차단', shortsWatch: '일반 플레이어로 열기',
      channelHideShortsTab: '채널의 Shorts 탭 숨기기', channelHideFeatured: '채널 대표 동영상 숨기기',
      filtersHint: '키워드, 채널(@핸들, 채널 ID, 이름) 또는 정규식과 일치하는 동영상·댓글을 숨깁니다.',
      ruleKeyword: '키워드', ruleChannel: '채널', ruleRegex: '정규식', scopeBoth: '동영상+댓글', scopeVideos: '동영상만', scopeComments: '댓글만',
      rulePlaceholder: '예: 먹방, @channel, ^\\[광고\\]', add: '추가', filterComments: '댓글에도 필터 적용',
      blockNow: '지금 차단하기', custom: '직접 입력', minutes: '분', start: '시작', stopBlock: '차단 해제', blockedFor: '차단 중 · 남은 시간',
      schedules: '예약 차단', addSchedule: '+ 예약 추가', blockOptions: '차단 화면', blockMessage: '차단 메시지', blockMessagePh: '예: 지금은 공부 시간!',
      blockRedirect: '차단 시 이동할 URL (선택)', delay: '열기 지연', delaySeconds: 'YouTube 열기 전 대기', delayOnce: '탭당 한 번만', off: '끔',
      presetsHint: '프리셋을 적용하면 숨기기 옵션이 한 번에 바뀝니다. 필터, 예약, PIN은 유지됩니다.',
      pMinimal: '미니멀', pMinimalD: '동영상만 남기고 전부 숨김', pWork: '업무', pWorkD: '구독으로 리디렉션, Shorts 차단, 10초 지연',
      pStudy: '공부', pStudyD: '흑백 썸네일, 극장 모드, 15초 지연', pRelax: '휴식', pRelaxD: 'Shorts·광고·알림만 숨김',
      customPresets: '내 프리셋', presetName: '프리셋 이름', saveCurrent: '현재 설정 저장', apply: '적용',
      security: '보안', pinSet: 'PIN이 설정되어 있습니다. 제거하려면 현재 PIN을 입력하세요.', pinNone: 'PIN 없음. 설정하면 팝업을 열 때 PIN을 요구합니다.', pinPh: '4~8자리 숫자', setPin: 'PIN 설정', removePin: 'PIN 제거',
      backup: '백업 / 복원', exportBtn: '내보내기', copy: '복사', importBtn: '가져오기', exported: '아래 JSON을 복사해 보관하세요.', copied: '복사되었습니다.', imported: '설정을 가져왔습니다.', importError: 'JSON을 읽을 수 없습니다.',
      reset: '초기화', resetAll: '모든 설정 초기화', resetConfirm: '모든 설정을 초기화할까요?', about: 'FocusTube는 Safari에서 youtube.com과 m.youtube.com에만 적용됩니다. YouTube 앱에는 적용되지 않습니다.',
      days: ['일', '월', '화', '수', '목', '금', '토']
    },
    en: {
      tagline: 'Distraction-free YouTube', tabHide: 'Hide', tabFilters: 'Filters', tabFocus: 'Focus', tabPresets: 'Presets', tabMore: 'More',
      lockTitle: 'Settings locked', lockHint: 'Enter your PIN to change settings.', unlock: 'Unlock', wrongPin: 'Wrong PIN.',
      secGlobal: 'Everywhere', secHome: 'Home', secSearch: 'Search', secWatch: 'Video page', secShorts: 'Shorts', secChannel: 'Channels',
      hideShorts: 'Hide Shorts', hideShortsSub: 'Feeds, search, sidebar, bottom tab',
      hideNotifications: 'Hide notifications button', hideCreateButton: 'Hide Create (+) button', hideSidebar: 'Hide sidebar', hideExploreTrending: 'Hide Explore / Trending',
      hideChips: 'Hide category chips', hideAds: 'Hide ad banners & promos', autoSkipAds: 'Auto-skip video ads', autoSkipAdsSub: 'Clicks "Skip" as soon as it appears',
      thumbnails: 'Thumbnails', thumbNormal: 'Normal', thumbGray: 'Grayscale', thumbBlur: 'Blur', thumbHidden: 'Hidden',
      hideViewCounts: 'Hide view counts / dates', hideDurations: 'Hide durations', hideWatchedVideos: 'Hide already-watched videos',
      homeMode: 'Home feed', homeNormal: 'Normal', homeHideFeed: 'Hide feed', homeRedirect: 'Redirect',
      homeRedirectTo: 'Redirect to', toSubs: 'Subscriptions', toLibrary: 'Library', toHistory: 'History', toCustom: 'Custom URL', homeRedirectUrl: 'Custom URL',
      searchHideShelves: 'Hide suggestion shelves', searchHideShelvesSub: '"People also watched", "For you"…', searchHideChannels: 'Hide channel results', searchHidePlaylists: 'Hide playlist results',
      hideRelated: 'Hide related / recommended', hideComments: 'Hide comments', hideEndScreens: 'Hide end screens', hideLiveChat: 'Hide live chat',
      hideDescription: 'Hide description', hideInfoCards: 'Hide info cards', hideMerch: 'Hide merch / donation shelves', hidePlaylistPanel: 'Hide playlist panel',
      autoTheater: 'Auto theater mode', autoTheaterSub: 'Desktop layout (iPad / Mac)', disableAutoplayNext: 'Turn off autoplay next',
      shortsMode: 'Shorts page', shortsAllow: 'Allow', shortsBlock: 'Block', shortsWatch: 'Open in normal player',
      channelHideShortsTab: 'Hide Shorts tab on channels', channelHideFeatured: 'Hide channel featured video',
      filtersHint: 'Hide videos and comments matching a keyword, a channel (@handle, channel ID or name) or a regular expression.',
      ruleKeyword: 'Keyword', ruleChannel: 'Channel', ruleRegex: 'Regex', scopeBoth: 'Videos + comments', scopeVideos: 'Videos only', scopeComments: 'Comments only',
      rulePlaceholder: 'e.g. mukbang, @channel, ^\\[AD\\]', add: 'Add', filterComments: 'Also filter comments',
      blockNow: 'Block now', custom: 'Custom', minutes: 'minutes', start: 'Start', stopBlock: 'Stop block', blockedFor: 'Blocked · time left',
      schedules: 'Scheduled blocks', addSchedule: '+ Add schedule', blockOptions: 'Block screen', blockMessage: 'Block message', blockMessagePh: 'e.g. Study time!',
      blockRedirect: 'Redirect URL when blocked (optional)', delay: 'Opening delay', delaySeconds: 'Wait before opening YouTube', delayOnce: 'Once per tab', off: 'Off',
      presetsHint: 'A preset changes the hide options at once. Filters, schedules and PIN are kept.',
      pMinimal: 'Minimal', pMinimalD: 'Only the video. Everything else hidden', pWork: 'Work', pWorkD: 'Home → Subscriptions, Shorts blocked, 10s delay',
      pStudy: 'Study', pStudyD: 'Grayscale thumbnails, theater mode, 15s delay', pRelax: 'Relax', pRelaxD: 'Only Shorts, ads and notifications hidden',
      customPresets: 'My presets', presetName: 'Preset name', saveCurrent: 'Save current', apply: 'Apply',
      security: 'Security', pinSet: 'A PIN is set. Enter it to remove.', pinNone: 'No PIN. Set one to require it when opening this popup.', pinPh: '4–8 digits', setPin: 'Set PIN', removePin: 'Remove PIN',
      backup: 'Backup / restore', exportBtn: 'Export', copy: 'Copy', importBtn: 'Import', exported: 'Copy the JSON below to keep it.', copied: 'Copied.', imported: 'Settings imported.', importError: 'Could not parse JSON.',
      reset: 'Reset', resetAll: 'Reset all settings', resetConfirm: 'Reset all settings?', about: 'FocusTube only applies to youtube.com and m.youtube.com in Safari, not the YouTube app.',
      days: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    }
  }[LANG];
  const t = (k) => (k in L ? L[k] : k);

  /* ------------------------------------------------------------------ hide tab schema */
  const SECTIONS = [
    { title: 'secGlobal', items: [
      { key: 'hideShorts', sub: 'hideShortsSub' },
      { key: 'hideNotifications' }, { key: 'hideCreateButton' }, { key: 'hideSidebar' }, { key: 'hideExploreTrending' },
      { key: 'hideChips' }, { key: 'hideAds' }, { key: 'autoSkipAds', sub: 'autoSkipAdsSub' },
      { key: 'thumbnails', type: 'select', options: [['normal', 'thumbNormal'], ['grayscale', 'thumbGray'], ['blur', 'thumbBlur'], ['hidden', 'thumbHidden']] },
      { key: 'hideViewCounts' }, { key: 'hideDurations' }, { key: 'hideWatchedVideos' }
    ] },
    { title: 'secHome', items: [
      { key: 'homeMode', type: 'select', options: [['normal', 'homeNormal'], ['hideFeed', 'homeHideFeed'], ['redirect', 'homeRedirect']] },
      { key: 'homeRedirect', label: 'homeRedirectTo', type: 'select', options: [['subscriptions', 'toSubs'], ['library', 'toLibrary'], ['history', 'toHistory'], ['custom', 'toCustom']], showIf: (s) => s.homeMode === 'redirect' },
      { key: 'homeRedirectUrl', type: 'url', showIf: (s) => s.homeMode === 'redirect' && s.homeRedirect === 'custom' }
    ] },
    { title: 'secSearch', items: [
      { key: 'searchHideShelves', sub: 'searchHideShelvesSub' }, { key: 'searchHideChannels' }, { key: 'searchHidePlaylists' }
    ] },
    { title: 'secWatch', items: [
      { key: 'hideRelated' }, { key: 'hideComments' }, { key: 'hideEndScreens' }, { key: 'hideLiveChat' },
      { key: 'hideDescription' }, { key: 'hideInfoCards' }, { key: 'hideMerch' }, { key: 'hidePlaylistPanel' },
      { key: 'autoTheater', sub: 'autoTheaterSub' }, { key: 'disableAutoplayNext' }
    ] },
    { title: 'secShorts', items: [
      { key: 'shortsMode', type: 'select', options: [['allow', 'shortsAllow'], ['block', 'shortsBlock'], ['watch', 'shortsWatch']] }
    ] },
    { title: 'secChannel', items: [ { key: 'channelHideShortsTab' }, { key: 'channelHideFeatured' } ] }
  ];

  const PRESET_META = [
    ['minimal', 'pMinimal', 'pMinimalD'], ['work', 'pWork', 'pWorkD'], ['study', 'pStudy', 'pStudyD'], ['relax', 'pRelax', 'pRelaxD']
  ];

  /* ------------------------------------------------------------------ state */
  let S = FT.withDefaults({});
  let saveTimer = null;

  async function load() {
    const { settings } = await api.storage.local.get('settings');
    S = FT.withDefaults(settings);
  }
  function save(immediate) {
    clearTimeout(saveTimer);
    const doSave = () => api.storage.local.set({ settings: S });
    if (immediate) return doSave();
    saveTimer = setTimeout(doSave, 120);
  }
  function set(key, value) { S[key] = value; save(); renderConditional(); }

  /* ------------------------------------------------------------------ helpers */
  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    for (const c of children || []) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    return n;
  }
  function toggle(key) {
    const input = el('input', { type: 'checkbox', 'data-key': key });
    input.checked = !!S[key];
    input.addEventListener('change', () => set(key, input.checked));
    return el('label', { class: 'switch' }, [input, el('span', { class: 'track' })]);
  }
  function select(key, options) {
    const sel = el('select', { 'data-key': key });
    for (const [v, lbl] of options) sel.appendChild(el('option', { value: v, text: t(lbl) }));
    sel.value = String(S[key]);
    sel.addEventListener('change', () => set(key, sel.value));
    return sel;
  }
  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('focustube:' + text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  function uid() { return Math.random().toString(36).slice(2, 10); }
  function fmt(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }

  /* ------------------------------------------------------------------ render: hide tab */
  function renderHide() {
    const root = $('#tab-hide');
    root.innerHTML = '';
    for (const sec of SECTIONS) {
      root.appendChild(el('h3', { text: t(sec.title) }));
      const group = el('div', { class: 'group' });
      for (const item of sec.items) {
        const labelKey = item.label || item.key;
        const label = el('span', {}, [t(labelKey)]);
        if (item.sub) label.appendChild(el('span', { class: 'sublabel', text: t(item.sub) }));
        let control;
        if (item.type === 'select') control = select(item.key, item.options);
        else if (item.type === 'url') {
          control = el('input', { type: 'url', placeholder: 'https://', autocapitalize: 'off' });
          control.value = S[item.key] || '';
          control.addEventListener('input', () => set(item.key, control.value.trim()));
        } else control = toggle(item.key);
        const row = el('div', { class: 'item' + (item.type === 'url' ? ' col' : ''), 'data-item': item.key }, [label, control]);
        group.appendChild(row);
      }
      root.appendChild(group);
    }
    renderConditional();
  }
  function renderConditional() {
    for (const sec of SECTIONS) for (const item of sec.items) {
      if (!item.showIf) continue;
      const row = $(`[data-item="${item.key}"]`);
      if (row) row.classList.toggle('hidden', !item.showIf(S));
    }
    $('#master').checked = !!S.enabled;
    $$('#preset-list button').forEach((b) => b.classList.toggle('active', isPresetActive(b.dataset.preset)));
  }

  /* ------------------------------------------------------------------ render: filters */
  function renderFilters() {
    const list = $('#rule-list');
    list.innerHTML = '';
    for (const r of S.filterRules) {
      const li = el('li', {}, [
        el('span', { class: 'tag', text: t(r.type === 'regex' ? 'ruleRegex' : r.type === 'channel' ? 'ruleChannel' : 'ruleKeyword') }),
        el('div', { class: 'body' }, [el('div', { class: 'title', text: r.value }), el('div', { class: 'meta', text: t(r.scope === 'videos' ? 'scopeVideos' : r.scope === 'comments' ? 'scopeComments' : 'scopeBoth') })]),
        el('button', { class: 'x', text: '×', onclick: () => { S.filterRules = S.filterRules.filter((x) => x.id !== r.id); save(); renderFilters(); } })
      ]);
      list.appendChild(li);
    }
    $('[data-key="filterComments"]').checked = !!S.filterComments;
  }
  $('#rule-add').addEventListener('click', () => {
    const value = $('#rule-value').value.trim();
    if (!value) return;
    const type = $('#rule-type').value;
    if (type === 'regex') { try { new RegExp(value); } catch (e) { $('#rule-value').classList.add('error'); return; } }
    $('#rule-value').classList.remove('error');
    S.filterRules.push({ id: uid(), type, value, scope: $('#rule-scope').value });
    $('#rule-value').value = '';
    save(); renderFilters();
  });
  $('#rule-value').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#rule-add').click(); });
  $('[data-key="filterComments"]').addEventListener('change', (e) => set('filterComments', e.target.checked));

  /* ------------------------------------------------------------------ render: focus */
  let statusTimer = null;
  function renderBlockStatus() {
    const active = S.blockUntil > Date.now();
    $('#block-status').classList.toggle('hidden', !active);
    $('#block-stop').classList.toggle('hidden', !active);
    if (active) $('#block-status').textContent = t('blockedFor') + ' ' + fmt(S.blockUntil - Date.now());
    clearInterval(statusTimer);
    if (active) statusTimer = setInterval(renderBlockStatus, 1000);
  }
  function startBlock(minutes) {
    S.blockUntil = Date.now() + minutes * 60 * 1000;
    save(true); renderBlockStatus();
  }
  $$('.chips button').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.min === 'custom') { $('#custom-block').classList.toggle('hidden'); return; }
    startBlock(Number(b.dataset.min));
  }));
  $('#custom-start').addEventListener('click', () => {
    const m = Number($('#custom-min').value);
    if (m >= 1) { startBlock(Math.min(1440, m)); $('#custom-block').classList.add('hidden'); }
  });
  $('#block-stop').addEventListener('click', () => { S.blockUntil = 0; save(true); renderBlockStatus(); });

  function renderSchedules() {
    const list = $('#schedule-list');
    list.innerHTML = '';
    for (const sc of S.schedules) {
      const days = el('div', { class: 'days' });
      for (let d = 0; d < 7; d++) {
        const b = el('button', { text: t('days')[d], class: sc.days.includes(d) ? 'on' : '' });
        b.addEventListener('click', () => {
          sc.days = sc.days.includes(d) ? sc.days.filter((x) => x !== d) : sc.days.concat(d).sort();
          b.classList.toggle('on'); save();
        });
        days.appendChild(b);
      }
      const start = el('input', { type: 'time', value: sc.start });
      const end = el('input', { type: 'time', value: sc.end });
      start.addEventListener('change', () => { sc.start = start.value; save(); });
      end.addEventListener('change', () => { sc.end = end.value; save(); });
      const on = el('input', { type: 'checkbox' }); on.checked = !!sc.enabled;
      on.addEventListener('change', () => { sc.enabled = on.checked; save(); });
      const li = el('li', { class: 'schedule' }, [
        el('div', { class: 'head' }, [
          el('label', { class: 'switch' }, [on, el('span', { class: 'track' })]),
          el('button', { class: 'x', text: '×', onclick: () => { S.schedules = S.schedules.filter((x) => x.id !== sc.id); save(); renderSchedules(); } })
        ]),
        days,
        el('div', { class: 'times' }, [start, el('span', { text: '→' }), end])
      ]);
      list.appendChild(li);
    }
  }
  $('#schedule-add').addEventListener('click', () => {
    S.schedules.push({ id: uid(), enabled: true, days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00' });
    save(); renderSchedules();
  });

  function bindSimpleInputs() {
    $$('#tab-focus [data-key]').forEach((input) => {
      const key = input.dataset.key;
      if (input.dataset.bound) { // already wired; just refresh value
        if (input.type === 'checkbox') input.checked = !!S[key]; else input.value = S[key] == null ? '' : String(S[key]);
        return;
      }
      input.dataset.bound = '1';
      if (input.type === 'checkbox') { input.checked = !!S[key]; input.addEventListener('change', () => set(key, input.checked)); }
      else if (input.tagName === 'SELECT') { input.value = String(S[key]); input.addEventListener('change', () => set(key, Number(input.value))); }
      else { input.value = S[key] || ''; input.addEventListener('input', () => set(key, input.value.trim())); }
    });
  }

  /* ------------------------------------------------------------------ render: presets */
  function isPresetActive(name) {
    const p = FT.PRESETS[name] || (S.customPresets || {})[name];
    if (!p) return false;
    return FT.PRESET_KEYS.every((k) => String(S[k]) === String(k in p ? p[k] : FT.DEFAULTS[k]));
  }
  function applyPreset(p) {
    for (const k of FT.PRESET_KEYS) S[k] = k in p ? p[k] : FT.DEFAULTS[k];
    save(true); renderHide(); bindSimpleInputs(); renderPresets();
  }
  function renderPresets() {
    const root = $('#preset-list');
    root.innerHTML = '';
    for (const [name, title, desc] of PRESET_META) {
      const b = el('button', { 'data-preset': name, class: isPresetActive(name) ? 'active' : '' }, [
        el('span', { class: 'pt', text: t(title) }), el('span', { class: 'pd', text: t(desc) })
      ]);
      b.addEventListener('click', () => applyPreset(FT.PRESETS[name]));
      root.appendChild(b);
    }
    const list = $('#custom-preset-list');
    list.innerHTML = '';
    for (const name of Object.keys(S.customPresets)) {
      list.appendChild(el('li', {}, [
        el('div', { class: 'body' }, [el('div', { class: 'title', text: name })]),
        el('button', { class: 'primary small', text: t('apply'), onclick: () => applyPreset(S.customPresets[name]) }),
        el('button', { class: 'x', text: '×', onclick: () => { delete S.customPresets[name]; save(); renderPresets(); } })
      ]));
    }
  }
  $('#preset-save').addEventListener('click', () => {
    const name = $('#preset-name').value.trim();
    if (!name) return;
    const p = {};
    for (const k of FT.PRESET_KEYS) p[k] = S[k];
    S.customPresets[name] = p;
    $('#preset-name').value = '';
    save(); renderPresets();
  });

  /* ------------------------------------------------------------------ render: more */
  function renderPin() {
    const has = !!S.pinHash;
    $('#pin-state').textContent = t(has ? 'pinSet' : 'pinNone');
    $('#pin-clear').classList.toggle('hidden', !has);
    $('#pin-set').classList.toggle('hidden', has);
  }
  $('#pin-set').addEventListener('click', async () => {
    const v = $('#pin-input').value.trim();
    if (!/^\d{4,8}$/.test(v)) { $('#pin-input').classList.add('error'); return; }
    S.pinHash = await sha256(v); $('#pin-input').value = '';
    save(true); renderPin();
  });
  $('#pin-clear').addEventListener('click', async () => {
    const v = $('#pin-input').value.trim();
    if (await sha256(v) !== S.pinHash) { $('#pin-input').classList.add('error'); return; }
    S.pinHash = ''; $('#pin-input').value = '';
    save(true); renderPin();
  });

  $('#io-export').addEventListener('click', () => {
    const copy = Object.assign({}, S); delete copy.pinHash; delete copy.blockUntil;
    $('#io-text').value = JSON.stringify(copy, null, 2);
    $('#io-msg').textContent = t('exported');
  });
  $('#io-copy').addEventListener('click', async () => {
    if (!$('#io-text').value) $('#io-export').click();
    try { await navigator.clipboard.writeText($('#io-text').value); }
    catch (e) { $('#io-text').select(); document.execCommand('copy'); }
    $('#io-msg').textContent = t('copied');
  });
  $('#io-import').addEventListener('click', async () => {
    try {
      const parsed = JSON.parse($('#io-text').value);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('bad');
      const keep = { pinHash: S.pinHash, blockUntil: S.blockUntil };
      S = FT.withDefaults(Object.assign({}, parsed, keep));
      await save(true);
      renderAll();
      $('#io-msg').textContent = t('imported');
    } catch (e) { $('#io-msg').textContent = t('importError'); }
  });
  $('#reset-all').addEventListener('click', async () => {
    if (!confirm(t('resetConfirm'))) return;
    S = FT.withDefaults({});
    await save(true);
    renderAll();
  });

  /* ------------------------------------------------------------------ tabs, master, lock */
  $$('#tabs button').forEach((b) => b.addEventListener('click', () => {
    $$('#tabs button').forEach((x) => x.classList.toggle('active', x === b));
    $$('.tab').forEach((x) => x.classList.toggle('active', x.dataset.tab === b.dataset.tab));
    try { sessionStorage.setItem('ft-tab', b.dataset.tab); } catch (e) {}
  }));
  $('#master').addEventListener('change', (e) => set('enabled', e.target.checked));

  function showLock() {
    $('#lock').classList.remove('hidden');
    $('#lock-pin').focus();
  }
  async function tryUnlock() {
    const v = $('#lock-pin').value.trim();
    if (await sha256(v) === S.pinHash) {
      try { sessionStorage.setItem('ft-unlocked', '1'); } catch (e) {}
      $('#lock').classList.add('hidden');
    } else { $('#lock-error').classList.remove('hidden'); $('#lock-pin').value = ''; }
  }
  $('#lock-btn').addEventListener('click', tryUnlock);
  $('#lock-pin').addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });

  function applyI18n() {
    $$('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
    $$('[data-i18n-ph]').forEach((n) => { n.placeholder = t(n.dataset.i18nPh); });
    document.documentElement.lang = LANG;
  }

  function renderAll() {
    renderHide(); renderFilters(); renderBlockStatus(); renderSchedules(); bindSimpleInputs(); renderPresets(); renderPin();
    renderConditional();
  }

  /* ------------------------------------------------------------------ boot */
  (async () => {
    applyI18n();
    await load();
    renderAll();
    let unlocked = false;
    try { unlocked = sessionStorage.getItem('ft-unlocked') === '1'; } catch (e) {}
    if (S.pinHash && !unlocked) showLock();
    let tab = 'hide';
    try { tab = sessionStorage.getItem('ft-tab') || 'hide'; } catch (e) {}
    const b = $(`#tabs button[data-tab="${tab}"]`); if (b) b.click();
  })();
})();
