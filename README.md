# crew-workspace

회사 과제를 돕는 비서 봇 **prodev** 를 한곳에서 다루는 작업 폴더다. 여기서 봇의 규칙을 만들고(`prodev/`), 사람이 브라우저로 봇과 이야기하는 창구를 돌리고(`cockpit/`), 만든 사람과 다른 자리에서 결과를 재어 검수한다(`meta/`).
이 문서는 **2026-09-15 판(v2, 새 판)** 이다. 새 판에서는 사람이 cockpit 웹 화면으로 봇과 이야기한다. 옛 판(2026-09-13)은 minidiscord 라는 채팅 서버를 창구로 썼고, 맨 아래 9절에 접어 두었다.

**괄호 속 `파일:줄` 과 `ADR-0xx` 는 근거 표시다.** 몰라도 읽는 데 지장이 없다. 읽는 규칙은 10절 끝에 있다.

## 0. 먼저 낱말

위 줄의 낱말이 아래 줄을 풀도록 차례를 맞췄다. 처음에는 0.1 만 보고, 0.2 · 0.3 은 막힐 때 돌아와 본다.
**찾아보기:** 사람 · 화면 · 과제 자료에 관한 말은 0.1, 프로그램 · 파일 · git 에 관한 말은 0.2, `409` 같은 숫자는 0.3.

### 0.1 기본 낱말

| 말 | 한 줄 풀이 |
|---|---|
| **과제 · PL · 로트** | 과제는 회사에서 몇 달 쫓는 일 하나, PL 은 그 책임자다. 예: `수율개선` (수율 = 만든 것 가운데 쓸 만한 비율). 로트는 한 번에 같이 만든 묶음이다 |
| **봇** | 과제 하나를 맡는 AI 비서다. 예: `prodev-수율개선-bot` |
| **방 · 사이드바 · 작성기** | 방은 사람과 봇이 글을 주고받는 채팅 창 하나다(과제 하나에 하나). 사이드바는 화면 왼쪽 방 목록, 작성기는 글 쓰는 칸이다 |
| **서버 · DB** | 서버는 늘 켜 두고 브라우저 요청을 받는 프로그램이다. DB 는 서버가 표 모양으로 자료를 적는 파일이다(`chat.db` · `cockpit.db`) |
| **터미널** | 글자로 명령을 치는 창이다. 맥은 "터미널", 윈도우는 "PowerShell" |
| **경로 · 절대 경로 · 뿌리** | 경로는 파일이 있는 자리 주소다(`prodev/scripts/setup.js`). 절대 경로는 맨 위부터 쓴 주소(`/Users/…`), 뿌리는 한 저장소의 맨 위 폴더다 |
| **링크** | 다른 자리를 가리키는 바로가기 파일이다 |
| **admin · member** | 계정 두 종류다. admin 은 방을 만들고 봇을 켜고 승인에 답한다. member 는 글만 읽고 쓴다 |
| **턴** | 봇이 글을 받아 일하고 답을 마칠 때까지의 한 바퀴다 |
| **도구 · 허용 목록** | 도구는 봇이 할 수 있는 일 하나다(파일 읽기 `Read`, 명령 치기 `Bash`, 방에 답 쓰기 `reply`). 허용 목록은 봇이 묻지 않고 써도 되는 도구 · 명령 목록이다 |
| **승인 · 승인 카드** | 봇이 허용 목록 밖 도구를 쓰려 할 때 admin 에게 묻는 일이다. 화면에 승인 카드로 뜬다 |
| **조종석 판** | 방 화면 오른쪽의 접이식 판이다. 봇 상태 · 승인 카드 · 파일이 여기 뜬다 (cockpit ADR-019) |
| **보관** | 끝난 방을 지우지 않고 읽기만 되게 닫아 두는 것이다 |
| **헌장 · 일지** | 헌장은 과제의 목표 · 사람 · 기한을 적은 첫 문서 `charter.md`, 일지는 하루 일을 적은 `journal/<날짜>.md` 다 |
| **inbox · 카드** | inbox 는 사람이 올린 원본을 고치지 않고 두는 폴더다. 카드는 실험 한 건을 정리한 파일이다(`cards/E-0001.md`) |
| **위키 · 색인** | 위키는 카드를 주제별로 묶은 요약 쪽(`wiki/`), 색인은 카드 · 위키 · inbox 를 훑어 만든 목록표(`index.md`)다 |
| **산출물 · 결재** | 산출물은 보고서 · 논문 초안처럼 봇이 만들어 내는 결과물, 결재는 그것을 사람이 승인하는 일이다 |
| **압축 · 인수인계서** | 대화가 길어지면 앞부분을 요약해 줄이는 일이 압축이다. 직전에 남기는 메모가 `handoff-compact.md` 다 |
| **굳다** | 사람이 "앞으로" 라고 말한 것이 다음부터 봇이 지키는 규칙이 되는 것이다 (6절) |
| **검수 · 관문** | 검수는 만든 사람 말고 다른 쪽이 직접 돌려 확인하는 일, 관문은 검수를 통과해야 다음 단계로 가는 자리다 |
| **ADR** | "왜 그렇게 정했는지" 적은 결정 기록이다. 번호가 붙는다 |

### 0.2 기술 낱말

| 말 | 한 줄 풀이 |
|---|---|
| **Claude Code CLI · 세션** | CLI 는 터미널에서 `claude` 로 켜는 AI 프로그램, 곧 봇의 몸이다. 세션은 봇과의 대화 한 줄기다 |
| **편지함 · 사건** | 편지함(`bot_inbox`)은 봇에게 갈 글을 쌓아 두는 줄, 사건(`session_events`)은 세션에서 일어난 일 한 줄 기록이다 |
| **스크립트 · 틀** | 스크립트는 정해진 일을 하는 작은 프로그램 파일, 틀(template)은 빈칸을 채워 설정 파일을 만드는 본보기다 |
| **스킬 · 도우미** | 스킬은 "이런 말이 오면 이렇게 일한다" 절차 카드(`prodev/.claude/skills/` 열다섯), 도우미(서브에이전트)는 긴 일이나 다른 눈의 검토를 맡는 작은 봇(`.claude/agents/` 여섯)이다 |
| **훅 · 하네스** | 훅은 정해진 순간(켤 때 · 압축 직전 · 답 보내기 직전)에 반드시 도는 작은 프로그램(셋)이다. 하네스는 지침 · 스킬 · 도우미 · 훅 · 설정 묶음, 곧 `prodev/` 다 |
| **제작 세션** | prodev · cockpit 을 고치는 Claude Code 세션이다. 사람이 시켜 브랜치 + PR 로 고친다. 봇과 다르다 |
| **`cockpit.json`** | cockpit 설정 파일이다. DB · 업로드 · 과제 폴더 자리 등을 적는다 |
| **SDK · MCP** | SDK 는 다른 프로그램이 CLI 를 부품처럼 켜고 조종하게 해 주는 묶음이다. MCP 는 봇 손에 새 도구를 끼우는 규격(콘센트 모양 같은 것)이다 |
| **cwd** | 프로그램이 켜지는 폴더다. 봇의 cwd 는 봇 폴더다 |
| **HTTP 길 · SSE** | HTTP 길은 브라우저가 서버에 보내는 요청 주소(`POST /api/rooms`), SSE 는 서버가 브라우저로 새 소식을 계속 흘려보내는 통로다 |
| **봉투** | 글 안에 적는 받는 봇 표시 `@TO(봇)` · `@CC(봇)` 이다. 없으면 봇에게 안 간다 |
| **resume** | 끊겼던 대화를 대화 번호(`session_id`)로 다시 이어 붙이는 일이다 |
| **환경변수 · exit 코드** | 환경변수는 프로그램을 켤 때 밖에서 넘기는 이름 붙은 값(`PRODEV_BOT=…`)이다. exit 코드는 끝나며 남기는 숫자로, 0 이면 성공이다 |
| **해시** | 비밀번호 같은 값을 되돌릴 수 없게 뒤섞은 값이다 |
| **폴더 신뢰** | 한 폴더에서 Claude Code 를 처음 켤 때 "이 폴더를 믿겠냐" 에 예라고 답하는 일이다. 안 하면 허용 목록이 무시된다 |
| **git · 저장소 · 커밋** | git 은 파일 변경 기록장, 저장소는 git 이 기록하는 폴더 하나, 커밋은 기록 한 번(`8f0870b` 같은 이름)이다 |
| **핀** | 이 작업판이 가리키는 커밋이다. 검수했는지는 `workspace.json` 의 '검수' 칸에 적는다 |
| **PR · worktree** | PR 은 "이 고침을 합쳐 주세요" 요청, worktree 는 같은 저장소를 옆 폴더에 하나 더 펼쳐 따로 고치는 자리다 |

### 0.3 HTTP 응답 숫자 (서버가 요청에 붙여 돌려주는 결과 번호)

