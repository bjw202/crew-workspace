# 관문 사이에 드러난 것 (2026-09-10) — meta 쪽 잘못과 설계 오류의 기록

관문 기록(`../runs/`)은 판정만 적는다. 여기는 관문 밖에서 prodev 가 짚어 meta 가 고친 것들이다. 고친 사람이 재지 않도록, 해당 부분이 든 다음 관문은 meta 가 다시 잰다.

| # | 언제 | 무엇 | 원인 | 고친 것 |
|---|---|---|---|---|
| 1 | T1.3 전 | find fixture: `particle_defects` 가 대화 층의 봇 코드 17건에 걸려 files.md 에 못 닿음 · `출석체크` 는 대화 4건인데 기대 `#2` 하나 | meta 의 참고 판별기가 대화 층을 실제 DB 로 재지 않음 | 층 순서 4↔5 (ADR-016) · 대화 층은 "포함" 으로 잼 · questions.json · fixtures/README |
| 2 | T1.3 검산 | meta 가 index.js 를 prodev fixture 폴더에 대고 돌려 결과 파일 둘이 생김 | 검산을 본 체크아웃에서 함 | prodev 가 지움. 이후 검산은 임시 폴더 사본으로 |
| 3 | T1.6 | `PRODEV_HOOK` 을 봇 env 에 넣으라고 지시 | pre-compact 자식 표식과 봇 env 를 meta 가 혼동 | prodev 가 짚어 빼기로 |
| 4 | T2.1 | 오케스트레이터 스킬 이름이 설계안(`secretary-orchestrator`)과 문서 둘(`prodev-orchestrator`)에서 다름 | 설계안 작성 때 이름을 바꾸고 한 곳을 안 고침 | 설계안 B 표 고침 |
| 5 | T3.1 | cron 두 줄 · pre-compact 알림이 Bearer + JSON 이라 서버(쿠키 + multipart)에 401/406 | meta 설계가 minidiscord 인증·입력 꼴을 확인 안 함 | ① 부르는 쪽을 쿠키 + multipart 로, env `PRODEV_NOTIFY_TOKEN` 하나 (ADR-018). T3.M 에서 setup·pre-compact 시험을 다시 잰다 |

되풀이되는 원인 하나: **meta 가 시험 자료와 설계를 실제 서버·DB 로 한 번 돌려 보지 않고 적었다.** 셋(1 · 5, 그리고 T1.6 의 3)이 그 자리다. 다음 회차의 규칙 후보: "설계에 적은 API 호출 꼴은 적기 전에 curl 로 한 번 친다".
