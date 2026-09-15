# 웹 조종석 설계 적대 검토 — 1회차 (2026-09-14, meta)

검토 대상: 같은 폴더 위의 `DESIGN.md` · `TASKS.md` · `PREDICTIONS.md`.
대조한 근거: `spike/RESULTS.md` 와 그 폴더의 스크립트들, `research/coupling-inventory.md`, `research/prior-art.md`, 깔린 SDK 의 `sdk.d.ts`(0.3.270), 그리고 `prodev/` · `minidiscord/` 의 실제 파일들.
읽기만 했다. 설계 문서도 하네스도 고치지 않았다.

이 문서는 검토가 오간 순서 그대로다. **1차**는 문서 전체(지적 1~19). **2차**는 「실증 4」가 더해진 뒤의 재검토(지적 20~29). **3차**는 설계자가 1·2차를 반영한 뒤의 상태 대조(닫힌 것 열둘, 새 지적 둘)다.

---

# 1차 — 문서 전체

## 1차 판정

**조건부 승인** — 방식 선택(B, Agent SDK 조종석)은 근거가 탄탄하다. 다만 아래 셋을 고치기 전에는 W1 을 열지 않는 조건이다.

1. 실증 셋이 쓴 권한·저장 설정이 설계가 고른 설정과 다르다는 것을 문서에 명시하고 4.2 의 「근거」 칸을 낮출 것.
2. P-W1.5·P-W1.6(승인 중계)을 W1 의 필수 항목으로 올릴 것.
3. 봇 세션에 서버 프로세스 환경변수를 통째로 넘기는 자리(4.2)를 화이트리스트로 바꿀 것.

## 1차 지적 표