| 숫자 | 뜻 |
|---|---|
| 201 | 만들었다 |
| 400 | 요청이 틀렸다 (예: 이름 규칙 위반) |
| 401 | 로그인이 안 됐거나 이름 · 비밀번호가 틀렸다 (`routes-auth.js:10`) |
| 403 | 권한이 없다: admin 이 아님 · 다른 출처의 요청 (`server.js:103` · `:107`) |
| 409 | 지금 상태와 부딪친다: 이미 있음 · 보관된 방 · 이미 답한 승인 · 동시 세션 상한 (`routes-messages.js:26` · `manager.js:100` · `relay.js:93`) |
| 500 | 서버 안에서 오류가 났다 |
| 502 | 서버가 부른 다른 프로그램이 실패했다: 방 만들기의 `setup.js`, 켜기의 Claude Code (`create.js:93` · `routes-session.js:31`) |

## 1. 한눈에

**이야기 하나로 먼저 본다.** 연구원 김과제가 방 `prodev-수율개선` 에 어제 라인 3 실험 파일을 올리고 `@TO(prodev-수율개선-bot) 어제 자료 봐 줘` 라고 쓴다. 봇은 파일을 inbox 에 잠가 두고, 무엇을 읽었는지 표로 보여 준 뒤 "E-0001 로 만들겠습니다. 맞으면 '확정'" 이라고 묻는다. 김과제가 "확정" 이라고 답하면 봇은 카드 `cards/E-0001.md` 를 확정하고 방에 알린다(5.1절). 한 달 뒤 PL 이 "B 로트 수율 어디 있었지?" 라고 물으면, 봇은 색인부터 대화까지 차례로 뒤져 출처와 함께 답한다(5.2절). 두 주쯤 지나 PL 이 "회고하자" 고 하면, 봇은 일지를 읽고 되풀이된 지적을 규칙 후보로 내민다. PL 이 "앞으로 그렇게 해" 라고 하면 그 규칙이 과제 폴더에 굳는다(6절).

이 이야기 뒤의 짜임은 이렇다. 사람은 브라우저로 **cockpit** 에 들어간다. cockpit 서버는 과제마다 봇 하나를 대신 켜 두고 끄지 않은 채 들고 있으면서, 사람 글을 넣어 주고 봇의 답을 방에 옮긴다. 봇이 **어떻게 일하는지**는 **prodev** 가 정한다. 봇의 기억은 대화가 아니라 **과제 폴더의 파일**에 남는다. **meta** 는 봇이 잘하는지를, 만든 쪽이 아닌 자리에서 직접 시험해 센다. 저장소마다 git 을 어떻게 두는지는 8.2절에 있다.

| 저장소 | 역할 |
|---|---|
| `meta/` | 만드는 사람과 다른 자리에서 재고(측정하고) 검수하는 곳. 예측 · 시험 자료 · 검수 기록 |
| `prodev/` | 봇의 하네스. 지침 `CLAUDE.md` · 스킬 열다섯 · 도우미 여섯 · 훅 셋 · 스크립트 열 · 봇 폴더 `bots/` |
| `cockpit/` | 사람이 쓰는 웹 화면이자, 봇 세션을 켜 두는 서버 |
| `minidiscord/` | 옛 채팅 서버. 읽기만 한다 |
| `crew/` | 2026-09-09 에 닫은 봇 다섯 실험. 읽기만 한다 |
| `knowledge/` | 회사 지식 색인. 과제가 끝나면 쓸 만한 것이 올라온다 |
| `projects/` | 과제 폴더들. 과제 하나 = 폴더 하나 = git 하나 (ADR-003). 회사 자료라 이 저장소에 올리지 않는다 |

## 2. cockpit 과 prodev 의 관계

여기 경로와 폴더 모습은 **새 판(v2) 설치 기준**이다. 이 작업판에 실제로 있는 `prodev/bots/` 네 폴더는 옛 판 것이다(11절 10번).

한 줄로: **cockpit 은 창구이자 세션을 켜 두는 손, prodev 는 봇의 머리와 규칙이다.** cockpit 은 봇에게 세 가지만 준다.
- **켜지는 폴더(cwd):** 봇 폴더 `prodev/bots/prodev-수율개선-bot`.
- **설정을 읽을 자리 스위치:** `project` · `local` 두 곳만 켠다. 사람 개인 설정은 끈다 (`cockpit/src/session/options.js:14`).
- **덧붙인 지시문:** "`@TO` 글에는 `reply` 로 답하라" 같은 문장 (`cockpit/src/envelope/wrap.js:18-31`).

나머지(지침 · 훅 · 스킬 · 도우미)는 Claude Code CLI 가 prodev 에서 스스로 읽는다 (`cockpit/docs/ARCHITECTURE_EXPLANATION.md` 10절).
공방에 빗대면 셰프 = Claude, 조리대 = 대화 문맥(봇이 한 번에 기억하며 보는 글의 양), 벽의 수칙 = `CLAUDE.md`, 레시피 카드 = 스킬, 수셰프 = 도우미, 검수대 = 훅이다. 대응표 전부는 `cockpit/docs/ARCHITECTURE_EXPLANATION.md` 4절.

이 그림은 누가 어느 파일과 DB 를 갖고, 무엇이 무엇을 부르는지 보여 준다.

```mermaid
flowchart LR
    P["사람"] -->|"글 · 첨부 · 단추"| B["브라우저"]
    B <-->|"HTTP /api/... · SSE /api/stream"| S["cockpit 서버"]
    S -->|"사람 · 방 · 글 · 첨부"| CH[("chat.db")]
    S -->|"계정 · 편지함 · 승인 · agent_sessions"| CK[("cockpit.db")]
    S <-->|"SDK query · reply · fetch_history"| C["Claude Code CLI"]
    subgraph PR["prodev 저장소"]
        ROOT["CLAUDE.md · .claude/skills 15 · .claude/agents 6"]
        HK["common/hooks 훅 셋 · scripts"]
        BF["봇 폴더 bots/prodev-수율개선-bot"]
    end
    C -->|"cwd · settings.json · settings.local.json"| BF
    C -->|"위로 올라가며 읽음"| ROOT
    BF -->|"훅 배선"| HK
    C -->|"Read · Edit · Write · git"| PD["과제 폴더 projects/수율개선"]
    HK -.->|"읽기만 MINIDISCORD_DB"| CH
```

읽는 법:
- 왼쪽 `사람` 에서 `브라우저` → `cockpit 서버` → `Claude Code CLI` 로 간다. 브라우저와 CLI 사이에는 선이 없다. 세션에 말을 거는 쪽은 서버 하나다.
- 봇 폴더가 **prodev 상자 안**에 있다. 그래서 CLI 가 한 층씩 위로 올라가 prodev 뿌리의 지침 · 스킬 · 도우미에 닿는다 (4절).
- 점선은 훅 · 스크립트가 `chat.db` 를 읽기만 하는 길이다. `cockpit.db` 에는 계정 · 비밀번호 해시 · 승인 기록이 있어서 봇 설정에서 읽기 · 쓰기를 막았다.

결론: 방 · 계정 · DB 둘은 cockpit 서버가, 봇 폴더 · 과제 폴더는 prodev `setup.js` 가 만들고, 스킬은 prodev 제작 세션만 만든다.

<details>
<summary>누가 무엇을 소유하나 — 자리 · 근거 표 (처음이면 건너뛰어도 된다)</summary>

| 무엇 | 실제 자리 | 누가 만드나 | 누가 쓰나 | 근거 |
|---|---|---|---|---|
| 방 | `chat.db` 의 `rooms` 한 줄 `prodev-<과제>` | cockpit `createRoom` | cockpit 서버 | `chat-db.js:150-157` |
| 계정 | `chat.db users` + `cockpit.db accounts`(비밀번호 해시) | `init-admin` · `add-user` 명령, admin API | 서버 | `bin/cockpit.js:186-204` |
| `chat.db` | `<dataDir>/chat.db`. 사람 · 방 · 봇 · 글 · 첨부 · 받는 봇 표 여섯 | 서버 기동 때 | 서버. 봇은 읽기만 | `chat-db.js:15-60` |
| `cockpit.db` | `<dataDir>/cockpit.db`. 계정 · 로그인 · 봇 세션 · 사건 · 승인 · 편지함 | 서버 기동 때 | 서버만 | `cockpit-db.js:17-69` · `setup.js:295` |
| 봇 폴더 | `prodev/bots/prodev-<과제>-bot/`. 설정 두 장 · `find.log` · `handoff-compact.md` | prodev `setup.js` (cockpit 이 부름) | 봇 | `setup.js:314` · `:329-331` |
| 과제 폴더 | `<projectsDir>/<과제>/` (자기 git) | prodev `setup.js` | 봇 | `setup.js:149-154` · `:246-252` |
| 첨부 | `<uploadsDir>/<uuid>-<이름>` | cockpit | 봇은 읽기만 | `multipart.js:54` |
| 스킬 · 도우미 · CLAUDE.md | `prodev/.claude/skills` · `.claude/agents` · `prodev/CLAUDE.md` | prodev 제작 세션. **봇은 안 만든다** | — | ADR-036 |

