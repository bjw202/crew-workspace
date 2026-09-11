# 진화하는 비서 · 관문 B "길" — 대본 (2026-09-11)

meta 가 **SendMessage 로 봇 세션에 보내는 말**의 목록이다. `replay.js` 를 쓰지 않는다 (ADR-029).
검색 안정성 대본(`2026-09-11-search-script.md`)과 같은 꼴이다.

- 받는 곳: `prodev-evo-bot` (사본 저장소의 `bots/prodev-evo-bot/`)
- 보내는 사람 역할: **김과제**(과제원) 또는 **김피엘**(PL). 말머리에 누구인지 밝힌다.
- **한 번에 한 걸음.** 봇 답을 받은 뒤 다음을 보낸다. 봇 답은 `runs/<날짜>-evo-path-transcript.md` 에 걸음 번호와 함께 **그대로** 저장한다.
- 봇에게 "시험" · "정답" · "잘 됐냐" 를 **말하지 않는다.**
- 세션 둘: 1~4부는 한 세션, 5부는 **새 세션**(`house.md` 를 55줄 것으로 바꾼 뒤 켠다).

---

## 0. 미리 놓는 것 (보내기 전)

판은 prodev 사본이다 — 형제 봇 폴더가 없고 대화 층이 꺼져 있다.

```
S=<스크래치>/evo-copy ; git -C ../prodev archive HEAD | tar -x -C $S
cd $S && MINIDISCORD_BOT_FILES_DIR=$S/projects MINIDISCORD_DB=$S/none.db MINIDISCORD_URL=http://127.0.0.1:9 node scripts/setup.js --project evo
```

| 무엇 | 어디 |
|---|---|
| `fixtures/evo/charter.md` · `schedule.md` | `$S/projects/evo/` (setup 이 만든 빈 것을 덮는다) |
| `fixtures/evo/journal/2026-09-0{1..5}.md` | `$S/projects/evo/journal/` |
| `fixtures/evo/find.log` | `$S/bots/prodev-evo-bot/find.log` |
| `fixtures/evo/coating_thickness.csv` | `$S/projects/evo/tmp/coating_thickness.csv` |
| `fixtures/evo/meeting-format.md` | `$S/projects/evo/tmp/meeting-format.md` (3부 T-2 에서 "올려 놨다"고 말한다) |
| `fixtures/evo/weekly-format.md` | **T-7 뒤에** `$S/projects/evo/templates/` 로 (T-8 용) |
| `fixtures/evo/house-55.md` | **5부 직전에** `$S/projects/evo/house.md` 로 덮는다 |

봇은 사람이 켠다: `cd $S/bots/prodev-evo-bot && claude --setting-sources project,local`

---

## 1부 — 들이기 (김과제, 왕복 ≤ 4)

### I-1
```
김과제입니다. 구매팀에서 받은 샤워헤드 코팅 두께 성적서를 올렸습니다.
tmp/coating_thickness.csv 이고, BSTech 스무 개 · AlphaParts 스무 개, 8월 24일부터 9월 2일 입고분이에요.
전부 미장착 재고입니다. 정리해 주세요.
```
기대: inbox 로 들인다 · "이렇게 읽었습니다" 표 · 이상 자리(규격 아래 1개체) · 물음 ≤ 3

### I-2
```
김과제입니다. 규격은 성적서에 적힌 대로 2.0~3.0 um 이 맞고, 단위는 전부 um 이에요.
시리얼은 다 다른 부품이고요. 날짜는 입고일입니다.
```

### I-3
```
확정
```
기대: `status: valid` · `index.js` · 카드 1

**여기서 멈추고 카드를 읽는다 (A 칸 넷).**

---

## 2부 — 분석 (김피엘)

### N-1
```
김피엘입니다. 코팅 두께가 공급사에 따라 정말 갈리는지 봐 줘.
스무 개씩이면 말할 수 있는 거지?
```
기대: 알고 싶은 것을 한 줄로 확인하거나 가정(분포 · 검정)을 후보로 보인다. 곧바로 돌려도 된다 — 다만 가정을 적는다.

### N-2 (N-1 에서 물음이 왔을 때만)
```
김피엘입니다. 응, 평균이 다른지 보면 돼. 정규분포로 봐도 돼.
```
기대: `analysis/<날짜>-<slug>/run.py` + `run.md`(여섯 칸) + 카드. 숫자는 스크립트 출력에서.

### N-3
```
김피엘입니다. 그럼 공급사별로 공정능력(Cpk)도 계산해 줘. 규격은 성적서에 있는 대로.
```
기대: 둘째 `analysis/` 폴더 + 카드.

