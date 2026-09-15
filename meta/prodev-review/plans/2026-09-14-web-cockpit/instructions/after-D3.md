# meta → cockpit 지시 · D3 닫힘 뒤 — 새 발견 둘 (2026-09-15 12:30)

## 1. D3 닫힘
`63243d5` 고침을 meta 가 새 클론에서 재확인했다(걸음 4 → 걸음 8 exit 0). **D3 통과.** 루트 README(별도 meta 세션)도 통과했다 — 거기서 코드 결함 둘이 나왔다. 둘 다 이번에 cockpit 이 맡는다(작게).

## 2. N18 — 봇 세션에 사람의 개인 지침 `~/.claude/CLAUDE.md` 가 실린다 (실증 · 문서)
사실: `~/cockpit-try-v2` 봇 세션 기록(`~/.claude/projects/-Users-byunjungwon-cockpit-try-v2-…/43b089b6….jsonl`)에 `Contents of /Users/byunjungwon/.claude/CLAUDE.md` 가 실렸다. `settingSources` 에 `user` 가 없는데도. 회사 PC 에서 PL 의 개인 지침이 봇에 섞인다는 뜻이다.
할 일: ① **원인을 가른다** — 홈 밖(예 `/private/tmp/…` 또는 `/opt/…`)에 스크래치 설치본을 하나 세워(`smoke/scratch.mjs` 꼴, haiku, 글 하나) 세션 기록에 `~/.claude/CLAUDE.md` 가 실리는지 본다. 실리면 "Claude Code 가 사용자 CLAUDE.md 를 settingSources 와 무관하게 싣는다", 안 실리면 "홈 아래 설치라 위로 올라가는 탐색이 홈에 닿는다". ② 결과에 따라 **문서만** 고친다: INSTALL 4번 · README 2.2 에 "홈 폴더 밖에 세운다(윈도우 `C:\work` 는 이미 밖)" 또는 `CLAUDE_CONFIG_DIR` 안내, ARCHITECTURE_EXPLANATION 14절 · 10절의 "개인 설정은 끈다" 문장을 사실대로. 코드는 고치지 않는다 — 봇 전용 설정 자리(`CLAUDE_CONFIG_DIR`)를 cockpit 이 넘길지는 사람이 정한다.

## 3. prodev PR #22 후보 — `node scripts/index.js next E` 는 없는 명령
사실(meta 재현): `index.js` 는 첫 인자를 과제 폴더로 읽어 `next` 를 폴더 이름으로 보고 "과제 폴더가 없다: …/next" 를 낸다(exit 0). PR #20 이 intake 에 넣은 문장(`:66` · `:92`)과 analysis · research · schedule 의 네 곳이 이 명령을 가리킨다.
할 일: worktree `../prodev-wt-cockpit-v2` 에 `origin/main`(#21 머지 뒤면 그것) 기준 새 가지 `cockpit-v2d`. `index.js` 에 하위 명령 `next <E|R|D|N>` 을 더해 다음 번호 한 줄(`E-0002`)만 내게 한다(기존 `nextNumbers` 를 쓴다, 과제 폴더는 `PRODEV_PROJECT` · cwd 순). 시험 한 건(`index.test.js`: 카드 셋 있는 임시 폴더에서 `next E` → `E-0004`, 없으면 `E-0001`). 스킬 여섯 곳은 그대로 둔다(명령이 생기면 맞는다). PR 본문에 "meta D4 에서 발견, 실행하면 폴더 없음 오류" 한 줄. 머지는 meta 검수 뒤 사람.
같은 PR 에 넣지 말 것(따로 후보): threads 자리 엇갈림(`session-start.js:105` 과제 폴더 vs intake · brief · close 봇 폴더) · cron 08:00 · 18:30 문구(brief · journal · orchestrator) · 옛 `files 방` 문구 넷. 사람이 정한다.

## 4. 끝나면
N18 실증 결과 한 줄(실림/안 실림 + 기록 파일 경로) · 문서 커밋 sha · PR #22 번호를 **meta-f3** 에게. 그 뒤 멈춘다.
