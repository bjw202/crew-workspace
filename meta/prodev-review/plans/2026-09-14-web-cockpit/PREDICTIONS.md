# 웹 조종석 예측 — 만들기 전에 적는 숫자 (2026-09-14)

**결과를 보고 고치지 않는다.** 빗나가면 빗나갔다고 적고 원인 가설 한 줄. 재는 것은 기계(스크립트 출력 · 파일 · DB). 관문마다 실측 칸을 `runs/` 의 기록에서 옮긴다.

## P-W1 · 회사 PC 실증 (항목 열둘. 통과 = 12 중 10 이상, **단 P-W1.1 · P-W1.5 · P-W1.6 · P-W1.6b · P-W1.11 은 필수**)

| # | 지표 | 예측 | 재는 법 | 실측 | 판정 |
|---|---|---|---|---|---|
| P-W1.1 | 실증 1 (하네스 실림 · `reply` 호출) 회사 PC | 통과 · `apiKeySource` 없음(OAuth) · `oauth_org_not_allowed` 0 | `spike1` 출력 | | |
| P-W1.2 | SessionStart 훅 `additionalContext` 에 봇 이름 | 있음 | 출력 | | |
| P-W1.3 | 실증 2 PreToolUse 명령 훅 표식 파일 | 생김 · `tool_name = mcp__cockpit__reply` | 파일 | | |
| P-W1.4 | 실증 3 `/compact` 뒤 `compact_boundary` · SessionStart(compact) · 첫 답에 "이어서" | 셋 다 | 출력 | | |
| P-W1.5 | 실증 4 `default` 모드에서 허용 목록 밖 도구(`curl`)가 `canUseTool` 로 온다 | 온다 · 3초 뒤 allow 로 이어진다 | `spike4` 출력 | | |
| P-W1.6 | 실증 4 · 4j 에서 규칙 안 명령 `node --version` 은 콜백 없이 돌고, 규칙에 있어도 CLI 가 묻는 `mkdir -p …` 는 콜백으로 온다 — 그리고 **같은 두 명령을 headless CLI 로 돌리면 같은 판정**이다 (이 맥 실측: 같았다) | SDK 와 CLI 판정 일치 2/2 | `spike4x` 출력 + `claude -p --output-format json` 의 `permission_denials` | | |
| P-W1.6b | 프로세스 안 MCP `reply` 는 `allowedTools` 옵션 없이는 콜백으로 오고(이 맥: 왔다), 옵션을 주면 안 온다. 옵션을 줘도 PreToolUse 훅 표식 파일은 생긴다 | 옵션 없이 1회 · 옵션 주면 0회 · 표식 있음 | `spike4` · `spike4b` · `spike4x`(4g) 출력 | | |
| P-W1.11 | 실전 봇 설정(`setup.js` 가 만든 것)으로 과제 폴더 **안**에 `Write` 하나 · **밖**에 하나 | 안: 콜백 0회 · 밖: 1회. 그리고 headless CLI 와 같은 판정 (이 맥 스크래치 경로에서는 안팎 둘 다 물었다 — SDK · CLI 같이) | `spike4x`(4h′) + CLI 대조 | | |
| P-W1.12 | 도우미 하나를 태워 `curl` 을 시키면 콜백에 `agentID` 가 실린다 (이 맥: 실렸다) | 1회 · `agentID` 있음 | `spike4x`(4i) 출력 | | |
| P-W1.7 | 세 턴 값(실증 3, 실전 모델 sonnet) | ≤ $0.40 | `result.total_cost_usd` 합 | | |
| P-W1.8 | 윈도우: `pathToClaudeCodeExecutable` 없이 | **SDK 동봉 win32 바이너리로 뜬다**(설치된 `claude` 가 아니라). 주면 회사 `claude` 로 뜬다 | 세션의 `system/init` 에 적힌 판 · 프로세스 목록의 실행 파일 경로 | | |
| P-W1.9 | 실증 5 조합 전체(`default` + 콜백 + `allowedTools` + `persistSession true` + env 화이트리스트)로 말 셋 | 실증 3 과 같은 결과(압축 경계 · 훅 둘 · "이어서") · `handoff-compact.md` 에 "못 썼다" 없음 | 출력 + 파일 | | |
| P-W1.10 | env 화이트리스트에서 로그인이 사는 최소 키 수 | ≤ 8 (윈도우) | 키를 하나씩 빼며 돌린 기록 | | |

## P-W2 · 서버 뼈대 (통과 = 대본 다섯이 T3M 이상 + 아래 8 중 7)

