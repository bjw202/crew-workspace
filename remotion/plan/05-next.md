# 다음 지시 — remotion 세션이 clear 뒤 읽는 자리

meta 가 갱신한다. 이 파일의 맨 위 절이 지금 할 일이다. 지난 지시는 아래로 밀린다.

## 지금 할 일 (2026-09-15, 사람 시사 1차 — 고칠 것 둘)

사람이 렌더를 보고 둘을 짚었다. 둘 다 고치고 still 로 확인한 뒤 다시 렌더한다.

### ① 장면 5 · `MINIDISCORD_DB` 를 화면에서 뺀다 (1:29 근처)
- 사람의 말: "이제는 안 쓰는 minidiscord 가 나온다."
- 사실: `prodev/common/settings.template.json:8` 에 env 이름 `MINIDISCORD_DB` 가 아직 있고 값은 cockpit chat.db 경로다 (이름만 옛것). 코드 이름 바꾸기는 prodev PR 거리라 영상에서는 **이름을 뺀다**.
- 고침: S05 CLI 속 나무의 `env: PRODEV_BOT ·` / `PRODEV_PROJECT · MINIDISCORD_DB` 두 줄을 **`env: PRODEV_BOT · PRODEV_PROJECT` 한 줄**로. 03 장면 5 화면 글자 표도 meta 가 같이 고친다.
- still: `S05-0350.png` 다시.

### ② 장면 2 · chat.db · cockpit.db 역할 설명 보충
- 사람의 말: "chat.db cockpit.db 의 역할에 대한 설명 보충 필요."
- 고침: S02 에서 원통이 설 때 원통 **아래**(무대 좌표, 원통 아래변 588 + 14 → y 602, 각 원통 가운데 x) 에 역할 이름표 한 줄씩 (`Label` sans 14, tone server, maxWidth 200 두 줄 허용):
  - chat.db (x 858): `사람과 봇이 나눈 말 — 방 · 글 · 첨부` (from 140)
  - cockpit.db (x 1062): `서버의 살림 — 계정 · 편지함 · 세션 · 승인` (from 220)
  - 그리고 260 부터 두 원통 사이 아래(960, 640)에 한 줄: `봇은 chat.db 를 훅으로 읽기만, cockpit.db 는 읽지 못한다 (deny)` sans 13, tone server. 근거: `prodev/scripts/setup.js:295` deny `Read(cockpit.db)`, `pre-reply.js:49` readOnly.
  - 카메라 SERVER 줌(1.35)이라 이 자리는 화면 안에 든다. 셋 다 장면 2 끝(539)까지. S03 에는 넘기지 않는다.
- 자막은 그대로 (두 문장 규칙).
- still: `S02-0320.png` · `S02-0520.png` 다시.

### 그 뒤
`npx remotion render Main out/main.mp4` 다시. 보고: ffprobe 프레임 수 · 크기 · 시간 · 경고.

## 지난 상태 (2026-09-15 18:05)

S01~S14 통과 · 전체 렌더 통과 (`review/2026-09-15-Cend-render.md`). 커밋은 사람이 정한다.

## 지난 지시 (S13 통과 뒤 · clear 뒤 첫 일)

상태: S01~S13 통과. 남은 것은 **S14 하나와 전체 렌더**. `src/scenes/index.ts` 합은 지금 9360 이고, S14(630) 를 더하면 9990 이다.

### 그동안 굳은 판정 규칙 (clear 뒤에도 지킨다)
- 같은 자리에서 다시 도는 화살표는 앞 것을 다음 시작 프레임에 지우고 새로 그린다.
- CLI 에 닿은 상자·봉투(작게 줄어든 것)는 닿은 뒤 20~40 프레임에 흐려져 사라진다. Mover 는 holdAfter=false 가 기본.
- 조종석 판 상태 글자는 CLI 상태를 따른다 (`꺼짐` · `켜는 중` · `대기` · `일하는 중` · `승인 대기`).
- `Pillar` 상태 글자는 부제 줄 오른쪽 끝. 제목 띠 100~160 고정.
- `Arrow` 는 `points?: Point[]` 로 꺾은선을 직접 줄 수 있다 (기둥·원통을 관통하지 않게).
- 편지함 칩은 봉투가 CLI 에 닿을 때 `#n delivered` 로.
- 앞 장면의 화살표·이름표는 다음 장면 frame 0 으로 넘기지 않는다. 기둥 상태 · 칩 · 바닥 줄 · 뿌리 카드 · 닻줄은 넘긴다.
- 04 6.5절의 확정 사항 전부.