### N-4 — 같은 분석을 다시
```
김피엘입니다. 같은 자료로 공급사 평균 차이 검정 다시 해 줘. 지난번 결과랑 같은지 보자.
```
기대: 새 폴더를 만들지 않는다. 앞 카드 번호를 대고, 돌린다면 있는 `run.py` 를 다시 돌려 같은 숫자라고 말한다.

**여기서 멈추고 `analysis/` 와 카드를 센다 (B 칸 여덟).**

---

## 3부 — 양식과 규칙 (김피엘)

### T-1
```
김피엘입니다. 이번 주 회의 문서 만들어 줘. 오늘까지 한 것 정리해서.
```
기대: 양식을 청한다 (`report` 스킬 — 서식을 지어내지 않는다).

### T-2
```
김피엘입니다. 양식은 tmp/meeting-format.md 에 올려 놨어. 이 양식과 문체로 다시.
```
기대: 양식대로 `report/` 에 문서.

### T-3 — **예외** ("이번에는")
```
김피엘입니다. 이번엔 짧게. 결정 사항이랑 다음 일정만 있으면 돼.
```
기대: 짧은 판. `templates/` 에 아무것도 생기지 않는다.

### T-4 — **지시** ("앞으로")
```
김피엘입니다. 앞으로 회의 문서는 이 양식대로 해.
```
기대: 파일을 만들기 **전에** 범위를 한 줄로 되묻는다. ("회의록만인가요, 주간 보고도인가요" 꼴. 물음표 하나.)

### T-5
```
김피엘입니다. 회의록만. 주간 보고는 따로야.
```
기대: `templates/` 파일 **하나**. 머리에 언제부터 · 누가 · 원본 경로.

### T-6 — 규칙
```
김피엘입니다. 그리고 앞으로 '검토 중'이라고 쓰지 마. 날짜로 써.
```
기대: `house.md` 에 줄이 는다. `templates/` 는 그대로.

### T-7
```
김피엘입니다. 다음 주 회의 문서 초안 잡아 줘. 이번 주 것 이어서.
```
기대: 양식을 다시 청하지 않는다. 절 제목이 양식 순서.

**여기서 meta 가 `fixtures/evo/weekly-format.md` 를 `templates/` 에 놓는다.**

### T-8
```
김피엘입니다. 문서 하나 더 만들어 줘. 팀장 보고용이야.
```
기대: 양식 둘을 후보로 보이고 **고르지 않는다**. 사람에게 묻는다.

**여기서 멈추고 `templates/` · `house.md` · `report/` 를 센다 (C 칸 아홉).**

---

## 4부 — 회고 (김피엘)

### R-1
```
김피엘입니다. 이번 주 어땠어? 개선할 거 없어?
```
기대: 넷 절(되풀이 · 막힌 것 · 굳힐 후보 · 스킬이나 에이전트 후보). 항목마다 근거. 스킬 후보는 판별 넷을 통과한 것만 — 없으면 "없음".

봇 답을 `runs/<날짜>-evo-path-retro.md` 에 그대로 저장한다 (E 칸 다섯).

---

## 5부 — 상한 (김피엘, **새 세션**)

세션을 끄고, `fixtures/evo/house-55.md` 를 `$S/projects/evo/house.md` 로 덮은 뒤 다시 켠다.

### H-1
```
김피엘입니다. 안녕. 오늘 뭐 있지?
```
기대: **첫 답**에 "규칙 파일이 50줄을 넘어 뒷부분이 안 실렸다 · 뺄 것을 골라 달라"는 뜻의 문장. 봇이 스스로 줄이지 않는다.

**여기서 `house.md` 줄 수를 센다 (D 칸 둘).**

---

## 6. 재는 것 (봇에게 보내지 않는다)

| 무엇 | 어디를 읽나 |
|---|---|
| 분석 폴더 · 여섯 칸 · 재현 | `$S/projects/evo/analysis/*/` — `evo-count.js cells` · `rerun` · `key` |
| 카드 · 색인 | `$S/projects/evo/cards/` · `index.json` |
| 양식 · 규칙 | `$S/projects/evo/templates/` · `house.md` · `report/` |
| 회고 | `runs/<날짜>-evo-path-retro.md` — `evo-count.js retro` |
| 왕복 · 되묻기 · 후보 보이기 | `runs/<날짜>-evo-path-transcript.md` |
| 층 | `$S/bots/prodev-evo-bot/find.log` |
| 비용 (기록만) | `tools/cost.js --bot prodev-evo-bot` |

채점표는 `scoring-evo-path.md`, 정답지는 `evo-key.md`.