</details>

## 3. 방을 만들면 봇이 어떻게 세션으로 뜨나

두 걸음이다. **만들기**(admin 이 사이드바의 `+`)와 **켜기**(admin 이 조종석 판의 `켜기`). 만들기만 하면 봇은 꺼진 상태로 기다린다.

### 3.1 만들기 — 폴더 먼저, DB 는 나중

이 그림은 `+` 단추 한 번이 setup.js 를 불러 폴더 둘을 만들고, 성공했을 때만 DB 에 줄을 넣는 차례를 보여 준다.

```mermaid
sequenceDiagram
    actor P as 사람 admin
    participant B as 브라우저
    participant S as cockpit 서버
    participant U as prodev setup.js
    participant PD as 과제 폴더
    participant BF as 봇 폴더
    participant DB as chat.db · cockpit.db
    P->>B: 사이드바 + · 이름 수율개선
    B->>S: POST /api/rooms
    S->>S: createRoom 검사 · 이름 규칙 · 중복이면 409
    S->>U: node setup.js --project 수율개선 --cockpit cockpit.json
    U->>PD: 하위 폴더 12 · house.md 골격 · git init
    U->>BF: .claude/settings.json · .claude/settings.local.json
    U-->>S: exit 코드 · 출력 끝 20줄
    alt exit 0 이 아니거나 settings.local.json 없음
        S->>PD: 이번에 새로 생긴 과제 폴더면 지움
        S->>BF: 이번에 새로 생긴 봇 폴더면 지움
        S-->>B: 502 setup 실패 · setup_tail
    else 성공
        S->>DB: chat.db bots 한 줄 · rooms 한 줄
        S->>DB: cockpit.db agent_sessions 한 줄 · state stopped
        S-->>B: 201 · SSE room_created
    end
    Note over S,DB: DB 저장이 실패하면 넣은 행과 폴더를 되돌리고 409 또는 500
```

읽는 법:
- 위에서 아래로 읽는다. `alt` 상자에서 두 갈래로 나뉜다. 실패 갈래는 봇 폴더 · 과제 폴더 가운데 **요청 전에 없던 것만** 지운다. `setup_tail` 은 setup.js 출력의 마지막 스무 줄이다.
- 눈여겨볼 점은 순서다. setup.js 가 먼저 성공해야 방과 봇이 DB 에 생긴다 (cockpit ADR-017).

한 걸음씩 풀면 이렇다.

1. `+` 는 admin 에게만 보이고, 서버도 admin 요청만 받는다 (`cockpit/web/app.js:348` · `cockpit/src/http/routes-rooms.js:16-21`).
2. 이름을 검사한다. `/ \ ( )` 와 빈칸은 안 된다. `prodev-` 로 시작하면 400 이다. cockpit 이 봇 이름과 방 이름 앞에 `prodev-` 를 스스로 붙이기 때문이다 (`create.js:52` · `:55` · `chat-db.js:71`). 409 가 나는 경우는 넷이다.
   - 같은 이름을 지금 만드는 중이다.
   - 같은 과제의 방이나 세션 줄이 이미 있다.
   - 같은 이름의 봇이 이미 있다.
   - 봇 폴더가 이미 있다. (과제 폴더만 먼저 있으면 그대로 이어 쓴다.)
3. setup.js 는 prodev 폴더에서 돌고, 허락된 환경변수만 받고, 육십 초 안에 끝나야 한다 (`create.js:39-43` · `setup-runner.js:12-13`).
4. setup.js 는 `cockpit.json` 에서 DB · 업로드 · 과제 폴더 자리를 읽어 스스로 정한다 (`prodev/scripts/setup.js:123-143`).
5. `settings.json` 은 훅 · 환경변수 · 상태줄용이다. 여기 적는 환경변수 일곱은 봇 세션 안에서 쓰는 값이다(3.2 의 열다섯은 서버가 자기 환경변수 가운데 골라 넘기는 것이라 다르다). 자동 압축 문턱은 `650000` **토큰**(글자 조각 수)이다 (`setup.js:26` · `:350`).
6. `settings.local.json` 에는 권한만 들어간다. 허용 목록 스물둘, 거부 열, 봇이 더 쓸 폴더 셋(과제 · 업로드 · prodev)이다. 거부 열은 봇 설정 두 장 · `.env` · 훅 · 스크립트 고치기 다섯, 업로드 폴더 쓰기, `cockpit.db` 읽기 · 고치기 · 쓰기다 (`prodev/common/settings.local.template.json:27-33` · `setup.js:289` · `:295`).
7. **허용 규칙은 `settings.local.json` 에만 먹는다.** SDK 로 띄운 세션은 `settings.json` 의 허용 목록을 읽지 않는다는 것을 실측으로 확인해서 갈랐다 (ADR-038).

### 3.2 켜기 — CLI 가 나머지를 스스로 읽는다

이 그림은 `켜기` 한 번에 서버가 SDK 로 CLI 를 띄우고, CLI 가 봇 폴더와 prodev 뿌리에서 무엇을 읽는지 보여 준다.

```mermaid
sequenceDiagram
    actor P as 사람 admin
    participant B as 브라우저
    participant S as cockpit 서버
    participant K as cockpit.db
    participant C as Claude Code CLI
    participant BF as 봇 폴더
    participant R as prodev 뿌리
    P->>B: 조종석 판 켜기
    B->>S: POST /api/projects/수율개선/session/start
    S->>K: agent_sessions 에서 bot_dir · session_id 읽기
    S->>C: SDK query · cwd 봇 폴더 · settingSources project local · resume
    C->>BF: settings.json 훅 셋 · settings.local.json 허용 22
    C->>R: 위로 올라가며 CLAUDE.md · skills 15 · agents 6
    C->>C: SessionStart 훅 session-start.js · 여덟 절 싣기
    C-->>S: init 사건 · 준비 끝
    S->>K: session_id 저장 · state idle
    S-->>B: SSE session_state idle
    Note over S,C: 저장된 session_id 로 resume 이 실패하면 resume_failed 를 적고 새 세션으로 켠다
```

읽는 법:
- 서버가 CLI 에 넘기는 것은 `query()` 옵션 하나다. 그 뒤 `C->>BF` 와 `C->>R` 두 줄은 **서버가 아니라 CLI 가** 읽는 길이다.
- 켤 때마다 `session-start.js` 훅이 기억을 파일에서 되살린다(7절). 그래서 세션이 새로 떠도 과제를 잊지 않는다.

결론: 서버는 "어느 폴더에서 · 어느 설정만 읽고 · 앞 대화에 이어서" 켜라고만 넘긴다. 동시에 켤 수 있는 봇은 기본 셋이다 (`cockpit/src/config.js:10-18`).

<details>
<summary><code>query()</code> 에 실제로 들어가는 값 (처음이면 건너뛰어도 된다)</summary>

| 옵션 | 값 | 무슨 뜻 |
|---|---|---|
| `cwd` | 봇 폴더 | 봇이 켜지는 폴더 |
| `settingSources` | `['project','local']` | project · local 설정원만 켠다: 봇 폴더 설정 두 장, 그리고 위쪽 폴더의 CLAUDE.md · 스킬 · 도우미. 사람 개인 설정(user)은 끈다 |
| `strictMcpConfig` · `mcpServers` | `true` · `{cockpit}` | 끼우는 도구 묶음은 cockpit 것 하나뿐이다 |
| `permissionMode` | `'default'` | 권한을 넓히지 않는다. 목록 밖이면 묻는다 |
| `allowedTools` | `reply` · `fetch_history` | cockpit 도구 둘은 묻지 않고 쓴다 |
| `canUseTool` | 승인 중계 | 목록 밖 도구를 물으면 조종석 판에 승인 카드를 띄운다 |
| `persistSession` | `true` | 대화 기록을 남겨 resume 할 수 있게 한다 |
| `includePartialMessages` | `true` | 답을 다 쓰기 전에 조각조각 실시간으로 받는다 |
| `enableFileCheckpointing` | `true` | 파일을 고치기 전에 되돌릴 자리를 저장한다 |
| `env` | 허락된 15개 + `PRODEV_BOT_DIR` | 서버의 환경변수 가운데 고른 것만 넘긴다 (`env.js:7-22`) |
| `systemPrompt` | Claude Code 기본 + cockpit 지시문 | 기본 지침 뒤에 cockpit 의 지시를 덧붙인다 |
| `resume` | 저장된 `session_id` | 있으면 앞 대화에 이어 붙인다 |
| `pathToClaudeCodeExecutable` | 설정의 `claudePath` | 있으면 그 실행 파일을 쓴다(윈도우는 필수) |

