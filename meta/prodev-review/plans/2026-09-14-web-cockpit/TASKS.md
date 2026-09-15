# 웹 조종석 — 태스크 분할과 관문 넷 (2026-09-14)

`DESIGN.md` 10절의 상세다. 관문은 순서대로. 통과 전에 다음을 열지 않는다. 판정은 meta 가 직접 돌려 센다(`../../../CLAUDE.md` 공통 다섯). 예측 숫자는 `PREDICTIONS.md` 에 먼저 적혀 있다.

제작 자리: 새 저장소 `crew-workspace/<이름>/`(이름은 사람이 정한다, DESIGN 11절 ②). prodev 쪽 고침은 `../prodev-wt-cockpit/` worktree + PR 하나(DESIGN 5절). meta 는 만들지 않는다 — W1 의 실증 스크립트만 meta 가 직접 돌린다(그것이 검수다).

## W1 · 회사 PC 실증 (1주) — 만들기 전에 막힐 곳을 먼저 밟는다

| # | 일 | 누가 | 산출물 |
|---|---|---|---|
| W1.1 | `spike/` 의 스크립트 셋을 회사 PC 에 옮겨 그대로 돌린다 (Node 24 · Git Bash · 회사 계정). `PRODEV_BOT_DIR` 은 임시 폴더로 | 사람 + meta | `runs/<날짜>-W1.md` 에 출력 셋 |
| W1.2 | `account` 응답을 기록한다: `subscriptionType · apiKeySource`. `oauth_org_not_allowed` 가 나면 여기서 멈추고 사람이 회사와 정한다 | 사람 | 같은 기록 |
| W1.3 | 실증 4 의 판들(`spike4` · `spike4b` · `spike4x` 로 4g · 4h′ · 4i · 4j, 그리고 headless CLI 대조 4h″ · 4l — 전부 이 맥에서 돌렸고 결과는 `spike/RESULTS.md`)을 회사 PC 에서 **실전 봇 설정 · 실전 과제 폴더 경로**로 그대로 + **실증 5(`spike5-full-combo.mjs`, 이 맥에서 통과): 설계가 고른 조합 전체** — `default` + `canUseTool` + `allowedTools`(MCP 둘) + `persistSession: true` + **env 화이트리스트** 로 실증 3 의 말 셋(인사 → `/compact` → 이어서)을 회사 PC 에서 돌린다. 스크립트의 `WHITELIST` 에 윈도우 키가 이미 들어 있다. 키를 하나씩 빼 보며 "무엇을 빼면 로그인이 죽는가" 를 적는다 | meta 가 쓴 스크립트를 사람이 회사 PC 에서 돌린다 | 출력 + env 키 목록 |
| W1.4 | 윈도우 걸림 확인: `pathToClaudeCodeExecutable` 을 안 주면 어떻게 되는지 한 번, 주면 되는지 한 번 | 사람 | 기록 |
| W1.M | **관문.** 예측표 P-W1 대조 | meta | `runs/<날짜>-W1M.md` |

통과: `PREDICTIONS.md` P-W1 의 열둘 중 열 이상. **P-W1.1(회사 계정) · P-W1.5 · P-W1.6 · P-W1.6b · P-W1.11(승인 중계와 규칙)은 필수** — 승인 중계는 A안 · D안 대비 B안의 유일한 차별점이라 여기서 빗나가면 방식 선택을 다시 연다. 하나라도 빗나가면 원인을 적고 설계(DESIGN 3절 판정)를 다시 연다 — 예측을 고치지 않는다.

## W2 · 서버 뼈대 (2주) — 봇이 살고 말이 오간다

