# 구현 가이드 — cockpit + prodev 구조 영상

remotion 세션이 `03-storyboard.md` 를 코드로 옮길 때 보는 문서다. 기준은 `02-plan.md` 2판이고, 용어는 README 의 것(봇 · 방 · 작성기 · 조종석 판 · 봉투 `@TO` · 겉봉투 `<channel>` · 편지함 `bot_inbox` · 도우미 · 훅 · 인수인계서 · 회고 · 이어 붙기 resume)을 쓴다. 화면의 세션 상태는 `대기` · `일하는 중` · `승인 대기` 이고 코드 이름(`idle` · `working` · `waiting_approval`)은 고정폭으로 곁에 둔다. 좌표 · 색 · 부품 · 파일 이름을 여기서 한 번만 정한다. 콘티의 좌표와 이름은 전부 이 문서의 것이다.
`remotion/` 안에만 쓴다. `../cockpit/` · `../prodev/` 는 손대지 않는다. 외부 폰트 없음. 시스템 글꼴만 (`theme.ts` 의 `fonts`).

## 1. 타임라인 — `Root.tsx`

Composition `Main` · 1920×1080 · 30fps · **`durationInFrames = 9990`** (02-plan 의 9,900 에 장면 14 의 3초를 더한 값, 03 부록 B-1 의 meta 결정). 장면마다 `<Sequence from={…} durationInFrames={…}>` 하나. `from` 은 아래 표의 절대 시작 프레임이다.

| 장면 | 파일 | from | durationInFrames | 끝(포함 안 함) |
|---|---|---|---|---|
| S01 세 기둥과 바닥 | `src/scenes/S01.tsx` | 0 | 360 | 360 |
| S02 서버 안의 두 DB 와 SSE | `S02.tsx` | 360 | 540 | 900 |
| S03 `+` 하나가 폴더 둘을 만든다 | `S03.tsx` | 900 | 660 | 1560 |
| S04 켜기 — query() 한 번 | `S04.tsx` | 1560 | 840 | 2400 |
| S05 닻줄 — cwd | `S05.tsx` | 2400 | 660 | 3060 |
| S06 글 한 번 왕복 | `S06.tsx` | 3060 | 960 | 4020 |
| S07 따라잡기와 승인 카드 | `S07.tsx` | 4020 | 600 | 4620 |
| S08 들이기 한 건 | `S08.tsx` | 4620 | 960 | 5580 |
| S09 스킬 · 훅 · 도우미 — 한 턴의 시계 | `S09.tsx` | 5580 | 840 | 6420 |
| S10 바닥 — 지식이 쌓이고 찾힌다 | `S10.tsx` | 6420 | 840 | 7260 |
| S11 압축 | `S11.tsx` | 7260 | 840 | 8100 |
| S12 껐다 켜도 — 이어 붙기(resume) | `S12.tsx` | 8100 | 480 | 8580 |
| S13 굳는 길과 회고 | `S13.tsx` | 8580 | 780 | 9360 |
| S14 어디를 고치면 봇이 달라지나 | `S14.tsx` | 9360 | 630 | 9990 |

`Root.tsx` 꼴:

```tsx
import { Composition, Sequence, AbsoluteFill } from "remotion";
import { SCENES } from "./scenes";          // [{ id:'S01', component: S01, from: 0, durationInFrames: 360 }, …]
import { THEME } from "./lib/theme";

const Main: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: THEME.colors.background }}>
    {SCENES.map(s => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.durationInFrames} name={s.id}>
        <s.component />
      </Sequence>
    ))}
  </AbsoluteFill>
);
export const TOTAL_FRAMES = 9990;
// <Composition id="Main" component={Main} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
```

`src/scenes/index.ts` 가 `SCENES` 배열을 낸다. 장면 파일마다 `export const DURATION = <프레임>` 을 두고 배열은 그 값을 쓴다 (숫자를 두 곳에 적지 않는다). `from` 은 배열에서 앞 장면의 `from + DURATION` 을 누적해 계산하고, 합이 9990 인지 `index.ts` 에서 한 번 검사한다(틀리면 throw).
장면마다 `Composition` 을 하나씩 더 등록한다 (`id="S01"` … `"S14"`, 각 `durationInFrames = DURATION`). meta 가 장면 still 을 뽑을 때 쓴다 (6절). `Demo` Composition 은 남겨 둔다.

## 2. STAGE 상수 — `src/lib/stage.ts`

무대 좌표는 여기 한 번만 있다. 장면 파일은 숫자를 새로 적지 않고 `STAGE.*` 를 쓴다. 모든 상자는 `Node` 와 같은 규약(가운데 x·y · width · height)이라 `nodeAnchor()` 를 그대로 쓸 수 있다.

