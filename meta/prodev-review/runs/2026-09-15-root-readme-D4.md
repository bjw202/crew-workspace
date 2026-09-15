# 루트 README 관문 D4 (crew-workspace/README.md v2 — 구조 중심) — 2026-09-15 11:50~12:20 (meta-f3)

대상: `crew-workspace/README.md` 656줄(별도 meta 세션 meta-c7 이 씀, **미커밋**). 채점표 `../scripts/scoring-root-readme.md`(03:20, 문서 전). **예측표에 P-D4 숫자를 따로 적지 않았다** — 채점표의 문턱(열넷 중 열하나 · 굵은 넷 · 그림 ≥ 5 · 틀림 0 · ≤ 700줄)이 예측 구실을 했다. 다음 문서 관문부터는 P-줄을 먼저 적는다. meta 가 직접: 완독 · 그림 여덟을 mermaid-cli 로 따로 그림 · 문장 열둘을 코드와 대조 · 보고의 새 발견 둘을 재현.

## 판정: **통과** — 14/14 (굵은 넷 ○). 주석 하나(9절 "yaml").

| # | 칸 | 결과 | 근거 |
|---|---|---|---|
| 1 | 한눈에 | ○ 이야기 한 문단 + 저장소 표 일곱 | 1절 |
| **2** | **cockpit 과 prodev 의 관계** | **○** 그림 1(소유 · 호출 · DB 둘 · prodev 상자 안의 봇 폴더) + 소유 표(방 · 계정 · DB 둘 · 봇 폴더 · 과제 폴더 · 첨부 · 스킬, 자리 · 만드는 이 · 쓰는 이 · 근거) · "cockpit 이 주는 것 셋" | 2절 |
| **3** | **방 만들기 → 봇 세션 (sequence)** | **○** 3.1 만들기(POST → createRoom 검사 → setup.js → 과제 폴더 · 봇 폴더 · 설정 두 장 → alt 되돌림/성공 → DB 두 줄 → 201) · 3.2 켜기(query cwd · settingSources · resume → CLI 가 설정 두 장 · 뿌리의 CLAUDE.md · 스킬 · 도우미 → SessionStart 여덟 절 → init) — 걸음 ≥ 8 · 실제 이름 · 되돌림 갈래 | 3절 |
| 4 | 스킬은 어떻게 받나 | ○ **코드와 세션 기록 두 곳에서 실증**: setup.js 는 복사 · 링크 안 함(`:309-356`), CLI 가 cwd 에서 위로 올라가 뿌리 `.claude/skills` 를 실음(세션 기록 `Base directory for this skill: …/prodev/.claude/skills/{find,intake,prodev-orchestrator}`, 열다섯 이름, `CLAUDE.md` 실림, `init` agents 여섯). 스킬 열다섯 표 · 분기표 열 줄 | 4절 |
| **5** | **자료 정리 흐름** | **○** 5.1 flowchart(첨부 → inbox 0444 · SHA → data-reader → ① 표 · 번호 → ② 확정? → ③ valid · 위키 · index → ④ pre-reply 훅 → 공지 · 커밋 / 막힘) · 확정 조건 다섯 · 카드 머리말 예 · 5.2 여섯 층 flowchart + `find.log` 봇 폴더 | 5절 |
| **6** | **retro 진화** | **○** 가상 예 → 입구 둘 · 문 하나(ADR-035) → flowchart(일지 · find.log · review → retro → 제안 넷 → 사람 갈래 → house.md 50줄 · templates · analysis/methods · 스킬은 PR) · cron 없음 · ADR-031~037 표 | 6절 |
| 7 | 봇의 세계 | ○ 표 열 줄(방 하나 · 봉투 · 봉투 없음 · reply · fetch_history · 훅 셋 · 승인 · 압축 알림 · resume) + 상태 여섯 stateDiagram | 7절 |
| 8 | 그림 기준 | ○ **8 그림 전부 svg 생성, 오류 0** · 그림마다 위 한 문장 · 실제 이름(`POST /api/rooms` · `setup.js --project` · `SSE room_created` · `session-start.js` · `index.js` · `pre-reply` …) · 마디 ≤ 12(6절 12) · 종류(sequence 2 · state 1 · flowchart 5) · 아래 "읽는 법" | mermaid-cli |
| 9 | 중학생 수준 | ○(주석) 0절 낱말 서른 줄 · 절마다 예. 풀이 없이 쓴 말 하나: "yaml 꼴 머리말"(5.1) | |
| 10 | 사실 정확성 | ○ 열둘 대조 틀림 0: 401/403 줄 · 이름 규칙 `create.js:52,55` · `chat-db.js:71` · setup 60초 · **거부 열 = 10**(v2 실물 10건: Edit 5 · uploads Write/Edit 2 · cockpit.db 3) · `session-start.js` 여덟 절 · house 50 · `pre-reply.js:104-` 조건 · `manager.js:279-281` 승인 대기 · `config.js` maxSessions 3 · `env.js` 15 · intake `:66-69` | grep · `~/cockpit-try-v2` |
| 11 | 옛 절 처리 | ○ 9절에 접어 두고(포팅 표 셋) 전문은 커밋 `7558b26` 의 README · `WINDOWS.md` 로 링크 — "접거나 링크" 로 인정 | 9절 |
| 12 | 지켜야 할 절 | ○ 8.2 git(핀 표 갱신, cockpit · knowledge 핀 없음 명시) · 8.3 잘 안 될 때 | 8절 |
| 13 | 링크 | ○ cockpit README · EXPLANATION · prodev README · ADR · HANDOFF · WINDOWS | 10절 |
| 14 | 길이 · 근거 | ○ 656 · `파일:줄` · ADR | |

