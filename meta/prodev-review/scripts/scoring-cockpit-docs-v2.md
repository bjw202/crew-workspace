# cockpit 문서 관문(D0-v2) 채점표 — 2026-09-14 21:30 적음, cockpit 세션이 문서를 고치기 전

대상: `cockpit/docs/{PRD,ARCHITECTURE,ADR,TASKS,VERIFICATION}.md` 의 v2 개정 커밋(들) + `docs/log.md` 회차 절. 요구는 `plans/2026-09-14-cockpit-후속/AS-IS-TO-BE-v2.md` 의 R9~R14.
판정: 열여섯 중 **열셋 이상 ○, 굵은 여섯은 전부 ○**. 반려면 빗나간 칸만 돌려보낸다. 결과를 보고 칸을 더하거나 빼지 않는다.

| # | 칸 | 어떻게 세나 | ○ 조건 |
|---|---|---|---|
| **1** | **ADR 여섯 · 옛 결정 보존** | `ADR.md` 에 새 번호 여섯(방 하나 · 화면 계승 · 방 만들기 = 봇 생성 · `@` 규칙 · 접이식 판 · 첨부 읽는 때). 뒤집히는 옛 결정(F2 방 둘 · 자체 화면 · F3 본방 기본 `to`)은 지우지 않고 "대체됨 → ADR-0xx" | 여섯 다 · 지운 옛 ADR 0 |
| **2** | **PRD 기능 표 개정** | F2(방 하나) · F3(`@TO` `@CC` 만) · F15(화면: minidiscord 계승 + 접이식 판) 고침 · 새 줄 셋 이상: 방 만들기 = 봇 생성 · `fetch_history` 첨부 · member 접힘 기본 | 고침 셋 + 새 줄 셋, 각 줄에 "어떻게 확인하나" 칸 |
| **3** | **봉투 규칙 표 (ARCHITECTURE 4.3)** | 본방 `@` 없음 → 봇에게 **안 감** · `@TO` → to · `@CC` → cc · 방에 없는 이름 → 400. files 방 줄 삭제 | 표가 minidiscord `targets.ts` 규칙과 같음 |
| **4** | **API 대조표 (8절)** | minidiscord 화면이 부르는 길 15 를 "있음 / 더함 / 화면 고침" 셋으로 나눈 표. 더함: `POST /api/rooms` · `/api/rooms/:id/archive` · `fetch_history` 첨부 칸. 화면 고침: 방별 SSE → `/api/stream`. 옮기지 않음: `/api/bots*` · `/api/rooms/:id/bots*` | 15 다 분류 · 옮기지 않는 것에 까닭 |
| **5** | **화면 7절 — 이식 명세** | 옮기는 파일 목록(`web/app.js` · `rich.js` · `style.css` · `index.html` · `design-tokens.css`) · 출처 커밋 sha(minidiscord `6633f7b`) · 토큰 값 무변경 선언 · 고치는 함수 목록(SSE · 방 만들기 · 봇 배정 제거 · 작성기 `@TO` 미리 채움) · 접이식 판의 DOM 자리와 접힘 기본값(member) | 다섯 다 |
| **6** | **하네스 맞물림 (11절)** | prodev 고칠 자리 11(pre-reply 조건 ② · places.js · intake · orchestrator · research · charter · close · CLAUDE.md 7행 · find.js · index.js · ADR-022/038 대체) 목록과 각각 "무엇으로" | 11 다 · prodev 새 ADR 번호 자리 |
| 7 | TASKS M5 절 | 태스크마다 끝 조건이 시험 이름 · 파일 · 명령 출력 | 태스크 ≥ 6 · 전부 기계가 셀 수 있음 |
| 8 | VERIFICATION M5.M 절 | 대본 다섯 v2 + 새 대본 R8 재생 · 스모크 목록 · `npm test` 무의존 유지 | 있음 |
| 9 | "안 하는 것" 갱신 | 봇 배정 화면 · 봇 없는 방 · 딥링크 · 브라우저 안 열기 · 채널 플러그인 | 넷 이상 |
| 10 | `fetch_history` 서명 개정 | 결과 항목에 `attachments:[{id, filename, path}]` · 옛 호출 호환(칸 추가만) · 상한 16000B 그대로 | 셋 다 |
| 11 | 화면 시험 이관 계획 | minidiscord 의 AC-WEBUI-001~016 · WEBMD · WEBATTACH 기준 중 옮길 것 목록과 `node --test` 순수 함수 · 정적 검사로 어떻게 재는지 | 목록 ≥ 15 · 방법 |
| 12 | 방 만들기 흐름 | admin `POST /api/rooms {name}` → 방 1 · 봇 1 · 봇 폴더(prodev `setup.js --project` 호출 또는 같은 일) · 세션 줄 → 실패 시 롤백(남는 것 0) · 같은 이름 409 · member 403 | 여섯 다 |
| 13 | 역할별 첫 화면 | member: 채팅 + 조종석 판 접힘 / admin: 펼침. 접힘 상태 저장 자리 | 있음 |
| 14 | 대본 호환 | 옛 대본 v2(방 하나)가 `replay.js` 무변경으로 돈다 — 방 이름 규칙(`prodev-<과제>`) 유지 명시 | 있음 |
| 15 | 데이터 이관 | 기존 `chat.db` 에 남은 `/files` 방 처리(보관으로 · 글은 그대로) | 있음 |
| 16 | log 절 · 질문 목록 | `docs/log.md` 에 v2 회차 절 · 새 질문(0 이면 "없다") | 있음 |

반려 사유가 아닌 것: 문체 · 길이 · 그림 유무. 반려 사유: 굵은 칸 하나라도 ✗, 또는 열셋 미만.
