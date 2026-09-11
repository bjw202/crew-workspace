# prodev 진화 시스템 — 실패를 자산으로 바꾸는 방법

> 상태: **설계 메모 / 향후 개선안**  
> 목적: 현업 운용에서 발생하는 실패·불편·수동 개입을 축적하고, 이를 재현 가능한 평가 사례로 바꿔 prodev 자체를 점진적으로 개선한다.  
> 관련: `design/v3/ADR.md`의 **ADR-035 굳는 길**, `design/v3/VERIFICATION.md`, `docs/as-built.md`

---

## 0. 한 줄 목표

**실패를 바로 고치지 않는다. 실패를 얼려서 재현 가능한 case로 만들고, 여러 개선 후보를 과거 case와 공격적 시나리오에서 경쟁시킨 뒤 검증된 것만 승격한다.**

현재 `굳는 길`이 사람의 명시적 지시나 반복 관찰을 통해 **업무 방식 자체를 학습하는 길**이라면, 이 문서는 시스템이 **자기 실패로부터 개선되는 길**을 다룬다.

핵심은 자동 수정이 아니라 아래의 폐쇄 루프다.

```text
실제 업무
   ↓
실패 / 불편 / 수동 개입 / 예상 밖의 좋은 행동
   ↓
Experience Case 저장
   ↓
분류 · 원인 가설 · 증거
   ↓
개선 후보 A/B/C
   ↓
Replay + Regression + Adversarial Test
   ↓
Blind Evaluator
   ↓
Fitness 비교
   ↓
Reject 또는 Promote
   ↓
새 버전
   ↓
다시 실제 업무
```

---

## 1. 왜 필요한가

prodev 같은 agent harness는 일반적인 함수형 프로그램과 다르다.

일반 코드에서는 대개 다음이 가능하다.

```text
input → deterministic function → expected output
```

하지만 prodev의 실제 작업은 다음과 같다.

```text
사용자 요청
 → 문맥 해석
 → skill 선택
 → 자료 탐색
 → 판단
 → 필요 시 subagent 호출
 → 파일 작성
 → 사용자 확인
 → 후속 행동
```

같은 입력에서도 경로가 조금씩 달라질 수 있고, 결과의 품질도 단순 `pass/fail` 하나로 설명하기 어렵다.

따라서 unit test만으로는 충분하지 않다. 실제 현업에서 드러나는 실패를 **scenario-based evaluation corpus**로 축적해야 한다.

---

## 2. 첫 번째 원칙 — 실패를 바로 고치지 않는다

현업에서 문제가 발생하면 가장 쉬운 반응은 곧바로 prompt나 skill에 규칙 한 줄을 추가하는 것이다.

```text
F-001 발생 → prompt 한 줄 추가
F-002 발생 → 또 한 줄 추가
F-003 발생 → 또 추가
...
```

이 방식은 시간이 지나면 규칙 충돌, 예외 증가, 긴 지침, 느린 판단으로 이어진다.

따라서 먼저 실패 당시 상태를 **case로 동결**한다.

예:

```yaml
case_id: F-0042
kind: failure
project: cooling-module
task: "특허 선행기술 조사 후 차별점 정리"

expected:
  - 기존 프로젝트 자료 우선
  - 최신 특허 검색
  - 근거 citation 포함

observed:
  - 오래된 wiki를 최신 정보로 오인
  - 신규 실험 결과 누락

human_intervention:
  text: "2026-09 결과가 있는데 왜 2026-05 자료를 기준으로 했나?"
  required: true

severity: high
```

가능하면 다음도 함께 남긴다.

- 당시 사용자 요청
- 관련 room/message id
- 사용 skill
- 참조한 파일 목록
- 검색 결과 또는 retrieval trace
- subagent 호출 여부
- 생성 산출물
- 사람의 수정 내용
- 당시 prodev commit/version
- 사용 model과 주요 설정

목적은 **나중에 같은 실패를 다시 재생할 수 있게 하는 것**이다.

---

## 3. 두 번째 원칙 — Observation과 Cause를 분리한다

LLM은 실패를 보면 즉시 그럴듯한 원인을 설명할 수 있다. 그러나 설명이 맞다는 보장은 없다.

