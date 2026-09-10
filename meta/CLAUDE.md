# meta — 재고 검수하는 자리

meta 는 **만들지 않는다.** 밖에서 재고, 예측을 먼저 적고, 결과를 검수한다.
만드는 사람이 채점하면 언제나 통과가 되므로 자리를 나눴다. 이 규칙은 crew 다섯 회차가 실제로 증명했다.

## 두 일

| | crew (닫힘) | prodev (진행 중) |
|---|---|---|
| 무엇 | 봇 다섯 실험. 2026-09-09 사람이 닫았다 | 비서 봇 하나. 2026-09-10 문서로 세웠다 |
| 기록 | `crew-eval/` (INTENT · notes · 대조군 · 자료) 와 `../crew/EVOLUTION.md` | `prodev-review/` (plans · notes · predictions · fixtures · scripts · runs) |
| meta 가 하는 것 | 남은 것 없음. 되살릴 때만 규칙 참조 | 예측 · fixture · 대본 · 관문 검수 |
| 만드는 자리 | `../crew/` (worktree 로만) | `../prodev/` (관문 사이에 worktree + PR 로만) |

## 자리

| 무엇 | 어디 |
|---|---|
| prodev 제작 저장소 (본 체크아웃은 읽기만) | `../prodev/` — PRD · ARCHITECTURE · ADR · TASKS · VERIFICATION. 고칠 때는 `../prodev-wt-<이름>/` |
| prodev 기획·설계·검토 | `prodev-review/plans/` |
| prodev 예측 (제작 전에 적는다) | `prodev-review/predictions/` |
| prodev 시험 자료 (정답지 · fixture · 대본) | `prodev-review/fixtures/` · `prodev-review/scripts/` |
| prodev 검수 기록 (관문마다) | `prodev-review/runs/` |
| **다른 기계로 옮겨 실전에 붙일 때 먼저 읽는 것** | `prodev-review/HANDOFF.md` (기억 파일은 기계에 묶여 있어 안 실린다. 이것이 인수인계다) |
| meta 의 도구 (값 · 사본 시험 · 재생 · 주간 계측) | `prodev-review/scripts/tools/{cost.js,gate-tests.sh,replay.sh,weekly.sh}` |
| crew 실험 기록 전부 | `crew-eval/` (옛 `meta/notes/` = `crew-eval/notes/`, 옛 `meta/INTENT.md` = `crew-eval/INTENT.md`) |
| 옛 봇 · 회사 지식 · 채팅 서버 | `../crew/` · `../knowledge/` · `../minidiscord/` (전부 읽기). crew 시절 방 저장소는 2026-09-10 에 `crew-eval/archive/rooms-수율개선-2026q3.tar.gz` 로 압축해 두고 폴더는 지웠다 |
| 사람이 준 자료 | `user-notes/` |

## 규칙 — 공통 다섯

- **목표는 밖에, 결과는 안에.** 만들기 전에 예측을 숫자로 적는다. 판정 뒤 결과를 기록으로 옮긴다.
- **예측은 숫자로만.** "좋아진다"가 아니라 "≤ $3 · 4/4 · 0건".
- **만드는 쪽에 판정을 맡기지 않는다.** 봇도, prodev 제작 세션도 자기 검수표를 채우지 않는다. meta 가 **직접 돌려** 센다.
- **관문 중에는 규칙을 고치지 않는다.** 빗나가면 원인을 적고 되돌린다. 예측을 고쳐 맞추지 않는다.
- **세는 것은 기계.** 손으로 센 숫자는 근거가 아니다. 스크립트 출력과 파일·방 기록만.

## 규칙 — prodev 검수 다섯

- **prodev 는 관문 사이에만, 예측을 적은 뒤, worktree + PR 로 고친다** (crew 식). 본 체크아웃(`../prodev/`)은 손대지 않는다: `git -C ../prodev worktree add -b <브랜치> ../prodev-wt-<이름> origin/main`. 관문이 열려 있는 동안(`prodev-review/runs/IN-PROGRESS` 가 있는 동안)은 worktree 도 안 된다. 설계를 바꾸는 고침이면 PR 본문에 ADR 절을 함께 넣는다. 설정과 훅(`.claude/`)이 이것을 막는다. 막히면 우회하지 않는다.
- **prodev 세션은 이 파일을 읽지 않는다** (형제 폴더라 새지 않는다). meta 의 규칙을 prodev 에 옮기려면 `../prodev/` 의 문서에 PR 로 넣는다.
- **정답지는 meta 만 본다.** `prodev-review/fixtures/` 의 정답·채점표는 prodev 세션에 주지 않는다. 주는 것은 입력(자료 · 물음 · 대본)뿐이다.
- **채점표는 돌리기 전에.** 대본 재생 전에 칸을 적고 날짜를 남긴다. 결과를 보고 칸을 더하거나 빼지 않는다.
- **관문은 순서대로.** `../prodev/TASKS.md` 의 T1.M → T2.M → T3.M → T4.M. 통과 전에 다음 단계를 열지 않는다. 절차는 `../prodev/VERIFICATION.md` 6절.
- **기록은 `prodev-review/runs/<날짜>-<관문>.md`.** 표 · 근거(경로 · message id) · 통과/반려 · 빗나간 줄의 원인 가설 한 줄. "고치라"고 쓰지 않는다. 어디가 빗나갔는지만.

## 규칙 — crew 잔여 셋

- `../crew/` 를 고칠 일이 생기면 worktree 로만: `git -C ../crew worktree add -b <브랜치> ../crew-wt-<이름> origin/main`. main 은 보호돼 있다.
- `../crew/` 에 `CLAUDE.md` 를 만들지 않는다. 봇이 읽는다.
- `../minidiscord/` 는 읽기만. 고칠 것은 그 저장소에서. 채팅 DB 는 `.db` · `.db-wal` · `.db-shm` 셋을 세션 임시 폴더로 복사해 읽기 전용으로 연다.

## 계측 명령

    node ../crew/scripts/retro-cost.js --since <날짜> --record --label <라벨>     crew 봇 다섯의 세션 비용 (prodev 봇은 안 잡힌다 — 아래 cost.js)
    node prodev-review/scripts/tools/cost.js --bot <봇> --since <ISO> --until <ISO>   prodev 봇 비용 (서브에이전트 기록까지, 같은 단가)
    zsh prodev-review/scripts/tools/weekly.sh <과제 폴더> <봇> <시작> <끝> <DB>       4단계 주간 계측 (값 · 카드 · 위키 · find.log 층 · 카드 없는 첨부 · 🔒)
    zsh prodev-review/scripts/tools/gate-tests.sh <관문>                             사본에서 npm test · test:server (실제 bots/ 안 만짐)
    zsh prodev-review/scripts/tools/replay.sh <대본.json> [이름]                       대본 재생 (runs/.tokens.env 필요)
    node prodev-review/plans/proto/chat.js search <말> --room <방>               대화 검색 (MINIDISCORD_DB 로 사본 지정)
    node crew-eval/notes/measure.js <시작 id> <끝 id> "<라벨>"                   방 글 분량 계측 (crew 시절)

## 하지 않는 것

- 관문 중에 prodev 를 고치기 (관문이 닫힌 뒤, 예측을 적고, worktree + PR 로)
- 과제 분석 (봇의 일이다)
- 봇이나 제작 세션에게 "잘 됐냐"를 묻기
- 예측 없이 검수하기 · 검수 중에 규칙 고치기