| # | 심각도 | 자리 | 문제 | 근거 | 고치는 방향 |
|---|---|---|---|---|---|
| 1 | 막힘 | DESIGN 4.2 (`DESIGN.md:158`) | 실증 셋은 전부 `permissionMode:'bypassPermissions'` + `persistSession:false` 로 돌았다. 설계가 고른 조합(`default` + `canUseTool` + `persistSession:true`)은 한 번도 안 돌았는데 근거 칸에 「실증 1~3」이라 적혀 있다 | `spike1-load-harness.mjs:15` · `spike2-pretooluse-hook.mjs:15` · `spike3-streaming-compact.mjs:13` · `spike/RESULTS.md:3` | 4.2 근거 칸을 「미실증 — W1.3 에서 밟는다」로 낮춘다. 2.1 에도 한 줄 단서를 단다 |
| 2 | 막힘 | PREDICTIONS P-W1 머리 (`PREDICTIONS.md:5`) | 통과 기준이 「8 중 7, P-W1.1 만 필수」다. 승인 중계 실증(P-W1.5·1.6)이 빗나가도 관문이 열린다. 그런데 승인 중계는 A안·D안 대비 B안의 유일한 차별점이다 | `PREDICTIONS.md:13-14` · `DESIGN.md:96-99` | P-W1.5 · P-W1.6 을 필수로 올리고 통과를 「8 중 7, 단 1·5·6 필수」로 바꾼다 |
| 3 | 막힘 | DESIGN 4.2 env · 6절 (`DESIGN.md:158`, `:218-226`) | `env {...process.env, …}` 는 조종석 서버의 비밀(DB 경로 · 쿠키 비밀 · 알림 토큰)을 봇 세션에 그대로 싣는다. 봇 허용 목록에 `Bash(node:*)` 가 있어 봇이 읽어 방에 쓸 수 있다. 6절에 이 항목이 없다 | `spike/RESULTS.md:20` · `prodev/common/settings.template.json:16` | 필요한 키만 추리는 화이트리스트(PATH · HOME · 인증 관련)로 바꾸고, W1 에서 「무엇을 빼면 로그인이 죽는가」를 잰다 |
| 4 | 중요 | DESIGN 4.3 표 (`DESIGN.md:183`) | `canUseTool` 은 서브에이전트 안에서도 불린다(콜백 인자에 `agentID` 가 있다). 도우미 여섯이 동시에 돌면 요청이 겹치는데 `permission_requests` 에 `tool_use_id` · `agent_id` 칸이 없어 두 요청을 구분 못 한다 | `sdk.d.ts:255-260` | 두 칸을 더하고 요청 키를 `toolUseID` 로 잡는다. 「첫 답이 이긴다」도 요청 단위로 다시 쓴다 |
| 5 | 중요 | DESIGN 4.1 승인 중계 · 4.4 (`DESIGN.md:151`, `:195`) | SDK 가 카드에 주는 `suppressAlwaysAllowRule`(이 요청에는 「항상 허용」을 내지 말라)과 `defaultToNo`(거부에 커서를 두라)를 설계가 안 읽는다. 「이번 세션 허용」을 언제나 그리면 SDK 가 금지한 규칙을 쓰게 된다 | `sdk.d.ts:244-252` | 승인 카드가 두 칸을 읽어 버튼을 숨기거나 기본값을 옮긴다 |
| 6 | 중요 | DESIGN 4.2 「사람 글」 (`DESIGN.md:160`) | `message_targets` 를 누가 채우는지 어디에도 없다. `chat.js --json` 의 `targets` 칸이 이 표의 조인 결과이고, 이것은 결합 재고의 하드 항목이다 | `prodev/scripts/chat.js:76-77` · `chat.js:103` · `coupling-inventory.md:428` | 글을 넣을 때 봉투(`@TO` · `@CC`)를 파싱해 행을 넣는 일을 W2.2 · W2.3 에 항목으로 적는다 |
| 7 | 중요 | DESIGN 4.1 · 4.3 (`DESIGN.md:149`, `:169-184`) | 표 수가 안 맞는다. 4.1 과 TASKS 는 「표 일곱」, 4.3 은 아홉을 적었다. 게다가 **입력 큐 표가 없다.** 재기동 뒤 놓친 글 재배달(V3 · P-W2.7)이 그 표에 매달려 있는데 설계에 자리가 없다. minidiscord 의 배달 표식(`room_bots.last_delivered_id`)도 안 옮겨졌다 | `TASKS.md:24` · `minidiscord/server/src/db.ts:36-40` · `prodev/design/v3/ARCHITECTURE.md:324` | 큐 표(또는 방·봇별 마지막 배달 번호)를 표에 넣고 개수를 맞춘다 |
| 8 | 중요 | DESIGN 4.2 (`DESIGN.md:160`) | 턴이 도는 중에 들어온 사용자 메시지를 SDK 는 그 턴에 접어 넣는다. 승인 대기 중에는 도구가 기한 없이 멈춰 있다. 「언제 큐를 푸는가」 규칙이 4.2 에 없다 | `sdk.d.ts:3352` · `sdk.d.ts:205-208` | 「`idle` 에서만 큐를 푼다, 단 admin 의 멈춤·압축은 즉시」를 4.2 에 한 줄로 못 박는다 |
| 9 | 중요 | TASKS W2 · W3 (`TASKS.md:41` 대 `PREDICTIONS.md:29`) | P-W2.8(첫 반응까지 중앙값 15초)을 `session_events` 의 시각 차로 재겠다는데, 그 표에 사건을 적는 일은 W3.1 이다. W2 관문에서 잴 수 없다 | 같은 두 줄 | 사건 적재만 W2.3 으로 앞당기고, 되그리기(화면)는 W3 에 둔다 |
| 10 | 중요 | TASKS W2.9 (`TASKS.md:31`) | 업로드 폴더가 바뀌면 봇 설정의 `additionalDirectories` 에 박히는 값도 바뀌어야 모델이 첨부를 읽는다. 태스크에 env 이름만 있고 이 자리가 없다 | `prodev/common/settings.template.json:34` · `coupling-inventory.md:397` | W2.9 에 「setup.js 가 박는 `{{UPLOADS_DIR}}` 갱신」을 항목으로 넣는다 |
| 11 | 중요 | TASKS W2.10 · W4 (`TASKS.md:32`) | 주간 계측 도구는 zsh 스크립트인데 회사 PC 에는 zsh 가 없다. 조종석 DB 도 그 PC 에 있다. meta 가 직접 세는 길이 끊긴다 | `meta/prodev-review/HANDOFF.md:21` | DB 사본을 맥으로 옮기는 걸음을 W2.10 에 적거나 계측 도구를 node 로 옮긴다 |
| 12 | 중요 | DESIGN 9절 (`DESIGN.md:243-251`) | 과제 여럿은 `query()` 여럿이고 곧 CLI 자식 프로세스 여럿이다. 한 대의 회사 PC 가 서버 · 세션 여럿 · 브라우저를 다 지는 자원 위험이 위험표에도 예측에도 없다 | `DESIGN.md:112` · `:241` | V6 으로 추가하고 P-W4 에 「동시 세션 수 상한 · 상주 메모리」 한 줄을 넣는다 |
| 13 | 사소 | DESIGN 4.3 (`DESIGN.md:178`) | `bots.token` 은 `UNIQUE NOT NULL` 이다. 「토큰 열은 비워 둔다」면 봇이 둘째부터 UNIQUE 에 걸린다 | `minidiscord/server/src/db.ts:27-31` | 봇마다 다른 더미 값을 넣거나, 이 열만 스키마를 바꾼다고 명시한다 |
| 14 | 사소 | DESIGN 4.3 (`DESIGN.md:179`) | `stored_path` 를 「절대 경로」로 못 박았는데 지금 값은 상대 경로다. `chat.js show` 가 DB 폴더의 부모를 기준으로 resolve 하기 때문에 절대로 바꿔도 돌기는 하나, 「minidiscord 와 같다」는 말은 거짓이 된다 | `prodev/scripts/chat.js:193` · `minidiscord/server/src/gateway.ts:177` | 어느 쪽인지 한 줄로 정하고 그 기준을 W2.2 시험에 넣는다 |
| 15 | 사소 | DESIGN 4.3 (`DESIGN.md:181`) | 새 표 이름 `sessions` 가 minidiscord 의 로그인 세션 표와 겹친다. 조종석도 쿠키 세션을 어딘가 저장해야 한다 | `minidiscord/server/src/db.ts:15-19` | 세션 관리자 표를 `agent_sessions` 류로 바꾼다 |
| 16 | 사소 | DESIGN 5절 (`DESIGN.md:214`) 대 P-W2.5 | 「`CLAUDE.md` 무변경」이라 했지만 17줄에 "minidiscord 방 둘" 이 있다. 고치면 예측 위반, 두면 문서가 낡는다 | `prodev/CLAUDE.md:17` | 예측을 「비서 지침 열한 줄 무변경 · 하네스 절 한 낱말 치환 허용」으로 먼저 정확히 적는다 |
| 17 | 사소 | PREDICTIONS P-W1.8 (`PREDICTIONS.md:17`) | 「실패하거나 SDK 동봉 바이너리로 뜬다(둘 중 하나를 기록)」는 어떤 결과든 통과한다. 예측이 아니라 관찰 계획이다 | 같은 줄 | 한쪽을 골라 적는다. 예: 「안 주면 SDK 동봉 win32 바이너리로 뜬다」 |
| 18 | 사소 | PREDICTIONS P-W3.2 · P-W2.2 (`PREDICTIONS.md:36`, `:23`) | 프레임 끊김을 「사람 시험 메모」로 재는 것은 「세는 것은 기계」 규칙에 어긋난다. 단위 시험 「60건 이상」은 만드는 쪽이 수를 늘리면 채워진다 | `meta/CLAUDE.md` 공통 다섯 | 앞은 초당 사건 수 · 부분 메시지 저장 0 으로 바꾸고, 뒤는 덮을 대상(승인 · 재기동 · 봉투 · 절단)을 칸으로 적는다 |
| 19 | 사소 | DESIGN 2.2 권한 모드 행 | 「`bypassPermissions` 는 `canUseTool` 을 건너뛴다」는 SDK 타입에 적혀 있지 않다. 근거는 선행 사례의 주석 하나다. 타입이 명시하는 것은 `permissionPrompts:'none'` 일 때 콜백이 안 불린다는 것뿐이다 | `sdk.d.ts:1864-1870` · `sdk.d.ts:2637-2639` · `prior-art.md:112` | 출처를 낮춰 적고, `permissionPrompts` 는 기본값 `'host'` 로 둔다고 명시한다 |

