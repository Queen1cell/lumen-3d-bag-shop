# 🛍️ LUMEN Atelier — 3D 인터랙티브 핸드백 쇼핑몰

Three.js로 구현한 **3D 인터랙티브 제품 상세페이지**입니다.
사용자가 3D 핸드백을 직접 **회전**시키고 **색상을 변경**하며 제품을 살펴볼 수 있는,
실제 쇼핑몰 형태의 웹앱입니다. 3D 모델은 **생성형 AI(Meshy)** 로 제작했습니다.

> 최종 프로젝트: *3D 웹앱 만들기* (AI 모델 생성 → 웹 구성 → 기능 구현 → 배포)

![메인 화면](screenshots/01-main-black.jpg)

---

## 🔗 링크

| 항목 | URL |
|------|-----|
| 🌐 **Netlify 배포 URL** | https://gilded-daifuku-a0a7df.netlify.app |
| 💻 **GitHub 저장소** | https://github.com/Queen1cell/lumen-3d-bag-shop |
| 📝 **소개 · 회고 문서** | [회고.md](회고.md) |

---

## ✨ 주요 기능

- **360° 자유 회전** — 마우스 드래그(OrbitControls)로 어느 각도에서든 관찰
- **버튼 회전** — `↺ / ↻` 버튼으로 45°씩 부드럽게 회전 (관성 애니메이션)
- **자동 회전 / 초기화** — 자동 턴테이블 토글, 시점 원위치
- **6가지 컬러 변경** — Black · Ruby · Navy · Camel · Ivory · Forest, 색상 전환 애니메이션
- **쇼핑몰 UX** — 수량 선택, 장바구니 담기(카운터·토스트), 가격/할인, 리뷰·스펙 섹션
- **완전 반응형** — 데스크톱 2단 → 모바일 1단 + 하단 고정 구매 바

| Classic Black | Ruby Red (색상 변경) |
|---|---|
| ![Black](screenshots/01-main-black.jpg) | ![Ruby](screenshots/02-color-ruby.jpg) |

---

## 🧰 기술 스택

- **3D 모델 생성** — [Meshy](https://www.meshy.ai) (생성형 AI · Text-to-3D)
  - 프롬프트: `a luxury leather handbag, structured tote bag, gold clasp and metal handle rings, studio product shot, high detail`
- **모델 경량화** — [glTF-Transform](https://gltf-transform.dev) 으로 **40MB → 2MB** 최적화
  - 지오메트리 단순화(706k → 105k 삼각형), 텍스처 축소(4K → 1K, WebP), 정점 양자화
- **Three.js** `r161` — 3D 렌더링 (WebGL)
  - `OrbitControls` — 마우스 회전
  - `GLTFLoader` — AI 생성 모델(`bag.glb`) 로드 (`EXT_texture_webp`, `KHR_mesh_quantization` 지원)
  - `RoomEnvironment` + `PMREMGenerator` — 외부 HDR 없이 사실적 반사/조명(IBL)
  - `ACESFilmicToneMapping` + `PCFSoftShadowMap` — 필름 톤매핑 · 부드러운 그림자
- **Vanilla JavaScript (ES Modules + import map)** — 번들러 없이 CDN에서 직접 로드
- **HTML5 / CSS3** — Grid·Flexbox 반응형 레이아웃, 커스텀 디자인 시스템
- **Netlify** — 정적 사이트 배포

> **색상 변경 처리:** AI 모델의 크로크 가죽 표면 디테일(노멀·러프니스 맵)은 유지하되,
> 베이크된 베이스컬러는 제거하고 색상을 코드로 제어합니다. 덕분에 질감은 살아 있으면서
> 6색 스와치가 선명하게 동작합니다. `bag.glb`가 없을 경우엔 Three.js 코드로 만든
> 대체 핸드백이 자동으로 표시됩니다(안전장치).

---

## 🚀 로컬에서 실행하기

ES Module(import map)을 쓰므로 `file://`이 아닌 **로컬 서버**로 열어야 합니다.

```bash
python -m http.server 5180
```
```bash
npx serve .
```
→ 브라우저에서 `http://localhost:5180` 접속

---

## ☁️ Netlify 배포 방법

### 방법 A — GitHub 연동 (권장)

```bash
git init
git add .
git commit -m "3D 핸드백 쇼핑몰 웹앱"
git branch -M main
git remote add origin https://github.com/<사용자명>/<저장소명>.git
git push -u origin main
```
2. [Netlify](https://app.netlify.com) 로그인 → **Add new site → Import an existing project**
3. **GitHub** 선택 → 방금 만든 저장소 선택
4. 빌드 설정 그대로 (Build command 비움 / Publish directory `.`) → **Deploy**
5. 발급된 URL을 README 상단 표에 붙여넣기

### 방법 B — 드래그 앤 드롭 (가장 빠름)

1. [app.netlify.com/drop](https://app.netlify.com/drop) 접속
2. 이 프로젝트 폴더를 통째로 드래그 → 즉시 배포

배포 후 실제 URL에서 회전·색상 변경이 동작하는지 꼭 테스트하세요.

---

## 🔄 다른 모델로 교체하기

`bag.glb`를 다른 `.glb` 파일로 교체하면 자동으로 그 모델이 사용됩니다.
용량이 크면 아래처럼 경량화하세요 (10MB 이하 권장):

```bash
npx @gltf-transform/cli optimize in.glb bag.glb \
  --compress quantize --texture-compress webp --texture-size 1024 --simplify true
npx @gltf-transform/cli simplify bag.glb bag.glb --ratio 0.28 --error 0.008
```

---

## 📁 파일 구조

```
.
├── index.html        # 페이지 구조 (쇼핑몰 레이아웃)
├── style.css         # 디자인 시스템 · 반응형 스타일
├── main.js           # Three.js 씬 · 모델 로드 · 인터랙션
├── bag.glb           # AI(Meshy) 생성 3D 핸드백 (최적화 2MB)
├── netlify.toml      # Netlify 배포 설정
├── 회고.md           # 프로젝트 소개 및 회고
└── screenshots/      # 문서용 스크린샷
```

---

## 📄 크레딧 / 라이선스

- 3D 모델: **Meshy** (Text-to-3D) 로 생성 · 라이선스 **CC BY 4.0** — “3D model generated with Meshy.ai”
- 코드: 학습용 프로젝트
