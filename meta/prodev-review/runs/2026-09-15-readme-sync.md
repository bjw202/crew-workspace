# README 셋 맞추기 (루트 · prodev · cockpit) 검수 — 2026-09-15

채점표: `scripts/scoring-readme-sync.md` (13:04 적음, 13 · 14 칸은 제작 전에 사람 요구로 더함).
대상: 루트 `README.md`(커밋 전 작업 사본) · prodev PR #23 (`readme-sync` e297e4d) · cockpit PR #1 (`readme-sync` 38bb310).
만든 쪽: 서브에이전트 셋(루트 · cockpit · prodev). prodev 는 처음에 떠 있던 prodev 세션에 맡겼으나 13:35 에 한 줄도 고치지 않고 종료 → 서브에이전트로 옮김.
센 쪽: 1차 감사 셋(A 루트↔prodev 15행 · B 루트↔cockpit 9행 · C 경계·숫자 32행 중 틀림 17) · 재감사 하나 · meta 직접 실행.

## 표

| # | 칸 | 결과 | 근거 | ○ / ✗ |
|---|---|---|---|---|
| **1** | **셋 사이 어긋남** | 1차 52행 중 풀림 50 · 남음 1(A-11.4 threads 자리, 코드끼리 엇갈림을 루트가 밝힘) · 바뀐 꼴로 남음 1(A7 → N1). 새 어긋남 9: 틀림 3(N1 · N2 · N3, 모두 prodev) · 사소 6(N4~N9) | `scratchpad/reaudit.md`, N1~N3 은 meta 가 코드로 다시 확인 | ✗ |
| **2** | **코드 대조 12** | 틀림 0 / 12 | 아래 "표본 12" | ○ |
| **3** | **명령 · 경로 같은 꼴** | N3: prodev README:1000 이 `docs/launch.md` 3 · 4절을 "지금 길" 로 안내 → 3절 `setup.js --project`(:71) 뒤 4절 `open-project`(:99) = `create.js:66` 409. 같은 README:990 경고와 반대. N5: `--no-setup` 을 "방만 연다" 로 적음(봇 · 세션 줄도 만듦) | reaudit N3 · N5 · `launch.md:71,99` | ✗ |
| 4 | 숫자 | 스킬 15 · 도우미 6 · 훅 3 · 스크립트 10 · ADR 39 가 개수를 적은 루트 · prodev 에서 같음 (cockpit 은 개수를 안 적음). N9 시험 수 148 vs 140 은 README 밖 `docs/as-built.md` | reaudit 4절 · meta `## ADR-` 39 | ○ |
| 5 | 핀 표기 | 루트 8.2 = `workspace.json` (prodev 7155e77 · minidiscord 6633f7b · cockpit 7aa80dd · crew eefac93) | grep 564-567 | ○ |
| 6 | 역할 경계 · 링크 | 링크 넷 있음(루트→cockpit · prodev 10절, cockpit→prodev · 루트 0절, prodev→cockpit · 루트 971줄). 한 문단 넘는 중복 둘: 루트 8.3 ↔ cockpit 7.2 · 7.3, 루트 4 · 5 · 6절 ↔ prodev 워크플로우 ① · ③ · ⑤ · ⑦ | grep · reaudit 4절 | ✗ |
| 7 | minidiscord · crew | README diff 0 (두 저장소 `git diff --numstat -- README.md` 0줄) · 루트 1절이 "옛 창구 · 읽기만" · "닫힌 실험" | 직접 실행 | ○ |
| 8 | 코드 안 건드림 | prodev #23 files = `README.md` · cockpit #1 files = `README.md` · 루트는 `README.md` · `.gitignore` 만 | `gh pr view` | ○ |
| 9 | 시험 | prodev e297e4d 사본: npm test 148/148 · test:server 18/18 실패 0. cockpit 38bb310: npm test 215/215 실패 0 | meta 직접 실행 | ○ |
| 10 | 길이 | 루트 693 · prodev 1100 · cockpit 643 | `wc -l` | ○ |
| 11 | 문체 | 루트 "합니다" 끝 0줄 · cockpit "한다" 끝 0줄 · prodev "합니다" 끝 3줄은 모두 인용 칸(`>`) 의 봇 말(750 · 752 · 753) | grep | ○ |
| 12 | 동원 규모 | 서브에이전트 일곱 (감사 3 · 제작 3 · 재감사 1). 떠 있던 prodev 세션 지시는 세지 않음 | | ○ |
| **13** | **mermaid** | 루트 10 · cockpit 4 · prodev 17, 파싱 오류 0 (mermaid 11 + jsdom 으로 블록마다 `mermaid.parse`, 일부러 깬 블록 1 은 잡힘). 새로 쓰거나 다시 그린 그림의 풀이 없음 0. prodev 옛 절 다섯(11 · 72 · 198 · 252 · 870)은 제목 바로 아래 그림 — 원판에도 같았다 | `scratchpad/meta-mmd/check.mjs` | ○ |
| 14 | 쉬움 | 풀이 없는 말: 루트 1 (11절 2번 "`init` 사건") · prodev 1 (⑥ 그림 "serve 가 resume") · cockpit 0 (SSE · MCP 는 1.2 낱말표에 있음) | 절 셋씩 읽음 | ✗ |

