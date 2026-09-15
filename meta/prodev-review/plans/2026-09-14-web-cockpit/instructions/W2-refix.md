# meta → cockpit 지시 · W2 반려 뒤 고침 넷과 재측정 (2026-09-14 17:40)

W2(M2.M) 판정은 **반려**다. cockpit 자체 열 칸은 전부 ○ 였고(시험 118 · 계약 · 서버 · 과제 열기 · 스모크 둘), 빗나간 것은 **옛 대본 재생 21/33**(옛 관문 26/33)이다. 원인 갈래 다섯 중 셋이 고칠 것이고 하나는 재측정 환경, 하나는 봇 편차다. 근거는 meta 가 쥔다 — 여기에는 결정과 할 일만 적는다.

## 1. 고칠 것 (cockpit 저장소, 태스크 단위 커밋 W2r.1~W2r.3)

### W2r.1 큐 규칙을 되돌린다 — 턴 도중에도 배달한다
- 사실: R4 에서 리서치 도우미가 도는 동안(세션 `working`) PL 의 본방 질문 둘이 `bot_inbox` 에 6분 걸려 있었다. 옛 채널 플러그인은 턴 도중에도 밀어 넣었고, prodev 의 orchestrator 스킬은 "한 턴에 여러 방의 `@TO` 가 오면 방마다 따로 짧게 답한다" 를 전제한다. D0 의 결정(Q12 · 검토 #8)이 이 하네스와 어긋났다 — meta 의 판단 착오다.
- 바꿀 것: `bot_inbox` 는 **들어오는 즉시 배달**한다(`working` · `waiting_approval` 에서도). SDK 가 그 턴에 접어 넣는다. 묶음 상한 20 은 유지. 예외는 하나 — admin 의 `/compact` 는 `idle` 을 기다린다(그대로).
- 문서: PRD F8 · ADR-008(바뀐 자리 절 하나 더: "왜 되돌렸나") · ARCHITECTURE 4.5. 시험: `working 중에 들어온 글은 result 뒤에 간다` 를 `working 중에 들어온 글도 곧바로 queryFn 입력으로 간다` 로 바꾸고, `waiting_approval 중에도 배달` 한 건 더한다.

### W2r.2 값 누적을 고친다
- 사실: SDK 의 `result.total_cost_usd` 는 **누적값**이다(0.171 → 0.274 → 0.355 …). cockpit 은 결과마다 더해 $51.57 로 표시했다. 실제 마지막 값은 $2.72 였다.
- 바꿀 것: `agent_sessions.cost_usd` = 마지막 `result` 의 `total_cost_usd`(덮어쓰기). `session_events` 의 `result` 행에는 그 값을 그대로 둔다. 시험 한 건: `result 셋(0.1 · 0.25 · 0.4) 뒤 cost_usd 는 0.4`.
- 화면의 값 옆 "추정치" 글자는 그대로.

### W2r.3 스크래치 배치를 prodev 와 같게
- 사실: R3 에서 봇이 `find.js` 를 한 번도 안 돌렸다(`find.log` 없음). orchestrator 는 "봇 폴더에서 돌 때는 `../../scripts/`" 라 하는데, 스크래치 봇 폴더는 prodev 밖이라 그 경로가 없다. 그림(`plot.py`)도 같은 이유로 안 나왔을 것이다.
- 바꿀 것: `smoke/lib.mjs` 의 `makeScratch` 가 스크래치 안에 **prodev 뿌리 흉내**를 만든다: `<스크래치>/prodev/` 아래 `scripts` · `common` → 실제 prodev 의 것으로 심볼릭 링크, `CLAUDE.md` 사본, `.claude/{skills,agents}` 링크, 그리고 `bots/<봇>/` 을 **그 아래**에. `cockpit.json` 의 `botsDir` 도 그 `bots/`. 실전(`botsDir` = 실제 `prodev/bots`)과 같은 상대 배치가 된다.
- 시험: `makeScratch 뒤 <봇 폴더>/../../scripts/find.js 가 실제 파일`.

## 2. prodev PR 하나 (W2.9 — 이제 관문 사이라 열 수 있다)
worktree 로만: `git -C ../prodev worktree add -b cockpit-w2 ../prodev-wt-cockpit origin/main`. 본 체크아웃은 손대지 않는다. PR 본문에 ADR 절(설계 변경이다). 시험 133 + 25 를 사본에서 돌려 0 실패로.

1. **허용 · 거부 목록을 `settings.local.json` 에 쓴다.** 사실: headless/SDK 세션은 프로젝트 `.claude/settings.json` 의 `permissions.allow` 를 읽지 않는다(`Write(**)` 도 거부). `settings.local.json` 의 규칙은 먹는다. 훅 · env · statusLine · autoCompact 는 `settings.json` 그대로. `setup.js` 가 두 파일을 쓴다. `settings.template.json` 을 둘로 가르거나 `permissions` 절만 떼어 쓴다. ADR 에 "왜 둘인가" 를 적는다. 시험(`setup.test.js`)에서 허용 22 · deny 가 **local** 파일에 있는지 본다.
2. 도구 이름 `mcp__minidiscord-channel__*` → `mcp__cockpit__*` (템플릿 · 훅 matcher · 허용 목록 · `hooks.test.js:292` · 스킬 본문의 언급).
3. `.mcp.json` 을 안 만든다. 봇 토큰 · 알림 계정 토큰 · `MINIDISCORD_URL` 을 없앤다(`MINIDISCORD_URL` 은 빈 값 — 훅이 조용히 건너뛴다).
4. `MINIDISCORD_DB` 값 = cockpit `chat.db`, `{{UPLOADS_DIR}}` = cockpit 업로드 폴더, deny 에 `cockpit.db`(Read · Edit · Write).
5. `setup.js rooms` · `archive` 는 cockpit API 를 부르거나 지운다(방은 cockpit 이 만든다). `cron` 은 지운다(자동 브리핑은 두지 않기로 했다).
6. `docs/launch.md` 4절을 "조종석에서 과제 열기" 로. `docs/as-built.md` 8절에 한 줄.
7. `CLAUDE.md` 17행의 "minidiscord" 한 낱말만. 비서 지침 열한 줄은 손대지 않는다.

PR 을 올리면 저(meta-f3)에게 번호를 보낸다. 머지는 제가 검수한 뒤 사람이 한다.

## 3. 고치지 않는 것 (봇 편차 — 재측정에서 다시 본다)
- 카드 번호를 확정 뒤에 매겨 `[카드]` 공지가 훅에 막힌 것(훅은 설계대로 막았다) · 위키를 안 만든 것 · R3 q02 첫 답 오답 뒤 자가 정정 · 없는 것 넷 중 하나에 본 자리 없음.

## 4. 그 밖에 판정에서 본 것
- m2-approval 의 "이번 세션 허용 뒤 재요청 0" 은 N7 이전 코드가 `settings.local.json` 에 규칙을 써서였을 수 있다(당신의 지적 그대로). b7b6263 뒤 같은 스모크를 한 번 더 돌려 `settings.local.json` 이 **안 생기고도** 재요청 0 인지 본다. `smoke/README` 에 "돌린 뒤 봇 폴더에 settings.local.json 이 없어야 한다" 를 적는다.
- 반응 시간 중앙값 5초 · 봇 글 34개 900자 초과 0 · pre-reply 훅이 cockpit 의 `reply` 를 여섯 번 막았고 봇은 우회하지 않았다 — 창구 교체가 봇에게 보이지 않는다는 첫 실측이다.

## 5. 끝나면
W2r.1~3 커밋 · prodev PR 번호 · `npm test` 요약 줄 · 스모크(m2-approval 재판 포함) · 새 질문을 보고한다. 그러면 제가 **W2 재측정**(같은 대본 넷 · 같은 채점표 · 예측 P-W2r)을 돌린다. 통과하면 M3.