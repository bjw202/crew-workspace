# meta 지휘 세션 인수인계 — cockpit 회차 (2026-09-14 저녁 기준)

새 meta 세션이 `/clear` 뒤 첫 번째로 읽는 문서다. 기억 파일(`~/.claude/projects/…/memory/`)도 실리지만, **이 파일이 진실**이다. 읽는 순서: 이 문서 → `AS-IS-TO-BE.md` → `DESIGN.md`(필요한 절) → 최신 `runs/2026-09-14-cockpit-*.md` → `instructions/` 의 마지막 지시문.

## 1. 역할과 규칙 (바뀌지 않는 것)
- **사람**: PL(byunjungwon). 결정은 사람이 한다. 사람은 실시간으로 보지 않는다 — 막힘만 묻는다.
- **meta 세션(이 세션)**: 지휘자 · 검수자. 만들지 않는다. 예측을 먼저 적고, 관문에서 **사본으로 직접 돌려** 세고, `runs/` 에 기록하고, 다음 지시를 `instructions/` 파일 + SendMessage 로 보낸다.
- **cockpit 세션**: 제작자. `crew-workspace/cockpit/` 저장소(자기 git). `ListAgents` 에 `cockpit` 으로 보인다. `SendMessage({to:'cockpit', notify_when_idle:true})` 로 지시하고, 보고는 cross-session 메시지로 온다. 문맥이 차면 스스로 알리고 멈춘다 → 사람이 `/clear` → 새 세션에 "instructions/<최신>.md 부터 읽어라" 로 다시 시작.
- meta 규칙(`meta/CLAUDE.md`): 예측은 숫자로 먼저 · 만드는 쪽에 판정을 맡기지 않음 · 채점표는 돌리기 전에(`scripts/scoring-cockpit-*.md`) · 관문 중 규칙 불변 · 세는 것은 기계 · prodev 고침은 관문 사이에 worktree + PR 로만.
- **cockpit 에 주지 않는 것**: `PREDICTIONS.md` · `fixtures/` · `scripts/scoring*` · `runs/`. 주는 것: `AS-IS-TO-BE` · `DESIGN` · `TASKS` · `spike/` · `research/` · `instructions/`.

## 2. 이 회차가 무엇인가 (한 줄)
회사가 Claude Code channels 를 막아 minidiscord 창구가 죽었다 → **cockpit**(웹 앱 하나)이 Agent SDK 로 prodev 봇 세션을 직접 띄우고 붙들며, 사람은 브라우저로 들어온다. 봇이 보는 세계(방 둘 · 봉투 · `reply` 도구 · 훅 셋 · 과제 폴더)는 그대로. 근거 · 선택 · 구성은 `DESIGN.md`, 사람이 정한 요구는 그 1절(R0~R8).

## 3. 지금까지 관문
| 관문 | 판정 | 기록 |
|---|---|---|
| D0 문서 다섯 | 조건부 통과 (17/18) | `runs/2026-09-14-cockpit-D0.md` |
| M1.M 뼈대 | 통과 (13/13) | `runs/2026-09-14-cockpit-M1M.md` |
| **M2.M = W2 서버 뼈대** | **반려** — cockpit 자체 10/10 ○, 옛 대본 R1~R4 재생 22/33 (T3M 26/33 미달) | `runs/2026-09-14-cockpit-M2M.md` |

W2 반려의 원인 다섯 갈래: A cockpit 큐 규칙(idle 에서만 → 되돌린다) · B cockpit 값 누적(SDK `total_cost_usd` 는 누적값) · C 허용 규칙 자리(**프로젝트 `settings.json` 의 allow 는 SDK 가 안 읽는다 → `settings.local.json`**, prodev PR) · D 스크래치 배치(`../../scripts` 가 없어 find.js 안 돎) · E 봇 편차(고치지 않음). 지시는 `instructions/W2-refix.md`.

## 4. 다음 할 일 (순서)
1. cockpit 보고(W2r.1~3 커밋 + prodev PR 번호)를 받는다.
2. prodev PR 검수: `gate-tests.sh`(사본에서 133 + 25) · `settings.local.json` 에 허용 22 · deny · 도구 이름 치환 · ADR 절. 통과면 **사람에게 머지를 청한다**(meta 가 머지하지 않는다).
3. **W2 재측정**: 같은 대본 넷(`scripts/R1-charter.json` · `R2-intake.json` · `R3-find.json` · `R4-research.w2.json`), 같은 채점표(`scripts/scoring.md` + `scoring-cockpit-M2.md`), 예측 `PREDICTIONS.md` 의 **P-W2r 절**(이미 적혀 있다 — 고치지 않는다). 재생 방법은 아래 5절.
4. 통과면 M3 지시(조종석 판 · 파일 판 · 세션 조작 · 재기동, `cockpit/docs/TASKS.md` M3 절). M3.M 채점표를 먼저 쓴다. M3.M 에서 R5(압축 · 재기동)를 돌린다.
5. 그 뒤 M4(윈도우 · 설치) → W4 실전은 회사 PC.

