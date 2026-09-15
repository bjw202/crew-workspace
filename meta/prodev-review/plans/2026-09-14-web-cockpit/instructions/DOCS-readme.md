# meta → cockpit 지시 · 문서 회차 D3 — README 제로베이스 · ARCHITECTURE_EXPLANATION (2026-09-15 02:50)

cockpit 세션이 읽는 지시문. 코드는 고치지 않는다 — 문서 둘만. 판정은 meta(새 클론에서 README 를 그대로 밟는다).

## 1. 사람이 원하는 것 (말을 옮김)
- **README.md** 를 제로베이스에서 다시 쓴다: `git clone` 뒤부터 동작까지, **중학생도 따라 할 수 있게**, 실제 셋업 · 사용법 · 사용 시나리오 예시까지.
- **docs/ARCHITECTURE_EXPLANATION.md** 를 새로 쓴다: cockpit 전체 구조와 **어떤 식으로 통신하고 돌아가는지**. 사람은 Agent SDK 를 처음 쓴다. 이미 `~/orca/projects/agent-sdk-study/index.html`(SDK 공방 — 주방 · 셰프 · 조리대 · 수셰프 · 검수대 비유)로 SDK 일반을 공부했으니, **그 비유를 이어받아 우리 구조에서는 어떻게 돌아가는지** 설명한다. 중학생 수준.
- **서브에이전트(opus)를 충분히 써라.** 쓰는 이와 검토하는 이를 가른다.

## 2. 어떻게 만들 것인가
서브에이전트 넷 이상, 모델은 opus:
1. **코드 조사자** — `src/` · `bin/` · `web/` · `smoke/` · `docs/ARCHITECTURE.md` · `ADR.md` 를 읽고 "개념 → 파일 · 함수 · 실제 메시지 예" 표를 사실로만 만든다(추측 금지, 줄 번호).
2. **README 작성자** — 1 의 표와 `docs/INSTALL-WINDOWS.md` · 지금 README 를 바탕으로 제로베이스 걸음을 쓴다. 걸음마다 "친다:" 와 "이렇게 보이면 됨:"(기대 출력 한 줄). 맥(zsh)과 윈도우(PowerShell) 나란히. 시나리오 넷 이상은 **복사해 붙일 수 있는 실제 입력 글**과 기대 결과.
3. **EXPLANATION 작성자** — `~/orca/projects/agent-sdk-study/index.html` 을 읽고(읽기만) 그 비유 어휘를 우리 부품에 대응시킨다. mermaid 그림 다섯 이상(큰 그림 · 글 한 번 왕복 sequence · 승인 카드 sequence · 세션 수명 state · 재기동 resume · 하네스 로딩). 통신 경로 넷(브라우저↔서버 HTTP/SSE · 서버↔CLI SDK 메시지 · CLI↔하네스 파일/훅 · 봇↔방 reply/fetch_history)마다 실제 메시지 한 토막.
4. **검토자 둘** — ⓐ **사실 검토**: 두 문서의 문장을 코드와 대조해 틀린 것을 표로 돌려준다(작성자에게 넘기고 고침). ⓑ **중학생 독자**: 두 문서를 처음 읽는 사람으로서 "모르는 말 · 건너뛴 걸음 · 따라 하다 막히는 자리" 를 목록으로 — 작성자가 전부 풀이 · 보강한 뒤 다시 읽힌다(두 바퀴).
사실은 코드 · ADR · as-built 에서만. 예측 · 채점표 · runs 는 안 본다.

## 3. 꼭 들어갈 것
**README**: 필요한 것 다섯(Node ≥ 22.13 · Git · Claude Code 설치 + 로그인 · prodev 클론이 형제 자리 · 공백 없는 경로, 각각 확인 명령) · 번호 걸음 ≥ 15(clone → npm ci → cockpit.json → check → init-admin · add-user → serve → 브라우저 로그인 → `+` 로 방 만들기 → 켜기 → 첫 글 → 첫 답) · 용어 풀이 아홉(봇 · 방 · 봉투 `@TO` `@CC` · 승인 카드 · 조종석 판 · 세션 · 압축 · 이어 붙기 · 과제 폴더) · 시나리오 ≥ 4 · 막혔을 때 다섯(로그인 안 됨 · 봇 안 뜸 · 승인 카드 안 옴 · 옛 화면 · `check` ✗) · 계정 관리(`init-admin` · `add-user` · API 셋 · 비밀번호 바꾸기) · 판 올리기. 지금 README 의 사실(설정 키 · 명령 표)은 잃지 않는다. 길이 ≤ 600줄.
**ARCHITECTURE_EXPLANATION**: 한 줄 답("이것은 Claude Code 세션이다 — 서버가 대신 켜고 붙들 뿐") · 등장인물(사람 · 브라우저 · cockpit 서버 · Claude Code CLI · 봇 폴더 · 과제 폴더) · 주방 비유 대응표 ≥ 10 행(query · 입력 스트림 · resume · settingSources · CLAUDE.md · 훅 · MCP `reply` · `canUseTool` · 서브에이전트 · 압축 · 값) · 코드 자리 표 ≥ 12 · 통신 경로 넷 · FAQ ≥ 8(왜 세션이 안 죽나 · 값이 재기동 뒤 0 부터 · 승인 10분 · 봉투 없는 글 · 파일방 없음 · 봇이 못 보는 것 · 압축 때 · MCP 는 차이가 아니다 · 도우미 · 한 턴에 한 일). 길이 ≤ 700줄.
**둘 다**: 낯선 말(SDK · MCP · SSE · CSP · resume · 훅 · 봉투)은 첫 등장에 한 줄 풀이. 문장은 짧게. 절마다 예 하나 또는 그림 하나. ADR 번호 · 파일 경로로 근거.