## 1차 · 확인한 주장 — 다시 안 봐도 되는 것

- 훅 사건은 실제로 33종이다(`sdk.d.ts:883`).
- `interrupt` · `setModel` · `supportedCommands` · `supportedAgents` · `mcpServerStatus` · `accountInfo` · `stopTask` · `backgroundTasks` · `streamInput` · `close` · `initializationResult` 가 모두 있다.
- `canUseTool` 은 비동기이고 `suggestions` 를 주며 결과에 `updatedPermissions` 를 돌려줄 수 있다(`sdk.d.ts:209-220`, `:2341`).
- `rewindFiles` 는 파일만 되감고 `enableFileCheckpointing` 을 요구한다(`sdk.d.ts:2863-2873`). `resume` · `forkSession` · `listSessions` · `getSessionMessages` 도 있다.
- SDK 가 플랫폼별 CLI 를 동봉한다는 말은 사실이다. `@anthropic-ai/claude-agent-sdk-win32-x64` 가 optionalDependencies 에 있다(0.3.270).
- `oauth_org_not_allowed` 는 실제 오류 값이고(`sdk.d.ts:3411`) `apiKeySource` 도 있다.
- 허용 목록은 정확히 22건이다(`prodev/common/settings.template.json:3-26`).
- 3단계 관문의 승인 실측 0 은 사실이다(`runs/2026-09-10-T3M.md:27`).
- 윈도우에서 `Edit(<경로>/**)` 꼴 허용 규칙은 이미 밟아 봤고 과제 폴더 쓰기가 승인 창 없이 됐다(`runs/2026-09-13-windows-port.md:29`, `:33`).
- `(chat_id N) 글 #M` 패턴은 **시험 전용 모의 요약기** 안에만 있다(`prodev/common/hooks/pre-compact.js:74`). 실제 인수인계서는 claude 가 기록을 읽어 쓰고, 방 찾기 정규식은 느슨하다(`places.js:87-95`). 조종석의 meta 줄이 `chat_id` 와 `message_id` 를 글자로 남기면 이 자리는 안 깨진다.
- cron 은 이미 사람이 없애기로 했다(`HANDOFF.md:28`). 설계가 cron 을 안 다룬 것은 누락이 아니다.
- 작성자 이름 해석(`COALESCE(users.username, bots.name, '시스템')`), `chat.js --json` 아홉 칸, 방 이름 규칙, PL 글자 일치는 4.3 이 그대로 지킨다.
- meta 규칙 셋(예측 먼저 · 관문 중 규칙 불변 · 허용 목록 확장은 관문 밖)은 문서에 지켜져 있다. 다만 W1 은 회사 PC 에서 사람이 돌리므로, 「meta 가 직접 센다」를 지키려면 출력 원문을 손대지 않고 `runs/` 에 붙이는 것을 증빙 형식으로 못 박아야 한다.

