# 과제 비서 — 자료 정리 · 2nd brain · 스킬 · 하네스 상세 설계

## Context
- 사람의 결정: crew 다섯 봇 실험은 닫혔다 (순차형 과제에 같은 품질 15~19배). 새 방향은 minidiscord 위의 **비서 봇 하나** (`meta/plans/2026-09-10-pl-assistant.md` 0~14절).
- 최종 제작은 **별도 저장소**에서 `/harness:harness` 로 하고, meta 는 예측을 먼저 적고 검수한다.
- 이번 물음 셋: ① 자료 정리와 2nd brain 을 어떻게 설계하나 ② 어떤 스킬이 필요한가 ③ 하네스 구조로 무엇을 가져가나.
- 사람이 정한 것 (이 세션): 카드 단위는 **실험 한 건**. 과제원 권한은 **PL 과 같게 전부**. 비서 PC 는 **인터넷 됨**. 과제 폴더는 **과제마다 git 하나**.

## 탐색에서 확인한 것
**`/harness:harness` (v1.2.0, `~/.claude/plugins/cache/harness-marketplace/harness/1.2.0/skills/harness/SKILL.md`)**
- 입력은 문장 하나. 설계 문서 서식이 없으므로 이 설계서가 그 문장 뒤에 붙는 사양이 된다.
- 만드는 것: `.claude/agents/*.md`(name·description + 핵심 역할·작업 원칙·입출력·에러·협업), `.claude/skills/*/SKILL.md`(+references/·scripts/), 오케스트레이터 스킬 1개, CLAUDE.md 에는 **포인터만**.
- **안 만드는 것: 훅 · settings.json · 슬래시 명령 · MCP 배선.** → "하네스 밖 부품"으로 따로 명시한다 (아래 D).
- 규칙: 스킬 description 은 pushy + "다시 실행·재실행·업데이트·수정·보완". SKILL.md 500줄 안. 에이전트 파일 없이 프롬프트에 역할 금지. 에이전트는 opus. 점검 모드(Phase 0 · 7-5)가 있어 meta 검수가 그 결과를 받는다.
- 우리 대응: **비서 = 메인 세션**(CLAUDE.md 포인터 + 스킬), **하네스의 agents = 비서가 부르는 서브에이전트**. 에이전트 팀 모드는 쓰지 않는다.

**crew 에서 그대로 가져올 부품** (`crew-workspace/crew/`, 탐색으로 인터페이스 확인)
- `scripts/count.js` — `node count.js <파일>` 또는 stdin. 첫 줄 `(N자 · N줄 · 최장 N어절)` 을 글 끝에 그대로 붙인다. 앞의 `@TO(...)` 와 끝의 계측 줄은 빼고 센다. 세 세대 "세라"가 실패한 뒤 이것으로 100% 맞았다. → pre-reply 훅이 이 함수를 그대로 부른다.
- `common/hooks/session-start.js` — startup·resume·clear·compact 에 상태 파일을 `additionalContext` 로 싣는다. 없음·못 읽음·잘림을 구분. fail-open.
- `common/settings.template.json` — 허용 목록 · deny · autoCompact · 훅 배선의 틀. 승인 요청을 0 근처로 유지한 목록.
- `scripts/retro-cost.js` — `~/.claude/projects/` 에서 `-bots-<봇>` 으로 끝나는 폴더를 찾아 세션 기록의 usage 를 합산, `--record` 로 `metrics/runs.jsonl`. 단가표는 청구액이 아니라 표준 환산. **봇에게는 이 숫자를 안 보여 준다.** → 새 저장소도 `bots/<이름>/` 이름을 유지하면 그대로 돈다.
- `common/statusline.sh` — `🤖 봇 · 🏠 방 · 모델 · CW 문맥% · 🌿 브랜치`. PATH 재설정 등 굳힌 것이 있어 그대로.
- 머리말 규격(`CLAUDE-common.md:130-136`): `room/task/kind/title/created/updated/aliases/tags/sources/status/supersedes`. aliases 3개 이상, 띄어쓰기 없이 + 영문·약어. 지우지 않고 void.
- archivist 의 원본 규약(`bots/archivist/CLAUDE.md`): 원본은 날짜-slug 폴더에 이름 그대로, 사이드카에 열·단위·기간·행 수 + **SHA-256** 출처 문단. 색인의 aliases·tags 열은 머리말의 부분집합. 위키 200줄 넘으면 하위 주제로. → A-2·A-3 에 그대로 넣는다.
- `CLAUDE-worker.md` 의 handoff 6줄(`task/dispatch/stage/next/notes/report`)과 stage 기준 되살아나기 표, "막혔을 때 가정을 적고 간다". → 비서 handoff 는 `room` 열을 더한 것.
- `meta/prodev-review/plans/proto/chat.js` — 대화 DB 읽기 전용 검색 (이 세션이 만들고 사본으로 여섯 명령 시험함).

