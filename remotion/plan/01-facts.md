# 사실 묶음 — 코드로 확인된 것 (2026-09-15, prodev 00feaa0 · cockpit ab77880)

영상에 쓰는 사실은 이 문서에 있거나, 코드 경로를 적어 확인한 것만 쓴다.
경로는 `cockpit/…` 은 `crew-workspace/cockpit/`, `prodev/…` 는 `crew-workspace/prodev/` 기준.

## 0. 큰 그림

- crew-workspace 는 메타 저장소. `workspace.json` 핀으로 prodev · cockpit · minidiscord · crew 를 가리킨다.
- **cockpit** = 웹 조종석. Node 서버 `node bin/cockpit.js serve` (포트 3000). 브라우저 ↔ 서버는 HTTP `/api/*` + SSE `/api/stream`.
- **prodev** = 비서 하네스. `CLAUDE.md` · `.claude/skills` 15개 · `.claude/agents` 6개 · `common/hooks` (session-start · pre-compact · pre-reply) · `scripts` 10개 · `design/v3/ADR.md` (ADR 39개).
- 봇 폴더: `prodev/bots/prodev-<과제>-bot/`. 과제 폴더: `crew-workspace/projects/<과제>/`.
- DB 둘: `chat.db` (방·글·첨부), `cockpit.db` (계정 · 큐 `bot_inbox` · `agent_sessions` · 승인).
- cockpit 은 `@anthropic-ai/claude-agent-sdk` 의 `query()` 로 봇마다 Claude Code CLI 프로세스 하나를 띄운다. SDK 를 import 하는 파일은 `cockpit/src/session/sdk-query.js` 하나뿐.

## 1. 방 만들기 = 봇 만들기 (`cockpit/src/rooms/create.js`)

1. 사이드바 `+` → `POST /api/rooms` → `createRoom`.
2. 이름 검사: `prodev-` 접두어를 붙이면 400. 과제·방·봇이 이미 있으면 409 (:66).
3. `defaultBotDir = path.join(config.botsDir, \`prodev-${project}-bot\`)` (:36).
4. setup (:82): `node <prodevDir>/scripts/setup.js --project <과제> --cockpit <cockpit.json>` (`setup-runner.js`, 제한 60초).
   - 만든다: 과제 폴더(git init), 봇 폴더, `.claude/settings.json` (훅 셋 · env · statusLine), `.claude/settings.local.json` (허용 · 거부 목록).
   - 실패하면 502 `setup 실패`, 새로 만든 폴더는 되돌린다.
5. `chatDb.openProject` (방 `prodev-<과제>` 하나 + 봇 줄) → `cockpitDb.createAgentSession`.
6. setup.js 는 방을 만들지 않는다. 방을 만들어도 봇은 **꺼져** 있다.

## 2. 켜기 = SDK 세션 (`cockpit/src/session/options.js:11-31`)

```js
query({ prompt: <입력 흐름>, options: {
  cwd: botDir,                         // 봇 폴더
  settingSources: ['project','local'], // 봇 폴더의 settings.json · settings.local.json
  strictMcpConfig: true,
  mcpServers: { cockpit: mcpServer },  // reply · fetch_history
  permissionMode: 'default',
  allowedTools: ['mcp__cockpit__reply','mcp__cockpit__fetch_history'],
  canUseTool,                          // 목록 밖 도구 → 승인 카드
  persistSession: true, resume: <저장된 session_id>,
  env, includePartialMessages: true, enableFileCheckpointing: true,
  systemPrompt: { type:'preset', preset:'claude_code', append: INSTRUCTIONS, snapshot:true },
}})
```

- `켜기` 버튼 → `manager.start` (`manager.js:95-111`). 서버를 다시 켜면 stopped 가 아닌 봇은 `resume` 으로 다시 켠다 (:116-121).
- `env`: 허락된 15개 (`env.js:7-10`) + `extraEnvKeys` + `PRODEV_BOT_DIR`.
- `init` 사건 (`manager.js:237-244`) 에 account · commands 수 · agents 이름 · resumed 를 기록.

### "cwd 로 물고 들어간다"

- CLI 는 봇 폴더에서 **위로 올라가며** `prodev/CLAUDE.md`, `.claude/skills` 15, `.claude/agents` 6 을 읽는다. 복사도 링크도 없다.
- 훅과 허용 목록은 봇 폴더의 설정 두 장에서 온다. 훅 명령엔 `prodev/common/hooks/*.js` 경로가 박혀 있다.
- MCP 도구 · 봉투 지시문 · 승인 · resume 은 cwd 와 무관하게 cockpit 이 쥔다.
- 봇 폴더를 `prodev/bots/` 밖으로 옮기면 지침과 스킬이 안 실린다.

## 3. 글 한 번 왕복

1. `POST /api/rooms/:id/messages` (`routes-messages.js:22`, multipart) → `manager.postUserMessage` (:81-87).
2. chat.db `messages` + `message_targets` 에 한 트랜잭션. 대상 봇마다 `cockpitDb.enqueue` → `bot_inbox`.
3. `emit('message')` → SSE → `#kick` (`manager.js:296`).
   - `DELIVERABLE = {'idle','working','waiting_approval'}` (:22). 압축 중이면 기다린다.
   - `pendingInbox` → `wrapChannel` 봉투 → `query()` 입력 흐름에 push → `markDelivered`.