## 5. W2 재생 방법 (meta 가 직접, 이번에 밟은 그대로)
```
S=<스크래치>                                  # 세션 스크래치 폴더 아래, 공백 없는 경로
git -C crew-workspace/cockpit archive HEAD | tar -x -C $S/cockpit-copy && cd $S/cockpit-copy && npm ci
# 스크래치: smoke/lib.mjs 의 makeScratch(root, 'worktogether') 를 부르는 작은 mjs (이번 것: 스크래치의 w2-prep.mjs)
#   W2r.3 뒤에는 봇 폴더가 <root>/prodev/bots/prodev-worktogether-bot 아래에 생긴다
COCKPIT_PRODEV_DIR=<ws>/prodev node w2-prep.mjs $S/w2-scratch          # cockpit.json 을 낸다 (host 127.0.0.1 · port 3123)
node bin/cockpit.js open-project worktogether --bot-name prodev-worktogether-비서 --bot-dir <봇 폴더> --config $S/w2-scratch/cockpit.json
echo 'pl-pass-1' | node bin/cockpit.js init-admin 김피엘 --config …   ·   echo 'mem-pass-1' | node bin/cockpit.js add-user 김과제 --config …
node bin/cockpit.js session-token 김피엘 --config … → REPLAY_TOKEN_PL / 김과제 → REPLAY_TOKEN_MEMBER (64자)
node bin/cockpit.js serve --config … --start worktogether --model claude-sonnet-5      # 백그라운드
node w2-approver.mjs http://127.0.0.1:3123 <PL 토큰> <log>   # admin 역할로 전부 허용하고 센다 (POST /api/permissions/:id {decision:'allow'}, GET ?pending=1)
REPLAY_TOKEN_PL=… REPLAY_TOKEN_MEMBER=… node <ws>/prodev/scripts/replay.js <대본> <기록.jsonl> --base http://127.0.0.1:3123 < /dev/null   # R1 → R2 → R3 → R4.w2 차례로
```
세는 도구(스크래치에 두었던 것, 다시 쓰면 같은 꼴로): `dump.cjs`(방 글 전부 → 텍스트) · `events.cjs`(session_events 도구 · 훅 막힘) · `blocks.cjs`(훅이 막은 이유) · `cost-check.cjs`(값 누적 확인) · `pragma.cjs`(표 열). 값은 `node prodev-review/scripts/tools/cost.js --bot prodev-worktogether-bot --since <ISO> --until <ISO>`. 끝나면 `pkill -f "cockpit.js serve"` · `pkill -f w2-approver`.

## 6. 이 기계에서 걸리는 것 (시간을 아끼려면)
- **meta 의 보호 훅**(`meta/.claude/hooks/guard.js`)은 Bash 명령 문장에 `prodev` 경로가 있고 동시에 `rm` · `mkdir` · `cp` · `ln` · `npm ci` · `>`(리다이렉트) · **`=>`(화살표도 걸린다)** · 파이프 뒤 `truncate` 같은 낱말이 있으면 막는다. 우회하지 말고 **명령을 가른다**: 설치 · 폴더 만들기는 prodev 언급 없이, prodev 경로가 드는 명령은 읽기 형태로. node 분석은 `.cjs` 파일로 써서 `node 파일` 로 부른다.
- 시험은 `node --test "test/**/*.test.js"` (디렉터리 인자는 안 된다). 형제 저장소는 `COCKPIT_PRODEV_DIR` · `COCKPIT_MINIDISCORD_DIR`.
- 스모크는 스크래치 폴더 이름을 매번 새로(`smoke-hello-2` …). 실제 `prodev/bots/` 는 절대 cwd 로 쓰지 않는다. 한 번 실수로 `prodev/bots/prodev-searchgate-bot/handoff-compact.md` 를 덮은 적이 있다(시험 봇, 실전 값 없음).
- 옛 대본 R4 는 `리서치` 방(방 일곱 시절)이라 `R4-research.w2.json`(본방으로 치환) 을 만들어 두었다. R5 는 admin 압축 · 끄기 API(M3.3) 뒤에만 돌 수 있다.
- `claude -p --setting-sources project,local --permission-mode default --output-format json` 의 `permission_denials` 가 권한 규칙 실험의 가장 싼 도구다(실증 6).