근거: `cockpit/src/session/options.js:11-32`.

</details>

## 4. 스킬은 어떻게 받나

**봇 폴더를 `prodev/bots/` 아래에 두는 자리 자체가 스킬을 받는 법이다.** Claude Code CLI 는 cwd(봇 폴더)에서 **위로 한 층씩 올라가며** `.claude/skills` · `.claude/agents` · `CLAUDE.md` 를 찾는다. setup.js 는 스킬을 복사하지도 링크하지도 않는다 (`prodev/scripts/setup.js:309-356`). setup 이 봇 폴더에 쓰는 것은 설정 두 장뿐이고, 쓰다 보면 `find.log` · `handoff-compact.md` 가 더 생긴다.

이 그림은 CLI 가 봇 폴더에서 출발해 어디까지 올라가 무엇을 싣는지 보여 준다.

```mermaid
flowchart TB
    C["Claude Code CLI"] -->|"cwd"| BF["봇 폴더<br/>prodev/bots/prodev-수율개선-bot"]
    BF -->|"setup 이 쓰는 설정 두 장"| SJ["settings.json · settings.local.json"]
    BF -->|"한 층 위"| BOTS["prodev/bots"]
    BOTS -->|"한 층 위"| ROOT["prodev 뿌리"]
    ROOT --> MD["CLAUDE.md 지침"]
    ROOT --> SK[".claude/skills 15"]
    ROOT --> AG[".claude/agents 도우미 6"]
    SJ -->|"훅 명령은 절대 경로"| HK["prodev/common/hooks 셋"]
    SJ -->|"additionalDirectories"| PD["과제 폴더 · 업로드 · prodev"]
```

읽는 법:
- 가운데 줄 `봇 폴더 → prodev/bots → prodev 뿌리` 가 올라가는 길이다. 뿌리에서 셋이 실린다.
- 훅은 올라가는 길이 아니라 `settings.json` 에 적힌 절대 경로로 불린다. `additionalDirectories` 는 3.1 걸음 6 의 "봇이 더 쓸 폴더 셋" 과 같은 것이다.
- 스크립트 자리는 스킬 문장이 "봇 폴더에서 돌 때는 `../../scripts/`" 라고 알려 준다. `../` 는 한 층 위라는 뜻이다.

**확인했다:** 사람이 세운 시험 설치본의 봇 세션 기록에서, 불린 스킬이 prodev 뿌리의 `.claude/skills/` 에서 실렸고 스킬 열다섯 이름과 prodev `CLAUDE.md` 가 모두 실렸다.

<details>
<summary>근거 — 세션 기록에서 본 줄</summary>

- 기록 파일: `~/.claude/projects/-Users-byunjungwon-cockpit-try-v2-prodev-bots-prodev------bot/43b089b6-….jsonl` (시험 설치본 `~/cockpit-try-v2`, cwd = `~/cockpit-try-v2/prodev/bots/prodev-수율개선-bot`).
- 불린 스킬 셋의 자리: `Base directory for this skill: /Users/byunjungwon/cockpit-try-v2/prodev/.claude/skills/{find,intake,prodev-orchestrator}` — 봇 폴더의 두 단계 위.
- 스킬 목록에 열다섯 이름이 모두 있다. `Contents of /Users/byunjungwon/cockpit-try-v2/prodev/CLAUDE.md (project instructions …)` 가 있다.
- 도우미 여섯: `cockpit.db session_events` 의 첫 `init` 사건 `agents` 목록.
- 그 봇 폴더에는 `.claude/skills` 도 링크도 없다 (`find -type l` 결과 0).
- 스크립트 자리 문장: `prodev/.claude/skills/prodev-orchestrator/SKILL.md:65`.

</details>

**스킬 열다섯** (각 `prodev/.claude/skills/<이름>/SKILL.md:3`)

| 스킬 | 하는 일 |
|---|---|
| `prodev-orchestrator` | `@TO` 글이 오면 어느 스킬로 갈지 고르는 분기표. 놓친 앞 글을 끌어와 읽는 따라잡기도 |
| `charter` | 발의(과제를 새로 여는 일): 헌장 · 일정 뼈대 |
| `intake` | 첨부된 실험 자료를 읽고 표 → 문답 → 카드 |
| `find` | 과제 안 물음에 출처를 붙여 답한다. `find.js` 필수 |
| `research` | 바깥 조사. 먼저 find, 사람 허락 뒤 조사, 열 줄 브리핑 |
| `analysis` | 통계 · 코드 분석. `analysis/<날짜>-<이름>/` 에 `run.py` 와 정해진 칸 여섯의 `run.md`, 카드 하나 |
| `schedule` | `schedule.md` 등록 · 변경 · 브리핑 |
| `brief` | 오늘 현황 열 줄 |
| `journal` | 하루 마감 일지 |
| `retro` | 일지와 `find.log` 를 읽고 굳힐 후보를 제안 (6절) |
| `patent` | 청구 후보(특허로 주장할 거리) · 선행 조사(비슷한 특허가 이미 있나) · 전략 |
| `paper` | 논문 골격 → 절 초안 |
| `report` | 주간 · 월간 · 경영진 보고를 양식 칸에 채움 |
| `review` | 결재 전 다른 문맥에서 검토. 통과 · 불통과 · 검증 불가 |
| `close` | 마감: 방 보관 청하기 · 지식 승격(쓸 만한 것을 `knowledge/` 로 올리기) · 헌장 닫기 |

**분기표가 고르는 법** (`prodev/.claude/skills/prodev-orchestrator/SKILL.md:8-27`). 위에서부터 보고, **먼저 걸린 줄에서 멈춘다.**

| 차례 | 이런 글이면 | 가는 곳 |
|---|---|---|
| 1 | 따라잡기 말 ("위 파일 봐 줘", 부른 글에 첨부 없음) | 따라잡는 길 (7절) |
| 2 | "앞으로 · 다음부터" | 굳는 길 (6절) |
| 3 | `@TO` 글에 **첨부가 함께 오고** 시키는 말 (채워 줘 · 써 줘) | report · paper · patent |
| 4 | `@TO` 글에 실험 자료 첨부 | intake |
| 5 | **첨부 없이** 시키는 말 (특허 · 논문 · 보고) | patent · paper · report |
| 6 | 바깥을 알아봐 달라는 말 | research |
| 7 | 분석해 달라는 말 (유의 · 검정 · 회귀 …) | analysis |
| 8 | 물음 (물음표 · 어디 · 언제 · 얼마 …) | find |
| 9 이후 | 발의 · 일지 · 회고 · 현황 · 일정 · 마감 · 결재 직전 | charter · journal · retro · brief · schedule · close · review |
| 끝 | 어디에도 안 걸림 | 사람에게 되묻는다 |

예: "B 로트가 유의하게 낮나?" 는 물음표가 있어도 7번 analysis 가 8번 find 보다 앞이라 분석으로 간다.

## 5. 자기 자료는 어떻게 정리되나

원칙은 둘이다. **원본은 바꾸지 않는다.** **사람이 "확정" 이라고 답해야 카드가 확정된다.** 봇이 확정됐다고 우겨도, 방 공지와 커밋은 훅이 DB 에서 사람 글을 확인하고 막는다 (ADR-008).

### 5.1 들이기 — 첨부에서 카드까지

이 그림은 첨부 한 건이 inbox 에 잠기고, 번호 붙은 네 걸음을 지나 확정 카드와 방 공지가 되는 길을 보여 준다.

```mermaid
flowchart TB
    A["사람 첨부 · @TO 글"] -->|"scripts/intake-copy.js"| B["inbox/날짜-주제/<br/>원본 0444 잠금 · files.md 에 SHA-256"]
    B -->|"2000행 이상 또는 20쪽 이상"| D["data-reader 도우미<br/>reading.md"]
    B --> T["① 표 · 문답 · 번호 받기 index.js<br/>한 글에 E-0001 로 만들겠습니다 맞으면 확정"]
    D --> T
    T --> P{"② 사람이 확정이라고 답했나"}
    P -->|"아직"| W["카드는 draft 로 두고 기다림"]
    P -->|"확정"| V["③ 카드 status valid · 위키 갱신 · index.js"]
    V -->|"reply 첫 줄 [카드] E-0001 · ..."| I{"④ pre-reply 훅<br/>DB 에서 사람 확정 글을 조건 다섯으로 확인"}
    I -->|"통과"| J["방에 카드 공지 · git commit"]
    I -->|"막힘 exit 2"| K["공지 안 나감 · 카드는 valid 인 채 커밋 안 됨<br/>봇이 까닭을 받고 고침"]
```