---

## A. 2nd brain — 자료 정리 설계

### A-1. 원칙 넷
1. **알갱이는 실험 한 건(카드)이다.** 파일이 아니다. 파일 넷이 와도 실험이 하나면 카드 하나이고, 카드가 파일을 거느린다.
2. **카드는 대화가 만든다.** 들이기 문답이 끝나고 과제원이 "맞다"고 한 순간의 내용이 카드다. 봇이 혼자 추측해 채우지 않는다.
3. **위키는 카드에서만 자란다.** 위키의 모든 문장은 카드 번호를 단다. 카드 없는 문장은 위키에 못 들어간다.
4. **색인은 기계가 만든다.** 사람도 봇도 index.md 를 손으로 쓰지 않는다. crew 에서 손으로 센 것은 세 세대 다 틀렸다.

### A-2. 과제 저장소 배치 (과제마다 git 하나)
```
<과제>/
  charter.md                  헌장 (발의 문답의 결과, PL 결재)
  schedule.md                 일정. 파일이 진실. 마일스톤·할 일·상태·누가
  journal/YYYY-MM-DD.md       일지. 결정·미해결·다음 할 일·누가 무엇을 올렸나 (한 줄씩)
  inbox/YYYYMMDD-<slug>/      실험 한 건의 원본 묶음 (불변) + files.md (파일마다 한 절: 무엇·열·행·단위·문답 결과)
  cards/E-0001.md             실험 카드. 한 건에 하나
  cards/R-0001.md             리서치 카드 (research 스킬이 만든다)
  cards/D-0001.md             결정 카드 (판정·결재·마일스톤 변경. 왜·누가·언제·#message)
  wiki/<topic>.md             주제 페이지 (카드에서만 자란다)
  research/ patent/ paper/ report/   갈래 산출물 (초안·근거·그림)
  index.md · index.json       기계 생성. 손으로 안 쓴다
```
비서의 자기 상태(handoff · handoff-compact · memory · current-room)는 저장소가 아니라 **봇 폴더**에 둔다. 과제 저장소에는 과제의 사실만 있다.

### A-3. 카드 규격 (실험 카드 E)
머리말은 crew 규격 + 넷 (`who · date · confirmed_at · files`).
```
---
id: E-0007
kind: experiment            experiment | research | decision
title: CH-3B 샤워헤드 교체 후 수율 (08-27~09-03)
date: 2026-09-03            실험(측정)일. 올린 날이 아니다
who: 김과제                  올린 과제원 (봉투 sender)
room: 수율개선-2026q3/들이기
confirmed_at: 412           "맞다"가 나온 message_id. 대화로 되짚는 열쇠
files: [inbox/20260903-ch3b-showerhead/yield.csv, inbox/20260903-ch3b-showerhead/photo1.jpg]
conditions: {장비: CH-3B, 부품: SH2200-B-0412, 레시피: R-12, 로트: 14}
results: {수율_전: 90.10, 수율_후: 92.53, 단위: "%"}
aliases: [샤워헤드교체, showerhead-swap, CH3B수율]
tags: [수율, 샤워헤드, CH-3B]
related: [E-0005, R-0002]
status: valid
supersedes: none
---
## 한 줄
## 조건 (표)
## 결과 (표 · 수치는 파일의 어느 열에서 왔는지)
## 문답에서 확정한 것 (Q → A, 각각 #message_id)
## 한계 · 못 확인한 것
## 관련 카드
```
- `conditions` · `results` 는 자유 키값이다. 과제마다 다르므로 스키마를 강제하지 않는다. 대신 위키 페이지가 "이 과제의 조건 키" 목록을 유지한다.
- 머리말에 둘을 더한다 (검토 반영): `source_msgs: [405, 409]` — 첨부가 올라온 글 번호 전부. `status: draft | valid | void` — **첫 파일이 오면 draft 로 번호를 받고, "확정"이 있어야 valid.** 자료 방 글은 valid 때만 나간다.
- 카드 종류 하나 더: `kind: note` (N-0001). 화이트보드 사진·회의 메모처럼 실험이 아닌 것. 물음 하나만 하고 위키를 건드리지 않는다.
- 같은 실험의 파일이 고쳐져 다시 오면 **같은 카드를 고친다.** 원본은 덮어쓰지 않고 `.v2` 로 옆에 둔다 (`intake-copy.js`, `fs 'wx'`). 카드는 draft 로 되돌아가고 새 "확정"이 있어야 valid. 이력은 git 이 남긴다. 결론이 뒤집힐 때만 새 카드 + supersedes.
- 카드 번호는 `index.js next E` 가 준다. 한 턴에 문답 둘이 같은 번호를 받지 않게.

