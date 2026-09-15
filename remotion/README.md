# remotion — cockpit + prodev 구조 설명 영상

cockpit(웹 조종석)이 Claude Code CLI 를 봇으로 띄우고, 그 봇에 prodev 하네스가 실려 사람과 한 방에서 일하는 구조를 5분 33초 영상으로 보인다.
장면 14개 · 9,990 프레임 · 1920×1080 · 30fps. 렌더 결과(mp4)는 저장소에 올리지 않는다 — 아래 명령으로 직접 만든다.

## 무엇이 필요한가

- Node 24 (v24.12.0 에서 만들었다). npm 이 같이 온다.
- 처음 한 번 `npm install` (Remotion 4.0.524 와 headless Chrome 을 받는다. 2~3분).
- 외부 폰트 없음. 맥은 Apple SD Gothic Neo · SF Mono, 윈도우는 Malgun Gothic · Consolas 로 그려진다. 다른 OS 에서는 한글 글꼴이 있어야 한다.

## 렌더하는 법

```bash
cd crew-workspace/remotion
npm install                                   # 처음 한 번
npx remotion render Main out/main.mp4         # 전체 영상. 맥 M 시리즈에서 약 2분
```

끝나면 `out/main.mp4` (약 25 MB) 가 생긴다. `out/` 은 .gitignore 에 있어 커밋되지 않는다.

확인은 ffprobe 로 한다 (없으면 렌더 로그의 `Encoded 9990/9990` 줄로).

```bash
ffprobe -v error -count_frames -select_streams v:0 \
  -show_entries stream=nb_read_frames,width,height,r_frame_rate \
  -of default=noprint_wrappers=1 out/main.mp4
# nb_read_frames=9990 · 1920 · 1080 · 30/1 이면 맞다
```

## 미리 보기 · 정지 화면

```bash
npm run dev                                   # Remotion Studio (브라우저에서 장면을 넘겨 본다)
npx remotion still Main out/check.png --frame=3460          # 전체 타임라인의 한 프레임
npx remotion still S06  out/S06-0400.png --frame=400        # 장면 하나의 상대 프레임 (같은 그림이어야 한다)
```

Composition 은 `Main`(전체) · `S01`~`S14`(장면 하나씩, 장면 안 상대 프레임 0 부터) · `Demo` · `Parts`(부품 확인용, 영상에 안 들어간다) 가 있다.

| 장면 | 무엇 | 프레임 | 시작 |
|---|---|---|---|
| S01 | 세 기둥과 바닥 | 360 | 0 |
| S02 | 서버 안의 두 DB 와 SSE | 540 | 360 |
| S03 | `+` 하나가 폴더 둘을 만든다 | 660 | 900 |
| S04 | 켜기 — `query()` 한 번 | 840 | 1560 |
| S05 | 닻줄 — cwd 로 물고 들어간다 | 660 | 2400 |
| S06 | 글 한 번 왕복 (겉봉투 · reply) | 960 | 3060 |
| S07 | 따라잡기와 승인 카드 | 600 | 4020 |
| S08 | 들이기 한 건 (intake · 확정 · pre-reply.js) | 960 | 4620 |
| S09 | 스킬 · 훅 · 도우미 — 한 턴의 시계 | 840 | 5580 |
| S10 | 바닥 — 지식이 쌓이고 찾힌다 (find.js) | 840 | 6420 |
| S11 | 압축 — 인수인계서와 여덟 절 | 840 | 7260 |
| S12 | 껐다 켜도 — 이어 붙기(resume) | 480 | 8100 |
| S13 | 굳는 길과 회고 (house.md · retro) | 780 | 8580 |
| S14 | 어디를 고치면 봇이 달라지나 | 630 | 9360 |

전체 타임라인 프레임 = 장면 시작 + 상대 프레임. 예: S06 의 400 은 Main 의 3460.

## 검사

```bash
npm run lint        # eslint src && tsc — 오류 0 이어야 한다 (깜박임 경고 2건은 알려진 것)
```

`src/scenes/index.ts` 가 장면 길이의 합이 9,990 이 아니면 throw 한다. 장면 길이를 바꾸면 `Root.tsx` 의 `TOTAL_FRAMES` 도 같이 바꾼다.

## 폴더

| 자리 | 무엇 |
|---|---|
| `plan/00-workflow.md` | 만든 흐름 — 기획 → 콘티 → 구현, 관문마다 meta 가 검수 |
| `plan/01-facts.md` | 화면에 쓴 사실의 근거 (코드 경로) |
| `plan/02-plan.md` | 기획 — 시각 모델(세 기둥과 바닥), 장면 14, 자막 |
| `plan/03-storyboard.md` | 콘티 — 장면마다 프레임 · 좌표 · 부품 · 화면 글자 |
| `plan/04-implementation.md` | 구현 가이드 — 무대 좌표 · 색 · 부품 · 장면 파일 규칙 · 6.5절 확정 사항 |
| `plan/05-next.md` | 다음 지시와 굳은 판정 규칙 (고칠 때 여기부터) |
| `plan/review/` | 관문마다 채점표와 판정 |
| `src/lib/` | 부품 — `StageView`(무대) · `Pillar` · `Cylinder` · `Envelope` · `ChatPane` · `Arrow` · … · `text.ts`(화면 글자, 코드에서 그대로 옮김) · `stage.ts`(좌표) · `theme.ts`(색) |
| `src/scenes/S01.tsx` ~ `S14.tsx` | 장면. 각각 `DURATION` · `STILLS` · 컴포넌트를 export |
| `src/Root.tsx` | Composition 등록 |

## 고칠 때

1. 화면 글자는 `src/lib/text.ts` 에서만 고친다. 콘티(`plan/03-storyboard.md`)의 같은 블록도 함께.
2. 좌표는 `src/lib/stage.ts` 의 `STAGE` 상수. 장면 파일에 숫자를 직접 쓰면 `// 03 S..` 주석을 단다.
3. 장면을 고친 뒤 그 장면의 still 셋(`STILLS`)을 뽑아 본다. 어느 프레임인지는 `plan/04-implementation.md` 6절 표.
4. 전체 렌더는 마지막에 한 번.
