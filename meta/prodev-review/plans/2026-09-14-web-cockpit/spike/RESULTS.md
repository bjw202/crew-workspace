# 실증 셋 — Agent SDK 로 prodev 하네스가 그대로 도는가 (2026-09-14, 이 맥에서 meta 가 직접 돌림)

설계 문서(`../DESIGN.md`)의 방식 선택이 기대는 근거다. 스크립트 셋은 이 폴더에 그대로 두었다. 돌린 자리는 스크래치 폴더(`scratchpad/spike/`)이고, 봇 설정(`settings.spike.json`)은 `prodev/bots/prodev-searchgate-bot/.claude/settings.json` 의 사본 + PreToolUse 표식 훅 한 줄이다. 스킬 · 에이전트는 `prodev/.claude/{skills,agents}` 로 심볼릭 링크, `CLAUDE.md` 는 사본. 모델은 haiku(값을 줄이려고), `persistSession: false`.

SDK 판: `@anthropic-ai/claude-agent-sdk` 0.3.270 (npm 최신, 2026-09-14). CLI 2.1.270.

| # | 무엇을 봤나 | 결과 | 근거 |
|---|---|---|---|
| 1 | 봇 폴더 설정(`settingSources: ['project','local']`)으로 prodev 하네스가 실리는가 | **실림.** SessionStart 명령 훅이 돌아 `additionalContext`("[깨어남: startup] 나는 prodev-searchgate-bot다…")를 넣었고, 스킬(analysis · charter · find · intake · prodev-orchestrator · retro …) 과 도우미 여섯(data-reader · researcher · reviewer · patent-analyst · paper-writer · report-writer)이 `initializationResult()` 에 나왔다 | `spike1-load-harness.mjs` 출력 |
| 1 | 프로세스 안 MCP 도구(`createSdkMcpServer` 로 만든 `minidiscord-channel/reply`)를 봇이 부르는가 | **부름.** `mcp__minidiscord-channel__reply {chat_id:"1", text:"안녕하세요"}` | 같은 출력 |
| 1 | 인증 | API 키 없이 **claude.ai 로그인(Max)** 으로 돌았다. `account.subscriptionType = "Claude Max"`, `apiKeySource` 없음 | 같은 출력 |
| 2 | 봇 설정의 **PreToolUse 명령 훅**이 프로세스 안 MCP 도구에 걸리는가 | **걸림.** 표식 훅이 stdin JSON 을 파일로 남겼다: `hook_event_name: PreToolUse · tool_name: mcp__minidiscord-channel__reply · tool_input.{chat_id,text} · permission_mode · session_id · transcript_path · cwd`. `pre-reply.js` 가 읽는 칸이 전부 있다 | `pretooluse-marker.json` |
| 2 | SDK 의 콜백 훅(`options.hooks.PreToolUse`)도 같이 도는가 | **돈다.** 명령 훅과 콜백 훅이 둘 다 불렸다 | `spike2-pretooluse-hook.mjs` 출력 |
| 3 | **세션 하나를 살려 둔 채**(스트리밍 입력) 말 셋을 차례로 넣을 수 있는가 | **된다.** 인사 → `/compact` → "방금 무엇을 했나" 가 한 세션(같은 session_id)에서 이어졌다 | `spike3-streaming-compact.mjs` 출력 |
| 3 | `/compact` 를 사용자 메시지로 넣으면 압축되는가 · PreCompact · SessionStart(compact) 훅이 도는가 | **된다.** `compact_boundary {trigger:"manual", pre_tokens:23482, post_tokens:2424}`. PreCompact 훅이 돌아 `handoff-compact.md` 를 썼고, SessionStart(compact) 훅이 "[깨어남: compact]" 를 실었으며 봇 첫 답이 "이어서 합니다." 였다 | 출력 + `prodev/bots/prodev-searchgate-bot/handoff-compact.md.log` 14:02~14:03 |
| 3 | 값 | 세 턴 합 $0.08 (haiku) | result 메시지 `total_cost_usd` |

