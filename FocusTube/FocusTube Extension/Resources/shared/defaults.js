/* Shared settings schema, defaults and presets. Loaded by content script, popup and background. */
(function (root) {
  'use strict';

  const DEFAULTS = {
    enabled: true,

    // Global
    hideShorts: true,
    hideNotifications: false,
    hideCreateButton: false,
    hideSidebar: false,
    hideExploreTrending: false,
    hideChips: false,
    hideAds: true,
    autoSkipAds: false,
    thumbnails: 'normal', // normal | grayscale | blur | hidden
    hideViewCounts: false,
    hideDurations: false,
    hideWatchedVideos: false,

    // Home
    homeMode: 'normal', // normal | hideFeed | redirect
    homeRedirect: 'subscriptions', // subscriptions | library | history | custom
    homeRedirectUrl: '',

    // Search
    searchHideShelves: false,
    searchHideChannels: false,
    searchHidePlaylists: false,

    // Watch page
    hideRelated: false,
    hideComments: false,
    hideEndScreens: false,
    hideLiveChat: false,
    hideDescription: false,
    hideInfoCards: false,
    hideMerch: false,
    hidePlaylistPanel: false,
    autoTheater: false,
    disableAutoplayNext: false,

    // Shorts
    shortsMode: 'allow', // allow | block | watch

    // Channel
    channelHideShortsTab: false,
    channelHideFeatured: false,

    // Filters
    filterRules: [], // { id, type: 'keyword'|'channel'|'regex', value, scope: 'videos'|'comments'|'both' }
    filterComments: true,

    // Focus
    blockUntil: 0,
    blockMessage: '',
    blockRedirectUrl: '',
    schedules: [], // { id, enabled, days:[0..6], start:'09:00', end:'17:00' }
    delaySeconds: 0,
    delayOncePerSession: true,

    // Security
    pinHash: '',

    // Presets
    customPresets: {}
  };

  const PRESETS = {
    minimal: {
      hideShorts: true, hideNotifications: true, hideCreateButton: true, hideSidebar: true,
      hideExploreTrending: true, hideChips: true, hideAds: true,
      homeMode: 'hideFeed', searchHideShelves: true,
      hideRelated: true, hideComments: true, hideEndScreens: true, hideLiveChat: true,
      hideDescription: false, hideInfoCards: true, hideMerch: true,
      shortsMode: 'block', channelHideShortsTab: true, disableAutoplayNext: true
    },
    work: {
      hideShorts: true, hideNotifications: true, hideCreateButton: false, hideSidebar: false,
      hideExploreTrending: true, hideChips: true, hideAds: true,
      homeMode: 'redirect', homeRedirect: 'subscriptions', searchHideShelves: true,
      hideRelated: true, hideComments: true, hideEndScreens: true, hideLiveChat: true,
      shortsMode: 'block', channelHideShortsTab: true, disableAutoplayNext: true,
      delaySeconds: 10
    },
    study: {
      hideShorts: true, hideNotifications: true, hideCreateButton: true, hideSidebar: true,
      hideExploreTrending: true, hideChips: true, hideAds: true, thumbnails: 'grayscale',
      homeMode: 'redirect', homeRedirect: 'subscriptions', searchHideShelves: true,
      hideRelated: true, hideComments: true, hideEndScreens: true, hideLiveChat: true,
      hideDescription: true, hideInfoCards: true, hideMerch: true,
      shortsMode: 'block', channelHideShortsTab: true, autoTheater: true, disableAutoplayNext: true,
      delaySeconds: 15
    },
    relax: {
      hideShorts: true, hideNotifications: true, hideAds: true,
      homeMode: 'normal', hideRelated: false, hideComments: false, hideEndScreens: true,
      shortsMode: 'watch', disableAutoplayNext: false
    }
  };

  // Keys that presets are allowed to touch (never filters, focus timers, PIN or custom presets).
  const PRESET_KEYS = [
    'hideShorts', 'hideNotifications', 'hideCreateButton', 'hideSidebar', 'hideExploreTrending',
    'hideChips', 'hideAds', 'autoSkipAds', 'thumbnails', 'hideViewCounts', 'hideDurations',
    'hideWatchedVideos', 'homeMode', 'homeRedirect', 'homeRedirectUrl', 'searchHideShelves',
    'searchHideChannels', 'searchHidePlaylists', 'hideRelated', 'hideComments', 'hideEndScreens',
    'hideLiveChat', 'hideDescription', 'hideInfoCards', 'hideMerch', 'hidePlaylistPanel',
    'autoTheater', 'disableAutoplayNext', 'shortsMode', 'channelHideShortsTab',
    'channelHideFeatured', 'delaySeconds', 'delayOncePerSession'
  ];

  function withDefaults(stored) {
    const out = Object.assign({}, DEFAULTS, stored || {});
    if (!Array.isArray(out.filterRules)) out.filterRules = [];
    if (!Array.isArray(out.schedules)) out.schedules = [];
    if (!out.customPresets || typeof out.customPresets !== 'object') out.customPresets = {};
    return out;
  }

  root.FT = root.FT || {};
  root.FT.DEFAULTS = DEFAULTS;
  root.FT.PRESETS = PRESETS;
  root.FT.PRESET_KEYS = PRESET_KEYS;
  root.FT.withDefaults = withDefaults;
})(typeof globalThis !== 'undefined' ? globalThis : this);