```ts
import { Point } from "./theme";
export type Box = { x: number; y: number; width: number; height: number };   // 가운데 좌표

export const STAGE = {
  W: 1920, H: 1080, FPS: 30,

  // ── 전경 (mode: 'overview') ────────────────────────────
  PILLAR_TOP: 100, PILLAR_H: 500,
  BROWSER: { x: 300,  y: 350, width: 360, height: 500 },   // 120~480 · 100~600
  SERVER:  { x: 960,  y: 350, width: 400, height: 500 },   // 760~1160
  CLI:     { x: 1620, y: 350, width: 360, height: 500 },   // 1440~1800

  CHAT_DB:    { x: 860,  y: 520, width: 170, height: 120 }, // 서버 속 왼쪽 원통
  COCKPIT_DB: { x: 1060, y: 520, width: 170, height: 120 }, // 서버 속 오른쪽 원통
  MCP_BOX:    { x: 960,  y: 300, width: 300, height: 64 },  // "MCP 도구 cockpit · src/mcp/tools.js"

  // 기둥 속 자리 (기둥 x 는 각 기둥의 것, y 만 여기)
  PILLAR_TITLE_Y: 130,        // 제목 띠 100~160
  PILLAR_BODY_TOP: 170,       // 속 170~590
  SERVER_LABEL_Y: 215,        // createRoom · manager.start · bootResume 자리
  SERVER_LABEL2_Y: 240,       // insertBotMessage · compact_boundary 자리
  SERVER_KICK_Y: [360, 390, 420], // #kick · pendingInbox · wrapChannel
  CLI_TREE: { x: 1460, y: 175, width: 320 },   // CLI 속 FolderTree 왼쪽 위
  CLI_INPUT_SLOT: { x: 1470, y: 200 },         // 겉봉투 · 옵션 상자가 도착하는 자리

  // 화살표 줄 (기둥 사이 y)
  ARROW_TOP_Y: 280,   // 브라우저→서버 요청
  ARROW_MID_Y: 300,   // CLI→서버 MCP (reply · fetch_history)
  ARROW_TOOL_Y: 380,  // canUseTool · allow
  ARROW_SSE_Y: 420,   // 서버→브라우저 SSE
  GAP_L: { from: { x: 488, y: 0 }, to: { x: 752, y: 0 } },    // 브라우저 오른변+8 ~ 서버 왼변-8
  GAP_R: { from: { x: 1432, y: 0 }, to: { x: 1168, y: 0 } },  // CLI 왼변-8 ~ 서버 오른변+8

  // ── 바닥 ───────────────────────────────────────────────
  FLOOR_Y: 680,
  PRODEV:  { x: 650,  y: 800, width: 1060, height: 200 },  // 120~1180 · 700~900
  ROOT_CLAUDE: { x: 250, y: 765, width: 200, height: 44 },
  ROOT_SKILLS: { x: 480, y: 765, width: 240, height: 44 },
  ROOT_AGENTS: { x: 250, y: 835, width: 200, height: 44 },
  ROOT_HOOKS:  { x: 480, y: 835, width: 240, height: 44 },
  BOTS_BOX:   { x: 1010, y: 810, width: 300, height: 160 }, // 860~1160 · 730~890
  BOT_FOLDER: { x: 1010, y: 830, width: 260, height: 100 }, // 880~1140 · 780~880
  BOT_TREE:   { x: 890, y: 800, width: 240 },
  PROJECT: { x: 1550, y: 800, width: 500, height: 200 },   // 1300~1800 · 700~900
  PROJECT_TREE: { x: 1320, y: 735, width: 460 },
  ANCHOR: [ { x: 1620, y: 600 }, { x: 1620, y: 650 }, { x: 1010, y: 650 }, { x: 1010, y: 780 } ] as Point[],
  ANCHOR_CLIMB: [ { x: 1010, y: 780 }, { x: 1010, y: 735 }, { x: 860, y: 735 }, { x: 860, y: 705 }, { x: 140, y: 705 } ] as Point[],
  CONTEXT_BAR: { x: 1848, y: 350, width: 36, height: 500 },

  // 떠 있는 상자 (겉봉투 · 옵션 · 검사표) 의 기본 자리 — 왼쪽 위 좌표
  OVERLAY: { x: 560, y: 120, width: 800 },
  ENVELOPE_BIG: { x: 460, y: 130, width: 1000 },
  ENVELOPE_WIDE: { x: 400, y: 120, width: 1120 },

  // ── 바닥 확대 (mode: 'floor') ───────────────────────────
  MINI: { y: 60, height: 56, width: 320, BROWSER_X: 300, SERVER_X: 960, CLI_X: 1620 },
  PRODEV_BIG:  { x: 500,  y: 540, width: 880, height: 720 }, // 60~940 · 180~900
  BIG_ROOT: { x: 90, y: 240, width: 560 },
  BIG_BOT_FOLDER: { x: 700, y: 780, width: 420, height: 180 }, // 490~910 · 690~870
  BIG_BOT_TREE: { x: 500, y: 720, width: 400 },
  PROJECT_BIG: { x: 1420, y: 540, width: 900, height: 720 }, // 970~1870 · 180~900
  BIG_PROJECT_LEFT:  { x: 1000, width: 400 },   // 기억의 층 · 찾기 층
  BIG_PROJECT_RIGHT: { x: 1440, y: 200, width: 400 }, // 과제 문서
  LEFT_PANEL: { x: 80, y: 140, width: 820, height: 740 }, // S13 지시형 · 관찰형 판

  // ── 카메라 ─────────────────────────────────────────────
  CAMERAS: {
    OVERVIEW: { scale: 1,    cx: 960,  cy: 540 },
    SERVER:   { scale: 1.35, cx: 900,  cy: 420 },
    RIGHT:    { scale: 1,    cx: 1560, cy: 540 },
    FLOOR_ZOOM: { scale: 2.2, cx: 1550, cy: 800 },   // floor 로 넘어갈 때 지나가는 값
  },
} as const;

export type Camera = { scale: number; cx: number; cy: number };
/** 카메라를 CSS transform 으로. 초점(cx,cy)이 화면 가운데(960,540)에 오도록 */
export const cameraTransform = (c: Camera) =>
  `translate(${960 - c.cx * c.scale}px, ${540 - c.cy * c.scale}px) scale(${c.scale})`;
```

