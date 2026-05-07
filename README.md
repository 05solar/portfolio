# SOLAR.EXE Portfolio

게임처럼 탐험하며 자기소개, 기술 스택, 프로젝트를 확인할 수 있는 React 기반 포트폴리오입니다. 픽셀 아트풍 월드와 실내 갤러리 화면으로 구성되어 있으며, 키보드 조작을 통해 콘텐츠를 열람할 수 있습니다.

## 주요 기능

- RPG 스타일 포트폴리오 월드
- 캐릭터 이동 및 상호작용 UI
- 프로젝트 갤러리와 상세 모달
- 상태창, HUD, 튜닝 패널 등 게임형 인터페이스
- Vite 기반 빠른 개발 서버 및 빌드

## 기술 스택

- React
- Vite
- JavaScript
- CSS

## 시작하기

```bash
npm install
npm run dev
```

개발 서버가 실행되면 터미널에 표시되는 로컬 주소로 접속합니다.

## 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다. 이 폴더는 Git에 포함하지 않습니다.

## 미리보기

```bash
npm run preview
```

## 프로젝트 구조

```text
portfolio/
|-- index.html
|-- package.json
|-- package-lock.json
|-- src/
|   |-- app.jsx
|   |-- data.js
|   |-- hud.jsx
|   |-- interior.jsx
|   |-- main.jsx
|   |-- modals.jsx
|   |-- player.jsx
|   |-- styles.css
|   |-- tweaks-panel.jsx
|   `-- world.jsx
`-- README.md
```

## 조작

- 이동: `WASD` 또는 방향키
- 상호작용: `E`
- 닫기 / 나가기: `Esc`

## GitHub 업로드 전 확인

```bash
git init
git add .
git commit -m "Initial commit"
```

그 다음 GitHub에서 새 저장소를 만든 뒤 안내에 따라 원격 저장소를 연결하고 push하면 됩니다.