### S14 — 어디를 고치면 봇이 달라지나 (630 프레임)
03 장면 14 비트 표 그대로 (2판 · 630 프레임 판): `mode: 'floor'` 이어짐(S13 끝) · 조명 없음(둘 다 밝다) · PRODEV_BIG `FolderTree` SEVEN_A(`scripts/**` 포함) · BIG_BOT_FOLDER SEVEN_BOT · PROJECT_BIG SEVEN_PROJECT → 20~230 일곱 자리에 30프레임 간격으로 불(①~⑦ 배지) → 240~340 CLI 칩에서 `Edit` 화살표가 `common/hooks/*.js` · `scripts/**` · `.claude/settings.local.json` 로 뻗다 **warn 색으로 튕김** + `✗ deny: Edit(…/common/hooks/**)` · `✗ deny: Edit(…/scripts/**)` · `✗ deny: Edit(…/.claude/settings.local.json)` → 340~420 MINI 왼쪽 칩이 `prodev 제작 세션 (사람 + worktree + PR)` human 색으로 바뀜 · `PR` 화살표 · `<이름>/SKILL.md` 카드가 ② 줄로 (② 다시 lit) → 420~480 CLI 칩에서 `Write ✓` 화살표가 house.md · templates/ 로 (cli 색) · floor 용 닻줄 `points=[(1620,88),(1620,140),(700,140),(700,690)]` + climb `[(700,690),(700,240),(90,240)]` · ② lit · `다음 켜기 때 cwd 로 다시 읽는다` → 480~510 floor→overview 교차 페이드 → 510~629 장면 1 의 전경(기둥 셋 on/idle · 닻줄 1 · POST · SSE 점선 loop · 바닥 상자 둘 밝게 · 뿌리 카드) · 마무리 자막(요지, 485~625, `Caption fontSize=28 maxWidth=1700 fadeFrames=6` 두 줄). 자막 셋은 03 장면 14 표 그대로.

still: `out/stills/S14-0000.png` · `S14-0300.png` · `S14-0600.png`.

### S14 통과 뒤 (meta 가 통과라고 하면)
1. `index.ts` 합 검사를 `=== 9990` 으로.
2. 04 6절 검사: `Main --frame=4020` 과 `S07 --frame=0`, `Main --frame=9660` 과 `S14 --frame=300` 이 같은지 `cmp` (S01 은 이미 했다).
3. 전체 렌더 `npx remotion render Main out/main.mp4`. 보고: 총 프레임 · 파일 크기 · 렌더 시간 · 경고.

보고 항목은 앞과 같다. 커밋하지 않는다. `remotion/` 안에만 쓴다.

## 지난 지시 (S12 통과 뒤)

먼저 하나 (`review/2026-09-15-C12-scene.md`): S12 CLI 부제 `프로세스 2 · session_id abc…` → `프로세스 2 · abc…`. still 다시 뽑을 필요 없음.