읽는 법:
- 맨 위에서 원본이 inbox 에 잠긴 뒤 ①~④ 번호대로 내려간다. 사람이 확정하지 않으면 카드는 draft 로 남고 봇은 기다린다 (`prodev/.claude/skills/intake/SKILL.md:71-74`).
- 마름모 ④ 가 관문이다. 훅은 파일을 고치지 않고 `reply` 만 막는다. 모든 `reply` 직전에 방 번호 · 분량 · 색인 오류를 보고, 첫 줄이 `[카드]` 일 때만 확정 조건 다섯을 더 본다 (`prodev/common/hooks/pre-reply.js:38` · `:183-190`).

풀어 둘 것:
- **inbox 에 잠그기:** `0444` 는 아무도 못 고치게 잠근다는 뜻이다. SHA-256 은 파일 지문이라, 한 글자만 바뀌어도 값이 달라진다. 같은 이름 파일이 또 오면 `.v2` 를 붙여 둘째 판으로 둔다(이 문서의 "v2 판" 과는 다른 뜻). 지문은 사이드카 파일 `files.md` 에 적힌다 (`prodev/scripts/intake-copy.js:47-48` · `:149-150`).
- **확정 전 카드는 draft 다** (`intake/SKILL.md:74`). "확정" 이 오면 `status: valid` → 위키 → `index.js` → 방에 카드 공지 → git commit 순서다 (`:78-85`).
- **① 에서 번호와 청하는 말을 한 글에 두는 까닭:** 확정 조건 ④ 가 "사람 확정 바로 앞 봇 글" 에서 카드 번호를 찾기 때문이다 (`intake/SKILL.md:66-69`).

**확정 조건 다섯** (`prodev/common/hooks/pre-reply.js:104-121`)
1. 확정 글을 **사람**이 썼다.
2. **같은 과제의 방**에서 썼다 (ADR-039).
3. 봉투를 벗긴 본문이 `확정` · `맞다` · `맞습니다` · `그대로` · `OK` 로 시작한다.
4. 자료가 올라온 글보다 뒤이고, **바로 앞 봇 글에 같은 카드 번호**가 있다.
5. 카드 `status` 가 `valid` 다.

**카드 머리말 예** — 파일 맨 위에 붙는 yaml 꼴 머리말이다(yaml = `이름: 값` 을 한 줄씩 적는, 사람이 읽기 쉬운 설정 글꼴). 값은 모양을 보이려고 지은 예다.

```yaml
id: E-0001               # 카드 번호
kind: experiment         # 갈래
title: 라인 3 B 로트 수율  # 제목
room: prodev-수율개선      # 방
source_msgs: [12]        # 자료가 올라온 글 번호
status: draft            # 확정 전 draft, 확정 뒤 valid
```

나머지 칸(`confirmed_at` · `files` · `conditions` · `results` · `aliases` 등)은 `prodev/design/v3/ARCHITECTURE.md:122-140` 에 있다.

**과제 폴더의 나머지 자리:** `wiki/` 는 카드를 주제별로 묶은 요약 쪽이다. `journal/` 은 일곱 칸(제목 일곱)짜리 일지다. `threads/` 는 "열린 실", 곧 사람 답을 기다리는 물음 메모다. `research/` 는 바깥 조사 결과다. 폴더는 setup 이 만든다 (`prodev/scripts/setup.js:205`).

### 5.2 찾기 — 여섯 층, 먼저 걸리면 멈춘다

이 그림은 물음 하나가 `find.js` 의 여섯 층을 차례로 내려가다 처음 걸린 층에서 답이 되고, 그 결과가 `find.log` 에 한 줄 남는 길을 보여 준다.

```mermaid
flowchart LR
    Q["물음 · B 로트 수율 어디 있지"] --> L1["1 색인<br/>title · aliases · tags"]
    L1 -->|"없음"| L2["2 카드 본문"]
    L2 -->|"없음"| L3["3 위키"]
    L3 -->|"없음"| L4["4 과제 문서<br/>charter · schedule"]
    L4 -->|"없음"| L5["5 inbox<br/>files.md · 원본"]
    L5 -->|"없음"| L6["6 대화 chat.db"]
    L1 & L2 & L3 & L4 & L5 & L6 -->|"걸림"| ANS["출처를 붙인 답"]
    L6 -->|"없음"| NONE["건수 0"]
    ANS --> LOG["봇 폴더 find.log 한 줄"]
    NONE --> LOG
```

읽는 법:
- 왼쪽에서 오른쪽으로 내려간다. 과제 파일(색인 · 카드 · 위키 · 헌장 · inbox)을 다 본 뒤에야 대화를 본다 (ADR-016 · ADR-026).
- `find.log` 는 **봇 폴더**에 쌓인다. 칸은 시각 · 층 · 층 이름 · 건수 · 맨 위 결과 · 물음이다 (`prodev/scripts/find.js:271-283` · `:303-314`). 건수 0 인 줄이 `retro` 의 "못 찾은 물음" 재료다.

## 6. retro 로 스킬 · 규칙이 어떻게 진화하나

**가상의 예부터.** PL 이 두 주 동안 "수율 표 단위는 % 로" 를 세 번 지적했다. 봇은 그때마다 일지에 한 줄씩 적는다. PL 이 "회고하자" 고 하자 봇이 "규칙 후보: 수율 표는 % 로" 를 근거 세 줄과 함께 낸다. PL 이 "앞으로 그렇게 해" 라고 하면 `projects/수율개선/house.md` 에 한 줄이 들어간다. `house.md` 는 이 과제만의 규칙 메모다.

봇은 쓸수록 이 과제에 맞아 간다. 다만 **스스로 규칙을 만들지 않는다.** 입구는 둘이고 문은 하나다. 문은 **사람이 "앞으로" 라고 말하는 것**이다 (ADR-035).
- **지시형:** 사람이 먼저 "앞으로 회의록은 이 양식으로" 라고 말한다.
- **관찰형:** 봇은 반복을 **세지 않는다**(세는 장치도 상태 파일도 없다). 일지의 `## 되풀이된 말` 칸에 한 줄씩 쌓아 두고, 사람이 부른 `retro` 가 읽다가 알아채 제안한다 (`prodev/.claude/skills/journal/SKILL.md:37-47`).

이 그림은 일지 · 찾기 기록 · 검토 판정이 회고의 제안이 되고, 사람이 무엇을 굳히라 했느냐에 따라 갈라지는 길을 보여 준다.

```mermaid
flowchart TB
    J["journal/*.md<br/>되풀이된 말 · 다음 할 일"] --> R
    FL["봇 폴더 find.log<br/>건수 0 인 줄"] --> R
    RV["cards · 산출물.review.md<br/>불통과 판정"] --> R
    R["retro 스킬<br/>사람이 회고하자고 부름 · 기본 최근 2주"]
    R --> O["제안 넷 · 항목마다 근거<br/>되풀이 · 막힘 · 굳힐 후보 · 스킬 후보"]
    O --> D{"사람이 무엇을 굳히라 했나"}
    D -->|"이번에는 · 이번 한 번만"| NO["굳지 않음"]
    D -->|"앞으로 · 규칙"| H["house.md 상한 50줄"]
    D -->|"앞으로 · 양식 · 방법"| T["templates/ · analysis/methods/"]
    D -->|"스킬 · 도우미"| PR["prodev 제작 세션이 worktree + PR"]
    H -->|"다음 켜기 session-start 여덟째 절"| NEXT["봇이 규칙을 싣고 일함"]
    T -->|"쓸 때 report · analysis 스킬이 읽음"| USE["양식 · 방법대로 산출물"]
```

읽는 법:
- 위의 세 재료가 사람이 부른 `retro` 로 모인다. 정해진 시각에 저절로 도는 장치(cron)는 없다.
- 마름모에서 갈린다. 봇은 제안까지만 한다. 스킬 자체는 봇이 못 만들고, prodev 제작 세션이 PR 로 만든다.
- 켤 때마다 싣는 것은 `house.md` 뿐이다. `templates/` · `analysis/methods/` 는 그 일을 할 때 스킬이 열어 읽는다 (ADR-032 · `session-start.js:136-139`).

풀어 둘 것:
- 제안마다 원본 경로 · 들어갈 문장 · 까닭을 단다. 근거 없는 항목은 쓰지 않는다 (`prodev/.claude/skills/retro/SKILL.md:67-85`).
- 굳을 때 봇은 범위를 한 줄로 되묻고, 머리에 "언제부터 · 누가 · 무엇을 보고" 를 단다 (`prodev-orchestrator/SKILL.md:42-54`).
- **`house.md` 쉰 줄 상한은 쓰기를 막지 않는다.** 켤 때 훅이 쉰 줄에서 자르고, 잘리면 "사람에게 말하고 스스로 줄이지 마라" 를 싣는다 (`prodev/common/hooks/session-start.js:136-143`).
- `analysis/methods/` 는 setup 이 만들지 않고 봇이 처음 굳힐 때 만든다 (`setup.js:205-206` · `prodev/docs/as-built.md:182`). cron 이 없다는 근거는 `retro/SKILL.md:10` · `setup.js:12` · ADR-036.