| # | 일 | 산출물 |
|---|---|---|
| W2.1 | 새 저장소 골격: PRD · ARCHITECTURE · ADR · TASKS · VERIFICATION (prodev 식). DESIGN 4절이 ARCHITECTURE 의 뼈 | 문서 다섯 |
| W2.2 | 저장소 파일 둘: `chat.db`(minidiscord 표 여섯, 열 이름은 `research/coupling-inventory.md` C.3 그대로, `bots.token` 은 uuid) · `cockpit.db`(조종석 표 다섯, DESIGN 4.3). `stored_path` 는 DB 폴더 기준 상대 경로 — 시험에 넣는다. 글을 넣을 때 봉투를 파싱해 **`message_targets` 행을 채우는 함수**와 `bot_inbox` 큐 | `db.js` + 시험(`chat.js --json` 의 `targets` 칸이 나오는지까지) |
| W2.3 | 세션 관리자: `query()` 하나 · `bot_inbox` 큐(`idle` 에서만 푼다) · 상태 셋 · `resume` 재기동 · 봉투 씌우기(2.4 의 꼴) · **`session_events` 적재**(화면은 W3, 적재는 여기 — P-W2.8 을 재려면) | `session.js` + 시험(모의 SDK) |
| W2.4 | 프로세스 안 MCP `cockpit`: `reply` · `fetch_history` (채널 플러그인과 같은 서명 · 같은 절단 상한) | `mcp.js` + 시험 |
| W2.5 | 승인 중계: `canUseTool` → DB(`tool_use_id` 키 · `agent_id`) → admin WebSocket → 요청마다 첫 답 → 시간 초과 deny. `suppressAlwaysAllowRule` · `defaultToNo` 를 카드에 반영. 요청과 답을 본방 system 글로도 | `permissions.js` + 시험(도우미 둘이 동시에 묻는 사례 포함) |
| W2.6 | 계정 · 역할 · 쿠키 · 첫 admin 만들기 명령 | `auth.js` + 시험 |
| W2.7 | 웹 최소: 로그인 · 방 둘 채팅 · 첨부 올리기 · 봇 상태 표시 · admin 승인 카드(글자만) | 화면 |
| W2.8 | API: `POST /api/projects`(봇 폴더 + 방 둘 만들기 = setup.js 호출) · `POST /api/rooms/:id/messages`(재생용) · `GET /api/rooms/:id/messages?since=` | API 문서 |
| W2.9 | **prodev PR 하나**(DESIGN 5절): 도구 이름 치환 · `.mcp.json` 안 만들기 · env 이름 · `setup.js` 의 방 만들기를 조종석 API 로 · **`setup.js` 가 봇 설정에 박는 `{{UPLOADS_DIR}}`(`additionalDirectories`)을 조종석 업로드 폴더로 · `deny` 에 `cockpit.db` 경로(`Read` · `Edit` · `Write`) 추가 · `MINIDISCORD_DB` 값은 `chat.db`** · 시험 갱신 · ADR 한 절 · `docs/launch.md` 4절 다시 쓰기 | PR |
| W2.10 | meta 도구: `replay.js` 를 조종석 API 로(대본 JSON 은 그대로) · **`weekly.sh` 를 node 로 옮긴다**(회사 PC 에 zsh 가 없다 — HANDOFF 3절. `evo-count.js` 선례) · DB 는 회사 PC 에 있으니 meta 는 **DB 사본 셋(`.db` · `-wal` · `-shm`)을 옮겨** 읽기 전용으로 센다 | meta 도구 |
| W2.M | **관문.** 대본 다섯(R1~R5, `../../scripts/R?-*.json`)을 조종석으로 재생. 채점표는 `../../scripts/scoring.md` 그대로 + 조종석 칸 셋(재기동 · 승인 · 놓친 글) | `runs/<날짜>-W2M.md` |

통과: 3단계 관문(T3M, 12/14)과 같거나 낫고, 조종석 칸 셋이 예측 안.

## W3 · 조종석 판 (2주) — 일하는 과정이 보인다

| # | 일 | 산출물 |
|---|---|---|
| W3.1 | `session_events` 적재와 재접속 시 되그리기(턴 단위 접기) | |
| W3.2 | 조종석 판: 도구 호출 · 도우미 진행(`task_*`) · 훅 결과(막힘 빨강) · 문맥 사용률 · 누적 값 · 모델 | 화면 |
| W3.3 | 승인 카드: 허용 · 이번 세션 허용(`updatedPermissions`) · 거부 + 이유 | 화면 |
| W3.4 | 세션 조작(admin): 멈춤(`interrupt`) · `/compact` · 끄기 · 다시 켜기 · 백그라운드 도우미 목록과 `stopTask` | 화면 |
| W3.5 | 파일 판: 과제 저장소 읽기 전용 트리 · 미리보기(md · csv 앞 50행 · png) | 화면 |
| W3.6 | 과제 탭(세션 여럿) · 봇 상태 · 압축 경계 표시 | 화면 |
| W3.7 | 서버 강제 종료 → 재기동 → "이어서 합니다" 대본 | 대본 |
| W3.M | **관문.** 채점표는 돌리기 전에 적는다(`../../scripts/scoring-cockpit.md`, 날짜 남김) | `runs/<날짜>-W3M.md` |

## W4 · 실전 2주 — 옛 T4 를 조종석 위에서

`../../HANDOFF.md` 4절 그대로. 주간 계측은 `weekly.sh`(조종석 DB) + `cost.js`. 예측은 `../../predictions/prodev-prediction.md` 의 4단계 절 + `PREDICTIONS.md` 의 W4 절.

## 하지 않는 것 (첫 판)

서비스 등록 · diff 창 · 대화 되감기(fork) · 범용 화면 · SSO · 모바일 최적화 · Codex 등 다른 CLI · 봇 여럿의 협업.