### A-4. 들이기 문답 규약 (intake 스킬의 뼈대)
```
1 열기      csv/xlsx: 열 이름·행 수·수치 범위·빈 칸·중복. 이미지: 직접 본다. pdf/docx: 글로.
            큰 파일(≥2,000행 · ≥20쪽)은 data-reader 서브에이전트가 읽고 20줄로 돌려준다.
2 읽은 것   "이렇게 읽었습니다" 표 하나: 실험일 후보 · 장비 · 조건 · 결과 열 · 이상한 자리(단위 흔들림·날짜 형식·중복 행).
            crew 회차 4 의 함정 넷(중복 행·날짜 형식·단위·빈 칸)이 여기서 걸려야 한다.
3 묻기      모르는 것 셋 이하. 그림이 나은 자리는 잘라서(이미지) 또는 그려서(csv → plot.py) 첨부해 묻는다.
4 기다림    과제원이 고치겠다면 handoff 에 "E-0007 문답 중, 남은 질문 1" 을 적고 기다린다.
5 확정      과제원의 "확정" 한마디 → 카드 valid → index 재생성 → 자료 방 글 → 커밋. (위키는 여기서 안 건드린다. A-5)
            "읽은 것" 표 끝에 "맞으면 '확정'이라고 답해 주세요"를 붙여 어휘를 사람에게 고정해 준다.
```
- 큰 파일은 `peek.js`(행 수·열 이름·5행)로 먼저 보고, 주 세션이 통째로 Read 하지 않는다. data-reader 는 **전체 결과를 파일**(`inbox/<slug>/reading.md`: 이상 자리 전수, 열마다 범위)에 쓰고 20줄 + 경로만 돌려준다. 카드 "한계"는 그 파일의 이상 자리를 **전부** 옮긴다. 회차 4 에서 잃은 세 칸이 전부 계층을 넘는 자리였다. 20줄 요약이 그 병목이 되면 안 된다.
- 한 턴에 들이기 문답은 한 건만 진행한다. 다른 방의 @TO 가 같은 턴에 들어오면 방마다 따로 짧게 답한다.

**확정 훅의 기계 판별** (`pre-reply.js`, 지침 판단이 아니다. 검토 3번 반영)
```
reply 의 chat_id → DB rooms.name 이 /자료 로 끝나는가          아니면 통과
text 첫 줄의 E-\d{4} → cards/E-xxxx.md 를 연다                  없으면 막는다
머리말 status == valid                                            아니면 막는다
confirmed_at 의 글을 DB 에서 읽어:
   author_type == 'user'                                         봇 글이면 막는다
   방이 같은 과제의 /들이기                                       아니면 막는다
   본문이 ^(확정|맞다|맞습니다|그대로|OK)\b 에 걸리는가           아니면 막는다
   id 가 source_msgs 전부보다 크고, 그 직전 봇 글에 같은 카드 번호가 있는가   아니면 막는다
index.json 의 errors == 0                                         아니면 막는다
DB 를 못 열면 자료 방만 fail-closed
```
자료 방 글 서식(6줄): 카드 번호 · 한 줄 · 조건 한 줄 · 결과 한 줄 · 관련 카드 · 경로. 원본 파일을 첨부한다 (inbox 경로 그대로. 봇 첨부 뿌리 밖이면 서버가 **조용히** 뺀다).

### A-5. 위키 페이지 규격
```
# <topic>
## 지금 아는 것        문장마다 [E-0007] 처럼 카드 번호. 번호 없는 문장 금지
## 근거 카드            표: 카드 · 날짜 · 한 줄
## 모르는 것 · 열린 질문
## 이 과제의 조건 키     conditions 에 쓰인 키와 뜻·단위
## 이력                 날짜 · 어느 카드가 무엇을 바꿨나
```
갱신 시점 (사람 결정 2026-09-10): **카드가 valid 가 될 때마다 즉시.** 검토는 주 1회를 권했다 (crew 에서 위키·색인 반영이 archivist 값의 4분의 3이었고 아무도 읽지 않았다). 사람이 즉시 갱신을 택했으므로 그 값을 **재고** 판단한다: 예측표에 "들이기 한 건의 위키 비용"을 두고, `find.js` 가 답한 층을 `bots/<봇>/find.log` 에 남겨 3층(위키)이 답한 비율을 본다. 4주 연속 0 이면 그때 시점을 다시 정한다.
갱신 범위는 그 카드의 tags 에 걸리는 페이지만. 페이지 전체를 다시 쓰지 않고 "지금 아는 것"에 문장을 더하거나 고치고 "이력"에 한 줄.
주제 결정: 카드 tags → 기존 위키 파일명과 대조 → 없으면 새 페이지를 만들지 **물어본다** (사람이 주제 이름을 정한다). 200줄 넘으면 하위 주제로 나눈다.