## 보고의 새 발견 — meta 가 재현 · 판단
| # | 발견 | 재현 | 판단 |
|---|---|---|---|
| Q1 | **봇 세션에 사람의 개인 지침 `~/.claude/CLAUDE.md` 가 실린다** | **재현**: `~/.claude/projects/-Users-byunjungwon-cockpit-try-v2-…/43b089b6….jsonl` 에 `Contents of /Users/byunjungwon/.claude/CLAUDE.md` 1건. `settingSources` 에 `user` 가 없어도 실렸다 | **중요.** 회사 PC 에서 PL 의 개인 지침이 봇에 섞인다. 원인 후보 둘: 홈 아래 설치라 위로 올라가는 탐색이 홈에 닿음 / Claude Code 가 사용자 CLAUDE.md 를 settingSources 와 무관하게 실음. **cockpit 후속 N18**: 어느 쪽인지 실증(홈 밖 설치본으로 한 번) → INSTALL 에 규칙(홈 밖에 설치, 예 `C:\work`) 또는 `CLAUDE_CONFIG_DIR` 로 봇 전용 설정 자리 |
| Q3 | 열린 실(`threads/`) 자리 엇갈림 — intake · brief · close 는 봇 폴더, `session-start.js:105` 는 과제 폴더 | 코드 인용 확인 | prodev PR 후보 |
| Q4 | **`node scripts/index.js next E` 는 없는 명령** | **재현**: `next` 를 과제 폴더로 읽어 "과제 폴더가 없다: …/next", exit 0 | **PR #20 이 intake 에 넣은 문장이 안 도는 명령을 가리킨다.** prodev PR 후보(index.js 에 `next <E|R|D>` 하위 명령을 더하거나, 스킬 여섯 곳을 "인자 없이 돌린 출력의 `next E:` 줄" 로) |
| Q5 | 스킬 셋의 cron 08:00 · 18:30 언급 vs ADR-036 · setup.js "cron 없음" | 인용 확인 | prodev PR 후보(문구) |
| Q6 | meta 문서 오류: `AS-IS-TO-BE-v2.md` "스킬 링크" · find.log 자리 · `DIRECTION-v2.md:52` | 맞다 — v1 스크래치(makeScratch)의 링크를 실전으로 잘못 옮겨 적었다 | **meta 가 고친다**(이 기록과 함께) |
| Q7 | 옛 판 절 축약 · 링크 | 위 11 | 인정 |
| Q8 | "주방" 이 아니라 "공방" | 원문 제목 "에이전트 SDK 공방" — meta 의 지시문이 "주방 비유" 라 적은 것이 부정확 | 인정. 문서는 공방 |
| Q2 | cockpit · knowledge 핀 · 원격 없음 | 사실 | 사람 결정 대기(원격 만들지) |

## 새로 본 것
- 문서 관문이 코드 결함 둘(Q1 개인 지침 · Q4 없는 명령)을 잡았다 — 중학생 독자 · 사실 검토자 서브에이전트 구성의 값어치.
- 루트 README 11절 "확인하지 못한 것 열" 이 좋다 — 다음 회차 후보 목록으로 그대로 쓸 수 있다.
