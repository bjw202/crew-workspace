# 콘티 — cockpit + prodev 구조 영상

기준: `02-plan.md` **2판** (통과한 기획서, 장면 14 · 순서 · 항목 · 자막 · "README 대응" 그대로) · `01-facts.md` · README 셋 · prodev `00feaa0` · cockpit `ab77880`.
용어는 README 의 것을 쓴다: 봇 · 방 · 작성기(글 쓰는 칸) · 조종석 판 · 봉투(`@TO` · `@CC`) · **겉봉투**(`<channel …>` 덩이) · **편지함**(`bot_inbox`) · 켜기 · 따라잡기 · 들이기 · 카드 · 확정 · **도우미**(`.claude/agents/` 여섯) · 훅 · 인수인계서 · 굳다 · "이어서 합니다". 세션 상태는 화면에 `대기` · `일하는 중` · `승인 대기` 로 적고 코드 이름(`idle` · `working` · `waiting_approval`)은 고정폭으로 곁에 둔다.
장면마다 제목 아래 **README 대응** 한 줄이 있다. 그 장면의 배치는 그 mermaid 그림을 발판으로 삼은 것이다 (02-plan 4절과 같다).
1920×1080 · 30fps · **총 9,990 프레임 (333초)** — 02-plan 의 330초에 장면 14 를 3초 늘린 것 (meta 결정, 부록 B-1). 좌표 · 부품 · props 는 `04-implementation.md` 의 것과 같은 이름을 쓴다.

읽는 법:
- "프레임" 은 **장면 안 상대 프레임**이다 (Sequence 안의 `useCurrentFrame()`). 절대 프레임은 장면 제목 옆에 있다.
- 좌표는 무대 좌표(1920×1080, 왼쪽 위 0,0)다. 카메라가 움직여도 무대 좌표는 안 바뀐다.
- `(경로:줄)` 이 붙은 글자는 코드에서 옮긴 것이다. `(예시)` 가 붙은 글자는 봇 답처럼 매번 달라지는 문장이라 콘티가 정한 본보기다 — 사실을 담지 않는다.
- 색 이름: `human`(브라우저 · 사람) · `server`(서버 · DB) · `cli`(CLI · 봇) · `file`(바닥 파일) · `warn`(경고). 값은 04 의 THEME.
- 부품 이름: 기존 `Node` · `Arrow` · `CodeBlock` · `Caption`, 새 부품 `Stage` · `Pillar` · `Cylinder` · `FolderBox` · `FileCard` · `FolderTree` · `Envelope` · `Mover` · `ChatPane` · `ApprovalCard` · `Timeline` · `ContextBar` · `AnchorLine` · `Spotlight` · `Label`.

---

## 0. 무대 (Stage) — 고정 좌표

모든 장면이 같은 좌표를 쓴다. 강조는 카메라(줌 · 팬)와 `Spotlight`(다른 것 어둡게)로만 한다. 값은 `src/lib/stage.ts` 의 `STAGE` (04 의 2절과 같다).

```
 y=100 ┌────────────┐          ┌──────────────┐          ┌────────────┐
       │  브라우저   │  ──▶     │ cockpit 서버  │  ──▶     │ Claude Code│
       │  (ChatPane)│  ◀╌╌     │  MCP 도구 상자 │  ◀──     │ CLI (봇)   │
       │            │          │ ┌────┐ ┌────┐ │          │            │
 y=600 └────────────┘          │ │chat│ │ckpt│ │          └─────┬──────┘
       x 120~480               └─┴────┴─┴────┴─┘                │ 닻줄(cwd)
                               x 760~1160                 x 1440~1800
 y=680 ═══════════════════════════════════════════════════════╪═══════════  바닥
       ┌ prodev 저장소 ───────────────────────────┐        ┌ projects/수율개선/ ┐
 y=700 │ CLAUDE.md   .claude/skills(15)  ┌bots/──┐ │        │                   │
       │ .claude/agents(6) common/hooks  │봇 폴더 │◀┘        │                   │
 y=900 └─────────────────────────────────┴───────┴─┘        └───────────────────┘
        x 120~1180                                          x 1300~1800
```

| 이름 | 가운데 x · y | width · height | 변 (왼~오 · 위~아래) | 색 |
|---|---|---|---|---|
| `BROWSER` 기둥 | 300 · 350 | 360 · 500 | 120~480 · 100~600 | human |
| `SERVER` 기둥 | 960 · 350 | 400 · 500 | 760~1160 · 100~600 | server |
| `CLI` 기둥 | 1620 · 350 | 360 · 500 | 1440~1800 · 100~600 | cli |
| `CHAT_DB` 원통 (서버 안) | 860 · 520 | 170 · 120 | 775~945 · 460~580 | server |
| `COCKPIT_DB` 원통 (서버 안) | 1060 · 520 | 170 · 120 | 975~1145 · 460~580 | server |
| `MCP_BOX` (서버 안, `src/mcp/tools.js`) | 960 · 300 | 300 · 64 | 810~1110 · 268~332 | server |
| `FLOOR_Y` 바닥 선 | — | y = 680 | x 0~1920 | file |
| `PRODEV` 상자 | 650 · 800 | 1060 · 200 | 120~1180 · 700~900 | file |
| `ROOT_CLAUDE` 카드 `CLAUDE.md` | 250 · 765 | 200 · 44 | | file |
| `ROOT_SKILLS` 카드 `.claude/skills (15)` | 480 · 765 | 240 · 44 | | file |
| `ROOT_AGENTS` 카드 `.claude/agents (6)` | 250 · 835 | 200 · 44 | | file |
| `ROOT_HOOKS` 카드 `common/hooks (3)` | 480 · 835 | 240 · 44 | | file |
| `BOTS_BOX` `bots/` | 1010 · 810 | 300 · 160 | 860~1160 · 730~890 | file |
| `BOT_FOLDER` `prodev-수율개선-bot` | 1010 · 830 | 260 · 100 | 880~1140 · 780~880 | file |
| `PROJECT` 폴더 `projects/수율개선/` | 1550 · 800 | 500 · 200 | 1300~1800 · 700~900 | file |
| `ANCHOR` 닻줄 꺾은선 | (1620,600) → (1620,650) → (1010,650) → (1010,780) | | | cli |
| `CONTEXT_BAR` (장면 11) | 1848 · 350 | 36 · 500 | 1830~1866 · 100~600 | cli |

기둥 안 자리 (기둥마다 같다): 제목 띠 y 100~160 (제목 26px · 부제 mono 18px), 속 y 170~590.
서버 속: y 170~260 이름표 자리(`createRoom` 같은 것), 268~332 `MCP_BOX`, 340~450 이름표 자리(`#kick` 같은 것), 460~580 원통 둘.
CLI 속: y 170~590 `FolderTree` 자리 (실린 것 · 스킬 서랍 · 여덟 절).
브라우저 속 (`ChatPane`): y 100~150 사이드바 줄(`방` · `+` · 방 이름), 150~180 봇 칩, 180~470 글 목록, 470~520 입력칸, 520~600 조종석 판(상태 · 단추 · 문맥 %).

**바닥 확대 배치 (`mode: 'floor'`, 장면 10 · 13 · 14).** 카메라를 바닥으로 내리면 위 무대는 사라지고 아래 배치로 바뀐다 (교차 페이드 30프레임). 이것도 고정이다.

```
 y=32   [브라우저]          [cockpit 서버]          [Claude Code CLI]      ← MINI 띠 (기둥 셋의 축소 칩, 320×56)
 y=180 ┌ prodev 저장소 ───────────────┐   ┌ projects/수율개선/ ─────────────┐
       │ CLAUDE.md                     │   │                                 │
       │ .claude/skills/<이름>/SKILL.md│   │  (장면마다 FolderTree · 층 상자) │
       │ .claude/agents/<이름>.md      │   │                                 │
       │ common/hooks/*.js  scripts/   │   │                                 │
       │        ┌ bots/prodev-수율개선-bot ┐│   │                                 │
       │        │ settings.json ·local ·  ││   │                                 │
 y=900 └────────│ find.log · handoff…     │┘   └─────────────────────────────────┘
        x 60~940 └────────────────────────┘     x 970~1870
```

| 이름 | 가운데 x · y | width · height | 변 |
|---|---|---|---|
| `MINI` 칩 셋 | x 300 · 960 · 1620, y 60 | 320 · 56 | y 32~88 |
| `PRODEV_BIG` | 500 · 540 | 880 · 720 | 60~940 · 180~900 |
| `BIG_ROOT` 나무 왼쪽 위 | (90, 240) | width 560 | 줄 높이 34 (fontSize 20) |
| `BIG_BOT_FOLDER` | 700 · 780 | 420 · 180 | 490~910 · 690~870 |
| `PROJECT_BIG` | 1420 · 540 | 900 · 720 | 970~1870 · 180~900 |
| `BIG_PROJECT_LEFT` 열 (기억의 층 · 찾기 층) | x 1000~1400 | | |
| `BIG_PROJECT_RIGHT` 열 (과제 문서) | x 1440~1840 | | |

카메라 프리셋 (`STAGE.CAMERAS`): `OVERVIEW` {scale 1, cx 960, cy 540} · `SERVER` {scale 1.35, cx 900, cy 420} · `RIGHT` {scale 1, cx 1560, cy 540} (무대가 왼쪽으로 600px 밀린다. 브라우저 기둥은 화면 밖, CLI 기둥이 화면 x 840~1200).
기둥 테두리 색 = 상태: `off` 회색 점선 · `starting` cli 색 40%→100% 깜박(주기 20프레임) · `idle` cli 색 · `working` cli 색 + 빛 번짐(glow) · `waiting` human 색 · 서버 · 브라우저는 `on` 이면 제 색, `off` 면 회색. 상태 글자는 기둥 부제 오른쪽에 **한글 + 고정폭 코드 이름**으로: `꺼짐 stopped` · `켜는 중 starting` · `대기 idle` · `일하는 중 working` · `승인 대기 waiting_approval` (cockpit README 1.1 "세션", 루트 README 7절 상태 이름). 콘티 비트 표의 `status="idle"` 같은 값은 부품 props 이고 화면 글자는 이 짝이다.
겉봉투(`<channel …>` 덩이)는 `Envelope` 부품, 편지함(`bot_inbox`)은 `COCKPIT_DB` 원통의 첫 줄이다. 화면에서 편지함 줄은 `bot_inbox (편지함)` 으로 적는다.
자막(`Caption`)은 화면 아래 `bottom 56`, 장면당 두 문장, 겹치지 않는다. 문장은 02-plan 3절 표의 것 그대로다.

---

## 장면 1 — 세 기둥과 바닥 (12초 · 프레임 0~359 · 상대 0~359)

README 대응: 루트 README 2절 `flowchart LR` 을 세로 기둥 셋으로 세운 것. 가로 사슬 `브라우저 ↔ cockpit 서버 ↔ Claude Code CLI` 가 기둥 셋, 그림의 `HTTP /api/... · SSE /api/stream` 이 두 화살표. 읽는 법 "브라우저와 CLI 사이에는 선이 없다" 가 구도다.

### 한 장 그림
```
 ┌ 브라우저 ─┐   POST /api/*  ┌ cockpit 서버 ─┐             ┌ Claude Code CLI ┐
 │ 방  +     │ ───────────▶  │ node bin/     │   (비어 있음) │ (회색 점선,     │
 │           │ ◀╌╌╌╌╌╌╌╌╌╌╌  │ cockpit.js    │              │  꺼짐)          │
 │           │  SSE /api/stream │ serve       │              │                 │
 └───────────┘               └───────────────┘             └─────────────────┘
 ══════════════════════════════════════════════════════════════════════════
   ┌ prodev 저장소 (흐릿) ┐                        ┌ projects/수율개선/ (흐릿) ┐
```

### 비트
| 프레임 | 무엇이 일어나나 | 부품 · props 요점 | 이동하는 물건 |
|---|---|---|---|
| 0~30 | 빈 배경에 바닥 선이 왼쪽에서 오른쪽으로 그어진다 | `Stage` `floorProgress` 0→1 (interpolate 0~30) | 바닥 선 |
| 20~60 | 왼쪽 기둥이 선다. 안에 빈 `ChatPane` (사이드바 `방` · `+`, 글 없음, 입력칸 안내 글자) | `Pillar` BROWSER `title="브라우저"` `subtitle="web/app.js"` `status="on"` `enterFrame=20` · `ChatPane` `sidebar={rooms:[]}` `input={placeholder:'봇에게 가지 않습니다 — 부르려면 @'}` | 기둥 |
| 60~100 | 가운데 기둥이 선다. 부제에 서버 명령 한 줄 | `Pillar` SERVER `title="cockpit 서버"` `subtitle="node bin/cockpit.js serve"` `status="on"` `enterFrame=60` | 기둥 |
| 100~140 | 오른쪽 기둥이 선다. 꺼진 회색 | `Pillar` CLI `title="Claude Code CLI"` `subtitle="(봇 · 꺼짐)"` `status="off"` `enterFrame=100` | 기둥 |
| 140~200 | 바닥에 prodev 상자와 과제 폴더가 흐릿하게 (opacity 0.35) 자리만 잡는다 | `FolderBox` PRODEV `title="prodev 저장소"` `enterFrame=140` `dim=0.35` · `FolderBox` PROJECT `title="projects/수율개선/"` `enterFrame=160` `dim=0.35` | 상자 둘 |
| 180~230 | 브라우저→서버 화살표 `POST /api/*` | `Arrow` from (488,280) to (752,280) `label="POST /api/*"` `color=human` `startFrame=180` `durationInFrames=40` | 화살표 |
| 230~359 | 서버→브라우저 점선이 **계속 흐른다** (2초마다 다시 그어진다) | `Arrow` from (752,420) to (488,420) `dashed` `label="SSE /api/stream"` `labelOffset={x:0,y:28}` `color=server` `progress=((frame-230) % 60)/60` (frame ≥ 230) | 점선 |
| 230~359 | 가운데→오른쪽은 비어 있다. 왼쪽~오른쪽 기둥 사이 아무것도 없다 | (그리지 않는다) | — |

### 화면 글자
- `node bin/cockpit.js serve` — 서버 기둥 부제 (`cockpit/bin/cockpit.js:231` 의 `serve` 명령, cockpit README 걸음 11)
- `POST /api/*` · `SSE /api/stream` — 화살표 이름표 (`01-facts.md` 0절 · cockpit README 0절 그림)
- `봇에게 가지 않습니다 — 부르려면 @` — 입력칸 안내 (`cockpit/web/glue.js:7` `HINT_NO_BOT`)
- `web/app.js` — 브라우저 부제 (cockpit README 0절 그림)

### 자막
| 문장 | 시작 | 끝 |
|---|---|---|
| 웹 앱 하나가 Claude Code CLI 를 봇으로 켜 둔다. | 30 | 180 |
| 브라우저와 CLI 사이에 선은 없다. | 195 | 350 |

### 카메라 · 조명
`OVERVIEW`. 조명 없음. 바닥 상자 둘만 `dim 0.35`.

---

## 장면 2 — 서버 안의 두 DB 와 SSE (18초 · 프레임 360~899 · 상대 0~539)

README 대응: cockpit README 0절 `flowchart LR` 의 원통 둘 `chat.db 방 · 글 · 첨부` · `cockpit.db 계정 · 큐 bot_inbox · 세션 · 승인` 과 `MCP 도구 cockpit src/mcp/tools.js` 상자를 서버 기둥 속에 그대로 놓는다. 루트 README 0.2 낱말 "편지함 · 사건" 이 원통 줄과 SSE 칩의 이름이다.

### 한 장 그림 (카메라 1.35배, 서버 기둥 가운데)
```
   브라우저 ┐  POST /api/*   ┌──── cockpit 서버 ──────────────┐   ┌ CLI (꺼짐)
   (오른쪽  │ ────────────▶ │  [MCP 도구 cockpit · tools.js] │   │
    변만    │ ◀╌╌╌ SSE ╌╌╌  │  ┌ chat.db ──┐ ┌ cockpit.db ─┐ │   │
    보임)   │  message      │  │ rooms     │ │ bot_inbox   │ │   │
            │               │  │ messages ✎│ │ agent_sess. │ │   │
            │               │  │ message_t.│ │             │ │   │
            ┘               │  └───────────┘ └─────────────┘ │   └
```

### 비트
| 프레임 | 무엇이 일어나나 | 부품 · props 요점 | 이동하는 물건 |
|---|---|---|---|
| 0~40 | 카메라가 서버 기둥으로 들어간다 | `Stage` `camera` OVERVIEW→SERVER (interpolate 0~40, easeInOut) | 카메라 |
| 40~80 | 서버 기둥 속이 밝아진다 (제목 띠 아래가 열린다). `MCP_BOX` 가 보인다 | `Pillar` SERVER `status="on"` · `Label` MCP_BOX 자리 `"MCP 도구 cockpit · src/mcp/tools.js"` `from=50` | — |
| 60~140 | 왼쪽 원통 `chat.db` 가 서고 표 이름 셋이 한 줄씩 붙는다 | `Cylinder` CHAT_DB `name="chat.db"` `rows=[{text:'rooms',from:90},{text:'messages',from:110},{text:'message_targets',from:130}]` `enterFrame=60` | 원통 · 표 줄 셋 |
| 160~220 | 오른쪽 원통 `cockpit.db` 가 서고 표 이름 둘 (첫 줄이 편지함) | `Cylinder` COCKPIT_DB `name="cockpit.db"` `rows=[{text:'bot_inbox (편지함)',from:190},{text:'agent_sessions',from:210}]` `enterFrame=160` | 원통 · 표 줄 둘 |
| 260~300 | 브라우저(화면 왼쪽 가장자리)에서 `POST /api/*` 화살표가 서버에 닿는다 | `Arrow` from (488,280) to (752,280) `label="POST /api/*"` `color=human` `startFrame=260` `durationInFrames=40` | 화살표 |
| 300~330 | chat.db 의 `messages` 줄에 **줄 하나가 실제로 추가된다** (칩이 원통 안으로 떨어진다) | `Cylinder` CHAT_DB `chips=[{row:'messages',text:'#1',from:300}]` (칩은 위에서 12px 떨어지며 나타난다) · `rows[1].highlightFrom=300` `highlightUntil=340` | 줄 칩 |
| 340~380 | SSE 선 위에 사건 `message` 가 실려 왼쪽으로 간다 | `Arrow` from (752,420) to (488,420) `dashed` `label="SSE message"` `labelAt=0.5` `color=server` `startFrame=340` `durationInFrames=40` | 사건 칩 |
| 380~539 | SSE 점선이 계속 흐른다 (2초 주기). 오른쪽 기둥은 여전히 회색 | `Arrow` 같은 좌표 `progress=((frame-380) % 60)/60` | 점선 |