### A-6. 찾기 — 순서를 스크립트에 못 박는다 (`scripts/find.js`)
```
find.js <말 …> [--room <과제>]
  1 index.json 의 title · aliases · tags        → 걸리면 카드 경로
  2 cards/*.md 본문 grep                        → 걸리면 카드 경로 + 행
  3 wiki/*.md                                   → 페이지 + 행
  4 chat.js search (대화)                       → #message_id
  5 inbox/*/files.md · 원본 (마지막)
출력: 어느 층에서 걸렸는지 + 경로/번호 + status. void 는 supersedes 를 따라간다. 여러 낱말은 AND.
```
조용히 놓치는 자리 막기 (검토 7번 반영): 모든 입력·파일명을 `normalize('NFC')`. 고정 조사 목록(을/를/이/가/은/는/의/에/에서/로/으로/와/과/도)을 떼고 대소문자·하이픈·공백을 접은 둘째 키로 양방향 부분 일치. `index.js` 는 머리말을 못 읽은 카드를 stderr 에 나열하고 exit 1 (조용히 색인을 만들지 않는다). `chat.js search` 는 여러 낱말 AND 로 고친다.
비서 지침은 "물음에는 find.js 를 돌린다"뿐이다. 순서를 지침으로 외우게 하지 않는다. 인사·짧은 확인에는 돌리지 않는다 (분기표: 물음표 또는 "어디/언제/뭐라/얼마"가 있을 때, `--limit 10`).
**지표**: 찾기 성공률 = 사람의 물음 중 1~3층(카드·위키)에서 답한 비율. 5층(대화, 2026-09-10 ADR-016 으로 4→5)만으로 답한 비율이 높으면 카드가 일을 안 하는 것이다.

### A-7. 대화와 자료의 연결
- 카드의 `confirmed_at` 과 문답 Q/A 의 `#id` 로 `chat.js around <id>` 가 그 순간을 되살린다.
- 자료 방 글 자체가 눈으로 훑는 색인이다. 비서만 쓰고 사람은 읽는다.
- 회사 지식 승격: 위키 페이지 → `knowledge/domain/<topic>.md` 는 `close` 스킬에서 PL 결재로만. crew 의 `knowledge/` 저장소를 그대로 쓴다.

---

## B. 스킬 열둘 (하네스가 만든다)

