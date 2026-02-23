# WebP 변환기

브라우저에서 이미지를 WebP 포맷으로 변환하는 클라이언트 사이드 웹 앱입니다.
서버 없이 모든 처리가 브라우저 내에서 완료됩니다.

**[🔗 Live Demo](https://sechanglee89.github.io/webp-converter/)**

---

## 주요 기능

- **드래그 앤 드롭** 또는 클릭으로 이미지 업로드 (다중 파일 지원)
- **WebP 변환** — HTML5 Canvas API 기반, 서버 전송 없음
- **품질 조절** — 슬라이더로 0.1 ~ 1.0 설정 (기본값 0.85)
- **리사이즈 옵션** — 원본 유지 / 가로 고정 / 세로 고정 / 가로+세로 지정
- **변환 전후 미리보기** — 파일 크기 비교 및 절감률 표시
- **다운로드** — 개별 파일 다운로드 또는 ZIP 일괄 다운로드

## 지원 입력 포맷

JPEG, PNG, GIF, BMP, SVG 등 브라우저가 렌더링 가능한 모든 이미지 포맷

---

## 로컬 실행

별도의 빌드나 설치 과정이 없습니다. `index.html`을 브라우저에서 바로 열면 됩니다.

```bash
# VS Code Live Server 사용 예시
npx serve .
```

---

## 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 GitHub Pages에 배포합니다.

```
main 브랜치 push → GitHub Actions → GitHub Pages
```

첫 배포 전 레포지토리 설정에서 **Settings → Pages → Source → GitHub Actions** 로 변경해야 합니다.

---

## 기술 스택

| 항목 | 내용                                         |
| ---- | -------------------------------------------- |
| 언어 | HTML5 / CSS3 / Vanilla JS                    |
| 변환 | Canvas API (`toBlob`, `image/webp`)          |
| ZIP  | [JSZip](https://stuk.github.io/jszip/) (CDN) |
| 배포 | GitHub Pages + GitHub Actions                |
