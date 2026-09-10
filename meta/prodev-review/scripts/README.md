# 대본 다섯 (R1~R5) — meta 가 쥔다 (2026-09-10, T3.2 전에 씀)

`VERIFICATION.md` 4절. 대본과 채점표(`scoring.md`)는 여기 있고, **prodev 에는 재생할 때 대본 JSON 과 `data/` 만 준다.** `scoring.md` · `R3-key.md` 는 주지 않는다.

## 파일
| 파일 | 무엇 |
|---|---|
| `R1-charter.json` | 발의. PL 이 목적·일정·인원·예산을 한 글에 뒤섞어 말한다 |
| `R2-intake.json` | 들이기. 회차 4 성적서 34행(함정 넷). 과제원이 첫 답 하나를 틀리고 고친다 |
| `R3-find.json` | 물음 20 (카드 8 · 위키 4 · 대화 4 · 없는 것 4). R2 뒤 상태에서 |
| `R4-research.json` | 리서치 허락. 그 사이 다른 방에서 PL 이 일정을 묻는다 |
| `R5-compact.json` | R2 문답 도중 압축 → 끄기 → 글 5건 → 켜기. 사람 손 단계가 있다 |
| `data/part_incoming_inspection.csv` | R2 첨부 (회차 4 원본 그대로, SHA-256 앞 16자리 `03a7831edee72ff9`). 파일 이름을 바꾸지 않는다 |
| `scoring.md` | 채점표. **돌리기 전에 적었다.** 결과를 보고 칸을 더하거나 빼지 않는다 |
| `R3-key.md` | R3 물음 20 의 정답과 기대 층 |

## 대본 JSON 꼴 (replay.js 가 읽는다 — prodev 에 준 규격)
```json
{
  "name": "R2-intake",
  "project": "worktogether",
  "actors": { "PL": "김피엘", "member": "김과제" },
  "bot": "prodev-worktogether-비서",
  "steps": [
    { "id": "s1", "room": "들이기", "author": "member", "text": "@TO(비서) …", "attach": ["data/part_incoming_inspection.csv"], "wait": "bot", "timeout_s": 300 },
    { "id": "s2", "room": "들이기", "author": "member", "text": "…", "wait": "bot",
      "expect": "확정", "then": [ { "id": "s2a", "room": "들이기", "author": "member", "text": "확정", "wait": "bot" } ],
      "else": [ { "id": "s2b", "room": "들이기", "author": "member", "text": "…", "wait": "bot" } ] },
    { "id": "s3", "manual": "봇 세션에서 /compact 를 친다. 끝나면 Enter" },
    { "id": "s4", "room": "본방", "author": "PL", "text": "…", "wait": "none" },
    { "id": "s5", "sleep_s": 30 }
  ]
}
```
- `room`: `본방` · `들이기` · `자료` · `리서치` · `특허` · `논문` · `보고` (replay.js 가 `prodev-<project>[/방]` 이름으로 id 를 찾는다).
- `author`: `PL` 또는 `member`. replay.js 가 계정 토큰으로 바꾼다 (`REPLAY_TOKEN_PL` · `REPLAY_TOKEN_MEMBER`).
- `attach`: 대본 파일 기준 상대 경로. replay.js 가 API 첨부로 올린다 (사람이 올린 것과 같은 경로가 되게).
- `wait`: `bot` 이면 그 방에 봇 글이 올 때까지 기다린다(상한 `timeout_s`, 기본 300). 안 오면 기록에 `"bot": null, "timeout": true`. `none` 이면 안 기다린다.
- `expect`: 봇 답 본문에 대한 정규식. 맞으면 `then`, 아니면 `else` 의 걸음을 이어 돈다. 둘 다 없으면 다음 걸음.
- `manual`: 사람이 할 일을 화면에 내고 Enter 를 기다린다 (재생 기록에 시각과 함께 남긴다).
- `sleep_s`: 그냥 기다린다.
- 기록 JSONL 한 줄 = 한 걸음: `{ id, t_sent, room_id, message_id, bot: { message_id, t, text } | null, timeout, branch: "then"|"else"|null }`. 기록은 `../runs/<날짜>-<대본>.jsonl`.

## 대본 결함 기록 (2026-09-10, R1 첫 시도 중 발견 — 봇의 잘못이 아니다)
- 사람 글에 `@TO(봇)` 을 빼고 쓴 걸음이 있었다. 봇은 설계대로 TO 에만 답하므로 그 글은 답이 안 온다. 전부 붙였다 (R2 7 · R4 3 · R5 2).
- 글 없이 `expect` 만 있는 걸음(R1 s2·s3·s5, R2 s2·s4, R4 s2)은 서버가 400 으로 거절한다. `expect` 는 같은 걸음의 봇 답에 대한 것이므로 앞 걸음에 합쳤다.
- 첫 시도 기록은 `../runs/2026-09-10-R1-첫시도-대본결함.jsonl` 로 남겼다 (s1 과 봇 답 #4 는 유효). 이어 돌리는 판이 `R1b-continue.json` 이고, 깨끗한 판은 `R1-charter.json`.
- 채점표는 손대지 않았다.

## 돌리는 순서와 사람 손
1. T3.1 이 끝난 상태(시험 서버 · 봇 등록 · 방 일곱 · 봇 켜짐)에서 R1 → R2 → R3 → R4 → R5 차례로. 하나가 끝나면 `chat.js tail` 로 봇이 멈춘 것을 보고 다음.
2. R5 만 사람 손이 든다 (`manual` 걸음: `/compact` · 세션 끄기 · 켜기). 나머지는 replay.js 가 끝까지 돈다.
3. 다 돌린 뒤 meta 가 `scoring.md` 를 채운다. 근거는 기록 JSONL · 과제 저장소 파일(카드 · 위키 · reading.md · find.log · rooms.json · journal) · `chat.js` · `retro-cost.js`.
4. 같은 대본을 두 번 돌려 갈리면 "불안정".