카메라 `RIGHT` 일 때 무대 x → 화면 x 는 `x - 600`. 콘티 장면 9 의 "화면 좌표" 는 이 값이다. 화면 좌표로 그리는 것(시간축 · 도우미 기둥 · 이름표)은 `Stage` **밖**에 둔다 (5절).

## 3. THEME — `src/lib/theme.ts`

기존 `THEME` 을 바꾼다. 색은 **넷 + 경고 하나 + 배경 · 글자**. 그 밖의 색은 없다 (02-plan 스타일 원칙 2). 기존 `accent` · `arrow` 는 남기되 값을 아래로 맞춘다 (`Node` · `Arrow` 기본값이 깨지지 않게).

```ts
export const THEME = {
  colors: {
    background: "#0f1216",
    surface: "#1a1f26",
    surfaceRaised: "#222933",
    border: "#2e3642",
    text: "#e8eaed",
    textMuted: "#9aa4b2",
    off: "#5b6573",                 // 꺼진 기둥 테두리 · 흐린 줄

    human:  "#e8c15a",              // 사람 · 브라우저 · 사람이 보낸 글 · admin 승인
    server: "#4f9dff",              // cockpit 서버 · DB 둘 · SSE · MCP 상자
    cli:    "#7dd3a0",              // Claude Code CLI · 봇 · 닻줄 · 훅 · 스킬
    file:   "#c9a27e",              // 바닥 · 파일 · 폴더 · 카드
    warn:   "#ff5c5c",              // exit 2 · deny · "굳히지 않는다"

    accent: "#4f9dff",              // = server (Node · CodeBlock 기본값용)
    arrow:  "#8a96a8",              // 색을 안 준 화살표 (쓰지 않는 것이 원칙)
    codeBackground: "#12161c",
    lineNumber: "#5b6573",
    highlightLine: "rgba(79, 157, 255, 0.16)",
    captionBackground: "rgba(0, 0, 0, 0.62)",
    dim: "rgba(15, 18, 22, 0.72)",  // Spotlight 가 덮는 색
  },
  fonts: {
    sans: '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Segoe UI", "Malgun Gothic", sans-serif',
    mono: 'ui-monospace, "SF Mono", Menlo, Consolas, "Malgun Gothic", "Courier New", monospace',
  },
  sizes: {
    caption: 40, captionSmall: 28,
    nodeTitle: 34, nodeSubtitle: 20,
    pillarTitle: 26, pillarSubtitle: 18, pillarStatus: 16,
    code: 24, envelope: 21, codeSmall: 18, codeTiny: 16,
    arrowLabel: 20, arrowLabelSmall: 14,
    tree: 16, treeSmall: 14, treeTiny: 13,
    chat: 15, chatSmall: 13,
    label: 18, labelSmall: 14,
    cylinderName: 16, cylinderRow: 15,
  },
  radius: 14, radiusSmall: 8,
  glow: (color: string) => `0 0 28px 4px ${color}`,
} as const;
export type Point = { x: number; y: number };
export type Tone = "human" | "server" | "cli" | "file" | "warn";
export const tone = (t: Tone) => THEME.colors[t];
```

`mono` 에 `"Malgun Gothic"` 을 넣은 까닭: 윈도우에서 한글이 든 고정폭 글자(겉봉투 · 이름표)가 대비 글꼴로 떨어지게. 맥은 `SF Mono` 가 한글을 시스템 글꼴로 넘긴다.
글꼴 크기 단계는 위 `sizes` 뿐이다. 콘티에 적힌 `fontSize` 숫자는 이 단계 중 하나거나 13/12 (조밀한 나무)다.

## 4. 부품 — `src/lib/`

기존 넷(`Node` · `Arrow` · `CodeBlock` · `Caption`)은 **고치지 않고** 그대로 쓴다. 새 부품은 아래 15 개. 전부 `useCurrentFrame()` 을 안에서 부르므로 Sequence 안에서 상대 프레임으로 돈다. 공통 규약:
- 좌표 props 는 `Box`(가운데) 또는 `x·y`(왼쪽 위) 중 하나를 쓰고 표에 적는다.
- `enterFrame` · `from` · `until` 은 상대 프레임. `until` 없으면 장면 끝까지.
- 색은 `tone: Tone` 으로 받는다 (직접 hex 를 주지 않는다).
- 나타남은 `interpolate(frame, [from, from+8], [0,1])` 의 opacity + 12px 올라오기. `lit` 은 테두리 · 글자를 제 tone 색으로, 배경에 tone 12% 를 깐다.