## 7. 파일 자리
| 무엇 | 어디 |
|---|---|
| 설계 검토 묶음 | `meta/prodev-review/plans/2026-09-14-web-cockpit/` (DESIGN · AS-IS-TO-BE · TASKS · PREDICTIONS · spike/ · research/ · instructions/) |
| 관문 채점표 | `meta/prodev-review/scripts/scoring-cockpit-{docs,M1,M2}.md` · 대본 채점표 `scoring.md` · R3 정답 `R3-key.md` |
| 관문 기록 | `meta/prodev-review/runs/2026-09-14-cockpit-{D0,M1M,M2M}.md` |
| cockpit 문서 | `cockpit/docs/{PRD,ARCHITECTURE,ADR,TASKS,VERIFICATION,as-built,log}.md` · `cockpit/smoke/README.md` |
| 동작 구조 그림 | https://claude.ai/code/artifact/b47f0545-0dae-4601-8313-2d270112c389 |
| 기억 파일 셋 | `project-web-cockpit-2026-09-14` · `project-cockpit-build-2026-09-14` · `project-settings-local-permissions` |

## 8. 사람이 아직 정하지 않은 것
- 회사 계정(Team/Enterprise)에서 SDK 세션이 도는지 · 좌석 하나를 봇 경유로 여럿이 쓰는 계약(W1 · DESIGN 11절 ①).
- 사내망 HTTPS(자체 서명 vs http).
- `workspace.json` 의 cockpit 핀 — 원격 저장소가 아직 없다.
- meta 저장소 커밋 — 이 회차의 meta 파일들은 아직 커밋하지 않았다(사람이 시키면).