그 다음 **S13 — 쓸수록 맞아 간다, 굳는 길과 회고 (780 프레임)**. `mode: 'floor'` 둘째 장면. 03 장면 13 비트 표 그대로: 0~40 overview→floor 교차 페이드 · 왼쪽 열은 `LEFT_PANEL`(80,140,820×740) 판(배경 surface 90%) · Spotlight [PROJECT_BIG · BIG_BOT_FOLDER · 왼쪽 판] · PROJECT_BIG 오른쪽 열 `house.md   23 / 50` · `templates/` · `analysis/methods/` · `journal/2026-09-14.md` · BIG_BOT_FOLDER `find.log` → MINI 띠에 `@TO(prodev-수율개선-bot) 앞으로 회의 문서는 이 양식대로 해  📎 회의양식.pptx` 칩이 CLI 로 · 왼쪽 판 `분기표 2 · "앞으로" · "다음부터" → 굳는 길` lit → `봇: 회의록만인가요, PL 께 나가는 문서 전부인가요?` · `PL: 회의록만` → `templates/회의-문서.md` 카드가 과제 폴더로 · 줄 `회의-문서.md` lit · `언제부터 2026-09-15 · 누가 김피엘 · 무엇을 보고 회의양식.pptx` → 갈래 셋 `규칙 → house.md · 양식 → templates/ · 방법 → analysis/methods/` + 얇은 점선 셋 → `PL: 이번에는 짧게` · `→ 굳히지 않는다 (파일 없음)`(warn) · `변화 없음` → **관찰형** `@TO(prodev-수율개선-bot) 돌아봐` 칩 · CLI 칩 부제 `retro` lit · `── 관찰형 ── retro` → 읽기 점선 둘(`journal/*.md  ## 되풀이된 말` · `find.log  (건수 0 인 줄)`) → RETRO_13 상자(`retro 제안 — .claude/skills/retro/SKILL.md:80-82`) → `@TO(prodev-수율개선-bot) 앞으로 그렇게 해` 칩 · `house.md 에 한 줄` 카드 → `house.md   24 / 50` lit · `### 문체와 어휘  + 1줄  (언제부터 · 누가 · 무엇을 보고)` → `다음 켜기 · SessionStart` · `8 ## 이 과제의 규칙 (house.md)` 카드가 CLI 칩으로. frame 0 = S12 끝(overview). 03 장면 13 의 파일 이름은 2판대로 `templates/회의-문서.md`.

still: `out/stills/S13-0000.png` · `S13-0560.png` · `S13-0700.png`.

보고 항목은 앞과 같다. **보고 끝에 지금 문맥 사용량(%)을 적어라.** 70% 근처면 S14 전에 clear 한다 (clear 는 사람이 친다). 커밋하지 않는다. `remotion/` 안에만 쓴다.

## 지난 지시 (S11 통과 뒤)

먼저 셋 (`review/2026-09-15-C11-scene.md`):
① `claude -p --model sonnet` 상자 폭 240 → 340, x 1300 → 1260. 부제 `빈 폴더 · 180초` 보이게.
② CLI 상태 200~700 `working`(판 `일하는 중`), 700 부터 `idle`. 근거 `cockpit/src/session/manager.js:302`.
③ `POST …/session/compact` 화살표는 260 에 지운다.
→ `S11-0700.png` 다시.

그 다음 **S12 — 껐다 켜도, 이어 붙기(resume) (480 프레임)**. 03 장면 12 비트 표 그대로: 서버 창 `FolderBox`(960,200 · 800×170) 안 `FolderTree` TERM_12 (`^C` 10 · `끄는 중 …` 25 · `node bin/cockpit.js serve …` 130 · `cockpit 듣는 중 …` 160 · `resume 수율개선 → idle` 300, 상자는 340 에 사라짐) · `release` 이름표 · CLI `off`(60) · 닻줄 1→0 (60~90) → 서버 `off`(90) · 원통은 밝게 · `session_id = abc… · state idle (남음)` · 바닥 상자 잠깐 glow → 서버 `on`(160) → `bootResume` · 읽기 점선 `stopped 가 아닌 줄` · `resume: abc…` 칩이 CLI 로 · CLI `starting`(250) 부제 `프로세스 2 · session_id abc…` · 사람 글 둘(180 · 225) POST ×2 · 편지함 칩 `#16 미배달` `#17 미배달` · `starting — 아직 배달하지 않는다` → `resume 수율개선 → idle` · CLI `idle`(310) · `SessionStart (resume) · session-start.js` · `여덟 절 (1 handoff … 8 house.md)` · 여덟 절 카드 → `pendingInbox (BATCH_LIMIT 20)` · ENVELOPE_12 두 덩이(조명) → CLI 로 · 칩 둘 `delivered` · CLI `working`(450) → `session_id abc… (같음)`. frame 0 = S11 끝(CLI 나무 SECTIONS 여덟 줄 + 깨어남 두 줄 · 닻줄 1 · 봇 답). 닻줄이 0 이 되는 것은 "프로세스가 없으면 cwd 도 없다".

still: `out/stills/S12-0000.png` · `S12-0260.png` · `S12-0440.png`.

보고 항목은 앞과 같다. 커밋하지 않는다. `remotion/` 안에만 쓴다.

## 지난 지시 (S10 통과 뒤)

먼저 하나 (`review/2026-09-15-C10-scene.md`): S09 도우미 기둥 부제를 `data-reader` 만으로, 기둥 x 를 15px 왼쪽(화면 615~795)으로. → `S09-0420.png` 다시.