## 걸린 것 · 알아 둘 것

1. **`options.env` 는 덮어쓰기다, 합치기가 아니다.** `env: { PRODEV_FAKE_CLAUDE: '1' }` 만 주니 "Not logged in · Please run /login" 이 났다. `{ ...process.env, … }` 로 주어야 한다.
2. **`persistSession: false` 면 pre-compact 가 못 쓴다.** 훅은 `transcript_path` 의 JSONL 을 읽어 요약하는데 파일이 없어 "못 썼다" 인수인계서를 냈다. 조종석은 `persistSession: true`(기본) 로 두어야 한다. 대신 기록이 `~/.claude/projects/<cwd 해시>/` 에 남으니 `cost.js` 가 세는 자리와 같다.
3. **PreToolUse 는 `hook_started` 시스템 메시지를 안 낸다** (SessionStart 만 냈다). 훅이 돌았는지는 부수 효과(파일 · exit 2 의 tool_result)로만 안다. 조종석이 "훅이 막았다" 를 보여 주려면 tool_result 의 오류 본문을 읽어야 한다.
4. **부수 효과 하나(정직하게):** 실증 3 의 PreCompact 훅이 `places.js` 의 `PRODEV_BOT` 규칙대로 **실제 봇 폴더** `prodev/bots/prodev-searchgate-bot/` 의 `handoff-compact.md` 를 덮어썼다(내용은 "못 썼다" 골격). searchgate 는 2026-09-11 검색 관문의 시험 봇이라 실전 값은 없다. git 제외 폴더라 되돌릴 수 없다. 다음 실증부터는 `PRODEV_BOT_DIR` 을 스크래치로 준다.
5. `initializationResult().hooks_applied` 는 `undefined` 였다 — 훅이 실렸는지는 이 칸이 아니라 SessionStart 응답으로 봐야 한다.
6. haiku 는 매번 `ToolSearch` 로 `reply` 를 먼저 찾았다(도구 스키마가 지연 로드). 실전 모델에서도 한 턴이 더 드는지는 관문에서 잰다.

## 실증 4 — 권한: `default` 모드 + 봇 허용 목록에서 무엇이 승인 콜백으로 오나 (2026-09-14 저녁, 같은 자리)

설계 6절의 "허용 목록 안은 승인 없이, 밖은 admin 에게" 가 SDK 세션에서 실제로 그런지. `permissionMode: 'default'`, `canUseTool` 은 3초 기다렸다 allow. 모델 haiku. 스크립트 `spike4*.mjs` 넷 + headless CLI 대조.

| 판 | 조건 | 콜백(또는 거부)으로 온 것 | 안 온 것 | 뜻 |
|---|---|---|---|---|
| 4 | 콜백 있음, 옵션 없음 | `Bash(curl --version \| head -1)` · `Bash(node -e "console.log(2)")` · **`mcp__minidiscord-channel__reply`** | `Read` | 허용 목록에 있는 `reply` 도 콜백으로 왔다 |
| 4b | 4 + `allowedTools: ['Bash(node:*)','mcp__minidiscord-channel__reply']` | `curl` 만 | `node -e …` · `reply` | SDK 옵션은 콜백을 건너뛴다(경고 `CLAUDE_SDK_CAN_USE_TOOL_SHADOWED` 가 그렇게 말한다) |
| 4c | 4 + `pathToClaudeCodeExecutable` = 깔린 `claude`(2.1.270, 동봉 판과 같은 판) | 4 와 같음 | | 바이너리 차이가 아니다 |
| 4d | 콜백 없음 + `permissionPrompts: 'none'` | 거부: `curl` · `node -e …` | | 묻는 이가 없으면 조용히 거부. `result.permission_denials` 에 남는다 |
| 4e | 콜백 있음, 명령을 `git status` · `python3 --version` · `ls` 로 | **`reply` 만** | Bash 셋 전부 | **설정 파일의 허용 목록은 SDK 세션에서도 먹는다.** `reply` 만 예외 |
| CLI | `claude -p --setting-sources project,local --permission-mode default` 로 명령 아홉 | 거부: `curl …` · `node -e "…"` · `git --version`(한 번) · `date .` | 통과: `node --version` · `git status` · `git log --oneline -1` · `ls -la` · `python3 --version` | 따옴표 · `-e` 가 든 명령은 접두 규칙이 있어도 CLI 가 묻는다(안전 규칙). `git --version` 한 건은 원인 모름 — 같은 접두의 `git status` 는 통과 |