## 표본 12 (코드와 직접 대조)

| 문서 | 문장 | 코드 | 맞음 |
|---|---|---|---|
| 루트 | `env` = 허락 15 + `extraEnvKeys` + `PRODEV_BOT_DIR` | cockpit `src/session/env.js:7-21` · `manager.js:224` | ○ |
| 루트 | bootstrap 은 핀 커밋 checkout → 떨어진 HEAD, 안내 줄 | `bootstrap.sh:21-22` | ○ |
| 루트 | setup 실패 502 · `settings.local.json` 확인 · 60초 | `create.js:90-94` · `setup-runner.js:12` | ○ |
| 루트 | find.log 는 봇 폴더 · 마감 때 지식 승격 | prodev `scripts/find.js:275` · `close/SKILL.md:15,44` | ○ |
| cockpit | 글은 idle · working · waiting_approval 에 넣고 압축 중만 기다림 | `manager.js:22` · `:296-307` | ○ |
| cockpit | channel 봉투 속성 · reply 지시 줄 | `envelope/wrap.js:13` · `:62-68` | ○ |
| cockpit | `POST /api/rooms/:id/messages` · `GET /api/stream` | `routes-messages.js:22` · `server.js:80` | ○ |
| cockpit | 허용 도구 둘 · reply 가 chat.db 에 적고 SSE 로 뜸 | `options.js:9` · `mcp/tools.js:116-117` · `manager.js:218` | ○ |
| prodev | 켤 때 여덟 절 순서 | `common/hooks/session-start.js:95-138` | ○ |
| prodev | 확정 조건 ② "그 과제의 방" | `common/hooks/pre-reply.js:105-109` | ○ |
| prodev | setup.js 는 방을 만들지 않는다 | `scripts/setup.js:4-12` | ○ |
| prodev | ADR 서른아홉 | `design/v3/ADR.md` `## ADR-` 39 개 | ○ |

덧: cockpit 5절 sequence 그림은 큐 넣기를 `POST /api/rooms/:id/messages` 가 하는 것으로 줄여 그렸다. 실제로는 그 길이 부른 `manager.postUserMessage` 가 넣는다(`manager.js:87`). 흐름은 같아 틀림으로 세지 않았다.

## 일어난 일