| 스킬 | 트리거 (description 에 넣을 말) | 입력 | 하는 일 | 남기는 것 | 사람 관문 | 부르는 에이전트 · 스크립트 |
|---|---|---|---|---|---|---|
| `charter` | 과제 발의·시작·새 과제·헌장 | 본방 대화 | 목적·목표·일정·인원·예산·판정 기준을 **하나씩** 묻고 헌장 초안 | `charter.md` · `schedule.md` 뼈대 · 방 묶음(API) · git init | PL 결재 | `setup.js rooms` |
| `intake` | 파일이 올라옴·자료·실험 결과·데이터 정리 | 들이기 방 첨부 | A-4 규약 | inbox 묶음 · 카드 E · 위키 · index · 자료 방 글 · 커밋 | 과제원 "맞다" (훅 검사) | `data-reader`, `plot.py`, `index.js` |
| `find` | 무엇이든 물음·어디 있나·그때 뭐라 했나 | 물음 | `find.js` 돌리고 출처 붙여 답 | (없음) | 없음 | `find.js`, `chat.js` |
| `research` | 조사·리서치·문헌·왜 그런가 | 물음 문장 | 먼저 find. 없으면 "물음은 이것, 진행할까요" → 허락 → 조사 → 10줄 브리핑 → 몇 턴 뒤 카드 R | `research/<주제>.md` · 카드 R · 자료 방 글 | 시작 허락 · 카드 굳힘 | `researcher`, `reviewer` |
| `schedule` | 일정·마일스톤·할 일·밀렸다·지금 뭐 해야 | 대화 | `schedule.md` 읽고 오늘 기준 브리핑 · 바뀐 줄만 되읽기 | `schedule.md` · 카드 D(마일스톤 변경) | 없음 | (없음) |
| `brief` | 아침 브리핑·현황·오늘 | cron 또는 사람 | 어제 일지 + 이번 주 일정 + 열린 질문 + 밀린 것, 10줄 | (없음) | 없음 | (없음) |
| `journal` | 하루 마감·압축 직전·정리해 둬 | cron 또는 훅 | 오늘 방마다 결정·미해결·다음 할 일·올라온 것 | `journal/<날짜>.md` | 없음 | `chat.js since` |
| `patent` | 특허·선행·청구 | PL 요청 | 헌장·카드에서 청구 후보 → 선행 조사 → 전략 3갈래 이하 | `patent/prior-art.md` · `patent/strategy.md` | 조사 범위 · 청구 방향 | `patent-analyst`, `reviewer` |
| `paper` | 논문·원고·투고·와꾸 | PL 요청 | 카드·리서치 모아 와꾸(제목·절·그림·부족한 실험) → 절마다 초안 + 근거 카드 | `paper/outline.md` · `paper/draft.md` · 그림 | 와꾸 결재 · 절마다 통과 | `paper-writer`, `reviewer` |
| `report` | 주간·월간·경영진 보고·보고서 | 포맷 파일 + 기간 | 일지·일정·카드에서 기간 자르기 → 방향 셋 묻기 → 포맷 칸 채우기, 숫자마다 카드 출처 | `report/<기간>.md` (또는 포맷 그대로) | 방향 선택 · 발송 결재 (훅) | `report-writer`, `reviewer` |
| `review` | (다른 스킬이 부른다) 검토·검증 | 산출물 경로 + 끝 조건 | 다른 문맥에서 의심하며 읽고 통과/불통과 + 이유 3줄 | (없음) | 없음 | `reviewer` |
| `close` | 마감·끝·보관·승격 | 갈래 또는 과제 끝 | 방 보관(API) · 위키 → knowledge 승격 후보 목록 · charter 상태 | `knowledge/projects/<과제>.md` | PL 결재(승격) | `setup.js archive` |

오케스트레이터 스킬(하네스가 하나 만든다): `prodev-orchestrator` (2026-09-10 이름 통일. 옛 이름 `secretary-orchestrator` 는 따르지 않는다 — ARCHITECTURE 10절 · TASKS T2.2 와 같게) — "봉투를 받으면 어느 스킬인가"를 정하는 분기표 하나. 방 접두어(들이기·자료·보고…) + 말의 종류. 20줄 안.

## C. 에이전트 여섯 (하네스가 `.claude/agents/` 에 만든다, 전부 서브에이전트)

| 에이전트 | 하는 일 | 돌려주는 것 (20줄 이내) | 쓰는 스킬 |
|---|---|---|---|
| `data-reader` | 큰 파일 읽기(수천 행·수십 쪽). 열·범위·이상 자리 | **전수는 `reading.md` 파일에**, 돌려주는 것은 20줄 + 경로 | intake |
| `researcher` | 문헌·규격·웹 조사. 출처 없는 문장 금지 | 결론 · 출처 목록 · 못 확인한 것 · 파일 경로 | research, patent, paper |
| `reviewer` | **다른 문맥**의 검토자. 스스로 센 숫자 다시 세기, 출처 대조 | 통과/불통과/검증 불가 · 이유 3줄 · 못 본 범위 | review (모든 산출물) |
| `patent-analyst` | 선행 기술 조사 · 청구 후보 | 선행 목록 · 차이점 · 위험 | patent |
| `paper-writer` | 절 단위 초안. 근거 카드 붙이기 | 절 초안 파일 경로 · 근거 카드 목록 · 빈 자리 | paper |
| `report-writer` | 포맷 파일의 칸 채우기 | 채운 파일 경로 · 출처 없는 숫자 목록 | report |

crew 실측 그대로: 검토는 다른 문맥에서 해야 값을 한다 ($1.69 가 오류 셋을 잡음). `reviewer` 는 어느 스킬에서든 산출물이 사람 결재로 가기 전에 한 번 돈다. intake 에서는 끝 조건에 "reading.md 의 이상 자리 수 = 카드 한계 항목 수"를 넣는다.