### 검토 1차 #21 · #23 · #24 · #25 · #29 에 답한 판 여섯 (`spike4x.mjs`, 같은 날 더 늦게)

| 판 | 조건 | 결과 | 뜻 |
|---|---|---|---|
| 4f 대조군 | `Bash(git:*)` 을 **뺀** 설정에서 `git status` · `ls` | **둘 다 콜백 없이 통과** | 4e 의 통과는 규칙 덕이 아니었다. `git status` · `ls` · `python3 --version` 은 CLI 가 규칙과 무관하게 안전하다고 보는 명령이다. **결론 1 의 근거로는 무효** |
| 4g | `allowedTools` 로 `reply` 를 풀고, 봇 설정의 PreToolUse 훅(pre-reply + 표식) | 콜백 0회 · **표식 파일 생김**(`tool_name = mcp__…__reply`, 419자) | `allowedTools` 로 권한을 풀어도 **명령 훅은 그대로 돈다.** 결합 재고가 "가장 위험한 실패 모드" 라 부른 자리(훅이 조용히 안 걸림)는 여기서 안 일어났다. 1200자를 시켰는데 haiku 가 419자만 보내 **막히는 판은 못 봤다**(실증 2 와 같은 한계) |
| 4h · 4h′ | `Write(//<스크래치>/out/**)` 규칙을 넣고 out/ 안과 밖에 하나씩 | **둘 다 콜백으로 왔다**(4h 는 규칙을 `///` 로 잘못 적었고, 4h′ 는 템플릿과 같은 `//` 꼴로 고쳤는데도 같다) | 아래 4h″ 와 같이 읽는다 |
| 4h″ | 같은 설정으로 **headless CLI**(`claude -p … --permission-mode default`) | **둘 다 거부**(`permission_denials` 에 Write 둘) | SDK 와 CLI 가 같다. 스크래치 경로(`/private/tmp/…`)에서 Write 규칙이 왜 안 맞는지는 못 갈랐다 — 실전 봇 설정의 경로(`projects/<과제>/**`)로 W1.3 에서 다시 잰다(P-W1.11) |
| 4i | 도우미(`Agent` → general-purpose)가 `curl` 을 돌리게 | 콜백이 **`agentID = a416dee…`** 를 싣고 왔다. 부모 턴의 `tool_use` 에는 `parent_tool_use_id` 가 있다 | 도우미 안의 승인도 같은 콜백으로 온다. `permission_requests.agent_id` 칸(설계 4.3)이 맞다 |
| 4j · 4l | 규칙에 있는 `mkdir -p <경로>` · `node --version` 을 SDK(콜백) 와 headless CLI 로 | SDK: `mkdir` 콜백 · `node --version` 통과. CLI: `mkdir` **거부**("보안상 차단") · `node --version` 통과 | **SDK 세션의 권한 판정은 CLI 와 같다.** 규칙에 있어도 CLI 가 묻는 명령(`mkdir` · 따옴표 · `-e`)은 SDK 에서도 콜백으로 온다 |