| 부품 | props | 쓰는 장면 | 한 줄 설명 |
|---|---|---|---|
| `Stage` | `mode?: 'overview'\|'floor'` · `camera?: Camera` · `floorProgress?: 0~1` · `browser?/server?/cli?: PillarState` · `chatDb?/cockpitDb?: CylinderProps 일부(rows·chips·dim)` · `prodev?/project?/botsBox?/botFolder?: {dim?, glowFrom?}` · `rootCards?: boolean` · `anchor?: number(0~1)` · `anchorClimb?: number` · `transition?: {to:'floor'\|'overview', from, durationInFrames}` · `children` (무대 좌표 겹치기) · `mini?: MiniState` (floor 때 띠 셋의 글자·lit) | 전부 | 무대의 고정 부분을 그린다. 카메라 transform 을 `children` 에도 적용한다. `mode='floor'` 면 전경 대신 MINI 띠 + PRODEV_BIG + PROJECT_BIG 을 그린다. `transition` 이 있으면 두 배치를 교차 페이드하며 `camera` 를 `FLOOR_ZOOM` 까지 보간한다 |
| `Pillar` | `box: Box` · `title` · `subtitle?` · `tone` · `status: 'off'\|'on'\|'starting'\|'idle'\|'working'\|'waiting'` · `statusText?` · `enterFrame?` · `dim?` · `children` | 1~9 · 11 · 12 (도우미 기둥은 9) | 세로 기둥. 테두리 색 = 상태(콘티 0절 표). `starting` 은 20프레임 주기로 40%↔100%. `working` 은 `THEME.glow(cli)`. `children` 은 속(y 170~590)에 절대 좌표로 놓인다 |
| `Cylinder` | `box: Box` · `name` · `tone` · `enterFrame?` · `rows: {text, from?, highlightFrom?, highlightUntil?}[]` · `chips?: {row: string, text, from, until?}[]` · `dim?` | 2~4 · 6~8 · 11 · 12 | DB 원통. 표 이름이 `rows` 로 한 줄씩 붙고(편지함 줄은 `bot_inbox (편지함)` 으로 적는다, `chips.row` 는 `'bot_inbox'` 로 앞 낱말만 맞춘다), `chips` 는 그 줄 옆에 작은 칩이 위에서 12px 떨어지며 생긴다 ("줄이 실제로 추가된다"). 같은 `row` 에 칩이 여럿이면 오른쪽으로 쌓는다(최대 3, 넘치면 `+n`) |
| `FolderBox` | `box: Box` · `title` · `subtitle?` · `tone` · `enterFrame?` · `dim?: number` · `glowFrom?` · `glowUntil?` · `children` | 1 · 3 · 5 · 10~14 · 11(`claude -p` 상자) | 바닥 상자 · 폴더 · 작은 프로세스 상자. 제목은 mono 왼쪽 위 |
| `FileCard` | `x,y`(가운데) · `name` · `sub?`(둘째 줄) · `tone` · `width?=200` · `height?=44` · `fontSize?` · `enterFrame?` · `lock?: boolean`(🔒 표시) · `badge?: string`(`0444` · `PR`) · `number?: string`(`①`) · `lit?: boolean\|number` | 3 · 5 · 8 · 9 · 10~14 | 파일 · 폴더 카드 한 장. `Mover` 안에 넣어 이동시킨다 |
| `FolderTree` | `x,y`(왼쪽 위) · `width` · `fontSize?=16` · `lineHeight?=1.7` · `tone?` · `opacity?` · `lines: {text, depth?, from?, until?, lit?: boolean\|number, dim?: number, warn?: boolean, mono?: boolean=true, lock?: boolean, number?: string, tone?: Tone}[]` | 3 · 5 · 7~14 | 줄 목록. 줄마다 `from` 에 나타나고 `until` 에 사라진다. `lit` 이 숫자면 세기. 같은 자리에서 글자만 바꿀 때는 옛 줄 `until` = 새 줄 `from` 으로 |
| `Envelope` | `x,y`(왼쪽 위) · `width` · `text` · `fontSize?=21` · `startFrame?` · `framesPerLine?=25` · `highlightLines?: number[]` · `tone?='server'` · `title?` · `compact?: boolean`(머리 한 줄 + 본문 한 줄만) | 6 · 7 · 8 · 12 | 겉봉투 (`<channel …>` 덩이, cockpit README 5절). `CodeBlock` 과 달리 **`white-space: pre-wrap; word-break: break-all`** 로 긴 머리 줄을 접는다. 줄 번호 없음. 머리 줄(`<channel …>`)과 꼬리(`</channel>`)는 tone 색, 본문은 글자색, `→` 줄은 tone 색 |
| `Mover` | `from: {x,y,scale?,opacity?}` · `to: {…}` · `startFrame` · `durationInFrames` · `holdBefore?: boolean=false` · `holdAfter?: boolean=true` · `easing?` · `children` | 3~14 | 물건을 A 에서 B 로 옮긴다. `children` 은 (0,0) 기준으로 그려지고 Mover 가 `translate(x,y) scale(s)` 를 준다(가운데 기준). `holdBefore` 가 false 면 시작 전엔 안 보인다 |
| `ChatPane` | `box: Box`(=STAGE.BROWSER) · `viewer` · `sidebar?: {rooms: {name, from}[], plusPressAt?}` · `dialog?: {label, text, from, typeUntil, until}` · `chip?: {name, online: boolean, from?, workingFrom?, workingUntil?}` · `messages: {author?, badge?: 'BOT', body, kind: 'user'\|'bot'\|'system', attach?: string, from}[]` · `input?: {placeholder?, text?, typeFrom?, typeUntil?, autocomplete?: {items, from, until, pickAt}, afterPick?, typeMoreFrom?, typeMoreUntil?, textFinal?, attach?, sendAt?}` · `panel?: {stateText?, stateFrom?, buttons?: string[], pressAt?, contextPct?: number}` · `card?: ApprovalCardProps` | 1 · 3 · 4 · 6 · 7 · 8 · 11 · 12 | 브라우저 기둥 속 전부: 사이드바 줄 · 봇 칩 · 글 목록 · 입력칸(타자 · 자동완성) · 조종석 판(상태 · 단추 · 문맥 %). 글 목록은 `from` 순으로 쌓이고 넘치면 위가 밀린다(맨 아래 정렬). 타자는 `typeFrom~typeUntil` 사이에 글자 수를 선형으로 늘린다. `sendAt` 에 입력칸이 비고 안내 글자로 돌아간다 |
| `ApprovalCard` | `x,y`(왼쪽 위) · `width` · `request: {project, tool, heading, input}` · `buttons: string[]` · `enterFrame` · `pressAt?` · `pressed?: string` · `leaveFrame?` | 7 | 조종석 판의 승인 카드. `card.js:54-73` 의 줄 순서(meta 줄 · 제목 · input pre · 단추 줄). `pressAt` 에 그 단추가 눌린 색(human) |
| `Timeline` | `x` · `yTop` · `yBottom` · `ticks: {label, y, from}[]` · `markerY?: number` · `enterFrame?` · `tone?='cli'` · `labelSize?=14` · `labelWidth?=560` | 9 | 세로 시간축 (화면 좌표). 눈금은 축 오른쪽에 글자(mono). `markerY` 에 빛나는 점, 지나간 눈금은 밝고 아직 안 온 눈금은 흐리다 |
| `ContextBar` | `box: Box` · `pct: 0~1` · `label?` · `tone?='cli'` | 11 | 세로 막대. 아래에서 `pct` 만큼 찬다. 글자는 막대 위에 |
| `AnchorLine` | `points: Point[]` · `progress: 0~1` · `tone?='cli'` · `climb?: {points: Point[], progress: 0~1}` · `strokeWidth?=4` | 4 · 5 · 11~14 | 닻줄(cwd). 꺾은선을 `progress` 만큼 그리고 끝에 작은 닻 표시(⚓ 대신 원 + 가로 막대). `climb` 은 두 번째 꺾은선 위로 빛 덩이가 달린다 (0→1) |
| `Spotlight` | `rects: (Box \| {x,y,width,height,corner?})[]` · `opacity?=0.7` · `from?` · `until?` · `fadeFrames?=10` | 2 · 4~13 | 화면 전체를 `THEME.colors.dim` 으로 덮되 `rects` 는 구멍(SVG mask). `rects=[]` 면 전부 덮는다. `until` 뒤 `fadeFrames` 동안 걷힌다 |
| `Label` | `x,y`(가운데) · `text` · `from?` · `until?` · `mono?=true` · `size?=18` · `tone?` · `color?` · `align?='center'` · `background?: boolean=true` · `maxWidth?` · `warn?: boolean` · `vertical?: boolean` · `glowFrom?` · `glowUntil?` | 거의 전부 | 이름표 한 줄. `Arrow` 의 label 과 같은 모양(배경 상자 + mono). `maxWidth` 를 주면 접는다 |

