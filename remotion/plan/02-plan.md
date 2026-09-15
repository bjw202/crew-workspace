# 기획 — cockpit + prodev 구조 영상

기준 판: prodev `00feaa0` · cockpit `ab77880` (2026-09-15).

**1차 자료는 README 셋이다.** 루트 `README.md`(전체 지도 · cockpit↔prodev · 방 만들기 · 켜기 · 스킬은 cwd 로), `cockpit/README.md`(조각 그림 · 글 흐름 · 시나리오), `prodev/README.md`(전체 구조 · 워크플로우 ①~⑧ · 방 만들기 흐름). 세 문서 안의 mermaid 그림은 사람이 검증한 시각 모델이고, 이 기획의 시각 모델과 장면 순서는 그 그림들을 옮긴 것이다. 장면마다 어느 README 의 어느 절·그림을 옮겼는지 4절 "README 대응" 에 적었다.

사실은 `01-facts.md` 에 있거나 README 셋에 있거나, 아래에 `(경로:줄)` 을 붙여 코드에서 확인한 것만 썼다. 경로의 `cockpit/…` 은 `crew-workspace/cockpit/`, `prodev/…` 는 `crew-workspace/prodev/` 기준이다.

**용어는 README 의 것을 그대로 쓴다.** 봇(과제 하나를 맡는 AI 비서. prodev README 는 "비서" 라고 부른다) · 방 · 봉투(`@TO` · `@CC`) · 겉봉투(`<channel …>`) · 편지함(`bot_inbox`) · 조종석 판 · 켜기 · 따라잡기 · 들이기 · 카드 · 확정 · 도우미(`.claude/agents/` 의 서브에이전트 여섯) · 훅 · 하네스 · 인수인계서(`handoff-compact.md`) · 굳다 · "이어서 합니다".

## 1. 한 줄 요지

> **cockpit 서버가 봇 폴더를 cwd 로 Claude Code CLI 를 한 번 켜 두고, 사람의 `@TO` 글을 겉봉투에 싸서 넣어 주면, 그 CLI 가 두 층 위 prodev 의 지침·스킬·훅으로 일하고 과제 폴더의 파일에 기억을 남긴다 — 그래서 압축되고 꺼져도 "이어서 합니다".**

영상이 끝났을 때 독자가 이 문장을 자기 말로 다시 할 수 있으면 된다. 문장의 앞 절반(서버·cwd·봉투)이 영상의 앞 2/3, 뒤 절반(prodev·파일·이어짐)이 마지막 1/3 이다. 루트 README 2절의 한 줄 "cockpit 은 창구이자 세션을 켜 두는 손, prodev 는 봇의 머리와 규칙이다" 를 동사로 풀어 쓴 것이다.

## 2. 시각 모델 — 세 기둥과 바닥

화면을 **세로 기둥 셋**과 **바닥 하나**로 고정한다. 영상 내내 자리를 바꾸지 않는다.

```
 ┌──────────┐    ┌──────────────┐    ┌──────────────┐
 │ 브라우저  │──▶│ cockpit 서버  │──▶│ Claude Code  │   ← 기둥 셋. 왼쪽=사람, 가운데=서버, 오른쪽=CLI 프로세스(봇)
 │ (사람)   │◀──│  chat.db     │◀──│ CLI (봇)     │
 │          │   │  cockpit.db  │    │              │
 └──────────┘    └──────────────┘    └──────┬───────┘
 ═══════════════════════════════════════════╪══════════════════  ← 바닥 = 디스크
   [prodev 저장소 ┌ CLAUDE.md · .claude/skills 15 · .claude/agents 6 · common/hooks ┐ ]   [과제 폴더 projects/수율개선]
                 └ bots/prodev-수율개선-bot (settings.json · settings.local.json) ┘
```

- **왼쪽 기둥 = 브라우저.** 사람이 글을 쓰고 조종석 판의 단추를 누르는 자리. HTTP `/api/*` 로 서버에 보내고 SSE `/api/stream` 으로 받는다.
- **가운데 기둥 = cockpit 서버.** 기둥 아래에 원통 둘(`chat.db` · `cockpit.db`)이 박혀 있다. 모든 화살표가 이 기둥을 지난다.
- **오른쪽 기둥 = Claude Code CLI 프로세스 = 봇.** 기둥 밑에서 바닥으로 **닻줄(cwd)** 이 내려가 봇 폴더에 걸려 있다.
- **바닥 = 디스크.** prodev 저장소 상자(그 안에 봇 폴더)와 과제 폴더가 나란히 놓여 있다. 마지막 1/3 에서는 카메라가 이 바닥으로 내려간다.

### 이 모델은 README 그림 셋을 하나로 겹친 것이다

| README 그림 | 무엇을 보여 주나 | 이 모델에서 어디인가 |
|---|---|---|
| 루트 README 2절 `flowchart LR` "누가 어느 파일과 DB 를 갖고, 무엇이 무엇을 부르는지" | 사람 → 브라우저 ↔ cockpit 서버 ↔ Claude Code CLI 의 가로 사슬, 서버 밑의 DB 둘, `prodev 저장소` 상자 안의 봇 폴더, 옆의 과제 폴더 | **기둥 셋 + 바닥 그대로.** 가로 사슬이 기둥 셋, `subgraph PR` 이 바닥의 prodev 상자, `C -->|cwd| BF` 가 닻줄이다 |
| cockpit README 0절 `flowchart LR` "cockpit 을 이루는 조각" | 브라우저 · 서버 · DB 둘 · 세션 관리자 · `query()` · CLI · MCP 도구 · setup.js · 과제 폴더 · 봇 폴더 | 가운데 기둥의 **속**(세션 관리자 · MCP 도구 상자)과 바닥으로 내려가는 setup.js |
| prodev README "전체 구조" `flowchart LR` | 사람 ↔ cockpit 서버 ↔ 비서 세션, `prodev 저장소가 비서에게 주는 것`(지침·스킬·도우미 / 훅 / 스크립트), 과제 폴더 ↔ 비서 양방향 | 바닥의 prodev 상자 속 **셋으로 나뉜 칸**과, 마지막 1/3 에서 카메라가 내려가는 과제 폴더 |
| `cockpit/docs/ARCHITECTURE_EXPLANATION.md` 3절 그림 1 | 같은 사슬. "브라우저와 CLI 사이에 선이 없다" | 왼쪽·오른쪽 기둥이 닿지 않는 구도의 근거 |

왜 이 모델인가, 세 줄:
1. **브라우저와 CLI 사이에 선이 없다**는 사실이 화면 구도 자체로 보인다. 루트 README 2절 읽는 법 첫 줄 · ARCHITECTURE_EXPLANATION 3절 읽는 법이 똑같이 짚는 점이다. 왼쪽과 오른쪽 기둥은 닿지 않고, 가운데 서버만 둘을 잇는다 (`cockpit/src/session/manager.js:81-92` 의 `postUserMessage` 가 유일한 입구).
2. **기억은 프로세스가 아니라 바닥에 있다**는 것이 압축·재시작 장면에서 그림으로 증명된다. prodev README 첫 그림("파일로 남는 기억 → 되살아난다")과 "세션이 꺼져도 파일은 남는다" 문장을 구도로 만든 것이다.
3. **cwd 로 위로 올라간다**는 추상이 닻줄 하나로 구체가 된다. 루트 README 4절 `flowchart TB`(봇 폴더 → `prodev/bots` → prodev 뿌리)를 세로로 그대로 쓴다.

## 3. 장면 목록