## 1차 · 설계가 가볍게 본 위험 셋

1. **`default` 모드에서 프로젝트 계층 허용 목록이 SDK 세션에도 먹히는지**가 아직 0회 실증이다. 안 먹히면 `Bash(node:*)` 마다 승인 카드가 떠서 조종석이 못 쓰게 된다.
2. **분량.** W2 는 2주에 아홉 덩이다. 한 제작 세션이 윈도우에서 이만큼을 2주에 끝낸다고 보기 어렵다. W2 를 둘로 쪼개고 관문을 하나 더 두는 편이 현실적이다.
3. **HTTPS 와 첫 로그인**을 사람 결정으로만 남겨 두었다. 평문 http 로 비밀번호가 사내망을 지나가는 구성은 태스크 어디에도 없다.

---

# 2차 — 「실증 4」가 더해진 뒤

## 2차 판정 갱신

**조건부 승인 유지.** 조건이 하나 바뀌고 하나 늘었다. 실증 4 는 「`default` 모드가 쓸 만한가」라는 가장 큰 미지수를 실제로 줄였다. 특히 프로세스 안 MCP 도구가 설정 허용 규칙으로 안 풀린다는 발견은, W2 에서 터졌으면 승인 카드가 봇의 말마다 떴을 함정이라 지금 찾은 값이 크다. 다만 「허용 목록 22건이 그대로 산다」는 결론은 아직 실험이 증명한 것보다 넓다.

