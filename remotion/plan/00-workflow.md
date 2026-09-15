# 영상 제작 워크플로우 — cockpit + prodev 구조 설명

총감독: meta 세션. 만들지 않고, 지시하고, 검수한다.

## 목적

cockpit 이 무엇이고(웹 조종석이 Claude Code CLI 를 봇으로 띄워 사람과 한 방에서 대화한다),
prodev 가 무엇이며(그 봇에 실리는 비서 하네스 — 스킬·훅·에이전트·지식 축적·압축 이어가기·커스터마이징),
둘이 어떻게 맞물리는지를 **말보다 그림으로** 보여 주는 영상. Remotion 으로 만든다.

## 독자와 기준

- 독자: 이 저장소를 처음 보는 개발자. Claude Code 는 써 봤다.
- 기준 셋
  1. **적확함.** 실제 파일·함수·옵션 이름이 화면에 나온다 (`query()`, `bot_inbox`, `#kick`, `pre-compact.js` …). 코드에서 확인된 사실만 쓴다. `01-facts.md` 밖의 사실은 코드 경로를 적고 쓴다.
  2. **추상적이지 않음.** 장면마다 "무엇이 무엇에게 무엇을 보낸다"가 화면에서 보인다. 개념어만 떠 있는 장면은 반려.
  3. **말 적게.** 자막·나레이션은 장면당 두 문장 이내. 나머지는 움직임이 말한다.

## 1차 자료 — README 셋

사람이 공들여 쓴 README 셋이 이 영상의 1차 자료다. 기획·콘티·구현 모두 절 몇 개가 아니라 전문을 읽는다.
안의 mermaid 그림은 검증된 시각 모델이므로 장면의 발판으로 삼고, 영상의 용어는 README 의 용어(방 · 봉투 · 켜기 · 들이기 · 카드 · 확정 · 이어서 합니다)와 같게 한다.

| 문서 | 무엇이 있나 |
|---|---|
| `crew-workspace/README.md` | 저장소 지도 · cockpit↔prodev · 방 만들기 sequence · 켜기 옵션 표 · 스킬은 cwd 로 · 받는 길 둘 |
| `cockpit/README.md` | 조각 그림(브라우저 · serve · DB 둘 · manager · sdk-query · CLI · MCP · setup.js) · 글 흐름 sequenceDiagram |
| `prodev/README.md` | 전체 구조 · 워크플로우 ①~⑧ · 방 만들기 흐름 |

## 자리

| 무엇 | 어디 |
|---|---|
| 사실 묶음 (코드로 확인된 것) | `remotion/plan/01-facts.md` |
| 기획 (무엇을 어떤 순서로 설명하나) | `remotion/plan/02-plan.md` |
| 콘티 (장면마다 화면·움직임·자막·초) | `remotion/plan/03-storyboard.md` |
| 구현 가이드 (컴포넌트·색·글꼴·타임라인) | `remotion/plan/04-implementation.md` |
| 검수 기록 | `remotion/plan/review/<날짜>-<단계>.md` |
| Remotion 코드 | `remotion/` (plan 밖) — **remotion 세션만 쓴다** |

## 흐름과 관문

```
[A 기획] 기획 서브에이전트 ──02-plan.md──▶ meta 검수 ──반려/통과──▶
[B 콘티] 콘티 서브에이전트 ──03-storyboard.md + 04-implementation.md──▶ meta 검수 ──▶
[C 구현] remotion 세션 ──장면 단위로 코드──▶ meta 가 still/렌더로 검수 ──▶
[D 완성] 전체 렌더 → 사람 시사
```

- 관문마다 채점표를 **돌리기 전에** 적는다 (`review/` 에 날짜와 함께).
- 만드는 쪽에 판정을 맡기지 않는다. 기획자도 콘티 작성자도 remotion 세션도 자기 채점표를 채우지 않는다.
- 기획자·콘티 작성자는 코드를 **읽는다** (`../cockpit/`, `../prodev/`). 고치지 않는다.
- remotion 세션은 `remotion/plan/` 을 읽고 `remotion/` 안에만 쓴다. `../cockpit/`, `../prodev/` 는 손대지 않는다.

## 역할

| 역할 | 누구 | 입력 | 출력 |
|---|---|---|---|
| 총감독 | meta 세션 | 사람의 요구 | 지시 · 채점표 · 판정 |
| 기획 | 서브에이전트 (general-purpose · model opus — 사람 지시 2026-09-15, 이후 모든 서브에이전트) | 01-facts.md, cockpit/prodev 코드·README | 02-plan.md |
| 콘티 | 서브에이전트 (general-purpose) | 02-plan.md, 01-facts.md | 03-storyboard.md, 04-implementation.md |
| 구현 | remotion 세션 (`remotion [8a9e36]`) | 03, 04 | `remotion/src/**` |
| 시사 | 사람 | 렌더 mp4 | 받아들임/고침 요구 |