### 결론 셋 (고쳐 씀 — 설계 6절과 같다)
1. **SDK 세션의 권한 판정은 headless CLI 와 같다**(4j/4l · 4h′/4h″ 짝). 봇 설정의 허용 목록 22건은 CLI 에서 먹는 만큼 SDK 에서 먹는다. 다만 **"CLI 에서 얼마나 먹는가" 는 3단계 관문에서 잰 적이 없다**(봇은 bypass 로 돌았다 — HANDOFF 3절). `mkdir` · 따옴표 · `-e` 는 규칙에 있어도 묻는다는 것을 이번에 봤다. `default` 모드의 승인 수는 조종석에서 처음 재는 값이고, P-W2.6(≤ 3)은 그대로 둔다(빗나가면 원인을 적는다).
2. **프로세스 안 MCP 도구(`reply` · `fetch_history`)는 설정 파일의 허용 규칙으로 안 풀린다.** `query()` 옵션 `allowedTools` 에 그 둘만 넣는다(4b · 4g). `allowedTools` 는 CLI 의 안전 규칙까지 건너뛰므로(4b 에서 `node -e` 도 안 물었다) **MCP 도구 둘 외에는 넣지 않는다.** 권한을 그렇게 풀어도 PreToolUse 명령 훅은 돈다(4g).
3. 도우미 안의 승인은 `agentID` 를 달고 같은 콜백으로 온다(4i). 승인 카드는 요청(`toolUseID`) 단위이고 도우미 이름을 같이 보인다.

## 실증 6 — 허용 규칙은 어느 파일에 있어야 먹나 (2026-09-14 저녁, W2 재생 중 승인 폭증을 보고 가름)

headless CLI(`claude -p --setting-sources project,local --permission-mode default`, haiku) 로 스크래치 폴더마다 설정 하나씩. 규칙은 결과 JSON 의 `permission_denials` 로 센다. 스크립트 없음 — 명령 한 줄씩(`runs/2026-09-14-cockpit-M2M.md` 에 옮김).

| 판 | 규칙이 있는 파일 | 규칙 | 시킨 것 | 결과 |
|---|---|---|---|---|
| a · b · 4h″ | 프로젝트 `.claude/settings.json` | `Write(<abs>/out/**)` · `Write(/<abs>/out/**)` · `Write(//<abs>/out/**)` | out/ 안에 Write | **전부 거부** |
| home | 같은 파일, `$HOME/.cache` 아래 경로 | `Write(//…/out/**)` | 같음 | 거부 — `/private/tmp` 탓이 아니다 |
| d · e | 같은 파일 | `Write(out/**)` · **`Write(**)`** | 같음 | 거부 |
| k | 같은 파일 | `Edit(//<abs>/out/**)` (문서상 Write 도 덮는 이름) | 같음 | 거부 |
| f | 파일 없음, CLI `--allowedTools Write` | — | 같음 | **통과** (장치는 산다) |
| g · h | 규칙 없음 / `Bash(node:*)` | `node --version` | 둘 다 통과 — `node --version` 은 규칙과 무관하게 안전 취급. **실증 4e · 4j 의 "규칙이 먹는다" 근거는 무효** |
| o | 프로젝트 `settings.json` | `Bash(curl:*)` | `curl --version` | **거부** |
| **p** | **`.claude/settings.local.json`** | `Bash(curl:*)` | 같음 | **통과** |
| **n** | **`.claude/settings.local.json`** | `Edit(//<abs>/out/**)` | out/ 안에 Write | **통과, 파일 생김** |