`Node` 는 이 영상에서 쓰지 않아도 된다 (기둥은 `Pillar`). `Caption` 은 자막 전부, `CodeBlock` 은 옵션 상자 · 결과 JSON · 검사표 · 인수인계서 · 서버 창, `Arrow` 는 화살표 전부.

### 4.1 상태 → 테두리 (Pillar)

| status (props) | 테두리 | 부제 옆 글자 (한글 sans 16 + 코드 이름 mono 14) |
|---|---|---|
| `off` | `THEME.colors.off` 점선 2px · 속 opacity 0.35 | CLI 기둥이면 `꺼짐 stopped`, 서버 · 브라우저는 없음 |
| `on` | tone 색 실선 2px | (없음) |
| `starting` | cli 색, 20프레임 주기 40%↔100% | `켜는 중 starting` |
| `idle` | cli 색 실선 | `대기 idle` |
| `working` | cli 색 실선 + `THEME.glow(cli)` | `일하는 중 working` |
| `waiting` | **human 색** 실선 + `THEME.glow(human)` | `승인 대기 waiting_approval` |

한글 이름은 cockpit README 1.1 "세션" 의 여섯 상태 이름(`꺼짐` · `켜는 중` · `대기` · `일하는 중` · `승인 대기` · `오류`)에서 왔다. `Pillar` 가 `status` 로 짝을 스스로 고른다 — 장면 파일이 글자를 따로 주지 않는다.