## 3.1 그림 (사람이 03:05 에 더함 — "mermaid 로 충분히 시각적으로 설명했는지도 검수한다")
수만 채우지 말고 **그림만 보고도 흐름을 말할 수 있어야** 한다. 그림마다:
1. 바로 위에 "이 그림은 무엇을 보여 주나" 한 문장.
2. 등장인물 이름은 본문과 같게(사람 · 브라우저 · cockpit 서버 · Claude Code CLI · 봇 폴더 · 과제 폴더). 별명을 새로 만들지 않는다.
3. 화살표에는 **실제 이름**을 적는다 — HTTP 길(`POST /api/rooms/:id/messages`) · SSE 사건(`message` · `session_event` · `permission_request`) · SDK 메시지 종류(`system init` · `assistant` · `tool_use` · `result` · `compact_boundary`) · 도구 이름(`mcp__cockpit__reply`) · 파일 이름(`CLAUDE.md` · `settings.local.json` · `handoff-compact.md`). "요청" · "응답" 같은 빈 말은 안 된다.
4. 한 그림에 마디 12 이하. 넘치면 둘로 가른다.
5. 종류가 뜻에 맞게: 구조 · 흐름은 `flowchart LR/TB`, 시간 순 주고받기는 `sequenceDiagram`, 상태 변화는 `stateDiagram-v2`. 승인 카드와 압축은 `sequenceDiagram` 의 `alt`/`note` 로 갈래를 보인다.
6. 그림 아래 "읽는 법" 두세 줄(어디서 시작해 어디로 가나 · 눈여겨볼 화살표 하나).
7. mermaid 문법: 마디 라벨에 괄호 · 따옴표가 들면 `["…"]` 로 감싼다. 한국어 라벨은 된다. 렌더가 깨지면 meta 가 아티팩트로 그려 보고 돌려보낸다.
**README 에도 그림 셋**: 설치 걸음 지도(어느 걸음이 무엇을 만드나 — 폴더 · DB · 계정 · 방 · 봇) · 등장인물과 역할(admin · member · 봇이 각각 할 수 있는 것) · 글 하나가 가는 길(사람 → 방 → 봇 → 답, `@TO` 있을 때와 없을 때 두 갈래).
**EXPLANATION 의 여섯 그림**(최소): ① 큰 그림(브라우저 · 서버 · CLI · 봇 폴더 · 과제 폴더 · DB 둘) ② 글 한 번 왕복 sequence(봉투 → 큐 → CLI 턴 → reply → 훅 → DB → SSE) ③ 승인 카드 sequence(허용 목록 밖 → canUseTool → 카드 → admin → 콜백, 10분 alt) ④ 세션 수명 state(stopped → starting → idle ⇄ working ⇄ waiting_approval → error/stopped) ⑤ 끄기 → 켜기 resume(프로세스 · session_id · 기록 파일 · 큐 재배달) ⑥ 하네스 로딩(cwd → CLAUDE.md · settings 두 장 · 스킬 · 도우미 · 훅 셋 · 과제 폴더). 검토자 ⓑ(중학생 독자)에게 **그림만 먼저 보여 주고** 흐름을 말하게 해 못 말하는 그림은 고친다.

## 4. 규칙
코드 · 시험 · prodev · minidiscord 는 손대지 않는다(읽기만). 커밋은 문서 둘 + `docs/log.md` 회차 절(어느 서브에이전트가 무엇을 썼고 검토했는지 한 줄씩). 문맥이 차면 먼저 알리고 멈춘다.

## 5. 끝나면
커밋 sha · 두 문서의 줄 수 · mermaid 블록 수 · 검토자 둘이 돌려준 건수와 고친 건수 · 새 질문. **meta-f3** 에게 SendMessage.