**서브에이전트 공통 규칙** (검토 1·9번 반영)
- 3분을 넘길 일(research·patent·paper·report·큰 파일)은 **백그라운드**로 띄우고 그 턴은 "시작했습니다" 한 줄로 끝낸다. 결과는 파일로 받고 다음 턴에 방에 알린다. 세션은 한 번에 한 턴만 돌므로, 긴 턴은 다른 사람의 물음을 막는다.
- 서브에이전트는 커밋하지 않는다. 주 턴만 `git add <경로>` 로 커밋한다.
- 그림·임시 파일은 `<과제>/tmp/`(gitignore) 에 쓴다. `/tmp` 는 봇 첨부 뿌리 밖이라 첨부가 조용히 빠진다.

---

## D. 하네스 밖 부품 — 제작 세션이 손으로 놓는 것 (하네스 스킬이 안 만든다)

### D-1. 새 저장소 배치 (제안)
```
secretary/                         새 저장소
  CLAUDE.md                        하네스 포인터 (스킬이 쓴다) + 비서 지침 10줄 (아래 D-4)
  .claude/agents/  .claude/skills/ 하네스 산출
  common/hooks/session-start.js    crew 것을 옮김. 싣는 것: handoff-compact → charter → schedule → handoff → 오늘·어제 일지 → index 머리 30줄
  common/hooks/pre-compact.js      새로. 기록 꼬리 → claude -p (sonnet) → bots/<봇>/handoff-compact.md. 방에 "정리 중" 알림(API). fail-open, timeout 180
  common/hooks/pre-reply.js        새로. PreToolUse(mcp reply): count.js 로 분량 검사(사람 900자·10줄) · 자료 방 글이면 confirmed_at 검사 · 보고 방 발송이면 결재 검사
  common/settings.template.json    crew 것 + python3 · PreCompact/PreToolUse 배선 · MINIDISCORD_BOT_FILES_DIR
  common/statusline.sh             crew 것
  scripts/chat.js                  proto 그대로
  scripts/count.js                 crew 그대로
  scripts/index.js                 새로. 머리말 → index.md · index.json (+ `next E` 번호 배정, 파싱 오류면 exit 1)
  scripts/find.js                  새로. A-6 순서 + NFC · 조사 떼기 · find.log
  scripts/peek.js                  새로. 파일의 행 수·열 이름·5행 (주 세션이 큰 파일을 통째로 안 읽게)
  scripts/intake-copy.js           새로. 원본을 inbox 로, 같은 이름이면 .v2 (덮어쓰기 금지) + SHA-256
  scripts/plot.py                  새로. csv 열 → png (묻기용 그림, <과제>/tmp/ 에)
  scripts/setup.js                 crew 것을 고침: 봇 등록 · 방 묶음 만들기 · 봇 참여 · cron 설치 · archive
  scripts/retro-cost.js            crew 것을 봇 하나로
  bots/<과제비서>/                 setup 이 만든다. .mcp.json(토큰) · settings.json · memory.md · current-room · handoff*.md — git 제외
  docs/design.md                   이 설계서
```
- **확인 항목(제작 때)**: 봇 cwd 를 저장소 루트로 두고 `--mcp-config bots/<이름>/.mcp.json --settings bots/<이름>/settings.json` 으로 띄우면 `.claude/skills` 가 그대로 보인다. crew 는 cwd 가 봇 폴더였다. 어느 쪽이 스킬·훅 경로에 맞는지 첫 기동에서 확인하고 setup.js 에 못 박는다.

### D-2. 훅 셋의 자리 (세는 것과 막는 것은 기계)
| 훅 | 사건 | 하는 것 | 실패 시 |
|---|---|---|---|
| session-start | startup·resume·clear·compact | 상태 파일 싣기 (D-1 순서) + **열린 실 목록과 실 파일 전부** | fail-open |
| pre-compact | PreCompact | 인수인계서 생성 + 방 알림 | fail-open (인수인계서 없이 압축) |
| pre-reply | PreToolUse `mcp__minidiscord-channel__reply` | `chat_id` 없으면 막음 · 분량(900자·10줄) · 자료 방이면 A-4 확정 판별 · 보고 방 발송이면 결재 검사 | **막는다** (exit 2 + 이유) |

**방 여럿의 상태 — handoff 하나로는 안 된다** (검토 2번 반영)
- `bots/<봇>/handoff.md` 는 **열린 실 목록**만 둔다 (한 줄 = 방 · 카드 · 마지막 id · 누구를 기다림, 최대 10줄). 실마다 `bots/<봇>/threads/<방>-<카드>.md` 6줄 (crew handoff 서식 + room).
- `bots/<봇>/rooms.json` 에 방마다 "내가 처리한 마지막 message_id". **서버 커서를 믿지 않는다** — 서버는 소켓에 보낸 순간 커서를 올리므로, 턴 도중 압축·사망이면 그 글은 다시 오지 않는다. 깨어날 때와 매 턴 첫머리에 `chat.js since <방> <id>` 를 **방 전부**에 돌려 놓친 @TO 를 찾는다.
- 채널 플러그인은 `chat_id` 없는 reply 를 마지막 to 방으로 보낸다. 압축 뒤 첫 답이 엉뚱한 방에 갈 수 있으므로 pre-reply 가 `chat_id` 를 강제한다. `handoff-compact.md` 의 "방"도 chat_id 숫자로.
- 권한 요청도 마지막 to 방에 뜬다. 자료 방이 그것으로 더러워지지 않게 허용 목록을 회차 5 의 31건으로 미리 채운다.

