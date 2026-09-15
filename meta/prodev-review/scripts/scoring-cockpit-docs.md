# cockpit 문서 관문(D0) 채점표 — 2026-09-14 적음, cockpit 세션이 문서를 내기 전

관문 이름: **D0 · 문서 다섯**. 대상: `cockpit/docs/{PRD,ARCHITECTURE,ADR,TASKS,VERIFICATION}.md` + `README.md` + git 첫 커밋.
판정: 칸 열여덟 중 **열다섯 이상 ○, 단 굵은 칸(계약 여섯)은 전부 ○** 이어야 통과. 반려면 빗나간 칸만 돌려보낸다. 결과를 보고 칸을 더하거나 빼지 않는다.

| # | 칸 | 어떻게 세나 | ○ 조건 |
|---|---|---|---|
| 1 | 파일 다섯 + README + 커밋 | `ls docs` · `git log --oneline` | 다섯 다 있고 커밋 1개 이상 |
| **2** | **도구 서명** | ARCHITECTURE 에 `reply(chat_id?, text, files?)` · `fetch_history(chat_id?, since_id?, since?, until?, speaker?, limit?)` 글자 그대로 | 둘 다 있고 이름은 `mcp__cockpit__…` |
| **3** | **봉투 meta 다섯** | `chat_id · message_id · delivery · sender · author_type` 이 수신 글 규격에 | 다섯 다 |
| **4** | **chat.db 표 여섯** | 표 이름 여섯과 `minidiscord/server/src/db.ts` 열 대조 | 이름 · 열 일치, `bots.token` uuid · `stored_path` 상대 경로 명시 |
| **5** | **cockpit.db 분리 + deny** | `accounts · web_sessions · agent_sessions · session_events · permission_requests · bot_inbox` · 봇 설정 deny 언급 | 여섯 표 + deny |
| **6** | **SDK 옵션 조합** | `default` · `allowedTools` 둘만 · `canUseTool` · `persistSession true` · env 화이트리스트 · `pathToClaudeCodeExecutable` · `settingSources ['project','local']` | 일곱 다 |
| **7** | **큐 규칙** | "idle 에서만 푼다 · 멈춤/compact 즉시 · 재기동 시 delivered_at null 순서" | 셋 다 |
| 8 | 승인 규격 | `toolUseID` 키 · `agentID` · 첫 답 · 무응답 deny · `suppressAlwaysAllowRule`/`defaultToNo` · 🔒 system 글 · admin 만 | 일곱 중 여섯 |
| 9 | HTTP 길 셋 모양 유지 | `GET /api/rooms` · `POST …/messages`(multipart) · `GET …/messages?after=` | 셋 다, "replay.js 무변경" 언급 |
| 10 | 제약 여섯 | Node ≥ 22 · `node:sqlite` · 빌드 없음 · CDN 없음 · 윈도우 우선 · 제품명에 Claude Code 없음 | 여섯 중 다섯 |
| 11 | 화면 셋 · 역할 둘 | 채팅 · 조종석 · 파일 / admin · member 와 각자 되는 것 | 있음 |
| 12 | 마일스톤 M1~M4 와 끝 조건 | 끝 조건이 시험 이름 · 파일 · 명령 출력 같은 **기계가 셀 수 있는 것** | 마일스톤마다 하나 이상 |
| 13 | VERIFICATION: `npm test` 가 서버 · SDK 없이 돈다 | 명시 | 있음 |
| 14 | VERIFICATION: 모의 SDK 와 진짜 SDK 스모크 구분 | 둘을 다른 명령으로 | 있음 |
| 15 | ADR 일곱 결정 | SDK · DB 둘 · default+allowedTools · 표 여섯 유지 · 길 셋 유지 · env 화이트리스트 · 빌드 없음 | 일곱 중 여섯 |
| 16 | 설정 파일 한 장(`cockpit.json`) 항목 | 봇 폴더 · 과제 폴더 · 업로드 폴더 · claude 경로 · 동시 세션 상한 | 다섯 중 넷 |
| 17 | 안 하는 것 목록 | DESIGN 12절의 첫 판 제외 항목 | 넷 이상 |
| 18 | 질문 · 가정 목록 | 보고 메시지 또는 문서 | 있음 (0건이면 "없다" 를 적어야 ○) |

반려 사유가 아닌 것: 문체 · 길이 · 그림 유무. 반려 사유: 굵은 칸 하나라도 ✗, 또는 열다섯 미만.
