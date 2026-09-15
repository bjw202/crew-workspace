# Claude Code 웹 래퍼 선행 사례 조사

조사일 2026-09-14. 조사 방법은 웹 검색·공식 문서 열람·GitHub REST API 직접 조회·주요 프로젝트 소스 직접 열람입니다.
모든 사실 주장 뒤에 출처 URL 을 붙였습니다. 확인하지 못한 것은 UNVERIFIED 로 표시했습니다.

목표는 **사내망에서 자체 호스팅하는, 진짜 Claude Code 세션을 백엔드로 쓰는 단일 웹 UI** 이고,
다중 사용자는 나중 단계입니다. 이 문서는 설계 검토가 패턴 하나를 고르기 위한 재고 조사입니다.

---

## 쉬운 말 요약

먼저 이름 문제 하나를 정리했습니다. 과제에 나온 "Aside 브라우저"는 실제로는 **서로 다른 두 제품**이고,
**둘 다 Claude Code 를 백엔드로 돌리지 않습니다.** aside.com 은 웹 페이지를 대신 조작해 주는 일반 AI 브라우저이고,
GitHub 의 vignesh07/aside 는 Claude Code 세션 로그를 **읽기만** 하는 맥 메뉴바 앱입니다.

실제 선행 사례는 네 갈래로 갈립니다. **Agent SDK 를 라이브러리로 부르는 쪽**(claudecodeui 13,676★, kanna),
**`claude -p` 를 stream-json 으로 감싸는 쪽**(vibe-kanban 28,078★),
**진짜 터미널을 PTY 로 브라우저에 띄우는 쪽**(ttyd + tmux, 전부 소규모),
그리고 **Anthropic 공식 Remote Control** 입니다.
가장 많이 쓰이는 두 프로젝트의 소스를 직접 열어 확인한 결과, 권한 승인 UI 는
Agent SDK 의 `canUseTool` 콜백 또는 headless 의 `--permission-prompt-tool=stdio` 로 구현되어 있었습니다.

막힌 지점도 분명합니다. 자체 호스팅 다중 사용자를 제대로 하는 오픈소스는 **하나도 못 찾았습니다.**
claudecodeui 는 소스에 `'User already exists. This is a single-user system.'` 이라고 박혀 있습니다.
그리고 Agent SDK 문서에는 제3자 제품이 claude.ai 로그인을 제공하는 것을 허용하지 않는다는 문구가 있어,
사내망 다중 사용자 설계에서 **인증·과금 방식이 최대 리스크**입니다.

PTY 웹 터미널은 "혼자 쓰는 원격 접속"으로는 최고이고 "여러 사람이 쓰는 사내 콕핏"으로는 부적합합니다.
하네스 충실도가 100%인 대신, 브라우저가 받는 것은 구조화된 데이터가 아니라 화면 글자뿐이라서
사용자별 신원·권한 게이트·대화 저장소를 만들 방법이 없습니다.

---

## 1. Aside — 이름이 같은 두 제품, 둘 다 해당 없음

### 1-A. aside.com (AI 브라우저)