| # | 제목 | 초 | 항목 | 화면에 보이는 것 한 줄 | 화살표 문장 | 화면에 나오는 실제 이름 | 자막 (두 문장 이내) |
|---|---|---|---|---|---|---|---|
| 1 | 세 기둥과 바닥 | 12 | ① | 빈 무대에 기둥 셋과 바닥이 차례로 선다 | 브라우저가 → 서버에게 → HTTP 로 보내고, 서버가 → CLI 에게 → 글을 넣는다 | `node bin/cockpit.js serve` · `/api/stream` | 웹 앱 하나가 Claude Code CLI 를 봇으로 켜 둔다. 브라우저와 CLI 사이에 선은 없다. |
| 2 | 서버 안의 두 DB 와 SSE | 18 | ① | 가운데 기둥이 열리며 원통 둘과 표 이름이 보이고, SSE 가 왼쪽으로 계속 흐른다 | 서버가 → chat.db 에 → 방·글을 쓰고, 서버가 → cockpit.db 에 → 편지함·세션·승인을 쓴다 | `chat.db` (`rooms` · `messages` · `message_targets`) · `cockpit.db` (`bot_inbox` · `agent_sessions`) · `POST /api/*` · `SSE /api/stream` | 대화는 chat.db, 봇 편지함과 세션은 cockpit.db 에 적힌다. 서버에서 브라우저로는 SSE 한 줄이 계속 흐른다. |
| 3 | `+` 하나가 폴더 둘을 만든다 | 22 | ④ ⑤ | 사이드바 `+` → 서버가 바닥으로 setup.js 를 내려보내 과제 폴더와 봇 폴더가 생기고, 그 뒤에야 DB 에 줄이 박힌다. 봇 칩은 ⚪ | 서버가 → setup.js 에게 → `--project 수율개선` 을 넘기고, setup.js 가 → 바닥에 → 폴더 둘과 설정 두 장을 쓴다 | `POST /api/rooms` · `createRoom` · `scripts/setup.js` · `projects/수율개선/` · `bots/prodev-수율개선-bot/.claude/settings.json` · `settings.local.json` · `agent_sessions` `stopped` | 방 하나 = 과제 하나 = 봇 하나. setup.js 가 먼저 성공해야 DB 에 방이 생기고, 그래도 봇은 아직 꺼져 있다. |
| 4 | 켜기 — `query()` 한 번 | 28 | ② | 조종석 판 `켜기` → 서버 안에서 옵션 상자가 조립되어 오른쪽으로 던져지고, 오른쪽 기둥에 CLI 프로세스가 켜진다 | 서버가 → SDK 의 `query()` 에게 → `cwd` · `settingSources` · `mcpServers` · `allowedTools` · `canUseTool` · `resume` 을 넘기고, SDK 가 → CLI 프로세스 하나를 → 띄운다 | `manager.start` · `buildQueryOptions` · `query({ prompt, options })` · `cwd: botDir` · `settingSources: ['project','local']` · `allowedTools: ['mcp__cockpit__reply','mcp__cockpit__fetch_history']` · `systemPrompt.append` · `sdk-query.js` | 서버가 CLI 에 넘기는 것은 query() 옵션 하나뿐이다. 어느 폴더에서, 어느 설정만 읽고, 앞 대화에 이어서 켜라. |
| 5 | 닻줄 — cwd 로 물고 들어간다 | 22 | ⑤ | 오른쪽 기둥에서 닻줄이 바닥의 봇 폴더에 걸리고, 거기서 한 층·두 층 위로 올라가 prodev 뿌리의 셋을 끌어 올린다. 설정 두 장은 봇 폴더에서 바로 | CLI 가 → 봇 폴더에서 → 설정 두 장을 읽고, CLI 가 → 두 층 위 prodev 뿌리에서 → CLAUDE.md · 스킬 15 · 도우미 6 을 읽는다 | `bots/prodev-수율개선-bot` → `bots/` → `prodev/` · `CLAUDE.md` · `.claude/skills` (15) · `.claude/agents` (6) · `settings.json` (`hooks` · `env`) · `settings.local.json` (`allow` 22 · `additionalDirectories` 3) · `common/hooks/*.js` | 복사도 링크도 없다. 봇 폴더가 prodev 안에 있다는 자리 자체가 스킬을 받는 법이다. |
| 6 | 글 한 번 왕복 | 32 | ③ | `@TO(…) 안녕하세요` 한 줄이 왼쪽에서 출발해 chat.db → 편지함 → 겉봉투 → CLI 로 가고, `reply` 로 되돌아와 방에 뜬다. 봉투 없는 글은 가운데에서 멈춘다 | 사람이 → 서버에게 → `@TO` 글을 보내고, 서버가 → 편지함 `bot_inbox` 에 → 한 줄 넣고, 서버가 → CLI 에게 → `<channel>` 겉봉투를 밀어 넣고, CLI 가 → 서버의 `reply` 도구에게 → 답을 주고, 서버가 → 브라우저에게 → SSE 로 띄운다 | `POST /api/rooms/:id/messages` · `messages` · `message_targets` · `enqueue` → `bot_inbox` · `#kick` · `pendingInbox` · `wrapChannel` · `<channel source="cockpit" chat_id="1" delivery="to" …>` · `→ delivery="to"로 받은 메시지에는 반드시 reply 도구로 답변하세요.` · `mcp__cockpit__reply` · `insertBotMessage` | 봉투가 붙은 글만 겉봉투에 싸여 봇에게 간다. 봇이 방에 말하는 길은 reply 하나뿐이다. |
| 7 | 따라잡기와 승인 카드 | 20 | ③ ④ | 사람끼리 나눈 글 둘은 CLI 로 안 갔다가, `@TO 위 파일 봐 줘` 뒤에 CLI 가 `fetch_history` 로 끌어온다. 이어 CLI 가 `Bash(curl …)` 를 들자 서버가 조종석 판에 승인 카드를 띄운다 | CLI 가 → 서버의 `fetch_history` 에게 → `chat_id` 를 주고 지난 글과 첨부 경로를 받는다. CLI 가 → 서버에게 → `canUseTool` 로 묻고, 서버가 → admin 에게 → 승인 카드를 띄운다 | `mcp__cockpit__fetch_history` · `{ cursor, messages:[…, attachments ] }` · `canUseTool` · `waiting_approval` · `🔒 Bash 요청` · `permission_requests` · 10분 | 봇은 부른 글의 첨부만 바로 받고 나머지는 fetch_history 로 따라잡는다. 허용 목록 밖 도구는 admin 의 승인 카드를 기다린다. |
| 8 | 일이 되는 모습 — 들이기 한 건 | 32 | ④ ⑦ | `yield.csv` 첨부 글 → 겉봉투에 절대 경로 → CLI 가 `intake-copy.js` 로 inbox 에 잠그고 → 표와 물음 셋 → 사람 "확정" → 훅이 chat.db 를 들여다보고 → 카드 `valid` → `index.js` → git → `[카드] E-0001 …` | 서버가 → CLI 에게 → 첨부 경로가 든 겉봉투를 주고, CLI 가 → 과제 폴더에 → `inbox/` 와 `cards/E-0001.md` 를 쓰고, 사람이 → 방에 → "확정" 을 쓰고, `pre-reply.js` 가 → chat.db 를 → 읽어 확정 글을 확인한다 | `(첨부 파일 경로: …/uploads/…-yield.csv)` · `intake` · `intake-copy.js` · `inbox/` 0444 · `E-0001 로 만들겠습니다. 맞으면 '확정'` · `@TO(…) 확정` · `pre-reply.js` · `status: valid` · `index.js` · `git commit` · `[카드] E-0001 · … · cards/E-0001.md` | 봇은 "이렇게 읽었습니다" 표를 보이고 셋까지만 묻는다. 사람이 "확정" 이라 해야 카드가 확정되고, 그것을 지침이 아니라 훅이 DB 로 확인한다. |
| 9 | 스킬 · 훅 · 도우미 — 한 턴의 시계 | 28 | ⑥ | 오른쪽 기둥 옆에 세로 시간축. 켜질 때 `SessionStart`, 글이 오면 CLAUDE.md → 분기표 → 스킬 하나, 큰 파일이면 `Agent` 로 도우미가 옆 칸에서 돌고, `reply` 직전에 `PreToolUse`, 문맥이 차면 `PreCompact` | `session-start.js` 가 → CLI 문맥에 → 여덟 절을 싣고, CLAUDE.md 가 → CLI 에게 → `prodev-orchestrator` 부터 보라 하고, 분기표가 → 말 한마디를 → 스킬 하나로 보내고, `pre-reply.js` 가 → reply 를 → exit 2 로 되돌린다 | `SessionStart` `startup\|resume\|clear\|compact` · `prodev-orchestrator/SKILL.md` 분기표 · `intake` · `find` · `analysis` · `retro` · `Agent` → `data-reader` · `reviewer` · `PreToolUse` `matcher: mcp__cockpit__reply` · `exit 2` · `PreCompact` `timeout 180` | 스킬은 말이 올 때 골라지고, 도우미는 스킬이 부르며, 훅은 정해진 순간에 반드시 돈다. 막힌 답은 이유 한 줄과 함께 되돌아온다. |
| 10 | 바닥 — 지식이 쌓이고 찾힌다 | 28 | ⑦ | 카메라가 과제 폴더로 내려간다. `inbox/` → `cards/` → `wiki/` → `index.md` 층이 쌓이고, 옆에 `charter.md` · `schedule.md` · `journal/` · `house.md`. 물음 하나가 `find.js` 여섯 층을 위에서 아래로 훑다 카드에서 멈추고 `find.log` 에 한 줄 남는다 | 봇이 → `cards/` · `wiki/` 에 → 쓰고, `index.js` 가 → `index.md` · `index.json` 을 → 다시 만들고, `find.js` 가 → 색인 → 카드 → 위키 → 헌장·일정 → `files.md` → 대화 순으로 → 찾아 출처를 붙인다 | `inbox/<날짜>-<주제>/files.md` · `cards/E-0001.md` · `wiki/` · `index.md` · `index.json` · `charter.md` · `schedule.md` · `journal/<날짜>.md` · `house.md` · `scripts/find.js` 층 ①~⑥ · `find.log` | 봇의 기억은 대화가 아니라 과제 폴더의 파일이다. 물으면 답이 떠올라도 find.js 를 먼저 돌려 출처를 붙인다. |
| 11 | 압축 — 문맥은 캐시, 파일이 진실 | 28 | ⑧ | 오른쪽 기둥의 문맥 막대가 차오른다. `PreCompact` 가 기록 꼬리를 잘라 `claude -p` 에 보내고 인수인계서 `handoff-compact.md` 여섯 칸이 봇 폴더에 떨어진다. 기둥이 비워지고, `SessionStart(compact)` 가 바닥에서 여덟 절을 다시 끌어 올린다. 방에 두 줄 알림 | `pre-compact.js` 가 → `claude -p --model sonnet` 에게 → 마지막 40턴을 주고, 그 답을 → 봇 폴더 `handoff-compact.md` 에 → 쓴다. `session-start.js` 가 → 새 문맥에 → 인수인계서부터 house.md 까지 여덟 절을 싣는다. 서버가 → 방에 → "정리 중" · "정리 끝" 을 올린다 | `PreCompact` · `pre-compact.js` · 40턴 · `claude -p --model sonnet` · `handoff-compact.md` (하던 일 · 방과 마지막 message_id · 사람이 기다리는 것 · 미해결 질문 · 다음 한 걸음 · 열어 둔 파일) · `/compact` · `SessionStart` `compact` · `[깨어남: compact]` · "이어서 합니다" | 압축 직전에 인수인계서를 파일로 떨구고, 압축 뒤에 훅이 파일에서 다시 싣는다. 첫 마디는 "이어서 합니다". |
| 12 | 껐다 켜도 — 이어 붙기(resume) | 16 | ⑧ | 서버 창 Ctrl-C 로 오른쪽 기둥이 꺼진다. cockpit.db 의 `session_id` 와 편지함의 밀린 글은 남는다. `serve` → `bootResume` → 같은 번호로 새 프로세스 → 밀린 글 배달 | 서버가 → `cockpit.db` 에서 → `session_id` 를 읽고, 서버가 → `query()` 에게 → `resume` 으로 넘기고, 서버가 → 새 CLI 에게 → `bot_inbox` 의 밀린 글을 넣는다 | `Ctrl-C` · `release` · `agent_sessions.session_id` · `bootResume` · `resume: <session_id>` · `SessionStart` `resume` · `pendingInbox` | 프로세스는 바뀌어도 대화 번호는 같다. 꺼진 동안 온 글은 편지함에 남았다가 켜지면 들어간다. |
| 13 | 쓸수록 맞아 간다 — 굳는 길과 회고 | 26 | ⑨ | "앞으로 회의 문서는 이 양식대로" → 봇이 범위를 한 줄 되묻고 → `templates/` 에 파일. "돌아봐" → `retro` 가 `journal/*.md` 와 `find.log` 를 읽어 제안 셋(원본 경로 · 들어갈 문장 · 까닭) → 사람 "앞으로" → `house.md` 에 한 줄. 다음 켜기 때 여덟째 절로 실린다 | 사람이 → 봇에게 → "앞으로" 를 말하고, 봇이 → 과제 폴더에 → `house.md` · `templates/` · `analysis/methods/` 를 쓰고, `retro` 가 → `journal/` · `find.log` 를 → 읽어 후보를 내고, `session-start.js` 가 → 다음 문맥에 → `house.md` 를 싣는다 | "앞으로" · "이번에는" · `house.md` (상한 50줄 · 언제부터 · 누가 · 무엇을 보고) · `templates/` · `analysis/methods/` · `retro` · `journal/*.md` · `find.log` · `## 되풀이된 말` | "앞으로" 라고 말한 것만 파일로 굳고 "이번에는" 은 굳지 않는다. 회고는 일지와 find.log 를 읽어 제안까지만 한다. |
| 14 | 어디를 고치면 봇이 달라지나 | 21 | ⑨ | 바닥 전체가 다시 보이고, 고칠 수 있는 자리 일곱에 불이 들어온다. 봇 손이 훅·스크립트·설정에 닿으면 `deny` 로 튕기고, 옆에서 prodev 제작 세션이 PR 로 넣는다. 마지막에 세 기둥과 바닥 전경으로 돌아간다 | 사람이 → prodev 뿌리에 → 스킬 · 도우미 · 훅을 PR 로 넣고, CLI 가 → 다음 켜기 때 → 그것을 cwd 로 읽는다. 봇이 → 과제 폴더에만 → house.md · templates/ 를 쓴다 | `CLAUDE.md` · `.claude/skills/<이름>/SKILL.md` · `.claude/agents/<이름>.md` · `common/hooks/*.js` · `settings.local.json` (`allow` · `deny`) · `house.md` · `templates/` · `deny: Edit(…/common/hooks/**)` · PR | 전 봇 공통은 prodev 뿌리에 PR 로, 이 과제만의 것은 과제 폴더에 봇이 쓴다. 봇은 자기 훅과 설정을 못 고친다. |