| # | 지표 | 예측 | 재는 법 | 실측 | 판정 |
|---|---|---|---|---|---|
| P-W2.1 | 대본 다섯 재생 판정 (`scoring.md` 열넷) | ≥ 12/14 (T3M 과 같거나 위) | 재생 기록 · 채점표 | | |
| P-W2.2 | 단위 시험이 덮는 자리 여덟: 봉투 파싱 → `message_targets` · `bot_inbox` 큐 순서 · `idle` 에서만 풀기 · 재기동 재배달 · 승인 요청 키(`tool_use_id`) · 시간 초과 deny · 절단 상한 다섯 · 역할 403 | 8/8 자리마다 시험 있음 · 전부 초록 | meta 가 사본에서 `npm test` 를 돌리고 시험 이름을 자리에 대조 | | |
| P-W2.3 | prodev PR 뒤 시험 | 133 + 25 유지 · 0 실패 (건수는 ±5) | `gate-tests.sh` | | |
| P-W2.4 | prodev 에서 바뀐 파일 수 | ≤ 12 (스킬 본문 치환 제외) | `git diff --stat` | | |
| P-W2.5 | `CLAUDE.md` 비서 지침 열한 줄 · `chat.js` · 훅 셋의 논리 | 무변경. 허용되는 diff 는 도구 이름 · env 이름 · `CLAUDE.md` 하네스 절의 "minidiscord" 한 낱말뿐 | diff 의 줄마다 대조 | | |
| P-W2.6 | 대본 다섯 중 승인 요청 수 (`default` 모드) | ≤ 3 | `permission_requests` 표 | | |
| P-W2.7 | 서버 강제 종료 → 재기동 → 놓친 글 재배달 · "이어서 합니다" | 놓친 글 0 · 한 줄 있음 | DB · 기록 | | |
| P-W2.8 | 사람 글 → 봇 첫 반응(도구 호출 또는 답)까지 | 중앙값 ≤ 15초 | `session_events` 시각 차 | | |

## P-W2 재측정 (2026-09-14 17:35 적음 — W2 반려 뒤, 고침 넷(큐 규칙 · 값 누적 · settings.local.json PR · 스크래치 배치) 전에)

| # | 지표 | 예측 | 재는 법 | 실측 | 판정 |
|---|---|---|---|---|---|
| P-W2r.1 | 대본 R1~R4 합 (같은 대본 · 같은 채점표) | ≥ 26/33 (T3M 과 같거나 위) | `scoring.md` | **27/33** (R1 6 · R2 10 · R3 5 · R4 6) | ○ |
| P-W2r.2 | 승인 요청 수 (R1~R4, `settings.local.json` 뒤) | ≤ 8 (따옴표 든 Bash · `mkdir` 는 남는다) | `permission_requests` · 🔒 글 | **31** — Read·Write·Edit 0, 전부 Bash(`python3` 히어독 13 · `curl` 8 · `for` 6 · 기타 4) | ✗ |
| P-W2r.3 | 다른 방 답 지연 (R4 s4) | ≤ 60초 | 기록 시각 | **7초** | ○ |
| P-W2r.4 | `find.log` 줄 수 (R3) | ≥ 16 | 파일 | **26** (R3 20 + R4 2 + R2 4) | ○ |
| P-W2r.5 | cockpit 세션 값 표시 = 마지막 result 의 `total_cost_usd` | 같다 (더하지 않음) | `agent_sessions.cost_usd` 대 마지막 result | 같다 ($5.15 = 마지막) | ○ |
| P-W2r.6 | prodev PR 뒤 시험 | 133 + 25 유지(±5) · 0 실패 · `settings.local.json` 에 허용 22 · deny | `gate-tests.sh` · 파일 | 140 · 18 · 0 실패 · local 에 22 · 8 — 건수는 +7/−7(없어진 명령의 서버 시험) | ✗(건수) ○(실패 0) |
| P-W2r.7 | 대본 넷 값 | ≤ $12 | `cost.js` | **$12.22** (R2 $3.73 · R3 $5.46 …) | ✗ (0.22 초과) |

빗나간 뒤 적는 것: **P-W2r.2** — 승인은 규칙이 아니라 봇의 명령 습관(히어독 · 반복문 · 목록 밖 curl)이 만든다. 예측이 "따옴표" 를 원인으로 짚은 것부터 틀렸다. **P-W2r.6** — "±5" 는 서버 시험이 명령 셋을 지우며 7건 준 것을 못 내다봤다. **P-W2r.7** — 즉시 배달로 턴이 겹치고 R3 답이 길어져 $5.46.

## P-W3 · 조종석 판 (채점표는 W3 시작 전에 `scoring-cockpit.md` 로. 여기는 숫자만)