### 4.2 이동 · 나타남의 easing

- `Mover` 기본 `Easing.inOut(Easing.cubic)`. 떨어지는 파일(위→아래)은 `Easing.in(Easing.quad)` 를 `easing` 으로 준다.
- 나타남 8프레임, 사라짐 8프레임. `Spotlight` 는 10.
- 카메라 보간 `Easing.inOut(Easing.cubic)`, 40프레임.
- 교차 페이드(overview↔floor) 30프레임: 옛 배치 opacity 1→0 (0~30), 새 배치 0→1 (10~40), 카메라는 옛 배치에만 `FLOOR_ZOOM` 까지(내려갈 때) 또는 `FLOOR_ZOOM`→`OVERVIEW`(올라올 때).

### 4.3 공통 도우미 — `src/lib/anim.ts`

```ts
export const fadeIn = (frame: number, from: number, dur = 8) => interpolate(frame, [from, from + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
export const between = (frame: number, from?: number, until?: number) => (from == null || frame >= from) && (until == null || frame < until);
export const visible = (frame, from, until, fade = 8) => /* 0~1: from 에서 fade 동안 오르고 until-fade 부터 내린다 */;
export const lerpCamera = (a: Camera, b: Camera, t: number): Camera;
export const loop = (frame: number, from: number, period: number) => frame < from ? 0 : ((frame - from) % period) / period;   // SSE 점선 반복
export const typed = (text: string, frame: number, from: number, until: number) => text.slice(0, Math.round(interpolate(frame, [from, until], [0, text.length], clamp)));
```

### 4.4 글자 상수 — `src/lib/text.ts`

콘티의 "화면 글자" 블록(`OPTIONS` · `ENVELOPE_6` · `ENVELOPE_8` · `ENVELOPE_12` · `HISTORY_7` · `CHECK_8` · `BOT_8A` · `TICKS_9` · `BRANCH_9` · `SKILLS_9` · `CHECKS_9` · `LAYERS_10` · `FINDLOG_10` · `HANDOFF_11` · `SECTIONS_11` · `WAKE_11` · `TERM_12` · `RETRO_13` · `SEVEN_A`)을 **글자 그대로** 상수로 둔다. 파일 머리 주석에 콘티의 `(경로:줄)` 을 옮겨 적는다. 장면 파일 안에 긴 글자를 직접 쓰지 않는다 — meta 가 이 파일 하나를 코드와 맞대어 본다.

## 5. 장면 파일 규칙 — `src/scenes/S01.tsx` ~ `S14.tsx`

```tsx
// src/scenes/S06.tsx
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../lib/Stage";
import { Caption } from "../lib/Caption";
import { STAGE } from "../lib/stage";
import { ENVELOPE_6 } from "../lib/text";

export const DURATION = 960;               // 03-storyboard 의 프레임 수. Root 가 이 값을 쓴다
export const STILLS = [0, 400, 720];        // 6절 검수 프레임. index.ts 가 모은다

export const S06: React.FC = () => {
  const frame = useCurrentFrame();         // Sequence 안이라 0~DURATION-1
  return (
    <AbsoluteFill>
      <Stage
        browser={{ status: 'on' }} server={{ status: 'on' }}
        cli={{ status: frame >= 740 ? 'idle' : frame >= 560 ? 'working' : 'idle' }}
        chatDb={{ rows: […], chips: […] }} cockpitDb={{ … }}
        anchor={1} rootCards
      >
        {/* 무대 좌표로 그리는 것: Arrow · Label · Mover · Envelope · Spotlight … */}
      </Stage>
      {/* 화면 좌표로 그리는 것 (카메라와 무관): Caption · Timeline(S09) · 화면 이름표 */}
      <Caption text="봉투가 붙은 글만 겉봉투에 싸여 봇에게 간다." from={130} durationInFrames={350} />
      <Caption text="봇이 방에 말하는 길은 reply 하나뿐이다." from={560} durationInFrames={220} />
    </AbsoluteFill>
  );
};
```