**합계 333초 (5분 33초).** 장면 1~5 가 102초(cockpit 프레임워크), 6~8 이 84초(봇 만들기와 대화), 9~14 가 147초(prodev 안쪽). (장면 14 는 처음 18초였다. 콘티 관문에서 마무리 요지 자막이 짧아 meta 가 21초로 늘렸다 — `review/2026-09-15-B-storyboard.md`.)

항목별 자리: ① 1·2 / ② 4 / ③ 6·7 / ④ 3·7·8 / ⑤ 3·5 / ⑥ 9 / ⑦ 8·10 / ⑧ 11·12 / ⑨ 13·14.

장면 순서는 README 셋의 읽는 순서를 따른다. 루트 README 의 2절(관계) → 3.1(만들기) → 3.2(켜기) → 4절(스킬은 cwd 로) 이 장면 1~5, cockpit README 5절(글 하나가 가는 길)과 시나리오 2·4 가 장면 6~7, 루트 README 1절 "이야기 하나" 와 prodev README 워크플로우 ② 가 장면 8, prodev README 워크플로우 ① · ⑤ · ③ · ⑥ · ⑦ 이 장면 9~13, 루트 README 6절과 prodev README "자리" 가 장면 14 다.

## 4. 장면별 상세

### 장면 1 — 세 기둥과 바닥 (12초, ①)

**무엇을 보여 주나.** 빈 화면에 왼쪽 기둥(브라우저 창 모양), 가운데 기둥(터미널에 `node bin/cockpit.js serve` 한 줄), 오른쪽 기둥(CLI 프로세스, 아직 꺼진 회색)이 차례로 선다. 바닥이 깔리고 그 위에 prodev 상자와 과제 폴더 자리만 희미하게 보인다. 왼쪽→가운데로 짧은 화살표(`POST /api/*`)와 가운데→왼쪽으로 끊이지 않는 점선(`SSE /api/stream`)이 흐른다. 가운데→오른쪽은 아직 비어 있다. 왼쪽과 오른쪽 기둥 사이 빈 공간이 눈에 띄게 넓다.

**왜 이 순서인가.** 이 장면이 영상의 좌표계다. 이후 모든 장면이 이 세 기둥 위에서만 움직이므로, 독자가 "지금 화면의 어느 자리가 무엇인지" 를 한 번에 익히고 시작해야 한다.

**README 대응.** 루트 README 2절 `flowchart LR` 을 세로 기둥으로 세운 것. 읽는 법 첫 줄 "브라우저와 CLI 사이에는 선이 없다. 세션에 말을 거는 쪽은 서버 하나다" 가 이 장면의 구도다. cockpit README 0절 읽는 법 첫 줄("가운데 cockpit 서버가 모든 길의 한가운데") 도 같다. 루트 README 0.2 낱말 "HTTP 길 · SSE" 가 두 화살표의 이름이다.

**근거.** `01-facts.md` 0절 (서버 · 포트 · HTTP + SSE · query() 로 봇마다 CLI 하나). `cockpit/src/session/manager.js:81-92` (`postUserMessage` — 사람 글이 세션에 닿는 유일한 입구가 서버 안이라는 근거).

**넣지 않은 것과 이유.** 계정 · 로그인 · 쿠키. 구조 이해에 필요 없고 첫 장면을 무겁게 한다. 루트 README 1절의 저장소 일곱 그림(meta · minidiscord · crew · knowledge)도 뺐다. 이 영상은 cockpit 과 prodev 둘의 맞물림만 다룬다.

### 장면 2 — 서버 안의 두 DB 와 SSE (18초, ①)

**무엇을 보여 주나.** 가운데 기둥이 옆으로 열린다. 안에 원통 둘이 보인다. 왼쪽 원통 `chat.db` 에 표 이름 `rooms` · `messages` · `message_targets` 가, 오른쪽 원통 `cockpit.db` 에 `bot_inbox`(편지함) · `agent_sessions` 가 붙는다. 브라우저에서 `POST` 화살표 하나가 오면 서버가 chat.db 에 줄을 쓰고, 곧바로 SSE 선 위에 작은 사건 하나(`message`)가 실려 왼쪽으로 간다. 오른쪽 기둥은 여전히 꺼져 있다.

**왜 이 순서인가.** 장면 6 의 왕복을 이해하려면 "글은 chat.db, 봇에게 갈 줄은 cockpit.db 의 편지함" 을 미리 알아야 한다. 또 SSE 가 "서버가 계속 밀어 주는 한 줄" 이라는 감각을 여기서 심어 둬야 뒤에서 답이 방에 뜨는 것이 설명 없이 이해된다.

**README 대응.** cockpit README 0절 그림의 원통 둘(`chat.db 방 · 글 · 첨부` / `cockpit.db 계정 · 큐 bot_inbox · 세션 · 승인`)과 읽는 법 둘째 줄("원통 모양 둘은 파일 하나짜리 DB"). 루트 README 2절 접힌 표 "누가 무엇을 소유하나" 의 `chat.db` · `cockpit.db` 두 줄. 루트 README 0.2 낱말 "편지함 · 사건". 루트 README 2절 읽는 법 셋째 줄 "cockpit.db 에는 계정 · 비밀번호 해시 · 승인 기록이 있어서 봇 설정에서 읽기 · 쓰기를 막았다" 는 장면 14 로 미룬다.

**근거.** `01-facts.md` 0절 (DB 둘의 역할) · 3절 (`messages` + `message_targets` 한 트랜잭션 · `enqueue` → `bot_inbox`). `cockpit/src/session/manager.js:86-88` (`insertUserMessage` 뒤 `enqueue`, `emit('message')`). `cockpit/src/rooms/create.js:106` (`createAgentSession` 이 `agent_sessions` 에 쓴다).

**넣지 않은 것과 이유.** `accounts` · `permission_requests` · `session_events` 표 이름. 화면에 표 이름이 다섯을 넘으면 읽히지 않는다. 승인 표는 장면 7 에서 한 번만 이름을 보인다.

### 장면 3 — `+` 하나가 폴더 둘을 만든다 (22초, ④ ⑤)

**무엇을 보여 주나.** 왼쪽 사이드바 `+` 를 누르고 `수율개선` 을 친다. `POST /api/rooms` 가 서버에 닿고, 서버 안에서 `createRoom` 이 이름을 검사한 뒤 **바닥으로** 작은 프로세스(`node scripts/setup.js --project 수율개선 --cockpit cockpit.json`)를 내려보낸다. 바닥의 prodev 상자 안에 봇 폴더 `bots/prodev-수율개선-bot/` 가 생기고 그 안에 `.claude/settings.json` · `.claude/settings.local.json` 두 장이 떨어진다. 옆에 과제 폴더 `projects/수율개선/` 이 생기며 하위 폴더 12 · `house.md` 골격 · `.git` 이 채워진다. setup 이 `exit 0` 을 돌려주면 **그제서야** chat.db 에 `rooms` · `bots` 한 줄씩, cockpit.db 에 `agent_sessions` 한 줄(`stopped`)이 박히고 SSE `room_created` 가 왼쪽으로 간다. 사이드바에 `# prodev-수율개선` 이 뜨고 봇 칩은 ⚪.

**왜 이 순서인가.** 봇을 켜기 전에 "봇 폴더가 prodev 상자 **안**에 있다" 는 자리를 눈으로 박아 둬야 장면 5 의 닻줄이 설명 없이 이해된다. 또 "폴더 먼저, DB 나중" 은 이 시스템의 성격(파일이 진실)을 처음 보이는 자리다.

**README 대응.** 루트 README 3.1 `sequenceDiagram`(`+` → `POST /api/rooms` → `createRoom` 검사 → `setup.js` → 과제 폴더 · 봇 폴더 → `alt` 실패/성공 → DB 두 줄 → `201 · SSE room_created`)을 시간 순 그대로 옮긴다. 읽는 법 "눈여겨볼 점은 순서다. setup.js 가 먼저 성공해야 방과 봇이 DB 에 생긴다" 가 자막이다. prodev README "돌리는 법" `flowchart LR`(`PLUS → API → ① 먼저 SETUP → MADE`, `API → ② setup 이 성공하면 ROOM`)의 ①·② 번호를 화면에 그대로 쓴다. cockpit README 3.1 걸음 지도의 W5(걸음 14 · 방 만들기)와 걸음 14 본문("방은 저절로 열리지 않습니다" · 봇 칩 ⚪).

**근거.** `01-facts.md` 1절 전부. `cockpit/src/rooms/create.js:36` (`defaultBotDir`) · `:82-95` (setup 먼저, 실패면 502 와 되돌림) · `:99` (`openProject`) · `:106` (`createAgentSession`) · `:111` (`room_created`). `prodev/scripts/setup.js:205-206` (하위 폴더 12) · `:249` (`house.md` 골격) · `:251` (`git init`) · `:314` (봇 폴더 = `prodev/bots/<봇>`) · `:329-331` (설정 두 장만 쓴다).

**넣지 않은 것과 이유.** 409 네 경우와 60초 제한(루트 README 3.1 걸음 2·3). 구조가 아니라 운영 세부다. `.env` · `.mcp.json` 은 setup 이 만들지 않으므로 화면에 없다 (`setup.js:9-10`). 걸음 15(봇 폴더 신뢰)도 설치 절차라 뺐다.

### 장면 4 — 켜기, `query()` 한 번 (28초, ②)

**무엇을 보여 주나.** 조종석 판 `켜기` → `POST …/session/start` → 서버 안 `manager.start` 가 cockpit.db `agent_sessions` 에서 `bot_dir` · `session_id` 를 읽는다. `buildQueryOptions` 가 상자 하나를 조립한다. 상자 겉면에 옵션이 한 줄씩 찍힌다.

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