### 화면 글자
- `chat.db` · `rooms` · `messages` · `message_targets` — 원통 이름과 표 (`cockpit/src/db/chat-db.js:21` · `:36` · `:45`)
- `cockpit.db` · `bot_inbox` · `agent_sessions` — (`cockpit/src/db/cockpit-db.js:59` · `:30`)
- `MCP 도구 cockpit · src/mcp/tools.js` — (cockpit README 0절 그림 · `cockpit/src/mcp/tools.js:18`)
- `POST /api/*` · `SSE message` — (`01-facts.md` 0절 · `cockpit/src/session/manager.js:88` `emit('message')`)

### 자막
| 문장 | 시작 | 끝 |
|---|---|---|
| 대화는 chat.db, 봇 편지함과 세션은 cockpit.db 에 적힌다. | 60 | 260 |
| 서버에서 브라우저로는 SSE 한 줄이 계속 흐른다. | 300 | 520 |

### 카메라 · 조명
`SERVER` 프리셋 (0~40 에 들어가 장면 끝까지). 조명: `Spotlight` `rects=[SERVER 기둥]` `opacity=0.45` `from=40` — 브라우저 · CLI · 바닥은 반쯤 어둡다.

---

## 장면 3 — `+` 하나가 폴더 둘을 만든다 (22초 · 프레임 900~1559 · 상대 0~659)

README 대응: 루트 README 3.1 `sequenceDiagram` 의 차례(`+` → `POST /api/rooms` → `createRoom` 검사 → `setup.js` → 과제 폴더 · 봇 폴더 → 성공이면 DB 두 줄 → `201 · SSE room_created`)를 위에서 아래로 그대로. prodev README "돌리는 법" `flowchart LR` 의 `① 먼저` · `② setup 이 성공하면` 번호를 화면 이름표로 그대로 쓴다. cockpit README 걸음 14 · 16 (사이드바 `# prodev-수율개선` · 봇 칩 ⚪).

### 한 장 그림
```
 ┌ 브라우저 ─────┐ POST /api/rooms ┌ cockpit 서버 ─────┐        ┌ CLI (꺼짐) ┐
 │ 방  [+]       │ ─────────────▶ │ createRoom · 이름 검사│        │           │
 │ 새 방(과제)   │ ◀╌ room_created │  chat.db ✎ cockpit.db ✎│        │           │
 │  이름: 수율개선│                └──────┬────────────┘        └───────────┘
 │ # prodev-수율개선 │                    │ node scripts/setup.js --project 수율개선 --cockpit cockpit.json
 │ ⚪ prodev-수율개선-bot │                ▼
 ══════════════════════════════════════════════════════════════════════════
   ┌ prodev 저장소 ─────────────── ┌ bots/ ────────────┐ ┐   ┌ projects/수율개선/ ────┐
   │                               │ prodev-수율개선-bot │ │   │ cards/ wiki/ inbox/ …  │
   │                               │  settings.json ▼   │ │   │ house.md  .git        │
   │                               │  settings.local.json▼│ │   └───────────────────────┘
```

### 비트
| 프레임 | 무엇이 일어나나 | 부품 · props 요점 | 이동하는 물건 |
|---|---|---|---|
| 0~40 | 카메라가 전경으로 돌아온다 | `camera` SERVER→OVERVIEW (0~40) | 카메라 |
| 20~90 | 사이드바 `+` 가 눌리고(밝아짐) 대화 상자에 `수율개선` 이 한 글자씩 찍힌다 | `ChatPane` `sidebar={plusPressAt:20}` `dialog={label:'새 방(과제) 이름',text:'수율개선',from:30,typeUntil:70,until:100}` | — |
| 90~130 | 브라우저→서버 `POST /api/rooms` | `Arrow` (488,280)→(752,280) `label="POST /api/rooms"` `color=human` `startFrame=90` `durationInFrames=40` | 화살표 |
| 130~180 | 서버 안에 `createRoom · 이름 검사` 이름표 | `Label` (960,215) `"createRoom · 이름 검사"` mono 18 `from=130` `until=420` | — |
| 180~240 | 서버 아래로 작은 프로세스 칩이 **바닥으로 내려간다.** 옆에 `① 먼저` | `Mover` from {x:960,y:600,scale:0.6,opacity:0} to {x:650,y:690,scale:1,opacity:1} `startFrame=180` `durationInFrames=60` `holdAfter` · 안에 `Label` mono 16 `"node scripts/setup.js --project 수율개선 --cockpit cockpit.json"` (배경 server 색 20%) · `Label` (960,640) `"① 먼저"` sans 16 server 색 `from=190` `until=420` | setup 칩 |
| 240~340 | 과제 폴더 상자가 밝아지고 안에 하위 폴더 12 · `house.md` · `.git` 이 줄 단위로 생긴다 | `FolderBox` PROJECT `dim=0.35→1` (240~270) · `FolderTree` x 1320 y 735 width 460 fontSize 15 `lines=[{text:'cards/ · wiki/ · inbox/ · journal/ · threads/ · research/',from:260},{text:'patent/ · paper/ · report/ · tmp/ · analysis/ · templates/',from:280},{text:'house.md  (골격 · 상한 50줄)',from:305},{text:'.git  (git init)',from:325}]` | 줄 넷 |
| 300~380 | prodev 상자가 밝아지고 `bots/` 상자와 봇 폴더 카드가 생긴다. 설정 두 장이 setup 칩에서 **떨어져 들어간다** | `FolderBox` PRODEV `dim→1` (300~330) · `FolderBox` BOTS_BOX `title="bots/"` `enterFrame=300` · `FolderBox` BOT_FOLDER `title="prodev-수율개선-bot"` `enterFrame=310` · `Mover` ×2: from {x:650,y:690} to {x:1010,y:820} (330~360) · to {x:1010,y:852} (350~380), 안에 `FileCard` `.claude/settings.json` · `.claude/settings.local.json` (width 240 height 26 fontSize 14) `holdAfter` | 파일 둘 |
| 390~420 | setup 칩 옆에 `exit 0` 이 찍히고 칩이 사라진다 | `Label` (650,725) `"exit 0"` mono 18 cli 색 `from=390` `until=440` · Mover 칩 `opacity` 1→0 (410~440) | — |
| 420~470 | **그제서야** chat.db 에 `bots` 줄과 `rooms` 줄 칩, cockpit.db `agent_sessions` 줄 칩 `stopped`. 옆에 `② setup 이 성공하면` | `Label` (960,440) `"② setup 이 성공하면"` sans 16 server 색 `from=420` `until=520` · `Cylinder` CHAT_DB `rows` 에 `{text:'bots',from:420}` 추가(넷째 줄) · `chips=[{row:'bots',text:'prodev-수율개선-bot',from:430},{row:'rooms',text:'prodev-수율개선',from:445}]` · `Cylinder` COCKPIT_DB `chips=[{row:'agent_sessions',text:'stopped',from:460}]` | 줄 칩 셋 |
| 480~520 | SSE `room_created` 가 왼쪽으로 | `Arrow` (752,420)→(488,420) `dashed` `label="SSE room_created"` `color=server` `startFrame=480` `durationInFrames=40` | 사건 칩 |
| 520~600 | 사이드바에 `# prodev-수율개선`, 봇 칩 `⚪ prodev-수율개선-bot` | `ChatPane` `sidebar.rooms=[{name:'# prodev-수율개선',from:520}]` `chip={name:'prodev-수율개선-bot',online:false,from:540}` | — |
| 0~659 | 오른쪽 기둥은 내내 회색(꺼짐) | `Pillar` CLI `status="off"` | — |

### 화면 글자
- `POST /api/rooms` (`cockpit/src/http/routes-rooms.js:16`) · `createRoom` (`cockpit/src/rooms/create.js`, `01-facts.md` 1절)
- `node scripts/setup.js --project 수율개선 --cockpit cockpit.json` (`01-facts.md` 1절 4 · crew-workspace README 3.1 그림)
- `cards/ · wiki/ · inbox/ · journal/ · threads/ · research/` / `patent/ · paper/ · report/ · tmp/ · analysis/ · templates/` — 하위 폴더 12 (`prodev/scripts/setup.js:205-206` `과제폴더들`)
- `house.md  (골격 · 상한 50줄)` (`setup.js:249`) · `.git  (git init)` (`setup.js:251` `ensureGit`)
- `.claude/settings.json` · `.claude/settings.local.json` (`setup.js:330-331`)
- `exit 0` (`create.js:91` `out.code !== 0` 이면 502)
- `bots` · `rooms` 줄 · `agent_sessions` `stopped` (crew-workspace README 3.1 그림 `S->>DB` 두 줄 · `create.js:99` `openProject` · `:106` `createAgentSession`)
- `SSE room_created` (`create.js:111`)
- `① 먼저` · `② setup 이 성공하면` (prodev README "돌리는 법" 그림의 화살표 글자 그대로)
- `# prodev-수율개선` · `⚪ prodev-수율개선-bot` (cockpit README 걸음 14 · 16 · `cockpit/web/app.js:567` 칩 `⚪`)
- 대화 상자 `새 방(과제) 이름` (cockpit README 걸음 14)

### 자막
| 문장 | 시작 | 끝 |
|---|---|---|
| 방 하나 = 과제 하나 = 봇 하나. | 40 | 300 |
| setup.js 가 먼저 성공해야 DB 에 방이 생기고, 그래도 봇은 아직 꺼져 있다. | 420 | 640 |

### 카메라 · 조명
`OVERVIEW` (0~40 에 돌아옴). 조명 없음. 바닥 상자는 240~330 사이에 `dim 0.35→1`.

---

## 장면 4 — 켜기, `query()` 한 번 (28초 · 프레임 1560~2399 · 상대 0~839)

README 대응: 루트 README 3.2 `sequenceDiagram` 앞 절반(`켜기` → `POST …/session/start` → `agent_sessions` 읽기 → `SDK query · cwd · settingSources · resume` → `init 사건` → `state idle`). 옵션 상자는 접힌 표 "`query()` 에 실제로 들어가는 값" 의 여덟 줄이고, 강조 순서는 2절 "cockpit 은 봇에게 세 가지만 준다"(cwd · 설정 스위치 · 덧붙인 지시문)의 세 층이다. cockpit README 걸음 17 (`켜는 중` → `대기` · 🟢).

### 한 장 그림
```
 ┌ 브라우저 ──┐ POST …/session/start ┌ cockpit 서버 ─────┐              ┌ Claude Code CLI ┐
 │ 조종석 판  │ ──────────────────▶ │ manager.start      │              │ 프로세스 1       │
 │ [켜기]     │ ◀╌ session_state idle│  ╌╌▶ agent_sessions│   ┏━━━━━━━━┓ │ cwd bots/prodev-│
 │ 상태: 대기 │                     │ ┌ buildQueryOptions ┐│   ┃옵션 상자┃▶│   수율개선-bot   │
 │ 🟢 봇     │                     │ │ query({ … cwd …  ││   ┗━━━━━━━━┛ │ ▲ sdk-query.js │
 └────────────┘                     │ └───────────────────┘│   (날아간다)  └──────┬──────────┘
                                    └──────────────────────┘                     ╎ 닻줄 (내려가기 시작)
 ═══════════════════════════════════════════════════════════════════════════════
```

### 비트
| 프레임 | 무엇이 일어나나 | 부품 · props 요점 | 이동하는 물건 |
|---|---|---|---|
| 0~40 | 조종석 판 `켜기` 단추가 눌린다 | `ChatPane` `panel={stateText:'꺼짐',buttons:['켜기'],pressAt:20}` | — |
| 40~80 | 브라우저→서버 | `Arrow` (488,280)→(752,280) `label="POST /api/projects/수율개선/session/start"` `labelSize=15` `color=human` `startFrame=40` `durationInFrames=40` | 화살표 |
| 80~140 | 서버 안 `manager.start`. cockpit.db `agent_sessions` 에서 읽는다 (읽기 = 점선) | `Label` (960,200) `"manager.start"` mono 18 `from=80` · `Arrow` (960,215)→(1060,458) `route="orthogonal"` `bend="vh"` `dashed` `label="bot_dir · session_id"` `labelSize=14` `color=server` `startFrame=95` `durationInFrames=30` · `Cylinder` COCKPIT_DB `rows[1].highlightFrom=125` `highlightUntil=170` | 읽기 점선 |
| 140~420 | 옵션 상자가 서버 안에서 **조립된다**. 한 줄씩 찍힌다 (9줄 · 10프레임마다) | `CodeBlock` x 600 y 130 width 760 `title="src/session/options.js · buildQueryOptions"` `code=OPTIONS` `startFrame=140` `framesPerLine=10` `fontSize=19` `showLineNumbers=false` (`Spotlight` `rects=[상자]` `opacity=0.55` `from=140` `until=420`) | 상자 |
| 250~420 | 옵션 줄이 차례로 강조된다 — 세 층: `cwd`(250~295) → `settingSources`(295~340) → `systemPrompt … append`(340~385), 그리고 `resume`(385~420) | `CodeBlock.highlightLines` 프레임에 따라 `[2]` → `[3]` → `[8]` → `[7]` · 강조 줄 옆 `Label` (1400, 각 줄 y) `"켜지는 폴더"` · `"설정을 읽을 자리 스위치"` · `"덧붙인 지시문"` sans 14 (루트 README 2절의 세 가지) | — |
| 420~520 | 상자가 **오른쪽으로 던져진다.** 작아지며 CLI 기둥 왼쪽 변의 좁은 문 `sdk-query.js` 를 지난다 | `Mover` from {x:600,y:130,scale:1} to {x:1460,y:180,scale:0.4,opacity:0.9} `startFrame=420` `durationInFrames=100` (안에 같은 `CodeBlock`, `startFrame=0`) · `Label` (1440,350) `"sdk-query.js"` mono 15 세로 글자(`writing-mode: vertical-rl`) server 색 배경 `from=440` · `Label` (1440,395) `"SDK import 는 이 파일뿐"` 13px `from=470` `until=560` | 옵션 상자 |
| 470~520 | 문이 빛난다 (상자가 지나는 순간) | `Label` sdk-query.js `glow` 470~520 | — |
| 520~600 | CLI 기둥이 `켜는 중 starting` 으로 깜박이며 켜진다. 부제에 cwd | `Pillar` CLI `status="starting"` (520) `subtitle="cwd bots/prodev-수율개선-bot"` · `ChatPane.panel.stateText='켜는 중'` (560) | — |
| 600~660 | `init` 사건이 왼쪽으로 돌아온다 | `Arrow` (1432,250)→(1168,250) `label="init"` `color=cli` `startFrame=600` `durationInFrames=30` · `Arrow` (752,420)→(488,420) `dashed` `label="SSE session_state idle"` `labelSize=14` `color=server` `startFrame=640` `durationInFrames=30` | 사건 칩 둘 |
| 660~720 | CLI `대기 idle`, 판 `대기`, 봇 칩 🟢 | `Pillar` CLI `status="idle"` (660) · `ChatPane.panel.stateText='대기'` (700) `chip.online=true` (700) | — |
| 720~839 | 닻줄이 CLI 밑에서 **내려가기 시작**하되 바닥에 닿기 전에 끝난다 | `AnchorLine` `points=STAGE.ANCHOR` `progress=interpolate(frame,[720,839],[0,0.35])` `color=cli` | 닻줄 |

### 화면 글자
- `POST /api/projects/수율개선/session/start` (`cockpit/src/http/routes-session.js:36`)
- `manager.start` (`cockpit/src/session/manager.js:95`) · `bot_dir · session_id` (`:96` `projectInfo` → `row.bot_dir` · `row.session_id`, `:103`)
- 옵션 상자 `OPTIONS` (`cockpit/src/session/options.js:11-31`, `02-plan.md` 장면 4 의 줄 그대로):
```
query({ prompt: <입력 흐름>, options: {
  cwd: botDir,
  settingSources: ['project','local'],
  mcpServers: { cockpit },            // reply · fetch_history
  allowedTools: ['mcp__cockpit__reply','mcp__cockpit__fetch_history'],
  permissionMode: 'default', canUseTool,
  persistSession: true, resume: <session_id>,
  systemPrompt: { preset:'claude_code', append: INSTRUCTIONS },
}})
```
- `sdk-query.js` · `SDK import 는 이 파일뿐` (`cockpit/src/session/sdk-query.js:1` · `:4`)
- `cwd bots/prodev-수율개선-bot` (`options.js:13` `cwd: botDir` · `create.js:36` `defaultBotDir`)
- `init` (`manager.js:241`) · `SSE session_state idle` (crew-workspace README 3.2 그림 · `manager.js:442` `emit('state')`)
- `켜기` · `켜는 중` · `대기` · 🟢 (cockpit README 걸음 17 · `web/app.js:567`)