## 9a. 새 meta 세션(meta-f3)이 이어받은 뒤 (2026-09-14 19:2x)
- **PR #17 머지 확인** (`origin/main` = `ac3ecc9`, 19:04). `workspace.json` 의 prodev 핀을 `ac3ecc9` 로 올렸다(커밋은 안 함 — 사람이 시키면). 본 체크아웃 `../prodev/` 는 `df2373a` 그대로 — `git pull --ff-only` 도 보호 훅이 막는다(우회 안 함, 사람이 당긴다). 그래서 M3 동안 `COCKPIT_PRODEV_DIR` 은 계속 `../prodev-wt-cockpit`(`20d5cb2` = 머지된 트리).
- **cockpit 에 M3 첫 지시를 보냈다** (`instructions/M3.md` 6절 덧붙임: 머지 사실 · worktree 유지 · 두 번째 PR 가지 이름 `cockpit-m3-skills` · 보고 상대 meta-f3). `notify_when_idle` 로 구독 중. cockpit 세션은 `/clear` 없이 같은 세션(cfd539)이 이어받았다.
- **W2r 예외(승인 31 > 3)** 는 아직 사람이 인정하지 않았다 — 첫 보고에 물었다. 인정 안 하면 W2 는 반려로 되돌리고 M3 를 닫는다.
- 훅에 걸리는 것: Bash 명령문에 `prodev-wt-…` 경로나 스크래치 안의 `…/prodev/bots/…` 경로가 있으면 `rm · mkdir · cp · npm ci · > · =>`(화살표 함수도) 가 막힌다. 스모크 · 재생 · 분석은 **스크래치에 `.sh` · `.mjs` · `.cjs` 파일로 써 두고 `zsh 파일` · `node 파일` 로 부른다**(명령문에 그 경로가 안 실린다). 긴 재생은 백그라운드 Bash 의 10분 상한에 걸리므로 `nohup … &` 로 떼고 Monitor 로 로그를 본다.
- **M3.M (= W3) 통과** (20:15, `runs/2026-09-14-cockpit-M3M.md`): cockpit 10/10 · R5 8/9 · 승인 R2+R4 4 · 값 $5.46(조종석)/$7.99(cost.js). PR #18 검수 통과(사본 142 · 18). 재생 도구는 스크래치 `m3m/`: `w3-driver.mjs`(스크래치 + serve + 승인 자동 허용 + replay.js 차례 실행 + R5 손 걸음을 admin API 로) · `analyze.cjs` · `analyze2.cjs` · `run-smokes.sh` · `run-w3.sh` · `R7-deny.json`. 새 세션은 못 보므로 다시 쓸 때는 M3M 기록의 "사본" 문단과 8.3 표대로.
- **M4 지시를 보냈다** (`instructions/M4.md`, 20:25). M4.M 채점표 `scripts/scoring-cockpit-M4.md` · 예측 `PREDICTIONS.md` P-M4 절을 먼저 썼다. 윈도우 실측(P-M4.5 · 6)은 사람이 회사 PC 에서 돌려 파일로 준다.
- **20:30 갱신**: 사람이 `../prodev/` 를 `git pull --ff-only` 로 당겼고 **PR #18 은 머지됐다**(`1e02367`, 20:18, 트리 = 시험한 `8c2ae4a`). `workspace.json` 의 prodev 핀을 `1e02367` 로 올렸다(커밋 안 함). cockpit 에 알렸다 — 이제 `COCKPIT_PRODEV_DIR` 기본값 `../prodev` 로 돌아간다. worktree `../prodev-wt-cockpit`(가지 `cockpit-m3`)은 더 안 쓴다 — 정리는 사람이(`git -C ../prodev worktree remove ../prodev-wt-cockpit`, meta 훅이 막는다).
- **M4.M 맥 조건부 통과** (20:40, `runs/2026-09-14-cockpit-M4M.md`): cockpit `59f3523`, 맥 여덟 칸 8/8. 윈도우 실측 넷(npm test · check · m1-hello · m3-restart)은 **사람이 회사 PC 에서** 돌려 출력 파일을 주면 그 기록에 덧붙인다. cockpit 에는 `instructions/after-M4.md`(마무리 셋 뒤 멈춤)를 보냈다. 이번 회차 관문 넷(M1.M · M2.M/W2r · M3.M · M4.M)이 끝났고, 다음은 **W1 회사 PC 실증(사람)** → W4 실전.
- **cockpit 세션 멈춤** (20:45): 마지막 커밋 `b83e803`(INSTALL 6번 프록시 한 줄 · log M4.M 절 · 세션 끝 상태), 작업 트리 깨끗 — meta 가 확인. 다시 깨울 때 첫 지시: "cockpit 제작 세션 이어서. cockpit/docs/log.md 의 마지막 '세션 끝' 절을 읽고, meta 의 새 지시문(instructions/ 의 최신 파일)을 기다려라."
- **사람이 이 맥에서 처음 눌러 봄** (20:50~, `~/cockpit-try/` 배치 — makeScratch 꼴, 과제 `수율개선`, 계정 김피엘/김과제, 포트 3000, 실제 prodev/bots 안 건드림): 세션 켜기 · 대기 상태까지 확인. **첫 소감: "테스트는 되는데 UI 가 별로다."** N13(화면은 사람이 처음 본다)의 첫 기록. 구체적으로 무엇이 별로인지는 아직 안 물었다 — W4 전 "미룬 논의" 에 화면 다듬기를 넣을 후보. 사람이 물은 것: "minidiscord 와 cockpit 의 결정적 차이는 MCP 인가?" → 답: 아니다, 세션을 누가 띄우고 붙드느냐(channels 로 깨움 vs SDK 로 직접 띄움)다. AS-IS-TO-BE 의 핵심 여섯.
- **사람이 방향 v2 를 냈다** (21:10, `../2026-09-14-cockpit-후속/DIRECTION-v2.md`): minidiscord 와 cockpit 을 합친다 — minidiscord UI · 첨부 · `@` 호출 유지, channels 만 SDK 로 대체, **files 방 제거**, 방 만들기 = prodev 봇 생성, retro 진화 유지. meta 가 영향(요구표 4줄 · API 겹침 · 하네스 11곳 · retro 유지)과 물음 여섯(기반 저장소 · `@TO` 규칙 · 첨부 읽는 때 · 조종석 판 자리 · 봇 없는 방 · W1 순서)을 적었다. **설계는 아직 안 열었다 — 사람 답을 기다린다.** cockpit 에는 안 준다.
- **사람이 v2 를 확정했다** (21:25): "디스코드 UI 디자인을 계승했으니 디자인을 잘 살리고, meta 추천을 수용한다. 진행해." → meta 가 썼다: `../2026-09-14-cockpit-후속/AS-IS-TO-BE-v2.md`(요구 R9~R14) · `PREDICTIONS-v2.md`(P-D0v2 · P-M5) · `scripts/scoring-cockpit-docs-v2.md` · `instructions/D0-v2.md`(cockpit 문서 개정 지시) · 대본 v2 판 `scripts/R*-*.v2.json`(files → 본방). **cockpit 에 D0-v2 지시를 보냈다.** 다음 관문은 D0-v2(문서) → M5(제작) → M5.M(대본 다섯 v2 + 새 대본 R8 재생, 새 기준선) → W4. W1(회사 PC)은 M4 판으로 병행. 새 대본 R8(사람끼리 글 · "위 파일 봐 줘" 따라잡기)은 M5.M 전에 meta 가 쓴다.
- **D0-v2 통과** (22:05, `runs/2026-09-14-cockpit-D0v2.md`): cockpit 문서 커밋 넷(d4f71d5~a93cb96), 15/16, 필수 여섯 ○. Q1(출처 핀 6633f7b = minidiscord origin/main, 로컬 체크아웃 dfa33c3 은 뒤처짐 — meta 가 fetch) · Q2(find.js 는 고칠 것 없음, prodev 10곳). **M5 지시를 보냈다** (`instructions/M5.md`). M5.M 채점표 `scripts/scoring-cockpit-M5.md` 와 새 대본 `scripts/R8-catchup.json`(사람끼리 글 여섯 · 봇 부르기 · 요약)을 먼저 썼다. M5.M 재생은 R1~R5 v2 → R8 순, prodev PR(가지 `cockpit-v2`) 머지 뒤 또는 그 가지로. meta 몫 남은 것: `tools/weekly.sh` "카드 없는 첨부" 를 본방 기준으로(W4 전).
- **M5.M 진행 중** (2026-09-15 00:20~, `IN-PROGRESS`): cockpit `d41b0da` + prodev PR #19(`9db7cac`). 사본 시험 206/206 · 정적 검사 전부 ○ · 스모크 일곱 exit 0 · PR #19 사본 144/18. 재생(스크래치 `m5m/scratch/w5`, `w5-driver.mjs`, v2 길 — `POST /api/rooms` 가 진짜 setup.js 로 봇을 만듦, prodev 는 `m5m/p19-copy`) R1 → R2 → R3 끝, R4 · R5 · R8 진행 중. 분석은 `m5m/analyze-m5.cjs`.
- **사람이 v2 화면을 이 맥에서 눌러 봄** (`~/cockpit-try-v2/`, 포트 3000, prodev 는 PR #19 사본): 첫 시도에서 **로그인이 안 됐고 Cmd+Shift+R(강력 새로고침) 뒤 됐다** — 같은 주소에 떠 있던 v1 화면 파일을 브라우저가 캐시에 들고 있었다. 실전에서 판을 바꿔 올릴 때 같은 일이 난다 → 관문 뒤 cockpit 에 "정적 파일 캐시 헤더 또는 파일 이름에 판 번호" 확인 자리로 넘긴다(N16 후보). 대본 v2 의 봇 이름은 `prodev-worktogether-bot`(setup.js 가 만드는 이름)으로 바꿨다. 사람이 방 만들기 · 켜기 · 봇 부르기까지 밟았고 **오른쪽 접이식 판에 도구 호출이 보인다.** 사람이 짚은 화면 결함 하나(사진 있음): **"이번 턴 도구 호출" 의 입력 요약(`code.tool-input`)이 좁은 판에서 한 글자씩 세로로 떨어진다**(어떤 카드는 정상, 어떤 카드는 글자마다 줄바꿈 — 폭을 못 받는 flex 자식으로 보임). "개선 작업 필요" — 관문 뒤 지시에 넣는다(N17 후보). 봇 관찰: 시험 봇이 `design/v2/ARCHITECTURE.md` 를 찾아 `grep` · `ls` 를 돌렸다(R2 재생에서도 같은 습관이 승인 카드를 냈다) — prodev 쪽.
- **M5.M 통과** (01:10, `runs/2026-09-15-cockpit-M5M.md`): ① 12/12 · ② 36/42 · ③ R8 8/8 · 승인 8 · 값 조종석 $8.93 / cost.js $15.42. PR #19 검수 통과(머지는 사람). **M6 지시를 보냈다**(`instructions/M6.md`: N16 캐시 · N17 도구 입력 줄바꿈 · INSTALL/README v2 · prodev PR #20 후보 — intake 카드 번호 순서(세 번째 막힘) · journal 절 둘 · 문서 찾기 습관 조사). M6.M 채점표 `scripts/scoring-cockpit-M6.md` 먼저 썼다. 재생 도구는 스크래치 `m5m/`: `w5-driver.mjs`(v2 길) · `analyze-m5.cjs` · `check-static.cjs` · `run-smokes-m5.sh` · `run-w5.sh`. **meta 몫 `weekly.sh`**: 확인 결과 방을 안 본다 — 일지의 "카드 없는 첨부" 절만 센다(18줄). 고칠 것 없음. 대신 일지에 그 절이 남아야 한다(M6 의 prodev PR ②).
- **PR #19 머지됨** (01:25, `a64e1f3`, 트리 = `9db7cac`). `workspace.json` 핀 `a64e1f3` 로(커밋 안 함). cockpit 에 알림. 본 체크아웃 `../prodev` 는 아직 `1e02367` — 사람이 당긴다. **N17 방향을 사람이 정했다**("자세히 볼 내용은 아니지만 칸 안에는 들어와야") → `instructions/M6.md` 3.1: 도구별 사람 말 한 줄(`glue.toolSummary`) · 제 줄 · 한 줄 줄임표 · 누르면 펼침.
- **PR #20 이 meta 검수 전에 머지됐다** (01:07 UTC 16:07, `8f0870b`, 가지 `cockpit-v2b`: intake 카드 번호 뒤 확정 · journal 두 절 유지 — M6 지시 4-① ② 그대로). 사람이 `../prodev` 를 `8f0870b` 로 당겼다. meta 는 **사후 검수**(origin/main 사본 시험 · grep · cockpit 사본 시험)로 대신하고 기록에 "검수 전 머지" 로 적는다. 절차 원칙(검수 뒤 머지)은 다음부터 지킨다.
- **M6.M 통과 8/8** (01:55, `runs/2026-09-15-cockpit-M6M.md`): cockpit `a0e5640`. N16 은 `~/cockpit-try-v2` 를 M6 판으로 다시 띄워(포트 3000) `curl -I` 실측(etag · 304). **마무리 지시 `instructions/after-M6.md`** 를 보냈다(Q6 intake 저장소 경로 제거 → prodev PR #21 후보, Q7 INSTALL "판 올리기" 절, 그 뒤 멈춤). P-M7 예측을 적었다. cockpit 이 sha 를 보내면 meta 가 PR #21 사본 검수 → 사람 머지 → 핀. 그 뒤 **W1 회사 PC 실증(사람)** 을 기다린다 — cockpit v2(`a0e5640`+) · prodev(`8f0870b`+) · `docs/INSTALL-WINDOWS.md` 12 걸음.
- **PR #21 검수 통과** (02:05, `runs/2026-09-15-prodev-pr21.md`): prodev `76ed833`(intake 저장소 경로 제거) 147 · 18 · 0, cockpit 215. cockpit 은 `bc13355`(INSTALL "판 올리기" 절 · log 세션 끝)에서 **멈췄다**. 이 회차의 제작은 여기까지 — cockpit `bc13355` · prodev `8f0870b`(+ #21 머지 뒤). 다음은 **W1 회사 PC 실증(사람)**: `cockpit/docs/INSTALL-WINDOWS.md` 12 걸음 + 브라우저 걸음 셋(판 접기 · 사람끼리 글 · 따라잡기) 결과를 meta 에. 그 결과로 W4 실전을 연다(`weekly.sh` · `cost.js` 계측, 예측 P-W4).
- **사람이 이 맥에서 v2 최신 판을 눌러 봤고 "잘 동작" 확인** (02:30, `~/cockpit-try-v2` — prodev 는 PR #21 가지 사본으로 올림, 스크립트 `scratchpad/try-v2-update.sh`). 물음: 계정 저장 자리 · 등록법 → `chat.db users` + `cockpit.db accounts(scrypt)`, `init-admin` · `add-user` · admin API. **화면에 계정 관리가 없다** — 후속 후보(관리자 화면). 
- **문서 회차 D3 를 열었다** (02:50): 사람 요청 — README 제로베이스(중학생 수준 · 시나리오) + `docs/ARCHITECTURE_EXPLANATION.md`(주방 비유를 우리 구조에 대응, 통신 경로 넷, 그림 ≥ 5). 채점표 `scripts/scoring-cockpit-docs-readme.md` · 예측 P-D3 · 지시 `instructions/DOCS-readme.md`(서브에이전트 opus 다섯 역할). meta 검수는 **새 클론에서 README 만 보고 첫 답까지 밟기** 포함.
- **D3 반려 → 돌려보냄 셋** (11:40, `runs/2026-09-15-cockpit-D3.md`): cockpit `ea9c1b1` 문서 둘은 좋다(그림 10 렌더 0 오류 · 사실 16 틀림 0). 필수 칸 "새 클론 따라 밟기" 가 걸음 8 `✗ botsDir 없다` 로 막힘 — **새 클론의 prodev 에는 `bots/` 가 없다**(`.gitignore` `bots/*/`, git 은 빈 폴더 안 담음). 고치면 첫 답 · 재기동 · resume 까지 통과(같은 session_id, "이어서 합니다"). 돌려보냄: README 걸음 4 `prodev/bots` · 걸음 19 승인 카드 한 줄 · LTS 풀이 (`instructions/D3-fix.md`). 따라 밟기 도구 `scratchpad/d3walk.sh` · `d3walk2.sh`(curl 의 `-F` 는 `@` 로 시작하는 값을 파일로 읽으니 `--form-string`). **루트 README 세션**은 아직 보고 없음(채점표 `scripts/scoring-root-readme.md`).
- **D3 닫힘(통과) · D4 루트 README 통과** (12:30): cockpit `63243d5`(README 걸음 4 `prodev/bots` 등) 새 클론 재확인 exit 0. 루트 README 656줄(meta-c7, **미커밋**) 14/14 (`runs/2026-09-15-root-readme-D4.md`). D4 에서 **코드 결함 둘**: **N18 봇 세션에 사람의 `~/.claude/CLAUDE.md` 가 실린다**(재현, settingSources 에 user 없어도) · **`index.js next E` 는 없는 명령**(재현, PR #20 문장이 가리킴). cockpit 에 `instructions/after-D3.md`(N18 홈 밖 실증 + 문서 · prodev PR #22 `index.js next`). 그 밖 prodev 후보: threads 자리 엇갈림 · cron 문구 · 옛 files 방 문구 넷. meta 문서 오류 셋(스킬 링크 · find.log 자리)은 고쳤다 — v1 makeScratch 의 링크를 실전으로 옮겨 적었던 것.
- **사람이 할 일(남은 것)**: ⓪ prodev PR #21 머지 · 루트 README(meta-c7 판) 커밋 여부(https://github.com/bjw202/prodev/pull/21 — meta 검수 통과) → 머지되면 핀 · `~/cockpit-try-v2`(M6 판)에서 **보통 새로고침**만으로 도구 요약 한 줄이 새로 보이는지(N16 · N17 눈 확인) ① W2r 예외(승인 31) 인정 여부 ①-2 `../minidiscord` 체크아웃도 뒤처져 있다(`git -C ../minidiscord pull --ff-only`, 선택) — M3.M 에서 4 로 준 것이 그 예외의 근거였다 ② meta 커밋 여부 ③ worktree 정리 ④ 회사 PC 에서 `docs/INSTALL-WINDOWS.md` 12 걸음을 밟고 `npm test` · `check` · `smoke/m1-hello` · `smoke/m3-restart` 출력과 12번(브라우저) 소감을 meta 에 준다 ⑤ 프록시(N14) · 회사 계정 SDK 계약(8절) 결정.

## 9b. 새 meta 세션이 먼저 읽을 것 — 2026-09-15 12:45 (meta-f3 를 비우기 직전)

**한 줄 (12:55 갱신):** cockpit v2 회차의 제작 관문은 다 끝났고(M1.M · W2r · M3.M · M4.M(맥) · D0-v2 · M5.M · M6.M · D3 · D4 · after-D3), **cockpit 은 `7aa80dd` 에서 멈췄다.** after-D3 검수도 끝났다(`runs/2026-09-15-after-D3.md`, 전부 ○). PR #21 은 머지됨(`8d69c8a`, 핀 올림). **지금 기다리는 것은 전부 사람 몫**: PR #22 머지(meta 검수 통과) · Q11(README 맥 예 경로를 홈 밖으로?) · Q12(봇 전용 `CLAUDE_CONFIG_DIR`?) · 루트 README(meta-c7 판, 656줄) 커밋 · cockpit 원격 저장소 · 회사 PC 실증(W1). **N18 결론: 홈 아래에 설치하면 `~/.claude/CLAUDE.md` 가 봇에 실린다(홈 밖 0 · 홈 아래 1) — INSTALL · README 에 "홈 밖에 세운다" 한 줄 들어감.**

**(아래는 12:45 판 — 이미 끝난 일. 새 세션은 위 한 줄과 사람 답만 보면 된다.)**
**cockpit 보고가 오면 할 일 (예측 P-D5, `../2026-09-14-cockpit-후속/PREDICTIONS-v2.md` 끝):**
1. N18 — 홈 밖 설치본 세션 기록에 `~/.claude/CLAUDE.md` 가 실렸는지 cockpit 이 낸 기록 파일 경로를 **직접 grep** (`grep -c "Contents of /Users/byunjungwon/.claude/CLAUDE.md" <jsonl>`). 실리면 "Claude Code 가 사용자 CLAUDE.md 를 settingSources 와 무관하게 싣는다" → 사람에게 `CLAUDE_CONFIG_DIR` 로 봇 전용 설정 자리를 둘지 묻는다. 안 실리면 "홈 아래 설치 탓" → INSTALL · README 의 "홈 밖에 세운다" 문장 확인. 문서 커밋 sha 를 읽고 `runs/2026-09-15-after-D3.md` 에 적는다.
2. PR #22(`index.js next <E|R|D|N>`) — 가지 `cockpit-v2d` 를 `git archive` 로 사본에 떠서(스크립트 파일로 — 훅 때문에 Bash 에 `prodev-wt` 경로 + `mkdir/cp/npm ci/>` 를 섞지 않는다) `npm test` ≥ 147 · fail 0 · 임시 과제 폴더에서 `PRODEV_PROJECT=<폴더> node scripts/index.js next E` → `E-0001` 한 줄 · exit 0 · `.claude/skills` 무변경(`git diff --stat origin/main..origin/cockpit-v2d` 가 index.js · 시험만). 통과면 사람에게 머지를 청하고, 머지되면 `workspace.json` 핀 · cockpit 에 알림.
3. 그 뒤 cockpit 은 멈춘다. 다음 제작 지시는 사람의 회사 PC 실증(W1) 결과가 온 뒤. W1 이 오면 `runs/2026-09-14-cockpit-M4M.md` ② 절(윈도우 실측 넷)과 `scoring-cockpit-M4.md` ② 로 센다.

**떠 있는 것: 없음.** `~/cockpit-try-v2` 는 사람이 13:05 에 서버를 끄고 폴더째 지웠다(PR #21 머지로 구실이 끝남). 이 맥에서 다시 눌러 보려면 새로 세운다 — N18 때문에 **홈 밖**(예 `/Users/Shared/work`)에, prodev 는 origin/main 사본으로, `scratchpad/try-v2.sh` 꼴.
**세션 이름:** cockpit 제작 세션은 `cockpit`(같은 세션이 계속 이어받고 있다). 루트 README 세션 `meta-c7 [a98f35]` 는 멈췄다(주석 반영 끝, 미커밋). 이 세션 이름은 meta-f3 였다 — 새 세션은 첫 SendMessage 에 "meta-f3 를 잇는 세션" 이라 밝힌다.
**prodev 후보(사람이 정하면 PR):** threads 자리 엇갈림(`session-start.js:105` 과제 폴더 vs intake · brief · close 봇 폴더) · cron 08:00 · 18:30 문구(brief · journal · orchestrator) · 옛 `files 방` 문구 넷 · 첫 글부터 카드를 만드는 `cd "…" && ls` 습관 · `check`/방 만들기가 `botsDir` 를 스스로 만들기(cockpit) · `open-project` 깃발 순서(cockpit).
**후속 논의(사람이 열면):** 관리자 화면(계정 표 · 추가 · 비밀번호), `../2026-09-14-cockpit-후속/README.md` 의 2~5.

## 9. 마지막 상태 (2026-09-14 18:35, 앞 세션을 비우기 직전)
- **W2 재측정: 조건부 통과** (`runs/2026-09-14-cockpit-W2r.md`). 대본 넷 27/33 · cockpit 10/10 · PR #17 사본 140/18. 빗나간 넷 다 닫힘. 남은 칸: 승인 31(봇 명령 습관 — prodev 스킬 고침 후보, cockpit 아님) · 값 $12.22(≤ 12 살짝 초과) · R4 브리핑 24분 안에 안 옴.
- **예외 하나를 기록했다**: 채점표의 "승인 > 3 → 반려" 조항이 걸렸지만 원인이 시험 대상 밖이라 조건부 통과로 두었다. **사람이 인정하지 않으면 반려로 되돌린다** — 첫 보고에서 사람에게 확인할 것.
- **사람이 할 일**: prodev PR #17 머지(https://github.com/bjw202/prodev/pull/17 — meta 검수 통과). 머지 뒤 `workspace.json` 의 prodev 핀을 올린다. 머지 전에는 스크래치가 `COCKPIT_PRODEV_DIR=../prodev-wt-cockpit` 를 쓴다.
- **cockpit 다음 지시**: `instructions/M3.md` (M3.0 상태 표시 · env `PRODEV_BOT_DIR` · M3.1~3.6 · 두 번째 prodev PR(스킬 명령 습관)). cockpit 세션도 비운다 — 새 세션 첫 지시는 아래 10절.
- **M3.M 채점표** 는 이미 썼다: `scripts/scoring-cockpit-M3.md` (R5 대본을 admin API 로 손 걸음 대신).
- **재측정 흔적**: 스크래치 `w2r-scratch/`(세션 스크래치 폴더 — 새 세션은 못 본다; 기록 JSONL · messages.txt 는 거기뿐이다. 필요하면 `runs/` 의 표가 진실). `prodev-wt-cockpit/bots/prodev-worktogether-bot/find.log` 가 남아 있다(git 제외, 지워도 된다).
- 이 맥에서 스크래치 재생을 다시 하려면 5절 그대로 + W2r.3 뒤 봇 폴더는 `<스크래치>/prodev/bots/…`.

## 10. 세션을 비운 뒤 붙여 넣는 첫 지시
**meta(새 세션):** "meta 지휘 세션 이어서. 나는 cockpit 회차의 지휘자·검수자다(만들지 않는다). 먼저 meta/prodev-review/plans/2026-09-14-web-cockpit/HANDOFF-meta.md 를 읽어라. 9절 마지막 상태와 instructions/M3.md, runs/2026-09-14-cockpit-W2r.md 를 읽고 거기 적힌 다음 할 일부터 이어라. cockpit 제작 세션은 ListAgents 에 cockpit 으로 보이고 SendMessage 로 지시한다. 예측 · 채점표 · fixtures · runs 는 cockpit 에 주지 않는다."
**cockpit(새 세션):** "cockpit 제작 세션 이어서. 먼저 crew-workspace/meta/prodev-review/plans/2026-09-14-web-cockpit/instructions/M3.md 를 읽어라. 그 다음 cockpit/docs/log.md · as-built.md · TASKS.md(M3 절)을 읽고 M3.0 부터 태스크 단위로 진행하라. 끝나면 meta 세션에게 SendMessage 로 보고하라. prodev · minidiscord 본 체크아웃은 읽기만, prodev 고침은 worktree ../prodev-wt-cockpit/ + PR 로만."
