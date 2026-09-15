# cockpit 관문 M2.M (= W2 서버 뼈대) 채점표 — 2026-09-14 적음, M2 코드가 오기 전

대상: `cockpit/` M2 커밋들(M2.1~M2.7). meta 가 **사본**에서 직접 돌린다(`git archive HEAD` → 스크래치, `npm ci`). 두 겹이다: ① cockpit 자체 시험 · 스모크, ② **옛 대본 다섯(R1~R5)을 `prodev/scripts/replay.js` 로 cockpit 서버에 재생**해 3단계 관문(T3M) 채점표(`scoring.md`)로 다시 센다.
판정: ① 칸 열 중 **아홉 이상 ○, 굵은 넷 필수** · ② 대본 다섯의 `scoring.md` 칸 합이 **≥ 32/42**(T3M 실측 R1 4/6 · R2 11/13 · R3 4/6 · R4 7/8 · R5 6/9 = 32/42 와 같거나 위) 그리고 예측표 열넷(`../predictions/prodev-prediction.md` P1~P14) 기준 ≥ 12/14(P-W2.1) · 조종석 칸 둘(P-W2.6 승인 수 · P-W2.8 반응 시간) 안. 결과를 보고 칸을 더하거나 빼지 않는다.

## ① cockpit 자체

| # | 칸 | 어떻게 세나 | ○ 조건 (예측) |
|---|---|---|---|
| **1** | **`npm test` 무의존** | 사본에서 `node --test "test/**/*.test.js"`, 형제 둘 있음 | `fail 0 · cancelled 0 · skipped 0 · pass ≥ 110` |
| **2** | **replay.js 계약 시험** | `test/contract/replay-js.test.js` (형제 `replay.js` 를 모의 세션 관리자에 붙여 걸음 셋) | 초록(건너뜀 아님). 그리고 meta 가 `prodev/test/server/replay.test.js` 의 가짜 서버 규칙(multipart 만 · JSON 406 · Bearer 401 · `?after=`)을 살아 있는 cockpit 서버에 `curl` 로 넷 확인 |
| **3** | **서버가 뜨고 토큰이 난다** | `node bin/cockpit.js serve --config <스크래치 설정>` · `node bin/cockpit.js session-token <이름>` · `GET /api/rooms` | 200 · `{active, archived}` |
| **4** | **과제 열기** | `POST /api/projects`(admin) → `GET /api/rooms` | 방 둘 이름 `prodev-<과제>` · `prodev-<과제>/files`, member 는 403 |
| 5 | 승인 중계 시험 | `test/permissions.test.js` 열 항목 | 10/10 |
| 6 | 스모크 m2-approval (meta, haiku) | 출력 줄 | `CARD tool_use_id= tool=Bash` · 거부 한 번 뒤 도구 미실행 · 허용 한 번 뒤 실행 · "이번 세션 허용" 뒤 같은 도구 재요청 0 · 본방 system 글 🔒 N = 요청 수, ✅/⛔ = 답 수 |
| 7 | 스모크 m2-compact (meta, haiku) | 출력 줄 | `COMPACT_BOUNDARY pre= post=` · `SYSTEM_MESSAGES 2`(정리 중 · 정리 끝) · `HANDOFF 정상` |
| 8 | 화면 정적 검사 | `test/web-static.test.js` + meta 가 `grep -rn "https\?://" web/` 직접 | 외부 src/href 0 · `<script type=module>` 만 · `innerHTML` 은 markdown.js 만 |
| 9 | 역할 403 | `test/http-projects.test.js` · `test/permissions.test.js` 의 member 항목 + meta 가 member 토큰으로 `POST /api/permissions/...` 한 번 | 403 |
| 10 | as-built · log 갱신 | 파일 | M2 절 있음 |

## ② 대본 다섯 재생 (W2 본체)

- 대본: `../scripts/R1-charter.json … R5-compact.json` 그대로. 봇 이름은 대본의 `@TO(prodev-worktogether-비서)` 를 쓰므로 과제 이름을 `worktogether`, 봇 이름을 `prodev-worktogether-비서` 로 연다(대본을 고치지 않는다).
- 실전 모델(sonnet) · 실전 봇 설정을 스크래치로 복사한 봇 폴더(`prodev/bots` 안 안 씀) · 스크래치 과제 폴더.
- 채점표는 `../scripts/scoring.md` 의 R1~R5 칸 그대로(2026-09-10 것). 재는 법이 minidiscord DB 를 보던 칸은 cockpit `chat.db` 로 같은 SQL.
- 조종석 칸 셋을 더한다(예측표 P-W2.6~2.8): 승인 요청 수 ≤ 3 · 서버 강제 종료 → 재기동 뒤 놓친 글 0 · "이어서 합니다" 한 줄 · 사람 글 → 봇 첫 반응 중앙값 ≤ 15초. 이 셋은 M2 범위(재기동은 M3.6)라 **재기동 칸은 M3.M 으로 미룬다** — 여기서는 승인 수와 반응 시간 둘만.
- 값 예측: 대본 다섯 합 ≤ $25. 근거는 T3M 의 부분 실측뿐이다(R2 들이기 한 건 $2.70 · 위키 갱신 $0.58; 다섯 합은 T3M 기록에 없다). 이번에 `cost.js` 로 다섯 합을 처음 잰다.

## 반려 사유
①의 굵은 칸 하나라도 ✗ · ② 12/14 미만 · 승인 요청 > 3.
