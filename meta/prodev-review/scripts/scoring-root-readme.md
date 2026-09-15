# 루트 README 관문 D4 (crew-workspace/README.md v2 — 구조 중심) 채점표 — 2026-09-15 03:20 적음, 문서가 오기 전

대상: `crew-workspace/README.md` 다시 쓴 판(별도 meta 세션이 쓴다). 독자: 이 워크스페이스를 처음 보는 사람 · Agent SDK 처음인 PL, 중학생 수준. 판정: 열넷 중 **열하나 이상 ○, 굵은 넷 전부 ○**. meta-f3 가 읽고 코드 · ADR 과 대조.

| # | 칸 | 어떻게 세나 | ○ 조건 |
|---|---|---|---|
| 1 | 한눈에 | 첫 절에 "무엇이 무엇을 하는가" 한 문단 + 저장소 표(meta · prodev · cockpit · minidiscord(옛 창구, 읽기) · crew(닫힌 실험) · knowledge · projects) 와 각 역할 한 줄 | 표 있음 · 일곱 다 |
| **2** | **cockpit 과 prodev 의 관계** | "cockpit 은 창구 · 세션 host, prodev 는 봇의 하네스(지침 · 스킬 · 훅 · 스크립트 · 봇 폴더)" 를 그림 하나 + 표(누가 무엇을 소유하나: 방 · 계정 · DB 둘 / 봇 폴더 · 과제 폴더 · 스킬)로 | 그림 + 표 · 실제 파일 이름 |
| **3** | **방 만들기 → 봇 세션까지 (sequence)** | admin `+` → `POST /api/rooms` → `createRoom` → `setup.js --project --cockpit` → 과제 폴더 · 봇 폴더 · `settings.json` · `settings.local.json` → `chat.db` 봇 · 방 → `agent_sessions` → 켜기 → `query({cwd: 봇 폴더, settingSources: ['project','local'], resume})` → CLI 가 `CLAUDE.md` · 훅 셋 · 스킬 15 · 도우미 6 을 읽음 | 걸음 ≥ 8 · 화살표에 실제 이름 · 되돌림 갈래 |
| 4 | 스킬은 어떻게 받나 | 봇 폴더 → prodev `.claude/skills`(cwd 위쪽 · 링크 · setup 이 두는 자리 — 실제 코드로 확인해 적음) · 스킬 열다섯 이름과 한 줄씩 · `prodev-orchestrator` 분기표가 고르는 법 | 실제 자리 · 열다섯 · 분기 |
| **5** | **자료 정리 흐름 (flowchart)** | 첨부 → `inbox/<날짜-주제>/`(원본 · `files.md` 사이드카 SHA · `reading.md`) → 문답 → "확정"(훅 조건 다섯) → `cards/E-0001.md`(머리말 칸) → `index.md` · `wiki/` · `journal/` · `threads/` · `research/` → `find.js` 여섯 층 순서 · `find.log` | 흐름 그림 · 폴더 이름 · 확정 관문 · 여섯 층 |
| **6** | **진화(retro) 흐름** | `journal/*.md` · `find.log` · `.review.md` → 사람이 부르는 `retro` → 되풀이 · 막힘 · 굳힐 후보 제안 → 사람 승인 → `house.md`(50줄 상한) · `templates/` · `analysis/methods/` 에 굳음 · "앞으로만 굳고 세지 않는다"(ADR-031~037) · cron 없음 | 그림 + ADR 번호 · 굳는 자리 셋 · 제동(사람이 부름) 명시 |
| 7 | 봇의 세계 | 방 하나 · 봉투 `@TO` `@CC` · 봉투 없는 글은 안 감 · `reply` · `fetch_history` 따라잡기 · 훅 셋(SessionStart · PreCompact · PreToolUse) · 승인 카드 · 압축 · 인수인계서 · 재기동 resume | 아홉 다 · ADR-039 · 018 · 020 |
| 8 | 그림 기준(9b) | 그림마다 위 한 문장 · 실제 이름 · 마디 ≤ 12 · 종류 맞음 · 아래 "읽는 법" | 그림 ≥ 5 · 렌더 오류 0 |
| 9 | 중학생 수준 | 풀이 없는 낯선 말 0 · 절마다 예 하나 | 0 |
| 10 | 사실 정확성 | meta 가 문장 12 를 코드 · ADR 과 대조 | 틀림 0 |
| 11 | 옛 절의 처리 | v1 절(터미널 셋 켜기 · minidiscord 창구 · 윈도우 포팅 경위)은 지우지 말고 "옛 판(2026-09-13, minidiscord 창구)" 으로 접거나 링크 | 옛 사실 보존 · 지금 판과 안 섞임 |
| 12 | 지켜야 할 절 | "git 은 이렇게 한다" · `workspace.json` 핀 설명 · "잘 안 될 때" 표 | 셋 다 있음(갱신됨) |
| 13 | 링크 | cockpit README · `docs/ARCHITECTURE_EXPLANATION.md` · prodev README · `design/v3/ADR.md` · meta HANDOFF 로 링크, 같은 내용 중복 ≤ 한 문단 | 링크 넷 |
| 14 | 길이 · 근거 | ≤ 700줄 · 사실마다 파일 경로 또는 ADR 번호 | 둘 다 |

반려 사유: 굵은 넷 중 하나라도 ✗ · 열하나 미만. 커밋은 사람이 시킬 때.