예를 들어 증상이 다음과 같다고 하자.

> 오래된 정보를 사용했다.

가능한 원인은 여러 개다.

```text
retrieval ranking 문제
index freshness 문제
instruction 누락
context 주입 실패
skill routing 오류
agent 판단 오류
자료 자체의 날짜 표현 문제
```

따라서 case에는 **관찰된 사실과 원인 가설을 분리**한다.

```yaml
observation:
  - "2026-05 wiki를 근거로 사용"
  - "2026-09 실험카드는 index에 존재"

hypotheses:
  - cause: retrieval_ranking
    evidence:
      - "최신 카드가 검색 결과 8위"
    confidence: 0.8

  - cause: instruction_ambiguity
    evidence:
      - "skill에 최신성 우선 규칙이 없음"
    confidence: 0.5
```

`cause`는 판정이 아니라 **검증해야 할 가설**이다.

---

## 4. 세 번째 원칙 — 개선 방법의 종류를 제한한다

문제가 생길 때마다 모두 prompt로 고치지 않는다.

개선 후보는 우선 다음 범주 중 어디에 속하는지 결정한다.

| 종류 | 질문 | 예 |
|---|---|---|
| Instruction | 판단 기준이 부족한가? | skill 규칙 추가 |
| Context | 필요한 정보가 들어오지 않았는가? | session-start 주입 변경 |
| Retrieval | 찾는 방법이 잘못됐는가? | index/ranking/search 수정 |
| Mechanical Guard | 기계적으로 막을 수 있는가? | hook/script 검증 |
| Architecture | 흐름이나 역할 자체가 잘못됐는가? | 승인 지점/agent 역할 변경 |
| Model | 현재 모델 능력 한계인가? | 모델/추론 강도 변경 |

현재 prodev 원칙을 그대로 적용한다.

> **세고 막는 것은 기계가 하고, 판단하는 것은 지침이 한다.**

예를 들어 Claude가 파일 개수를 자꾸 틀린다면:

```text
나쁜 개선:
"파일을 정확하게 세어라"를 CLAUDE.md에 추가

좋은 개선:
count.js 결과를 사용하도록 한다
```

---

## 5. 네 번째 원칙 — 단일 실패보다 Pattern을 고친다

한 사건마다 바로 구조를 바꾸지 않는다.

```text
Failure Inbox
    ↓
분류
    ↓
Clustering
    ↓
반복 Pattern
    ↓
상위 문제 정의
```

예를 들어 15건이 쌓였다고 하자.

```text
6건 — 최신 정보 판단 실패
4건 — 사람 확인 없이 진행
3건 — 중간 결과 유실
2건 — formatting 문제
```

그러면 첫 번째 6건에 대해 개별 예외를 추가하기보다 다음과 같은 상위 문제를 찾는다.

> **Temporal source authority가 시스템에 명시되어 있지 않다.**

좋은 진화는 사건을 제거하는 것이 아니라 **사건을 만들어내는 구조를 제거하는 것**이다.

단, severity가 매우 높은 안전/데이터 손상/권한 문제는 즉시 mechanical guard를 추가할 수 있다.

---

## 6. Experience DB — 실패만 모으지 않는다

진화 데이터는 두 종류를 모은다.

### 6.1 Failure Case

- 잘못된 결과
- 사람의 수정이 필요했던 경우
- 중간 작업 유실
- 잘못된 자료 선택
- 과도한 질문
- 불필요한 재작업
- 잘못된 승인/행동
- latency/cost가 비정상적으로 컸던 작업

### 6.2 Positive Surprise

예상하지 않았지만 가치가 높았던 행동도 저장한다.

```yaml
case_id: P-0017
kind: positive_surprise
behavior: cross_domain_linkage
observed:
  - "실험 결과가 특허 novelty와 연결됨을 스스로 발견"
  - "관련 patent wiki 갱신을 제안"
value: high
reason:
  - "PL의 별도 조정 작업을 줄임"
```

진화는 오류 제거만이 아니다.

```text
failure        → 무엇을 줄일 것인가
positive case  → 무엇을 강화할 것인가
```

---