| # | 지표 | 예측 | 재는 법 | 실측 | 판정 |
|---|---|---|---|---|---|
| P-W3.1 | 재접속 뒤 되그린 조종석이 실시간과 같은 사건 수 | 같다 (턴 단위) | `session_events` 대조 | SSE `session_event` id 852 = events API 852 (M3.M 재생) | ○ |
| P-W3.2 | 도우미 여섯이 도는 R4(리서치) 동안 `session_events` 에 쌓이는 사건 | 초당 ≤ 20 · `stream_event`(부분 메시지) 저장 0 | `session_events` 의 시각별 건수 · type 집계 | 초당 최대 7 · `stream_event` 0 (853 사건) | ○ |
| P-W3.3 | 승인 카드 "이번 세션 허용" 뒤 같은 도구 재요청 | 0 | `permission_requests` | 0 (m2-approval 재판) | ○ |
| P-W3.4 | admin 아닌 계정이 승인 · 조작 API 를 부르면 | 403 · 전부 | API 시험 | 일곱 길 전부 403 | ○ |
| P-W3.5 | 파일 판이 과제 폴더 밖을 열면 | 403 | API 시험 | **404** (`../` · 절대경로) — 설계 · 채점표가 404 | ✗(숫자) |
| P-W3.6 | 봇 세션에서 `cockpit.db` 를 `Read` · `Bash(node …)` 로 열려 하면 | 거부 (deny 규칙) · `chat.db` 는 읽힘 | 대본 한 줄 + `permission_denials` | cockpit.db `Read` 거부(deny) · chat.db 는 Read 가 바이너리라 못 엶(권한 아님) | ○ · ✗(chat.db 읽힘) |

빗나간 뒤 적는 것 (2026-09-14 M3.M): **P-W3.5** — 예측이 설계 문서(ARCHITECTURE 8.2 "404")를 안 보고 적었다. **P-W3.6** — `Read` 는 .db 를 원래 못 읽는다. "읽힘" 을 재려면 `Bash(node …)` 로 열어야 했다(대본에 안 넣었다).

## P-M4 · 윈도우 · 설치 (2026-09-14 20:20 적음, M4 코드 전. 채점표 `scoring-cockpit-M4.md`)

| # | 지표 | 예측 | 재는 법 | 실측 | 판정 |
|---|---|---|---|---|---|
| P-M4.1 | 맥 `npm test` | pass ≥ 154 · fail 0 · skipped 0 | meta 사본 | 158 · 0 · 0 (형제 없이는 건너뜀 14) | ○ |
| P-M4.2 | 맥 `bin/cockpit.js check` | ✓ 셋 · 공백 경로 ✗ · 없는 claudePath ✗ | meta 사본 | ✓ 셋 · 공백 키마다 ✗ exit 1 · 없는 claudePath ✗ exit 1 | ○ |
| P-M4.3 | `INSTALL-WINDOWS.md` 번호 걸음 | ≥ 6 · 걸음마다 확인 명령 | grep | 12 · "친다·확인" 28 줄 · 이어쓰기 백틱 0 | ○ |
| P-M4.4 | m4-sessions (맥 · haiku · 셋 · 5분) | 서버 RSS ≤ 300 MB · 자식 합 ≤ 1.5 GB · error 0 | 스모크 출력 | 서버 최대 91.2 MB · 자식 최대 824.1 MB · error 0 | ○ |
| P-M4.5 | 윈도우 `npm test` (사람이 회사 PC 에서) | fail 0 · 건너뜀 ≤ 5 | 사람이 준 출력 파일 | | |
| P-M4.6 | 윈도우 env 키 | 여섯(`USERPROFILE · APPDATA · LOCALAPPDATA · TEMP · SystemRoot · ComSpec`) 으로 로그인 삶 | 회사 PC m1-hello | | |

## P-W4 · 실전 2주

`../../predictions/prodev-prediction.md` 의 4단계 절(값 상한 · 카드 수 · 카드 없는 첨부 · 위키 층 비율 · 승인 수 · 본방 파일 수 · "방 더" 요청 · 확정 관문 오작동)을 그대로 쓴다. 조종석이 더하는 것 셋:

| # | 지표 | 예측 |
|---|---|---|
| P-W4.a | 조종석 서버 재기동 횟수 (2주) | ≤ 4 |
| P-W4.b | 승인 요청 수 (2주) | ≤ 10 · 답 안 해서 deny 된 것 0 |
| P-W4.c | member 가 조종석 판을 연 횟수 (로그) | ≥ 10 (안 보면 판이 필요 없다는 뜻) |
| P-W4.d | 동시 세션 수 · 조종석 + 봇 프로세스들의 상주 메모리 (2주 최대) | ≤ 3 세션 · ≤ 6 GB (`tasklist` 기록) |

## 빗나간 뒤 적는 것
(관문 뒤에 채운다)