### 자막
| 문장 | 시작 | 끝 |
|---|---|---|
| 서버가 CLI 에 넘기는 것은 query() 옵션 하나뿐이다. | 150 | 430 |
| 어느 폴더에서, 어느 설정만 읽고, 앞 대화에 이어서 켜라. | 460 | 800 |

### 카메라 · 조명
`OVERVIEW`. 140~420 `Spotlight` 옵션 상자만 밝게(opacity 0.55). 420 에 조명이 걷힌다.

---

## 장면 5 — 닻줄, cwd 로 물고 들어간다 (22초 · 프레임 2400~3059 · 상대 0~659)

README 대응: 루트 README 4절 `flowchart TB` 를 그대로 — `CLI -->|cwd| 봇 폴더` 가 닻줄, `한 층 위 prodev/bots` → `한 층 위 prodev 뿌리` 가 올라가는 빛, `CLAUDE.md · skills 15 · agents 6` 이 끌려 올라가는 셋, `settings.json -->|훅 명령은 절대 경로| common/hooks` 가 곁가지 점선. 루트 README 3.2 그림 뒤 절반(`C->>BF` · `C->>R`) 이 같은 것이다.

### 한 장 그림
```
                                                              ┌ Claude Code CLI ──────┐
                                                              │ 실린 것                │
   ┌ prodev 저장소 ──────────────────────────────┐              │ settings.json          │
   │ CLAUDE.md ─────┐ .claude/skills (15) ─┐     │              │  hooks: SessionStart · │
   │ .claude/agents ┼──── 두 층 위 ────────┼──▶  │              │  PreCompact · PreToolUse│
   │ common/hooks ◀╌╌ 절대 경로 ╌╌┐        │     │              │  env: PRODEV_BOT …     │
   │            ┌ bots/ ─┴─ 한 층 위 ─┐    │     │              │ settings.local.json    │
   │            │ prodev-수율개선-bot ┼────┘     │              │  allow 22 · deny 10 …  │
   │            │  .claude/ 설정 두 장 │◀═══ 닻줄 ═══════════════│ CLAUDE.md · skills 15 · agents 6
   └────────────┴──────────────────────┴─────────┘              └────────────────────────┘
                복사 없음 · 링크 없음
```

### 비트
| 프레임 | 무엇이 일어나나 | 부품 · props 요점 | 이동하는 물건 |
|---|---|---|---|
| 0~80 | 닻줄이 바닥의 봇 폴더에 **걸린다.** 봇 폴더가 빛난다 | `AnchorLine` `progress` 0.35→1 (0~80) · `FolderBox` BOT_FOLDER `glowFrom=80` | 닻줄 |
| 80~220 | 설정 두 장이 봇 폴더에서 CLI 속으로 **올라간다.** 도착한 자리에 내용 줄이 펼쳐진다 | `Mover` from {x:1010,y:820} to {x:1620,y:190} (80~120) 안에 `FileCard` `settings.json` · `Mover` from {x:1010,y:852} to {x:1620,y:280} (130~170) 안에 `FileCard` `settings.local.json` · `FolderTree` CLI 속 x 1460 y 175 width 320 fontSize 15 `lines=[{text:'settings.json',from:120},{text:'hooks: SessionStart · PreCompact · PreToolUse',depth:1,from:140},{text:'env: PRODEV_BOT · PRODEV_PROJECT · MINIDISCORD_DB',depth:1,from:160},{text:'settings.local.json',from:170},{text:'allow 22 · deny 10 · additionalDirectories 3',depth:1,from:200}]` | 파일 둘 |
| 220~300 | `hooks` 줄에서 바닥의 `common/hooks` 카드로 **읽기 점선**. 이름표 `절대 경로` | `Arrow` from (1460,225) to (600,835) `route="orthogonal"` `bend="hvh"` `dashed` `label="node …/common/hooks/<이름>.js  (절대 경로)"` `labelSize=14` `labelAt=0.5` `color=cli` `startFrame=220` `durationInFrames=50` · `FileCard` ROOT_HOOKS `lit` 270~300 | 점선 |
| 300~400 | 닻줄이 봇 폴더에서 **한 층 위 `bots/`**, **두 층 위 `prodev/`** 로 올라가는 궤적 (상자 테두리를 따라 빛이 달린다) | `AnchorLine` `climb={points:[(1010,780),(1010,735),(860,735),(860,705),(140,705)],progress:interpolate(frame,[300,400],[0,1])}` · `Label` (1010,715) `"한 층 위 bots/"` mono 15 `from=320` · `Label` (500,690) `"두 층 위 prodev/"` mono 15 `from=360` | 빛 |
| 400~520 | 뿌리의 셋이 CLI 속으로 **끌려 올라간다** | `Mover` ×3 (from ROOT_CLAUDE (250,765) · ROOT_SKILLS (480,765) · ROOT_AGENTS (250,835) → to (1620,400) · (1620,440) · (1620,480)) `startFrame` 400 · 430 · 460, `durationInFrames=40`, 안에 `FileCard` 각각 · `FolderTree` CLI 속 `lines` 추가 `{text:'CLAUDE.md',from:440}` `{text:'.claude/skills (15)',from:470}` `{text:'.claude/agents (도우미 6)',from:500}` | 파일 셋 |
| 520~600 | 화면 구석에 `복사 없음 · 링크 없음`. 봇 폴더 안을 들여다본다: `.claude/` 에 설정 두 장뿐 | `Label` (650,650) `"복사 없음 · 링크 없음"` mono 20 file 색 `from=520` · `Spotlight` `rects=[BOT_FOLDER, CLI]` `opacity=0.5` `from=540` `until=640` · `FolderTree` BOT_FOLDER 속 x 890 y 800 width 240 fontSize 13 `lines=[{text:'.claude/',from:0},{text:'settings.json',depth:1,from:0},{text:'settings.local.json',depth:1,from:0}]` (장면 내내, 540 부터 밝게) | — |
| 600~659 | 조명이 걷히고 닻줄과 실린 것 셋이 남는다 | `Spotlight` fade out | — |

### 화면 글자
- `hooks: SessionStart · PreCompact · PreToolUse` (`prodev/common/settings.template.json:15` · `:19` · `:23`)
- `env: PRODEV_BOT · PRODEV_PROJECT` (`settings.template.json:6-7`. `:8` 의 `MINIDISCORD_DB` 는 이름만 옛것이라 사람 시사에서 뺐다 — 2026-09-15)
- `allow 22 · deny 10 · additionalDirectories 3` (`prodev/common/settings.local.template.json:4-25` 22줄 · `:28-32` 5 + `setup.js:289` 2 + `:295` 3 = 10 · `:34`)
- `node …/common/hooks/<이름>.js  (절대 경로)` (`settings.template.json:17` `node {{HOOKS}}/session-start.js`, `{{HOOKS}}` 는 setup 이 절대 경로로 채운다)
- `한 층 위 bots/` · `두 층 위 prodev/` (crew-workspace README 4절 그림)
- `CLAUDE.md` · `.claude/skills (15)` · `.claude/agents (도우미 6)` (`01-facts.md` 0절 · `prodev/.claude/skills/` 15 폴더 · `prodev/.claude/agents/` 6 파일 · 루트 README 4절 그림 "`.claude/agents` 도우미 6")
- `복사 없음 · 링크 없음` (`01-facts.md` 2절 · crew-workspace README 4절)
- 봇 폴더 속 `.claude/` `settings.json` `settings.local.json` (`setup.js:329-331`)

### 자막
| 문장 | 시작 | 끝 |
|---|---|---|
| 복사도 링크도 없다. | 30 | 300 |
| 봇 폴더가 prodev 안에 있다는 자리 자체가 스킬을 받는 법이다. | 330 | 630 |

### 카메라 · 조명
`OVERVIEW`. 540~640 `Spotlight` 봇 폴더와 CLI 기둥만 밝게(opacity 0.5). 브라우저 · 서버는 내내 제 상태(`on` · `idle`)로 조용하다.

---

## 장면 6 — 글 한 번 왕복 (32초 · 프레임 3060~4019 · 상대 0~959)

README 대응: cockpit README 5절 `sequenceDiagram` 의 차례(작성기 → `POST /api/rooms/:id/messages` → `chat.db messages · message_targets` → `alt` 봉투 없음/있음 → `bot_inbox enqueue` → `pendingInbox` → 겉봉투로 싼 글을 `query()` 입력에 → `reply` → `chat.db 봇 글 한 줄` → `SSE message`)를 시간 순 그대로. 그 아래 겉봉투 예시를 글자 그대로. 5.1 봉투 규칙 표 첫 줄과 셋째 줄(봉투 없음)이 앞 절과 마지막 3초다. cockpit README 0절 읽는 법 "MCP 도구 cockpit 은 서버 프로세스 안에" 가 reply 화살표가 서버 기둥 **안**으로 들어가는 까닭이다.

### 한 장 그림
```
 ┌ 브라우저 ──────────┐  POST /api/rooms/:id/messages ┌ cockpit 서버 ──────────┐  mcp__cockpit__reply ┌ CLI ──────┐
 │ 🟢 prodev-수율개선-bot│ ─────────────────────────▶ │ #kick → pendingInbox    │ ◀────────────────── │ working   │
 │ [김피엘] @TO(…) 안녕하세요│ ◀╌╌ SSE message ╌╌╌     │   → wrapChannel          │   봉투 ═══════════▶ │ input.push│
 │ [BOT] 이어서 합니다 — … │                        │ [MCP 도구] insertBotMessage│                    │           │
 │ 입력: @|TO prodev-수율개선-bot │                   │ chat.db ✎✎  cockpit.db ✎ │                    │           │
 └────────────────────┘                             └──────────────────────────┘                    └───────────┘
              ┌──────────────────────── 겉봉투 (화면 가운데 크게, 320~500) ───────────────────────┐
              │ <channel source="cockpit" chat_id="1" message_id="7" delivery="to" sender="김피엘" …>│
              │ [김피엘] @TO(prodev-수율개선-bot) 안녕하세요                                          │
              │ → delivery="to"로 받은 메시지에는 반드시 reply 도구로 답변하세요.                       │
              │ </channel>                                                                          │
              └────────────────────────────────────────────────────────────────────────────────────┘
```

### 비트
| 프레임 | 무엇이 일어나나 | 부품 · props 요점 | 이동하는 물건 |
|---|---|---|---|
| 0~120 | 작성기에 `@` → 자동완성 한 줄 `TO prodev-수율개선-bot` → 고르면 `@TO(prodev-수율개선-bot) ` → `안녕하세요` 를 붙여 Enter | `ChatPane` `viewer="김피엘"` `input={typeFrom:10,text:'@',autocomplete:{items:['TO prodev-수율개선-bot'],from:20,until:60,pickAt:60},afterPick:'@TO(prodev-수율개선-bot) ',typeMoreFrom:80,typeMoreUntil:110,textFinal:'@TO(prodev-수율개선-bot) 안녕하세요',sendAt:120}` | — |
| 120~160 | 글 한 장이 서버로 간다 | `Arrow` (488,280)→(752,280) `label="POST /api/rooms/:id/messages"` `labelSize=15` `color=human` `startFrame=120` `durationInFrames=40` · `Mover` from {x:300,y:495,scale:0.8} to {x:960,y:215,scale:0.8} (120~160) 안에 `FileCard` `"@TO(prodev-수율개선-bot) 안녕하세요"` human 색 width 300 height 28 fontSize 13 | 글 카드 |
| 160~220 | chat.db 에 `messages` · `message_targets` 한 줄씩, cockpit.db 편지함 `bot_inbox` 에 `enqueue` 한 줄 | `Cylinder` CHAT_DB `chips=[{row:'messages',text:'#7',from:170},{row:'message_targets',text:'#7 → bot · to',from:185}]` · `Cylinder` COCKPIT_DB `chips=[{row:'bot_inbox',text:'enqueue #7',from:200}]` | 줄 칩 셋 |
| 220~260 | SSE `message` 로 왼쪽에 내 글이 뜬다 | `Arrow` (752,420)→(488,420) `dashed` `label="SSE message"` `color=server` `startFrame=220` `durationInFrames=30` · `ChatPane.messages` `[{author:'김피엘',body:'@TO(prodev-수율개선-bot) 안녕하세요',kind:'user',from:250}]` | 사건 칩 |
| 260~320 | 서버 안 이름표가 차례로: `#kick` → `pendingInbox` → `wrapChannel` | `Label` (960,360) `"#kick"` `from=260` · `Label` (960,390) `"pendingInbox"` `from=280` · `Label` (960,420) `"wrapChannel"` `from=300` (mono 16, 각각 `until=520`) | — |
| 320~500 | **겉봉투가 화면 가운데 크게 펼쳐진다.** 네 줄이 위에서 아래로 (다른 것은 어둡다) | `Spotlight` `rects=[]`(전부 어둡게) `opacity=0.7` `from=320` `until=500` · `Envelope` x 460 y 130 width 1000 fontSize 21 `text=ENVELOPE_6` `startFrame=320` `framesPerLine=25` `title="wrapChannel — src/envelope/wrap.js:62-68"` | 봉투 |
| 500~560 | 겉봉투가 작아지며 CLI 기둥의 입력 흐름으로 **밀려 들어간다.** `input.push` · `markDelivered`. 상태 `대기` → `일하는 중` | `Mover` from {x:460,y:130,scale:1} to {x:1470,y:200,scale:0.3,opacity:0.85} (500~550) 안에 같은 `Envelope`(`startFrame=0`) · `Label` (1620,170) `"input.push"` mono 15 `from=520` `until=600` · `Cylinder` COCKPIT_DB `chips[0].text` → `"#7 delivered"` (540) | 봉투 |
| 560~640 | CLI `working`. 오른쪽 기둥에서 `mcp__cockpit__reply` 화살표가 **서버 안 MCP 상자**로 되돌아온다 | `Pillar` CLI `status="working"` (560) · `Arrow` (1432,300)→(1118,300) `label="mcp__cockpit__reply"` `labelSize=15` `color=cli` `startFrame=580` `durationInFrames=40` · `Label` MCP_BOX `glowFrom=620` | 화살표 |
| 640~700 | `insertBotMessage` → chat.db `messages` 에 봇 글 한 줄 → `onBotMessage` → SSE | `Label` (960,240) `"insertBotMessage"` mono 16 `from=640` `until=720` · `Cylinder` CHAT_DB `chips` 추가 `{row:'messages',text:'#8 bot',from:660}` · `Label` (960,215) `"onBotMessage"` `from=670` · `Arrow` (752,420)→(488,420) `dashed` `label="SSE message"` `color=server` `startFrame=680` `durationInFrames=30` | 줄 칩 · 사건 칩 |
| 700~760 | 왼쪽 화면에 `BOT` 표시가 붙은 답이 뜬다. CLI `idle` | `ChatPane.messages` 추가 `{author:'prodev-수율개선-bot',badge:'BOT',body:'이어서 합니다 — prodev-수율개선 방입니다. 붙들고 있는 실은 없습니다.',kind:'bot',from:720}` · `Pillar` CLI `status="idle"` (740) | — |
| 780~959 | 봉투 없이 `B 로트가 낮네요` 를 보낸다. chat.db 까지만 가고 편지함에 줄이 안 생기며 오른쪽 기둥은 미동도 없다. 작성기의 안내 글자가 보인다 | `ChatPane.input` `{typeFrom:790,typeUntil:830,textFinal:'B 로트가 낮네요',sendAt:840}` · `Arrow` POST (840~870) · `Mover` 글 카드 (840~880) · `Cylinder` CHAT_DB `chips` 추가 `{row:'messages',text:'#9',from:890}` (message_targets 없음) · `Arrow` SSE (900~930) · `ChatPane.messages` 추가 `{author:'김피엘',body:'B 로트가 낮네요',kind:'user',from:930}` · `Label` (1060,600) `"편지함 bot_inbox 줄 없음"` mono 15 `from=900` `until=959` · CLI `대기 idle` 그대로 · `ChatPane.input.placeholder='봇에게 가지 않습니다 — 부르려면 @'` (840 부터 보인다) | 글 카드 |

### 화면 글자
- 자동완성 `TO prodev-수율개선-bot` · 고른 뒤 `@TO(prodev-수율개선-bot) ` (`cockpit/web/app.js:708` · `:772` · cockpit README 걸음 18)
- `POST /api/rooms/:id/messages` (`cockpit/src/http/routes-messages.js:22`)
- `messages` · `message_targets` · `bot_inbox` `enqueue` (`manager.js:86-87`) · `#kick` (`:296`) · `pendingInbox` (`:307`) · `wrapChannel` (`:315`) · `markDelivered` (`:321`) · `input.push` (`:323`)
- 봉투 `ENVELOPE_6` (`cockpit/src/envelope/wrap.js:62-68` · `:13` `REPLY_DIRECTIVE` · `01-facts.md` 3절 4 그대로):
```
<channel source="cockpit" chat_id="1" message_id="7" delivery="to" sender="김피엘" author_type="user" room_name="prodev-수율개선">
[김피엘] @TO(prodev-수율개선-bot) 안녕하세요
→ delivery="to"로 받은 메시지에는 반드시 reply 도구로 답변하세요.
</channel>
```
- `mcp__cockpit__reply` (`cockpit/src/mcp/tools.js:19`) · `insertBotMessage` (`:116`) · `onBotMessage` (`:117`)
- `BOT` 표시 (cockpit README 걸음 19)
- 봇 답 `이어서 합니다 — prodev-수율개선 방입니다. 붙들고 있는 실은 없습니다.` (예시. 첫 마디 "이어서 합니다" 는 `prodev/.claude/skills/prodev-orchestrator/SKILL.md:62`)
- `B 로트가 낮네요` (02-plan 장면 6) · `편지함 bot_inbox 줄 없음` (`01-facts.md` 3절 "봉투 없는 글은 bot_inbox 줄도 봇 턴도 없다" · cockpit README 5.1 표 셋째 줄)