- Chromium 기반 독립 데스크톱 브라우저입니다. 자체 소개는 "The most intelligent AI assistant, but it's a browser" 이며,
  통합 없이 로그인된 웹사이트를 사람처럼 조작하는 에이전트가 핵심입니다. ([aside.com](https://aside.com/))
- Y Combinator F25 배치, 샌프란시스코, 창업자 Jun Kim · Chanhee Lee · Sanghun Lee.
  ([ycombinator.com/companies/aside](https://www.ycombinator.com/companies/aside))
- 2026년 6월 말 공개 출시. ([piunikaweb.com](https://piunikaweb.com/2026/07/01/aside-ai-browser-big-update-after-viral-launch/))
- **Claude Code · Codex 세션을 붙이는 기능은 공식 사이트 어디에도 없습니다.**
  페이지가 열거하는 기능은 브라우저 에이전트, 패스워드 매니저, 로컬 메모리, 작업 자동화, 로컬 처리, 사람 승인 게이트입니다.
  ([aside.com](https://aside.com/))
- 오픈소스 아님. 가격 페이지는 있으나 본문에 요금 미표시.
  "bring your own subscription" 으로 ChatGPT·Claude 구독이나 개인 API 키를 연결합니다. ([aside.com](https://aside.com/))
- 벤치마크 수치(Online-Mind2Web 99.0%, Speedometer 3.1 49.9)는 회사 자체 발표를 2차 매체가 옮긴 것이라 **UNVERIFIED** 로 둡니다.
  ([eesel.ai](https://www.eesel.ai/blog/aside-ai-browser),
  [linkedin.com/posts/therne](https://www.linkedin.com/posts/therne_today-were-launching-aside-yc-f25-an-activity-7475267050425282560-W9Qz))

### 1-B. github.com/vignesh07/aside (맥 메뉴바 앱)

- "Persistent side chats and an attention inbox for every Claude Code, Codex, and Pi session on your Mac."
  MIT 라이선스, 2★, 마지막 푸시 2026-09-13. ([github.com/vignesh07/aside](https://github.com/vignesh07/aside))
- 구동 방식은 **디스크의 세션 로그를 읽는 것뿐**입니다.
  `~/.claude/projects/**/*.jsonl`, `~/.codex/sessions/**/rollout-*.jsonl`, `~/.pi/agent/sessions/**/*.jsonl`,
  OpenCode 로컬 DB 를 훑습니다. 훅도 PTY 도 쓰지 않습니다. ([github.com/vignesh07/aside](https://github.com/vignesh07/aside))
- README 는 못 하는 것을 명시합니다.
  "Aside has no agent tools. It never sends messages into an agent, edits a project, or runs a command."
  ([github.com/vignesh07/aside](https://github.com/vignesh07/aside))

**판정: 두 Aside 모두 우리 설계의 참고 대상이 아닙니다.**
다만 1-B 의 "세션 로그를 읽어 목록·검색·비용을 만든다"는 부분은 우리 UI 의 세션 목록 구현에 그대로 쓸 수 있는 저비용 기법입니다.

---

## 2. Claude Cowork — 공개된 것만

- 세션은 기본적으로 클라우드에서 돕니다.
  "Cowork runs in an isolated, temporary sandbox on Anthropic-managed infrastructure",
  세션 시작 시 생성되고 종료 시 파괴됩니다.
  ([support.claude.com/14479288](https://support.claude.com/en/articles/14479288-claude-cowork-architecture-overview))
- 로컬(데스크톱) 세션은 실행 환경이 둘로 나뉩니다. 에이전트 루프는 네이티브로 돌고, 코드 실행은 격리된 VM 안에서 돕니다.
  ([support.claude.com/14479288](https://support.claude.com/en/articles/14479288-claude-cowork-architecture-overview))
- 클라우드 세션이 로컬 파일이나 브라우저를 필요로 하면 데스크톱 앱을 경유합니다.
  "the request goes through the Claude Desktop app on that device over an Anthropic-brokered connection."
  ([support.claude.com/14479288](https://support.claude.com/en/articles/14479288-claude-cowork-architecture-overview))
- 파일 접근 범위는 사용자가 데스크톱에서 연결한 폴더로 제한되고, 로컬 도구 호출마다 권한 검사를 거칩니다.
  "Local file access is limited to folders the member has connected on the desktop,
  and each local tool call is checked against the member's permissions before it runs."
  ([support.claude.com/14479288](https://support.claude.com/en/articles/14479288-claude-cowork-architecture-overview))
- 승인 모드는 자동 승인 / 수동 승인 / 전체 건너뛰기 세 가지이며, 자동 승인에서도
  "Claude reviews each action for safety before it runs and blocks anything it determines to be unsafe" 입니다.
  파일 영구 삭제는 **어느 모드에서든** 명시적 승인을 요구합니다.
  ([support.claude.com/13364135](https://support.claude.com/en/articles/13364135-use-claude-cowork-safely))
- 커넥터 토큰은 샌드박스에 들어가지 않고 서버 쪽에서만 호출됩니다.
  "connector authorization tokens never enter the sandbox; connector calls are made on the server side."
  ([support.claude.com/14479288](https://support.claude.com/en/articles/14479288-claude-cowork-architecture-overview))
- 스케줄 작업은 "Scheduled tasks run on their own even when your computer is off" — 즉 클라우드 실행입니다.
  ([support.claude.com/13364135](https://support.claude.com/en/articles/13364135-use-claude-cowork-safely))

**우리 설계에 시사하는 점**: Cowork 는 "브로커를 통한 로컬 도구 호출 + 도구별 승인 검사 + 연결된 폴더로 범위 제한"이라는
구조를 택했습니다. 사내망 자체 호스팅에서도 이 세 축은 그대로 따라갈 만합니다.
다만 Cowork 자체는 자체 호스팅 불가입니다.

---

## 3. 오픈소스 웹 UI — 활성 프로젝트 6+

별·푸시 날짜는 GitHub REST API 로 2026-09-14 직접 조회했습니다.

### 3-1. siteboon/claudecodeui (CloudCLI) — 13,676★ · AGPL-3.0 · 2026-09-10

- 구동: **Agent SDK 직접 호출**입니다. `import { query } from '@anthropic-ai/claude-agent-sdk'` 이고
  모듈 주석이 "This module provides SDK-based integration with Claude using the @anthropic-ai/claude-agent-sdk" 라고 명시합니다.
  ([claude-runtime.provider.js](https://github.com/siteboon/claudecodeui/blob/main/server/modules/providers/list/claude/claude-runtime.provider.js))
- 권한: `sdkOptions.canUseTool` 콜백에서 `permission_request` 를 WebSocket 으로 브라우저에 보내고 응답을 기다립니다.
  답이 오면 `permission_resolved` 를 브로드캐스트해 다른 탭의 프롬프트를 회수합니다. (같은 파일)
- **중요한 함정이 소스 주석에 적혀 있습니다**:
  "in 'auto' and 'bypassPermissions' modes the SDK resolves approval at the permission-mode step and skips this callback,
  so interactive tools (AskUserQuestion, ExitPlanMode) won't reach the UI".
  해결책으로 PreToolUse 훅을 제안합니다. (같은 파일)
- 설정 로딩: `settingSources = ['project','user','local']`,
  `systemPrompt = {type:'preset', preset:'claude_code'}`, `tools = {type:'preset', preset:'claude_code'}`.
  즉 CLAUDE.md · 훅 · 스킬이 정상 로드됩니다. (같은 파일)
- 재개: `sdkOptions.resume = providerSessionId` 와 `resumeSessionAt` 으로 메시지 편집 후 잘라내기까지 지원합니다. (같은 파일)
- 세션 목록: `~/.claude/projects/**/*.jsonl` 스캔 + `~/.claude/history.jsonl` 로 이름 복구.
  Claude · Codex · Cursor · OpenCode 4종 프로바이더 추상화.
  ([providers/README.md](https://github.com/siteboon/claudecodeui/blob/main/server/modules/providers/README.md))
- **다중 사용자: 없습니다.** 소스에 `'User already exists. This is a single-user system.'` 이 있습니다.
  SQLite + bcrypt + JWT 로 만든 1인용 로그인 게이트입니다.
  ([auth.service.ts](https://github.com/siteboon/claudecodeui/blob/main/server/modules/auth/auth.service.ts))
  README 비교표도 자체 호스팅의 Team sharing 을 "No" 로 적습니다. ([README](https://github.com/siteboon/claudecodeui))
- 깨지는 것(이슈 트래커 근거):
  초기에 auto-compact 부재로 컨텍스트 고갈([#138](https://github.com/siteboon/claudecodeui/issues/138)),
  `/compact` 가 local-command-caveat 텍스트를 채팅에 유출([#425](https://github.com/siteboon/claudecodeui/issues/425)),
  로컬 슬래시 명령이 raw `<command-name>` 태그를 흘리거나 히스토리에서 사라짐([#1051](https://github.com/siteboon/claudecodeui/issues/1051)),
  컴팩션 표시 개선은 아직 열린 이슈([#1292](https://github.com/siteboon/claudecodeui/issues/1292)).

### 3-2. slopus/happy — 23,777★ · MIT · 2026-09-14

- 구동: **하이브리드**입니다. 로컬 모드 `claudeLocal.ts` 는 `cross-spawn` 으로 실제 `claude` 런처를 띄우고,
  원격 모드 `claudeRemote.ts` 는 Agent SDK `query()` 를 씁니다.
  ([claudeLocal.ts](https://github.com/slopus/happy/blob/main/packages/happy-cli/src/claude/claudeLocal.ts),
  [claudeRemote.ts](https://github.com/slopus/happy/blob/main/packages/happy-cli/src/claude/claudeRemote.ts))
- 사용법도 그 구조를 그대로 드러냅니다. "run `happy` instead of `claude` …
  When you want to control your coding agent from your phone, it restarts the session in remote mode."
  ([README](https://github.com/slopus/happy))
- 권한은 `canCallTool` 콜백, 세션 추적은 임시 settings 파일에 SessionStart 훅을 주입해서 합니다
  (`hookSettingsPath`, 주석에 "required for session tracking"). ([claudeRemote.ts](https://github.com/slopus/happy/blob/main/packages/happy-cli/src/claude/claudeRemote.ts))
- 충실도 구멍이 소스에 직접 기록돼 있습니다. `--resume` 를 세션 ID 없이 쓰면
  "not supported in remote mode" 로 로그만 남기고 무시합니다. (같은 파일)
- 자체 서버 + libsodium 계열 E2E 암호화, 모바일 앱, 실시간 음성. ([README](https://github.com/slopus/happy))
- 깨지는 것: 권한 요청 대기 중 새 메시지를 보내면 요청이 중단되고 도구 호출이 실패([#1735](https://github.com/slopus/happy/issues/1735)),
  재개한 세션이 YOLO 모드를 물려받지 못해 매번 권한을 물음([#1695](https://github.com/slopus/happy/issues/1695)),
  권한 모드 피커가 실제로 전송되지 않는 기본값을 표시([#1732](https://github.com/slopus/happy/issues/1732)).

### 3-3. BloopAI/vibe-kanban — 28,078★ · Apache-2.0 · 2026-09-12

- 구동: **headless CLI** 입니다. Rust 실행기가 인자를 이렇게 조립합니다.
  ([claude.rs](https://github.com/BloopAI/vibe-kanban/blob/main/crates/executors/src/executors/claude.rs))

```
claude -p --permission-prompt-tool=stdio --permission-mode=bypassPermissions \
  --model <m> --effort <e> --agent <a> \
  --verbose --output-format=stream-json --input-format=stream-json \
  --include-partial-messages --replay-user-messages
```

- 재개는 `--resume <session_id>` 와 `--resume-session-at <uuid>` 로 대화 히스토리를 특정 지점까지 잘라냅니다. (같은 파일)
- 권한 프롬프트는 stdout 의 `control_request` 로 들어옵니다. 테스트 픽스처에 실제 형태가 있습니다:

```json
{"type":"control_request","request_id":"…","request":{"subtype":"can_use_tool","tool_name":"Bash",
 "input":{…},"permission_suggestions":[{"type":"addRules",
 "rules":[{"toolName":"Bash","ruleContent":"./gradlew :web:testApi:"}],
 "behavior":"allow","destination":"localSettings"}],"tool_use_id":"toolu_…"}}
```

- **주의**: `--permission-prompt-tool=stdio` 와 `--resume-session-at` 는 공식 CLI 레퍼런스에 **없습니다.**
  문서는 `--permission-prompt-tool` 을
  "Specify an MCP tool to handle permission prompts in non-interactive mode" 로만 설명합니다.
  ([cli-reference](https://code.claude.com/docs/en/cli-reference))
  즉 vibe-kanban 이 쓰는 경로는 사실상 비문서 인터페이스이며, 이는 우리 설계의 실질 리스크입니다.
- 승인 기능을 끄면 `--disallowedTools=AskUserQuestion` 을 붙여 대화형 질문 도구를 아예 제거합니다. (같은 파일)

### 3-4. jakemor/kanna — 681★ · 라이선스 NOASSERTION · 2026-09-09

- 아키텍처가 README 에 그려져 있습니다. Browser(React+Zustand) ↔ WebSocket ↔ Bun 서버 ↔ **stdio** ↔
  "Claude Agent SDK / Codex App Server (local processes)". 이벤트 소싱 + CQRS. ([README](https://github.com/jakemor/kanna))
- 인증·노출: `--password <secret>` 한 개, 기본 `127.0.0.1` 바인딩,
  `--remote`/`--host` 로 LAN·Tailscale 노출, `--share`/`--cloudflared` 로 터널. 다중 사용자 개념은 없습니다. (같은 README)
- **Windows 관련 핵심**:
  "Embedded terminal support uses Bun's native PTY APIs and currently works on macOS/Linux." (같은 README)

### 3-5. CoderLuii/HolyClaude — 2,564★ · MIT · 2026-09-11

- 웹 UI 를 직접 만들지 않고 **CloudCLI(=claudecodeui)를 컨테이너에 번들**합니다.
  포트 3001 을 `127.0.0.1` 에만 바인딩하라고 권합니다. ([README](https://github.com/CoderLuii/HolyClaude))
- 구독 인증을 웹 UI 의 OAuth 로 처리합니다.
  "Claude Max/Pro plan — authenticate through the web UI (OAuth), same as desktop Claude Code" (같은 README)
- **Windows 는 WSL2 + Docker Desktop 필요**라고 표에 못박혀 있습니다. (같은 README)

### 3-6. PTY 계열 — 상세는 3-B 절

- [lhymes/claude-web-terminal](https://github.com/lhymes/claude-web-terminal) — 1★ · MIT · 2026-03-10.
- [CharlesChi715/stepboard](https://github.com/CharlesChi715/stepboard) — 0★ · 2026-09-13.

### 3-7. 참고로 제외한 것

- sugyan/claude-code-webui — 1,140★ · MIT, `--output-format stream-json` 방식이었으나
  **2026-05-29 아카이브됨**. ([github.com/sugyan/claude-code-webui](https://github.com/sugyan/claude-code-webui))
- wbopan/cui — 1,144★ · Apache-2.0, **2026-03-20 아카이브됨**. ([github.com/wbopan/cui](https://github.com/wbopan/cui))
- omnara-ai/omnara — 2,842★ · Apache-2.0 로 활발하지만,
  현재는 Claude Code 래퍼가 아니라 범용 관리형 에이전트 플랫폼으로 방향을 바꿨습니다. ([README](https://github.com/omnara-ai/omnara))
- Anthropic 자체 **Remote Control** 은 오픈소스가 아니지만 비교 대상으로 4-B 절에 넣었습니다.

---

## 3-B. 패턴 ① 상세 — 로컬 PC 의 웹 터미널 + Tailscale

### 먼저 정정할 것 하나

흔히 예로 드는 "Happy Coder 방식"은 **PTY 를 브라우저에 띄우는 방식이 아닙니다.**
happy 는 로컬에서 `cross-spawn` 으로 실제 `claude` 를 띄우되
([claudeLocal.ts](https://github.com/slopus/happy/blob/main/packages/happy-cli/src/claude/claudeLocal.ts)),
휴대폰이 개입하면 세션을 **Agent SDK 원격 모드로 재시작**합니다
([claudeRemote.ts](https://github.com/slopus/happy/blob/main/packages/happy-cli/src/claude/claudeRemote.ts)).
README 도 "it restarts the session in remote mode" 라고 적습니다 ([README](https://github.com/slopus/happy)).
즉 happy 는 패턴 ① 이 아니라 ①+② 하이브리드이고, 이는
**"터미널 화면을 그대로 보내는 방식으로는 제대로 된 모바일 UI 를 못 만든다"는 것을 가장 인기 있는 프로젝트가 실증한 사례**입니다.

### 실제로 쓰이는 구현 스택

| 스택 | 별 | 라이선스 | 최근 푸시 | 성격 |
|---|---|---|---|---|
| [tsl0922/ttyd](https://github.com/tsl0922/ttyd) | 12,363★ | MIT | 2026-08-12 | C, libuv + WebGL2, 단일 바이너리 |
| [butlerx/wetty](https://github.com/butlerx/wetty) | 5,431★ | MIT | 2026-09-12 | Node, **SSH 경유** |
| [sorenisanerd/gotty](https://github.com/sorenisanerd/gotty) | 2,545★ | MIT | 2026-08-05 | Go, 원조 [yudai/gotty](https://github.com/yudai/gotty)(19,551★)의 유지보수 포크 |
| [microsoft/node-pty](https://github.com/microsoft/node-pty) | 2,025★ | — | 2026-09-13 | 직접 조립용 라이브러리 |

수치는 2026-09-14 GitHub REST API 직접 조회입니다.

### Claude Code 에 실제로 붙인 사례

브라우저 PTY 로 Claude Code 를 돌리는 **공개 프로젝트는 전부 소규모**입니다.
이것이 이 패턴에 대한 가장 정직한 신호입니다.

1. [lhymes/claude-web-terminal](https://github.com/lhymes/claude-web-terminal) — 1★ · MIT · 2026-03-10.
   Tailscale VPN 뒤의 ttyd(포트 7681) + 커스텀 xterm.js 프런트 + tmux 백엔드, 모바일/데스크톱 적응형 UI.
2. [CharlesChi715/stepboard](https://github.com/CharlesChi715/stepboard) — 0★ · 2026-09-13.
   ttyd/tmux 쌍 위에 FastAPI 패널(`GET /config` 로 ttyd·tmux 쌍 지정, `POST /send` 로 tmux 에 타이핑),
   iframe 없이 xterm.js 로 직접 그림.
3. [CoderLuii/HolyClaude](https://github.com/CoderLuii/HolyClaude) — 2,564★ · MIT · 2026-09-11.
   이 패턴의 **부정 사례**로 인용할 만합니다.
   컨테이너 워크스테이션인데도 웹 터미널을 직접 만들지 않고 CloudCLI(구조화 UI)를 번들했습니다.

### 블로그 글로 널리 퍼진 변형 — SSH 클라이언트 + tmux + Tailscale

브라우저 PTY 대신 **네이티브 SSH 앱**을 쓰는 변형이 실사용자 글로는 훨씬 많습니다.
모바일 키보드 문제를 클라이언트 앱이 대신 풀어 주기 때문으로 보입니다.

- [redock.dev — Run Claude Code on Phone with SSH, Tailscale, and tmux](https://redock.dev/blog/run-claude-code-phone-ssh-tailscale-tmux/):
  Tailscale 이 사설 경로를, SSH 가 터미널을, tmux 가 앱을 닫거나 신호가 끊겨도 세션을 유지합니다.
- [skeptrune — Claude Code on Mobile with Termux and Tailscale](https://www.skeptrune.com/posts/claude-code-on-mobile-termux-tailscale/):
  데스크톱이 Claude Code 를 돌리고, Tailscale 이 사설망, Termux 가 안드로이드 실터미널, tmux 가 세션 유지.
- [Tom Girou — Claude Code From My Phone](https://tom-girou.dev/blog/claude-code-from-my-phone/)
- [Pete Sena — iPhone + Tailscale + Termius + tmux](https://petesena.medium.com/how-to-run-claude-code-from-your-iphone-using-tailscale-termius-and-tmux-2e16d0e5f68b)
- 개관 글: [explainx.ai — control Claude Code from your phone (2026)](https://www.explainx.ai/blog/claude-code-mobile-remote-control-phone-guide-2026)

### 인증과 HTTPS

ttyd 는 필요한 스위치를 전부 갖추고 있습니다 ([README](https://github.com/tsl0922/ttyd)).

- `-c, --credential` — HTTP Basic 인증 `username:password` **하나**. 사용자별 계정 개념이 없습니다.
- `-S/--ssl`, `-C/--ssl-cert`, `-K/--ssl-key`, `-A/--ssl-ca` — TLS 및 클라이언트 인증서 검증.
- `-H, --auth-header` — 리버스 프록시가 인증을 대신하게 위임.
  **사내 SSO 를 붙이려면 사실상 이 경로뿐입니다.**
- `-O, --check-origin`, `-b/--base-path`, `-i/--interface`(유닉스 소켓 바인딩 가능).
- `-W, --writable` — **기본이 읽기 전용**입니다. 쓰기를 열려면 명시해야 합니다.
- `-m, --max-clients`, `-o, --once`, `-q, --exit-no-conn` — 접속 인원·수명 제어.

wetty 는 결이 다릅니다. 비루트로 돌면 `ssh` 를 실행해 기본적으로 localhost 에 접속하고,
`--ssh-auth` 는 `password` 기본에 `publickey,password` 를 지원하며,
`http://서버:3000/ssh/<username>` 으로 사용자를 지정합니다 ([README](https://github.com/butlerx/wetty)).
**즉 신원 확인을 OS/SSH 에 위임합니다.** 이것이 PTY 계열에서 유일하게 진짜 다중 사용자에 근접한 설계입니다.

Tailscale 을 쓰면 TLS·노출 문제는 대체로 사라집니다.
다만 Tailscale 은 **네트워크 도달성**만 해결하고 **애플리케이션 권한**은 해결하지 않습니다.
사내망 전체가 tailnet 에 있으면 ttyd 의 단일 Basic 인증은 그대로 취약점입니다.

### 모바일 키보드 — 이 패턴의 실질적 약점

xterm.js 이슈 트래커에 구체적 증거가 있습니다.

- 터치 지원 자체가 제한적입니다. 터치 이벤트 처리가 없고 모바일 전용 UI 요소가 없습니다
  ([#5377](https://github.com/xtermjs/xterm.js/issues/5377), [#1101](https://github.com/xtermjs/xterm.js/issues/1101)).
- 안드로이드 Chrome 에서 예측 입력 텍스트가 커서 앞에 남고 백스페이스가 직관과 다르게 동작합니다
  ([#675](https://github.com/xtermjs/xterm.js/issues/675)).
- iPad·iPhone 에 하드웨어 키보드를 붙이고 Safari 에서 Ctrl+C 를 누르면 keyCode 13(Enter)로 들어옵니다
  ([#5721](https://github.com/xtermjs/xterm.js/issues/5721)).
- 터치 기기에서 복사·붙여넣기가 동작하지 않습니다 ([#3727](https://github.com/xtermjs/xterm.js/issues/3727)).
- 가상 키보드 처리를 위한 `sendKey` API 는 아직 제안 단계입니다 ([#3581](https://github.com/xtermjs/xterm.js/issues/3581)).

실무에서는 Esc·Ctrl·Tab·화살표를 직접 그린 툴바로 메웁니다.
lhymes 프로젝트가 "adaptive mobile/desktop UI" 라고 부르는 것이 바로 그것입니다.
**즉 모바일 키보드는 우리가 직접 만들어야 하는 항목**이고,
이 비용은 패턴 ① 의 "구현이 쉽다"는 장점을 상당 부분 상쇄합니다.

### 재접속·세션 지속성 — tmux 가 필수 부품

ttyd 는 기본적으로 **클라이언트 연결마다 새 프로세스를 띄웁니다.**
공식 예제가 이를 tmux 로 푸는 법을 보여 줍니다
([Example Usage wiki](https://github.com/tsl0922/ttyd/wiki/Example-Usage)):

```
ttyd tmux new -A -s ttyd vim
```

`-A` 가 있으면 세션이 있으면 attach, 없으면 생성합니다. 터미널에서는 `tmux new -A -s ttyd` 로 같은 세션에 붙습니다.
따라서 **브라우저를 닫아도 Claude Code 는 살아 있고, 다시 열면 그 화면 그대로 돌아옵니다.**
이것은 패턴 ① 의 진짜 강점입니다.
Agent SDK·headless 방식에서는 이 "화면 상태 그대로 복원"을 직접 구현해야 합니다.

이 예제는 다중 뷰어 문제도 같이 풉니다.
**여러 브라우저가 같은 tmux 세션에 붙으면 동일 PTY 를 공유**합니다.
화면·입력이 완전히 공유되므로 페어 작업에는 좋고 격리에는 나쁩니다.
ttyd 의 `-m, --max-clients` 로 인원을 제한할 수는 있지만 분리는 못 합니다.
반대로 `ttyd docker run -it --rm ubuntu` 처럼 쓰면 클라이언트마다 새 컨테이너가 떠서
격리는 되지만 공유가 깨집니다 (같은 wiki).
**공유와 격리를 동시에 주는 구성은 이 패턴에 없습니다.**

### 구조화된 SDK 콕핏 대비 잃는 것

| 잃는 것 | 왜 구조적으로 불가능한가 |
|---|---|
| 사용자별 신원 | ttyd·gotty 는 Basic 인증 자격 증명이 프로세스당 하나입니다. **예외: wetty 는 SSH 로 위임해 OS 계정 단위 신원이 가능합니다** |
| 구조화된 대화 저장소 | 브라우저에 오는 것은 ANSI 바이트 스트림입니다. 대화를 DB 에 넣으려면 화면을 파싱해야 하고 이는 버전마다 깨집니다. 대안은 `~/.claude/projects/**/*.jsonl` 을 별도로 읽는 것인데, 그러면 결국 구조화 UI 를 절반 만드는 셈입니다 |
| 역할별 승인 게이트 | 권한 프롬프트가 화면 안의 글자라서 "이 사람은 Bash 승인 불가" 같은 규칙을 걸 지점이 없습니다. `canUseTool` 이나 `control_request` 에 해당하는 훅이 없습니다 |
| 사용자당 병렬 세션 | tmux 창 전환으로 흉내는 내지만 서버가 세션 목록·상태를 알지 못해 "실행 중 / 승인 대기 / 실패" 같은 표시가 불가능합니다 |
| 첨부·붙여넣기 | 터치 기기에서 복사·붙여넣기가 동작하지 않습니다. 파일 업로드는 ZMODEM/trzsz 로 가능하지만 클라이언트 설치가 필요합니다 |
| 비용·사용량 집계 | stream-json 의 `total_cost_usd` 같은 구조화된 값을 받을 수 없습니다 |

반대로 **얻는 것**은 분명합니다.
훅·스킬·서브에이전트·MCP·자동 컴팩트·statusline·모든 `/` 명령(`/login`·`/plugin`·`/resume` 포함)이 전부 그대로 동작합니다.
이것들은 패턴 ②·③ 에서 각각 구멍이 나는 항목입니다.

---

## 4. 패턴 비교

충실도는 "전체 하네스(훅·스킬·서브에이전트·MCP·권한·자동 컴팩트·백그라운드·statusline·`/` 명령)를
얼마나 그대로 쓰는가"입니다.

| 항목 | ① PTY 웹 터미널 (ttyd+tmux) | ①′ wetty (SSH 위임) | ② Agent SDK | ③ headless stream-json | ④ Remote Control |
|---|---|---|---|---|---|
| 대표 사례 | ttyd+tmux 소규모 | wetty 5.4k★ | claudecodeui 13.7k★, kanna | vibe-kanban 28k★ | Anthropic 공식 |
| 훅 | 완전 | 완전 | 완전 (`settingSources`) | 완전 (`--bare` 미사용 시) | 완전 |
| 스킬·CLAUDE.md | 완전 | 완전 | 완전 | 완전 | 완전 |
| 서브에이전트 출력 | 화면 그대로 | 화면 그대로 | SDK 메시지 | `--forward-subagent-text` 필요 | 동기화됨 |
| MCP | 완전 | 완전 | 완전 | 완전 | 로컬 서버 그대로 |
| 권한 프롬프트 | 화면 그대로, **파싱 불가** | 동일 | `canUseTool`, 단 auto/bypass 에서 건너뜀 | `control_request`, **비문서** | 네이티브 |
| 자동 컴팩트 | 완전 | 완전 | `compact_boundary` 이벤트 | 동일 | 완전 |
| 백그라운드 작업 | 완전 | 완전 | 제한적 | **종료 5초 후 kill** | 완전 |
| statusline | 완전 | 완전 | 없음 | 없음 | 해당 없음 |
| `/` 명령 | 완전 | 완전 | 사용자 정의·스킬 O, `/login` 류 X | 동일 | 일부만, `/plugin`·`/resume` 로컬 전용 |
| 사용자별 신원 | 없음 (Basic 1개) | **있음 (OS 계정)** | 직접 구현 | 직접 구현 | 개인 계정 귀속 |
| 역할별 승인 게이트 | 불가 | 불가 | 가능 | 가능 | 불가 |
| 구조화 대화 저장소 | 불가 | 불가 | 가능 | 가능 | Anthropic 서버 |
| 사용자당 병렬 세션 | tmux 창 흉내 | SSH 세션별 | 가능 | 가능 | `--capacity` 32 |
| 재접속·상태 복원 | **tmux 로 무료** | **tmux 로 무료** | 직접 구현 | 직접 구현 | 자동 (큐잉 포함) |
| 모바일 | 키보드 툴바 자작 필요 | 동일 | 자유 | 자유 | 네이티브 앱 |
| 첨부·붙여넣기 | 터치에서 깨짐 | 동일 | 자유 | 자유 | 지원 |
| 사내망 자체 호스팅 | 가능 | 가능 | 가능 | 가능 | **불가** |
| 견고성 | 낮음 (ANSI 파싱) | 낮음 | 높음 (타입 있는 메시지) | 중간 (비문서 의존) | 높음 |
| 초기 구현 비용 | 매우 낮음 | 낮음 | 중간 | 중간~높음 | 없음 |
| 목표 UI 도달 가능성 | **낮음** | 낮음 | **높음** | **높음** | 해당 없음 |

근거 출처:

- 백그라운드 작업 종료 "that shell is terminated about five seconds after Claude has returned its final result
  and stdin has closed" ([headless 문서](https://code.claude.com/docs/en/headless)).
- `/` 명령 범위 "User-invoked skills and custom commands work in `-p` mode …
  Built-in commands that only run in the terminal interface, such as `/login`, aren't available in `-p` mode"
  ([headless 문서](https://code.claude.com/docs/en/headless)).
- 서브에이전트 텍스트 `--forward-subagent-text` ([cli-reference](https://code.claude.com/docs/en/cli-reference)).
- 자동 컴팩트 `compact_boundary` ([agent-loop 문서](https://code.claude.com/docs/en/agent-sdk/agent-loop)).
- 비용은 `--output-format json` 의 `total_cost_usd` 로 나오지만 "client-side estimates" 이며
  실제 청구와 다를 수 있습니다 ([headless 문서](https://code.claude.com/docs/en/headless)).
- SDK 기능 범위(훅·서브에이전트·MCP·권한·세션·스킬·플러그인)
  ([Agent SDK 개요](https://code.claude.com/docs/en/agent-sdk)).

---

## 4-B. 공식 Remote Control 과의 대조

Remote Control 은 같은 아이디어의 벤더 구현이지만 **결정적으로 다른 점이 둘** 있습니다.

**첫째, 데이터가 나갑니다.**
"While Remote Control is connected, the session transcript, including your messages, Claude's responses,
and tool activity, is stored on Anthropic servers."
실행과 파일 접근은 로컬에 남지만 트랜스크립트는 저장됩니다. 그리고
"Organizations with compliance requirements such as Zero Data Retention can't enable Remote Control."
([remote-control 문서](https://code.claude.com/docs/en/remote-control))
**사내망 자체 호스팅이 목표라면 여기서 탈락합니다.**

**둘째, 조직 정책으로 끌 수 있습니다.** 두 층위에서 가능합니다.

- 조직 토글: "On Team and Enterprise, it is off by default until an Owner enables the Remote Control toggle
  in Claude Code admin settings." 즉 팀·엔터프라이즈는 **기본이 꺼짐**입니다.
  ([remote-control 문서](https://code.claude.com/docs/en/remote-control))
- 기기 단위 정책: `disableRemoteControl` 설정으로 완전히 제거합니다.
  ([remote-control 문서](https://code.claude.com/docs/en/remote-control),
  [settings-reference](https://code.claude.com/docs/en/settings-reference#disableremotecontrol))
  MDM 으로 `com.anthropic.claudecode` 도메인에 배포하거나 `managed-settings.json` 으로 내리면
  사용자·프로젝트 설정이 덮어쓸 수 없습니다.
  ([pashyamisoul/claude-code-disable-remote-control](https://github.com/pashyamisoul/claude-code-disable-remote-control))
- 자동 연결은 `remoteControlAtStartup` 로 제어하며, 체크인된 프로젝트 설정이 `true` 로 켜는 것은 무시됩니다.
  ([remote-control 문서](https://code.claude.com/docs/en/remote-control))

한편 **기능적으로는 우리가 만들려는 것과 가장 가깝습니다.**
`claude remote-control` 서버 모드는 `--capacity <N>`(기본 32)로 동시 세션을 여럿 서빙하고,
`--spawn worktree` 로 세션마다 git worktree 를 주며, 아웃바운드 HTTPS 만 쓰고 인바운드 포트를 열지 않습니다.
git 저장소면 연결된 기기의 diff 창에 로컬에서 계산한 미커밋 변경 diff 를 띄웁니다.
([remote-control 문서](https://code.claude.com/docs/en/remote-control))
**우리 설계의 기능 목록은 사실상 여기서 베껴 오면 됩니다.**
다만 `/plugin`·`/resume` 은 로컬 전용이고, 서버 모드는 네트워크 단절 약 10분이면 종료됩니다. (같은 문서)

---

## 5. Windows 호스트 (PowerShell + Git Bash, WSL 없음)

### 5-1. Claude Code 자체

- 네이티브 Windows 는 공식 지원입니다(Windows 10 1809+ / Server 2019+).
  Git for Windows 는 선택이며, 설치하면 Bash 도구가 Git Bash 로 동작하고, 없으면 PowerShell 도구로 대체됩니다.
  경로는 `CLAUDE_CODE_GIT_BASH_PATH` 로 지정합니다. ([setup 문서](https://code.claude.com/docs/en/setup))
- **샌드박싱은 네이티브 Windows 에서 지원되지 않습니다.** 문서 표가 명시합니다. WSL2 에서만 지원됩니다. (같은 문서)

### 5-2. 패턴별 영향

| 부품·패턴 | 상태 | 근거 |
|---|---|---|
| ttyd | 지원. 1.7.0 에서 ConPTY 기반 네이티브 Windows 추가, Windows 10 1809+ 필요. WinGet·Scoop 배포 | [릴리스 노트](https://newreleases.io/project/github/tsl0922/ttyd/release/1.7.0), [README](https://github.com/tsl0922/ttyd) |
| node-pty | 지원. "Windows support is possible by utilizing the Windows conpty API on Windows 1809+". winpty 폴백은 **제거됨** | [README](https://github.com/microsoft/node-pty) |
| node-pty 빌드 | Python·C++ 컴파일러·Windows SDK(Desktop C++ Apps)·Spectre 완화 라이브러리 필요 | [README](https://github.com/microsoft/node-pty) |
| **tmux** | **Git Bash 에 없음.** MSYS2 에서 `pacman -S tmux` 후 바이너리를 Git Bash 로 복사하는 편법이 통용됨. MinTTY(`git-bash.exe`)에서만 동작하고 `bash.exe`·`git-cmd.exe` 에서는 "open terminal failed: not a terminal" | [blog.pjsen.eu](https://blog.pjsen.eu/?p=440), [dev.to](https://dev.to/timothydjones/install-tmux-on-git-for-windows-1cf2), [blog.shukebeta.com](https://blog.shukebeta.com/2026/08/05/want-tmux-on-windows-without-leaving-your-git-bash-setup-fix-msys2s-home-and-path) |
| wetty | 전제 조건이 `node >=20, make, python, build-essential`. README 에 Windows 언급 없음 | [README](https://github.com/butlerx/wetty) |
| kanna 내장 터미널 | "currently works on macOS/Linux" — Windows 미지원 | [README](https://github.com/jakemor/kanna) |
| ② Agent SDK | 알려진 함정 하나. claudecodeui 소스 주석 — "Resolve the executable eagerly on Windows because the SDK uses raw child_process.spawn, which does not reliably follow npm's shell wrappers like cross-spawn does." 따라서 `pathToClaudeCodeExecutable` 을 명시적으로 넘겨야 합니다 | [claude-runtime.provider.js](https://github.com/siteboon/claudecodeui/blob/main/server/modules/providers/list/claude/claude-runtime.provider.js) |
| ③ headless | stdin 이슈 이력. "Before v2.1.211, an unreadable stdin on Windows crashed the session or made it exit silently with no output." 최소 버전 하한을 두어야 합니다 | [headless 문서](https://code.claude.com/docs/en/headless) |
| ④ Remote Control | Windows Hello 로 생체 인증 step-up 지원. Windows 자체는 문제없음. 문제는 자체 호스팅 불가 | [remote-control 문서](https://code.claude.com/docs/en/remote-control) |
| HolyClaude 식 Docker 번들 | Windows 에서 WSL2 요구. 이번 제약과 불일치 | [README](https://github.com/CoderLuii/HolyClaude) |

**Windows 결론**: 웹 터미널을 띄우는 것 자체는 됩니다.
그런데 패턴 ① 의 핵심 부품인 tmux 가 지원 대상 밖이라,
재접속·세션 지속성이라는 최대 장점이 Windows 에서 편법 위에 서게 됩니다.
참고로 ttyd 의 Windows 실행 실패 이슈도 존재했습니다(현재 닫힘,
[#1292](https://github.com/tsl0922/ttyd/issues/1292)).
패턴 ②·③ 은 알려진 함정이 각각 하나씩이고 둘 다 해법이 공개돼 있습니다.

---

## 6. 추천 후보 — 순위와 최대 리스크

### 1순위 · Agent SDK 를 서버에서 직접 호출 (claudecodeui 패턴)

Node/TypeScript 백엔드가 세션마다 `query()` 를 열고, `canUseTool` 을 WebSocket 승인 UI 로 연결합니다.
`settingSources: ['project','user','local']` 와 `systemPrompt/tools` 프리셋으로 하네스 충실도를 지킵니다.
13.7k★ 프로젝트가 이미 4개 프로바이더까지 이 구조로 돌리고 있어 참고 코드가 풍부하고,
라이선스도 AGPL-3.0 이라 사내 참조에 문제가 없습니다.

**최대 리스크**: Agent SDK 문서의 인증·배포 제약.
"Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or
rate limits for their products, including agents built on the Claude Agent SDK.
Use the API key authentication methods described in the Quickstart instead."
([Agent SDK 개요](https://code.claude.com/docs/en/agent-sdk))
다중 사용자 사내 도구가 각자의 Max 구독으로 붙는 그림이 막힐 수 있고,
그러면 조직 API 키 과금으로 설계가 바뀝니다. 이건 착수 전에 확정해야 할 값입니다.

부차 리스크로 auto/bypassPermissions 모드에서 `canUseTool` 이 건너뛰어져
AskUserQuestion·ExitPlanMode 가 UI 에 도달하지 못하는 문제가 있습니다(PreToolUse 훅으로 우회 가능).
([claudecodeui 소스 주석](https://github.com/siteboon/claudecodeui/blob/main/server/modules/providers/list/claude/claude-runtime.provider.js))

같은 문서에 브랜딩 제약도 있습니다. 제품명에 "Claude Code" 를 쓸 수 없고,
Claude Code 를 흉내 내는 ASCII 아트·시각 요소도 허용되지 않습니다. ([Agent SDK 개요](https://code.claude.com/docs/en/agent-sdk))

### 2순위 · headless `claude -p` + stream-json 서브프로세스 (vibe-kanban 패턴)

언어 중립이고 프로세스 경계가 깨끗해 다중 사용자 격리가 쉽습니다.
28k★ 프로젝트가 Rust 로 돌리고 있다는 것 자체가 견고성의 증거입니다.
사용자별로 OS 계정·작업 디렉터리를 분리하기에 가장 자연스러운 구조입니다.

**최대 리스크**: 권한 승인 경로가 비문서 인터페이스에 의존합니다.
`--permission-prompt-tool=stdio` 와 `--resume-session-at` 는 공식 CLI 레퍼런스에 없고
([cli-reference](https://code.claude.com/docs/en/cli-reference)),
문서화된 `--permission-prompt-tool` 은 MCP 도구 이름만 받습니다.
문서화된 대안(권한 응답용 MCP 서버를 직접 띄우기)은 한 단계 더 복잡합니다.
여기에 백그라운드 Bash 작업이 최종 결과 5초 뒤 종료되는 제약이 겹칩니다.
([headless 문서](https://code.claude.com/docs/en/headless))

### 3순위 · PTY 웹 터미널 — 최종 목표 아닌 **0단계 발판**으로만

`ttyd -W -c user:pass tmux new -A -s cc` 를 Tailscale 뒤에 띄우면
하루 안에 "휴대폰에서 Claude Code 를 쓴다"가 됩니다.
하네스가 100% 그대로이므로 **요구사항을 검증하는 용도로는 다른 어떤 방법보다 빠릅니다.**
어떤 화면이 실제로 필요한지, 승인이 하루에 몇 번 오는지, 모바일에서 정말 쓰는지를 여기서 먼저 재고,
그 결과를 1순위 설계의 입력으로 쓰는 것을 권합니다.

**최대 리스크**: 이 발판이 최종 결과물로 굳는 것입니다.
사용자별 신원·승인 게이트·대화 저장소는 나중에 얹을 수 있는 기능이 아니라
**아키텍처를 통째로 바꿔야 생기는 것**입니다.
한 번 "이미 되는데 왜 다시 만드나"가 나오면 원래 목표였던 다중 사용자 사내 콕핏은 영영 안 나옵니다.
Windows 에서 tmux 가 편법 위에 선다는 점이 이 위험을 키웁니다.

**다중 사용자를 PTY 로 끝까지 밀 경우의 유일한 실현 경로**는 wetty 입니다.
사용자마다 OS 계정을 만들고 SSH 로 신원을 위임하는 방식인데,
계정 관리 비용이 실제 부담이고 승인 게이트는 여전히 못 만듭니다.
사내 정책이 "OS 계정 = 신원"으로 이미 정리돼 있다면 검토할 값어치가 있습니다.

---

## 7. 설계 검토에 넘기는 미결 값 다섯

1. **인증·과금**: 사용자별 Max 구독인가, 조직 API 키인가.
   1순위·2순위 모두 이 값에 따라 설계가 갈립니다.
2. **다중 사용자 격리 단위**: OS 계정 분리인가, 프로세스만 분리인가.
   오픈소스 선례가 전무하므로 우리가 처음 설계해야 합니다.
3. **Windows 최소 버전**: stdin 관련 수정이 들어간 v2.1.211 이상을 하한으로 둘지.
   ([headless 문서](https://code.claude.com/docs/en/headless))
4. **0단계 발판을 만들 것인가.** 만든다면 "언제 버릴지"를 먼저 못박아야 합니다.
   안 만든다면 요구사항을 종이 위에서 정해야 합니다.
5. **사내 신원을 무엇에 걸 것인가.** OS 계정(wetty 경로),
   리버스 프록시 SSO(ttyd `--auth-header` 경로),
   앱 자체 사용자 테이블(1순위·2순위 경로) 중 하나입니다.
   이 선택이 패턴 선택보다 먼저입니다.

---

## 출처 목록

### Aside
- https://aside.com/
- https://www.ycombinator.com/companies/aside
- https://piunikaweb.com/2026/07/01/aside-ai-browser-big-update-after-viral-launch/
- https://www.eesel.ai/blog/aside-ai-browser
- https://www.linkedin.com/posts/therne_today-were-launching-aside-yc-f25-an-activity-7475267050425282560-W9Qz
- https://github.com/vignesh07/aside

### Claude Cowork
- https://support.claude.com/en/articles/14479288-claude-cowork-architecture-overview
- https://support.claude.com/en/articles/13364135-use-claude-cowork-safely
- https://support.claude.com/en/articles/14128542-let-claude-use-your-computer-in-cowork
- https://www.anthropic.com/product/claude-cowork

### 오픈소스 웹 UI
- https://github.com/siteboon/claudecodeui
- https://github.com/siteboon/claudecodeui/blob/main/server/modules/providers/list/claude/claude-runtime.provider.js
- https://github.com/siteboon/claudecodeui/blob/main/server/modules/providers/README.md
- https://github.com/siteboon/claudecodeui/blob/main/server/modules/auth/auth.service.ts
- https://github.com/siteboon/claudecodeui/issues/138
- https://github.com/siteboon/claudecodeui/issues/425
- https://github.com/siteboon/claudecodeui/issues/1051
- https://github.com/siteboon/claudecodeui/issues/1292
- https://github.com/slopus/happy
- https://github.com/slopus/happy/blob/main/packages/happy-cli/src/claude/claudeLocal.ts
- https://github.com/slopus/happy/blob/main/packages/happy-cli/src/claude/claudeRemote.ts
- https://github.com/slopus/happy/issues/1695
- https://github.com/slopus/happy/issues/1732
- https://github.com/slopus/happy/issues/1735
- https://github.com/BloopAI/vibe-kanban
- https://github.com/BloopAI/vibe-kanban/blob/main/crates/executors/src/executors/claude.rs
- https://github.com/jakemor/kanna
- https://github.com/CoderLuii/HolyClaude
- https://github.com/sugyan/claude-code-webui
- https://github.com/wbopan/cui
- https://github.com/omnara-ai/omnara

### PTY 웹 터미널
- https://github.com/tsl0922/ttyd
- https://github.com/tsl0922/ttyd/wiki/Example-Usage
- https://github.com/tsl0922/ttyd/issues/1292
- https://newreleases.io/project/github/tsl0922/ttyd/release/1.7.0
- https://github.com/butlerx/wetty
- https://github.com/sorenisanerd/gotty
- https://github.com/yudai/gotty
- https://github.com/microsoft/node-pty
- https://github.com/lhymes/claude-web-terminal
- https://github.com/CharlesChi715/stepboard
- https://github.com/xtermjs/xterm.js/issues/675
- https://github.com/xtermjs/xterm.js/issues/1101
- https://github.com/xtermjs/xterm.js/issues/3581
- https://github.com/xtermjs/xterm.js/issues/3727
- https://github.com/xtermjs/xterm.js/issues/5377
- https://github.com/xtermjs/xterm.js/issues/5721

### 모바일·Tailscale 실사용 글
- https://redock.dev/blog/run-claude-code-phone-ssh-tailscale-tmux/
- https://www.skeptrune.com/posts/claude-code-on-mobile-termux-tailscale/
- https://tom-girou.dev/blog/claude-code-from-my-phone/
- https://petesena.medium.com/how-to-run-claude-code-from-your-iphone-using-tailscale-termius-and-tmux-2e16d0e5f68b
- https://www.explainx.ai/blog/claude-code-mobile-remote-control-phone-guide-2026

### Windows · tmux
- https://blog.pjsen.eu/?p=440
- https://dev.to/timothydjones/install-tmux-on-git-for-windows-1cf2
- https://blog.shukebeta.com/2026/08/05/want-tmux-on-windows-without-leaving-your-git-bash-setup-fix-msys2s-home-and-path
- https://devblogs.microsoft.com/commandline/windows-command-line-introducing-the-windows-pseudo-console-conpty/

### Anthropic 공식 문서
- https://code.claude.com/docs/en/agent-sdk
- https://code.claude.com/docs/en/agent-sdk/agent-loop
- https://code.claude.com/docs/en/headless
- https://code.claude.com/docs/en/cli-reference
- https://code.claude.com/docs/en/remote-control
- https://code.claude.com/docs/en/settings-reference#disableremotecontrol
- https://code.claude.com/docs/en/setup
- https://github.com/pashyamisoul/claude-code-disable-remote-control
