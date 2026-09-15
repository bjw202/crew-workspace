# prodev PR #20 사후 검수 — 2026-09-15 01:35 (meta-f3)

**절차 어긋남 기록.** PR #20(`cockpit-v2b`, intake 카드 번호 뒤 확정 · journal 두 절 유지)이 **meta 검수 전에** 머지됐다(01:07, `8f0870b`). 사람이 `../prodev` 를 그 커밋으로 당겼다. 내용은 M6 지시 4-① ② 와 같아 사후 검수로 대신한다. 원칙(meta 검수 → 사람 머지)은 다음부터 지킨다.

## 사본 실측 (origin/main `8f0870b` → `m5m/p20-copy`, npm ci)
| 무엇 | 결과 |
|---|---|
| `npm test` | 146 · pass 146 · fail 0 · skipped 0 (PR #19 144 + 시험 둘) |
| `test:server` | 18/18 · 실제 bots/ 안 만짐 |
| `grep "files 방\|/files 방\|방 둘\|방은 둘"` | 1 — `journal/SKILL.md:65` "이관된 옛 files 방은 보관돼 읽기만 된다" (설명문, 규칙 아님 → ○) |
| 금칙 grep | 0 |
| intake "카드 번호를 밝힌 뒤 확정을 청한다" · journal "방이 하나여도 두 절은 남긴다" | 1 · 1 |
| cockpit 사본 `npm test` (형제 = 8f0870b 사본) | 206 · 0 · 0 |

판정: **통과(사후)**. `workspace.json` prodev 핀 `8f0870b`. M6.M 채점표 6번은 이 기록으로 센다(cockpit 이 그 가지로 돌린 시험은 보고에서).