4. 봉투 꼴 (`envelope/wrap.js:62-68`, `REPLY_DIRECTIVE` :13):

```
<channel source="cockpit" chat_id="1" message_id="7" delivery="to" sender="김피엘" author_type="user" room_name="prodev-수율개선">
[김피엘] @TO(prodev-수율개선-bot) 안녕하세요
→ delivery="to"로 받은 메시지에는 반드시 reply 도구로 답변하세요.
</channel>
```

5. 봇이 `mcp__cockpit__reply` 호출 → `mcp/tools.js:116` `insertBotMessage` → `onBotMessage` → `manager.js:218` emit → SSE → 화면.
6. `fetch_history` 로 지난 글을 따라잡는다.
7. 목록 밖 도구는 `canUseTool` → 승인 카드. 10분 넘기면 `⛔ 시간 초과 거부` (`relay.js:39`, `config.js:15`).

### 입력 화면 (0b66e00 이후)

- `@TO(봇)` 은 답하라, `@CC(봇)` 은 참고만. 봉투 없는 글은 bot_inbox 줄도 봇 턴도 없다 (사람끼리 하는 말).
- 입력칸은 비어 있다. `@` 를 치면 자동완성에 TO 한 줄만 (`app.js:708`). 고르면 `@TO(이름) ` 이 들어간다.
- placeholder: `봇에게 가지 않습니다 — 부르려면 @` (`glue.js:7`).

## 4. prodev 하네스 — 스킬 · 훅 · 에이전트

- 스킬 15개: `prodev/.claude/skills/*/SKILL.md`. 분기표는 `prodev-orchestrator/SKILL.md:8-27` (따라잡기 → "앞으로" → … → analysis 가 find 앞 → retro · review).
- 에이전트 6개: `prodev/.claude/agents/*.md`.
- 훅 셋 (`prodev/common/hooks/`):
  - `session-start.js` (matcher `startup|resume|clear|compact`): 여덟 절을 싣는다 — 인수인계서 → charter.md → schedule.md → threads/ → 어제 일지 → index.md 앞 30줄 → 마지막 일지 날짜 → house.md (50줄 상한).
  - `pre-compact.js`: 기록 꼬리 40턴(tool_result 300자, thinking 제외)을 `claude -p --model sonnet` (제한 180초) 으로 요약 → `<봇 폴더>/handoff-compact.md` 여섯 칸 (하던 일 · 방과 마지막 message_id · 사람이 기다리는 것 · 미해결 질문 · 다음 한 걸음 · 열어 둔 파일). 실패해도 exit 0.
  - `pre-reply.js`: 확정 조건 ② = 같은 과제의 방 (:105-109, chat.db 를 readOnly 로 연다 :49).
- 압축 뒤 · 새 세션 첫 답은 "이어서 합니다". 실측 R5 8/9 (`meta/prodev-review/runs/2026-09-15-cockpit-M5M.md:46`).
- journal 은 사람이 시킬 때만 돈다 ("압축 직전" 자동 실행 코드는 없다 — 영상에 넣지 말 것).

## 5. 지식이 쌓이는 자리 (과제 폴더 `projects/<과제>/`)

- intake(들이기) → 카드 → 확정 (pre-reply 확정 조건 ②).
- `charter.md` · `schedule.md` · `threads/` · 일지(journal) · `index.md` · `house.md` · `templates/` · `analysis/methods/`.
- find: `prodev/scripts/find.js` (find.log 는 봇 폴더 :275).
- retro 가 굳히는 자리: house.md · templates/ · analysis/methods/. cron 은 없다 (사람이 시킬 때).
- 지식 승격은 close 스킬 (`close/SKILL.md:15,44`).
- threads 자리는 코드끼리 엇갈린다 (intake 는 `bots/<봇>/threads`, 훅은 과제 폴더). 영상에서는 **과제 폴더** 쪽만 보여 주거나 자리를 안 박는다.

## 6. 커스터마이징이 되는 자리

- `prodev/CLAUDE.md` (전 봇 공통 지침), `.claude/skills/<이름>/SKILL.md` (스킬 추가), `.claude/agents/<이름>.md` (에이전트 추가), `common/hooks/*.js` (훅), 봇 폴더 `.claude/settings.local.json` (허용 · 거부 목록), 과제 폴더 `house.md` (과제별 규칙, retro 가 굳힘), `templates/`.
- 설계 결정 기록: `prodev/design/v3/ADR.md` (ADR-038 창구는 cockpit, ADR-039 방 하나 = 과제 = 봇).

## 7. 더 보면 좋은 문서

- 루트 `README.md` 1절 저장소 지도 · 2절 cockpit↔prodev · 3.1 방 만들기 sequence · 3.2 켜기 · 4절 스킬은 cwd 로 · 8.2 받는 길 둘.
- `cockpit/README.md` 0절 조각 그림 · 5절 글 흐름 sequenceDiagram.
- `cockpit/docs/ARCHITECTURE_EXPLANATION.md` 5절 왕복 · 6절 통신 경로 넷 · 7절 승인 · 9절 resume · 10절 하네스 로딩 (520줄 근처 "미리 채움" 문장은 옛 것).
- `cockpit/docs/ARCHITECTURE.md` 4.6 · 5.4.
- `prodev/README.md` 워크플로우 ①~⑧.
