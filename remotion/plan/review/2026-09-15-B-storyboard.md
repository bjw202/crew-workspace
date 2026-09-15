# B 관문 판정 — 콘티 (03-storyboard.md · 04-implementation.md)

판정한 때: 2026-09-15. 채점표: `2026-09-15-B-storyboard-scoring.md` (콘티 작성자 띄우기 전에 적음).
대상: 03 (908줄, 장면 14 · 9,900 프레임) · 04 (347줄). 대조 기준: prodev 00feaa0 · cockpit ab77880.

## 1차 판정: **반려** (굵은 1칸 ✗ 하나. 나머지 9/10 ○)

| # | 칸 | 결과 | 근거 |
|---|---|---|---|
| **1** | 기획을 바꾸지 않았다 | **✗** | 02-plan **2판**의 용어가 안 실렸다. 장면 9 자막 "에이전트는 스킬이 부르며" (2판: "도우미는"), 장면 9 제목 "에이전트", 장면 12 제목 "resume" (2판: "이어 붙기(resume)"), 장면 13 "retro" (2판: "회고"), SEVEN_A ③ "(에이전트 추가)". 장면 수 · 순서 · 초 · 나머지 자막은 같다 |
| **2** | 화면 글자가 실제 꼴이다 | ✓ | 표본 22개 grep, 틀림 0 (아래 표). 단, **인용 줄 번호**는 prodev 쪽과 `create.js` 가 거의 다 어긋난다 (글자는 맞고 번호만 틀림 — 아래) |
| **3** | 구현 가능하다 | ✓ | S06 · S09 · S11 · S12 를 읽음. 프레임 구간 · 좌표 · 부품 · props 가 다 적혀 있다. 작은 어긋남 하나: S12 비트 0~60 은 서버 창을 `FolderTree`(TERM_12)로 정해 놓고 130~170 · 300~360 은 "`CodeBlock` B 줄 3 · 5" 라고 부른다 |
| 4 | 자리 고정 | ✓ | 04 STAGE 한 번 정의, 03 0절이 같은 표를 보이고 장면들이 참조 |
| 5 | 색 넷 + 경고 하나 | ✓ | human · server · cli · file · warn (+ 배경·글자·보조) |
| 6 | 움직임이 물건 이동 | ✓ | 14/14 "이동하는 물건" 열 |
| 7 | 자막 타이밍 | ✓ | 장면마다 시작·끝, 겹침 없음. 장면 14 셋째 자막(요지)은 55프레임으로 짧다 — 아래 결정 |
| 8 | 길이 합 | ✓ | 9,900 |
| 9 | 부품 재사용 | ✓ | 기존 넷 그대로, 새 15개 이름·props·장면 표 |
| 10 | 장면 파일 규칙 | ✓ | `S01~S14.tsx` · `DURATION` · `STILLS` · `index.ts` 합 검사 · Root Sequence 표 |

## 표본 대조 (meta 가 직접 grep · sed)

| 화면 글자 | 코드 | 결과 |
|---|---|---|
| `봇에게 가지 않습니다 — 부르려면 @` | `web/glue.js:7` | ✓ |
| `POST /api/rooms` · `/api/rooms/:id/messages` · `/api/projects/:name/session/start` · `/session/compact` · `/api/permissions/:toolUseId` | routes-*.js | ✓ |
| 원통 표 이름 rooms · messages · message_targets · bots / bot_inbox · agent_sessions · permission_requests | chat-db.js · cockpit-db.js CREATE TABLE | ✓ |
| `새 방(과제) 이름` · 봇 칩 ⚪🟢 · 카드 단추 셋 · 카드 줄 순서 | `app.js:352,567` · `card.js:7,54-60` | ✓ |
| 봉투 3종 (ENVELOPE_6 · 8 · 12) · `(첨부 파일 경로: …)` · 두 덩이 `\n\n` | `wrap.js:13,45,62-68` · `manager.js:323` | ✓ |
| `#kick` · `pendingInbox` · `wrapChannel` · `markDelivered` · `input.push` · `BATCH_LIMIT 20` · `DELIVERABLE` 에 starting 없음 | `manager.js:18,22,296-323` | ✓ |
| `✅ 김피엘 허용 · Bash` · `🔒 Bash 요청 · …` · 10분 · allow | `relay.js:32,36,60,129` | ✓ |
| fetch_history 결과 칸 cursor · id · at · author · body · attachments{filename,path} · since_id | `tools.js:60-64,126,129-138` | ✓ |
| 압축 알림 두 문장 · `compacting` · `compact_boundary` · `pendingCompact` · `percentage` | `manager.js:19-20,167,385-389,425` | ✓ |
| 서버 창 세 줄 (`끄는 중 —…` · `cockpit 듣는 중 http://…` · `resume 수율개선 → idle`) | `bin/cockpit.js:237,231,251` | ✓ |
| `# 인수인계서 (압축 직전 …)` · 여섯 칸 · 40턴 · 300자 · `claude -p --model sonnet` · 180000 | `pre-compact.js:144,26,24-25,106-108` | ✓ |
| 여덟 절 제목 · `[깨어남: compact] 나는 …bot다.` (붙여 씀) · house 50 | `session-start.js:95-138,85,29` | ✓ (4절은 아래 참조) |
| 확정 조건 ①~④ · 보는 차례 다섯 · 900자 10줄 · exit 2 · readOnly · exit 0 | `pre-reply.js:64-65,7-12,26,42-45,49,5` | ✓ |
| 하위 폴더 12 · 머리 셋 · house.md 골격 · 설정 두 장 · deny 2+3 추가 | `setup.js:205-206,223,249-251,329-331,289,295` | ✓ |
| `node ../../scripts/intake-copy.js <slug> <파일>` · `find.js <물음>` · 층 여섯 · `find.log` 칸 · LAYER_NAME[2]='카드 본문' | `intake-copy.js:4` · `find.js:4,7-12,281,289` · `orchestrator:65` | ✓ |
| 분기표 줄 · "회의록만인가요…" · 갈래 셋 · "이번에는" · 이어서 합니다 · retro (a)(b)(c) · "봇이 만들지 않는다" | `orchestrator:8-27,44-54,62` · `retro:79-83,109` | ✓ |
| 스킬 15 이름 · 도우미 6 이름 · model: opus | `ls .claude/skills` · `agents/*.md:2-5` | ✓ |

