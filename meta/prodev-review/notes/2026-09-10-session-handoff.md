# meta 세션 인수인계 (2026-09-10 저녁, /clear 직전)

다음 meta 세션이 이것을 읽고 이어 간다. 회사 기계용 인수인계는 `../HANDOFF.md`(그쪽이 더 넓다). 이 파일은 **이 기계에서 오늘 하던 논의**를 잇기 위한 것이다.

## 어디까지 왔나 (한 줄)
prodev 1 · 2 · 3단계 관문 통과, 발견 여섯 고침 뒤 R3 · R5 재측정까지 끝. 압축 앞뒤 알림 둘을 실제 압축으로 확인. prodev 세션은 커밋 490f162 에서 대기. 사람이 **여기서 더 시험하지 않고 crew-workspace 를 회사로 옮겨 실전(T4)에 붙이기로** 정함.

## 지금 논의 중이던 것 (이어 갈 자리)
0. **(2026-09-10 저녁 결정) 방 일곱 → 방 둘.** 본방 `prodev-<project>` · `prodev-<project>/files`. 봇은 어디서든 답하고 본방의 파일에만 한 줄 안내. 예측 Q1~Q9 를 `predictions/prodev-prediction.md` 에 적었고, prodev 세션에 문서 PR(ADR-022) 먼저 지시했다. 코드 PR 은 문서 PR 통과 뒤. 아래 1번은 이 결정으로 닫혔다.
0-0. **ADR-022 검수 끝 (2026-09-10 밤).** 문서 PR #1 · 코드 PR #2 머지(7f122ca). 2차 재생(worktogether2): 기능 7/7, 값 둘 빗나감(들이기 $3.11 · 제작 $18.67) 기록. 남은 것: 사람이 prodev 세션에서 하네스 점검 20/20. 기록 `runs/2026-09-10-ADR022-{docs,code,code-tests,hook-cases}.md/txt`. 루트에 README · workspace.json · bootstrap.sh · .gitignore 만들었고 rooms/ · crew-wt-s4 · 표본 csv 는 정리했다 (crew-eval/archive · round-data).
0-1. **(통과 · 머지 대기, 2026-09-10 밤 — S1~S4 ○, S5 는 다음 실사용 때) setup 이 과제 폴더를 스스로 만든다 (ADR-023, PR #3).** 하네스 구조 점검 불일치 0 → ADR-022 검수 전부 닫힘. 머지 6888966.
0-2. **(통과 · 머지 831dfbb) ADR-024 — 봇 `prodev-<과제>-bot` · 알림 계정 `prodev-notify` · setup 이 알림 토큰을 `.env` 에 스스로 넣음.** N1~N5 ○, N6(실사용 1회)은 대기. 산문의 '비서'는 한국어라 그대로. 루트 README 의 봇 돌리는 법을 새 이름 · 토큰 걸음 없이로 고쳤고 `workspace.json` 의 prodev 커밋은 831dfbb. 시험용 봇 폴더 둘은 옛 이름(`-비서`) 그대로. prodev 는 대기 중, 원격 브랜치는 main 하나. 사람 결정 2026-09-10 밤: `node scripts/setup.js --project <이름>` 에서 이름만 주면 `$MINIDISCORD_BOT_FILES_DIR/<이름>` 에 폴더를 만들고(없으면) 거기에 붙인다. `mkdir -p` 한 줄이 없어진다. 예측(폴더 생김 · 기존 폴더면 그대로 · test:server 초록)을 적고 prodev 에 지시 → 머지 뒤 루트 README 의 2단계에서 mkdir 줄을 뺀다. 루트 `.gitignore` 는 `/projects/*` + `!/projects/.gitkeep`.
1. **방 일곱이 왜 필요한가.** 사람이 의문을 냈다. meta 의 판단: 실측(본방 60 · 들이기 23 · 리서치 14 · 자료 1 · 특허 0 · 논문 0 · 보고 0)에서 값이 증명된 것은 자료 방(훅이 지킴)과 들이기 방뿐. 필수는 **본방 · 들이기 · 자료 셋**, 나머지 넷은 "그 일을 시작할 때 사람이 연다"가 맞아 보임. 비서 지침에 "갈래 방은 사람이 허락해야 연다"가 이미 있는데 setup 은 일곱을 다 만드는 모순도 있음. **두 길 제시했고 사람 답 대기**: (가) 지금 setup 을 셋만 만들게 고친다(ADR) (나) 4단계에서 "2주 뒤 글 0 인 방 수"를 재고 정한다(HANDOFF 4절 예측 항목에 넣어 둠). 방·폴더 대응표는 마지막 답에 적었다 — 요지: 방은 입구, 과제 폴더(`projects/<과제>/`)가 진실, 봇 폴더(`prodev/bots/<봇>/`)는 봇의 메모(threads · handoff · find.log · rooms.json · out · tmp).
2. **P8 카드 규격**: 카드에 정상 행(합격 행 · 공급사 열)을 실을지 — 봇이 본방 #151 에서 PL 에게 물어 둔 채. 사람 결정.
3. **회사에서 정할 값**: 서버 포트(기본 3000) · 과제 저장소 자리(`MINIDISCORD_BOT_FILES_DIR` 은 그 부모).

## 이 기계의 상태
- 시험 서버 3123 · DB `minidiscord/testplace/data2` · 과제 `projects/worktogether` · 봇 `prodev-worktogether-비서` (켜져 있을 수 있음, 꺼도 됨). 재생 토큰 `runs/.tokens.env`(회사로 안 가져감).
- prodev 세션 이름 `prodev` — `SendMessage(to: "prodev")` 로 지휘. 하네스가 도는 중엔 메시지 안 보내고 `notify_when_idle` 만.
- 검산은 prodev 폴더에 쓰지 않도록 임시 폴더 사본으로. meta 훅이 prodev 쓰기를 막는다(명령 문자열에 `prodev` + 쓰기 냄새 · `=>` 화살표도 리다이렉트로 잡힘 → 스크립트 파일로 돌린다).

## 파일 자리 (오늘 만든 것)
- 관문 기록: `../runs/2026-09-10-{T1M,T2M,T2M-2,T3M}.md` · R1 무효 셋 `../runs/2026-09-10-R1-무효.md` · 재생 JSONL 전부 `../runs/`
- 채점표(칸별 근거 · 재측정 절): `../scripts/scoring.md` · 대본 `../scripts/R?-*.json` · R3 정답 `../scripts/R3-key.md` · 트리거 정답지 `../fixtures/triggers.json`
- 예측 실측: `../predictions/prodev-prediction.md` (P7 · P8 빗나감, 안 고침)
- 관문 사이 meta 잘못 다섯: `2026-09-10-between-gates.md`
- 도구: `../scripts/tools/{cost.js,gate-tests.sh,replay.sh,weekly.sh}` (전부 돌려 봄)
- 회사 인수인계: `../HANDOFF.md` · prodev 쪽 `../../../prodev/docs/{launch.md(10절 옮기기),as-built.md,log.md}`

## prodev 에 이미 보낸 지시 가운데 열린 것
없음. 마지막 보고(490f162)까지 meta 가 확인했고 prodev 는 "회사 기계의 지시를 기다린다".

## 다음 세션이 바로 할 수 있는 것
- 사람이 방 셋/일곱을 정하면: (가)면 prodev 에 setup.js · charter 스킬 · ADR-022 지시 후 사본 시험 + 관문은 T4.M 에서 다시 잼, (나)면 아무것도 안 함.
- 회사로 옮기기 전 마지막 확인: `zsh ../scripts/tools/gate-tests.sh 이전전` 한 번.
