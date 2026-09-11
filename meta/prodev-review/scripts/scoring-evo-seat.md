# 관문 A "자리" (evo-seat) — 채점표 (칸은 2026-09-11 **돌리기 전에** 적었다)

예측은 `../predictions/2026-09-11-evo-seat.md`. 정답지는 없다 — 전부 파일과 설정을 세는 칸이다.
**결과를 보고 칸을 더하거나 빼지 않는다.** 실측 칸만 뒤에 채운다.

기록 자리: `../runs/<날짜>-evo-seat.md` (판정) · `<날짜>-evo-seat-tests.txt` (`gate-tests.sh`) · `<날짜>-evo-seat-count.txt` (`evo-count.js` 출력).

지금 HEAD(`94ed5af`) 기준값 — `evo-count.js` 로 2026-09-11 에 잰 것: 자리 넷 **0/4** · `CLAUDE_CODE_GIT_BASH_PATH` **없음** · Bash 항목 **31** · 뺄 열여섯 잔존 **16** · 훅 절 **7** · allow 에 없는 호출 **0**.

---

## A. 자리 (setup.js) — 칸 넷

| # | 칸 | 통과 조건 | 실측 | 근거 |
|---|---|---|---|---|
| A-1 | `analysis/` · `templates/` · `house.md` · `.gitignore` | 4/4 | **4/4** ○ | `evo-seat-count.txt` A1 |
| A-2 | `.gitignore` 의 `tmp/` 줄 | 1 | **1** ○ | 〃 A2 |
| A-3 | `tmp/x.png` 넣고 `git status --short` 의 tmp 줄 | 0 | **0** ○ | 〃 A2 |
| A-4 | `house.md` 머리에 이것이 무엇인지 한 줄 (빈 파일이 아니다) | 있음 | **있음** ○ — "여기 적힌 것은 규칙이다 … 상한 50줄 … 스스로 줄이지 않는다" | 〃 "house.md 머리" |

## B. 훅 (session-start.js) — 칸 넷

| # | 칸 | 통과 조건 | 실측 | 근거 |
|---|---|---|---|---|
| B-1 | 실 없는 과제에서 `## ` 절 수 | 8 | **8** ○ | 〃 A3 |
| B-2 | house 절의 순서 | 8번째 | **8번째** ○ "이 과제의 규칙 (house.md)" | 〃 A3 |
| B-3 | 51줄일 때 실린 규칙 줄 | 50 | **50** ○ | 〃 A4 |
| B-4 | 51줄일 때 절 제목의 잘림 표시 | 있음 | **있음** ○ "(앞부분만 · 잘림)" + 끝에 "첫 답에 이것부터 사람에게 말하라 … 스스로 줄이지 마라" | 〃 A4 · meta 가 훅을 직접 돌린 출력 |

## C. 설정 (settings.template.json) — 칸 넷

| # | 칸 | 통과 조건 | 실측 | 근거 |
|---|---|---|---|---|
| C-1 | `env.CLAUDE_CODE_GIT_BASH_PATH` 키 · 값 | 있음 · 비지 않음 | **있음 · `C:\Program Files\Git\bin\bash.exe`** ○ | 〃 A5 |
| C-2 | allow 의 `Bash(` 항목 수 | ≤ 10 | **10** ○ (node git gh python3 mkdir ls date echo pwd cd) | 〃 A6 |
| C-3 | 뺄 열여섯 잔존 | 0 | **0** ○ (스물하나를 뺐다 — 열여섯 + sha256sum · cp · chmod · basename · dirname) | 〃 A6 |
| C-4 | 스킬 · 에이전트 · `CLAUDE.md` 가 부르는 명령 중 allow 에 없는 것 | 0 | **0** ○ — 도구가 3 을 냈으나 `prodev-orchestrator/SKILL.md:16,17,31` 의 `` `find` `` 는 **스킬 이름**이다 (직접 읽어 확인). 도구 오탐, 판정 뒤 도구를 고쳤다 | 〃 A7 · SKILL.md 16 · 17 · 31행 |

## D. 문서 · 시험 — 칸 넷

| # | 칸 | 통과 조건 | 실측 | 근거 |
|---|---|---|---|---|
| D-1 | `docs/launch.md` 파이썬 표의 `scipy` · `statsmodels` · `pandas` | 3/3 | **3/3** ○ + 설치 줄(맥 · 윈도우 `py -m pip`) + "사람이 미리 깐다" | `launch.md:282-295` |
| D-2 | `ARCHITECTURE.md` 과제 폴더 그림에 새 자리 셋 | 3/3 | **4/4** ○ (`.gitignore` 까지) — **v3** 에서 | `design/v3/ARCHITECTURE.md:90,99,101,105` |
| D-3 | `npm test` · `test:server` | ≥ 102 · 0 / ≥ 25 · 0 | **111 · 0 / 25 · 0** ○ | `evo-seat-tests.txt` |
| D-4 | `## ADR-` 수 · 금칙 grep | ≥ 32 · 0 | **33 · 0** ○ (v3: ADR-031 판 올림 · 032 house.md · 033 허용 목록) | `grep -c` · `evo-seat-tests.txt` |

---

## 칸 합계

A 4 · B 4 · C 4 · D 4 = **16칸 → 16/16**. 예측표는 따로 열 칸(A1~A10).

## 이번 판에서 재지 않는 것

봇이 잘림을 사람에게 말하는가 — 관문 B 의 B12. 여기서는 훅의 손만 센다.

---

## 실측 (돌린 뒤에만 채운다)

돌린 날: 2026-09-11 (UTC 08:54 ~ 09:05)
대상 HEAD · PR: `cbb05ba` · PR #9 (`code/evo-seat`)
사본: `evo-count.js` 가 `git archive HEAD` 로 뜬 임시 폴더 (계측 뒤 지움) · `gate-tests.sh` 사본 별도
