# UnTrap 12.1 selector reference for FocusTube features

Source: shared/options/bundle/effects/{desktop,mobile}.json (observed, sha256 a7f9a817…). Entries are CSS selectors (hidden with display:none by UnTrap's runtime) or complete rules.

## hideShorts  ←  untrap_global_hide_all_shorts
- en: untrap_global_hide_all_shorts
  - desktop: `ytd-video-renderer:has(a.yt-simple-endpoint[href*="shorts"])`
  - desktop: `ytd-search-header-renderer iron-selector yt-chip-cloud-chip-renderer:nth-child(2)`
  - desktop: `ytd-mini-guide-entry-renderer:has(a.yt-simple-endpoint[href*="shorts"])`
  - desktop: `ytd-rich-section-renderer:has(a[href^="/shorts/"])`
  - desktop: `ytd-rich-item-renderer:has(a[href^="/shorts/"])`
  - mobile: `ytm-rich-section-renderer:has(a[href^="/shorts/"])`
  - mobile: `ytm-rich-item-renderer:has(a[href^="/shorts/"])`
  - mobile: `ytm-shorts-lockup-view-model-v2:has(a[href^="/shorts/"])`
  - mobile: `ytm-shorts-lockup-view-model:has(a[href^="/shorts/"])`

## hideNotifications  ←  untrap_header_hide_notifications_bell
- en: Hide 'Notifications' Button
  - desktop: `#masthead-container #end #buttons ytd-notification-topbar-button-renderer`

## hideCreateButton  ←  untrap_header_hide_create_button
- en: Hide 'Create' Button
  - desktop: `#masthead-container #end #buttons ytd-button-renderer`

## hideSidebar  ←  untrap_header_hide_sidebar_burger
- en: Hide 'Burger' Button
  - desktop: `#masthead #guide-button`

## hideExploreTrending  ←  untrap_sidebar_hide_explore  (not found; nearest: ['untrap_sidebar_explore_hide_explore_title', 'untrap_sidebar_explore_hide_gaming_buttton', 'untrap_sidebar_explore_hide_learning_buttton'])
- en: Hide 'Explore' Title
  - desktop: `tp-yt-app-drawer#guide[role="navigation"] #sections ytd-guide-section-renderer:not(:has(ytd-guide-collapsible-section-entry-renderer)):has(a[href*="/channel/"]) #guide-section-title`
- en: Hide 'Gaming' Button
  - desktop: `tp-yt-app-drawer#guide[role="navigation"] #sections ytd-guide-section-renderer:not(:has(ytd-guide-collapsible-section-entry-renderer)):has(a[href*="/channel/"]) a[href*="gaming"]`
- en: Hide 'Learning' Button
  - desktop: `tp-yt-app-drawer#guide[role="navigation"] #sections ytd-guide-section-renderer:not(:has(ytd-guide-collapsible-section-entry-renderer)):has(a[href*="/channel/"]) a[href*="/channel/UCtFRv9O2AHqOZjjynzrv-xg"]`

## hideChips  ←  untrap_home_hide_chips  (not found; nearest: [])

## hideAds  ←  untrap_global_hide_all_ads
- en: untrap_global_hide_all_ads
  - desktop: `yt-mealbar-promo-renderer`
  - desktop: `ytd-ad-slot-renderer`
  - desktop: `ytd-in-feed-ad-layout-renderer`
  - desktop: `ytd-promoted-sparkles-web-renderer`
  - desktop: `ytd-promoted-sparkles-text-search-renderer`
  - mobile: `yt-mealbar-promo-renderer`
  - mobile: `ad-slot-renderer`
  - mobile: `ytm-promoted-video-renderer`

## hideRelated  ←  untrap_video_page_hide_related_videos
- en: Hide Related Videos
  - desktop: `#related`
  - desktop: `ytd-watch-flexy[theater] #columns { justify-content: center !important; }`
  - desktop: `html { overflow-x: hidden !important; }`
  - mobile: `html:has(ytm-watch) ytm-item-section-renderer[section-identifier="related-items"]`
  - mobile: `html:has(ytm-watch) ytm-single-column-watch-next-results-renderer ytm-item-section-renderer[section-identifier="related-items"]:nth-child(2) { display: flex !important; visibility: hidden !important; }`

## hideComments  ←  untrap_video_page_hide_comments
- en: Hide Comments
  - desktop: `.ytd-comments`
  - desktop: `#comment-teaser`
  - desktop: `ytd-shorts ytd-engagement-panel-title-header-renderer #title-container`
  - desktop: `ytd-shorts ytd-engagement-panel-title-header-renderer #menu`
  - mobile: `html:has(ytm-watch) ytm-item-section-renderer:has(ytm-comments-entry-point-header-renderer)`
  - mobile: `ytm-item-section-renderer:has(> ytm-comments-header-renderer > ytm-comment-simplebox-renderer)`
  - mobile: `html:has(ytm-watch) .ytVideoMetadataCarouselViewModelHost`

## hideEndScreens  ←  untrap_video_player_hide_end_screen_suggestions
- en: Hide Suggestions in the Video End
  - desktop: `.html5-video-player.ended-mode .ytp-autonav-endscreen-countdown-overlay`

## hideLiveChat  ←  untrap_video_page_hide_live_chat
- en: Hide Live Chat
  - desktop: `#chat`
  - desktop: `#panels-full-bleed-container`

## hideDescription  ←  untrap_video_page_hide_description
- en: Hide Description
  - desktop: `ytd-watch-metadata #description`

## hideInfoCards  ←  untrap_video_page_hide_info_cards  (not found; nearest: [])

## hideMerch  ←  untrap_video_page_hide_merch  (not found; nearest: ['untrap_video_page_hide_merch_shelf'])
- en: Hide Merch, Tickets, Offers
  - desktop: `ytd-watch-flexy ytd-merch-shelf-renderer`
  - desktop: `ytd-watch-flexy ytd-ticket-shelf-renderer`
  - desktop: `ytd-watch-flexy ytd-offers-shelf-renderer`

## thumbnails  ←  untrap_video_card_replace_thumbnail
- en: Replace Thumbnail

## hideViewCounts  ←  untrap_hide_video_card_views  (not found; nearest: ['untrap_metrics_hide_views', 'untrap_video_page_hide_video_views_and_published', 'untrap_video_page_hide_video_views_counter'])
- en: Hide Views Count
  - desktop: `.ytd-page-manager:not(:has([page-subtype="history"])) yt-lockup-view-model yt-content-metadata-view-model .ytContentMetadataViewModelMetadataRow[role="group"]:not(:first-child) span:nth-child(1):not(:has(a))`
  - desktop: `.ytd-page-manager:not(:has([page-subtype="history"])) yt-lockup-view-model yt-content-metadata-view-model .ytContentMetadataViewModelMetadataRow[role="group"]:not(:first-child) span.ytContentMetadataViewModelDelimiter`
  - desktop: `#dismissible #metadata-line .inline-metadata-item:nth-child(3)`
  - desktop: `#dismissible #metadata-line span:nth-child(1)`
  - desktop: `ytd-playlist-video-renderer #video-info span:nth-child(1)`
  - desktop: `ytd-playlist-video-renderer #video-info span:nth-child(2)`
  - desktop: `.ytd-page-manager[page-subtype="history"] yt-lockup-view-model yt-content-metadata-view-model .yt-content-metadata-view-model__metadata-row:first-child > span:last-child`
  - desktop: `.ytd-page-manager[page-subtype="history"] yt-lockup-view-model yt-content-metadata-view-model .yt-content-metadata-view-model__metadata-row:first-child > span.yt-content-metadata-view-model__delimiter`
  - desktop: `ytd-channel-video-player-renderer #metadata-line .inline-metadata-item:nth-child(3)`
  - mobile: `ytm-badge-and-byline-renderer .YtmBadgeAndBylineRendererItemByline:nth-child(3)`
  - mobile: `ytm-badge-and-byline-renderer .YtmBadgeAndBylineRendererSeparator:nth-child(2)`
  - mobile: `ytm-app yt-lockup-metadata-view-model .ytContentMetadataViewModelMetadataRow > span:nth-child(3)`
  - mobile: `ytm-app yt-lockup-metadata-view-model .ytContentMetadataViewModelMetadataRow > span:nth-child(3) + .ytContentMetadataViewModelDelimiter`
  - mobile: `ytm-badge-and-byline-renderer .ytmBadgeAndBylineRendererItemByline:nth-child(3)`
  - mobile: `ytm-badge-and-byline-renderer .ytmBadgeAndBylineRendererSeparator:nth-child(2)`
- en: Hide Video Views and Published Time
  - mobile: `html:has(ytm-watch) ytm-slim-video-information-renderer .slim-video-information-upload-info`
  - mobile: `html:has(ytm-watch) ytm-video-description-header-renderer .factoids > ytm-factoid-renderer`
- en: Hide Video Views Count
  - desktop: `ytd-watch-info-text #info span:nth-child(1)`
  - desktop: `ytd-watch-info-text #info span:nth-child(2)`
  - desktop: `ytd-video-primary-info-renderer #count ytd-video-view-count-renderer`

## hideDurations  ←  untrap_hide_video_card_duration  (not found; nearest: ['untrap_video_card_hide_video_duration'])
- en: Hide Video Duration
  - desktop: `.ytThumbnailBottomOverlayViewModelBadge`
  - desktop: `.ytd-thumbnail-overlay-time-status-renderer`
  - mobile: `.ytInlinePlayerControlsTimeDisplay`
  - mobile: `yt-thumbnail-overlay-badge-view-model .ytBadgeShapeThumbnailDefault`

## homeMode  ←  untrap_home_hide_feed  (not found; nearest: [])

## channelHideShortsTab  ←  untrap_channel_hide_channel_menu_button_shorts
- en: Hide 'Shorts' Button

## searchHideShelves  ←  untrap_search_hide_shelves  (not found; nearest: [])