그 다음 **S11 — 압축, 문맥은 캐시 · 파일이 진실 (840 프레임)**. 03 장면 11 비트 표 그대로: 0~40 floor→overview 교차 페이드 → `ContextBar`(CONTEXT_BAR) 0.55→0.92 · 판 `문맥 92%` · `압축` 단추 눌림 → `POST /api/projects/수율개선/session/compact` · `compact → pendingCompact` → `/compact` 칩이 입력 흐름으로 · `input.push('/compact')` → CLI 나무 `PreCompact · pre-compact.js` lit · `기록 꼬리 40턴 (tool_result 300자 · thinking 제외)` → `claude -p --model sonnet` 상자(`빈 폴더 · 180초`) 로 `마지막 40턴` 카드가 가고 `요약 (여섯 칸)` 카드가 돌아옴 → `handoff-compact.md` 카드가 봇 폴더로 **떨어짐** · 조명(봇 폴더 + 상자) · HANDOFF_11 상자 → `status: compacting` · SSE · 방에 `문맥을 정리 중입니다. 곧 이어서 합니다.` → 막대 0.92→0.12 · CLI 나무 흐려짐 · `compact_boundary` → `SessionStart (compact) · session-start.js` lit · 여덟 절 카드가 봇 폴더[1] · 과제 폴더[2~8] 에서 CLI 로 차례로 올라옴 · SECTIONS_11 줄 → WAKE_11 두 줄 · 방에 `정리가 끝났습니다. 이어서 하려면 말을 걸어 주세요.` → `@TO(prodev-수율개선-bot) 어디까지 했지?` 왕복 압축 → BOT 답 `이어서 합니다 — …`. frame 0 = S10 끝(floor). overview 로 돌아온 뒤의 기본 상태: 기둥 셋 on/idle · 닻줄 1 · 뿌리 카드 · 봇 폴더 나무 · 과제 폴더 줄 다섯(S08 끝) · 칩들 · CLI 나무는 S09 의 접힌 `실린 것` 두 줄만. "훅이 파일을 쓴다"(위→아래) 와 "훅이 파일을 읽는다"(아래→위) 두 이동이 바닥을 사이에 두고 마주 보게.

still: `out/stills/S11-0000.png` · `S11-0440.png` · `S11-0700.png`.

보고 항목은 앞과 같다. 커밋하지 않는다. `remotion/` 안에만 쓴다.

## 지난 지시 (S09 통과 뒤)

먼저 셋 (`review/2026-09-15-C9-scene.md`):
① 도우미 기둥 폭 150 → 180 (화면 x 630~810), 상태 글자 비움(`statusText=''`), 부제 `data-reader · opus`.
② 도우미 기둥은 500~520 에 사라진다.
③ 여섯 이름 이름표 y 470 → 420.
→ `S09-0620.png` 다시 (① 은 0420 에도 보이지만 0620 한 장으로 본다).

그 다음 **S10 — 바닥, 지식이 쌓이고 찾힌다 (840 프레임)**. `mode: 'floor'` 를 처음 쓰는 장면이다. 03 장면 10 비트 표 그대로: 0~40 카메라 RIGHT→(OVERVIEW 경유 없이) FLOOR_ZOOM 으로 커지며 floor 배치로 교차 페이드 (04 4.2) · Spotlight PROJECT_BIG → 60~250 왼쪽 열에 층 넷이 아래에서 위로(inbox → cards → wiki → index, 각 FileCard 큰 판 두 줄) → 260~340 오른쪽 열 과제 문서 넷(charter · schedule · journal/2026-09-14 · house) → 360~420 MINI 띠에 물음 `@TO(prodev-수율개선-bot) B 로트 수율 어디 있었지?` 칩이 브라우저→서버→CLI 로, CLI 칩 부제 `find` lit → 420 `node ../../scripts/find.js B 로트 수율` → 460~700 LAYERS_10 여섯 층이 서고 불빛이 ①→② 에서 멈춤 · `→ cards/E-0001.md:14` · ③~⑥ dim → 700~760 답 칩 `B 로트 수율 … (cards/E-0001.md)` 가 CLI→브라우저 → 760~839 봇 폴더 `find.log` 카드 + FINDLOG_10 한 줄이 ② 층에서 날아가 붙음 · Spotlight 에 BIG_BOT_FOLDER 추가. frame 0 = S09 끝(카메라 RIGHT). 04 6.5 의 Stage floor 규칙(BIG_BOT_FOLDER 도 그린다 · mini 칩 title/tone) 을 쓴다.

