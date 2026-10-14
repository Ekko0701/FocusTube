# UnTrap for YouTube 12.1 (Firefox XPI) 분석 보고

- 대상: `untrap_for_youtube-12.1.xpi` (addons.mozilla.org, 2026-09-16 게시, 3,082,266 bytes)
- 무결성: sha256 `a7f9a81719d2d54fd15c7e938e32dfbb698309c7a4a4e80ad48594f835d7b6b5` — AMO API가 공개한 해시와 일치
- REA 증거: 아카이브 그래프 `ev_18ab71adc25e13f96f8fcc38888f2ef2ca1d0445e93e70e7b559312adfe65bd5` (568 노드, 572 엣지, 완전 인벤토리). JavaScript 애플리케이션 그래프 분석은 MCP 타임아웃으로 완료되지 않아 소스 파일 직접 열람으로 대체.
- 저작권: 모든 소스 파일에 "proprietary and confidential" 고지가 있음. 이 보고는 **동작 사실과 YouTube DOM 선택자**만 기록하며 코드는 복제하지 않음.
- 부속 파일: [untrap-option-catalog.tsv](untrap-option-catalog.tsv) (옵션 338개, 영/한 라벨), [untrap-selector-comparison.md](untrap-selector-comparison.md) (FocusTube 기능별 UnTrap 선택자)

## 관찰 (observed)

**패키지 구조**: 572 파일, 335 JS / 104 JSON / 96 CSS. MV3, `background.page`, 권한 `storage, activeTab, management, alarms, scripting`, 호스트 `www.youtube.com`, `m.youtube.com`. 콘텐츠 스크립트 7묶음(모두 `document_start`, 요약 기능만 `document_idle`). 데스크톱과 모바일용 콘텐츠 필터 스크립트가 분리되어 있음.

**옵션 모델**: `shared/options/bundle/core.json`이 옵션 338개를 선언(카테고리 12개: homePage, navigationSidebar, header, videoPage, videoCard, searchPage, subscriptionsPage, channelPage, shortsPage, youPage, embed, appearance). 323개가 불리언 토글. 각 옵션은 `effects/desktop.json`(276 세트) / `effects/mobile.json`(151 세트)의 CSS 선택자 목록(`legacy_styles`)에 연결되며, 콘텐츠 스크립트가 활성 옵션의 선택자를 모아 `<style data-runtime-styles>`로 주입. 모바일 전용 규칙이 있는 옵션은 150개뿐이므로 iPhone에서는 옵션의 절반 정도만 효과가 있음.

**핵심 선택자 (FocusTube와 비교)**
- Shorts 숨김: 데스크톱 `ytd-rich-item-renderer:has(a[href^="/shorts/"])`, `ytd-rich-section-renderer:has(a[href^="/shorts/"])`, `ytd-video-renderer:has(a[href*="shorts"])`; 모바일 `ytm-rich-item-renderer:has(a[href^="/shorts/"])`, `ytm-shorts-lockup-view-model(-v2)`. FocusTube와 동일 계열. Shorts 페이지 자체는 URL의 `shorts`를 `watch`로 치환해 리디렉션(FocusTube의 "일반 플레이어로 열기"와 동일).
- 관련 동영상: 데스크톱 `#related` + 극장 모드 중앙정렬 보정; 모바일 `ytm-item-section-renderer[section-identifier="related-items"]`. FocusTube와 동일.
- 댓글: 데스크톱 `.ytd-comments`, `#comment-teaser`; 모바일 `ytm-item-section-renderer:has(ytm-comments-entry-point-header-renderer)`, `.ytVideoMetadataCarouselViewModelHost`. 후자는 제가 시뮬레이터에서 직접 찾은 새 마크업과 같은 요소.
- 광고: `ytd-ad-slot-renderer`, `ytd-in-feed-ad-layout-renderer`, `ytd-promoted-sparkles-*`, `yt-mealbar-promo-renderer`, 모바일 `ad-slot-renderer`, `ytm-promoted-video-renderer`.
- 홈 리디렉션 대상: 구독, 인기, 시청 기록, 나중에 볼 동영상(WL), 좋아요(LL), 내 페이지.
- 동영상 광고 건너뛰기: MutationObserver로 skip 버튼 감시 + 클릭(FocusTube와 같은 방식). 자동재생 끄기도 토글 버튼 클릭 방식.
- 썸네일 흐림/흑백은 on/off가 아니라 단계값 배열(슬라이더)로 `filter`를 생성.