조건 셋은 이렇다. ① 실증 4e 에 **대조군 한 판**을 더해 결론 1 을 다시 세울 것(21번). ② P-W1.5 의 재는 법을 고치고 P-W1 의 분모와 필수 항목을 맞출 것(20 · 22번). ③ 봇 세션에 서버 환경변수를 통째로 넘기는 자리를 화이트리스트로 바꿀 것(1차 3번, 4.2 와 6절 모두 그대로다).

## 2차 지적 표

| # | 심각도 | 자리 | 문제 | 근거 | 고치는 방향 |
|---|---|---|---|---|---|
| 20 | 막힘 | `PREDICTIONS.md:13` | P-W1.5 는 「허용 목록 밖 도구(`curl`)가 콜백으로 온다」인데 재는 법이 `spike4e` 출력이다. 그 스크립트의 프롬프트에는 curl 이 없다. `git status` · `python3 --version` · `ls` 셋뿐이라 이 예측은 그 출력으로 잴 수 없다 | `spike4e-allowlisted-cmds.mjs:11` | 재는 법을 `spike4` 출력으로 바꾼다 |
| 21 | 막힘 | `spike/RESULTS.md:41` 결론 1 · DESIGN 6절 | 「봇 설정의 허용 목록 22건은 그대로 산다」를 4e 한 판으로 일반화했다. 4e 가 보인 것은 접두 규칙 셋(`git:*` · `python3:*` · `ls:*`)이 통과했다는 것뿐이고, 그 셋은 허용 규칙이 없어도 CLI 가 읽기 전용으로 보아 통과시켰을 수 있다. 같은 표의 CLI 대조에서 `git --version` 한 건이 거부된 것은 접두 규칙이 먹는다는 결론과 정면으로 어긋난다 | `spike/RESULTS.md:37-38` | 허용 목록에서 `Bash(git:*)` 를 뺀 설정 사본으로 `git status` 를 한 판 더 돌린다. 콜백이 오면 결론 1 이 선다. 안 오면 결론 1 은 거짓이고 P-W2.6 을 다시 세워야 한다 |
| 22 | 막힘 | `PREDICTIONS.md:5` | 통과 기준이 아직 「8 중 7, P-W1.1 만 필수」인데 항목은 P-W1.6b 가 늘어 아홉이 되었다. 분모가 안 맞고, 승인 중계 항목 셋(1.5 · 1.6 · 1.6b)이 여전히 다 빗나가도 관문이 열린다 | `PREDICTIONS.md:13-15` | 「아홉 중 여덟, 단 1.1 · 1.5 · 1.6 · 1.6b 는 필수」로 고친다 |
| 23 | 중요 | DESIGN 6절 · `PREDICTIONS.md:14` | 실증 4 가 잰 권한은 Bash 접두 규칙과 `Read` 뿐이다. 봇이 가장 자주 하는 일인 과제 폴더에 파일 쓰기(`Edit(<과제>/**)` · `Write(...)`)가 SDK 세션에서 규칙으로 풀리는지는 한 번도 안 쟀다. 윈도우 CLI 에서 된 것은 확인했지만 그것은 SDK 가 아니다 | `prodev/common/settings.template.json:12-15` · `runs/2026-09-13-windows-port.md:33` | W1.3 프롬프트에 「과제 폴더 안 파일 하나 쓰기 · 밖에 하나 쓰기」를 넣고 P-W1 에 칸 하나를 더한다 |
| 24 | 중요 | `spike/RESULTS.md:42` · DESIGN 4.2 옵션 줄 | `allowedTools` 로 `reply` 를 푸는 것은 권한 경로의 일이고 `pre-reply` 훅은 별개 경로인데, 그 조합(`default` + `allowedTools` + 명령 훅)이 함께 돈 기록이 없다. spike4 · 4b 스크립트는 훅 출력을 아예 안 본다. 훅이 조용히 안 걸리는 것이 결합 재고가 「가장 위험한 실패 모드」라 부른 자리다 | `spike4b-allowedTools.mjs:23-27` · `coupling-inventory.md:481` | 4b 를 한 번 더 돌려 표식 파일이 생기는지 확인하고 그 줄을 표에 넣는다. P-W1.3 의 재는 법도 4b 출력으로 바꾼다 |
| 25 | 중요 | DESIGN 6절 · 실증 4 전체 | 도우미 여섯이 도는 길의 권한은 여전히 미지수다. 네 판 모두 서브에이전트를 안 태웠는데, 승인 콜백은 서브에이전트 안에서도 불린다 | `sdk.d.ts:255-260` | W1.3 에 「도우미 하나를 태우는 프롬프트로 콜백에 `agentID` 가 실려 오는가」를 한 줄 더한다 |
| 26 | 중요 | DESIGN 6절 첫 줄 | 「`bypassPermissions` 는 `canUseTool` 을 건너뛰어 승인 화면이 죽는다」를 여전히 사실로 적었다. 4d 가 잰 것은 bypass 가 아니라 `permissionPrompts: 'none'` 이다. bypass 는 아무도 안 쟀고 SDK 타입도 그 말을 안 한다 | `spike4d-no-callback.mjs:16` · `sdk.d.ts:1864-1870` | 「`default` 를 쓴다. bypass · auto 는 승인이 죽을 수 있어(선행 사례 주석, 미실증) 쓰지 않는다」로 낮춘다 |
| 27 | 사소 | `TASKS.md:13` · `:17` | W1.3 본문이 낡았다. 「실증 4(새로 쓴다) · 5초 기다렸다 allow」인데 스크립트는 이미 있고 3초다. 산출물에 4b · 4d · 4e 가 빠졌다. 통과 문장의 「실증 4 가 4/4」는 실증 4 가 네 판으로 갈라진 지금 분모가 모호하다 | `spike4-permission-relay.mjs:18` | 네 판을 다 적고 통과 문장을 예측표 항목 번호로 가리킨다 |
| 28 | 사소 | `spike/RESULTS.md:34` 4b 행 | 4b 에서 `node -e "console.log(2)"` 가 콜백 없이 돌았다. 즉 `allowedTools` 는 CLI 의 따옴표 · `-e` 안전 규칙까지 건너뛴다. 표에는 이 뜻이 안 적혔고, 이 목록이 나중에 넓어지면 승인 게이트가 조용히 사라진다 | `spike4b-allowedTools.mjs:14` · `spike/RESULTS.md:43` | 표에 한 줄 덧붙이고, 설계에 「`allowedTools` 에는 MCP 도구 둘만 넣는다」를 못 박는다 |
| 29 | 사소 | DESIGN 4.2 옵션 줄 | `allowedTools` 에 `mcp__cockpit__fetch_history` 를 넣는데, 네 판의 프로세스 안 MCP 서버에는 `reply` 하나뿐이라 이 도구는 한 번도 안 만들어 봤다 | `spike4-permission-relay.mjs:5-7` | W1 스크립트의 MCP 서버에 `fetch_history` 를 같이 얹어 돌린다 |

