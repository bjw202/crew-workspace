# prodev-review — meta 가 prodev 를 검수하는 자리

| 폴더 | 무엇 | 누가 쓰나 |
|---|---|---|
| `plans/` | 기획(`2026-09-10-pl-assistant.md`) · 상세 설계와 검토 반영(`2026-09-10-prodev-design.md`) · 시제품 `proto/chat.js` | meta. 설계를 바꿀 제안도 여기에 글로 |
| `notes/` | 바깥 근거 (고영혁 사례 분석) | meta |
| `predictions/` | `prodev-prediction.md` — 제작 전에 적는 숫자. `../prodev/VERIFICATION.md` 5절의 열넷 | meta, 1단계 전에 |
| `fixtures/` | 정답지 · 채점표 · find.js 시험 카드 12와 물음 10 · 훅 fixture. **prodev 에는 입력만 준다** | meta |
| `scripts/` | 대본 R1~R5 (JSON) | meta |
| `runs/` | `<날짜>-<관문>.md` 검수 기록 | meta, 관문마다 |

경계: 이 폴더의 파일은 prodev 세션이 읽지 않는다 (정답지가 있다). 입력으로 줄 것은 복사해서 준다.

## 다른 기계로 옮길 때
먼저 `HANDOFF.md` 를 읽는다. 상태 · 확인된 것과 안 된 것 · 옮겨서 켜는 순서 · 4단계 주간 계측 절차 · 도구(`scripts/tools/`)가 거기 있다. meta 세션의 기억 파일은 기계 경로에 묶여 있어 실리지 않는다.
