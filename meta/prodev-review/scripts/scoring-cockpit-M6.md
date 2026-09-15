# cockpit 관문 M6.M (실전 준비 — 화면 결함 둘 · 설치 문서 v2) 채점표 — 2026-09-15 01:15 적음, M6 코드가 오기 전

대상: cockpit M6 커밋 + prodev PR(#20 후보: intake 카드 번호 순서 · journal 절 둘). 판정: 여덟 중 일곱 ○(굵은 셋 필수). meta 가 사본에서 직접. 사람이 이 맥 `~/cockpit-try-v2` 를 다시 띄워 N17 을 눈으로 본다(판정 칸 아님, 기록).

| # | 칸 | ○ 조건 (예측) |
|---|---|---|
| **1** | `npm test` | fail 0 · skipped 0 · pass ≥ 206 |
| **2** | N17 도구 입력 요약 줄바꿈 | `style.css` cockpit 덩이(또는 panel CSS)에 `.tool-input`(또는 그 부모)의 `min-width: 0` · `overflow-wrap: anywhere` 또는 같은 뜻의 규칙 · 정적 시험 한 건 이름 있음 · 원본 구간 sha 그대로 · 리터럴 색 0 |
| **3** | N16 캐시 | 정적 파일 응답에 `cache-control: no-cache`(또는 `must-revalidate`) + `etag`(또는 `last-modified`) · 시험 한 건 · `curl -I /app.js` 로 실측 |
| 4 | `docs/INSTALL-WINDOWS.md` v2 | 걸음에 "새 방(과제) 만들기는 화면의 `+`" · `setup.js` 손 걸음 삭제 · `prodevDir` · `botsDir = <prodevDir>/bots` · `migrate-v2` 한 줄(v1 DB 를 이어 쓸 때) · 12번 브라우저 걸음에 "판 접기 · 사람끼리 글 · 따라잡기" 셋 · 번호 걸음 ≥ 10 · 이어쓰기 백틱 0 |
| 5 | README 쓰는 법 v2 | 맥 · PowerShell 나란히 · `open-project` 대신 화면 `+`(CLI 는 `--no-setup` 설명) · `check` 에 `prodevDir` |
| 6 | prodev PR(#20 후보) 사본 | `npm test` fail 0 · intake: "카드 번호를 먼저 밝히고 '확정' 을 청한다" 문장 + 시험 · journal: "방마다 마지막 글" · "카드 없는 첨부" 절 유지 문장 + 시험 · cockpit 이 그 가지로 `npm test` fail 0 |
| 7 | 스모크 재판 | `m5-room` · `m3-restart` 두 판 exit 0 (haiku · 사본) |
| 8 | as-built · log | M6 절 · 5절에 N16 · N17 자리 |

반려 사유: 굵은 셋 중 하나라도 ✗ · 일곱 미만.