규칙:
1. **장면 파일이 export 하는 것 셋:** `DURATION`(number) · `STILLS`(number[3]) · 장면 컴포넌트 `S01`…`S14`. `index.ts` 가 셋을 모아 `SCENES` 를 만든다.
2. **상대 프레임만 쓴다.** `useCurrentFrame()` 은 Sequence 안에서 0 부터 센다. 절대 프레임(`from`)은 `Root.tsx` 만 안다. 장면 안에서 `frame - 3060` 같은 계산을 하지 않는다.
3. **자막은 `Caption` 의 `from` + `durationInFrames`** 로. 콘티의 "시작 · 끝" 은 `from = 시작`, `durationInFrames = 끝 - 시작`.
4. **좌표는 `STAGE.*`** 만. 콘티에 적힌 숫자는 `STAGE` 상수의 값이므로 상수 이름으로 바꿔 쓴다. 콘티에만 있는 자리(예: `Label (960,215)`)는 `STAGE.SERVER.x` · `STAGE.SERVER_LABEL_Y` 처럼 조합한다. 어쩔 수 없이 숫자를 직접 쓰면 그 줄에 `// 03 S06 비트 260~320` 주석을 단다.
5. **무대 좌표 vs 화면 좌표.** `Stage` 의 `children` 은 카메라 transform 안에 있다(무대 좌표). `Stage` 밖의 형제는 화면 좌표다. `Caption` 은 언제나 밖. S09 의 `Timeline` · 도우미 `Pillar` · 시간축 옆 `FolderTree`/`Label`, S10 · 13 · 14 의 MINI 띠 위 `Label`/`Mover` 는 밖(콘티에 "화면" 이라고 적힌 것).
6. **상태는 프레임의 함수로.** `status` · `highlightLines` · `pct` 처럼 프레임에 따라 바뀌는 값은 장면 파일 위쪽에 `const cliStatus = (f) => …` 꼴의 작은 함수나 `interpolate` 로 적는다. 콘티 비트 표의 프레임을 그대로 옮긴다.
7. **장면 사이 이어짐.** 앞 장면 끝 모습과 다음 장면 첫 모습이 같아야 한다 (예: S05 끝 = S06 시작: 세 기둥 on/idle, 닻줄 1, 바닥 밝음, 실린 것 셋). 각 장면은 `frame 0` 에서 콘티 "한 장 그림" 의 기본 상태를 스스로 그린다 — 앞 장면에 기대지 않는다.
8. `_Demo.tsx` 는 지우지 않는다.

## 6. 검수 방법 — still 프레임

remotion 세션은 장면마다 아래 세 프레임을 렌더해 보고한다. 명령은 장면 Composition 으로:

```
npx remotion still Main out/stills/S06-0400.png --frame=3460      # 절대 프레임 (from + 상대)
npx remotion still S06  out/stills/S06-0400.png --frame=400       # 장면 Composition, 상대 프레임 (같은 그림이어야 한다)
```

두 방법의 그림이 같은지 S01 · S07 · S14 에서 한 번씩 맞춘다 (Sequence `from` 이 맞는지 보는 검사다). 파일 이름은 `S<장면>-<상대 프레임 4자리>.png`. `out/stills/` 는 `.gitignore` 에 넣는다.

| 장면 | 시작 | 중간 | 끝 | 중간 프레임에서 보여야 하는 것 |
|---|---|---|---|---|
| S01 | 0 | 200 | 340 | 기둥 셋 · 바닥 흐림 · POST 화살표 끝 · SSE 점선 · 자막 2 |
| S02 | 0 | 320 | 520 | 서버 줌 · 원통 둘 · `messages` 줄 칩 · SSE message |
| S03 | 0 | 360 | 600 | setup 칩 · 과제 폴더 줄 넷 · 봇 폴더에 설정 두 장 · CLI 회색 |
| S04 | 0 | 300 | 760 | 옵션 상자 9줄 · `cwd` 강조 · 조명 |
| S05 | 0 | 350 | 620 | 닻줄 걸림 · 실린 것(설정 두 장 펼침) · 닻줄 오르는 빛 · `한 층 위 bots/` |
| S06 | 0 | 400 | 720 | 겉봉투 크게 4줄 · 조명 · `wrapChannel` 이름표 |
| S07 | 0 | 260 | 500 | fetch_history 결과 JSON · `attachments` 줄 강조 |
| S08 | 0 | 740 | 900 | chat.db 조명 · 확정 조건 넷 ✓ · CLI `PreToolUse · pre-reply.js` |
| S09 | 0 | 420 | 620 | 카메라 RIGHT · 시간축 눈금 3 · 도우미 기둥 · 여섯 이름 |
| S10 | 0 | 580 | 800 | floor 배치 · 층 넷 · 찾기 층 여섯에 ② 불빛 · `find.js` 명령 |
| S11 | 0 | 440 | 700 | `handoff-compact.md` 떨어짐 · 여섯 칸 상자 · 막대 92% |
| S12 | 0 | 260 | 440 | 서버 창 4줄 · CLI `starting` · `bot_inbox` 미배달 2 · `resume: abc…` 칩 |
| S13 | 0 | 560 | 700 | 지시형 판 · `templates/회의록.md` 머리 셋 · retro 제안 (a)(b)(c) · 읽기 점선 둘 |
| S14 | 0 | 300 | 600 | 일곱 불 · `deny` 셋 warn · (끝: 전경 복귀 + 요지 자막) |

시작 프레임(0)은 "앞 장면 끝과 이어지는가", 끝 프레임은 "다음 장면 시작과 이어지는가" 를 본다. 위 표의 세 값이 각 장면 파일의 `STILLS` 다.
전체 렌더(`npx remotion render Main out/main.mp4`)는 장면 14 까지 still 이 통과한 뒤 한 번.

## 6.5 덧붙임 — C-0 뒤 확정된 것 (meta, 2026-09-15)