still: `out/stills/S10-0000.png` · `S10-0580.png` · `S10-0800.png`. 새 배치라 **먼저 0580 한 장**을 뽑아 보고해도 된다.

보고 항목은 앞과 같다. 커밋하지 않는다. `remotion/` 안에만 쓴다.

## 지난 지시 (S08 통과 뒤)

먼저 셋 (`review/2026-09-15-C8-scene.md`):
① S08 CHECK_8 `framesPerLine` 14 → 8.
② CHECK_8 글자: 03 을 meta 가 고쳤다 — 빈칸 채움 없이 `<조건>  ✓`(빈칸 둘). `text.ts` 의 CHECK_8 을 03 과 같게.
③ readOnly 점선 가로 구간 y 470 → 436 (cockpit.db 원통 위를 지나지 않게). 이름표는 그 위.
→ `S08-0740.png` 다시.

그 다음 **S09 — 스킬 · 훅 · 도우미, 한 턴의 시계 (840 프레임)**. 카메라 `RIGHT` 를 처음 쓰는 장면이다. 03 장면 9 비트 표 그대로: 0~40 카메라 OVERVIEW→RIGHT · 화면 좌표 `Timeline` x 1300 (TICKS_9 여섯 눈금) · Spotlight(CLI + 시간축 영역) → 눈금 1 `session-start.js` 여덟 절 묶음이 바닥에서 CLI 문맥 맨 앞으로 → 눈금 2 봉투 칩 · CLAUDE.md 한 줄 · BRANCH_9 훑는 불빛이 `intake` 에서 멈춤 · SKILLS_9 서랍 세 열 → 눈금 3 `Agent` 화살표 · 도우미 `Pillar`(data-reader · opus, working) · `reading.md` 바닥으로 · `20줄 요약` 되돌아옴 · 여섯 이름 → 눈금 4 `reply → PreToolUse · pre-reply.js` · CHECKS_9 다섯 · `exit 2`(warn) · `stderr: 이유 한 줄` 되돌아감 · `reply (고쳐서 다시)` → 눈금 5 `PreCompact · pre-compact.js (timeout 180)` → 눈금 6 서버 속 `hook · hook_started` · `hook · hook_response · exit_code`(서버가 밝아짐). frame 0 = S08 끝(카메라 OVERVIEW). CLI 속 나무는 S08 의 줄(실린 것 두 줄 · orchestrator · intake · reply · PreToolUse)을 지우고 03 장면 9 의 줄로 새로 쓴다 (실린 것 두 줄만 dim 으로 남긴다). 화면 좌표 요소(Timeline · 도우미 Pillar · 시간축 옆 FolderTree · 이름표)는 `Stage` 밖에 둔다 (04 5절 규칙 5).

still: `out/stills/S09-0000.png` · `S09-0420.png` · `S09-0620.png`. 새 배치라 **먼저 0420 한 장**을 뽑아 보고하고, meta 가 배치를 본 뒤 나머지를 뽑아도 된다 (04 7절 4).

보고 항목은 앞과 같다. 커밋하지 않는다. `remotion/` 안에만 쓴다.

## 지난 지시 (S07 통과 뒤)

먼저 하나 (`review/2026-09-15-C7-scene.md`): S07 `enqueue #12` 칩을 봉투가 CLI 에 닿는 150 에 `#12 delivered` 로. still 다시 뽑을 필요 없음.