## 2차 · 확인한 주장

- 실증 4 의 네 스크립트는 실제로 `permissionMode: 'default'` 로 돌았다. 1차 1번의 권한 쪽 절반은 해소됐다. 다만 `persistSession` 은 네 판 모두 `false` 라 나머지 절반은 남아 있다.
- `permissionPrompts: 'none'` 이면 콜백 없이 조용히 거부되고 `result.permission_denials` 에 남는다는 것은 SDK 타입 설명과 일치한다. 조종석은 이 값을 건드리면 안 된다.
- 프로세스 안 MCP 도구가 설정 파일 허용 규칙으로 안 풀린다는 발견은, 두 스크립트의 차이가 `allowedTools` 한 줄뿐이라 대조가 깨끗하다. 4.2 옵션 줄에 반영된 것도 맞다.
- 따옴표와 `-e` 가 든 Bash 가 접두 규칙이 있어도 묻는다는 것은 CLI 대조로 뒷받침된다. 6절이 이것을 P-W2.6 안에 넣었다고 밝힌 것도 정직하다.
- 1차 3번(환경변수 유출) · 4번(승인 요청 동시성) · 6번(`message_targets`) · 7번(큐 표 없음) · 11번(계측 사슬)은 이 시점 수정에 안 담겼다. 그대로 선다.