### 자막
| 문장 | 시작 | 끝 |
|---|---|---|
| 봉투가 붙은 글만 겉봉투에 싸여 봇에게 간다. | 130 | 480 |
| 봇이 방에 말하는 길은 reply 하나뿐이다. | 560 | 780 |

### 카메라 · 조명
`OVERVIEW`. 320~500 전체 어둡게(`Spotlight opacity 0.7`)하고 겉봉투만 밝다. 500 에 조명이 걷힌다.

---

## 장면 7 — 따라잡기와 승인 카드 (20초 · 프레임 4020~4619 · 상대 0~599)

README 대응: cockpit README 시나리오 2(사람끼리 글 둘 뒤 턴 없음 → 셋째 글 뒤 `fetch_history`)와 시나리오 4(`승인 대기` · `🔒 Bash 요청` · 단추 셋 · `✅ 김피엘 허용` · 10분)를 그대로. cockpit README 4절 `flowchart LR` 의 `승인 카드에 답하기` 네모 — 봇의 `목록 밖 도구를 쓰려 함` 과 admin 의 답이 만나는 자리 — 가 이 장면 뒤 절반의 왕복이다. prodev README "방은 왜 하나인가" 표 셋째 줄("이렇게 이해했습니다").

### 한 장 그림
```
 ┌ 브라우저 ─────────────┐                        ┌ cockpit 서버 ────────┐ mcp__cockpit__fetch_history ┌ CLI ─────────┐
 │ [김과제] 📎 yield.csv   │                        │ [MCP 도구] ╌╌▶ chat.db │ ◀───────────────────────── │ working      │
 │ [김피엘] B 로트가 낮네요 │                        │  { cursor, messages:[…,│ ───────────────────────▶  │              │
 │ [김피엘] @TO(…) 위 파일 봐 주세요 │               │    attachments ] }     │                            │ Bash(curl …) │
 │ [BOT] 이렇게 이해했습니다 — 글 2개 · yield.csv │  │                       │ ◀──── canUseTool ───────── │ waiting_     │
 │ 🔒 Bash 요청 · curl --version │                  │  cockpit.db permission_requests ✎│                 │  approval    │
 │ ┌ 승인 카드 ─────────┐ │ ◀╌ SSE permission_request│                       │ ────── allow ───────────▶ │ working      │
 │ │ Bash  [허용][이번 세션 허용][거부] │ 10분      │                       │                            │              │
 └─┴─────────────────────┴─┘                        └──────────────────────┘                            └──────────────┘
```

### 비트
| 프레임 | 무엇이 일어나나 | 부품 · props 요점 | 이동하는 물건 |
|---|---|---|---|
| 0~30 | 방에 사람끼리 나눈 글 둘이 이미 있다 (첨부 글은 장면 6 과 7 사이에 온 것으로 친다). chat.db 에만 있고 편지함은 비어 있다 | `ChatPane.messages=[{author:'김과제',attach:'yield.csv',body:'어제 라인 3 자료입니다',kind:'user',from:0},{author:'김피엘',body:'B 로트가 낮네요',kind:'user',from:0}]` · `Cylinder` CHAT_DB `chips=[{row:'messages',text:'#10 📎',from:0},{row:'messages',text:'#11',from:0}]` · COCKPIT_DB `chips=[]` | — |
| 30~90 | `@TO(prodev-수율개선-bot) 위 파일 봐 주세요` 를 쳐서 보낸다 | `ChatPane.input` `{typeFrom:30,typeUntil:80,textFinal:'@TO(prodev-수율개선-bot) 위 파일 봐 주세요',sendAt:90}` | — |
| 90~150 | 장면 6 의 길을 **압축해서** 한 번 더: POST → 줄 셋 → 겉봉투 칩 → CLI. CLI `일하는 중 working` | `Arrow` POST (90~115) · CHAT_DB `chips` 추가 `#12` (115) `#12 → bot` (120) · COCKPIT_DB `enqueue #12` (125) · `Mover` from {x:960,y:400,scale:0.3} to {x:1470,y:200,scale:0.3} (125~150) 안에 `Envelope` 짧은 판(머리 한 줄 + 본문 한 줄) · `Pillar` CLI `status="working"` (150) · `ChatPane.messages` 추가 `{author:'김피엘',body:'@TO(prodev-수율개선-bot) 위 파일 봐 주세요',from:140}` | 봉투 칩 |
| 150~210 | 오른쪽 기둥에서 `mcp__cockpit__fetch_history` 가 서버 MCP 상자로. 상자에서 chat.db 로 읽기 점선 | `Arrow` (1432,300)→(1118,300) `label="mcp__cockpit__fetch_history"` `labelSize=14` `color=cli` `startFrame=150` `durationInFrames=40` · `Arrow` (900,332)→(860,458) `dashed` `label="chat_id=1 · since_id"` `labelSize=13` `color=server` `startFrame=190` `durationInFrames=20` | 화살표 |
| 210~330 | 결과 JSON 이 서버 위에 펼쳐지고 CLI 로 돌아간다 | `CodeBlock` x 560 y 120 width 800 `code=HISTORY_7` `fontSize=16` `showLineNumbers=false` `startFrame=210` `framesPerLine=6` `highlightLines=[4]` `title="fetch_history 결과 — src/mcp/tools.js:122-138"` · `Spotlight` `rects=[상자]` `opacity=0.5` 210~300 · `Mover` 상자 → {x:1470,y:220,scale:0.25} (300~330) | 결과 상자 |
| 330~380 | 봇 답 첫 줄이 화면에 뜬다 (reply → SSE 압축) | `Arrow` reply (330~355) · CHAT_DB `chips` 추가 `#13 bot` (360) · `Arrow` SSE (360~380) · `ChatPane.messages` 추가 `{author:'prodev-수율개선-bot',badge:'BOT',body:'이렇게 이해했습니다 — 글 2개 · yield.csv',kind:'bot',from:380}` | — |
| 380~430 | 봇이 `Bash(curl --version)` 을 든다. `canUseTool` 전화선이 가운데로 | `FolderTree` CLI 속 x 1460 y 400 fontSize 15 `lines=[{text:'Bash(curl --version)',from:390,lit:true}]` · `Arrow` (1432,380)→(1168,380) `label="canUseTool"` `color=cli` `startFrame=400` `durationInFrames=30` | 화살표 |
| 430~470 | CLI `승인 대기 waiting_approval`. cockpit.db 에 `permission_requests` 줄. 방에 `🔒` 한 줄. SSE `permission_request` | `Pillar` CLI `status="waiting"` (430) · `Cylinder` COCKPIT_DB `rows` 추가 `{text:'permission_requests',from:435}` `chips` 추가 `{row:'permission_requests',text:'Bash',from:440}` · `ChatPane.messages` 추가 `{kind:'system',body:'🔒 Bash 요청 · curl --version',from:450}` · `Arrow` SSE `label="SSE permission_request"` `labelSize=13` (440~470) | 줄 칩 |
| 470~540 | 조종석 판에 승인 카드. 구석에 `10분` 모래시계. `허용` 을 누른다 | `ApprovalCard` (ChatPane 판 자리 x 130 y 525 width 340) `request={project:'수율개선',tool:'Bash',heading:'Bash',input:'{"command":"curl --version"}'}` `buttons=['허용','이번 세션 허용','거부']` `enterFrame=470` `pressAt=530` `pressed='허용'` · `Label` (300,640) `"⏳ 10분"` mono 16 `from=480` `until=540` | 카드 |
| 540~599 | 답이 서버를 거쳐 CLI 로 되돌아간다. CLI `일하는 중 working`. 방에 `✅` 한 줄 | `Arrow` (488,280)→(752,280) `label="POST /api/permissions/:toolUseId"` `labelSize=13` `color=human` (540~560) · `Arrow` (1168,380)→(1432,380) `label="allow"` `color=server` (560~585) · `Pillar` CLI `status="working"` (590) · `ChatPane.messages` 추가 `{kind:'system',body:'✅ 김피엘 허용 · Bash',from:585}` · `ApprovalCard.leaveFrame=585` · `Cylinder` COCKPIT_DB `chips` `permission_requests` → `"Bash · allow"` (585) | 화살표 둘 |

### 화면 글자
- `이렇게 이해했습니다 — 글 2개 · yield.csv` (02-plan 장면 7 · `prodev/.claude/skills/prodev-orchestrator/SKILL.md:38`)
- `mcp__cockpit__fetch_history` (`tools.js:19`) · `chat_id=1 · since_id` (`tools.js:126` `args.since_id` · `prodev-orchestrator/SKILL.md:36`)
- `HISTORY_7` (칸 이름은 `tools.js:60-64` `filename` · `path`, `:129-135` `id` · `at` · `author` · `body` · `attachments`, `:138` `cursor`. 값은 예시):
```
{ "cursor": 11,
  "messages": [
    { "id": 10, "author": "김과제", "body": "어제 라인 3 자료입니다",
      "attachments": [ { "filename": "yield.csv", "path": "/Users/pl/cockpit-data/uploads/9b1e7c3d-yield.csv" } ] },
    { "id": 11, "author": "김피엘", "body": "B 로트가 낮네요" }
  ] }
```
- `Bash(curl --version)` (cockpit README 시나리오 4) · `canUseTool` (`options.js:19` · `manager.js:279`) · `waiting_approval` (`manager.js:281`)
- `permission_requests` (`cockpit-db.js:47`) · `🔒 Bash 요청 · curl --version` (`cockpit/src/permissions/relay.js:32` `🔒 ${tool} 요청 · ${card.title ?? …}` — `<제목>` 자리는 SDK 가 준 `title`, 여기서는 명령을 그대로 둔 예시)
- 카드 단추 `허용` · `이번 세션 허용` · `거부` (`cockpit/web/card.js:7`) · 카드 칸 `project · tool` 줄과 `input` (`card.js:54` · `:60`)
- `⏳ 10분` (`relay.js:60` `approvalTimeoutMin ?? 10`)
- `POST /api/permissions/:toolUseId` (`cockpit/src/http/routes-permissions.js:16`) · `allow` (`relay.js:129`)
- `✅ 김피엘 허용 · Bash` (`relay.js:36`)

### 자막
| 문장 | 시작 | 끝 |
|---|---|---|
| 봇은 부른 글의 첨부만 바로 받고 나머지는 fetch_history 로 따라잡는다. | 40 | 300 |
| 허용 목록 밖 도구는 admin 의 승인 카드를 기다린다. | 400 | 590 |

### 카메라 · 조명
`OVERVIEW`. 210~300 결과 상자만 밝게(opacity 0.5). 430~590 CLI 테두리가 human 색(`waiting`)이다 — 사람을 기다린다는 뜻.

---

## 장면 8 — 일이 되는 모습, 들이기 한 건 (32초 · 프레임 4620~5579 · 상대 0~959)

README 대응: 루트 README 1절 "이야기 하나로 먼저 본다" 앞 절반(김과제 · `yield.csv` · inbox 잠금 · "E-0001 로 만들겠습니다. 맞으면 '확정'" · 확정 · 방에 알림)의 인물과 번호를 그대로. 차례는 prodev README 워크플로우 ② `sequenceDiagram`(방 → `intake` → `intake-copy.js` → `reply` 표 · 물음 셋 → "확정" → `pre-reply.js` 가 chat.db 에서 확정 조건 → 카드 valid · `index.js` · git → `[카드] …`) 그대로, 번호만 E-0001. 루트 README 5절 "맞물리는 자리 둘"(확정 관문은 chat.db 를 읽는다 · 첨부 경로는 cockpit 이 봉투에 적어 넣는다)이 읽기 점선과 겉봉투 셋째 줄이다.

### 한 장 그림
```
 ┌ 브라우저 ──────────────┐            ┌ cockpit 서버 ───┐                 ┌ CLI ─────────────────┐
 │ [김과제] 📎 yield.csv @TO(…) 어제 라인 3 자료입니다 │            │ chat.db ◀╌ readOnly │                 │ prodev-orchestrator  │
 │ [BOT] 이렇게 읽었습니다 — … 물음 셋 … E-0001 로 만들겠습니다. 맞으면 '확정'… │ │ (확정 글 #13 비춤)  │                 │  → intake            │
 │ [김과제] @TO(…) 확정   │            │                  │                 │ PreToolUse pre-reply.js │
 │ [BOT] [카드] E-0001 · 라인 3 수율 · cards/E-0001.md │ │              │                 └──────────┬───────────┘
 └────────────────────────┘            └──────────────────┘                            yield.csv ▼  intake-copy.js
 ══════════════════════════════════════════════════════════════════════════════════════════════════════
                                                                     ┌ projects/수율개선/ ──────────────┐
                                                                     │ inbox/2026-09-15-라인3/ yield.csv 🔒 0444 · files.md │
                                                                     │ cards/E-0001.md  status: draft → valid │
                                                                     │ index.md · index.json (index.js)   git commit │
```

### 비트
| 프레임 | 무엇이 일어나나 | 부품 · props 요점 | 이동하는 물건 |
|---|---|---|---|
| 0~60 | 과제원이 `yield.csv` 를 붙여 `@TO(prodev-수율개선-bot) 어제 라인 3 자료입니다` 를 보낸다 | `ChatPane` `viewer="김과제"` `messages=[]`(새 화면) `input={text:'@TO(prodev-수율개선-bot) 어제 라인 3 자료입니다',attach:'yield.csv',typeFrom:0,typeUntil:50,sendAt:60}` | — |
| 60~120 | POST → chat.db 두 줄 → `bot_inbox` → SSE 로 글이 뜬다 (장면 6 의 길 압축) | `Arrow` POST (60~90) · CHAT_DB `chips` `#12 📎` (95) `#12 → bot` (100) · COCKPIT_DB `enqueue #12` (105) · `Arrow` SSE (105~120) · `ChatPane.messages` 추가 `{author:'김과제',attach:'yield.csv',body:'@TO(prodev-수율개선-bot) 어제 라인 3 자료입니다',from:115}` | 글 카드 |
| 120~260 | 겉봉투가 가운데 크게. **첨부 경로 줄**이 강조된다 | `Spotlight` 전체 0.7 (120~260) · `Envelope` x 400 y 120 width 1120 fontSize 20 `text=ENVELOPE_8` `startFrame=120` `framesPerLine=22` `highlightLines=[3]`(200 부터) | 봉투 |
| 260~300 | 겉봉투가 CLI 로 밀려 들어간다. CLI `일하는 중 working` | `Mover` 봉투 → {x:1470,y:200,scale:0.28} (260~300) · `Pillar` CLI `status="working"` (300) | 봉투 |
| 300~340 | CLI 속 스킬 서랍: `prodev-orchestrator` → `intake` 가 켜진다 | `FolderTree` CLI 속 x 1460 y 175 fontSize 15 `lines=[{text:'prodev-orchestrator (분기표)',from:300},{text:'→ intake',depth:1,from:325,lit:true}]` | — |
| 340~430 | `intake-copy.js` 가 첨부 경로의 파일을 과제 폴더 `inbox/` 로 **복사한다.** 자물쇠 `0444` 와 `files.md` 가 붙는다 | `Label` (1620,300) `"node ../../scripts/intake-copy.js 라인3 <경로>"` mono 13 `from=340` `until=430` · `Mover` from {x:1620,y:340} to {x:1440,y:790} (360~410) 안에 `FileCard` `yield.csv` file 색 · `FolderTree` PROJECT 속 x 1320 y 735 width 460 fontSize 14 `lines=[{text:'inbox/2026-09-15-라인3/',from:400},{text:'yield.csv  🔒 0444',depth:1,from:410,lock:true},{text:'files.md  (SHA-256)',depth:1,from:420}]` | 파일 |
| 430~520 | 봇 답: "이렇게 읽었습니다" 표 한 줄 · 물음 셋 · `E-0001 로 만들겠습니다. 맞으면 '확정'이라고 답해 주세요.` 바닥에 `cards/E-0001.md` `status: draft` 가 생긴다 | `Arrow` reply (430~455) · CHAT_DB `#13 bot` (460) · `Arrow` SSE (460~475) · `ChatPane.messages` 추가 `{author:'prodev-수율개선-bot',badge:'BOT',body:BOT_8A,from:470}` · `Mover` from {x:1620,y:420} to {x:1450,y:830} (480~510) 안에 `FileCard` `cards/E-0001.md` · `FolderTree` PROJECT `lines` 추가 `{text:'cards/E-0001.md  status: draft',from:510,until:790}` | 파일 |
| 540~640 | 김과제가 `@TO(prodev-수율개선-bot) 확정`. 겉봉투가 CLI 로 (압축). CLI `일하는 중 working` | `ChatPane.input` `{textFinal:'@TO(prodev-수율개선-bot) 확정',typeFrom:540,typeUntil:570,sendAt:580}` · POST (580~600) · chips `#14` `#14 → bot` `enqueue #14` (600~610) · SSE (610~625) · `ChatPane.messages` 추가 `{author:'김과제',body:'@TO(prodev-수율개선-bot) 확정',from:625}` · `Mover` 봉투 칩 → CLI (615~640) · CLI `working` (640) | 봉투 칩 |
| 640~700 | CLI 에서 `reply` 가 나가려는 순간 `PreToolUse · pre-reply.js` 가 선다. 가운데 원통 chat.db 로 **읽기 전용 점선** | `FolderTree` CLI `lines` 추가 `{text:'reply → [카드] E-0001 …',from:645}` `{text:'PreToolUse · pre-reply.js',depth:1,from:660,lit:true}` · `Arrow` (1432,470)→(945,520) `route="orthogonal"` `bend="hv"` `dashed` `label="readOnly: true"` `labelSize=14` `color=cli` `startFrame=670` `durationInFrames=30` | 점선 |
| 700~780 | chat.db 가 비춰지고 확정 글 한 줄이 네 조건을 통과한다. `exit 0` | `Spotlight` `rects=[CHAT_DB, 검사 상자]` 0.55 (700~790) · `CodeBlock` x 560 y 120 width 780 `code=CHECK_8` `fontSize=18` `showLineNumbers=false` `startFrame=700` `framesPerLine=14` `title="pre-reply.js — 확정 조건 (common/hooks/pre-reply.js:64-65)"` · 줄마다 ` ✓` 는 줄이 뜬 뒤 6프레임에 붙는다 (구현: 줄 글자에 ✓ 를 포함하고 `framesPerLine` 로 차례가 보이게) · `Label` (960,440) `"exit 0"` mono 18 cli 색 `from=770` `until=800` | — |
| 780~860 | 바닥에서 `status: draft` 가 `valid` 로 바뀌고, `index.js` 가 `index.md` · `index.json` 을 다시 쓰고, `git commit` 이 찍힌다 | `FolderTree` PROJECT `lines` 추가 `{text:'cards/E-0001.md  status: valid',from:790,lit:true}` `{text:'index.md · index.json  (index.js)',from:815}` · `Label` (1720,880) `"git commit"` mono 14 file 색 `from=840` · `Mover` from {x:1620,y:520} to {x:1550,y:860} (800~830) 안에 `FileCard` `index.js` (쓰기 화살표 대신 물건이 간다) | 파일 |
| 860~959 | 방에 `[카드] E-0001 · 라인 3 수율 · cards/E-0001.md`. CLI `대기 idle` | `Arrow` reply (860~885) · CHAT_DB `#15 bot` (890) · SSE (890~905) · `ChatPane.messages` 추가 `{author:'prodev-수율개선-bot',badge:'BOT',body:'[카드] E-0001 · 라인 3 수율 · cards/E-0001.md',from:900}` · `Pillar` CLI `status="idle"` (930) | — |