<details>
<summary>근거 — 이 길을 정한 ADR-031~037</summary>

| ADR | 한 줄 |
|---|---|
| 031 | 판을 v3 "진화하는 비서" 로 올린다. 관문 셋: 자리 → 길 → 짐 |
| 032 | 굳은 것이 사는 자리를 과제 폴더에 둔다. `house.md` 상한 50줄은 훅이 여덟째 절로 싣는다 |
| 033 | 허용 목록을 41건 → 22건으로 줄이고 Git Bash 경로를 봇 설정에 박는다 |
| 034 | `analysis` 스킬 + `analysis/<날짜>-<slug>/` 여섯 칸 + 카드 필수. 사람 관문은 모형 고르기 하나 |
| 035 | 굳는 길: 입구 둘(지시형 · 관찰형), 문 하나. "앞으로" 만 굳고 세지 않는다 |
| 036 | `retro` 스킬 = 관찰형이 도는 시점. 근거 필수. cron 없음 |
| 037 | 스킬을 만드는 기준은 판별 넷: 숫자는 스크립트 · 타이밍은 스킬 · 문맥 격리는 도우미 · 셋 다 아니면 안 만든다 |

</details>

## 7. 봇의 세계

봇이 보는 세상은 좁다. 방 하나, cockpit 이 덧붙인 도구 둘, 훅 셋이다. **덧붙인 도구 둘은 `reply` 와 `fetch_history` 다.** `Read` · `Edit` · `Write` · `Bash` 같은 기본 도구는 따로 있다.

| 무엇 | 사실 | 근거 |
|---|---|---|
| 방 하나 | 과제 하나 = 방 하나 `prodev-<과제>` = 봇 하나. 옛 판에는 파일만 올리는 files 방이 따로 있었는데 지금은 없다. 옛 files 방은 보관되고 봇은 읽기만 한다 | ADR-039 · cockpit ADR-015 |
| 봉투 | 대문자 `@TO(이름)` · `@CC(이름)` 만 봉투다. 이름에 빈칸 · 괄호가 있으면 안 된다. `@TO` 는 답하라, `@CC` 는 참고만 하라 | `mention.js:5` · `wrap.js:21-22` |
| 봉투 없는 글 | 편지함에 줄이 안 생기고 봇 턴이 없다. 사람끼리 말하는 자리다. 작성기가 `@TO(봇)` 을 미리 채워 둔다 | cockpit ADR-018 · `chat-db.js:179` |
| `reply` | 봇이 방에 말하는 **유일한** 길. 제 방에만 쓴다 | `tools.js:18-42` · `:81-89` |
| `fetch_history` | 지난 글 읽기. 결과에 첨부 경로가 실린다. 봇은 부른 글의 첨부만 바로 받고, 나머지는 이것으로 따라잡는다 | cockpit ADR-020 · `tools.js:60-68` |
| 훅 `session-start` | 켤 때 · resume · clear · 압축 뒤마다 여덟 절을 싣는다: 인수인계서 → 헌장 → 일정 → 열린 실 → 어제 일지 → 색인 머리 → 마지막 일지 날짜 → `house.md` | `session-start.js:95-143` |
| 훅 `pre-compact` | 압축 직전에 대화 끝 40턴을 따로 요약해 봇 폴더 `handoff-compact.md` 여섯 칸(하던 일 · 방과 마지막 글 번호 · 사람이 기다리는 것 · 미해결 질문 · 다음 한 걸음 · 열어 둔 파일)을 쓴다 | `pre-compact.js:26` · `:106-110` |
| 훅 `pre-reply` | `reply` 직전에 방 번호 → 분량(900자 · 10줄) → `[카드]` 확정 → `[발송]` 결재(산출물을 보내기 전 확인) → 색인 오류 순으로 본다. 막으면 exit 2 | `pre-reply.js:7-12` · `:155-214` |
| 승인 카드 | 허용 목록 밖 도구를 쓰려 하면 조종석 판에 카드, 방에 `🔒` 줄. **admin 만** 답한다(아니면 403). 기본 10분 안에 답이 없으면 거부 | `relay.js:63-86` · `config.js:15` |
| 압축 알림 | 방의 두 줄 알림("정리 중" · "정리 끝")은 cockpit 서버가 올린다 | `manager.js:19-20` |
| resume | `session_id` 는 `cockpit.db agent_sessions` 에 있다. 서버를 다시 켜면 꺼짐이 아닌 과제를 이어 붙인다. 실패하면 새 세션으로 켜고 `resume_failed` 를 적는다 | `manager.js:117-125` · `:264-270` |

(표의 짧은 파일 이름은 `cockpit/src/…` 또는 `prodev/common/hooks/…` 아래에 있다. 전체 경로는 `cockpit/docs/ARCHITECTURE_EXPLANATION.md` 13절 표.)

예: 김과제가 봉투 없이 `yield.csv` 를 올리고 "B 로트가 낮네요" 라고 쓴다 → 봇 턴 없음. 이어 PL 이 `@TO(prodev-수율개선-bot) 위 파일 봐 줘` → 봇이 `fetch_history` 로 앞 글과 첨부 경로를 끌어오고, "이렇게 이해했습니다" 한 줄 뒤 intake 로 간다 (`prodev-orchestrator/SKILL.md:32-40`).

세션 상태는 여섯이다. 영어 이름은 DB 에 적히는 값이고, 화면에는 한국어로 뜬다: `stopped` 꺼짐 · `starting` 켜는 중 · `idle` 대기 · `working` 일하는 중 · `waiting_approval` 승인 대기 · `error` 오류 (`cockpit/src/db/cockpit-db.js:11`). 이 그림은 그 여섯 상태와 옮겨 가는 조건을 보여 준다.

```mermaid
stateDiagram-v2
    state "stopped · 꺼짐" as stopped
    state "starting · 켜는 중" as starting
    state "idle · 대기" as idle
    state "working · 일하는 중" as working
    state "waiting_approval · 승인 대기" as waiting_approval
    state "error · 오류" as error
    [*] --> stopped: 방 만들기
    stopped --> starting: admin 이 켜기
    error --> starting: 다시 켜기 · 서버 기동
    starting --> idle: 준비 끝
    starting --> error: 켜기 실패
    idle --> working: 봉투 있는 글이 들어감
    working --> waiting_approval: 승인 요청
    idle --> waiting_approval: 승인 요청
    waiting_approval --> working: 답이 옴 · 허용이든 거부든 시간 초과든
    working --> idle: 턴 끝
    waiting_approval --> idle: 턴 끝
    idle --> stopped: 끄기 · 보관
    working --> error: CLI 가 뜻밖에 멈춤
    error --> stopped: 끄기
```

읽는 법:
- `[*]` 는 시작점이다. `꺼짐` 에서 `켜는 중` 을 지나 `대기` 에 닿고, 그 뒤 `대기` · `일하는 중` · `승인 대기` 셋이 돈다.
- 도구 승인 요청이 오면 지금 상태와 상관없이 `승인 대기` 로 간다 (`cockpit/src/session/manager.js:279-281`). 답이 오면 허용이든 거부든, 십 분이 지나 거부되든 똑같이 `일하는 중` 으로 돌아가고, 봇은 거부된 결과를 받아 다른 길을 찾거나 멈춘다 (`:282-290`).
- 그림을 줄이려고 끄기와 뜻밖의 멈춤은 한 상태에서만 그렸다. 실제로는 켜진 세 상태 어디서든 일어난다 (`cockpit/docs/ARCHITECTURE_EXPLANATION.md` 8절). 서버 창을 Ctrl-C 로 닫아도 DB 의 상태 칸은 그대로라, 다음에 서버를 켜면 그 봇들을 이어 붙인다.

## 8. 운영 · git

### 8.1 켜는 법 (짧게)

처음 세우는 사람은 **`cockpit/README.md` 3절의 걸음 1~20** 을 위에서부터 따른다. 윈도우 회사 PC 는 `cockpit/docs/INSTALL-WINDOWS.md` 이다. 준비물은 Node 22.13 이상 · Git · Claude Code(설치 + 로그인)이고, 경로에 빈칸이 없어야 한다 (`cockpit/package.json:7-9`).

터미널에서 `cd cockpit` 한 뒤 친다.

```
node bin/cockpit.js check --config cockpit.json          # ✗ 로 시작하는 줄이 없어야 한다
node bin/cockpit.js init-admin 김피엘 --config cockpit.json
node bin/cockpit.js add-user 김과제 --config cockpit.json
node bin/cockpit.js serve --config cockpit.json          # cockpit 듣는 중 http://127.0.0.1:3000
```

