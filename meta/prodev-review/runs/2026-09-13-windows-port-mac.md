# 윈도우 포팅 PR 맥 회귀 확인 — 2026-09-13

**관문이 아니다.** `2026-09-13-windows-port.md` 4절 첫 줄 · 6절 2번 「맥에서 시험 넷을 돌릴까」 의 답이다.
포팅은 윈도우에서 고친 세션이 스스로 쟀으므로, 이 기록은 **다른 기계 · 다른 세션이 새로 받아 돌린** 첫 대조다.
예측은 적지 않았다 — PR 본문이 적은 기대값(맥에서 실패 0)을 그대로 대조 기준으로 썼다.

- 기계: macOS 26.5.2 · Node v24.12.0 · npm 11.6.2
- 대본: 두 저장소를 GitHub 에서 **새로 clone** (세션 임시 폴더) → `npm ci` → 시험. main 과 `windows-port` 를 같은 대본으로.
  본 체크아웃은 안 건드렸다. 기계 출력: `2026-09-13-windows-port-mac-tests.txt`
- 대상: `prodev` PR #16 (`1b98b53`) · `minidiscord` PR #10 (`e42dc12`)

## 1. 잰 것

| # | 무엇 | main (df2373a · dfa33c3) | windows-port | 기대 (PR 본문) |
|---|---|---|---|---|
| 1 | minidiscord `server` 시험 | 298 통과 | 298 통과 | 293 통과 · 건너뜀 4 → **빗나감 (아래)** |
| 2 | minidiscord `channel` 시험 | 103 통과 | 103 통과 | 103 |
| 3 | minidiscord `e2e` | 15/15 | 15/15 | 15/15 |
| 4 | minidiscord `e2e:scenario` | 20/20 | 20/20 | 20/20 |
| 5 | prodev `npm test` | 133 통과 · 0 실패 | 133 통과 · 0 실패 | 133 · 0 |
| 6 | prodev `test:server` | 25 통과 · 0 실패 | 25 통과 · 0 실패 | 25 · 0 |
| 7 | prodev `hooks.test.js` · `TZ=Asia/Seoul` (20:28) | 41 · 0 실패 | 41 · 0 실패 | — |
| 8 | prodev `hooks.test.js` · `TZ=Pacific/Kiritimati` (UTC+14) | **40 · 1 실패** (`2026-09-13 (0일 전)`) | 41 · 0 실패 | — |

- 1번 빗나감: PR #10 본문은 「맥은 건너뜀 4」 라 적었으나 맥에서 건너뜀 0 · 298 전부 통과. 가설: 윈도우 판의 건너뜀 넷을 맥에도 있다고 옮겨 적었다 (293 + 5 = 298 로 합은 맞다). 코드 결함이 아니라 본문 숫자 결함.
- 8번: 포팅 기록 3절의 날짜 결함(UTC/로컬 달력 혼용)을 **main 에서 재현**했고, 고친 판에서 사라짐을 확인. 한국 자정~09시와 같은 조건을 시간대로 만들었다.

## 2. 코드에서 본 것 (시험 밖)

- `알린다` 가 async 가 됐다. 부르는 자리는 `session-start.js` · `pre-compact.js` 둘뿐이고 둘 다 `await` 한다 (grep).
- `pat()` 의 posix 값은 예전 식과 같다. 다만 「맥 동작 한 바이트도 불변」 은 과장이다 — 맥에서도 바뀌는 것 둘:
  `NEEDED` 에 `mkdir` 이 더해져 환경 점검 14 → 15, 알림이 HTTP 4xx/5xx 에 「보냄」 대신 「못 보냄 (HTTP n)」.
- tsx CLI 경로 `node_modules/tsx/dist/cli.mjs` 는 tsx 4.23.12 의 `bin` · `exports["./cli"]` 와 같다.
- `GIT_DIR` 은 `CLAUDE_CODE_GIT_BASH_PATH` 가 `<Git>/bin/bash.exe` 꼴이라고 가정한다. 다른 꼴이면 PATH 앞자리가 조용히 빠진다 (`existsSync` 가 거른다).
- `test/hooks.test.js:378` 주석이 아직 curl 을 말한다.
- minidiscord `web-markdown.test.ts` 의 PRESERVE 목록에서 `server/src` 가 빠졌다 — PR 이 스스로 밝힌 유일한 보호 축소.

## 3. 판정과 뒤처리 (사람 승인 2026-09-13)

- prodev PR #15 **닫음** — 변경 전부가 #16 `aa264d1` 에 들어 있고, 건너뜀 사유에 틀린 진단(MSYS 코드페이지)이 남아 있었다.
- prodev PR #16 **머지** → `1c3d65d`. 트리 `b5b7c38` = 시험한 `1b98b53` 의 트리 (gh api 로 대조).
- minidiscord PR #10 **머지** → `6633f7b`. 트리 `49e1907` = 시험한 `e42dc12` 의 트리.
- `workspace.json` 핀: prodev df2373a → 1c3d65d · minidiscord dfa33c3 → 6633f7b.

## 4. 아직 못 잰 것

| 무엇 | 왜 |
|---|---|
| Node 22 에서 `chat.js` | 이 맥은 24.12 다. 포팅 기록 4절과 같은 칸이 그대로 남는다 |
| 맥에서 봇을 실제로 띄워 방 · 첨부 · 훅 알림 | 시험만 돌렸다. 알림 curl → fetch 는 `hooks.test.js` 가 살아 있는 서버로 잡는 범위까지만 확인 |