### 화면 글자
- `ENVELOPE_8` (`wrap.js:62-68` · 첨부 줄은 `:45` `\n(첨부 파일 경로: …)` · 경로는 절대 경로 `:61`. uuid 와 사용자 폴더 이름은 예시):
```
<channel source="cockpit" chat_id="1" message_id="12" delivery="to" sender="김과제" author_type="user" room_name="prodev-수율개선">
[김과제] @TO(prodev-수율개선-bot) 어제 라인 3 자료입니다
(첨부 파일 경로: /Users/pl/cockpit-data/uploads/9b1e7c3d-yield.csv)
→ delivery="to"로 받은 메시지에는 반드시 reply 도구로 답변하세요.
</channel>
```
- `prodev-orchestrator (분기표)` → `intake` (`prodev/.claude/skills/prodev-orchestrator/SKILL.md:15` 넷째 줄 "실험 자료 첨부 → intake")
- `node ../../scripts/intake-copy.js 라인3 <경로>` (`prodev/scripts/intake-copy.js:4` 사용법 · `prodev-orchestrator/SKILL.md:65` 봇 폴더에서는 `../../scripts/`)
- `inbox/2026-09-15-라인3/` · `yield.csv  🔒 0444` · `files.md  (SHA-256)` (`intake-copy.js:6-9` · crew-workspace README 5절 표)
- `BOT_8A` (첫 줄 머리 "이렇게 읽었습니다" 는 prodev README S2 줄, 나머지 값은 예시. 마지막 줄은 `prodev/.claude/skills/intake/SKILL.md:63` 의 문장에서 번호를 E-0001 로):
```
이렇게 읽었습니다 — 40행 · 열 5 (lot · line · yield_pct · date · note)
물음 셋: ① yield_pct 단위가 % 인가요 ② date 는 측정일인가요 ③ 전수인가요
E-0001 로 만들겠습니다. 맞으면 '확정'이라고 답해 주세요.
```
- `cards/E-0001.md  status: draft` (`intake/SKILL.md:74`) · `status: valid` (`:80`)
- `@TO(prodev-수율개선-bot) 확정` (`intake/SKILL.md:78` · 확정 어휘 `pre-reply.js:64` ③)
- `PreToolUse · pre-reply.js` (`settings.template.json:23-25`) · `readOnly: true` (`pre-reply.js:49`)
- `CHECK_8` (`pre-reply.js:64-65` 주석의 조건 ①~④ 그대로. ⑤ `status: valid` 는 바닥 쪽에 보인다):
```
확정 글 #14 — chat.db 에서 읽는다
① author_type = 'user'  ✓
② 같은 과제의 방 (prodev-수율개선)  ✓
③ 본문이 확정 어휘로 시작 ("확정")  ✓
④ 직전 봇 글에 같은 카드 번호 (E-0001)  ✓
```
- `exit 0` (`pre-reply.js:5` "통과는 exit 0")
- `index.md · index.json  (index.js)` (`prodev/scripts/index.js:2`) · `git commit` (`intake/SKILL.md:84`)
- `[카드] E-0001 · 라인 3 수율 · cards/E-0001.md` (꼴은 `pre-reply.js` 의 `"[카드] E-0001 · <제목> · <경로>"`, 제목은 예시)

### 자막
| 문장 | 시작 | 끝 |
|---|---|---|
| 봇은 "이렇게 읽었습니다" 표를 보이고 셋까지만 묻는다. | 130 | 460 |
| 사람이 "확정" 이라 해야 카드가 확정되고, 그것을 지침이 아니라 훅이 DB 로 확인한다. | 640 | 920 |

### 카메라 · 조명
`OVERVIEW`. 120~260 전체 어둡게 + 겉봉투. 700~790 chat.db 원통과 검사 상자만 밝게.

---

## 장면 9 — 스킬 · 훅 · 도우미, 한 턴의 시계 (28초 · 프레임 5580~6419 · 상대 0~839)

README 대응: 눈금 2 는 prodev README 워크플로우 ① `flowchart TB`(분기표 R1~R9, "위 칸일수록 먼저 본다")를 세로 서랍으로. 눈금 3 은 워크플로우 ④ 의 `BG → WORK → REV(reviewer)` 와 "도우미 여섯" 표(`data-reader` → `reading.md` + 20줄 요약). 눈금 4 는 워크플로우 ⑤ `flowchart TB`(C1 방 → C2 900자·10줄 → C3 `[카드]` → C4 `[발송]` → C5 색인 → 보낸다/막는다). 눈금 1·5 는 루트 README 7절 표의 훅 세 줄. 루트 README 2절 공방 비유(레시피 카드 = 스킬, 수셰프 = 도우미, 검수대 = 훅)가 자막의 뼈대다.

### 한 장 그림 (카메라 `RIGHT`: 무대가 왼쪽으로 600px. 화면 좌표로 적는다)
```
 (서버 기둥, 화면 x 160~560, 반쯤 어둡다)   ┌ 도우미 ─┐  ┌ Claude Code CLI (화면 x 840~1200) ┐   │ 시간축 (화면 x 1300)
 │ hook 사건: hook_started · hook_response │  │data-   │  │ CLAUDE.md: "… 먼저 prodev-orchestrator 스킬로" │   ● 1 SessionStart  session-start.js
 │                                         │  │reader  │  │ 서랍 15: analysis brief charter close find      │   ○ 2 글이 오면  분기표 → 스킬 하나
 │                                         │  │opus    │  │  intake ▣ journal paper patent …               │   ○ 3 긴 일이면  Agent → data-reader
 │                                         │  └────────┘  │ reply → PreToolUse pre-reply.js  exit 2 ↩       │   ○ 4 답하기 직전  PreToolUse
 │                                         │              │ PreCompact pre-compact.js                       │   ○ 5 문맥이 차면  PreCompact
 └─────────────────────────────────────────┘              └──────────┬─────────────────────────────────────┘   ○ 6 훅이 돌 때마다  hook 사건
 ══════════════════════════════════════════════════════════════════╪══════════  (과제 폴더, 화면 x 700~1200)
```

### 비트
| 프레임 | 무엇이 일어나나 | 부품 · props 요점 | 이동하는 물건 |
|---|---|---|---|
| 0~40 | 카메라가 오른쪽으로 판다. 오른쪽 기둥 옆(화면 오른쪽)에 세로 시간축이 선다 | `camera` OVERVIEW→RIGHT (0~40) · `Timeline` (화면 좌표) `x=1300` `yTop=140` `yBottom=680` `ticks=TICKS_9` `enterFrame=30` · `Spotlight` `rects=[CLI, 시간축 영역 (1260,120,640,580)]` `opacity=0.45` `from=40` | 카메라 |
| 60~150 | **눈금 1 켜질 때.** `session-start.js` 가 바닥에서 여덟 절 묶음을 CLI 문맥 맨 앞으로 끌어 올린다 | `Timeline.markerY` → 눈금 1 (60) · `Mover` from 화면 {x:950,y:800} to {x:1020,y:190} (70~130) 안에 `FileCard` `"여덟 절 (session-start.js)"` file 색 · `FolderTree` CLI 속(무대 x 1460 → 화면 860) y 175 fontSize 14 `lines=[{text:'[문맥 맨 앞] 여덟 절',from:130}]` | 묶음 |
| 160~330 | **눈금 2 글이 오면.** 봉투 칩이 들어오고 CLAUDE.md 한 줄이 켜진다. 분기표를 위에서 훑다 `intake` 에서 멈춘다. 서랍 15 가 늘어서고 하나만 열린다 | `Timeline.markerY` → 눈금 2 (160) · `Mover` 봉투 칩 from 화면 {x:600,y:300} to {x:870,y:230} (160~190) · `FolderTree` CLI `lines` 추가 `{text:'CLAUDE.md: "과제 방에서 사람 말(@TO)이 오면 먼저 prodev-orchestrator 스킬로"',from:200}` · 시간축 오른쪽 `FolderTree` 화면 x 1340 y 250 width 540 fontSize 14 `lines=BRANCH_9` (`from` 220 부터 12프레임 간격, 훑는 불빛 `lit` 이 위에서 아래로 내려오다 `intake` 줄에 멈춘다 (300)) · `FolderTree` ×3 (서랍, CLI 속 세 열 x 860 · 970 · 1080, y 300, fontSize 13) `lines=SKILLS_9` `from=260` · `intake` 줄만 `lit` (310) | 봉투 칩 · 불빛 |
| 330~520 | **눈금 3 긴 일이면.** 스킬이 `Agent` 로 도우미를 부른다. 작은 기둥이 CLI 옆에 서고, `reading.md` 만 바닥에 남긴 채 20줄 요약이 본 기둥으로 돌아온다. 도우미 여섯 이름이 스친다 | `Timeline.markerY` → 눈금 3 (330) · `Arrow` 화면 (840,420)→(800,420) `label="Agent"` `labelSize=13` `color=cli` (340~360) · `Pillar` 화면 {x:720,y:420,width:150,height:280} `title="도우미"` `subtitle="data-reader · opus"` `status="working"` `enterFrame=360` · `Mover` from 화면 {x:720,y:520} to {x:950,y:820} (400~440) 안에 `FileCard` `reading.md` · `Arrow` 화면 (800,380)→(840,380) `label="20줄 요약"` `labelSize=13` `color=cli` (440~470) · `Label` 화면 (1600,470) `"data-reader · researcher · reviewer · report-writer · paper-writer · patent-analyst"` 14px `from=470` `until=520` (두 줄로 접는다) · 도우미 기둥 `status="off"` (500) | 파일 · 요약 |
| 520~680 | **눈금 4 답하기 직전.** `pre-reply.js` 가 선다. 보는 차례 다섯. 막히면 `exit 2` 와 이유 한 줄이 봇에게 되돌아가고, 봇이 고쳐 다시 부른다 | `Timeline.markerY` → 눈금 4 (520) · `FolderTree` CLI `lines` 추가 `{text:'reply →  PreToolUse · pre-reply.js',from:530,lit:true}` · 시간축 오른쪽 `FolderTree` 화면 x 1340 y 470 fontSize 14 `lines=CHECKS_9` (`from` 540~600, 15 간격) · `Label` 화면 (1180,500) `"exit 2"` mono 16 **warn 색** `from=610` `until=660` · `Arrow` 화면 (1180,510)→(1000,530) `color=warn` `label="stderr: 이유 한 줄"` `labelSize=13` (615~640) · `Arrow` reply 화면 (840,300)→(560,300) `label="reply (고쳐서 다시)"` `labelSize=13` `color=cli` (655~680) | 되돌아오는 화살표 |
| 680~760 | **눈금 5 문맥이 차면.** `PreCompact · pre-compact.js` 이름만 켜고 넘긴다 | `Timeline.markerY` → 눈금 5 (680) · `FolderTree` CLI `lines` 추가 `{text:'PreCompact · pre-compact.js  (timeout 180)',from:690,lit:true}` | — |
| 760~839 | **눈금 6.** 훅이 돌 때마다 서버 기둥이 `hook` 사건 한 줄을 적는다 | `Timeline.markerY` → 눈금 6 (760) · `FolderTree` 서버 속 화면 x 180 y 180 fontSize 14 `lines=[{text:'hook · hook_started',from:770},{text:'hook · hook_response · exit_code',from:800}]` · `Cylinder` COCKPIT_DB `rows` 에 `{text:'session_events',from:790}` 는 넣지 않는다 (02-plan 장면 2 "표 이름 다섯 넘기지 않는다") | — |

### 화면 글자
- `TICKS_9` (`settings.template.json:15-27` · 02-plan 장면 9 눈금 여섯):
  1. `켜질 때  SessionStart  matcher: startup|resume|clear|compact  → session-start.js`
  2. `글이 오면  CLAUDE.md → prodev-orchestrator 분기표 → 스킬 하나`
  3. `긴 일이면  Agent → data-reader  model: opus`
  4. `답하기 직전  PreToolUse  matcher: mcp__cockpit__reply  → pre-reply.js`
  5. `문맥이 차면  PreCompact  timeout: 180  → pre-compact.js`
  6. `훅이 돌 때마다  서버가 hook 사건 한 줄`
- `CLAUDE.md: "과제 방에서 사람 말(@TO)이 오면 먼저 prodev-orchestrator 스킬로"` (`prodev/CLAUDE.md:19`)
- `BRANCH_9` (분기표 앞 여덟 줄 요약, `prodev-orchestrator/SKILL.md:12-19`): `따라잡기 → fetch_history` · `"앞으로" → 굳는 길` · `첨부 + 시키는 말 → report · paper · patent` · `실험 자료 첨부 → intake` · `시키는 말 → patent · paper · report` · `바깥을 알아봐 → research (먼저 find)` · `분석 → analysis` · `물음 → find`
- `SKILLS_9` 15 이름 (`prodev/.claude/skills/` 폴더 이름): `analysis` `brief` `charter` `close` `find` / `intake` `journal` `paper` `patent` `prodev-orchestrator` / `report` `research` `retro` `review` `schedule`
- `도우미 · data-reader · opus` (`prodev/.claude/agents/data-reader.md:2-5` `name` · `model: opus`) · `reading.md` · `20줄 요약` (`data-reader.md:3` · prodev README 도우미 표)
- 도우미 여섯 이름 (`prodev/.claude/agents/*.md` `name` · prodev README "도우미 여섯" 표): `data-reader · researcher · reviewer · report-writer · paper-writer · patent-analyst`
- `CHECKS_9` (`pre-reply.js:7-12`): `1 chat_id 없음` · `2 분량 — 900자 · 10줄` · `3 [카드] 확정 다섯 조건` · `4 [발송] 결재 = charter 의 PL` · `5 index.json 의 errors > 0`
- `exit 2` · `stderr: 이유 한 줄` (`pre-reply.js:4` · `:19-20` `막는다`)
- `hook · hook_started` · `hook · hook_response · exit_code` (`manager.js:393-395`)

### 자막
| 문장 | 시작 | 끝 |
|---|---|---|
| 스킬은 말이 올 때 골라지고, 도우미는 스킬이 부르며, 훅은 정해진 순간에 반드시 돈다. | 60 | 420 |
| 막힌 답은 이유 한 줄과 함께 되돌아온다. | 530 | 800 |

### 카메라 · 조명
`RIGHT` (0~40 에 판). 브라우저 기둥은 화면 밖. 서버 기둥은 40 부터 반쯤 어둡다(`Spotlight` 0.45), 눈금 6 (760~) 에서만 서버 기둥이 밝아진다 (`rects` 에 서버 추가). `exit 2` 와 그 화살표만 warn 색.

---

## 장면 10 — 바닥, 지식이 쌓이고 찾힌다 (28초 · 프레임 6420~7259 · 상대 0~839)