상자가 오른쪽으로 던져지고 `sdk-query.js` 라는 좁은 문 하나(SDK 를 import 하는 유일한 파일)를 지나 오른쪽 기둥에 CLI 프로세스가 켜진다. `init` 사건이 왼쪽으로 돌아오고 상태가 `켜는 중` → `대기` 로 바뀐다. 봇 칩 🟢. 이 장면에서 오른쪽 기둥 밑에 닻줄이 **내려가기 시작**하되 바닥에 닿기 전에 장면이 끝난다.

**왜 이 순서인가.** ② 의 핵심은 "서버는 옵션 하나만 넘긴다" 이다. 옵션 상자를 물건처럼 보여야 다음 장면에서 "그 상자에 든 `cwd` 가 곧 닻줄" 이라는 연결이 선다. `prompt` 가 스트림(입력 흐름)이라는 것도 여기서 보여야 장면 6 의 "밀어 넣는다" 가 이해된다.

**README 대응.** 루트 README 3.2 `sequenceDiagram`(`켜기` → `POST …/session/start` → `agent_sessions` 읽기 → `SDK query · cwd 봇 폴더 · settingSources project local · resume` → `init 사건` → `session_id 저장 · state idle`)의 앞 절반. 접힌 표 "`query()` 에 실제로 들어가는 값" 의 열두 줄 가운데 여덟을 상자 겉면에 쓴다. 읽는 법 "서버가 CLI 에 넘기는 것은 `query()` 옵션 하나다" 와 결론 "어느 폴더에서 · 어느 설정만 읽고 · 앞 대화에 이어서 켜라고만 넘긴다" 가 자막이다. cockpit README 걸음 17(`켜는 중` → `대기` · 봇 칩 🟢). 루트 README 2절 "cockpit 은 봇에게 세 가지만 준다"(cwd · 설정 스위치 · 덧붙인 지시문)가 상자의 세 층이다.

**근거.** `01-facts.md` 2절 (옵션 전부 · `manager.start` · resume · init 사건). `cockpit/src/session/options.js:11-31`. `cockpit/src/session/sdk-query.js:4` (SDK import 는 이 파일뿐) · `:20` (`queryFn`). `cockpit/src/session/manager.js:206` (`InputStream` 이 `prompt`) · `:231` (`this.queryFn({ prompt: s.input, options })`) · `:241-244` (`init` 사건에 `commands` 수 · `agents` 이름) · `:248` (`idle`).

**넣지 않은 것과 이유.** `env` 열다섯 · `enableFileCheckpointing` · `includePartialMessages` · `pathToClaudeCodeExecutable`. 옵션이 열 줄을 넘으면 화면에서 읽히지 않는다. 동시 세션 상한 셋도 뺐다. 3.2 그림의 뒤 절반(`C->>BF` · `C->>R`)은 장면 5 다.

### 장면 5 — 닻줄, cwd 로 물고 들어간다 (22초, ⑤)

**무엇을 보여 주나.** 닻줄이 바닥의 봇 폴더 `bots/prodev-수율개선-bot` 에 걸린다. 봇 폴더에서 설정 두 장이 오른쪽 기둥으로 올라간다. `settings.json` 에서는 `hooks` 세 줄(`SessionStart` · `PreCompact` · `PreToolUse`, 명령은 `node …/common/hooks/<이름>.js` 절대 경로)과 `env`(`PRODEV_BOT` · `PRODEV_PROJECT` · `MINIDISCORD_DB`)가, `settings.local.json` 에서는 `allow` 22 · `deny` 10 · `additionalDirectories` 3 이 올라간다. 그다음 닻줄이 봇 폴더에서 **한 층 위 `bots/`, 두 층 위 `prodev/`** 로 올라가는 궤적이 그려지고, 뿌리의 벽에 붙은 `CLAUDE.md` · `.claude/skills` (15) · `.claude/agents` (도우미 6) 셋이 오른쪽 기둥으로 끌려 올라간다. 화면 구석에 "복사 없음 · 링크 없음" 이 찍히고, 봇 폴더 안을 들여다보면 `.claude/` 에 설정 두 장뿐이다.

**왜 이 순서인가.** ⑤ 는 이 저장소에서 가장 추상적인 문장("cwd 로 위로 올라가며 읽는다")이다. 장면 3 에서 봇 폴더의 자리를, 장면 4 에서 `cwd` 옵션을 미리 보였기 때문에 여기서는 닻줄 하나로 두 사실이 이어진다. 훅이 닻줄 길이 아니라 설정에 박힌 절대 경로로 불린다는 것도 여기서 한 번에 가른다.

**README 대응.** 루트 README 4절 `flowchart TB`(`CLI -->|cwd| 봇 폴더` → `한 층 위 prodev/bots` → `한 층 위 prodev 뿌리` → `CLAUDE.md · skills 15 · agents 6`, 그리고 `settings.json -->|훅 명령은 절대 경로| common/hooks`, `-->|additionalDirectories| 과제 폴더 · 업로드 · prodev`)를 화면의 닻줄과 곁가지 둘로 그대로 옮긴다. 4절 첫 문장 "봇 폴더를 `prodev/bots/` 아래에 두는 자리 자체가 스킬을 받는 법이다" 가 자막이다. 루트 README 3.2 그림 뒤 절반(`C->>BF: settings.json 훅 셋 · settings.local.json 허용 22` · `C->>R: 위로 올라가며 CLAUDE.md · skills 15 · agents 6`). `cockpit/docs/ARCHITECTURE_EXPLANATION.md` 10절 그림 6 과 "덧붙인 지시문은 서버 코드 안의 글 묶음" 문장. 루트 README 3.1 걸음 5·6·7(설정 두 장의 역할 · 허용 규칙은 `settings.local.json` 에만).

**근거.** `01-facts.md` 2절 "cwd 로 물고 들어간다" 전부. `prodev/common/settings.template.json:2-9` (env) · `:14-27` (훅 셋 matcher 와 명령). `prodev/common/settings.local.template.json:4-25` (allow 22) · `:28-32` (deny 5, 여기에 setup 이 업로드 폴더 2 · cockpit.db 3 을 더한다: `prodev/scripts/setup.js:289` · `:295`) · `:34` (`additionalDirectories` 3). `prodev/common/hooks/places.js:14-21` (훅은 cwd 가 아니라 `PRODEV_BOT` · `PRODEV_PROJECT` 환경변수로 자리를 찾는다).

**넣지 않은 것과 이유.** 홈 폴더 아래 설치 시 개인 `~/.claude/CLAUDE.md` 가 섞이는 현상(루트 README 11절 3번). 사실이지만 설치 주의사항이라 구조 영상의 흐름을 끊는다. 스킬 15 · 도우미 6 의 이름 전부는 장면 9 로 미룬다.

### 장면 6 — 글 한 번 왕복 (32초, ③)

**무엇을 보여 주나.** 왼쪽 작성기에 `@` 를 치면 자동완성에 `TO prodev-수율개선-bot` 한 줄, 고르면 `@TO(prodev-수율개선-bot) ` 이 들어간다. `안녕하세요` 를 붙여 Enter. 글 한 장이 `POST /api/rooms/:id/messages` 로 가운데 기둥에 닿는다. 서버가 chat.db `messages` 와 `message_targets` 에 한 줄씩, cockpit.db 편지함 `bot_inbox` 에 `enqueue` 한 줄. SSE `message` 로 왼쪽에 내 글이 뜬다. `#kick` 이 `pendingInbox` 로 줄을 꺼내 `wrapChannel` 로 겉봉투를 씌운다. 겉봉투가 화면 가운데 크게 펼쳐진다.

```
<channel source="cockpit" chat_id="1" message_id="7" delivery="to" sender="김피엘" author_type="user" room_name="prodev-수율개선">
[김피엘] @TO(prodev-수율개선-bot) 안녕하세요
→ delivery="to"로 받은 메시지에는 반드시 reply 도구로 답변하세요.
</channel>
```

겉봉투가 `input.push` 로 오른쪽 기둥의 입력 흐름에 밀려 들어가고 `markDelivered`. 상태 `대기` → `일하는 중`. 오른쪽 기둥에서 `mcp__cockpit__reply` 화살표가 **가운데 기둥 안의** MCP 도구 상자(`tools.js`)로 되돌아오고, `insertBotMessage` 가 chat.db 에 봇 글 한 줄을 쓰고, `onBotMessage` → SSE 로 왼쪽 방에 `BOT` 표시가 붙은 답이 뜬다. 상태 `대기`. 마지막 3초: 봉투 없이 `B 로트가 낮네요` 를 보내면 chat.db 까지만 가고 편지함에 줄이 안 생기며 오른쪽 기둥은 미동도 없다. 작성기의 안내 글자 `봇에게 가지 않습니다 — 부르려면 @` 가 보인다.

**왜 이 순서인가.** ③ 의 전부가 이 장면이다. 장면 2 의 표 이름, 장면 4 의 입력 흐름, 장면 1 의 "브라우저와 CLI 사이 선 없음" 이 여기서 한 번에 맞물린다. 겉봉투를 화면에 글자 그대로 크게 보이는 이유는, 이것이 봇이 실제로 읽는 유일한 입력이라는 사실을 추상 없이 전하기 위해서다.

**README 대응.** cockpit README 5절 `sequenceDiagram`(브라우저 → `POST /api/rooms/:id/messages` → `chat.db messages · message_targets` → `alt` 봉투 없음/있음 → `bot_inbox enqueue` → `pendingInbox` → `channel 봉투로 싼 글을 query() 입력에 넣음` → `reply` → `chat.db 봇 글 한 줄` → `SSE message · 봇 답이 뜸`)을 시간 순 그대로 옮긴다. 그 아래 봉투 꼴 예시(`김피엘` · `chat_id="1"` · `message_id="7"`)를 글자 그대로 쓴다. 5.1 봉투 규칙 표의 첫 줄과 셋째 줄(봉투 없음). 걸음 16(안내 글자) · 걸음 18(`@` 자동완성) · 걸음 19(`BOT` 표시 · 판의 `reply` 줄). `cockpit/docs/ARCHITECTURE_EXPLANATION.md` 5절 그림 2 와 "도구 없이 낸 접시는 손님에게 안 나간다". 루트 README 7절 표의 `봉투` · `봉투 없는 글` · `reply` 세 줄. cockpit README 0절 읽는 법 "MCP 도구 cockpit 은 서버 프로세스 안에 있습니다" 가 reply 화살표가 가운데 기둥 **안**으로 들어가는 근거다.