- 훅이 막은 명령 셋: prodev 본 체크아웃 빨리감기(규칙대로 막힘) · 임시 폴더 bootstrap 시험(명령에 `prodev` 경로가 섞임) · meta 확인 명령 둘(`bjw202/prodev` 글자와 grep 패턴의 `>` · `rm` 과 `prodev/bots` 경로가 한 명령에). 우회하지 않고 명령을 나눴다.
- 제작 서브에이전트가 meta 의 scratchpad 파일을 덮었다: 루트 작성자가 `scratchpad/mmd/` 를 비워 검사기가 사라짐(→ `meta-mmd/` 에 다시 만듦), cockpit 작성자가 `commit-msg.txt` 를 덮음(meta 커밋은 그 전에 끝남).
- 같은 날 옛 판 산출물 정리: `projects/` 과제 넷 · `prodev/bots/` 봇 넷을 `archive/`(git 제외)에 묶고 지움. 봇 폴더 삭제는 사람이 직접 쳤다. 다 쓴 prodev worktree 둘(`cockpit-m3` · `cockpit-v2d`, origin/main 에 없는 커밋 0) 지움.

## 틀림 셋 (meta 가 코드로 다시 확인)

| id | 자리 | 코드 사실 |
|---|---|---|
| N1 | prodev README:528 워크플로우 ⑥ "WORK --> CLOSE: 사람이 시킬 때 · 압축 직전" · :529 "CLOSE --> OFF" · "비서의 하루" 그림 "압축이 걸리면 → journal" | `common/hooks/pre-compact.js` 에 journal 0 줄. "압축 직전" 은 `journal/SKILL.md:10` · `prodev-orchestrator/SKILL.md:21` 글에만 있고 부르는 자리가 없다. journal 은 세션을 끄지 않는다 |
| N2 | prodev README 워크플로우 ② sequence "threads/ 에 남은 물음을 적어 둔다" 를 과제 폴더 참여자에 둠 | `intake/SKILL.md:73` 은 `bots/<봇>/threads/<방>-E-0007.md` |
| N3 | prodev README:1000 "`docs/launch.md` 는 3절 · 4절이 지금 길이다" | `launch.md:71` `setup.js --project` → `:99` `open-project` (--no-setup 없음) → cockpit `create.js:66` 409 |

## 판정