README 대응: 왼쪽 열은 prodev README "기억의 다섯 층" `flowchart TB`(0층 원본 → 1층 카드 → 2층 위키 → 색인)를 아래에서 위로 쌓은 것. 오른쪽 아래 층 여섯은 워크플로우 ③ `flowchart TB`(① 색인 → … → ⑥ 대화 → 출처를 붙여 답한다). "기억의 층과 찾기의 층은 다른 것이다" 절이 둘을 한 화면에 나란히 두는 까닭이다. 물음은 루트 README 1절 이야기의 "B 로트 수율 어디 있었지?" 그대로. `find.log` 가 봇 폴더에 있는 것은 루트 README 5절 표.

### 한 장 그림 (`mode: 'floor'`)
```
 [브라우저 ▸ @TO(…) B 로트 수율 어디 있었지?]   [cockpit 서버]   [Claude Code CLI · find]      ← MINI 띠
 ┌ prodev 저장소 (반쯤 어둡다) ───────┐  ┌ projects/수율개선/ ────────────────────────────────┐
 │                                    │  │ 기억의 층 (아래서 위로)      과제 문서                │
 │                                    │  │ ┌ index.md · index.json ┐    charter.md            │
 │                                    │  │ ┌ wiki/수율.md ─────────┐    schedule.md           │
 │  ┌ bots/prodev-수율개선-bot ─────┐  │  │ ┌ cards/E-0001.md ──────┐    journal/2026-09-14.md │
 │  │ find.log ◀── 한 줄            │  │  │ ┌ inbox/…/ yield.csv 🔒 │    house.md              │
 │  │ 2026-…Z  2  카드 본문  1  cards/E-0001.md  B 로트 수율 │  │ find.js 층 여섯 (불빛 ↓)  ① index.json ② cards ▣ ③ wiki ④ charter·schedule ⑤ files.md ⑥ 대화 │
 └──┴───────────────────────────────┴──┘  └──────────────────────────────────────────────────┘
```

### 비트
| 프레임 | 무엇이 일어나나 | 부품 · props 요점 | 이동하는 물건 |
|---|---|---|---|
| 0~40 | 카메라가 바닥으로 내려간다: 전경이 과제 폴더 쪽으로 2.2배 커지며 바닥 배치로 교차 페이드 | `Stage` `mode` overview→floor: 0~30 `camera` {scale 1→2.2, cx 1550, cy 800} + opacity 1→0, 10~40 floor 배치 opacity 0→1 · `Spotlight` `rects=[PROJECT_BIG]` `opacity=0.5` (PRODEV_BIG 반쯤 어둡다) | 카메라 |
| 60~250 | 왼쪽 열에 층 넷이 **아래에서 위로** 쌓인다 (각 층이 아래서 솟아오른다) | `Mover` ×4 (from y+60 · opacity 0 → to 제자리, 각 40프레임): `FileCard` 큰 판 (width 380 height 88, 두 줄) x 1200 y 800 `"inbox/2026-09-15-라인3/"` / `"yield.csv 🔒 · files.md"` (60) · y 690 `"cards/E-0001.md"` / `"실험 한 건 = 카드 한 장"` (110) · y 580 `"wiki/수율.md"` / `"문장마다 카드 번호"` (160) · y 470 `"index.md · index.json"` / `"index.js 가 만든다"` (210) | 층 넷 |
| 260~340 | 오른쪽 열에 과제 문서와 기록 넷 | `FolderTree` x 1440 y 200 width 400 fontSize 18 `lines=[{text:'charter.md',from:260},{text:'schedule.md',from:280},{text:'journal/2026-09-14.md',from:300},{text:'house.md',from:320}]` | — |
| 360~420 | MINI 띠에 PL 의 물음이 들어오고 CLI 칩에 `find` 가 켜진다 | `Label` 화면 (300,60) 안 `"@TO(prodev-수율개선-bot) B 로트 수율 어디 있었지?"` mono 14 `from=360` · `Mover` 물음 칩 (300,60)→(960,60)→(1620,60) (380~410) · MINI CLI 칩 부제 `"find"` `lit` (410) | 물음 칩 |
| 420~460 | 봇이 답을 알든 모르든 `find.js` 를 돌린다 | `Label` (1420,400) `"node ../../scripts/find.js B 로트 수율"` mono 18 cli 색 `from=420` | — |
| 460~700 | 층 여섯이 세로로 서고 **탐색 불빛이 위에서 아래로** 내려오다 ② 카드에서 멈춘다 | `FolderTree` x 1440 y 440 width 400 fontSize 17 `lines=LAYERS_10` (`from` 460~510, 10 간격) · 불빛(`lit` 1) ① (520~560) → ② (560~) 멈추고 ✓ 표시 `"→ cards/E-0001.md:14"` (600) · ③~⑥ 는 `dim` 0.4 (600 부터) | 불빛 |
| 700~760 | 봇 답에 출처가 붙는다 (MINI 띠) | `Label` 화면 (1620,60) `"B 로트 수율 … (cards/E-0001.md)"` mono 14 `from=700` → `Mover` (1620,60)→(300,60) (720~750) | 답 칩 |
| 760~839 | 봇 폴더의 `find.log` 에 **한 줄이 추가된다** (② 층 줄에서 봇 폴더로 날아간다) | `FileCard` BIG_BOT_FOLDER 속 x 520 y 720 `"find.log"` `enterFrame=760` · `Mover` from {x:1440,y:560} to {x:700,y:800} (770~810) 안에 `Label` mono 12 `FINDLOG_10` · `FolderTree` BIG_BOT_FOLDER x 500 y 780 width 400 fontSize 12 `lines=[{text:FINDLOG_10,from:810}]` · `Spotlight` `rects=[PROJECT_BIG, BIG_BOT_FOLDER]` (760~) | 기록 한 줄 |

### 화면 글자
- 층 넷 (prodev README "기억의 다섯 층" 그림 · crew-workspace README 5절 표): `inbox/2026-09-15-라인3/` `yield.csv 🔒 · files.md` · `cards/E-0001.md` `실험 한 건 = 카드 한 장` · `wiki/수율.md` `문장마다 카드 번호` · `index.md · index.json` `index.js 가 만든다` (`prodev/scripts/index.js:2`)
- `charter.md` · `schedule.md` · `journal/2026-09-14.md` · `house.md` (`01-facts.md` 5절 · `session-start.js:99-136`)
- `@TO(prodev-수율개선-bot) B 로트 수율 어디 있었지?` (02-plan 장면 10)
- `node ../../scripts/find.js B 로트 수율` (`prodev/scripts/find.js:4` 사용법 · `prodev-orchestrator/SKILL.md:65`) · "답이 떠올라도 먼저 돌린다" 는 `prodev/.claude/skills/find/SKILL.md:24`
- `LAYERS_10` (`find.js:7-12` 그대로): `① index.json 의 title · aliases · tags` · `② cards/*.md 본문` · `③ wiki/*.md` · `④ charter.md 절 · schedule.md 표 행` · `⑤ inbox/*/files.md` · `⑥ chat.js search (대화)`
- `→ cards/E-0001.md:14` (`find.js:8` "카드 경로 + 행". 행 번호는 예시)
- `B 로트 수율 … (cards/E-0001.md)` (예시. 출처 붙이는 규칙은 `find/SKILL.md:25`)
- `FINDLOG_10` (`find.js:281` 의 칸 순서: 때 · 층 번호 · 층 이름(`:287-294` `LAYER_NAME[2]='카드 본문'`) · 건수 · 첫 경로 · 물음. 탭은 화면에서 넓은 빈칸으로): `2026-09-15T09:12:00.000Z    2    카드 본문    1    cards/E-0001.md    B 로트 수율`
- `find.log` 가 봇 폴더에 있다 (`find.js:275`)

### 자막
| 문장 | 시작 | 끝 |
|---|---|---|
| 봇의 기억은 대화가 아니라 과제 폴더의 파일이다. | 60 | 400 |
| 물으면 답이 떠올라도 find.js 를 먼저 돌려 출처를 붙인다. | 430 | 800 |

### 카메라 · 조명
0~40 줌 + 교차 페이드로 `floor` 배치. PRODEV_BIG 은 760 까지 반쯤 어둡고, 760 부터 봇 폴더만 밝아진다.

---

## 장면 11 — 압축, 문맥은 캐시 · 파일이 진실 (28초 · 프레임 7260~8099 · 상대 0~839)

README 대응: prodev README 워크플로우 ⑥ `stateDiagram-v2` 의 압축 고리(`WORK → COMPACT` · `COMPACT → LOAD: pre-compact.js 가 handoff-compact.md 를 쓰고 · 압축 뒤 session-start.js 가 다시 싣는다` · `첫 답은 "이어서 합니다"`)와 그 아래 "여덟 절" 목록을 번호 순으로. "비서의 하루" 그림의 점선(`pre-compact.js → handoff-compact.md 인수인계서`). 루트 README 7절 표의 `훅 pre-compact`(여섯 칸) · `훅 session-start`(여덟 절) · `압축 알림`(서버가 올린다). cockpit README 시나리오 5(두 줄 알림 · 문맥 퍼센트).

### 한 장 그림
```
 ┌ 브라우저 ──────┐ POST …/session/compact ┌ cockpit 서버 ─────┐              ┌ CLI ────────────┐▐▌ 문맥 막대
 │ 문맥 92% [압축]│ ─────────────────────▶ │ compact → /compact ═══════════▶ │ PreCompact       │▐▌ 92% → 12%
 │ 문맥을 정리 중입니다. 곧 이어서 합니다. │ ◀╌╌ SSE           │  ┌claude -p ──┐│ pre-compact.js   │▐▌
 │ 정리가 끝났습니다. 이어서 하려면 …      │                    │  │--model sonnet│◀── 마지막 40턴  │▐▌
 │ [김피엘] @TO(…) 어디까지 했지?         │                    │  └──────┬──────┘│ ──▶ 요약        │▐▌
 │ [BOT] 이어서 합니다 — …               │                    │         ▼       │ SessionStart(compact) │
 └────────────────┘                     └───────────────────┘  handoff-compact.md ▼  [깨어남: compact] …  ▲ 여덟 절
 ═══════════════════════════════════════════════════════════════════════════════════════════════════
   ┌ prodev ── bots/prodev-수율개선-bot ┐  ┌ projects/수율개선/ ────────────────┐
   │  handoff-compact.md (여섯 칸) ────┼──┼─▶ 1 handoff 2 charter 3 schedule 4 threads 5 일지 6 index 7 날짜 8 house.md ─▶ CLI
```

### 비트
| 프레임 | 무엇이 일어나나 | 부품 · props 요점 | 이동하는 물건 |
|---|---|---|---|
| 0~40 | 바닥에서 전경으로 돌아온다 | `Stage` `mode` floor→overview (교차 페이드 0~40) | 카메라 |
| 0~120 | CLI 옆 문맥 막대가 차오른다. 조종석 판 `문맥` 칸도 함께. admin 이 `압축` 을 누른다 | `ContextBar` CONTEXT_BAR `pct=interpolate(frame,[0,110],[0.55,0.92])` `label="문맥 92%"` · `ChatPane.panel={stateText:'대기',contextPct:(같은 값),buttons:['압축'],pressAt:110}` | 막대 |
| 120~170 | 브라우저→서버. 서버 안 `compact` 가 `/compact` 를 걸어 둔다 | `Arrow` POST `label="POST /api/projects/수율개선/session/compact"` `labelSize=14` (120~150) · `Label` (960,200) `"compact → pendingCompact"` mono 15 `from=140` `until=260` | 화살표 |
| 170~200 | `/compact` 가 입력 흐름에 밀려 들어간다 | `Mover` from {x:960,y:400,scale:0.6} to {x:1470,y:200,scale:0.6} (170~200) 안에 `FileCard` `"/compact"` server 색 · `Label` (960,400) `"input.push('/compact')"` mono 14 `from=170` `until=220` | 칩 |
| 200~260 | CLI 에 `PreCompact · pre-compact.js` 가 선다. 기록 파일 꼬리 40턴을 자른다 (tool_result 300자 · thinking 제외) | `FolderTree` CLI 속 x 1460 y 175 fontSize 15 `lines=[{text:'PreCompact · pre-compact.js',from:200,lit:true},{text:'기록 꼬리 40턴 (tool_result 300자 · thinking 제외)',depth:1,from:230}]` | — |
| 260~360 | 빈 폴더에서 `claude -p --model sonnet` 이 돈다. 40턴이 가고 요약이 돌아온다 | `FolderBox` {x:1300,y:300,width:240,height:90} `title="claude -p --model sonnet"` `subtitle="빈 폴더 · 180초"` server 색 `enterFrame=260` · 화살표 대신 물건이 오간다: `Mover` from {x:1620,y:250} to {x:1300,y:300} (270~310) 안에 `FileCard` `"마지막 40턴"` · `Mover` from {x:1300,y:300} to {x:1620,y:250} (310~350) 안에 `FileCard` `"요약 (여섯 칸)"` · 상자 `opacity` 1→0 (360~370) | 40턴 · 요약 |
| 360~440 | 인수인계서 `handoff-compact.md` 가 봇 폴더에 **떨어진다.** 여섯 칸 제목이 보인다 | `Mover` from {x:1620,y:250} to {x:1010,y:840} (360~410) 안에 `FileCard` `handoff-compact.md` · `Spotlight` `rects=[BOT_FOLDER, 상자]` 0.55 (400~520) · `CodeBlock` x 560 y 120 width 700 `code=HANDOFF_11` `fontSize=18` `showLineNumbers=false` `startFrame=400` `framesPerLine=9` `title="bots/prodev-수율개선-bot/handoff-compact.md"` | 파일 |
| 430~470 | 방에 `문맥을 정리 중입니다. 곧 이어서 합니다.` (서버가 올린다) | `Label` (960,240) `"status: compacting"` mono 14 `from=430` `until=500` · `Arrow` SSE (440~460) · `ChatPane.messages` 추가 `{kind:'system',body:'문맥을 정리 중입니다. 곧 이어서 합니다.',from:460}` | 사건 칩 |
| 500~560 | 오른쪽 기둥의 막대가 **비워진다.** CLI 속 줄들이 흐려진다. 서버에 `compact_boundary` | `ContextBar.pct` 0.92→0.12 (500~550) · `FolderTree` CLI `opacity` 1→0.15 (500~540) · `Label` (960,240) `"compact_boundary"` `from=540` `until=600` | 막대 |
| 560~700 | `SessionStart (compact)` 훅이 다시 서고, 바닥에서 여덟 절이 **번호 순으로** 끌려 올라온다 | `FolderTree` CLI `lines` 새로 `[{text:'SessionStart (compact) · session-start.js',from:560,lit:true}]` · `Mover` ×8 (각 30프레임, 시작 570 · 585 · 600 · 615 · 630 · 645 · 660 · 675): from BOT_FOLDER (1010,840) [1] · PROJECT (1550,800) [2~8] → to CLI (1620, 230 + 22·n) 안에 `FileCard` 각 이름 (4 는 `threads/<실>.md`) · `FolderTree` CLI `lines` 추가 `SECTIONS_11` (`from` 도착 프레임, fontSize 13) | 절 여덟 |
| 700~760 | 문맥 맨 앞에 깨어남 첫 줄. 방에 `정리가 끝났습니다. 이어서 하려면 말을 걸어 주세요.` | `Label` (1620,180) `WAKE_11` 13px sans, maxWidth 320 (두 줄) `from=700` · `Arrow` SSE (720~740) · `ChatPane.messages` 추가 `{kind:'system',body:'정리가 끝났습니다. 이어서 하려면 말을 걸어 주세요.',from:740}` | — |
| 770~839 | 사람이 말을 걸면 봇 첫 줄이 `이어서 합니다 — …` | `ChatPane.input` `{textFinal:'@TO(prodev-수율개선-bot) 어디까지 했지?',typeFrom:770,typeUntil:790,sendAt:795}` · 왕복 압축 (795~830) · `ChatPane.messages` 추가 `{author:'prodev-수율개선-bot',badge:'BOT',body:'이어서 합니다 — E-0001 확정까지 마쳤습니다. 다음 한 걸음은 wiki/수율.md 갱신입니다.',from:830}` | 봉투 칩 |

### 화면 글자
- `문맥 92%` (cockpit README 1.2 "문맥 … 퍼센트" · `manager.js:425` `percentage`. 값은 예시) · `압축` 단추 (cockpit README 시나리오 5)
- `POST /api/projects/수율개선/session/compact` (`routes-session.js:56`) · `compact → pendingCompact` (`manager.js:164-167`) · `input.push('/compact')` (`:301`)
- `PreCompact · pre-compact.js` (`settings.template.json:19-21`) · `기록 꼬리 40턴 (tool_result 300자 · thinking 제외)` (`pre-compact.js:24-25` · `:41`)
- `claude -p --model sonnet` · `빈 폴더 · 180초` (`pre-compact.js:106-108` `execFileSync('claude', ['-p','--model','sonnet'], {cwd: 빈곳, timeout: 180000})`)
- `HANDOFF_11` (`pre-compact.js:144` 머리 · `:26` 여섯 칸. 날짜는 예시):
```
# 인수인계서 (압축 직전 2026-09-15 09:40)
## 하던 일
## 방과 마지막 message_id
## 사람이 기다리는 것
## 미해결 질문
## 다음 한 걸음
## 열어 둔 파일
```
- `문맥을 정리 중입니다. 곧 이어서 합니다.` · `정리가 끝났습니다. 이어서 하려면 말을 걸어 주세요.` (`manager.js:19-20` · 올리는 자리 `:385` · `:389`) · `status: compacting` (`:385`) · `compact_boundary` (`:387`)
- `SessionStart (compact) · session-start.js` (`settings.template.json:16` matcher 에 `compact`)
- `SECTIONS_11` (`session-start.js:95-138` 절 제목 그대로): `1 ## 인수인계서 (handoff-compact.md)` · `2 ## 헌장 (charter.md)` · `3 ## 일정 (schedule.md)` · `4 ## threads/<실>.md (열린 실마다 하나)` — `session-start.js:112` 는 열린 실 파일마다 `threads/<파일>` 절을 하나씩 만든다. 실이 없을 때만 `## 열린 실 (threads/)` 한 줄(`:109`)이다. 화면은 실이 하나 있는 것으로 그린다 · `5 ## 어제 일지 (journal/2026-09-14.md)` · `6 ## 색인 머리 (index.md)` · `7 ## 마지막 일지` · `8 ## 이 과제의 규칙 (house.md)`
- `WAKE_11` (`session-start.js:85`, 이름 뒤에 빈칸 없이 `다`): `[깨어남: compact] 나는 prodev-수율개선-bot다. 앞 문맥과 요약은 캐시다 — 아래 파일이 진실이다.`
- 봇 답 `이어서 합니다 — …` (예시. 첫 마디는 `prodev-orchestrator/SKILL.md:62`)

