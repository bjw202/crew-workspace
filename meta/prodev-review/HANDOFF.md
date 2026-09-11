# prodev 인수인계 — crew-workspace 를 회사로 옮겨 실전 과제에 붙일 때 meta 가 읽는 문서 (2026-09-10)

이 문서가 첫 자리다. meta 세션의 기억 파일은 기계 경로에 묶여 있어 다른 기계에서는 실리지 않는다. 여기와 `../CLAUDE.md` 가 전부다.

## 1. 지금 상태 한 줄
1 · 2 · 3단계 관문 통과 (`runs/2026-09-10-T1M.md` · `T2M-2.md` · `T3M.md`) → 검색 안정성 두 판 통과, 찾기 62.5% → 100% (`runs/2026-09-11-search.md` · `search-2.md`, `design/v2`) → **진화하는 비서 관문 셋** (2026-09-11, `design/v3` · ADR-031~037): A "자리" 10/10 (`runs/2026-09-11-evo-seat.md`) · B "길" 12/15 통과, 딱 기준선 (`runs/2026-09-11-evo-path.md`) · C "짐" (이 문서와 `../../WINDOWS.md` · `prodev/docs/evidence/`, `runs/2026-09-11-evo-carry.md`). 사람 시험(T3.3)은 안 했다. **4단계(실전 2주)는 회사에서 한다.**
**다음 고침 후보 셋** (고치지 않은 채 옮긴다 — 고칠 때는 이 맥에서 예측을 적고 worktree + PR): ① 봇이 굳힌 **뒤에** 범위를 묻는다(설계는 직전) ② `report` 가 `templates/` 를 매번 다시 읽지 않는다 ③ **`report` 스킬에 "백그라운드로 띄우고 '시작했습니다'로 턴을 끝낸다" 걸음을 `research` 처럼 명시한다** — 지금은 `CLAUDE.md` 한 줄에만 기대고, 보고서 한 건이 20~40분 걸리는 동안 방이 조용하다(6절). 회사에서 처음 마주치면 이 셋이다.
설계 판단은 이 맥에서 끝냈다. **회사에서는 설계를 새로 정하지 않는다 — 환경만 고친다** (`plans/2026-09-11-handoff-evolution.md` 1절). 이 기계의 기억 파일 여섯은 `notes/2026-09-11-memory.md` 에 풀어 두었다.

## 2. 확인된 것과 안 된 것 (솔직하게)
| 실전 재생으로 확인 | 단위 시험만 (실전 안 밟음) |
|---|---|
| charter(발의 · 결재자 대조) · intake(읽은 표 · 그림 첨부 · 문답 · 정정 · 확정 · 카드 · 자료 방 · 위키 · 커밋) · find(20 물음, find.js 먼저) · research(허락 · 백그라운드 조사 · 다른 문맥 검토 · 열 줄 · 첨부) · brief · journal · 훅 셋 · 압축 앞뒤 알림 · 껐다 켠 뒤 놓친 글 처리 · 승인 0 · 900자 초과 0 | schedule 의 등록·변경 · patent · paper · report(발송 결재 훅 포함) · close(보관 · 승격) · data-reader(큰 파일) · 카드 여럿일 때의 색인·위키·void→supersedes · 검토 통과 → 카드 R → 카드 공지(ADR-022 뒤 `[카드]` 한 줄) · cron 실제 등록 · 그림/pdf 들이기 · 한 턴 여러 방 |

빗나간 예측 둘: P7 위키 갱신 $0.58(≤0.5) · P8 1~3층 11/16(≥12). 원인은 `runs/2026-09-10-T3M.md`.