**근거.** `01-facts.md` 3절 전부 (왕복 일곱 걸음 · 봉투 꼴 · 입력 화면). `cockpit/src/session/manager.js:296-326` (`#kick` · `pendingInbox` · `wrapChannel` · `markDelivered` · `input.push`) · `:18` (`BATCH_LIMIT` 20). `cockpit/src/envelope/wrap.js:13` (`REPLY_DIRECTIVE`) · `:62-68` (`wrapChannel`). `cockpit/src/mcp/tools.js:19` (`TOOL_NAMES`) · `:112-118` (`reply` → `insertBotMessage` → `onBotMessage` → `'sent'`).

**넣지 않은 것과 이유.** `@CC` 의 동작(cockpit README 시나리오 3). 답하지 말라는 규칙이 세션 시작 지시문(`wrap.js:22`)에 있어 봉투 장면에서 설명하면 갈래가 둘로 는다. 밀린 글 20개 묶음, 봉투 규칙 표의 나머지 네 줄(소문자 · 빈칸 · 다른 봇 · 두 번)도 뺐다.

### 장면 7 — 따라잡기와 승인 카드 (20초, ③ ④)

**무엇을 보여 주나.** 앞 절반(10초): 왼쪽에 사람끼리 나눈 글 둘(`yield.csv` 첨부 · `B 로트가 낮네요`)이 chat.db 에만 쌓여 있다. `@TO(prodev-수율개선-bot) 위 파일 봐 주세요` 가 겉봉투로 들어가자, 오른쪽 기둥에서 `mcp__cockpit__fetch_history` 화살표가 가운데로 가고 `{ cursor, messages: [ …, attachments: [{ filename: "yield.csv", path: "…" }] ] }` 가 돌아온다. 봇 답 첫 줄 `이렇게 이해했습니다 — 글 2개 · yield.csv`. 뒤 절반(10초): 봇이 `Bash(curl --version)` 을 들자 오른쪽 기둥에서 `canUseTool` 전화선이 가운데로 가고, 상태가 `승인 대기`, 방에 `🔒 Bash 요청` 한 줄, 왼쪽 조종석 판에 승인 카드(`허용` · `이번 세션 허용` · `거부`)가 뜬다. `허용` 을 누르면 전화선이 오른쪽으로 되돌아가고 상태가 `일하는 중`. 구석에 `10분` 모래시계.

**왜 이 순서인가.** ③ 의 나머지 둘(`fetch_history` · 승인)이다. 둘 다 "오른쪽에서 시작해 가운데를 거쳐 왼쪽에 닿았다가 되돌아오는" 같은 모양이라 한 장면에 묶으면 화살표 방향이 한 번에 익는다. 장면 8 의 들이기가 첨부 경로를 겉봉투에서 받는 것과 대비되도록 "부른 글의 첨부만 바로, 나머지는 따라잡기" 를 여기서 미리 가른다.

**README 대응.** cockpit README 시나리오 2(사람끼리 이야기한 뒤 봇이 따라잡기 — 글 둘 뒤 턴 없음 · 셋째 글 뒤 `fetch_history` 줄)와 시나리오 4(승인 카드 — `승인 대기` · `🔒 Bash 요청` · 카드 단추 셋 · `✅ 김피엘 허용` · 10분)를 그대로 옮긴다. cockpit README 4절 `flowchart LR` 의 `승인 카드에 답하기` 네모(봇의 `목록 밖 도구를 쓰려 함` 과 admin 의 답이 만나는 곳). `cockpit/docs/ARCHITECTURE_EXPLANATION.md` 7절 그림 3(전화 `canUseTool` → 카드 → `alt`)과 6.4 의 `fetch_history` 결과 예. 루트 README 7절 표의 `fetch_history` · `승인 카드` 두 줄과 그 아래 예("김과제가 봉투 없이 … → 봇 턴 없음 → PL 이 `@TO` 위 파일 봐 줘 → `fetch_history`"). prodev README "방은 왜 하나인가" 표의 셋째 줄(봉투 없이 올린 글 → 따라잡는다 · "이렇게 이해했습니다").

**근거.** `01-facts.md` 3절 6·7 (fetch_history · canUseTool · 10분). `cockpit/src/mcp/tools.js:122-147` (`fetchHistory` 결과 꼴 · `attachments` 칸). `cockpit/src/session/manager.js:279-289` (`#canUseTool` → `waiting_approval` → `working`). `prodev/.claude/skills/prodev-orchestrator/SKILL.md:36-38` (`since_id` · "이렇게 이해했습니다" 한 줄).

**넣지 않은 것과 이유.** 승인 다섯 갈래(거둬 감 · 서버 재시작, ARCHITECTURE_EXPLANATION 7절). 허용 · 거부 · 시간 초과 셋으로 충분하고, 그마저 화면에는 허용 하나만 실제로 누른다. member 화면의 `admin 이 답합니다` 도 뺐다.

### 장면 8 — 일이 되는 모습, 들이기 한 건 (32초, ④ ⑦)

**무엇을 보여 주나.** 과제원 김과제가 `@TO(prodev-수율개선-bot) 어제 라인 3 자료입니다` 에 `yield.csv` 를 붙여 보낸다. 겉봉투 안에 `(첨부 파일 경로: …/uploads/<uuid>-yield.csv)` 줄이 보인다. 오른쪽 기둥에서 `intake` 스킬 이름이 켜지고, `intake-copy.js` 가 그 경로를 그대로 읽어 바닥의 과제 폴더 `inbox/<날짜>-<주제>/` 로 복사한다. 파일에 자물쇠(0444)와 지문(SHA-256, 옆 `files.md`)이 붙는다. 봇 답: "이렇게 읽었습니다" 표 · 물음 셋 이하 · `E-0001 로 만들겠습니다. 맞으면 '확정'이라고 답해 주세요.` 김과제가 `@TO(prodev-수율개선-bot) 확정`. 오른쪽 기둥에서 `reply` 가 나가려는 순간 `pre-reply.js` 가 서고, 가운데 원통 chat.db 로 **읽기 전용** 점선이 내려가 확정 글 한 줄(`author_type = user` · 같은 과제의 방 · 본문이 `확정` 으로 시작 · 직전 봇 글에 `E-0001`)을 비춘다. 통과. 바닥에서 `cards/E-0001.md` 의 `status: draft` 가 `valid` 로 바뀌고, `index.js` 가 `index.md` · `index.json` 을 다시 쓰고, `git commit` 이 찍힌다. 방에 `[카드] E-0001 · … · cards/E-0001.md`.

**왜 이 순서인가.** ④ "봇을 만들어서 실제 대화가 오가며 일이 되는 모습" 을 한 건으로 끝까지 보이는 자리다. 장면 6·7 에서 익힌 겉봉투와 reply 위에, 처음으로 **바닥에 파일이 생기는** 것을 보인다. 그래서 이 장면이 앞 2/3 과 뒤 1/3 을 잇는 경첩이다. `pre-reply.js` 가 chat.db 를 읽는 점선은 "확정을 지침이 아니라 기계가 확인한다" 를 그림으로 만든 것이고, 장면 9 의 훅 설명을 위한 첫 실물이다.

**README 대응.** 루트 README 1절 "이야기 하나로 먼저 본다" 의 앞 절반(김과제가 파일을 올리고 `@TO` → inbox 에 잠금 → 표 → "E-0001 로 만들겠습니다. 맞으면 '확정'" → "확정" → 카드 확정 → 방에 알림)을 인물 이름과 카드 번호까지 그대로 쓴다. prodev README 워크플로우 ② `sequenceDiagram`(과제원 → 방 → 비서 `intake` → `intake-copy.js` → `peek.js` → `reply` 표 · 물음 셋 이하 → "확정" → `pre-reply.js` 훅이 chat.db 에서 확정 다섯 조건 → 카드 valid · 위키 · `index.js` · git 커밋 → `[카드] E-0007 …`)을 시간 순 그대로 옮기되 번호만 `E-0001` 로 맞춘다. 워크플로우 ② "기억할 점 넷" 의 2(한 번에 셋까지)와 4(확정 전엔 카드 공지가 안 나간다, 기계가 막는다). 루트 README 5절 표의 `들인 원본` · `카드` 두 줄과 "맞물리는 자리 둘"(확정 관문은 `chat.db` 를 읽는다 · 첨부 경로는 cockpit 이 봉투에 적어 넣는다). 루트 README 0.1 낱말 "inbox · 카드" · "확정".

**근거.** `01-facts.md` 4절 (`pre-reply.js` 확정 조건 ② · readOnly) · 5절 (intake → 카드 → 확정). `cockpit/src/envelope/wrap.js:45` (첨부 안내 줄 꼴) · `:61` (절대 경로). `prodev/.claude/skills/intake/SKILL.md:63` (확정 청하는 문장) · `:80-87` (확정 뒤 차례: `valid` → 위키 → `index.js` → 공지 → `git commit`). `prodev/common/hooks/pre-reply.js:47-50` (chat.db `readOnly: true`) · `:64-65` (확정 다섯 조건) · `:184-191` (`[카드]` 표식일 때만 관문). `prodev/scripts/index.js:2` (`index.md` · `index.json` 을 다시 쓴다) · `:5` (`next E`).

**넣지 않은 것과 이유.** 큰 파일일 때 `data-reader` 도우미가 도는 갈래(워크플로우 ② 의 `opt`). 장면 9 에서 도우미를 다룰 때 한 번만 보인다. 확정 다섯 조건은 화면에 넷만 비춘다(⑤ `status: valid` 는 결과 쪽에 보이므로). 위키 갱신은 장면 10 으로 미룬다. prodev README "카드 한 장에는 무엇이 들어가나" 의 깊이 규칙(개체까지 · 상한 스물)은 카드 내용이라 구조 영상 밖이다.

### 장면 9 — 스킬 · 훅 · 도우미, 한 턴의 시계 (28초, ⑥)

**무엇을 보여 주나.** 오른쪽 기둥 옆에 세로 시간축이 선다. 위에서 아래로 여섯 눈금.
1. **켜질 때** — `SessionStart` (`matcher: startup|resume|clear|compact`) 훅 `session-start.js` 가 바닥에서 여덟 절을 끌어 올려 문맥 맨 앞에 놓는다.
2. **글이 오면** — `CLAUDE.md` 한 줄 "과제 방에서 사람 말(@TO)이 오면 먼저 `prodev-orchestrator` 스킬로" 가 켜지고, 분기표(따라잡기 → "앞으로" → 시키는 말+첨부 → intake → … → 물음 → find → …)를 위에서 훑다 한 줄에서 멈춘다. 스킬 15 이름이 서랍처럼 늘어서고 하나만 열린다.
3. **긴 일이면** — 스킬이 `Agent` 로 도우미를 부른다. 오른쪽 기둥 옆에 작은 기둥이 하나 더 서고(`data-reader`, `model: opus`), 결과 파일(`reading.md`)만 바닥에 남긴 채 20줄 요약이 본 기둥으로 돌아온다. 도우미 여섯 이름(`data-reader` · `researcher` · `reviewer` · `report-writer` · `paper-writer` · `patent-analyst`)이 짧게 스친다.
4. **답하기 직전** — `PreToolUse` (`matcher: mcp__cockpit__reply`) 훅 `pre-reply.js` 가 선다. 순서 다섯(chat_id → 분량 900자·10줄 → `[카드]` 확정 → `[발송]` 결재 → 색인 오류). 막히면 `exit 2` 와 이유 한 줄이 오른쪽 기둥으로 되돌아가고 봇이 고쳐 다시 부른다.
5. **문맥이 차면** — `PreCompact` 훅 `pre-compact.js` (`timeout: 180`). 이름만 켜고 장면 11 로 넘긴다.
6. **훅이 돌 때마다** 가운데 기둥이 `hook` 사건 한 줄을 적는다.