**집중/차단 기능**: 임시 차단·예약 차단 판정 로직은 `popup/services/blockingEngine.js`가 원본이고 콘텐츠 측 `contentBlockEngine.js`는 동기화된 사본. 예약은 그룹별 요일+시간 구간 목록이며 자정을 넘는 구간을 지원(FocusTube 구현과 같은 규칙). 차단 화면은 확장 내부 HTML(`iframes/youtube-blocked.html`)을 iframe으로 띄움. "세션 게이트 v2"(세션 시간 제한/쿨다운), "진입 확인"(열기 지연) 역시 iframe 기반.

**유료(Plus) 게이트**: `shared/plus/plusAccessContract.js`에 무료 한도 명시 — 프리셋 1개, 예약 1개, 시간 구간 1개, 콘텐츠 필터 규칙 10개. 유료 전용 기능: 검색 페이지 옵션, 프리셋 최적화, 진입 확인, 세션 시간, 설정 보호, 트윅, 콘텐츠 필터, 동영상 요약.

**AI 요약**: 클라이언트는 자막/댓글을 모아 `https://untrap.app/api/v2/untrap/summarize/{insight,timestamp,comments,transcription,jobs,limits}`로 보냄. 요약은 서버 측 LLM 호출이며 확장 안에 모델 호출 코드는 없음. 인증(`shared/auth/*`)과 사용량 한도(`limits`)가 있음.

**설정 보호 비밀번호**: `popup/application/passwordFlow.js`가 입력값을 `untrap_passwordLockingPasswordData…` 키에 그대로 저장하는 것으로 보이며, 해시 함수 사용 흔적을 찾지 못함(추론: 평문 저장. 전체 코드 경로를 실행으로 확인하지는 않음). FocusTube는 SHA-256 해시를 저장.

## 추론 (inferred)
- Safari용 App Store 빌드도 같은 웹 확장 코드를 컨테이너 앱에 담았을 가능성이 큼(설명문·기능 목록·호스트가 동일). 단, iOS 바이너리를 직접 보지 않았으므로 확인된 사실은 아님.
- 모바일(iPhone) 지원이 데스크톱보다 얇다는 점(150 vs 276 규칙 세트)은 App Store 리뷰의 "iPad에서는 되는데 iPhone에서는 안 됨" 불만과 부합.

## 미확인 (unknown)
- 서버 API의 요청/응답 스키마와 LLM 공급자, 구독 검증 방식(엔타이틀먼트)은 서버 측이라 알 수 없음.
- REA JavaScript 그래프(모듈 임포트 그래프)는 타임아웃으로 미생성. 필요하면 폴더를 나눠 재시도 가능.

## FocusTube에 반영한 것
- 광고(`ytd-promoted-sparkles-text-search-renderer`, 모바일 `ad-slot-renderer`), 댓글(`#comment-teaser`, 모바일 `.ytVideoMetadataCarouselViewModelHost`), 라이브 채팅(`#panels-full-bleed-container`), 상품(`ytd-ticket-shelf-renderer`, `ytd-offers-shelf-renderer`), 재생시간(`.ytThumbnailBottomOverlayViewModelBadge`, `.ytInlinePlayerControlsTimeDisplay`), 엔드스크린(`.ytp-autonav-endscreen-countdown-overlay`), Shorts 섹션(`ytd-rich-section-renderer:has(a[href^="/shorts/"])`) 선택자를 추가하고 재빌드함.
