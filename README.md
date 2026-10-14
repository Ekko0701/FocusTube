# FocusTube — Safari용 YouTube 방해 요소 제거 확장 (iOS / iPadOS)

UnTrap for YouTube와 같은 범주의 앱입니다. Safari Web Extension으로 동작하며
`youtube.com` / `m.youtube.com`에서 Shorts·추천·댓글 등을 숨기고, 집중 타이머와 필터를 제공합니다.
YouTube 앱에는 적용되지 않습니다(iOS 제약).

## 구조

```
FocusTube/
├── FocusTube.xcodeproj
├── FocusTube/                      # 컨테이너 앱 (온보딩 화면, WKWebView)
│   ├── ViewController.swift        # "설정 열기" 버튼 → 설정 앱으로 이동
│   └── Resources/Base.lproj/Main.html, Style.css, Script.js
└── FocusTube Extension/
    ├── SafariWebExtensionHandler.swift
    └── Resources/                  # 실제 확장 코드 (여기를 수정)
        ├── manifest.json           # MV3, content script + popup
        ├── shared/defaults.js      # 설정 스키마, 기본값, 프리셋
        ├── content/content.js      # 페이지 감지, 리디렉션, 필터, 차단 오버레이
        ├── content/content.css     # <html data-ft-*> 속성 기반 숨김 규칙
        ├── popup/popup.{html,css,js} # 설정 UI (한국어/영어 자동)
        └── images/                 # 아이콘
tools/make_icons.py                 # 아이콘 PNG 생성 스크립트 (PIL 불필요)
```

## 동작 원리

1. `content.js`가 `browser.storage.local`의 `settings`를 읽어 `<html>`에 `data-ft-hide-shorts` 같은 속성을 붙입니다.
2. `content.css`는 그 속성을 키로 YouTube 요소(데스크톱 `ytd-*`, 모바일 `ytm-*`)를 `display:none` 처리합니다.
   CSS는 `document_start`에 로드되므로 숨긴 요소가 깜빡이지 않습니다.
3. SPA 내비게이션은 `yt-navigate-finish` 이벤트 + URL 폴링으로 감지해 홈 리디렉션, Shorts 차단/일반 플레이어 전환,
   자동재생 끄기, 극장 모드, 광고 건너뛰기 클릭을 수행합니다.
4. 키워드/채널/정규식 필터는 MutationObserver로 카드와 댓글을 스캔해 `[data-ft-hidden]`을 붙입니다.
5. 집중 차단(임시/예약)과 열기 지연은 전체 화면 오버레이로 표시합니다.
6. 팝업은 설정을 저장만 하고, 콘텐츠 스크립트가 `storage.onChanged`로 즉시 반영합니다.

## 빌드

```bash
xcodebuild -project FocusTube/FocusTube.xcodeproj -scheme FocusTube \
  -destination 'platform=iOS Simulator,name=iPhone 17' CODE_SIGNING_ALLOWED=NO build
```

실기기 배포 시 Xcode에서 Signing & Capabilities의 Team을 지정하세요(두 타겟 모두).

## 사용

1. 앱 실행 → 설정 → 앱 → Safari → 확장 프로그램 → FocusTube 켜기
2. `m.youtube.com`, `youtube.com` 접근을 **허용**
3. Safari에서 YouTube를 열고 주소창의 확장 아이콘 → FocusTube

## 구현하지 않은 UnTrap 기능

- AI 동영상 요약/전사(서버 + LLM API 필요)
- 키보드 단축키(iOS Safari에서 의미 없음)
- 구독/결제(StoreKit) — 모든 기능이 무료로 열려 있음

## 참고 분석

- [untrap-analysis.md](untrap-analysis.md): UnTrap 12.1 Firefox 확장 분석 보고 (선택자 비교, 옵션 카탈로그, 유료 게이트, 요약 API)