---

# 3차 — 설계자가 1·2차를 반영한 뒤 (같은 날 저녁)

## 3차 판정

**조건부 승인 유지.** 1·2차 지적 열둘이 실제로 닫혔다. 실증 5(설계가 고른 옵션 조합 전체를 한 판에 돌린 것) · `bot_inbox` 큐 · 승인 요청 키 · env 화이트리스트 · 위험 일곱은 문서가 아니라 구조가 고쳐진 것이다. 조건은 셋으로 바뀌었다.

1. **봇이 조종석 DB 를 쓰기로 열 수 있는 자리를 막는다**(31번). 계정 해시와 승인 기록이 봇이 닿는 파일에 들어간다. env 화이트리스트로는 안 막힌다.
2. **실증 4e 에 대조군 한 판을 더한다**(21번, 여전히 열림).
3. **P-W1.5 의 재는 법을 고친다**(20번, 여전히 열림).

## 닫힌 것 열둘

| # | 무엇으로 닫혔나 |
|---|---|
| 1 | 실증 5 가 `default` + `canUseTool` + `allowedTools` + `persistSession true` + env 화이트리스트를 한 판에 돌렸다. 회사 PC 는 W1.3 · P-W1.9 |
| 2 · 22 | P-W1 통과가 「10 중 8, 1.1 · 1.5 · 1.6 · 1.6b 필수」로 고쳐졌다 |
| 3 | DESIGN 6절에 env 화이트리스트 항목 · V7 · P-W1.10 이 들어갔다 |
| 4 | `permission_requests` 에 `tool_use_id`(키) · `agent_id` 가 들어가고 W2.5 에 동시 요청 시험이 생겼다 |
| 5 | W2.5 에 `suppressAlwaysAllowRule` · `defaultToNo` 반영이 들어갔다 |
| 6 | W2.2 에 봉투 파싱으로 `message_targets` 를 채우는 함수와 `targets` 칸 시험이 들어갔다 |
| 7 | `bot_inbox` 표가 생겼고 `room_bots.last_delivered_id` 를 대신한다고 명시됐다 |
| 8 | W2.3 에 「`idle` 에서만 큐를 푼다」가 들어갔다 |
| 9 | `session_events` 적재가 W2.3 으로 앞당겨졌다 |
| 10 | W2.9 에 `{{UPLOADS_DIR}}` 갱신이 들어갔다 |
| 11 | W2.10 이 `weekly.sh` 를 node 로 옮기고 DB 사본 셋을 가져와 센다고 적었다 |
| 12 | 위험표에 V6 이, 예측에 P-W4.d(≤ 3 세션 · ≤ 6 GB)가 들어갔다 |
| 27 | W1.3 본문이 갱신됐다. 다만 통과 문장의 필수가 셋인데 예측표는 넷이라 한쪽이 다른 쪽을 가리키게 해야 한다 |

## 여전히 열린 것