그다음 차례는 이렇다.
1. 브라우저 **주소창**에 `http://127.0.0.1:3000` 을 치고 로그인한다.
2. 사이드바 `+` 로 방 `수율개선` 을 만든다.
3. 새 터미널에서 봇 폴더 `<prodevDir>/bots/prodev-수율개선-bot` 로 `cd` 하고 `claude` 를 켠다. 이 폴더를 믿겠냐고 물으면 믿는다고 고르고 `/exit` 로 나온다(`cockpit/README.md` 걸음 15). 폴더 신뢰를 안 하면 봇이 파일을 못 쓴다(8.3절).
4. 방을 열고 조종석 판의 `켜기` → `@TO(prodev-수율개선-bot) 안녕하세요`.

설정 키는 `cockpit/README.md` 9절에 있다. 화면에는 계정 관리가 없다. 계정은 명령이나 admin API 로만 만든다.

### 8.2 git 은 이렇게 한다

git 은 파일 변경 기록장이고, 핀은 이 작업판이 가리키는 커밋이다. 원격은 인터넷(GitHub 등)에 올려 둔 같은 저장소, HEAD 는 지금 펼쳐 둔 커밋이다.
저장소를 하나로 합치지 않는다. 이 저장소(crew-workspace)는 `meta/` 와 뿌리 파일만 담고, 나머지는 **가리키기만** 한다.

| 저장소 | git 자리 |
|---|---|
| `meta/` · 뿌리 파일 | 이 저장소가 직접 담는다 |
| `prodev/` | 자기 저장소(bjw202/prodev). 핀 `7155e77` (검수는 아직 안 거친 판, `workspace.json:4`) |
| `minidiscord/` | 자기 저장소(bjw202/minidiscord). 핀 `6633f7b` |
| `cockpit/` | 자기 저장소(bjw202/cockpit). 핀 `7aa80dd` (검수는 아직 안 거친 판, `workspace.json:6`) |
| `crew/` | 자기 저장소(bjw202/crew). 핀 `eefac93` (검수는 아직 안 거친 판, `workspace.json:7`) |
| `knowledge/` | 작은 로컬 저장소. **핀 없음 · 원격 없음** |
| `projects/<과제>/` | 과제마다 자기 git. 이 저장소에 올리지 않는다 |

| 무엇 | 지금 사실 |
|---|---|
| 받기 | `bootstrap.sh`(저장소를 받아 오는 셸 스크립트)를 `sh bootstrap.sh` 로 돌리면 핀의 **넷**(prodev · minidiscord · cockpit · crew)을 받아 그 커밋으로 맞추고 `projects/` 를 만든다 (`bootstrap.sh:10-23`) |
| knowledge | 핀에도 원격에도 없어서 `bootstrap.sh` 로는 못 받는다 (회사 자료라 올리지 않는다) |
| 고칠 때 | prodev · crew 는 worktree + PR, cockpit 은 브랜치 + PR, meta 기록은 이 저장소에 바로 커밋 (`meta/CLAUDE.md`) |
| 핀 올리기 | meta 가 검수를 끝냈을 때 `workspace.json` 의 커밋을 올리고 `meta/` 기록과 함께 커밋한다 |
| 올리지 않는 것 | `projects/` 안 과제 · `.env` · `*.db` · `node_modules` (`.gitignore`) |

### 8.3 잘 안 될 때

**대부분의 고장은 오류를 내지 않는다.** 왼쪽은 밖에서 보이는 모습, 오른쪽이 자리다. 더 많은 줄은 `cockpit/README.md` 7절.

| 보이는 것 | 자리 · 할 일 |
|---|---|
| `이름이나 비밀번호가 맞지 않습니다` | 계정이 없거나 비밀번호가 틀렸다. 가입 단추는 없으니 `init-admin` · `add-user` 로 만든다 |
| 새 판을 받았는데 옛 화면 | 서버를 다시 띄웠는지 보고, 보통 새로고침(F5)을 한 번 한다 (`cockpit/README.md` 7.4) |
| 봇이 말은 하는데 파일을 못 쓰고, 첫 줄에 `…not been trusted` | 그 봇 폴더를 신뢰하지 않아 **허용 목록이 통째로 무시됐다.** 새 방마다 그 봇 폴더에서 `claude` 를 한 번 켠다 (8.1 차례 3) |
| 허용 규칙을 넣었는데 승인 카드가 또 옴 | `settings.json` 에 넣었다. `settings.local.json` 에만 먹는다. setup 을 다시 돌리면 이 파일은 덮인다 (ADR-038) |
| 방 만들기가 빨간 `setup 실패: …` (502) | `prodevDir` 가 prodev 가 아니거나 · `settings.local.json` 이 안 생겼거나(판이 안 맞음) · 육십 초를 넘겼다 (`create.js:90-94`). `setup_tail` 끝에 옛 안내 "다음 — open-project …" 가 섞일 수 있다 (11절 8번) |
| `과제가 이미 있습니다` · `봇 폴더가 이미 있습니다` (409) | 같은 이름이 있거나, 앞의 실패에서 못 지운 봇 폴더다. 못 지운 자리는 응답의 `left` 칸에 적힌다 |
| 글을 보냈는데 봇 턴이 안 생김 | ① 봉투가 없다(소문자 `@to` 도 없음과 같다) ② 봇이 꺼져 있다 — 글은 편지함에 쌓였다가 켜지면 배달된다 ③ admin 이 건 압축 중이다 |
| 방에 `⛔ 시간 초과 거부 (10분) · <도구>` | 승인 카드에 admin 이 십 분 안에 답하지 않았다. member 화면에는 단추가 없다. 봇에게 다시 시킨다 (문구 `relay.js:39` · 타이머 `:74`) |
| `동시 세션 상한 3 에 닿았다` | 다른 과제의 봇을 끄거나, `cockpit.json` 의 `maxSessions`(동시에 켤 봇 수)를 올린다 |
| 조종석 판에 `오류: …` | Claude Code 가 못 떴다. 로그인이 없거나 실행 파일을 못 찾았을 수 있다. 윈도우는 `cockpit.json` 의 `claudePath`(Claude Code 실행 파일 자리)를 본다 (`cockpit/README.md:425`) |
| `켜는 중` 이 1분 넘게 안 바뀜 | Claude Code 가 로그인 · 네트워크를 기다리고 있을 수 있다. `끄기` → `켜기` 를 한 번 한다 (`cockpit/README.md:426`) |
| 봇 첫 답이 "규칙 파일이 50줄을 넘어…" | `house.md` 가 넘쳤다. 무엇을 뺄지 사람이 고른다 (6절) |

<details>
<summary><b>9. 옛 판 (2026-09-13, minidiscord 창구) — 윈도우 포팅 핵심 표 셋</b></summary>

> **지금 판에서는 쓰지 않는다.** 창구가 cockpit 으로 바뀌어 채팅 서버 · 채널 플러그인 · `setup.js rooms` · `.mcp.json` · `.env` 토큰 · 방 둘(본방 · files)이 모두 빠졌다. 옛 판의 준비물 · 터미널 셋 켜는 법 · 잘 안 될 때 표 전문은 이 저장소 커밋 `7558b26` 의 `README.md` 와 [`WINDOWS.md`](WINDOWS.md) 에 있다. 실제 `prodev/bots/` 네 폴더와 `projects/` 네 폴더는 이 옛 판의 산출물이다.

2026-09-12~13 에 윈도우 11 로 옮겨 채팅 서버 · 봇 · 방 · 첨부까지 끝까지 밟았다. 코드는 한 벌이고 **플랫폼을 가르는 자리는 넷뿐**이다.

| 가른 자리 | 맥 · 리눅스 | 윈도우 |
|---|---|---|
| `setup.js` 의 `pat()` — 권한 패턴 | `'//' + 경로` | `//` 를 안 붙인다 |
| `setup.js` 의 `FIRST_DIRS` — 봇 PATH 앞자리 | 빈 목록 | Git 의 유닉스 도구 자리 둘 |
| `gateway.ts` 의 `뿌리안()` — 첨부 뿌리 판정 | 대소문자 구분 | 무시 |
| `e2e-lib.mts` 의 `stopServer` | 프로세스 그룹 `-pid` | 자식 하나 `child.kill` |

**막힌 자리 열둘, 그중 아홉이 오류를 안 냈다.**

