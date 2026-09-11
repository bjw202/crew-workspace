# 관문 C "짐" (evo-carry) — 채점표 (칸은 2026-09-11 **돌리기 전에** 적었다)

예측은 `../predictions/2026-09-11-evo-carry.md`. 정답지는 없다 — 전부 grep 과 해시다.
**결과를 보고 칸을 더하거나 빼지 않는다.** 실측 칸만 뒤에 채운다.

meta 가 만들고 meta 가 센다. 설계 판단이 없고 세는 것이 기계라서다 — 그 사실을 `runs/` 머리에 적는다.

기록 자리: `../runs/2026-09-11-evo-carry.md` · `-count.txt` · `-tests.txt`.

지금 기준값 (2026-09-11): `docs/evidence/` **없음** · `*.md` 절대 경로 **4** · `HANDOFF.md` 의 `MINIDISCORD_DB` **0** · `WINDOWS.md` 길 C **없음**.

---

| # | 칸 | 통과 조건 | 실측 | 근거 |
|---|---|---|---|---|
| C-1 | `prodev/docs/evidence/` 판정 기록 사본 수 | 8 | **8** ○ (+ README.md) | count.txt |
| C-2 | 사본과 `runs/` 원본의 sha256 불일치 | 0 | **0** ○ | count.txt (`evo-count.js evidence`) |
| C-3 | `ADR.md` · `docs/log.md` 의 `docs/evidence/` 언급 | ≥ 3 | **9** ○ (ADR 2 · log 7; README 1 은 덤) | count.txt |
| C-4 | 기억 md 에 여섯 슬러그 | 6/6 | **5/5** ○ — 기억 폴더의 파일 여섯은 슬러그 다섯 + 색인 `MEMORY.md`(슬러그 없음). 여섯을 슬러그로 센 예측이 부정확했다 | count.txt |
| C-5 | 기억 md 에 낡은 두 곳 고침 표시 (방 · replay) | 2 | **4** ○ (둘 + 허용 목록 + 제목) | count.txt |
| C-6 | `crew-workspace` 안 `*.md` 의 `/Users/<계정>` | 0 | **안내문 0** ○ — grep 원값 2 는 이 채점표와 예측 파일이 그 문자열을 "센다"고 적은 줄(자기 참조) | count.txt |
| C-7 | `HANDOFF.md` 의 `MINIDISCORD_DB` 줄 | ≥ 1 | **1** ○ | count.txt |
| C-8 | `HANDOFF.md` 의 과제 저장소 자리·열람자 줄 (또는 "첫날 결정" 칸) | ≥ 1 | **2 · 첫날 결정 칸 1** ○ (자리 · 열람 · 정한 날 — 빈칸) | count.txt |
| C-9 | `WINDOWS.md` 길 C 절 | 1 | **1** ○ (`## 3-C`) | count.txt |
| C-10 | `WINDOWS.md` 첫날 점검표 행 | ≥ 9 | **11** ○ | count.txt |

**10칸 → 10/10.** 예측표는 따로 여섯 칸(C1~C6) → 6/6.

## 남기는 것 (빗나감으로 세지 않는다)

`crew-eval/notes/measure.js:16` 의 절대 경로 (crew 시절 도구). `design/v3/TASKS.md:92` · `VERIFICATION.md:139` 의 `../meta/prodev-review/runs/` 는 근거가 아니라 **meta 가 결과를 적는 자리**를 가리키는 절차 문장이라 그대로 (prodev 의 판단, meta 도 같다).

---

## 실측 (돌린 뒤에만 채운다)

돌린 날: 2026-09-11 (UTC 13:18 ~ 13:25)
대상 HEAD · PR: `7793abc` · PR #11 (`docs/evo-carry`) + meta 쪽 파일 넷 (`notes/2026-09-11-memory.md` · `README.md` · `crew-eval/README-crew-era.md` · `HANDOFF.md` · `../WINDOWS.md`)