## 7. Case 저장 구조 제안

초기에는 가볍게 시작한다.

```text
evolution/
  cases/
    failures/
      F-0001/
        case.md
        request.txt
        result.md
        artifacts.txt
    positives/
      P-0001/
        case.md
  clusters/
  candidates/
  evals/
```

처음부터 대규모 데이터베이스를 만들 필요는 없다.

Markdown + git으로 충분하다. 나중에 case가 많아지면 JSON index를 추가한다.

case의 최소 공통 필드는 다음 정도면 된다.

```yaml
id:
kind: failure | positive_surprise
created_at:
project:
prodev_version:
severity:

trigger:
expected:
observed:
human_intervention:

related_files:
related_messages:

hypotheses:
status: captured | analyzed | regression | resolved
```

---

## 8. 개선안은 하나가 아니라 경쟁시킨다

Pattern 하나에 대해 가능하면 하나의 fix에 바로 결론 내리지 않는다.

```text
               Failure Cluster
                      │
              ┌───────┼───────┐
              ▼       ▼       ▼
            Fix A   Fix B   Fix C
            skill    hook   retrieval
             rule    guard    change
```

각 후보는 별도 branch/worktree 또는 임시 검증 환경에서 평가한다.

예:

| | Baseline | A | B | C |
|---|---:|---:|---:|---:|
| historical pass | 81% | 94% | 97% | 95% |
| human intervention | 24% | 14% | 10% | 12% |
| false block | 2% | 3% | 8% | 2% |
| token cost | 1.00 | 1.40 | 1.05 | 1.80 |
| latency | 1.00 | 1.20 | 1.03 | 1.70 |
| complexity | low | medium | low | high |

성공률 하나만 보고 고르면 안 된다.

---

## 9. Fitness — 무엇을 좋아진 것으로 볼 것인가

prodev의 개선 정도를 하나의 정확한 숫자로 환원할 필요는 없다. 다만 방향을 잃지 않도록 공통 척도는 필요하다.

개념적으로는 다음과 같다.

```text
Fitness =
    Task Success
  + Human Acceptance
  + Evidence Quality
  + Recovery Ability
  + Useful Initiative

  - Human Intervention
  - False Blocking
  - Token Cost
  - Latency
  - Added Complexity
```

특히 중요한 운영 지표는 **Human Intervention Rate**다.

```text
초기
100 tasks / 34 corrections
→ intervention rate = 34%

3개월 후
100 tasks / 11 corrections
→ intervention rate = 11%
```

사람이 관여하면 무조건 나쁜 것은 아니다. 모델 선택, 결재, 범위 확정처럼 **의도적으로 남겨 둔 human gate**는 제외한다.

측정해야 하는 것은 **원래 스스로 처리했어야 하는데 사람이 구제한 비율**이다.

---

## 10. Replay Harness

과거 case는 시간이 지나면 regression suite가 된다.

```text
eval/
  retrieval/
    stale-source-001
    conflicting-source-002
  recovery/
    compact-mid-task-001
    restart-002
  approval/
  research/
  analysis/
  schedule/
  report/
  adversarial/
```

새 버전은 과거 실패를 다시 통과해야 한다.

```text
183 historical cases

v0.8 → 164 pass
v0.9 → 176 pass
v1.0 → 181 pass
```

단, 과거 case만 통과하도록 최적화하면 overfitting이 생긴다.

그래서 두 종류의 평가가 필요하다.

```text
Historical Regression
+
Unseen / Adversarial Scenario
```

---

## 11. Adversarial Test — 일부러 깨뜨린다

정상 시나리오만 돌리면 agent system의 실제 약점이 잘 드러나지 않는다.

meta는 다음과 같은 failure injection을 만들어낼 수 있다.

- compact가 작업 중간에 발생
- Claude session 종료 후 resume
- miniDiscord 재시작
- bot reconnect
- 중복 message 전달
- 오래된 index
- 파일 일부 누락
- 서로 충돌하는 자료 두 개
- 잘못된 room의 자료
- 사람의 지시가 중간에 변경됨
- subagent 실패
- tool timeout
- 사람이 답하지 않은 채 다음 요청을 보냄
- 같은 이름의 새 버전 파일
- 이전 결정을 뒤집는 신규 데이터

