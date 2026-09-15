# cockpit 관문 M5.M (v2 제작) 채점표 — 2026-09-14 22:10 적음, M5 코드가 오기 전

대상: cockpit M5 커밋(M5.0~M5.11) + prodev PR(방 하나 판, M5.10). 예측은 `plans/2026-09-14-cockpit-후속/PREDICTIONS-v2.md` P-M5. meta 가 사본에서 직접. 판정: ① 열둘 중 열 ○(굵은 다섯 필수) · ② 대본 다섯 v2 합 ≥ 34/42 · ③ R8 여덟 중 여섯 ○(굵은 셋 필수).

## ① cockpit 자체
| # | 칸 | ○ 조건 (예측) |
|---|---|---|
| **1** | `npm test` 무의존 | fail 0 · skipped 0 · pass ≥ 200 (형제 둘 env 로) |
| **2** | 화면 원본 보존 | 사본에서 `design-tokens.css` · `rich.js` 가 minidiscord `6633f7b` 원본과 머리 줄 빼고 sha256 같음 · `style.css` 원본 구간 같음 · `--md-` 토큰 34 · `app.js` 달라진 최상위 함수가 ARCHITECTURE 7.3 표의 것뿐(정적 시험 통과) · 인라인 script 0 · 외부 src/href 0 · `/api/bots` 0 |
| **3** | 방 만들기 = 봇 생성 | 사본 + 스크래치 prodev 로 `POST /api/rooms {name}`(admin) → 201 · 방 1(`prodev-<과제>`) · `/` 든 방 0 · 봇 1 · `agent_sessions` stopped 1 · 봇 폴더에 `.claude/settings.local.json` · 과제 폴더 하위 12 · 같은 이름 409 · member 403 · `prodev-` 이름 400. `--fail-setup` 스모크: 502 · `ROLLBACK_BOT_DIR_EXISTS no` · `ROLLBACK_ROWS 0` |
| **4** | 봉투 규칙 | 봉투 없는 글(어느 방이든) → `message_targets` 0 · `bot_inbox` 0 · 봇 턴 0(`delivered` 0). `@TO` → to · `@CC` → cc · 모르는 이름 400 |
| **5** | 접이식 판 | `panelOpenByDefault`: member 접힘 · admin 펼침 · 기억값 우선 · `index.html` 에 `#cockpit-panel` · `#panel-toggle` 하나씩 · cockpit CSS 덩이에 `#` 색 · `rgb(` · `hsl(` 0 · v1 `web-card` · `web-cockpit` 시험 무변경 초록 |
| 6 | `fetch_history` 첨부 | 첨부 글에만 `attachments[{filename, path}]` · path 절대 · 첨부 없는 이력 v1 과 바이트 동일(시험) · 20/16000B 상한 시험 |
| 7 | 방 보관 | `POST /api/rooms/:id/archive` → 세션 stopped · archived · 글 POST 409 · 두 번째 409 · 도우미 돌면 409 TASKS_RUNNING → `?confirm=1` · member 403 |
| 8 | 이관 `migrate-v2` | v1 판 스크래치 chat.db 에 보이기만 → 행 변화 0 · `--apply` → files 방 archived · 글 · 첨부 · 대상 · 큐 행 수 그대로 · 두 번째 실행 "보관 0" · `serve` 경고 한 줄 뒤 뜸 |
| 9 | 스모크 v2 (meta 사본 · haiku) | `m5-room`: `ROOM_CREATE_API 201` · `ROOMS_FOR_PROJECT 1` · `PLAIN_MESSAGES 2 TARGET_ROWS 0 INBOX_ROWS 0` · `BOT_TURNS_AFTER_PLAIN 0` · `FETCH_HISTORY_CALLED yes` · `FETCH_HISTORY_HAS_ATTACHMENTS yes` · `READ_ATTACHMENT yes` · `BOT_REPLY` · `ARCHIVE_API 200`. `m1-envelope` · `m2-approval` · `m2-compact` · `m3-restart` · `m4-sessions` 가 방 하나 판으로 exit 0 |
| 10 | 옛 시험 이름 짝 | as-built 에 대체된 시험 이름 짝 표(web-chat 5 · web-tabs 3 · chat-db 둘 · http-projects 하나) · 지운 파일 넷 없음 |
| 11 | prodev PR 사본 | `npm test` fail 0 · pass ≥ 142 · `grep "files 방\|/files 방\|방 둘\|방은 둘"` 0 · 새 ADR 한 절(ADR-022 · 038 ⑤ 대체됨 표시) · cockpit `COCKPIT_PRODEV_DIR=<가지>` npm test fail 0 skipped 0 |
| 12 | 화면 시험 이관 목록 (D0-v2 #11) | as-built 에 "고친 자리(7.3 표)에 대응하는 minidiscord 기준(AC-WEBUI · WEBMD · WEBATTACH · ACNAV) 목록과 cockpit 시험 이름 짝" ≥ 8 |

## ② 옛 대본 다섯 v2 (scoring.md 칸 그대로, 방 조건은 "같은 방")
R1 ≥ 6/6 · R2 ≥ 10/13 · R3 ≥ 5/6 · R4 ≥ 6/8 · R5 ≥ 7/9 → 합 ≥ 34/42. 손 걸음은 8.3 admin API. 재생 순서 R1 → R2 → R3 → R4 → R5 → R8. 새 기준선 — 옛 판정과 비교하지 않는다.

## ③ R8 사람끼리 · 따라잡기 (`R8-catchup.json`, 2026-09-14 씀)
| # | 칸 | ○ 조건 |
|---|---|---|
| **8-1** | 봉투 없는 글 여섯(s1~s5 · s8)이 봇에게 안 감 | `message_targets` 0 · `bot_inbox` 0 |
| **8-2** | 사람끼리 글 사이 봇 턴 0 | s1~s6 구간 `delivered` 0 · `result` 0 |
| **8-3** | s7 뒤 봇이 `fetch_history` 로 끌어옴 | `tool_use` `mcp__cockpit__fetch_history` ≥ 1 · ≤ 2 · 그 `tool_result` 에 `attachments` |
| 8-4 | 첨부를 읽음 | `tool_use` Read 의 `file_path` 가 uploads 아래 csv (또는 intake-copy 로 inbox 에 복사 뒤 읽음) |
| 8-5 | 들이기 시작 | s7 뒤 90초 안에 `tmp/*read*.md` 또는 "이렇게 읽었습니다" 표 답 · `inbox/` 폴더 1 |
| 8-6 | 사람끼리 한 말을 반영 | s7 답 또는 읽은 표에 `SH-2200` · `µm` · `GV-80` 셋 중 둘 이상 |
| 8-7 | 요약(s10) | 답 ≤ 5줄 · 사람끼리 글의 내용 셋 중 둘 이상 · 봇이 부른 글(s7 · s10)은 세지 않음 |
| 8-8 | 승인 | R8 안 승인 요청 ≤ 2 |

반려 사유: ① 굵은 다섯 중 하나라도 ✗ · ② 합 < 34 · ③ 굵은 셋 중 하나라도 ✗.