### 자막
| 문장 | 시작 | 끝 |
|---|---|---|
| 압축 직전에 인수인계서를 파일로 떨구고, 압축 뒤에 훅이 파일에서 다시 싣는다. | 200 | 520 |
| 첫 마디는 "이어서 합니다". | 560 | 830 |

### 카메라 · 조명
`OVERVIEW` (0~40 에 돌아옴). 400~520 봇 폴더와 인수인계서 상자만 밝게. "훅이 파일을 쓴다"(360~440, 위→아래) 와 "훅이 파일을 읽는다"(570~700, 아래→위) 두 이동이 바닥을 사이에 두고 마주 본다.

---

## 장면 12 — 껐다 켜도, 이어 붙기(resume) (16초 · 프레임 8100~8579 · 상대 0~479)

README 대응: `cockpit/docs/ARCHITECTURE_EXPLANATION.md` 9절 그림 5(`release()` → `bootResume()` → `query() resume abc…` 둘째 프로세스 → `SessionStart (resume)` → 밀린 글 묶음)를 시간 순으로. cockpit README 걸음 20 의 출력 문구 두 줄과 `resume 수율개선 → …`. prodev README 워크플로우 ⑥ `LOAD → CATCH: 꺼진 사이 쌓인 @TO · @CC 글을 조종석이 넣어 준다` 가 편지함에서 겉봉투 묶음으로 가는 마지막 비트다. 루트 README 0.2 낱말 "resume" 이 제목의 "이어 붙기".

### 한 장 그림
```
 ┌ 서버 창 (CodeBlock) ───────────────────────────┐
 │ ^C                                            │
 │ 끄는 중 — 세션 상태는 그대로 두고 다음 기동에 resume 한다 │
 │ node bin/cockpit.js serve --config cockpit.json │
 │ cockpit 듣는 중 http://127.0.0.1:3000          │
 │ resume 수율개선 → idle                         │
 └───────────────────────────────────────────────┘
 ┌ 브라우저 ─┐        ┌ cockpit 서버 (꺼짐→켜짐) ─────┐  bootResume       ┌ CLI (꺼짐 → 새 프로세스) ┐
 │ @TO(…) 둘 │ ─────▶ │ cockpit.db agent_sessions      │  resume: abc… ══▶ │ session_id abc… (같다)   │
 │           │        │   session_id = abc… · idle 남음 │                   │ SessionStart (resume)    │
 │           │        │ 편지함 bot_inbox 미배달 2 ────────────── pendingInbox ══▶ 겉봉투 묶음           │
 └───────────┘        └────────────────────────────────┘                   └──────────────────────────┘
 ═══════════════════════════════════════ 바닥의 파일은 전부 그대로 ═══════════════════════════════════
```

### 비트
| 프레임 | 무엇이 일어나나 | 부품 · props 요점 | 이동하는 물건 |
|---|---|---|---|
| 0~60 | 서버 창에 `Ctrl-C`. 서버가 `release` 로 오른쪽 기둥을 놓는다. CLI 가 꺼진다 | 서버 창은 `CodeBlock` 이 아니라 `FolderTree` 로 그린다 (줄마다 다른 프레임에 뜨므로): `FolderBox` {x:960,y:200,width:800,height:170} `title="서버 창"` server 색 `enterFrame=0` 안에 `FolderTree` x 580 y 140 width 760 fontSize 18 `lines=TERM_12` (`from` 줄마다: 1 `^C` 10 · 2 `끄는 중 …` 25 · 3 `node bin/cockpit.js serve …` 130 · 4 `cockpit 듣는 중 …` 160 · 5 `resume 수율개선 → idle` 300) · 상자는 340 에 사라진다 · `Label` (960,200) `"release"` mono 16 `from=40` `until=100` · `Pillar` CLI `status="off"` (60) · `AnchorLine.progress` 1→0 (60~90, 프로세스가 없으면 cwd 도 없다) | — |
| 60~130 | 서버 기둥도 꺼진다(회색). 그러나 원통은 남고 `agent_sessions.session_id` 와 상태가 그대로 있다. 바닥 파일 전부 그대로 | `Pillar` SERVER `status="off"` (90) · `Cylinder` 둘 `dim=1`(밝게 유지) · `Label` (1060,600) `"session_id = abc… · state idle (남음)"` mono 13 `from=100` · 바닥 `FolderBox` 둘 `glowFrom=100` 잠깐(100~130) | — |
| 130~170 | 서버 창에 `serve` 를 다시 친다. `cockpit 듣는 중` | 서버 창 `FolderTree`(TERM_12) 줄 3 `from=130` · 줄 4 `from=160` · `Pillar` SERVER `status="on"` (160) | — |
| 170~300 | `bootResume` 이 `stopped` 가 아닌 줄을 찾아 `resume: abc…` 를 옵션에 넣고 새 프로세스를 띄운다(`켜는 중 starting`). **그 사이** 사람이 보낸 `@TO` 글 둘은 편지함 `bot_inbox` 에 미배달로 쌓인다 (`starting` 은 배달 상태가 아니다) | `Label` (960,200) `"bootResume"` mono 16 `from=170` · `Arrow` (960,215)→(1060,458) `dashed` `bend="vh"` `label="stopped 가 아닌 줄"` `labelSize=13` `color=server` (180~200) · `Mover` from {x:960,y:300,scale:0.7} to {x:1470,y:200,scale:0.7} (210~250) 안에 `FileCard` `"resume: abc…"` server 색 · `Pillar` CLI `status="starting"` (250) `subtitle="프로세스 2 · session_id abc…"` · `ChatPane.messages` `[{author:'김과제',body:'@TO(prodev-수율개선-bot) 라인 4 자료도 있어요',from:180},{author:'김과제',body:'@TO(prodev-수율개선-bot) 내일 회의 전에 봐 주세요',from:225}]` · `Arrow` POST ×2 (180~200 · 225~245) · `Cylinder` COCKPIT_DB `chips=[{row:'bot_inbox',text:'#16 미배달',from:200},{row:'bot_inbox',text:'#17 미배달',from:245}]` · `Label` (1060,600) `"starting — 아직 배달하지 않는다"` mono 13 `from=250` `until=330` | 옵션 칩 · 글 둘 |
| 300~360 | `resume 수율개선 → idle`. CLI `대기 idle`. `SessionStart (resume)` 가 여덟 절을 다시 싣는다 (압축판) | 서버 창 `FolderTree`(TERM_12) 줄 5 `from=300` · `Pillar` CLI `status="idle"` (310) · `FolderTree` CLI `lines=[{text:'SessionStart (resume) · session-start.js',from:310,lit:true},{text:'여덟 절 (1 handoff … 8 house.md)',depth:1,from:340}]` · `Mover` from PROJECT (1550,800) to (1620,260) (315~345) 안에 `FileCard` `"여덟 절"` | 묶음 |
| 360~440 | `pendingInbox` 가 밀린 글 둘을 **한 겉봉투 묶음**으로 넣는다. 편지함 칩이 `delivered` 로. CLI `일하는 중 working` | `Label` (960,360) `"pendingInbox (BATCH_LIMIT 20)"` mono 14 `from=360` · `Envelope` x 400 y 120 width 1120 fontSize 16 `text=ENVELOPE_12` `startFrame=370` `framesPerLine=6` (`Spotlight` 0.6, 370~420) · `Mover` 봉투 → CLI {x:1470,y:200,scale:0.25} (420~445) · COCKPIT_DB `chips` 둘 → `delivered` (445) · `Pillar` CLI `status="working"` (450) | 봉투 묶음 |
| 440~479 | 대화 번호가 같다는 것이 양쪽에 찍힌다 | `Label` (1060,600) `"session_id abc… (같음)"` · CLI 부제 `abc…` 강조 (`lit`) | — |

### 화면 글자
- `TERM_12` (`cockpit/bin/cockpit.js:237` · `:231` · `:251` `resume ${r.project} → ${r.state}`. `^C` 는 Ctrl-C 가 터미널에 남기는 표시):
```
^C
끄는 중 — 세션 상태는 그대로 두고 다음 기동에 resume 한다
node bin/cockpit.js serve --config cockpit.json
cockpit 듣는 중 http://127.0.0.1:3000
resume 수율개선 → idle
```
- `release` (`manager.js:147`) · `bootResume` (`:117`) · `stopped 가 아닌 줄` (`:120`) · `resume: abc…` (`:226` · `options.js:28`. `abc…` 는 예시)
- `session_id = abc… · state idle (남음)` (`manager.js:147-154` release 는 상태를 지우지 않는다 · `cockpit-db.js:30` `agent_sessions`)
- `starting — 아직 배달하지 않는다` (`manager.js:22` `DELIVERABLE` 에 `starting` 이 없다 · `:297`)
- `SessionStart (resume) · session-start.js` (`settings.template.json:16`)
- `pendingInbox (BATCH_LIMIT 20)` (`manager.js:18` · `:307`)
- `ENVELOPE_12` (두 덩이를 빈 줄 하나로 잇는다 `manager.js:323` `blocks.join('\n\n')`. 본문은 위 글 둘):
```
<channel source="cockpit" chat_id="1" message_id="16" delivery="to" sender="김과제" author_type="user" room_name="prodev-수율개선">
[김과제] @TO(prodev-수율개선-bot) 라인 4 자료도 있어요
→ delivery="to"로 받은 메시지에는 반드시 reply 도구로 답변하세요.
</channel>

<channel source="cockpit" chat_id="1" message_id="17" delivery="to" sender="김과제" author_type="user" room_name="prodev-수율개선">
[김과제] @TO(prodev-수율개선-bot) 내일 회의 전에 봐 주세요
→ delivery="to"로 받은 메시지에는 반드시 reply 도구로 답변하세요.
</channel>
```

### 자막
| 문장 | 시작 | 끝 |
|---|---|---|
| 프로세스는 바뀌어도 대화 번호는 같다. | 40 | 230 |
| 꺼진 동안 온 글은 편지함에 남았다가 켜지면 들어간다. | 250 | 470 |

### 카메라 · 조명
`OVERVIEW`. 서버 창 상자는 0~340 동안 위에 떠 있다(`Spotlight` 없음, 상자 배경만). 370~420 겉봉투 묶음만 밝게.
글 둘이 들어오는 때를 "서버를 다시 켠 뒤 · 새 프로세스가 `starting` 인 동안" 으로 둔 까닭: 서버가 꺼진 동안은 브라우저도 서버에 닿지 못하고, `starting` 동안 들어온 글은 코드가 실제로 편지함에 붙들어 둔다 (`manager.js:22` · `:297`). 02-plan 의 "그 사이" 를 이 창으로 읽었다.

---

## 장면 13 — 쓸수록 맞아 간다, 굳는 길과 회고 (26초 · 프레임 8580~9359 · 상대 0~779)

README 대응: prodev README 워크플로우 ⑦ 첫 `flowchart TB` 를 좌우 둘로 — 왼쪽 위가 `SAY 지시형 → SCOPE 범위를 한 줄 되묻는다` 와 `ONCE '이번에는' → NOPE`, 왼쪽 아래가 `NOTICE 관찰형 → JNL → RETRO → PROP → ASK '앞으로'`, 오른쪽 과제 폴더가 `WHERE 규칙·양식·방법 → H · T · M → HEAD 머리에 셋`. 둘째 `flowchart TB`(`CALL '돌아봐' → READ journal/*.md · find.log`)가 읽기 점선 둘. 파일 이름 `templates/회의-문서.md` 와 `house.md` 21→23줄은 "실제로 이렇게 돌았다" ⑤ 에서 빌렸다. 루트 README 6절 첫 항목(`house.md` 는 세션이 뜰 때마다 여덟째로 다시 실린다)이 마지막 2초다.

### 한 장 그림 (`mode: 'floor'`)
```
 [브라우저 ▸ @TO(…) 앞으로 회의 문서는 이 양식대로 해 📎]  [cockpit 서버]  [CLI · 굳는 길 / retro]   ← MINI 띠
 ┌ 지시형 (왼쪽 열, PRODEV_BIG 위에 겹쳐 반쯤 어둡게) ┐  ┌ projects/수율개선/ ───────────────────┐
 │ 분기표 둘째 줄 "앞으로" ▣                        │  │ house.md   23 / 50  ──▶ 24 / 50        │
 │ 봇: 회의록만인가요, PL 께 나가는 문서 전부인가요?  │  │ templates/  ◀── 회의-문서.md (머리 셋)     │
 │ 사람: 회의록만                                    │  │ analysis/methods/                       │
 │ 규칙 → house.md · 양식 → templates/ · 방법 → analysis/methods/ │ journal/2026-09-14.md ## 되풀이된 말 │
 │ 사람: 이번에는 짧게  → (아무 파일도 안 생김) ✗    │  └───────────────────────────────────────┘
 │ ── 관찰형 ──  사람: 돌아봐 → retro                │   bots/prodev-수율개선-bot/ find.log (건수 0 줄) ◀╌ 읽기
 │ (a) 원본 경로 (b) 들어갈 문장 (c) 까닭            │
 │ 사람: 앞으로 그렇게 해 → house.md 한 줄            │
 └───────────────────────────────────────────────┘
```

### 비트
| 프레임 | 무엇이 일어나나 | 부품 · props 요점 | 이동하는 물건 |
|---|---|---|---|
| 0~40 | 전경 → 바닥 배치 (장면 10 과 같은 교차 페이드). 이번에는 왼쪽 열이 "지시형 · 관찰형" 판이 된다 | `Stage` `mode='floor'` · `Spotlight` `rects=[PROJECT_BIG, BIG_BOT_FOLDER, 왼쪽 판 (80,140,820,740)]` 0.5 · `FolderTree` PROJECT_BIG 오른쪽 열 x 1440 y 220 width 400 fontSize 18 `lines=[{text:'house.md   23 / 50',from:20},{text:'templates/',from:35},{text:'analysis/methods/',from:50},{text:'journal/2026-09-14.md',from:65}]` · `FileCard` BIG_BOT_FOLDER 속 `find.log` `enterFrame=70` | — |
| 40~110 | MINI 띠에 PL 의 글 (ppt 첨부). CLI 칩에서 분기표 둘째 줄 `"앞으로"` 가 걸린다 | `Label` 화면 (300,60) `"@TO(prodev-수율개선-bot) 앞으로 회의 문서는 이 양식대로 해  📎 회의양식.pptx"` mono 13 `from=40` · `Mover` (300,60)→(1620,60) (60~90) · `FolderTree` 왼쪽 판 x 100 y 160 width 780 fontSize 16 `lines=[{text:'분기표 2 · "앞으로" · "다음부터" → 굳는 길',from:100,lit:true}]` | 글 칩 |
| 110~200 | 봇이 범위를 **한 줄 되묻는다.** 답을 받는다 | `FolderTree` 왼쪽 `lines` 추가 `{text:'봇: 회의록만인가요, PL 께 나가는 문서 전부인가요?',from:120}` `{text:'PL: 회의록만',from:170}` | — |
| 200~280 | 과제 폴더 `templates/회의-문서.md` 가 생기고 머리에 셋이 찍힌다 | `Mover` from 화면 (1620,60) to (1600,300) (200~240) 안에 `FileCard` `templates/회의-문서.md` · `FolderTree` PROJECT_BIG `lines` 추가 `{text:'회의-문서.md',depth:1,from:240,lit:true}` `{text:'언제부터 2026-09-15 · 누가 김피엘 · 무엇을 보고 회의양식.pptx',depth:2,from:260}` | 파일 |
| 280~340 | 갈래 셋이 나란히 | `FolderTree` 왼쪽 `lines` 추가 `{text:'규칙 → house.md  ·  양식 → templates/  ·  방법 → analysis/methods/',from:290}` (세 낱말에 각각 PROJECT_BIG 의 줄로 얇은 점선, `Arrow` `dashed` `strokeWidth=1.5` 300~330) | — |
| 340~390 | 반대편에 `이번에는 짧게`. 아무 파일도 안 생긴다 | `FolderTree` 왼쪽 `lines` 추가 `{text:'PL: 이번에는 짧게',from:345}` `{text:'→ 굳히지 않는다 (파일 없음)',depth:1,from:365,warn:true}` · PROJECT_BIG 은 변화 없음 (`Label` (1420,700) `"변화 없음"` 13px `from=370` `until=400`) | — |
| 390~450 | **관찰형.** 김피엘이 `돌아봐`. 회고 `retro` 가 켜진다 | `Label` 화면 (300,60) `"@TO(prodev-수율개선-bot) 돌아봐"` `from=390` · `Mover` (300,60)→(1620,60) (400~420) · MINI CLI 칩 부제 `retro` `lit` (420) · `FolderTree` 왼쪽 `lines` 추가 `{text:'── 관찰형 ── 회고 retro',from:430}` | 글 칩 |
| 450~530 | 바닥의 `journal/*.md` (`## 되풀이된 말`) 와 봇 폴더의 `find.log` (건수 0 인 줄) 로 **읽기 화살표 둘** | `Arrow` 화면 (1620,88)→(1640,290) `dashed` `label="journal/*.md  ## 되풀이된 말"` `labelSize=13` `color=cli` (450~490) · `Arrow` 화면 (1620,88)→(700,700) `route="orthogonal"` `bend="vhv"` `dashed` `label="find.log  (건수 0 인 줄)"` `labelSize=13` `color=cli` (470~520) · 두 대상 `lit` | 점선 둘 |
| 530~620 | 봇 답에 굳힐 후보 하나가 **셋 묶음**으로 뜬다 | `CodeBlock` x 100 y 470 width 780 `code=RETRO_13` `fontSize=15` `showLineNumbers=false` `startFrame=530` `framesPerLine=14` `title="retro 제안 — .claude/skills/retro/SKILL.md:80-82"` | — |
| 620~700 | PL 이 `앞으로 그렇게 해`. `house.md` 에 한 줄이 들어가고 계기가 한 칸 오른다 | `Label` 화면 (300,60) `"@TO(prodev-수율개선-bot) 앞으로 그렇게 해"` `from=620` · `Mover` (300,60)→(1620,60) (630~650) · `Mover` from 화면 (1620,60) to (1560,220) (655~685) 안에 `FileCard` `"house.md 에 한 줄"` · `FolderTree` PROJECT_BIG `lines[0].text` → `'house.md   24 / 50'` (690, 숫자만 바뀌며 `lit`) · `Label` (1560,255) `"### 문체와 어휘  + 1줄  (언제부터 · 누가 · 무엇을 보고)"` 12px `from=690` | 한 줄 |
| 700~779 | 마지막 2초: 다음 `켜기` 때 `session-start.js` 여덟째 절로 `house.md` 가 문맥에 실린다 | `Label` 화면 (1620,60) `"다음 켜기 · SessionStart"` `from=710` · `Mover` from 화면 (1560,220) to (1620,60) (720~760) 안에 `FileCard` `"8 ## 이 과제의 규칙 (house.md)"` | 파일 |