## 3. 옮겨서 켤 때 (사람 + meta)
prodev 쪽 절차는 `../../prodev/docs/launch.md` 가 진실이다. meta 가 덧붙이는 것만 적는다.
1. `crew-workspace/` 통째로 복사. **서버 DB 를 새로 시작하면 `prodev/bots/` 와 `minidiscord/testplace/` 는 안 가져가도 된다** — 봇 폴더는 `setup.js` 가 새 경로로 다시 만들고 봇도 새로 등록한다. **서버 DB 를 가져가면 봇 폴더의 `.env`(봇 토큰)도 같이 가져가야 한다** — DB 에 봇이 있는데 토큰이 없으면 `.mcp.json` 이 안 생겨 봇이 안 뜬다(launch.md 10.2, 세 갈래). `runs/.tokens.env` 는 지운다(이 기계 시험 서버의 토큰).
2. 필요한 것: Node ≥ 22(`node:sqlite`) · npm · python3 + openpyxl · matplotlib(없으면 xlsx · 그림만 빠짐) · `pdftotext`(선택) · Claude Code + minidiscord 채널 플러그인 · 인터넷(리서치).
   **회사 PC 는 PowerShell 이고 Git Bash 가 있다** (2026-09-11 사람이 회사 PC 에서 직접 확인 — `../../WINDOWS.md` 길 C). Claude Code 안에서 bash 가 돌고 `node` 24 · `python` 3.14 가 있다. `zsh` 는 없다 → meta 의 도구 셋(`gate-tests.sh` · `replay.sh` · `weekly.sh`)은 거기서 안 돈다(`evo-count.js` 는 node 라 돈다). 봇 허용 목록은 관문 A(ADR-033)에서 Bash 열 건(node · git · gh · python3 · mkdir · ls · date · echo · pwd · cd)으로 줄었고, `setup.js` 가 봇 설정에 `CLAUDE_CODE_GIT_BASH_PATH` 를 박는다.
   **세우는 절차는 `../../WINDOWS.md` 가 진실이다** — 길 셋(WSL 2 · Git Bash · **PowerShell + Git Bash = 회사**), 깔고 나서 한 번 치는 점검(4절), 첫날 점검표(6절). `python3` 라는 이름과 분석 꾸러미(`pandas` · `scipy` · `statsmodels`, `prodev/docs/launch.md` 10.4)는 **사람이 미리 깐다** — 봇은 깔지 않는다.
   **봇 세션을 켤 때 권한 등급을 맞춘다.** 이 맥에서 대본을 돌릴 때 meta 세션은 bypass 였고 봇 세션은 기본(prompting)이라 meta 가 보내는 말마다 사람 승인이 떴다. 같은 등급으로 켜면(`claude --setting-sources project,local --permission-mode bypassPermissions`) 승인 없이 들어간다(`runs/2026-09-11-evo-path.md` 3.5). 실전에서는 사람이 방에서 말을 거니 해당 없고, **meta 가 대본을 돌릴 때만** 해당한다.
3. minidiscord 서버는 **실전 포트 · 실전 DATA_DIR** 로. `MINIDISCORD_BOT_FILES_DIR` 은 과제 저장소들의 부모(예: `<루트>/projects`). 사람 계정: PL · 과제원들 · `prodev-알림`(알림용 사람 계정, 봇 아님).
   **과제 저장소(`projects/<과제>/`)가 회사 어디에 서고 누가 보나 — 첫날 결정 칸.** 여기에는 회사 수율 · 부품 번호 · 보고 문체가 그대로 들어간다(`analysis/run.py` · `templates/` · 카드). 뿌리 `.gitignore` 가 `projects/` 를 빼 두어 작업판 저장소에는 안 들어가지만, **그 저장소가 회사 어느 서버에 서는지 · 과제원 외에 누가 열람하는지**는 아직 정해지지 않았다(계획 문서 13.5). 옮긴 첫날 PL 이 정해 이 줄을 채운다: 자리 ______ · 열람 ______ · 정한 날 ______.
   **대본을 돌리거나 시험할 때는 `MINIDISCORD_DB` 를 없는 경로로 준다** (예 `MINIDISCORD_DB=/tmp/none.db`). 안 주면 `setup.js` 가 **살아 있는 서버 DB** 를 기본값으로 잡아 시험 봇이 진짜 대화를 뒤진다(`setup.js` 의 DB 기본값, ADR-029). 실전 봇에는 실전 DB 를 준다.
4. `setup.js --project <과제이름>`(폴더가 없으면 `$MINIDISCORD_BOT_FILES_DIR/<이름>` 에 만들고 git init, ADR-023) (서버가 켜져 있으면 알림 계정 `prodev-notify` 의 토큰도 `.env` 에 스스로 넣는다, ADR-024) → `setup.js rooms <과제>`(방 둘: 본방 · `/files`, ADR-022) → 봇 켜기(launch.md 4절 명령) → 본방에 `@TO(<봇>) 안녕`.
5. ~~cron 은 `setup.js cron` 이 내는 두 줄을 PL PC 의 crontab 에 붙인다~~ — **자동 브리핑은 두지 않기로 했다** (2026-09-11 사람 결정, 계획 문서 9절). `brief` · `journal` 은 사람의 말로 뜬다. 윈도우에 cron 이 없어도 상관없다.
6. meta 가 재생을 돌릴 일이 있으면 PL · 과제원 계정의 md_session 값을 `runs/.tokens.env` 에 (`REPLAY_TOKEN_PL` · `REPLAY_TOKEN_MEMBER` · `MINIDISCORD_URL`).

## 4. 4단계에서 meta 가 하는 것 (TASKS T4.1 · T4.M)
- **시작 전에 예측을 적는다.** `predictions/prodev-prediction.md` 에 "4단계 예측" 절: 2주 값 상한 · 카드 수 · 카드 없는 첨부 0 · 위키 층이 답한 비율 · 승인 요청 수 · **본방에 올라온 파일 수 · "방 더 열어달라" 요청 수 · 확정 관문 오작동 수**(방 둘로 줄인 ADR-022 가 맞는지 재는 자리. 3단계 재생에서 자료 1 · 특허 · 논문 · 보고 0 이라 사람이 2026-09-10 저녁에 방 둘로 정했다. 예측표는 `predictions/prodev-prediction.md` 의 Q7~Q9). 숫자로만. 돌린 뒤 안 고친다.
- **주 1회** `scripts/tools/weekly.sh <과제 폴더> <봇> <주 시작> <주 끝> <DB>` → `runs/<날짜>-T4-week<N>.md` 에 붙인다. 값은 `scripts/tools/cost.js`(retro-cost 와 같은 단가, 서브에이전트 기록까지).
- **관문 T4.M**(2주 뒤): 예측표 재판정 · ADR-004(위키 즉시 갱신)의 재는 조건(find.log 에서 3층이 답한 비율, 4주 연속 0 이면 시점 재검토) · `../crew/EVOLUTION.md` 식으로 절 하나 · 다음 회차는 사람이 정한다.
- 시험은 언제나 사본에서: `scripts/tools/gate-tests.sh T4M`.
- 사람이 봇에게 판정을 묻지 않는다. 파일(카드 · 위키 · 일지 · find.log · handoff 로그)과 방 기록(`chat.js`)으로만 센다.