**왜 이 순서인가.** ⑥ 은 "각각 언제 어떻게" 다. 개념 셋을 나란히 정의하면 추상이 되므로, **한 턴의 시간축** 위에 순서대로 놓아 "스킬은 말이 올 때, 도우미는 스킬이 부를 때, 훅은 정해진 순간" 이 위치로 보이게 한다. 장면 8 에서 `intake` 와 `pre-reply.js` 를 실물로 봤기 때문에 여기서는 그 둘을 눈금 2·4 에 다시 놓기만 하면 된다.

**README 대응.** 눈금 2 는 prodev README 워크플로우 ① `flowchart TB`(분기표 R1~R9 · "위 칸일수록 먼저 본다")를 세로 서랍으로 옮긴 것. 눈금 3 은 워크플로우 ④ `flowchart TB` 의 `BG → WORK(researcher · patent-analyst · paper-writer · report-writer) → REV(reviewer)` 와 "등장인물 › 도우미 여섯" 표(`data-reader` → `reading.md` + 20줄 요약 · 공통 규칙 "돌려주는 말은 20줄 안"). 눈금 4 는 워크플로우 ⑤ `flowchart TB`(C1 방 → C2 900자·10줄 → C3 `[카드]` → C4 `[발송]` → C5 색인 → 보낸다/막는다)와 "방아쇠는 방이 아니라 표식이다". 눈금 1·5 는 루트 README 7절 표의 훅 세 줄. 루트 README 0.2 낱말 "스킬 · 도우미" · "훅 · 하네스" 와 2절의 공방 비유 한 줄(레시피 카드 = 스킬, 수셰프 = 도우미, 검수대 = 훅)이 자막의 뼈대다. `cockpit/docs/ARCHITECTURE_EXPLANATION.md` 6.3 의 `settings.json` 훅 부분 JSON.

**근거.** `01-facts.md` 4절 (스킬 15 · 도우미 6 · 훅 셋 · matcher). `prodev/CLAUDE.md:17-18` (트리거 문장 · 실행 모드는 서브에이전트). `prodev/.claude/skills/prodev-orchestrator/SKILL.md:8-27` (분기표). `prodev/.claude/agents/data-reader.md:2-5` (`name` · intake 가 부른다 · `tools` · `model: opus`) · 나머지 다섯 파일의 같은 줄. `prodev/common/settings.template.json:14-27` (훅 셋의 matcher · timeout). `prodev/common/hooks/pre-reply.js:7-12` (보는 차례 다섯) · `:42-45` (`exit 2` + stderr 한 줄). `cockpit/src/session/manager.js:393-396` (`hook_started` · `hook_response` 를 사건으로 적는다).

**넣지 않은 것과 이유.** 스킬 15 각각의 역할 설명(prodev README "스킬 열다섯"). 이름만 서랍으로 보인다. `review` 가 다른 스킬에게 불린다는 것, 백그라운드 3분 규칙, `reviewer` 가 "만든 세션의 추론을 넘겨받지 않는다" 는 것도 뺐다. 자막 두 문장에 안 들어간다.

### 장면 10 — 바닥, 지식이 쌓이고 찾힌다 (28초, ⑦)

**무엇을 보여 주나.** 카메라가 바닥의 과제 폴더 `projects/수율개선/` 으로 내려간다. 왼쪽에 층 넷이 아래에서 위로 쌓인다: `inbox/<날짜>-<주제>/` (원본 · 자물쇠 · `files.md`) → `cards/E-0001.md` (한 장) → `wiki/수율.md` (문장마다 카드 번호) → `index.md` · `index.json` (기계가 만든 표, `index.js`). 오른쪽에 과제 문서와 기록: `charter.md` · `schedule.md` · `journal/<날짜>.md` · `house.md`. 그다음 PL 김피엘의 물음 `@TO(prodev-수율개선-bot) B 로트 수율 어디 있었지?` 가 들어오면 오른쪽 기둥에 `find` 스킬이 켜지고, 봇이 답을 알든 모르든 `node scripts/find.js B 로트 수율` 을 돌린다. 화면에 층 여섯이 세로로 서고 탐색 불빛이 위에서 아래로 내려온다: ① `index.json` 의 `title · aliases · tags` → ② `cards/*.md` 본문 → ③ `wiki/*.md` → ④ `charter.md` 절 · `schedule.md` 행 → ⑤ `inbox/*/files.md` → ⑥ 대화 (`chat.js search`). 불빛이 ② 카드에서 멈추고, 봇 답에 `(cards/E-0001.md)` 출처가 붙는다. 봇 폴더의 `find.log` 에 한 줄(`<때>\t2\t카드 본문\t1\tcards/E-0001.md\tB 로트 수율`)이 추가된다.

**왜 이 순서인가.** ⑦ 의 "쌓이는 자리" 와 "찾아내는 법" 은 같은 바닥의 두 방향이다. 먼저 층을 쌓아 보이고, 그 층을 같은 화면에서 위에서부터 훑는 불빛으로 찾기를 보이면 "기억의 층" 과 "찾기의 층" 이 다른 것이라는 것도 그림으로 갈린다. 장면 8 에서 카드 한 장이 생기는 것을 봤기 때문에 여기서 층이 쌓이는 것이 자연스럽다.

**README 대응.** 앞 절반은 prodev README "비서는 어떻게 기억하나 — 기억의 다섯 층" `flowchart TB`(0층 원본 → 1층 카드 → 2층 위키 → 색인, 대화는 점선)와 그 표("아무것도 지우지 않는다" · "손으로 쓰지 않는다. `index.js` 가 만든다"). 뒤 절반은 워크플로우 ③ `flowchart TB`(① 색인 → ② 카드 본문 → ③ 위키 → ④ 과제 문서 → ⑤ 원본 옆 설명서 → ⑥ 대화 전체 검색 → 출처를 붙여 답한다)와 "비서는 아는 척하지 않는다. 답이 떠올라도 먼저 `find.js` 를 돌린다". "기억의 층과 찾기의 층은 다른 것이다" 절이 두 절반을 한 화면에 나란히 두는 까닭이다. 물음은 루트 README 1절 이야기의 "한 달 뒤 PL 이 'B 로트 수율 어디 있었지?'" 를 그대로 쓴다. 루트 README 5절 표(카드 · 위키 · 색인 / 일지 · 규칙 · 양식 / `find.log` 는 봇 폴더).

**근거.** `01-facts.md` 5절 (자리 목록 · `find.js` · `find.log` 는 봇 폴더 `:275`). `prodev/scripts/find.js:7-12` (층 여섯의 순서와 대상) · `:271-283` (`find.log` 한 줄의 칸: 때 · 층 번호 · 층 이름 · 건수 · 첫 경로 · 물음). `prodev/.claude/skills/find/SKILL.md:24-25` ("답이 떠오르더라도 먼저 돌린다"). `prodev/scripts/index.js:2` · `:16-17` (`errors` 가 있으면 exit 1, 훅이 막을 수 있게).

**넣지 않은 것과 이유.** `threads/` 의 자리. intake 스킬은 봇 폴더, 훅은 과제 폴더로 코드끼리 엇갈려 있어(`01-facts.md` 5절 · 루트 README 11절 4번) 화면에 자리를 박지 않는다. 이름만 장면 11 의 여덟 절 목록에 나온다. 별칭 다섯 갈래 · 조사 떼기 · void 카드 따라가기 · "재 본 값"(16/16 · 23ms)도 뺐다. `analysis/` · `research/` 등 나머지 폴더 이름도 화면에서 뺀다.

### 장면 11 — 압축, 문맥은 캐시·파일이 진실 (28초, ⑧)

**무엇을 보여 주나.** 오른쪽 기둥 옆의 문맥 막대가 차오른다(조종석 판 "문맥" 칸의 퍼센트도 함께). admin 이 `압축` 을 누르거나 문턱에 닿는다. `PreCompact` 훅 `pre-compact.js` 가 선다: 기록 파일(`transcript_path`)의 꼬리 40턴을 자르고(tool_result 300자 · thinking 제외), 빈 폴더에서 `claude -p --model sonnet` 을 돌려, 봇 폴더에 인수인계서 `handoff-compact.md` 를 쓴다. 파일이 바닥에 떨어지며 여섯 칸 제목이 보인다: `## 하던 일` · `## 방과 마지막 message_id` · `## 사람이 기다리는 것` · `## 미해결 질문` · `## 다음 한 걸음` · `## 열어 둔 파일`. 이어 가운데 기둥이 `/compact` 를 입력 흐름에 넣고, 방에 `문맥을 정리 중입니다. 곧 이어서 합니다.` 가 뜬다. 오른쪽 기둥의 막대가 비워진다. 곧 `SessionStart` (`compact`) 훅 `session-start.js` 가 다시 서고, 바닥에서 여덟 절이 번호 순으로 끌려 올라온다: 1 인수인계서 `handoff-compact.md` → 2 헌장 `charter.md` → 3 일정 `schedule.md` → 4 열린 실 `threads/` → 5 어제 일지 → 6 색인 머리 `index.md` 앞 30줄 → 7 마지막 일지 날짜 → 8 `house.md` (50줄). 문맥 맨 앞에 `[깨어남: compact] 나는 prodev-수율개선-bot다. 앞 문맥과 요약은 캐시다 — 아래 파일이 진실이다.` 가 찍힌다. 방에 `정리가 끝났습니다. 이어서 하려면 말을 걸어 주세요.` 사람이 말을 걸면 봇 첫 줄이 `이어서 합니다 — …`.

**왜 이 순서인가.** ⑧ 의 앞 절반이다. 장면 9 에서 눈금 1 과 5 로 이름만 켜 둔 두 훅이 여기서 실물로 돈다. "훅이 파일을 쓰고, 훅이 파일을 읽는다" 두 화살표가 바닥을 사이에 두고 마주 보게 그리면 "문맥은 캐시, 파일이 진실" 이 말 없이 보인다. 이 장면이 시각 모델의 이유 2 를 증명하는 자리다.