**훅과 스크립트의 전제** (검토 10번 반영): 봇 이름·과제 경로는 cwd 에서 유추하지 않고 settings `env` 의 `SECRETARY_BOT` · `SECRETARY_PROJECT` 로 못 박는다. crew 의 session-start.js 는 cwd basename 과 세 단계 위를 전제하므로 그 부분을 고친다. pre-compact 의 `claude -p` 는 빈 임시 cwd + `SECRETARY_HOOK=1` 로 띄워 session-start 가 조기 종료하게 한다 (CLAUDE.md·스킬 목록을 물려받지 않게).

### D-3. 바깥 장치
- cron (PL PC): 08:00 `@TO(비서) 아침 브리핑` · 18:30 `@TO(비서) 일지` 를 HTTP API 로. `setup.js cron` 이 설치한다. **2026-09-10 고침(ADR-018)**: 서버는 사람 계정의 세션 쿠키(`md_session`) + multipart 만 받는다. Bearer + JSON 은 안 된다 (prodev 가 시험 서버로 확인). 토큰 env 는 `PRODEV_NOTIFY_TOKEN` 하나.
- 18:30 `journal` 은 `chat.js` 로 들이기 방의 첨부 글 가운데 어느 카드의 `source_msgs` 에도 없는 것을 찾아 "카드 없는 첨부 N건 · 확정 대기 N건(며칠째)" 을 일지와 아침 브리핑에 올린다. @TO 없이 파일만 올린 글은 봇에게 오지 않으므로 이것이 그물이다.
- **세션은 상주하지 않는다** (사람 결정 2026-09-10). 주간에 필요할 때 켜고 끈다. 그러므로 "매일 재시작"이 아니라 **언제 켜도 파일에서 되살아난다**가 요건이다: 켜지면 session-start 가 열린 실·rooms.json·charter·schedule·어제 일지를 싣고, 비서는 `chat.js since` 로 꺼져 있던 동안의 @TO 를 전 방에서 찾아 순서대로 처리한다. 꺼져 있는 동안 올라온 파일도 이 경로로 들이기가 시작된다. `autoCompactWindow` 는 기본으로 두고 실측한다.
- cron 의 아침 브리핑·일지는 세션이 켜져 있을 때만 닿는다. 꺼져 있었으면 다음에 켤 때 "지난 일지 없음"을 알아채고 그 자리에서 일지를 먼저 쓴다 (session-start 가 마지막 일지 날짜를 실어 준다).
- minidiscord 설정 한 줄: `MINIDISCORD_BOT_FILES_DIR=<과제 저장소들의 부모>`. 서버 코드 수정은 나중(웹 검색창).
- 알림용 사람 계정 `비서-알림` (압축 중 표시). 봇 이름으로는 훅이 글을 못 쓴다.

### D-4. 비서 지침 (CLAUDE.md 에 남는 열 줄, 하네스 포인터와 함께)
```
- 나는 과제 <이름> 의 비서다. 방 접두어가 내 과제 저장소다.
- 봉투만 믿는다. TO 에 답하고 CC 는 읽는다. 사람에게는 이름만 부른다.
- 답하기 전에 find.js 를 돌린다. 출처 없는 사실은 말하지 않는다.
- 스스로 일을 만들지 않는다. 리서치·갈래 방은 사람이 허락해야 연다.
- 자료는 과제원이 "맞다"고 해야 확정이다. 확정 전엔 자료 방에 쓰지 않는다.
- 파일이 진실이다. 행동 전에 handoff 를 쓴다. 압축 뒤 첫 일은 "이어서 합니다" 한 줄.
- 한 번에 묻는 것은 셋까지. 그림으로 물을 수 있으면 그림으로.
- 사람에게는 900자·10줄 안. 넘치면 파일로 옮기고 경로를 준다. 세는 것은 훅이 한다.
- 과제 저장소와 내 봇 폴더에만 쓴다. 원본은 손대지 않는다. 지우지 않고 void.
- 큰 파일·긴 조사·검토는 서브에이전트에게. 돌려받는 것은 20줄.
```