## 5. 회사에서 먼저 밟아 볼 것 (2절의 오른쪽 칸)
첫 주에 일부러 한 번씩: 일정 하나 바꾸기(schedule) · 양식 파일 주고 주간 보고 시키기 → 발송 결재까지(report, 훅) · 큰 csv 하나(data-reader) · 카드가 둘 이상일 때 위키가 잇는가 · 검토가 통과하는 리서치 하나(카드 R) · 방 하나 닫기(close). 각각 무엇이 남았는지(파일 · 커밋 · 방 글)를 `runs/` 에 한 줄씩.

## 6. 알려진 성질과 위험
- 압축 직후에는 봇이 혼자 말을 꺼내지 않는다. 알림 "정리가 끝났습니다" 뒤에 사람이 말을 걸어야 이어서 한다. 껐다 켠 경우는 서버가 놓친 글을 다시 배달하니 그냥 두면 된다.
- 새 세션에서 바로 `/compact` 를 치면 압축은 안 일어나고 직전 알림만 나간다(성질).
- 같은 파일을 다시 올리면 봇이 SHA 를 대조해 안 들인다. 판이 바뀐 파일은 `.v2` 로 들어간다(단위 시험만, 실전 미확인).
- 봇 답이 길다(단서를 매번 붙임). 900자 안이라 규칙 위반은 아니나 사람 시험 메모에 적을 것.
- **보고서 한 건에 20~40분 걸린다** (`runs/2026-09-11-evo-path.md` 3.6). `report` 의 검토 고리(`reviewer` 통과할 때까지 4~6판, 판마다 에이전트)가 시간의 절반을 먹고, 세션 판에서는 그동안 방에 아무 글도 안 갔다. 채널이 붙은 회사 판에서 "시작했습니다"가 먼저 오는지 첫 주에 본다. 안 오면 사람은 봇이 멈춘 줄 안다 — 고침 후보(검토 판 상한 · 판마다 한 줄)는 설계라 이 맥에서 예측을 적고 PR 로.
- prodev 제작 세션이 한 번 실제 봇 폴더를 지운 사고가 있었다(`runs/2026-09-10-R1-무효.md`). 지금은 시험이 `bots/` 를 안 만지게 못 박혀 있다. 그래도 **봇 폴더 `.env` 는 백업**해 둔다.
- meta 는 prodev 를 관문 사이에만, 예측을 적은 뒤, worktree + PR 로 고친다(`../CLAUDE.md`). 훅이 막는다.

## 7. 파일 자리
| 무엇 | 어디 |
|---|---|
| 관문 기록 · 재생 기록(JSONL) | `runs/` |
| 채점표(칸별 근거) · 대본 다섯 · R3 정답 | `scripts/scoring.md` · `scripts/R?-*.json` · `scripts/R3-key.md` |
| 트리거 정답지 · 1단계 fixture | `fixtures/triggers.json` · `fixtures/{find,hooks,chat}/` |
| 예측표 | `predictions/prodev-prediction.md` · 검색 `2026-09-11-search*.md` · 진화 `2026-09-11-evo-{seat,path,carry}.md` |
| 설계 · 검토 · 관문 사이 발견 | `plans/` (진화하는 비서는 `2026-09-11-handoff-evolution.md`) · `notes/2026-09-10-between-gates.md` |
| 진화 관문의 대본 · 정답지 · 채점표 · 시험 자료 | `scripts/2026-09-11-evo-script.md` · `scripts/evo-key.md` · `scripts/scoring-evo-*.md` · `fixtures/evo/` (**봇과 prodev 세션에 주지 않는다**) |
| 도구 | `scripts/tools/{cost.js,gate-tests.sh,replay.sh,weekly.sh}` (zsh 셋은 회사 PC 에서 안 돈다) · `scripts/tools/evo-count.js` (node — 돈다) |
| 판정 기록의 사본 (커밋 이력 없이 옮길 때의 근거) | `../../prodev/docs/evidence/` (관문 C 에서 만듦. 원본은 `runs/`) |
| 이 기계의 기억 파일을 푼 것 | `notes/2026-09-11-memory.md` |
| prodev 쪽 진실 | `../../prodev/{docs/as-built.md,docs/log.md,docs/launch.md,design/v3/ADR.md}` |