**README 대응.** prodev README 워크플로우 ⑥ `stateDiagram-v2`(`WORK → COMPACT: 대화가 너무 길어졌다 · 조종석 압축 단추` → `COMPACT → LOAD: pre-compact.js 가 handoff-compact.md 를 쓰고 · 압축 뒤 session-start.js 가 다시 싣는다` → `CATCH → WORK: 첫 답은 "이어서 합니다" 한 줄`)의 압축 고리와, 그 아래 "켤 때 싣는 순서가 정해져 있다 … 여덟 절" 목록을 번호 순으로 그대로 쓴다. "비서의 하루" 그림의 점선(`압축이 걸리면 pre-compact.js → handoff-compact.md 인수인계서`). 루트 README 7절 표의 `훅 pre-compact`(여섯 칸 이름) · `훅 session-start`(여덟 절) · `압축 알림`(서버가 올린다) 세 줄. 루트 README 0.1 낱말 "압축 · 인수인계서". cockpit README 시나리오 5(두 줄 알림 · 문맥 퍼센트가 줄어든다). prodev README S0 줄 "껐다 켜도 · 대화가 압축돼도 파일에서 되살아나 '이어서 합니다' 한 줄로 잇는다".

**근거.** `01-facts.md` 4절 (`pre-compact.js` · `session-start.js` 여덟 절 · "이어서 합니다" · 알림은 서버가 올림). `prodev/common/hooks/pre-compact.js:24-26` (40턴 · 300자 · 여섯 칸) · `:41` (thinking 제외) · `:106-108` (`claude -p --model sonnet` · timeout 180000) · `:132` (`transcript_path`) · `:163` (파일 쓰기). `prodev/common/hooks/session-start.js:29` (절마다 상한) · `:85` (첫 줄 문장) · `:95-143` (여덟 절 순서). `prodev/common/hooks/places.js:26-28` (`handoff-compact.md` 는 봇 폴더). `cockpit/src/session/manager.js:19-20` (알림 두 문장) · `:298-304` (`/compact` 를 입력 흐름에 넣음) · `:385-391` (`compacting` · `compact_boundary` 에 알림). `prodev/.claude/skills/prodev-orchestrator/SKILL.md:62` ("이어서 합니다" 한 줄).

**넣지 않은 것과 이유.** "압축 직전 journal 자동 실행". 스킬 글에는 있으나 부르는 코드가 없다(`01-facts.md` 4절 · prodev README 워크플로우 ⑥ "일지는 사람이 시킬 때만 쓴다"). 자동 압축 문턱 값(`setup.js:26`)은 숫자가 화면을 어지럽혀 뺐다. 훅 자체의 알림 호출은 `MINIDISCORD_URL` 이 비어 건너뛰므로 화면에서는 서버가 올리는 것으로만 그린다. 압축 중 새 글을 붙잡아 두는 규칙도 뺐다.

### 장면 12 — 껐다 켜도, 이어 붙기(resume) (16초, ⑧)

**무엇을 보여 주나.** 서버 창에 `Ctrl-C`. 가운데 기둥이 `release` 로 오른쪽 기둥을 놓고 둘 다 꺼진다. 서버 창에 `끄는 중 — 세션 상태는 그대로 두고 다음 기동에 resume 한다`. 그러나 가운데 원통 cockpit.db 에 `agent_sessions.session_id = abc…` 와 상태가 남아 있고, 그 사이 사람이 보낸 `@TO` 글 둘이 편지함 `bot_inbox` 에 미배달로 쌓인다. 바닥의 파일은 전부 그대로다. `node bin/cockpit.js serve` 를 다시 치면 `resume 수율개선 → …` 줄이 나오고, `bootResume` 이 `stopped` 가 아닌 줄을 찾아 `query()` 에 `resume: abc…` 를 넣고, 오른쪽 기둥에 **새 프로세스**가 같은 대화 번호로 켜진다. `SessionStart` (`resume`) 가 여덟 절을 다시 싣고, `pendingInbox` 가 밀린 글 둘을 한 겉봉투 묶음으로 넣는다.

**왜 이 순서인가.** ⑧ 의 뒤 절반이다. 장면 11 과 같은 "기둥은 비고 바닥은 남는" 그림을 한 번 더 쓰되, 이번에는 프로세스 자체가 바뀐다. 두 장면을 붙여 놓으면 "새 세션이 돼도 맥락을 찾는 법" 이 압축 · 재시작 어느 쪽이든 같은 길(훅 + 파일 + 편지함)이라는 것이 보인다.

**README 대응.** `cockpit/docs/ARCHITECTURE_EXPLANATION.md` 9절 그림 5(`alt` 서버 다시 켜기 → `release()` → `bootResume()` → `query() resume abc…` 둘째 프로세스 → `SessionStart (resume)` → 밀린 글 묶음 넣기)와 읽는 법 "기억은 프로세스가 아니라 기록 파일에 있다". cockpit README 걸음 20(Ctrl+C 의 출력 문구 · 다시 켜면 `resume 수율개선 → …` · "방금 제가 무엇을 물었나요?"). 루트 README 7절 표의 `resume` 줄과 3.2 그림의 `Note`(resume 실패면 `resume_failed` 적고 새 세션). prodev README 워크플로우 ⑥ 의 `LOAD → CATCH: 꺼진 사이 쌓인 @TO · @CC 글을 조종석이 넣어 준다` 와 "꺼진 동안 사람이 보낸 글은 사라지지 않고 조종석의 큐(`bot_inbox`)에 남았다가 켜지면 들어온다". 루트 README 0.2 낱말 "resume".

**근거.** `01-facts.md` 2절 (서버를 다시 켜면 `resume` · `:116-121`). `cockpit/src/session/manager.js:117-124` (`bootResume`) · `:147-154` (`release` 는 상태를 지우지 않는다) · `:226` (`resume: resumeId`) · `:264-270` (resume 실패면 `resume_failed` 적고 새 세션). `cockpit/src/session/options.js:20` (`persistSession: true`) · `:28` (`resume`). `prodev/common/settings.template.json:15-16` (`SessionStart` matcher 에 `resume`).

**넣지 않은 것과 이유.** 대화 기록 파일의 실제 자리(`~/.claude/projects/`). SDK 형 정의에서 온 사실이고 화면에 홈 경로를 넣으면 장면 5 에서 뺀 홈 폴더 이야기가 되살아난다. 조종석 판의 `끄기` → `켜기` 갈래도 같은 길이라 뺐다. `resume_failed` 는 화면에 안 넣고 근거로만 둔다.

### 장면 13 — 쓸수록 맞아 간다, 굳는 길과 회고 (26초, ⑨)

**무엇을 보여 주나.** 앞 절반(13초, 지시형): PL 김피엘이 `@TO(prodev-수율개선-bot) 앞으로 회의 문서는 이 양식대로 해` 에 ppt 를 붙인다. 분기표 둘째 줄 "앞으로" 에 걸린다. 봇이 한 줄 되묻는다: `회의록만인가요, PL 께 나가는 문서 전부인가요?`. 답을 받으면 바닥의 과제 폴더 `templates/회의-문서.md` 가 생기고 머리에 셋(언제부터 · 누가 · 무엇을 보고)이 찍힌다. 옆에 갈래 셋이 나란히: 규칙 → `house.md` · 양식 → `templates/` · 방법 → `analysis/methods/`. 반대편에 `이번에는 짧게` 라는 글이 오면 아무 파일도 생기지 않는다. 뒤 절반(13초, 관찰형): 김피엘이 `돌아봐`. `retro` 스킬이 켜지고 오른쪽 기둥에서 바닥의 `journal/*.md` (`## 되풀이된 말`) 와 봇 폴더의 `find.log` (건수 0 인 줄) 로 읽기 화살표 둘이 내려간다. 봇 답에 굳힐 후보 하나가 셋 묶음으로 뜬다: `(a) 원본 경로` · `(b) 들어갈 문장` · `(c) 까닭`. 김피엘이 `앞으로 그렇게 해`. `house.md` 에 한 줄이 들어가고 줄 수 계기가 `50` 상한 아래에서 한 칸 오른다. 마지막 2초: 다음 `켜기` 때 `session-start.js` 여덟째 절로 `house.md` 가 문맥에 실린다.

**왜 이 순서인가.** ⑨ 의 앞 절반이다. 장면 10 에서 `house.md` · `journal/` · `find.log` 의 자리를, 장면 11 에서 여덟째 절을 봤기 때문에, 여기서는 "무엇이 그 파일을 늘리는가" 와 "늘어난 것이 언제 다시 실리는가" 만 잇는다. 지시형과 관찰형을 좌우로 나란히 두면 "입구는 둘, 나가는 문은 하나" 가 보인다.

**README 대응.** prodev README 워크플로우 ⑦ 의 첫 `flowchart TB`(`SAY 지시형 → SCOPE 범위를 한 줄 되묻는다` / `ONCE '이번에는' → NOPE 굳히지 않는다` / `NOTICE 관찰형 → JNL 일지 → RETRO → PROP → ASK '앞으로' → SCOPE → WHERE 규칙·양식·방법 → H · T · M → HEAD 머리에 셋`)를 좌우 둘로 나누어 그대로 옮긴다. "무엇이 어디에 굳나" 표(규칙 → `house.md` 모든 답변 · 양식 → `templates/` · 방법 → `analysis/methods/`)와 "`이번에는` 은 굳지 않는다" · "상한 50줄". 둘째 `flowchart TB`(`CALL '돌아봐' → READ journal/*.md · find.log · 판정 파일 → R1~R4 → EV 근거가 있나 → OUT 사람에게 낸다`). "실제로 이렇게 돌았다" ⑤·⑥·⑦(`templates/회의-문서.md` · `house.md` 21줄 → 23줄 · "짧게 써 줘" 세 번 · 55줄 넘침 알림)에서 파일 이름과 물음을 빌린다. 루트 README 1절 이야기 뒷부분("회고하자" → 규칙 후보 → "앞으로 그렇게 해" → 굳는다)과 6절("굳은 규칙 `house.md` 는 과제 폴더에 있고, 세션이 뜰 때마다 다시 실린다" · "정해진 시각에 저절로 도는 회고는 없다"). 루트 README 0.1 낱말 "굳다".

**근거.** `01-facts.md` 5절 (retro 가 굳히는 자리 셋 · cron 없음) · 6절 (`house.md` · `templates/`). `prodev/.claude/skills/prodev-orchestrator/SKILL.md:13` (분기표 "앞으로" 줄) · `:44-54` (굳는 길 네 걸음 · "이번에는" 은 굳히지 않는다 · 50줄 넘으면 사람이 고른다). `prodev/.claude/skills/retro/SKILL.md:10` (cron 없음) · `:20-24` (읽는 것: `journal/*.md` · `find.log` · 판정 파일) · `:42-47` (굳힐 후보 갈래 넷) · `:49` (제안까지만) · `:79-83` (셋 묶음 a·b·c). `prodev/common/hooks/session-start.js:136-143` (여덟째 절 · 50줄 · 잘리면 사람에게 말하라). `prodev/scripts/setup.js:214-235` (`house.md` 골격 · 머리 셋).