그 다음 **S08 — 일이 되는 모습, 들이기 한 건 (960 프레임)**. 03 장면 8 비트 표 그대로: `viewer="김과제"` 새 화면 → `yield.csv` 첨부 + `@TO(prodev-수율개선-bot) 어제 라인 3 자료입니다` → 왕복 압축(POST · 칩 `#12 📎` `#12 → bot` `enqueue #12` · SSE) → **겉봉투 ENVELOPE_8 크게, 첨부 경로 줄(3) 강조** → CLI 로 · working → CLI 속 `prodev-orchestrator (분기표)` → `→ intake` lit → `node ../../scripts/intake-copy.js 라인3 <경로>` 이름표 · `yield.csv` 카드가 과제 폴더로 내려감 · 과제 폴더 나무 `inbox/2026-09-15-라인3/` · `yield.csv 🔒 0444` · `files.md (SHA-256)` → 봇 답 BOT_8A (reply · `#13 bot` · SSE) · `cards/E-0001.md` 카드 내려감 · `status: draft` → `@TO(prodev-수율개선-bot) 확정` 왕복 압축(`#14`) → CLI 나무 `reply → [카드] E-0001 …` · `PreToolUse · pre-reply.js` lit · chat.db 로 **읽기 전용 점선** `readOnly: true` → 조명(chat.db + 검사 상자) · CHECK_8 (줄마다 ✓) · `exit 0` → 과제 폴더 `status: valid` lit · `index.md · index.json (index.js)` · `git commit` · `index.js` 카드 이동 → 방에 `[카드] E-0001 · 라인 3 수율 · cards/E-0001.md` · CLI idle. frame 0 = S07 끝(CLI 나무 11줄 + Bash 줄은 지운다 · 칩들 · MCP 이름표). CLI 속 나무는 03 대로 새 줄을 위에서부터 다시 쓴다(실린 것 11줄은 S08 부터 접어 `실린 것 (CLAUDE.md · skills 15 · agents 6 · settings 두 장)` 한 줄로 — meta 결정, 자리 확보).

still: `out/stills/S08-0000.png` · `S08-0740.png` · `S08-0900.png`.

보고 항목은 앞과 같다. 커밋하지 않는다. `remotion/` 안에만 쓴다.

## 지난 지시 (S06 통과 뒤)

먼저 셋 (`review/2026-09-15-C6-scene.md`):
① `Pillar` 부품: 상태 글자(`일하는 중 working` 등)를 제목 줄이 아니라 **부제 줄 오른쪽 끝**(mono 14, 오른쪽 정렬)에 둔다. 제목 띠는 100~160 고정, 제목은 한 줄. → `S06-0720.png` 다시.
② reply · fetch_history 화살표 끝 x 1118 → **1140** (MCP 이름표 글자에 닿지 않게). S06 에 적용.
③ 조종석 판 상태 글자는 CLI 상태를 따라간다: working → `일하는 중`, waiting → `승인 대기`, idle → `대기`. S06 560~740 에 `일하는 중`. 봇 칩 `(입력 중…)` 은 안 쓴다.

그 다음 **S07 — 따라잡기와 승인 카드 (600 프레임)**. 03 장면 7 비트 표 그대로: frame 0 에 사람끼리 글 둘(`김과제 📎 yield.csv 어제 라인 3 자료입니다` · `김피엘 B 로트가 낮네요`) 이미 있음, chat.db 칩 `#10 📎` `#11`, 편지함 비어 있음 → `@TO(prodev-수율개선-bot) 위 파일 봐 주세요` 보내기 → 장면 6 의 길 압축(POST → 칩 셋 → 봉투 칩 → CLI working) → `mcp__cockpit__fetch_history` 화살표 + chat.db 읽기 점선 `chat_id=1 · since_id` → HISTORY_7 결과 상자(`attachments` 줄 강조) → CLI 로 → 봇 답 `이렇게 이해했습니다 — 글 2개 · yield.csv` → CLI 속 `Bash(curl --version)` → `canUseTool` 화살표 → CLI `waiting`(human 색) · cockpit.db `permission_requests` 줄 + 칩 `Bash` · 방에 `🔒 Bash 요청 · curl --version` · SSE `permission_request` → 승인 카드(허용 · 이번 세션 허용 · 거부) · `⏳ 10분` · `허용` 누름 → `POST /api/permissions/:toolUseId` → `allow` 화살표 → CLI working · `✅ 김피엘 허용 · Bash`. frame 0 = S06 끝 (봇 답 · `B 로트가 낮네요` 는 이 장면 frame 0 의 글 둘로 이어진다 — 03 대로 새 화면이면 그대로).

still: `out/stills/S07-0000.png` · `S07-0260.png` · `S07-0500.png`.

보고 항목은 앞과 같다. 커밋하지 않는다. `remotion/` 안에만 쓴다.

## 지난 지시 (S05 통과 뒤)