---

## E. 제작 순서 (새 저장소에서) 와 meta 의 검수

### E-1. 순서
1. 저장소 만들기 · crew 부품 옮기기 (count.js · session-start.js · settings 틀 · statusline · retro-cost) · proto chat.js.
2. 새 스크립트: index.js → find.js → plot.py → pre-compact.js → pre-reply.js → setup.js 고치기. 각각 사본 DB · 회차 4 자료로 단독 시험.
3. `/harness:harness` 에 문장 + `docs/design.md` 를 주고 스킬 열둘 · 에이전트 여섯 · 오케스트레이터 스킬 생성. 하네스 점검 모드(6-1 구조 · 6-4 트리거)까지.
4. 봇 하나 등록 · 시험 과제 방 묶음 · 첫 기동 (D-1 확인 항목).
5. 시나리오 시험: 회차 4·5 의 실제 자료(`rooms/수율개선-2026q3/archivist/inbox/`, 34행 성적서 · 함정 넷 · 정답지 `meta/crew-eval/notes/round-4-answer-key.md`)를 들이기 방에 올려 intake 를 돌린다.

### E-2. meta 가 먼저 적는 예측 (제작 전, `predictions/prodev-prediction.md`)
| 지표 | 예측 | 재는 법 |
|---|---|---|
| 들이기 한 건 문답 왕복 | 중앙값 ≤ 4 | chat.js 로 들이기 방 세기 |
| 들이기 한 건 값 | ≤ $3 | retro-cost.js |
| 회차 4 함정 넷이 카드 "한계"에 | 4/4 | 카드 대조 |
| 찾기 성공률 (1~3층) | ≥ 70% | 물음 20개 표 |
| 압축 뒤 사람이 끊김을 안 횟수 | 0 | 방 관찰 |
| 브리핑이 schedule.md 와 어긋난 날 | 0 | 대조 |
| 훅이 막은 자료 방 글(확정 없음) | 시험 3건 전부 막힘 | 일부러 넣어 본다 |
| 하네스 트리거 검증 | should 10 / should-not 10 전부 맞음 | 점검 모드 출력 |
| CLAUDE.md 줄 수 | ≤ 40 | wc |
| 놓친 @TO (rooms.json 대조) | 0 | chat.js since 전 방 |
| 방을 잘못 짚은 reply | 0 | pre-reply 로그 |
| 카드 없는 첨부 (주간) | 0 | journal 출력 |
| 들이기 한 건의 위키 비용 | ≤ $0.5 (즉시 갱신, 걸리는 페이지만) | retro-cost |
| 껐다 켠 뒤 놓친 @TO · 놓친 첨부 | 0 | 꺼진 사이 글 5건 올리고 켜서 대조 |
| index.js 파싱 오류 | 0 | exit code |
| find.log 층별 비율 | 1~3층 ≥ 70%, 3층(위키) > 0 | find.log |

### E-3. 검수 방법
- 하네스 점검 모드 출력 + 위 표를 meta 가 채운다. 예측이 빗나가면 EVOLUTION 식으로 절을 남긴다.
- 스크립트 단독 시험: chat.js 여섯 명령(이미 사본에서 통과), index.js (머리말 30개 → 표 30행), find.js (정답 아는 물음 10개 → 층 번호), pre-reply.js (900자 초과 · 확정 없음 · 결재 없음 셋 다 막힘), pre-compact.js (기록 사본 → 인수인계서 서식 6칸 채워짐, 180초 안).

## 승인 뒤 할 일 (이 세션)
- 이 계획을 `meta/prodev-review/plans/2026-09-10-prodev-design.md` 로 옮겨 적는다 (앞선 `2026-09-10-pl-assistant.md` 의 상세판). 예측표는 `meta/prodev-review/predictions/prodev-prediction.md` 로 따로 뺀다.
- 새 저장소 만들기와 제작은 사람이 `/harness:harness` 로 한다. meta 는 E-3 검수만 한다.

## 열어 둔 것 (제작 전에 정하거나 첫 기동에서 확인)
- 봇 cwd 와 스킬 탐색 경로 (D-1 확인 항목).
- `conditions` 키를 과제마다 위키가 들고 갈지, charter 에 미리 적을지.
- 이미지 자르기 도구(사진의 한 부분을 잘라 되묻기): Python Pillow 가 봇 PC 에 있는가. 없으면 전체 그림에 표시만.
- 인수인계서 모델 sonnet/haiku, 알림 계정 이름.
