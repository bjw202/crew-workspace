# cockpit 관문 M3.M (= W3 조종석 판) 채점표 — 2026-09-14 18:35 적음, M3 코드가 오기 전

대상: cockpit M3 커밋(M3.1~M3.6: 사건 접기 · 조종석 판 · 세션 조작 · 파일 판 · 과제 탭 · 재기동) + prodev 의 승인 습관 고침 PR(W3 앞). meta 가 사본에서 직접. 판정: ① 열 중 아홉 ○(굵은 넷 필수) · ② R5 대본 ≥ 6/9(T3M 6/9) · ③ 승인 재측정 ≤ 10.

## ① cockpit 자체
| # | 칸 | ○ 조건 (예측) |
|---|---|---|
| **1** | `npm test` 무의존 | fail 0 · skipped 0 · pass ≥ 150 |
| **2** | 세션 조작 API 역할 | 다섯 길 member 403 · `interrupt` 는 `queryFn.interrupt` 1회 · `compact` 는 working 이면 걸어 두고 idle 에 넣음 · `stop` 은 도우미 있으면 confirm 필요 |
| **3** | 재기동 스모크 m3-restart (meta) | `RESUMED yes` · `REDELIVERED 2` · `BOT_REPLIES_AFTER_RESTART 2` · 첫 답에 "이어서" |
| **4** | 사건 접기 | `stream_event` 0행 · `tool_use` 입력 요약 ≤ 200자 · `result` 마다 cost 는 마지막 값 · 재접속 되그리기 = 실시간 사건 수 |
| 5 | 조종석 판 정적 검사 | 외부 src 0 · `innerHTML` 은 markdown.js 만 · 이번 턴 도구 목록은 마지막 result 뒤만 · 도우미는 `parent_tool_use_id` 로 묶임 · 값 옆 "추정치" |
| 6 | 파일 판 | `../` 404 · 과제 밖 링크 404 · csv 앞 50행 · png `image/png` · 쓰기 메서드 405 · **봇 세션에서 `cockpit.db` Read 거부**(P-W3.6) |
| 7 | 세션 상태 표시 | 봇이 일하는 동안 `GET /api/projects` 의 `state` 가 `working` (W2r 에서 `idle` 로 보인 것 고쳐짐) |
| 8 | 승인 카드 재판 (b7b6263 뒤) | `LOCAL_SETTINGS_CHANGED no` · 재요청 0 |
| 9 | 과제 탭 · 봇 상태 칩 · 압축 경계 표시 | 시험 이름 있음 |
| 10 | as-built · log | M3 절 |

## ② R5 압축 · 재기동 (`scoring.md` R5 아홉 칸, 손 걸음 셋은 admin API 로: s3 `/compact` · s5 `stop` · s11 `start`)
예측: ≥ 6/9. "이어서 합니다" 한 줄 있음 · 놓친 글 재배달 0 누락 · 인수인계서 `못 썼다` 없음.

## ③ 승인 재측정 (R1~R4 중 R2 · R4 만 다시)
prodev 의 스킬 고침(python 은 파일로 · 히어독 · 반복문 금지 · reviewer 는 WebFetch) 뒤: R2 + R4 승인 합 ≤ 10 (W2r 은 R2 약 8 · R4 약 20). 값 ≤ $10.

반려 사유: 굵은 넷 중 하나라도 ✗ · R5 < 6/9. ③ 은 빗나가면 원인만 적는다(사람이 승인 부담을 감수할지 정한다).
