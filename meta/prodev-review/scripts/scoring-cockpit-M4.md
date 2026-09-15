# cockpit 관문 M4.M (윈도우 · 설치 · 문서) 채점표 — 2026-09-14 20:20 적음, M4 코드가 오기 전

대상: cockpit M4 커밋(M4.1 윈도우 시험 · M4.2 설치 문서와 `check` · M4.3 자원 계측 스모크 · M4.4 as-built 절 여섯). 판정: ① 여덟 중 일곱 ○(굵은 셋 필수) · ② 윈도우 출력은 **사람(PL)이 회사 PC 에서 돌려 파일로 meta 에 준다** — cockpit 세션의 보고는 근거가 아니다. 맥에서 되는 것은 meta 가 사본에서 직접.

## ① cockpit 자체
| # | 칸 | ○ 조건 (예측) | 누가 · 어디서 |
|---|---|---|---|
| **1** | `npm test` 무의존 (맥) | fail 0 · skipped 0 · pass ≥ 154 | meta 사본 |
| **2** | `bin/cockpit.js check` (맥) | 출력에 `✓ claudePath <판>` · `✓ node <판> (>= 22)` · `✓ 경로 공백 없음` 셋 · 공백 든 경로를 주면 ✗ 한 줄 · 없는 `claudePath` 면 ✗ 한 줄 · exit ≠ 0 | meta 사본 |
| **3** | `docs/INSTALL-WINDOWS.md` | 번호 걸음 ≥ 6 (`grep -c '^[0-9]\+\. '`) · 걸음마다 확인 명령(코드 블록 또는 백틱) · `claudePath` 절대 경로 · `settings.local.json` 자리 · PowerShell 한 줄 명령(백틱 이어쓰기 없음 — prodev 윈도우 포팅 bc7d914 의 교훈) | meta 읽기 |
| 4 | `smoke/m4-sessions.mjs` (맥 · haiku · 세션 셋 · 5분) | `RSS_MB` 줄 ≥ 5 · 서버 RSS ≤ 300 MB · 자식 합(셋) ≤ 1.5 GB · 5분 동안 세션 셋 state 가 error 0 | meta 사본 |
| 5 | as-built 절 여섯 | 폴더 나무 · 표 둘 · API · 시험 묶음과 건수 · 설계와 다르게 된 자리 · 알고 두는 것 | meta 읽기 |
| 6 | 윈도우 env 화이트리스트 | `src/session/env.js` 에 `USERPROFILE · APPDATA · LOCALAPPDATA · TEMP · SystemRoot · ComSpec` 여섯 + 맥 여섯 · 그 밖 키는 안 실림(시험 한 건) | meta 사본 grep · 시험 |
| 7 | 문서 정합 | README "쓰는 법" 이 맥 · 윈도우 둘 다 · `docs/log.md` M4 절 · `VERIFICATION` 스모크 표에 m4 줄 | meta 읽기 |
| 8 | 값 표시 주석 | `docs/ARCHITECTURE.md` 5.3 에 "재기동 뒤 바닥 + 프로세스 누적 · 도우미 값 포함 여부" 한 줄 (M3.M N11) | meta 읽기 |

## ② 윈도우 실측 (사람이 회사 PC 에서 돌린 출력 파일 · meta 가 읽는다)
| # | 칸 | ○ 조건 (예측) |
|---|---|---|
| W-1 | `npm test` (PowerShell) | `# fail 0` · 건너뜀 ≤ 5 · 건너뛴 이름이 as-built 에 있음 |
| W-2 | `node bin/cockpit.js check` | ✓ 셋 |
| W-3 | `smoke/m1-hello.mjs` (haiku) | `BOT_REPLY` 한 줄 · `ASKED []` |
| W-4 | `smoke/m3-restart.mjs` (haiku) | `RESUMED` 같은 uuid · `REDELIVERED 2` · `BOT_REPLIES_AFTER_RESTART 2` |

②는 W1 실증(P-W1)과 겹친다 — 회사 PC 가 없으면 M4.M 은 ① 만으로 "맥 조건부 통과" 로 두고 ② 는 W1 에서 잰다.

반려 사유: 굵은 셋 중 하나라도 ✗ · ① 일곱 미만.