중요한 것은 “잘 답했나”뿐 아니라:

```text
실패를 알아챘는가
무엇을 모르겠는지 표시했는가
잘못된 행동을 멈췄는가
중간 상태를 잃지 않았는가
재시작 뒤 이어갈 수 있는가
사람에게 필요한 것만 물었는가
```

를 본다.

---

## 12. Meta의 역할 — Optimizer와 Evaluator를 분리한다

현재 `meta → prodev` 구조는 강력하지만, 같은 Claude 계열이 설계·수정·검증을 모두 하면 같은 blind spot을 공유할 수 있다.

완전히 다른 시스템을 만들 필요는 없다. 최소한 **정보를 분리**한다.

```text
                  Experience DB
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   Improvement Meta            Evaluator
          │                         │
     후보 수정                    blind test
          │                         │
          └────────────┬────────────┘
                       ▼
                    Promote?
```

Evaluator에는 가능하면 다음을 숨긴다.

- 어떤 수정이 들어갔는지
- 개발자가 기대하는 결과
- 어떤 failure를 겨냥한 변경인지

Evaluator가 받는 것은:

- scenario
- 성공 조건
- 실제 trace/artifact

정도로 제한한다.

즉 **optimizer가 자기 시험 문제와 채점 기준을 동시에 만들지 않게 한다.**

---

## 13. Promotion Gate

진화는 production에 직접 쓰지 않는다.

```text
candidate change
   ↓
unit / static checks
   ↓
historical replay
   ↓
adversarial scenarios
   ↓
blind evaluation
   ↓
regression / cost 확인
   ↓
meta verification
   ↓
workspace manifest 승격
```

현재 `workspace.json`이 검증된 child repo commit 조합을 pin하는 구조라면, 이를 그대로 **selection gate**로 사용할 수 있다.

즉 workspace manifest의 의미를 다음처럼 확장한다.

> “현재 가장 최신 commit”이 아니라  
> **“현재 검증을 통과하여 현업 사용을 허용한 조합”**

이 원칙은 유지한다.

---

## 14. 개선이 오히려 나빠지는 것을 막는다

Agent system은 한 failure를 막기 위해 규칙을 추가했다가 다른 업무가 경직되는 경우가 많다.

대표적인 부작용:

- 질문이 지나치게 많아짐
- false block 증가
- every task에 불필요한 확인 단계 추가
- context가 너무 길어짐
- latency/token cost 상승
- 특정 case에만 맞춘 prompt overfitting
- 서로 충돌하는 instruction 증가

따라서 모든 개선 후보에는 **부작용 가설**도 적는다.

```yaml
candidate: C-0012
change: "최신 자료 우선 규칙 추가"

expected_gain:
  - stale source 감소

possible_regression:
  - 최신 자료가 draft일 때 확정 자료보다 잘못 우선될 수 있음
  - 날짜가 품질보다 과도하게 중요해질 수 있음
```

그리고 regression test는 원래 문제가 아닌 영역에서도 돌린다.

---

## 15. Prompt Entropy를 관리한다

진화 시스템의 가장 쉬운 실패는 지침이 계속 길어지는 것이다.

주기적으로 다음을 확인한다.

```text
새 규칙이 기존 규칙의 특수 사례인가?
기계적으로 옮길 수 있는가?
두 규칙을 하나의 상위 원칙으로 합칠 수 있는가?
실제 case가 아직 존재하는가?
더 이상 필요 없는 규칙인가?
```

좋은 진화는 instruction의 개수를 늘리는 것이 아니라 **같거나 더 적은 규칙으로 더 많은 실패를 설명하는 방향**이어야 한다.

가능하면 다음 순서를 선호한다.

```text
많은 예외 규칙
   ↓
공통 원인 발견
   ↓
하나의 상위 원칙 또는 mechanical mechanism
```

---

## 16. 추천 단계별 구현

### Phase 1 — Capture

먼저 자동 개선은 하지 않는다.

목표:

- failure case 저장
- positive surprise 저장
- human intervention 표시
- prodev version 기록