### 화면 글자
- `@TO(prodev-수율개선-bot) 앞으로 회의 문서는 이 양식대로 해` (02-plan 장면 13 · prodev README 워크플로우 ⑦ 3번) · `📎 회의양식.pptx` (예시 이름)
- `분기표 2 · "앞으로" · "다음부터" → 굳는 길` (`prodev-orchestrator/SKILL.md:13`)
- `봇: 회의록만인가요, PL 께 나가는 문서 전부인가요?` (`prodev-orchestrator/SKILL.md:46`)
- `templates/회의-문서.md` · `언제부터 · 누가 · 무엇을 보고` (`prodev-orchestrator/SKILL.md:49-50` · `setup.js:223`)
- `규칙 → house.md  ·  양식 → templates/  ·  방법 → analysis/methods/` (`prodev-orchestrator/SKILL.md:49` · prodev README "무엇이 어디에 굳나")
- `이번에는 짧게` · `→ 굳히지 않는다 (파일 없음)` (`prodev-orchestrator/SKILL.md:53` · prodev README ⑤)
- `돌아봐` · `retro` (`prodev-orchestrator/SKILL.md:22`) · `journal/*.md  ## 되풀이된 말` (`prodev/.claude/skills/retro/SKILL.md:20-22` · `journal/SKILL.md:37` 표 · `:59` 절 제목) · `find.log  (건수 0 인 줄)` (`retro/SKILL.md:22`)
- `RETRO_13` (틀은 `retro/SKILL.md:80-82`. 내용은 예시):
```
굳힐 후보 1
(a) 원본 경로 — journal/2026-09-12.md · journal/2026-09-14.md  ## 되풀이된 말
(b) 바꿀 문장 — "숫자에는 출처 카드 번호를 단다"  → house.md ### 문체와 어휘
(c) 까닭 — 같은 지적이 두 일지에 있다 (#415 · #459). 아직 아무 데도 안 굳었다
```
- `house.md   23 / 50` → `24 / 50` (상한 50: `session-start.js:29` `house: 50` · 값 23 은 prodev README "실제로 이렇게 돌았다 ⑤" 의 예)
- `8 ## 이 과제의 규칙 (house.md)` (`session-start.js:138`)

### 자막
| 문장 | 시작 | 끝 |
|---|---|---|
| "앞으로" 라고 말한 것만 파일로 굳고 "이번에는" 은 굳지 않는다. | 40 | 380 |
| 회고는 일지와 find.log 를 읽어 제안까지만 한다. | 400 | 760 |

### 카메라 · 조명
`floor` 배치. 왼쪽 열은 PRODEV_BIG 위에 겹친 판(배경 surface 색 90%)이고, PRODEV_BIG 자체는 봇 폴더(`find.log`)만 밝다. `이번에는` 줄만 warn 색.

---

## 장면 14 — 어디를 고치면 봇이 달라지나 (21초 · 프레임 9360~9989 · 상대 0~629 — 02-plan 의 18초에 마무리 자막용 3초를 더했다, meta 결정)

README 대응: 루트 README 2절 결론("방 · 계정 · DB 둘은 cockpit 서버가, 봇 폴더 · 과제 폴더는 setup.js 가 만들고, 스킬은 prodev 제작 세션만 만든다")과 접힌 표 마지막 줄("봇은 안 만든다"). 루트 README 6절 셋째 항목(스킬 · 도우미 · 훅은 prodev 제작 세션이 PR 로 · 훅 · 스크립트 고치기는 거부 목록)이 `deny` 셋과 PR 화살표. prodev README "자리" 표 · "도우미 여섯" · "스킬 열다섯" 절이 prodev 뿌리 쪽 불 넷의 이름표, 워크플로우 ⑦ "굳는 것 / 사는 자리" 표가 과제 폴더 쪽 둘. cockpit README 4절 그림 봇 줄 맨 아래(`settings.local.json 허용 목록`)가 봇 폴더 쪽 하나.

### 한 장 그림 (`mode: 'floor'`, 마지막 3초 전경)
```
 [prodev 제작 세션 ─ PR ─┐]      [cockpit 서버]        [Claude Code CLI ─ 손 ─┐]        ← MINI 띠
 ┌ prodev 저장소 ─────────┼──────────────┐   ┌ projects/수율개선/ ────┼──────────┐
 │ ① CLAUDE.md            ▼              │   │ ⑥ house.md              ▼ Write ✓  │
 │ ② .claude/skills/<이름>/SKILL.md ◀ 새 SKILL.md │   │ ⑦ templates/                   │
 │ ③ .claude/agents/<이름>.md             │   │                                   │
 │ ④ common/hooks/*.js   ✗ deny ◀── 손   │   │                                   │
 │    scripts/**         ✗ deny           │   └───────────────────────────────────┘
 │  ┌ bots/prodev-수율개선-bot ──────────┐ │
 │  │ ⑤ .claude/settings.local.json (allow · deny) ✗ deny │
 └──┴────────────────────────────────────┴─┘
        ↓ 480~629: 장면 1 의 세 기둥과 바닥 전경으로 돌아간다 · 한 줄 요지 자막 (485~625)
```

### 비트
| 프레임 | 무엇이 일어나나 | 부품 · props 요점 | 이동하는 물건 |
|---|---|---|---|
| 0~30 | 바닥 전체가 밝다 (두 상자 다) | `Stage` `mode='floor'` (앞 장면에서 이어짐) · `Spotlight` 없음 · `FolderTree` PRODEV_BIG x 90 y 240 width 560 fontSize 18 `lines=SEVEN_A` (`from` 0, `lit` 은 아래에서) · `FolderTree` BIG_BOT_FOLDER x 500 y 720 fontSize 15 `lines=[{text:'.claude/settings.local.json  (allow · deny)',from:0}]` · `FolderTree` PROJECT_BIG x 1000 y 240 width 800 fontSize 18 `lines=[{text:'house.md',from:0},{text:'templates/',from:0}]` | — |
| 20~230 | 고칠 수 있는 자리 **일곱**에 차례로 불이 들어온다 (30프레임 간격, 번호 ①~⑦ 배지) | `lit` 순서: ① `CLAUDE.md` (20) ② `.claude/skills/<이름>/SKILL.md` (50) ③ `.claude/agents/<이름>.md` (80) ④ `common/hooks/*.js` (110) ⑤ `.claude/settings.local.json` (140) ⑥ `house.md` (170) ⑦ `templates/` (200) · 각 줄 `number='①'…'⑦'` | 불 |
| 240~340 | CLI(봇)의 손이 훅 · 스크립트 · 설정으로 뻗다가 `deny` 에 **튕긴다** (세 번, warn 색) | `Arrow` 화면 (1620,88)→(420,372) `route="orthogonal"` `bend="vhv"` `color=cli` `label="Edit"` `labelSize=13` (240~265) → 닿는 순간 `Label` (420,372) 옆 `"✗ deny: Edit(…/common/hooks/**)"` mono 13 warn `from=265` · 화살표 색 → warn 되튐(`progress` 1→0.8, 265~285) · 같은 꼴로 `scripts/` (290~310, `"✗ deny: Edit(…/scripts/**)"`) · 봇 폴더 `settings.local.json` (315~340, `"✗ deny: Edit(…/.claude/settings.local.json)"`) | 손 화살표 |
| 340~420 | 바닥 옆에 작은 별도 기둥 `prodev 제작 세션` 이 서서 **PR 로 새 `SKILL.md` 한 장**을 prodev 뿌리에 꽂는다 | MINI 띠 왼쪽 칩을 `"prodev 제작 세션 (사람 + worktree + PR)"` human 색으로 바꾼다 (340, 브라우저 칩 대신) · `Arrow` 화면 (300,88)→(300,300) `color=human` `label="PR"` (350~380) · `Mover` from 화면 (300,88) to (420,300) (380~410) 안에 `FileCard` `"<이름>/SKILL.md"` human 색 → 도착하면 ② 줄이 한 번 더 `lit` (410) | 파일 |
| 420~480 | 봇의 손은 과제 폴더 `house.md` · `templates/` 에만 닿는다 (cli 색, ✓). 다음 켜기 때 닻줄이 다시 올라가며 새 스킬이 실린다 | `Arrow` 화면 (1620,88)→(1100,250) `color=cli` `label="Write ✓"` `labelSize=13` (420~445) · `AnchorLine` (floor 배치용 점) `points=[(1620,88),(1620,140),(700,140),(700,690)]` `progress` 0→1 (450~475) `climb={points:[(700,690),(700,240),(90,240)],progress:0→1}` (475~495) · ② 줄 `lit` (495) · `Label` (900,150) `"다음 켜기 때 cwd 로 다시 읽는다"` 14px `from=480` `until=520` | 닻줄 |
| 480~629 | 마지막 5초: 장면 1 의 **세 기둥과 바닥 전경**으로 돌아간다. 모든 기둥이 켜져 있고 닻줄이 걸려 있고 두 화살표가 흐른다. 요지 자막이 4.7초 동안 떠 있다 | `Stage` `mode` floor→overview (교차 페이드 480~510) · BROWSER `on` · SERVER `on` · CLI `idle` · `AnchorLine.progress=1` · `Arrow` POST (510~540) · `Arrow` SSE 점선 loop (540~) · 바닥 상자 둘 밝게 | 카메라 |

### 화면 글자
- `SEVEN_A` (`01-facts.md` 6절 · 02-plan 장면 14): `① CLAUDE.md  (전 봇 공통 지침)` · `② .claude/skills/<이름>/SKILL.md  (스킬 추가)` · `③ .claude/agents/<이름>.md  (도우미 추가)` · `④ common/hooks/*.js  (훅)` · `scripts/**` (불 없음 · deny 대상만) — prodev 뿌리
- `⑤ .claude/settings.local.json  (allow · deny)` — 봇 폴더 (`settings.local.template.json:3` · `:27`)
- `⑥ house.md` · `⑦ templates/` — 과제 폴더 (`01-facts.md` 6절)
- `✗ deny: Edit(…/common/hooks/**)` · `✗ deny: Edit(…/scripts/**)` · `✗ deny: Edit(…/.claude/settings.local.json)` (`settings.local.template.json:31` · `:32` · `:29`. `{{PRODEV}}` · `{{BOT}}` 자리는 `…` 로)
- `Edit` · `Write ✓` (`settings.local.template.json:12-15` `Edit({{PROJECT}}/**)` · `Write({{PROJECT}}/**)` 가 열린 자리)
- `prodev 제작 세션 (사람 + worktree + PR)` · `PR` (`prodev/.claude/skills/retro/SKILL.md:109` "만드는 것은 prodev 세션이고 worktree + PR 이다. 봇이 만들지 않는다" · crew-workspace README 2절 결론)
- `<이름>/SKILL.md` (`prodev/.claude/skills/<이름>/SKILL.md` 꼴)
- `다음 켜기 때 cwd 로 다시 읽는다` (`01-facts.md` 2절 "cwd 로 물고 들어간다")

### 자막
| 문장 | 시작 | 끝 |
|---|---|---|
| 전 봇 공통은 prodev 뿌리에 PR 로, 이 과제만의 것은 과제 폴더에 봇이 쓴다. | 20 | 260 |
| 봇은 자기 훅과 설정을 못 고친다. | 280 | 470 |
| (마무리, 02-plan 1절 한 줄 요지 — 장면 14 "마지막 3초" 지시) cockpit 서버가 봇 폴더를 cwd 로 Claude Code CLI 를 한 번 켜 두고, 사람의 @TO 글을 겉봉투에 싸서 넣어 주면, 그 CLI 가 두 층 위 prodev 의 지침·스킬·훅으로 일하고 과제 폴더의 파일에 기억을 남긴다 — 그래서 압축되고 꺼져도 "이어서 합니다". | 485 | 625 |

마무리 자막은 `Caption` `fontSize=28` `maxWidth=1700` `fadeFrames=8` 로 두 줄로 접는다 (140프레임 · 4.7초).

### 카메라 · 조명
`floor` 배치 (0~480), 조명 없음(둘 다 밝다). `deny` 셋만 warn 색. 480~510 전경으로 교차 페이드, 510~629 장면 1 의 마지막 모습.

---

## 부록 A — 프레임 합계

| 장면 | 초 | 프레임 수 | 절대 시작 | 절대 끝 |
|---|---|---|---|---|
| 1 | 12 | 360 | 0 | 359 |
| 2 | 18 | 540 | 360 | 899 |
| 3 | 22 | 660 | 900 | 1559 |
| 4 | 28 | 840 | 1560 | 2399 |
| 5 | 22 | 660 | 2400 | 3059 |
| 6 | 32 | 960 | 3060 | 4019 |
| 7 | 20 | 600 | 4020 | 4619 |
| 8 | 32 | 960 | 4620 | 5579 |
| 9 | 28 | 840 | 5580 | 6419 |
| 10 | 28 | 840 | 6420 | 7259 |
| 11 | 28 | 840 | 7260 | 8099 |
| 12 | 16 | 480 | 8100 | 8579 |
| 13 | 26 | 780 | 8580 | 9359 |
| 14 | 21 | 630 | 9360 | 9989 |
| **합계** | **333** | **9,990** | | |

02-plan 은 330초 · 장면 14 = 18초다. 마무리 자막을 읽을 시간으로 meta 가 장면 14 를 3초 늘렸다 (±10% 안). 다른 장면은 그대로다.

## 부록 B — 제안 (본문은 02-plan 원문을 쓴다. 판정은 meta 의 것)

1. (결정됨 — meta) 장면 14 를 630 프레임(21초)으로 늘려 요지 자막을 485~625 에 둔다. 총 9,990 프레임. 본문 · 부록 A · 04 에 반영했다.
2. (결정됨 — 코드대로) 장면 11 의 `[깨어남: compact] 나는 prodev-수율개선-bot다.` — 02-plan 본문은 `bot 다` 로 띄어 썼으나 코드(`session-start.js:85`)는 `${봇}다` 라 붙여 쓴다. 화면은 코드를 따른다.
3. (받아들여짐) 장면 12 의 "그 사이" 글 둘은 새 프로세스가 `starting` 인 동안 들어온 것으로 그린다 (위 장면 12 카메라 절의 까닭).
4. 이 콘티는 02-plan **2판**(용어 · README 대응 · 자막 다섯 문장 · 제목 셋 · `templates/회의-문서.md`)을 따른다. 1판으로 만든 초안의 낱말(에이전트 · 봉투 · bot_inbox · idle)은 2판 용어(도우미 · 겉봉투 · 편지함 · 대기)로 바꿨고, 코드 이름은 고정폭으로 곁에 남겼다.
5. (받아들여짐 — 시사에서 정한다) 장면 7 의 `🔒 Bash 요청 · curl --version` 에서 `·` 뒤는 SDK 가 주는 `title` 이라 실제 글자는 실행마다 다를 수 있다 (`relay.js:32`). 시사에서 실제 화면과 다르면 `🔒 Bash 요청 · Bash` (title 없을 때의 코드 기본값)로 바꾼다.