## 빗나간 줄

1. **용어 (반려 사유).** 위 1번 칸.
2. **인용 줄 번호.** `create.js:429·450·458·465·470` (파일 116줄) · `setup.js:261-262·278-279·305-307·316·322·347-349` (실제 205-206 · 223 · 249-251 · 289 · 295 · 329-331) · `pre-compact.js:374` (파일 177줄, 실제 144) · `CLAUDE.md:162` (파일 28줄, 실제 19) · `pre-reply.js:4·19-20·62-65` (실제 5 · 42-45 · 64-65) · `orchestrator/SKILL.md:13-28·39·47·54·63·66` (실제 8-27 · 38 · 46 · 53 · 62 · 65) · `intake/SKILL.md:76·86-97` (실제 63 · 74-87) · `retro/SKILL.md:121-123·131` (실제 79-83 · 109) · `journal/SKILL.md:59` (실제 37). cockpit 쪽 나머지는 맞다. 04 는 `text.ts` 머리에 이 번호를 옮겨 적으라 하므로 고쳐야 한다.
3. **SECTIONS_11 4절.** 코드는 `threads/<파일>` 절을 열린 실마다 하나씩 만든다 (`session-start.js:112`). "열린 실 (threads/)" 이라는 절 제목은 없다.
4. **S12 서버 창 부품 이름** 엇갈림 (위 3번 칸).

## 2차 판정: **통과**

콘티 작성자가 다섯 항목을 고쳐 냈다. meta 가 직접 grep 으로 확인한 것:
- 옛 줄 번호(`CLAUDE.md:162` · `create.js:429` · `pre-compact.js:374` · `retro:121` · `setup.js:261`) 잔존 0. 새 번호 표본 셋(`create.js:91` `out.code !== 0` · `session-start.js:109` 실 없을 때 절 · `orchestrator:12-13` 분기표 첫 두 줄) 맞음.
- 장면 9 자막 "도우미는 스킬이 부르며" = 02-plan 2판 원문. 제목 셋(9 도우미 · 12 이어 붙기(resume) · 13 회고) 맞음.
- SECTIONS_11 4절 `threads/<실>.md (열린 실마다 하나)`, 실이 없을 때의 `## 열린 실 (threads/)` 는 `:109` 로 근거 붙임.
- 장면 12 `CodeBlock B` 잔존 0.
- 장면 14 = 630 프레임, 요지 자막 485~625, 총 9,990. 04 의 `TOTAL_FRAMES` · 타임라인 · 검사 문장 · still 표 모두 9,990 으로 맞음.

굵은 칸 셋 ✓, ○ 10/10. 구현(C) 관문으로 넘긴다.

## meta 의 결정 (콘티 부록 B 제안에 대해)

- **B-1 마무리 자막:** 장면 14 를 **630 프레임(21초)** 으로 늘린다. 요지 자막은 485~625 (140프레임). 총 **9,990 프레임** (채점표 8번 ±10% 안). 02-plan 3절 표의 장면 14 "18초" 는 meta 가 21초로 고쳐 적는다 (기획 통과 뒤 콘티 관문에서 난 길이 조정. 채점표 1번 "기획을 바꾸지 않았다" 는 콘티 작성자에게 건 것이고, 이 조정은 meta 가 한다).
- **B-2 `bot다` 붙여 쓰기:** 코드를 따른다. 02-plan 본문의 `bot 다` 는 meta 가 고친다.
- **B-3 장면 12 "그 사이" = `starting` 동안:** 받아들인다. 코드 근거(`DELIVERABLE`)가 맞다.
- **B-4 `🔒 … 요청 · <title>`:** 받아들인다. 시사에서 정한다.