| # | 무엇이 망가졌나 | 밖에서 보이던 모습 | 오류 |
|---|---|---|---|
| ① | 권한 패턴이 `//C:/…` 꼴 | 봇이 파일을 하나도 못 만든다 | 아니 |
| ② | 훅 명령의 역슬래시를 bash 가 escape 로 먹음 | 세션은 뜨는데 헌장 · 규칙을 안 싣고 관문이 안 걸린다 | 첫 줄에만 |
| ③ | 봇 PATH 에 Git 유닉스 도구 자리가 없음 | `ls` · `mkdir` · `date` 에 승인 창 | 아니 |
| ④ | 환경 점검이 `git` · `node` 둘만 봄 | 거짓 초록 | 아니 |
| ⑤ | 방 알림이 `curl` 을 부름 | 한글이 `????` | 아니 |
| ⑥ | 파이썬 stdout 이 콘솔 코드페이지 | 깨진 글자가 카드에 들어간다 | 아니 |
| ⑦ | 첨부 뿌리를 대소문자까지 비교 | 봇 첨부가 조용히 사라진다 | 아니 |
| ⑧ | `chat.js` 가 준비된 문장을 안 붙잡음 | Node 22 에서 대화 검색이 못 돈다 | 났다 |
| ⑨ | `spawn('npx', …)` | 서버 시험 25건 중 17건이 안 돌았다 | 났다 |
| ⑩ | e2e 종료가 프로세스 그룹 신호 | 러너가 안 끝난다 | 아니 |
| ⑪ | 열린 SQLite 핸들 위에서 폴더를 지움 | sse 시험 아홉이 붉다 (맥에서는 조용히 샘) | 났다 |
| ⑫ | `startsWith('/')` 로 절대 경로를 잼 | `C:\…` 에서 틀린다 | 났다 |

**값마다 «누가 읽는가» 가 다르다** — ②가 가장 비싼 자리였다.

| 값 | 읽는 쪽 | 꼴 |
|---|---|---|
| `hooks[].command` · `statusLine.command` | 셸 (bash) | 슬래시 (`C:/a/b`) |
| `permissions.allow` / `deny` | Claude Code 패턴 대조기 | 슬래시, `//` 없이 |
| `env.*` · `additionalDirectories` | Claude Code · 자식 프로세스 | 실제 경로 (역슬래시 그대로) |

틀렸던 진단 둘 · 아직 안 잰 것 · 확인표 스물은 [`WINDOWS.md`](WINDOWS.md) 5 · 7 · 8절과 `meta/prodev-review/runs/2026-09-13-windows-port.md` 에 있다.

</details>

## 10. 더 읽을 것

| 알고 싶은 것 | 문서 |
|---|---|
| cockpit 을 처음부터 세우기 (걸음 1~20 · 시나리오 · 막혔을 때 · 계정 · 설정 키) | [`cockpit/README.md`](cockpit/README.md) |
| cockpit 구조를 공방 비유로 (글 왕복 · 승인 · 세션 수명 · resume · 압축) | [`cockpit/docs/ARCHITECTURE_EXPLANATION.md`](cockpit/docs/ARCHITECTURE_EXPLANATION.md) |
| cockpit 결정의 까닭 (ADR-001~020) | `cockpit/docs/ADR.md` · `cockpit/docs/as-built.md` |
| 윈도우 회사 PC 에 cockpit 세우기 · 판 올리기 | [`cockpit/docs/INSTALL-WINDOWS.md`](cockpit/docs/INSTALL-WINDOWS.md) |
| 비서가 무엇을 하고 어떻게 기억하나 | [`prodev/README.md`](prodev/README.md) |
| prodev 결정의 까닭 (ADR-001~039) | [`prodev/design/v3/ADR.md`](prodev/design/v3/ADR.md) |
| 윈도우에서 셸 · 경로 · 확인표 스물 | [`WINDOWS.md`](WINDOWS.md) |
| meta 의 cockpit 회차 인수인계 · 다른 기계로 옮길 때 | `meta/prodev-review/plans/2026-09-14-web-cockpit/HANDOFF-meta.md` · `meta/prodev-review/HANDOFF.md` |

**근거 표시 읽는 법:** 경로는 이 작업 폴더 뿌리(`crew-workspace/`)에서 센다. ADR 번호 앞에 "cockpit" 이 붙으면 `cockpit/docs/ADR.md`, 안 붙으면 `prodev/design/v3/ADR.md` 다.

## 11. 확인하지 못한 것 · 문서끼리 어긋난 것

"고치라" 가 아니라 사실만 적는다. 항목마다 "그래서" 줄은 쓰는 사람에게 생길 수 있는 일이다.

1. **스킬 링크는 없다.** v2 계획 문서 둘이 "스킬 링크" 를 만든다고 적었지만(`meta/prodev-review/plans/2026-09-14-cockpit-후속/AS-IS-TO-BE-v2.md:23` · `DIRECTION-v2.md:52`), `setup.js:309-356` 은 링크하지 않는다. 링크를 만든 것은 v1 스모크 시험용 사본뿐이다(`cockpit/smoke/scratch.mjs:92-96`).
   그래서: 봇 폴더를 `prodev/bots/` 밖으로 옮기면 스킬이 안 실릴 수 있다.
2. **CLAUDE.md · 스킬이 실렸다는 기록.** `cockpit/docs/ARCHITECTURE_EXPLANATION.md` 10 · 14절은 "실린 기록이 없다" 고 적었다. 4절의 확인은 그 뒤 시험 설치본의 세션 기록에서 본 것이다.
   그래서: 두 문서를 나란히 읽으면 서로 다른 말로 보인다. 4절이 더 나중의 확인이다.
3. **홈 폴더(내 계정의 맨 위 폴더, 맥은 `/Users/<이름>`) 아래에 설치하면 개인 지침이 섞인다.** 확인한 것: 시험 설치본(`~/cockpit-try-v2`) 봇 세션 기록 14번째 줄에 `~/.claude/CLAUDE.md` 가 시작 지시문 첨부로, "project instructions" 표시를 달고 실렸다. 추정한 것: 까닭은 위로 올라가는 탐색이 홈 폴더까지 닿았기 때문으로 보인다. `settingSources` 에 사람 개인 설정(`'user'`)은 없다.
   그래서: 설치한 사람의 개인 지침이 봇의 말투나 행동에 섞일 수 있다.
4. **열린 실(threads) 자리가 엇갈린다.** intake 는 봇 폴더 `threads/` 에 쓰고, brief · close 도 거기서 읽는다(`intake/SKILL.md:73` · `brief/SKILL.md:26` · `close/SKILL.md:24`). 켤 때 훅은 과제 폴더 `threads/` 에서 읽는다(`session-start.js:105`).
   그래서: 켤 때 싣는 "열린 실" 절에서 빠진다. brief · close 에는 보인다.
5. **`node scripts/index.js next E` 는 코드상 없는 명령으로 보인다.** 스킬 넷의 여섯 곳(`intake/SKILL.md:66,92` · `analysis:105` · `research:66` · `schedule:41,62`, `next E` · `next R` · `next D`)이 쓰지만 `index.js` 는 첫 인자를 과제 폴더로 읽는다(`index.js:26-28`). 다음 번호는 인자 없이 돌린 출력의 `next E:` 줄에 나온다(`:249`). 실행해 보지는 않았다.
   그래서: 5.1절 ① 번호 받기에서 봇이 한 번 헤맬 수 있다.
6. **cron.** `brief` · `journal` · `prodev-orchestrator` 스킬은 cron 08:00 · 18:30 을 말한다. `retro` 스킬 · `setup.js:12` · ADR-036 은 cron 이 없다고 한다. `prodev/docs/launch.md:361-376` 의 `setup.js cron` 명령은 없다.
   그래서: 아침 브리핑 · 저녁 일지는 저절로 오지 않는다. 사람이 불러야 한다.
7. **find.log 자리.** `AS-IS-TO-BE-v2.md:27` 은 과제 폴더라 적었지만 실제는 봇 폴더다(`find.js:275`).
   그래서: 과제 폴더에서 `find.log` 를 찾으면 없다.
8. **옛 판 문구가 남은 자리.** 스킬 넷(`intake` · `paper` · `report` · `patent`)의 "`files` 방" · `prodev/docs/as-built.md`(2026-09-11 판) · `prodev/docs/launch.md` 0절 · `prodev/README.md:966` 의 `open-project` 안내 · `setup.js:352-354` 끝 안내 · `bootstrap.sh` 끝 줄 "README '봇을 돌리는 법'" · `WINDOWS.md:168` 채널 플러그인 빌드.
   그래서: 이 안내를 따라 하면 지금 판에 없는 명령이나 방을 찾게 된다. 방 만들기 실패 응답에도 옛 안내가 섞일 수 있다.
9. **cockpit · knowledge 는 핀도 원격도 없다** (8.2절).
   그래서: 새 기계에서 `bootstrap.sh` 만으로는 cockpit 을 못 받는다. 폴더를 따로 복사해 와야 한다.
10. **실제 `prodev/bots/` 와 `projects/` 는 옛 판 산출물이다.** `.env` · `.mcp.json` 이 있고 `settings.local.json` 이 없다. v2 모습의 실물은 `~/cockpit-try-v2` 에만 있다.
    그래서: 이 작업 폴더의 봇 폴더를 v2 의 본보기로 삼으면 틀린다.