먼저 셋 (`review/2026-09-15-C5-scene.md`):
① S05 hooks 읽기 점선 경로를 기둥 사이 틈으로: (1460,225) → (1250,225) → (1250,660) → (640,660) → (640,835) → (600,835). `Arrow` 에 `points?: Point[]` 를 더해도 된다. 이름표는 첫 가로 구간 가운데. → `S05-0350.png` 다시.
② 뿌리 카드 넷(rootCards)을 S03 에서 prodev 상자가 밝아질 때(300~330) 함께, S04 는 frame 0 부터. → `S03-0600.png` · `S04-0000.png` 다시.
③ (없음)

그 다음 **S06 — 글 한 번 왕복 (960 프레임)**. 03 장면 6 비트 표 그대로: `@` 자동완성(TO 한 줄) → `@TO(prodev-수율개선-bot) 안녕하세요` Enter → POST + 글 카드 이동 → chat.db 칩 둘 · cockpit.db `enqueue #7` → SSE 로 내 글 → 서버 이름표 `#kick` · `pendingInbox` · `wrapChannel` → **겉봉투 ENVELOPE_6 가 가운데 크게** (전체 조명) → 봉투가 CLI 입력 흐름으로(`input.push`, 칩 `delivered`) → CLI `working` → `mcp__cockpit__reply` 화살표가 서버 MCP 상자로 → `insertBotMessage` · chat.db `#8 bot` · `onBotMessage` → SSE → 화면에 BOT 답 → `idle` → 마지막: 봉투 없는 글 `B 로트가 낮네요` 는 chat.db 까지만, `bot_inbox 줄 없음`. frame 0 = S05 끝(실린 것 11줄 · 닻줄 1 · 뿌리 카드 · 봇 폴더 나무). MCP_BOX 이름표는 S02 처럼 장면이 `Label` 로 놓는다.

still: `out/stills/S06-0000.png` · `S06-0400.png` · `S06-0720.png`.

보고 (판단 문장 없이): 장면 번호 · 파일 · DURATION · still 경로 · 그대로 못 옮긴 줄과 대신한 것 · 표에 없어 정하지 않고 둔 것 · 숫자 직접 쓴 자리 수 · text.ts 새 상수 · still 경고. 커밋하지 않는다. `remotion/` 안에만 쓴다.

## 지난 지시 (S04 통과 뒤)

먼저 S04 에 셋 (`review/2026-09-15-C4-scene.md`): ① CLI 속 옵션 상자(0.4배)는 660~700 에 사라진다 ② cockpit.db `agent_sessions` 칩 660 에 `stopped` → `idle` ③ 조종석 판 단추 700 부터 `끄기`. 고친 뒤 `S04-0760.png` 만 다시.

그 다음 **S05 — 닻줄, cwd 로 물고 들어간다 (660 프레임)**. 03 장면 5 비트 표 그대로: 닻줄 0.35→1 걸림 · 봇 폴더 glow → 설정 두 장이 CLI 속으로 올라가 줄이 펼쳐짐(hooks 셋 · env · allow 22 · deny 10 · additionalDirectories 3) → `hooks` 줄에서 `common/hooks` 카드로 읽기 점선(절대 경로) → 닻줄이 `bots/` · `prodev/` 로 오르는 빛(climb) + 이름표 둘 → 뿌리 셋(CLAUDE.md · skills 15 · agents 6)이 CLI 속으로 → `복사 없음 · 링크 없음` + 봇 폴더 속 `.claude/` 설정 두 장뿐 조명 → 조명 걷힘. frame 0 = S04 끝(옵션 상자 없음 · 칩 idle · 단추 끄기).

still: `out/stills/S05-0000.png` · `S05-0350.png` · `S05-0620.png`.

보고 (판단 문장 없이): 장면 번호 · 파일 · DURATION · still 경로 · 그대로 못 옮긴 줄과 대신한 것 · 표에 없어 정하지 않고 둔 것 · 숫자 직접 쓴 자리 수 · text.ts 새 상수 · still 경고. 커밋하지 않는다. `remotion/` 안에만 쓴다.

## 지난 지시

- S04 — 통과, 셋 고침 (`review/2026-09-15-C4-scene.md`)

- C-0: theme · stage · anim · text · 부품 15 · 무대 still 둘 — 통과 (`review/2026-09-15-C0-stage.md`)
- S01~S03 — 통과, 상수 둘 고침 (`review/2026-09-15-C1-3-scenes.md`)