13 · 14 · 15 · 16 · 17 · 18 · 19 · 20 · 21 · 23 · 24 · 25 · 26 · 28 · 29. 내용은 위 두 표 그대로다. 이 가운데 20 · 21 은 막힘이고, 23 · 24 · 25 · 26 은 중요다.

## 3차에서 새로 찾은 것 둘

| # | 심각도 | 자리 | 문제 | 근거 | 고치는 방향 |
|---|---|---|---|---|---|
| 30 | 중요 | `spike/RESULTS.md:55` | 실증 5 에서 압축 뒤 첫 답에 "이어서 합니다" 가 **안 나왔다.** 기록은 원인을 「모델 편차」로 적었는데 실증 3 도 같은 haiku 였다. 달라진 것은 `allowedTools` · `persistSession` · env 화이트리스트 셋이다. 이 한 줄은 `CLAUDE.md` 에 박힌 회복 신호이고 P-W1.9 의 통과 칸이라, 원인 가설이 무해한 쪽으로 기울면 관문에서 판정이 흐려진다 | `spike/RESULTS.md:55` · `prodev/CLAUDE.md:9` | 가설을 「env 화이트리스트로 session-start 훅의 문맥이 달라졌을 수 있다」까지 넓혀 적고, 화이트리스트 판과 전체 env 판을 한 번씩 더 돌려 가른다 |
| 31 | 막힘 | DESIGN 4.3 (`users` 행) · 6절 env | 봇 설정의 `env` 는 `MINIDISCORD_DB` 로 **조종석 DB 경로**를 싣고, 허용 목록에 `Bash(node:*)` 가 있다. 그 DB 에 이제 `users.pw_hash`(계정 해시)와 `permission_requests`(승인 기록)가 들어간다. 봇이 `node:sqlite` 로 쓰기로 열어 해시를 읽거나 승인 기록을 고칠 수 있다. 지금 minidiscord 판에는 없던 위험이다 — 그 DB 에는 비밀번호가 없었다. env 화이트리스트는 이 구멍을 못 막는다. 경로는 설정 파일이 정당하게 싣기 때문이다 | `prodev/common/settings.template.json:16`, `:42` · `minidiscord/server/src/db.ts:10-14` · DESIGN 4.3 `users` 행 | 계정과 승인을 봇이 못 보는 둘째 파일로 가른다. 또는 봇에게는 읽기 전용 사본·뷰만 주고 `MINIDISCORD_DB` 가 그것을 가리키게 한다. 어느 쪽이든 W2.2 에 항목으로 적고 P-W3 에 「봇 세션에서 `pw_hash` 를 못 읽는다」 칸을 넣는다 |

## 3차 · 추가로 확인한 주장

- 봇 설정의 `env` 는 정확히 일곱 키다(`prodev/common/settings.template.json:36-44`). 6절의 「봇 설정의 env 일곱」은 맞다.
- 실증 5 로 `persistSession: true` + pre-compact 조합이 확인됐다. 실증 3 의 걸림 2 는 풀렸다.
- `bot_inbox` 의 `delivered_at IS NULL` 재배달은 minidiscord 의 `room_bots.last_delivered_id` 와 같은 일을 한다. ARCHITECTURE 6.6 의 「서버가 재배달한 놓친 @TO」가 이것으로 이어진다.

## 3차 · 설계가 아직 가볍게 본 위험 셋

1. **봇이 조종석 DB 에 쓰기로 닿는다**(31번). 창구를 한 프로세스로 모으면서 「봇이 읽는 대화 DB」와 「사람 계정·승인 기록」이 한 파일이 되었다. 지금 위험표 일곱에도 없다.
2. **허용 목록이 SDK 세션에서 정말 먹는지**가 아직 대조군 없이 한 판뿐이다(21번).
3. **분량.** 3차 수정으로 W2.2 · W2.5 · W2.10 의 속이 더 무거워져 W2 는 이제 열 덩이다. W2 를 둘로 쪼개고 관문을 하나 더 두는 편이 현실적이다.
