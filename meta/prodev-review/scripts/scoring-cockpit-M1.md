# cockpit 관문 M1.M 채점표 — 2026-09-14 적음, M1 코드가 오기 전

대상: `cockpit/` M1 커밋들(M1.1~M1.7). 전부 **meta 가 사본에서 직접 돌린다**(`git archive HEAD | tar -x` 한 뒤 `npm ci`). 판정: 칸 열넷 중 **열둘 이상 ○, 단 굵은 칸 여섯은 전부 ○**. 결과를 보고 칸을 더하거나 빼지 않는다.

| # | 칸 | 어떻게 세나 | ○ 조건 (예측) |
|---|---|---|---|
| **1** | **`npm test` 가 서버 · SDK · 네트워크 없이 돈다** | 사본에서 `npm test` 요약 줄. 형제 prodev 가 있는 작업판에서 | `# fail 0` · `# cancelled 0` · `# skipped 0`(형제가 있으니 계약 시험도 돈다) · `# pass ≥ 40` |
| **2** | **chat.db 표 여섯의 열이 db.ts 와 같다** | `test/chat-db.test.js` 의 그 시험 + meta 가 `PRAGMA table_info` 를 직접 한 번 | 시험 초록 + 표 여섯 · 열 순서 일치 |
| **3** | **계약 시험: 형제 `chat.js --json` 아홉 칸 · `targets` · `show` 첨부 경로** | `test/contract/chat-js.test.js` 초록(건너뜀 아님) | 3/3 |
| **4** | **SDK 옵션 시험** | `test/sdk-options.test.js` 열한 항목 | 11/11, 특히 `allowedTools` 정확히 둘 · `env` 부분집합 · `bypassPermissions` 문자열 0 |
| **5** | **SDK import 격리** | `test/no-sdk-import.test.js` + meta 가 `grep -rl claude-agent-sdk src test` 직접 | 파일 하나(`src/session/sdk-query.js`)뿐 |
| **6** | **스모크 m1-hello (meta 가 돌림, haiku, 스크래치 봇 폴더)** | 출력 다섯 줄 | `SESSION_ID` 있음 · `BOT_REPLY message_id=` 있음 · `PRE_REPLY_MARKER yes` · `ASKED []` (reply 가 콜백으로 안 옴) |
| 7 | 스모크 m1-envelope | 출력 줄 | `REPLIED_TO_CC no` · `READ_ATTACHMENT yes` · `REPLY_CHAT_ID` 가 to 방 번호 |
| 8 | 스모크 m1-guard | 출력 줄 | `HOOK_BLOCKED yes` · `ROOM_MESSAGES_FROM_BOT 0` — haiku 가 1200자를 안 채우면 "판정 불가" 로 적고 이 칸은 셈에서 뺀다(실증 2 · 4g 와 같은 한계) |
| 9 | 세션 관리자 모의 시험 열 | `test/session-manager.test.js` | 10/10, 특히 `working 중 글은 result 뒤` · `waiting_approval 에서 안 푼다` · `넷째 세션 거절` |
| 10 | 봉투 시험: 채널 content 와 글자 그대로 | `test/envelope.test.js` | 여섯 초록 + meta 가 기대 문자열 하나를 `channel-server.ts:184-198` 규칙으로 손으로 재계산해 대조 |
| 11 | MCP 도구 시험 | `test/mcp-tools.test.js` | 전부 초록, `since_id 먼저` 포함 |
| 12 | `cockpit check` | `node bin/cockpit.js check --config cockpit.example.json` | 없는 경로마다 `✗ <키>` · exit 1 |
| 13 | D0 조건 이행 | ARCHITECTURE 에 `fetch_history` 매개변수 여섯 · Q12(compact 는 idle 대기) 반영(F8 · ADR-008 · 4.5) · Q7 기호 · Q9 origin | 4/4 |
| 14 | `docs/as-built.md` · `docs/log.md` | 있음, M1 절 | 있음 |

값 예측: 스모크 셋 합 ≤ $0.5 (haiku). 시간: meta 의 관문 작업 ≤ 40분.
반려 사유: 굵은 칸 하나라도 ✗. 스모크 6 이 "판정 불가" 면 모델을 sonnet 으로 한 번 더 돌린 뒤 판정.