**반려.** ○ 열 (2 · 4 · 5 · 7 · 8 · 9 · 10 · 11 · 12 · 13) / 열넷, 굵은 넷 중 1 · 3 ✗. 기준(열둘 이상 · 굵은 넷 전부) 미달.
PR 둘(prodev #23 · cockpit #1)은 열어 둔 채 머지하지 않았다. 루트 README 는 커밋하지 않았다.

## 2차 (같은 날, 채점표는 그대로)

사람이 정한 범위: N1 · N2 · N3(㉮ README 문장만 — `docs/launch.md` 는 안 고침) · 중복 둘 · 쉬움 둘 · N4 · N5 · N6 · N7(`bootstrap.sh:7` 한 줄) · N8(루트 커밋 · 푸시로). 스킬 글 "압축 직전" · `as-built.md` 시험 수 · `pre-compact.js:10` 주석은 다음 PR.
바꾼 것은 지시뿐이다: ① 작성자 하나가 문서를 차례로 고친다(동시에 셋 → 하나) ② "고칠 말" 은 코드로 다시 본 뒤에만 옮긴다 ③ 코드끼리 엇갈리는 자리는 단정하지 않고 엇갈림을 적는다.
추가 사실: cockpit PR #1 은 1차 판정 전에 머지됐다(431d7c8, meta 가 머지하지 않음). cockpit 세션이 `94beb86`(@ 자동완성에서 CC 항목 뺌, origin/main)을 올렸고 입력칸 기본 `@TO(봇)` 지우기가 진행 중이다 → cockpit README 는 그 작업이 끝난 뒤 2단계로 맞춘다.

## 빗나간 줄 원인 가설

- 1 · N1: meta 가 1차 감사 A7 의 "고칠 말" 제안("사람이 시킬 때 · 압축 직전")을 코드로 다시 보지 않고 제작 지시에 옮겼다.
- 1 · N2: 작성자가 코드끼리 엇갈리는 자리(threads)에서 훅 쪽을 골라 intake 그림에 단정했다 — 지시에 "엇갈리는 자리는 단정하지 않는다" 가 없었다.
- 3 · N3: 지시가 README 만 고치게 막아, README 가 가리키는 `docs/launch.md` 안의 옛 순서를 작성자가 링크 문장으로 덮었다.
- 6: 지시의 "한 문단 넘게 되풀이하지 않는다" 를 작성자 셋이 각자 자기 문서 안에서만 보고, 다른 두 문서와는 대조하지 않은 것으로 보인다 (서로의 고친 판을 동시에 만들었다).
- 14: 제작 지시에 "풀이 없는 낯선 말을 남기지 않는다" 를 적었으나, 그림 라벨과 11절 같은 사실 목록은 작성자가 낱말표와 대조하지 않은 것으로 보인다.

## 2차 결과

대상: 루트 `README.md` · `bootstrap.sh`(커밋 전 작업 사본, 557줄) · prodev PR #23 (`readme-sync` 2d22ba9) · cockpit PR #2 (`readme-sync-2` e416fa5, 바탕 origin/main 0b66e00 — 입력칸 미리 채움 없음 · @ 자동완성 TO 한 종류).
만든 쪽: 작성자 서브에이전트 하나(1단계 prodev · 루트 → 2단계 cockpit · 루트 봉투 줄 · prodev 알림 줄). 센 쪽: 1차 재감사 에이전트를 이어 부름(`scratchpad/reaudit-2.md`) · meta 직접 실행.

| # | 칸 | 결과 | 근거 | ○ / ✗ |
|---|---|---|---|---|
| **1** | **셋 사이 어긋남** | 1차 N1~N7 · A7 풀림. 남음: N8(루트 커밋 전이라 GitHub 링크가 옛 판) · N9(`as-built.md` 140건, 사람이 다음 PR 로 미룸) · A-11.4(threads 코드끼리 엇갈림, 세 문서가 엇갈림으로 적음). 새 틀림 1: **M1** 루트 :322 가 "카드 머리말은 prodev README 워크플로우 ② · ⑤" 로 가리키나 prodev README 에 머리말 칸 설명이 없다(`## 카드 한 장에는` :236 은 담는 깊이, 칸 목록은 `design/v3/ARCHITECTURE.md:122-140`). 새 사소 5: M2 안내 글자는 placeholder 라 입력칸이 빌 때만 보임(루트 :355 · cockpit :401 "봉투가 없으면") · M3 루트가 0b66e00 화면을 쓰는데 cockpit 핀은 7aa80dd · M4 루트 11.2 "명령 수와 도우미 이름만"(코드는 account · resumed 도 적음, `manager.js:241-243`) · M5 루트 8.3 `check` 의 botsDir 검사는 `prodevDir` 을 적었을 때만(`config.js:47`) · M6 prodev :1037 이 옛 판이라 밝힌 `launch.md` 10.4 를 가리킴 | reaudit-2 · M1 · M2 · M4 · M5 는 meta 가 코드로 확인 | ✗ |
| **2** | **코드 대조 12** | 틀림 0 / 12 — `@` 만 쳐도 목록(`app.js:668` 정규식) · TO 한 종류(`:708`) · 삽입 `@TO(이름) `(`:772`) · 목록 열림 때 Enter 고르기(`:805`) · Tab 고르기(`:792`) · 보낸 뒤 비움(`:821`) · 안내 글자 조건(`glue.js:34-35`) · 시간 초과 거부 기본 10분(`relay.js:39` · `config.js:15`) · 409 `left`(`create.js:69-78`) · `--no-setup` = setup 만 건너뜀(`bin/cockpit.js` `setup: !opt['no-setup']` · `create.js:66,82`) · 확정 관문 chat.db 읽기 전용(`pre-reply.js:49`) · `MINIDISCORD_URL` 빈 값이면 알림 건너뜀(`settings.template.json:9` · `places.js:138-140`) | meta 직접 | ○ |
| **3** | **명령 · 경로 같은 꼴** | N3 · N5 풀림. 방 만들기 `+` → POST /api/rooms → setup.js, `open-project --no-setup`, 봇 폴더 자리를 세 문서가 같은 꼴로 말함 | reaudit-2 · meta grep | ○ |
| 4 | 숫자 | 스킬 15 · 도우미 6 · 훅 3 · 스크립트 10 · ADR 39 같음 (cockpit 은 개수 안 적음) | reaudit-2 4절 | ○ |
| 5 | 핀 표기 | 루트 :431-434 = `workspace.json` | grep · node | ○ |
| 6 | 역할 경계 · 링크 | 링크: 루트→cockpit 7 · 루트→prodev 5 · prodev→cockpit 3 · cockpit→prodev 5. 중복: 루트 4 · 5 · 6절은 링크만, 루트 8.3 ↔ cockpit 7절 겹침은 표 두 줄(한 문단 미만). 루트에서 뺀 조종석 증상 아홉은 cockpit 7절 · 5.1 에 모두 있음 | grep · reaudit-2 2절 | ○ |
| 7 | minidiscord · crew | README diff 0 | git | ○ |
| 8 | 코드 안 건드림 | prodev #23 · cockpit #2 files = `README.md`. 루트는 `README.md` · `bootstrap.sh`(주석 두 줄) · `.gitignore` | `gh pr view` · git status | ○ |
| 9 | 시험 | prodev 2d22ba9 사본 npm test 148/148 · test:server 18/18 · cockpit e416fa5 npm test 215/215, 실패 0 | meta 직접 | ○ |
| 10 | 길이 | 루트 557 · prodev 1100 · cockpit 647 | `wc -l` | ○ |
| 11 | 문체 | 루트 "합니다" 0 · cockpit "한다" 0 · prodev "합니다" 3 은 인용 칸 | grep | ○ |
| 12 | 동원 규모 | 서브에이전트 여덟 (1차 일곱 + 2차 작성자 하나. 재감사는 1차 에이전트를 이어 부름) | | ○ |
| **13** | **mermaid** | 루트 7 · prodev 17 · cockpit 4, 파싱 오류 0. 풀이 없음 표시 5 는 prodev 옛 절(1차와 같음) | `meta-mmd/check.mjs` | ○ |
| 14 | 쉬움 | 고친 절 셋씩에서 풀이 없는 말 18 (루트 8 · prodev 7 · cockpit 3) | reaudit-2 5절 | ✗ |

### 2차 판정

**반려.** ○ 열둘 / 열넷으로 수는 닿았으나 굵은 1 이 ✗ (M1 틀림 하나). 1차 반려 사유(N1~N3 · 중복 둘)는 모두 풀렸다.
PR 둘은 열어 둔 채 머지하지 않았다. 루트 README · bootstrap.sh 는 커밋하지 않았다.

### 사람의 결정 (2차 판정 뒤)

사람: "너무 문서에 공들일 필요는 없다. 적당한 수준이라면 머지까지 진행하자." → 반려 판정은 그대로 두고, **사람이 이 판을 받아들여** 머지했다. 채점표 · 판정은 고치지 않는다.
머지 전에 meta 가 루트 README 의 M1 한 줄만 바로잡았다 (틀린 가리킴). M2 · M4 · M5 · M6 · 쉬움 18 · N9 는 남긴 채로 둔다.

### 2차 빗나간 줄 원인 가설

- 1 · M1: 루트 5절을 줄이면서 옮길 자리를 절 이름으로만 골랐고, 링크한 절 안에 그 설명이 실제로 있는지는 대조하지 않은 것으로 보인다.
- 1 · M2: "봉투가 없으면 안내 글자" 는 cockpit 세션의 설명 문장을 옮긴 꼴이고, placeholder 가 보이는 조건은 코드(`app.js:312`)까지 내려가 보지 않았다.
- 1 · M3 · N8: 문서는 main 최신 화면을, 핀은 옛 커밋을 본다 — 머지 · 핀 올리기 전의 판 차이다.
- 14: 2차 지시의 "낯선 말에 풀이" 가 새로 쓴 문장에만 걸리고, 줄이며 남긴 표 · 목록의 코드 이름(파일 · 함수 · 설정 키)은 풀이 대상으로 보지 않은 것으로 보인다.