**넣지 않은 것과 이유.** retro 의 넷째 항목(스킬·도우미 후보)과 판별 넷. 장면 14 에서 "스킬은 PR 로" 한 줄로 받는다. 별칭(`aliases`) 갈래도 뺐다. 워크플로우 ⑧ 분석(여섯 칸)은 굳는 길의 입구 하나일 뿐이라 `analysis/methods/` 이름만 보인다.

### 장면 14 — 어디를 고치면 봇이 달라지나 (21초, ⑨)

**무엇을 보여 주나.** 카메라가 다시 바닥 전체로 올라온다. 고칠 수 있는 자리 일곱에 차례로 불이 들어온다. prodev 뿌리에 넷: `CLAUDE.md` (전 봇 공통 지침) · `.claude/skills/<이름>/SKILL.md` (스킬 추가) · `.claude/agents/<이름>.md` (도우미 추가) · `common/hooks/*.js` (훅). 봇 폴더에 하나: `.claude/settings.local.json` (`allow` · `deny`). 과제 폴더에 둘: `house.md` · `templates/`. 오른쪽 기둥(봇)의 손이 훅과 스크립트와 설정 두 장으로 뻗다가 `deny: Edit(…/common/hooks/**)` 에 튕긴다. 대신 바닥 옆에 작은 별도 기둥(prodev 제작 세션)이 서서 PR 로 새 `SKILL.md` 한 장을 prodev 뿌리에 꽂는다. 다음 `켜기` 때 장면 5 의 닻줄이 다시 올라가며 그 스킬이 실린다. 봇의 손은 과제 폴더 `house.md` · `templates/` 에만 닿는다. 마지막 3초에 장면 1 의 세 기둥과 바닥 전경으로 돌아가고, 1절의 한 줄 요지가 자막으로 찍힌다.

**왜 이 순서인가.** ⑨ 의 뒤 절반이자 닫는 장면이다. "커스터마이징" 을 개념으로 말하지 않고 **파일 자리 일곱** 으로 보이면, 독자가 영상 뒤에 어디를 열지 안다. 봇이 못 고치는 자리와 사람이 PR 로 고치는 자리를 같은 화면에서 가르는 것은 ADR-036 의 요지다. 장면 5 로 되돌아가는 닻줄이 앞 장면들을 회수해 영상을 닫는다.

**README 대응.** 루트 README 2절 결론("방 · 계정 · DB 둘은 cockpit 서버가, 봇 폴더 · 과제 폴더는 prodev `setup.js` 가 만들고, 스킬은 prodev 제작 세션만 만든다")과 접힌 표 마지막 줄("스킬 · 도우미 · CLAUDE.md — prodev 제작 세션. **봇은 안 만든다**"). 루트 README 6절 셋째 항목("스킬 · 도우미 · 훅은 봇이 아니라 prodev 제작 세션이 PR 로 바꾼다. 봇 허용 목록은 과제 폴더 · 봇 폴더 쓰기만 열고, 훅 · 스크립트 고치기는 거부 목록에 있다"). 루트 README 0.2 낱말 "제작 세션" · "PR · worktree". prodev README "자리" 표(prodev 는 만든다 · `/harness:harness` 로 스킬·에이전트, 손으로 훅·스크립트·설정)와 "등장인물" 표 · "도우미 여섯" · "스킬 열다섯" 절이 불 들어오는 자리 넷의 이름표다. prodev README 워크플로우 ⑦ "굳는 것 / 사는 자리 / 언제 읽히나" 표가 과제 폴더 쪽 둘. cockpit README 4절 그림의 봇 줄 맨 아래(`settings.local.json 허용 목록`)와 읽는 법("허용 목록은 cockpit 이 아니라 prodev `setup.js` 가 봇 폴더에 씁니다").

**근거.** `01-facts.md` 6절 전부. `prodev/common/settings.local.template.json:28-32` (`deny` — 봇 설정 두 장 · `.env` · `common/hooks/**` · `scripts/**`) · `:12-15` (`Edit` · `Write` 가 열린 자리는 과제 폴더와 봇 폴더뿐). `prodev/.claude/skills/retro/SKILL.md:109` ("만드는 것은 prodev 세션이고 worktree + PR 이다. 봇이 만들지 않는다"). `prodev/CLAUDE.md:1-12` (전 봇 공통 지침이 이 파일에 있다).

**넣지 않은 것과 이유.** `design/v3/ADR.md` 번호들. 화면에 문서 번호가 나오면 구조가 아니라 문서 안내가 된다. `close` 스킬의 `knowledge/` 승격(`close/SKILL.md:44-45` · 루트 README 1절 그림의 점선)은 과제가 끝날 때의 일이라 이 영상 범위 밖이다. 설정을 바꾼 뒤 그 기계의 prodev 를 새 판으로 받아야 한다는 운영 사실(루트 README 8.2 · cockpit README 10절)도 뺐다.

## 5. 스타일 원칙 (콘티가 이어받는다)

1. **자리는 고정, 카메라만 움직인다.** 세 기둥과 바닥의 위치는 14장면 내내 같다. 강조는 확대(줌)와 조명(다른 것을 어둡게)으로만 한다. 장면이 바뀌어도 요소가 다른 자리로 옮겨 가지 않는다.
2. **색은 넷.** 사람·브라우저 쪽 하나, cockpit 서버·DB 하나, Claude Code CLI·봇 하나, 바닥의 파일 하나. 화살표는 출발한 쪽의 색을 띤다. 훅이 막을 때(`exit 2`)와 `deny` 만 다섯째 경고색을 쓴다. 그 밖의 색은 없다.
3. **글자는 실제 이름만, 고정폭으로.** 파일·함수·옵션·표 이름은 고정폭 글꼴로 코드 그대로 쓴다. 설명 글자(자막)는 본문 글꼴로 화면 아래 한 줄. 자막은 장면당 두 문장을 넘지 않고, 화면의 이름을 자막에서 되풀이하지 않는다. 자막의 낱말은 README 의 것(방 · 봉투 · 겉봉투 · 편지함 · 켜기 · 따라잡기 · 들이기 · 카드 · 확정 · 도우미 · 인수인계서 · 굳다 · "이어서 합니다")만 쓴다.
4. **움직임은 "무엇이 무엇에게" 를 그린다.** 화살표는 반드시 출발점과 도착점이 화면 안의 실물(기둥 · 원통 · 파일)이어야 한다. 허공에서 시작하거나 개념어에 닿는 화살표는 없다. 겉봉투 · 옵션 상자 · 파일처럼 **물건이 이동**하는 것을 우선하고, 상태 변화(`대기` → `일하는 중`)는 기둥의 테두리 색으로만 표시한다.
5. **DB 원통과 바닥 파일은 "쓰인다" 를 보인다.** 원통에 줄이 추가되거나 바닥에 파일이 생길 때는 그 줄·파일이 실제로 나타나는 애니메이션을 넣는다. "저장됨" 같은 글자로 대신하지 않는다. 읽기는 점선, 쓰기는 실선 (루트 README 2절 그림의 점선 규칙과 같다).

## 6. 확인하지 못해 뺀 것

- **"압축 직전 journal 자동 실행".** 스킬 글(`journal/SKILL.md:10` · `prodev-orchestrator/SKILL.md:21`)에는 적혀 있으나 부르는 코드가 없다 (`01-facts.md` 4절 · prodev README 워크플로우 ⑥). 넣지 않았다.
- **cron 에 의한 브리핑 · 회고.** `setup.js:12` 가 crontab 을 두지 않는다고 적었고 `retro/SKILL.md:10` · prodev README "비서의 하루" 가 "cron 은 없다" 고 적었다. 스킬 분기표에 남은 `cron 08:00` · `cron 18:30` 낱말은 화면에 넣지 않았다 (루트 README 11절 5번).
- **`threads/` 의 자리.** intake 스킬은 봇 폴더(`intake/SKILL.md:73`), 훅은 과제 폴더(`session-start.js:105-107`)라 엇갈린다 (루트 README 11절 4번 · prodev README 워크플로우 ② 끝). 장면 10 · 11 에서 이름만 보이고 어느 폴더인지 박지 않았다.
- **스킬 15 가 실제로 실렸는지.** `init` 사건에 `commands` 수만 있고 이름이 없다 (`manager.js:243` · 루트 README 11절 2번). 장면 5 는 CLAUDE.md 와 도우미 6 은 실린 것으로, 스킬 15 는 "cwd 로 읽는다" 로만 그린다.
- **화면의 세션 상태 여섯 전부.** 코드에서 `RUNNING` · `DELIVERABLE` 집합(`manager.js:21-22`)으로 `starting` · `idle` · `working` · `waiting_approval` · `stopped` 다섯은 확인했고 `error` 는 `#fail`(`manager.js:275`)에서 봤다. 그러나 영상에는 `대기` · `일하는 중` · `승인 대기` 셋만 쓴다. 루트 README 7절의 상태 그림 전체는 넣지 않는다.
- **`@CC` 글이 봇에게 어떻게 다뤄지는지의 화면.** 세션 시작 지시문(`wrap.js:22`)과 cockpit README 시나리오 3 에는 있으나, 영상 안에서 실물로 보일 왕복이 없어 장면에 넣지 않았다.
- **대화 기록 파일의 실제 경로.** SDK 형 정의에서 온 사실이라 코드 경로로 확인하지 못했다. 장면 12 에서 "같은 대화 번호로 이어 붙는다" 까지만 그린다.
- **자동 압축 문턱이 실제로 어느 시점에 걸리는지.** `setup.js:26` 의 값은 확인했으나 SDK 가 그 값으로 언제 압축을 거는지는 코드에 없다. 장면 11 은 admin 의 `압축` 단추와 "문턱에 닿는다" 를 함께 말하되 숫자를 안 넣는다.
- **훅이 방에 올리는 알림.** `pre-compact.js:166` · `session-start.js:153` 이 `P.알린다` 를 부르지만 `settings.template.json:9` 의 `MINIDISCORD_URL` 이 빈 값이라 건너뛴다 (prodev README "등장인물" 표 · 워크플로우 ⑥). 화면에서는 서버(`manager.js:385-391`)가 올리는 것으로만 그린다.
- **홈 폴더 아래 설치 시 개인 지침이 섞이는 현상.** 루트 README 11절 3번 · ARCHITECTURE_EXPLANATION 10절에 실측이 있으나 설치 주의사항이라 장면에 넣지 않았다.