구현하며 04 와 달라진 것 가운데 meta 가 받아들인 것. 장면 파일은 이것을 따른다.
- `Stage` 는 `src/lib/StageView.tsx` 에 있다 (`import { Stage } from "../lib/StageView"`). `stage.ts` 와 대소문자만 다른 이름은 맥·윈도우에서 충돌한다.
- `Cylinder` 에 `chipSide?: 'left'|'right'`. Stage 는 chat.db 에 `left`.
- `Stage` 기본값: 기둥 셋은 안 주면 기본(브라우저 · 서버 on, CLI off, CLI 부제 `(봇)`), `false` 면 안 그림. prodev · project 는 안 주면 밝게. chatDb · cockpitDb · botsBox · botFolder 는 줄 때만. 바닥 상자 상태에 `enterFrame` · `glowUntil` · `children`. floor 모드는 BIG_BOT_FOLDER 도 그린다. mini 칩에 `title?` · `tone?`. MCP_BOX 는 장면이 `Label` 로 놓는다.
- `ChatPane` 칸 자리(무대 y): 사이드바 170~200 · 봇 칩 200~226 · 글 목록 226~468 · 입력칸 470~518 · 조종석 판 522~592 (03 0절의 100~150 은 기둥 제목 띠와 겹쳐 내렸다). 판 줄은 `조종석 · 상태: … · 문맥 NN%`.
- `Pillar.dim` 은 `boolean|number` (true = 0.35). Pillar · FolderBox 의 children 은 무대 절대 좌표.
- 상수 값 셋 (C-0 겹침 고침): `STAGE.BOT_TREE.y` = 812 · 원통 폭 184 (CHAT_DB x 858 · COCKPIT_DB x 1062) · 원통 표 줄 글자 14 · 원통 이름 y +12.
- C-1~3 뒤 (2026-09-15): 원통 height **136** (y 520 그대로). Cylinder 줄 시작 +10 · 줄 높이 16. `Label.backgroundColor?: string`. S03 setup 칩 도착 y **650**, `① 먼저` y **612**. `index.ts` 합 검사는 S14 전까지 "> 9990 이면 throw", S14 뒤 `=== 9990`.

## 7. 순서 — 만드는 차례와 보고

만드는 차례 (하나가 끝나야 다음):

1. `src/lib/theme.ts` 바꾸기 (3절) → `src/lib/stage.ts` · `anim.ts` · `text.ts` 만들기. `text.ts` 는 콘티의 글자 블록을 전부 옮긴다.
2. 부품 — 이 순서로: `Label` → `Spotlight` → `Mover` → `Pillar` → `Cylinder` → `FolderBox` → `FileCard` → `FolderTree` → `AnchorLine` → `Stage`(overview 만) → `Envelope` → `ChatPane` → `ApprovalCard` → `ContextBar` → `Timeline` → `Stage` 의 `floor` 모드와 `transition`.
   부품마다 `_Demo.tsx` 처럼 확인용 장면(`src/scenes/_Parts.tsx`, Composition `Parts`)에 한 번씩 놓아 본다. `Parts` 는 영상에 안 들어간다.
3. 무대 확인: `Parts` 에 `Stage` 전경(모든 기둥 on, 원통 표 전부, 바닥 전부, 닻줄 1)과 `floor` 배치 한 장씩. still 두 장을 뽑아 콘티 0절 그림과 맞춘다. **이 두 장이 통과해야 장면으로 간다.**
4. 장면 S01 → S02 → … → S14 차례로. 장면 하나가 끝날 때마다 6절의 still 셋을 뽑아 보고하고, meta 의 통과 뒤 다음 장면으로. S09 · S10 · S13 처럼 새 배치(카메라 RIGHT · floor)를 처음 쓰는 장면은 still 을 먼저 뽑아 배치부터 보인다.
5. `src/scenes/index.ts` 와 `Root.tsx` 는 S01 을 만들 때 함께 만들고, 장면이 늘 때마다 `SCENES` 에 더한다. 합이 9990 이 아니면 `index.ts` 가 throw 한다.
6. S14 뒤 전체 렌더 한 번. mp4 와 총 프레임 · 파일 크기 · 렌더 시간을 보고.

장면 하나가 끝났을 때 보고에 넣을 것 (이 순서로, 자기 평가 없이):
- 장면 번호 · 파일 경로 · `DURATION`
- still 셋의 경로 (`out/stills/S06-0000.png` · `-0400` · `-0720`)
- 콘티 비트 표에서 **그대로 못 옮긴 줄** 과 어떻게 대신했나 (없으면 "없음")
- 콘티 좌표를 상수로 못 바꿔 숫자를 직접 쓴 자리 (`// 03 S06 비트 …` 주석 줄 수)
- `text.ts` 에 새로 넣은 상수 이름
- `npx remotion still` 이 낸 경고 · 오류 (없으면 "없음")

보고에 "잘 됐다" · "깔끔하다" 같은 판단 문장은 넣지 않는다. 판정은 meta 가 still 을 보고 한다 (00-workflow "만드는 쪽에 판정을 맡기지 않는다").