현업에서 20~50건 정도의 실제 사례를 모은다.

### Phase 2 — Review

meta가 주기적으로 case를 읽고:

- cluster
- severity
- root-cause hypothesis
- 반복 pattern

을 만든다.

사람은 “어떤 문제를 고칠 것인가”만 승인한다.

### Phase 3 — Candidate + Replay

meta가 개선 후보를 만들고 prodev branch/worktree에서 적용한다.

과거 case를 replay한다.

이 단계부터 간단한 scorecard를 만든다.

### Phase 4 — Blind Evaluation

수정 내용을 모르는 별도 evaluator session이 scenario와 결과만 평가한다.

### Phase 5 — Automatic Promotion Proposal

조건을 통과하면 meta가 승격을 **제안**한다.

처음에는 자동 merge하지 않는다.

충분한 운용 데이터가 쌓인 뒤 위험도가 낮은 변화부터 자동 승격 범위를 늘린다.

---

## 17. 사람이 계속 맡아야 할 것

진화 시스템의 목적은 사람을 제거하는 것이 아니다.

사람이 맡는 것이 좋은 영역:

- 무엇을 중요한 실패로 볼 것인가
- 업무상 가치가 무엇인가
- 모델 선택/물리 모델/핵심 가정
- 조직 규칙과 권한
- 큰 architecture 변경
- 새로운 기능의 목적
- 높은 위험도의 promotion

AI가 잘 맡을 수 있는 영역:

- case 정리
- 유사 사례 clustering
- 원인 가설 생성
- candidate fix 생성
- regression scenario 생성
- replay 실행
- 결과 비교
- change 영향 분석

즉 사람은 **fitness landscape를 정의하고**, AI는 그 안에서 가능한 변이를 빠르게 탐색한다.

---

## 18. 최종 그림

```text
                         REAL WORK
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
          Failure                    Good Surprise
             │                             │
             └──────────────┬──────────────┘
                            ▼
                     Experience DB
                            │
                    cluster / analyze
                            │
                            ▼
                      META Designer
                            │
                   candidate mutations
                       A / B / C
                            │
                            ▼
                     Replay Harness
                            │
              historical + adversarial
                            │
                            ▼
                     Blind Evaluator
                            │
                            ▼
                      Fitness Score
                            │
                  ┌─────────┴─────────┐
                  ▼                   ▼
               Reject             Promote
                                      │
                                      ▼
                              workspace.json
                                      │
                                      ▼
                                  REAL WORK
```

---

## 19. 장기적으로 생기는 자산

처음에는 실패 기록 몇 개일 뿐이다.

그러나 실제 업무를 계속하면 다음이 쌓인다.

```text
현업 failure corpus
+ 실제 사용자 correction
+ successful behavior corpus
+ regression suite
+ adversarial scenarios
+ 개선 history
+ fitness history
```

이것이 장기적으로는 코드 자체보다 더 중요한 자산이 될 수 있다.

같은 Claude 모델을 사용하는 다른 시스템이 있어도, **실제 조직에서 발생한 실패와 성공을 수개월 동안 축적한 eval corpus**는 쉽게 복제할 수 없다.

결국 prodev의 경쟁력은 특정 prompt가 아니라 다음 세 가지가 된다.

1. 실제 업무를 수행하는 harness
2. 업무 경험을 보존하는 project memory
3. 실패와 성공을 이용해 harness 자체를 개선하는 evolution loop

---

## 20. 이 문서의 원칙

현재 설계를 당장 바꾸기 위한 문서가 아니다.

현업 운용에서 실제 failure case가 충분히 쌓인 뒤, 이 문서를 다시 보고 필요한 부분만 구현한다.

특히 초기에는 다음을 피한다.

- 자동 자기수정
- 자동 production merge
- 복잡한 점수 시스템
- 거대한 eval 플랫폼
- failure counter를 위한 별도 상태 시스템
- 모든 행동 telemetry화

먼저 **사례를 모으고 사람이 읽어도 이해되는 형태로 보존한다.**

그 다음 반복되는 문제가 실제로 보일 때 한 단계씩 자동화한다.

> **진화의 출발점은 자동화가 아니라 관찰이다.**