### 결론
1. **프로젝트 `.claude/settings.json` 의 `permissions.allow` 는 headless/SDK 세션에서 읽히지 않는다**(Bash 접두 · Edit/Write 경로 모두). 같은 파일의 훅 · env 는 실린다(실증 1~5). 권한 규칙만 신뢰하지 않는 것으로 보인다(대화형에서는 "이 폴더를 신뢰하나" 물음 뒤에 먹는다 — 그 물음이 headless 에는 없다).
2. **`.claude/settings.local.json` 의 규칙은 먹는다.** `settingSources` 에 `'local'` 이 있으면 SDK 도 같다(같은 CLI).
3. 따라서 prodev 의 허용 목록 22건(`setup.js` 가 `.claude/settings.json` 에 쓴다, ADR-033)은 **조종석에서 한 건도 안 먹는다.** 3단계 관문은 bypass 라 드러나지 않았다. W2 재생에서 과제 폴더 안 `Read` · `Write` 와 따옴표 든 `cd` 까지 승인으로 온 까닭.
4. 고침 자리는 prodev `setup.js`(W2.9 PR): 허용 · 거부 목록을 `settings.local.json` 에 쓴다(훅 · env 는 그대로 `settings.json`). cockpit 은 봇 폴더를 열 때 그 파일이 있는지 `check` 로 본다. `allowedTools` 옵션으로 옮기는 것은 안 한다 — CLI 안전 규칙까지 건너뛴다(실증 4b).
5. 실증 4 의 결론 1("SDK 판정 = CLI 판정")은 여전히 참이다. 틀린 것은 "규칙이 먹는다" 는 해석이었다.

## 실증 5 — 설계 4.2 의 조합 전체 (2026-09-14 저녁, 검토 1차 #1 에 답하려고)

`spike5-full-combo.mjs`. `permissionMode 'default'` + `canUseTool`(allow) + `allowedTools ['mcp__cockpit__reply']` + `persistSession true` + **env 화이트리스트** + 서버 이름을 설계대로 `cockpit` 으로. 말 셋(인사 → `/compact` → 이어서). 훅은 봇 설정 사본 그대로(`PRODEV_BOT_DIR` 은 스크래치).

| 본 것 | 결과 |
|---|---|
| env 화이트리스트로 로그인 | **산다.** 이 맥에서 실제로 넘어간 키는 여섯: `SHELL · TMPDIR · USER · PATH · LANG · HOME` (+ `PRODEV_*` 둘). 윈도우 키는 이 맥에 없어 못 쟀다 — W1.3 |
| `mcp__cockpit__reply` | 콜백 0회(경고 `CLAUDE_SDK_CAN_USE_TOOL_SHADOWED` 가 "allowedTools 가 콜백보다 먼저 통째로 허용한다" 고 알린다). `reply` 둘 다 전달됨 |
| `/compact` | `compact_boundary {trigger:"manual", pre 23,614 → post 2,404}` · SessionStart(compact) 훅 |
| pre-compact 훅 + `persistSession true` | `handoff-compact.md` 에 **"못 썼다" 없음**(실증 3 의 걸림 2 가 풀렸다). 기록은 `~/.claude/projects/<cwd 해시>/` 에 남았다 |
| 압축 뒤 첫 답 | "컨텍스트 압축을 준비했습니다." — 실증 3 의 첫 판과 달리 **"이어서 합니다" 한 줄이 안 나왔다.** 검토 3차 #30 이 "조건 셋(`allowedTools` · `persistSession` · env)이 바뀌었으니 모델 편차라 단정하지 말라" 고 해서 갈랐다: 실증 5 를 두 번 더(안 나옴 · 안 나옴), **실증 3 을 원래 조건 그대로 한 번 더(안 나옴)**. 넷 중 첫 판에서만 나왔으니 조건 차이가 아니라 haiku 의 편차다. 실전 모델(sonnet/opus)에서 지침 9행("압축된 뒤 첫 일은 '이어서 합니다' 한 줄")이 지켜지는지는 P-W1.9 의 "이어서" 칸이 잰다 |
| 값 | 세 턴 합 $0.098 (haiku) |

검토 1차 #1("설계가 고른 조합은 한 번도 안 돌았다") 은 이것으로 이 맥에서는 닫혔다. 회사 PC · 회사 계정 · 윈도우 키는 W1.3.
