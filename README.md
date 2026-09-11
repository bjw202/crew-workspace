# crew-workspace

과제 비서 봇 **prodev** 를 만들고(prodev), 검수하고(meta), 돌리는(minidiscord + projects) 자리 하나.

## 무엇이 어디에 있나

디스크에 있는 것과 채팅 서버 안에만 있는 것을 나눠서 본다. **방(room)은 폴더가 아니다.** 채팅 서버가 자기 DB 안에 두는 대화 창이고, 브라우저의 방 목록에만 보인다.

```
crew-workspace/                         ← 이 저장소
├── prodev/                             봇의 코드 · 스킬 · 훅 · 설계 문서        (자기 저장소 bjw202/prodev)
│   ├── scripts/setup.js                과제를 여는 명령
│   └── bots/
│       └── prodev-수율개선-bot/         과제 하나의 봇 설정. setup 이 만든다
│           ├── .claude/settings.json     훅 · 허용 목록
│           ├── .mcp.json                 채팅 서버 연결
│           ├── .env                      토큰 둘 (봇 · 알림 계정)
│           └── rooms.json                "내 방은 8번과 9번" 같은 방 번호표
├── projects/                           과제 자료 창고. 과제 하나 = 폴더 하나 = git 하나
│   └── 수율개선/                        setup 이 만든다. 봇이 여기에 쓴다
│       ├── charter.md · schedule.md      헌장 · 일정
│       ├── inbox/                        사람이 올린 원본 (불변)
│       ├── cards/                        실험 카드 (원본을 읽어 정리한 것)
│       ├── wiki/                         카드에서 자란 지식
│       └── journal/ · research/ · report/ · paper/ · patent/
├── knowledge/                          회사 지식. 과제가 끝날 때 그 과제 wiki 에서 골라 올린 페이지 (PL 결재 뒤 봇의 close 스킬이 쓴다)
├── minidiscord/                        채팅 서버 코드                             (자기 저장소 bjw202/minidiscord)
│   └── data/
│       └── minidiscord.db              ★ 채팅 DB. 계정 · 봇 계정 · 방 · 글이 전부 여기
├── meta/                               검수 자리. 예측 · 정답지 · 대본 · 검수 기록 · 인수인계
├── crew/                               옛 실험(봇 다섯). 2026-09-09 닫음. 읽기만        (자기 저장소 bjw202/crew)
├── README.md · WINDOWS.md · workspace.json · bootstrap.sh · .gitignore · .gitattributes
```

채팅 서버 안(★ 그 DB 안)에만 있는 것:

```
minidiscord.db
├── 사람 계정        PL · 과제원들
│                    prodev-setup  (setup 이 봇을 등록하고 방을 만들 때 쓰는 사람 계정. 자동으로 생긴다)
│                    prodev-notify (봇이 꺼져 있을 때 대신 알림 글을 올리는 사람 계정. 자동으로 생긴다)
├── 봇 계정          prodev-수율개선-bot
└── 방 (room)        prodev-수율개선          ← 본방. 말은 여기서
                     prodev-수율개선/files    ← 파일은 여기에
```

한 과제를 열면 셋이 생긴다: 디스크에 **과제 폴더**(자료)와 **봇 설정 폴더**, 채팅 서버 안에 **방 둘**(대화). 방은 입구, 과제 폴더가 진실이다 — 사람이 방에 올린 파일을 봇이 과제 폴더에 카드로 정리한다.

| 폴더 | git |
|---|---|
| `meta/` · 루트 파일 여섯 · `projects/`(빈 폴더 표시만) | **이 저장소**(crew-workspace)가 담는다 |
| `prodev/` · `minidiscord/` · `crew/` | 각자 저장소. 이 저장소는 `workspace.json` 으로 커밋만 가리킨다 |
| `projects/수율개선/` 같은 과제 내용 | 각 과제가 자기 git. **여기에 올리지 않는다** (회사 자료) |
| `knowledge/` | 작은 저장소 (원격은 회사에서 정한다) |

규칙 하나: **prodev 를 고치는 사람은 prodev 안에서 브랜치 + PR 로, 검수하는 사람은 meta 에서.** 만드는 자리와 재는 자리를 나눈 것이 이 구조의 전부다.

## git 은 이렇게 한다

저장소를 합치지 않는다. 이 저장소(crew-workspace)는 `meta/` 와 목록 파일 `workspace.json` 만 담고, 나머지 셋은 **가리키기만** 한다. 목록 파일에는 "prodev 는 이 커밋, minidiscord 는 이 커밋"이 적혀 있다.

```
crew-workspace  (GitHub: bjw202/crew-workspace)
├── README.md · WINDOWS.md · workspace.json · bootstrap.sh · .gitignore · .gitattributes
├── meta/                ← 직접 담는다
├── prodev/              ← .gitignore. 자기 저장소 (bjw202/prodev)
├── minidiscord/         ← .gitignore. 자기 저장소 (bjw202/minidiscord)
├── crew/                ← .gitignore. 자기 저장소 (bjw202/crew)
└── projects/            ← .gitignore. 회사 자료
```

### 무엇이 필요한가 (기계 하나에 한 번)

Node ≥ 22 · npm · git · python3(+ openpyxl · matplotlib) · Claude Code + minidiscord 채널 플러그인 · 인터넷.

그리고 **셸 하나** — 이 작업판은 처음부터 끝까지 유닉스 셸을 전제로 한다. `bootstrap.sh` 만이 아니라,
봇의 허용 목록(`grep` · `sed` · `awk` · `python3` · `shasum` …) · 상태줄(`common/statusline.sh`) ·
meta 의 검수 도구(`gate-tests.sh` · `replay.sh` · `weekly.sh`) · README 의 서버 켜는 명령(`VAR=값 명령` 꼴)이
전부 그렇다.

| 운영체제 | 무엇을 깔고 | 어디서 명령을 치나 |
|---|---|---|
| macOS · Linux | 이미 있다 | 기본 터미널 |
| 윈도우 | **WSL 2**(권함) 또는 **Git for Windows**(Git Bash) 하나 | 그 Ubuntu 창 또는 Git Bash 창 |

**윈도우 사람은 [`WINDOWS.md`](WINDOWS.md) 를 먼저 읽는다** — 둘 중 무엇을 고르나, 무엇을 깔고, 깔고 나서
무엇을 한 번 쳐서 확인하나, 그리고 윈도우에서만 생기는 자리 여섯이 거기 있다.

윈도우에서 PowerShell · CMD 로는 돌지 않는다. **PowerShell 판 스크립트를 따로 두지 않는 것은 일부러다** —
바꿔야 할 것이 bootstrap 하나가 아니라 위의 넷 전부이고, 사본을 두면 `workspace.json` 의 뜻이 두 군데로
갈라진다. 셸 하나를 깔면 넷이 한꺼번에 풀린다. (Claude Code 자체는 윈도우에서 Git for Windows 없이도 돌지만,
그때는 Bash 도구 대신 PowerShell 도구를 쓴다 — 봇의 허용 목록이 그 위에서 맞지 않는다.)

WSL 2 를 고르면 작업판을 WSL 쪽 파일 시스템(`~/…`)에 두는 편이 낫다. `/mnt/c/…` 는 git 과
`node:sqlite` 가 느리다.

### 처음 받을 때 (새 기계)
```bash
git clone https://github.com/bjw202/crew-workspace.git
cd crew-workspace
sh bootstrap.sh             # workspace.json 을 읽어 prodev · minidiscord · crew 를 적힌 커밋으로 받는다
```
윈도우면 같은 세 줄을 **Git Bash 창** 또는 **WSL 터미널**에서 친다.

### 평소
- prodev 를 고칠 때: `cd prodev` 에서 브랜치를 만들고 PR. 이 저장소는 모른다.
- minidiscord 를 고칠 때: `cd minidiscord` 에서 자기 방식대로. 이 저장소는 모른다.
- meta 가 검수를 끝냈을 때만: `workspace.json` 의 커밋을 올리고 `meta/` 기록과 함께 이 저장소에 커밋한다. 그래서 이 저장소의 이력 = "언제 어느 코드를 검수했나".

### 하지 않는 것
- `prodev/` `minidiscord/` `crew/` `projects/` 안의 파일을 이 저장소에 추가하지 않는다 (`.gitignore` 가 막는다).
- 토큰(`.env` · `runs/.tokens.env`) · 채팅 DB(`*.db`) · `node_modules` 를 올리지 않는다.

## 봇을 돌리는 법

### 먼저, 등장하는 것 넷

| 무엇 | 한 줄 | 어디 있나 |
|---|---|---|
| **채팅 서버** (minidiscord) | 사람과 봇이 글을 주고받는 곳. 카카오톡 서버 같은 것 | `minidiscord/` 가 켜 두는 프로세스. 자료는 `MINIDISCORD_DATA_DIR` 폴더에 쌓인다 |
| **과제 폴더** (project) | 과제 하나의 **자료 창고**. 원본 파일 · 실험 카드 · 위키 · 일지가 파일로 쌓이고 git 이 이력을 지킨다 | `projects/<과제>/` |
| **방** (room) | 과제 하나의 **대화 창구**. 채팅 서버 안에 있다. 과제마다 둘 — 본방(말) 과 `/files`(파일) | 채팅 서버 안. 파일로는 없다 |
| **봇** | 과제 하나를 맡는 Claude Code 세션. 방에서 듣고, 과제 폴더에 쓴다 | 세션의 설정은 `prodev/bots/<봇 이름>/` |

방과 과제 폴더의 관계: **방은 입구, 과제 폴더가 진실.** 사람이 방에 파일을 올리면 봇이 그것을 과제 폴더에 카드로 정리한다. 방을 지워도 과제 폴더는 남고, 과제 폴더를 옮겨도 방은 그대로다. 그래서 둘을 따로 만든다 — `setup.js --project` 는 과제 폴더와 봇 설정을, `setup.js rooms` 는 채팅 서버에 방 둘을 만든다.

### 켜는 순서 — 터미널 셋

**1. 채팅 서버** (`minidiscord/` 에서)
```bash
cd minidiscord
MINIDISCORD_PORT=3000 \
MINIDISCORD_DATA_DIR=./data \
MINIDISCORD_BOT_FILES_DIR=$PWD/../projects \
  npx tsx server/src/index.ts
```

| 환경변수 | 뜻 | 값을 어떻게 정하나 |
|---|---|---|
| `MINIDISCORD_PORT` | 서버가 여는 포트. 브라우저 주소의 뒷자리 | 실전 3000. 시험은 다른 번호(예 3123) |
| `MINIDISCORD_DATA_DIR` | 채팅 DB(`minidiscord.db`)와 업로드 파일이 쌓이는 폴더. 없으면 서버가 만든다 | 실전 `./data`. 시험은 다른 폴더 — 포트만 바꾸면 같은 DB 를 쓰게 되니 **둘 다** 바꾼다 |
| `MINIDISCORD_BOT_FILES_DIR` | 봇이 방에 **첨부할 수 있는** 파일의 뿌리. 이 밖의 파일을 첨부하면 서버가 조용히 뺀다 | 과제 폴더들의 **부모** = `projects/` (절대 경로) |

브라우저에서 `http://127.0.0.1:3000` 을 열고 이름 하나로 들어간다 (비밀번호 없음. 처음 쓰는 이름이면 그 자리에서 계정이 생긴다). 사람 계정은 PL 과 과제원들이다.

**2. 과제 폴더 · 봇 설정 · 방 둘** (`prodev/` 에서. 과제 이름을 정한다 — 예 `수율개선`)
```bash
cd prodev
export MINIDISCORD_URL=http://127.0.0.1:3000 \
       MINIDISCORD_DIR=$PWD/../minidiscord \
       MINIDISCORD_DB=$PWD/../minidiscord/data/minidiscord.db \
       MINIDISCORD_BOT_FILES_DIR=$PWD/../projects
node scripts/setup.js --project 수율개선
node scripts/setup.js rooms 수율개선
```

| 환경변수 | 뜻 | 값 |
|---|---|---|
| `MINIDISCORD_URL` | setup 이 봇을 등록하고 방을 만들 때 부르는 서버 주소 | 1단계의 포트와 같게 |
| `MINIDISCORD_DIR` | 채팅 서버 코드 폴더. 봇이 붙는 채널 플러그인이 여기 있다 | `minidiscord/` |
| `MINIDISCORD_DB` | 채팅 DB 파일. 봇의 훅이 "확정 글이 진짜 사람 글인가"를 확인할 때 **직접 읽는다** (쓰지 않는다) | 1단계 `DATA_DIR` 안의 `minidiscord.db` |
| `MINIDISCORD_BOT_FILES_DIR` | 1단계와 같은 값. `--project` 에 이름만 주면 **이 아래에** 과제 폴더를 만든다 | `projects/` |

두 명령이 만드는 것 — 첫째는 **디스크**에, 둘째는 **채팅 서버 안**에:

| 명령 | 디스크에 생기는 것 | 채팅 서버(DB) 안에 생기는 것 |
|---|---|---|
| `setup.js --project 수율개선` | ① `projects/수율개선/` (없으면 만들고 `git init`) · ③ `prodev/bots/prodev-수율개선-bot/` (봇 설정 폴더: 훅 · 허용 목록 · 서버 연결 · `.env`) | ② **봇 등록**: 채팅 서버에 봇 계정 `prodev-수율개선-bot` 을 만들고 받은 봇 토큰을 `.env` 에 적는다 · 알림 계정 `prodev-notify` 로 로그인해 그 토큰도 `.env` 에 적는다 |
| `setup.js rooms 수율개선` | `prodev/bots/prodev-수율개선-bot/rooms.json` (방 번호표 한 장) | **방 둘** `prodev-수율개선` (본방) · `prodev-수율개선/files` 를 만들고 봇을 둘 다 참여시킨다. 브라우저의 방 목록에 나타난다 |

> ### 토큰은 사람이 만지지 않는다
> 봇을 돌리는 데 필요한 토큰은 둘이고, **둘 다 setup 이 받아서 `.env` 에 스스로 적는다.**
>
> | 토큰 | 무엇 | 누가 받나 |
> |---|---|---|
> | `MINIDISCORD_TOKEN` | 봇 계정의 토큰. 봇 세션이 채팅 서버에 붙을 때 쓴다 | setup ② 가 봇을 등록하면서 받는다 |
> | `PRODEV_NOTIFY_TOKEN` | 알림 계정 `prodev-notify` 의 세션 쿠키. 봇이 꺼져 있을 때 훅과 cron 이 글을 올릴 때 쓴다 | setup ② 가 그 계정으로 로그인하면서 받는다 |
>
> 사람이 브라우저에서 쿠키를 꺼내거나, 값을 복사해 붙이거나, `.env` 를 열어 고칠 일이 **없다.** `.env` 를 열어 보면 줄마다 무엇인지 풀이가 한 줄씩 있다.
> 조건은 하나 — **1단계의 채팅 서버가 켜져 있을 것.** 서버가 꺼진 채 setup 을 돌리면 폴더와 설정만 만들고 "서버 없음, 건너뜀"이라 말한 뒤 끝난다. 서버를 켜고 같은 명령을 한 번 더 돌리면 그때 등록하고 토큰을 받는다 (이미 된 것은 건드리지 않는다).
>
> 예외 하나: meta 가 검수 대본을 재생할 때 쓰는 PL · 과제원 토큰은 검수용이라 따로 있다 (`meta/prodev-review/HANDOFF.md`). 봇을 돌리는 것과는 무관하다.
>
> **채팅 서버 웹 화면의 "봇 등록" 버튼은 prodev 봇에 쓰지 않는다.** 그 화면이 시키는 일(봇 등록 · 토큰 · `.mcp.json` 만들기 · 방 참여)을 setup 이 전부 대신 한다. 웹에서 같은 이름으로 먼저 등록해 버리면 setup 이 "서버에 있는데 토큰이 없다"고 멈추니, 그때는 웹에서 그 봇을 지우고 setup 을 다시 돌린다. 그 화면은 crew 시절(봇 다섯)에 봇을 손으로 붙이던 것이고, 나중에 봇을 여럿 붙일 때 다시 쓴다. 지금은 열지 않으면 된다.

`rooms` 는 폴더를 만드는 명령이 아니다. 채팅 서버에 "이 과제의 대화 창 둘을 열어라"고 시키는 것이고, 디스크에는 방 번호를 적은 `rooms.json` 만 남는다.

봇 이름은 `prodev-<과제>-bot` 꼴로 setup 이 붙인다. 사람이 채팅에서 봇을 부를 때 이 이름을 쓴다: `@TO(prodev-수율개선-bot) …`.

`prodev-notify` 는 무엇인가. 봇이 켜져 있지 않은 순간에도 방에 글이 올라가야 할 때가 있다 — 아침 브리핑 예약(cron), 봇의 기억이 압축되기 직전의 "정리 중입니다". 채팅 서버는 봇 글을 봇 세션을 통해서만 받으므로 이런 글은 **사람 계정 하나**가 대신 올린다. 그 계정이 `prodev-notify` 다(봇이 아니라 이름만 그런 사람 계정). setup 이 이 계정으로 한 번 로그인해 받은 세션 쿠키를 `.env` 의 `PRODEV_NOTIFY_TOKEN` 에 넣어 두고, 훅과 cron 이 그것으로 글을 올린다. `.env` 를 열면 그 줄 위에 이 풀이가 한 줄 적혀 있다. 사람이 할 일은 없다 (서버가 꺼진 채 setup 을 돌렸다면 서버를 켜고 한 번 더 돌리면 받는다).

**3. 봇 세션** (봇 폴더에서)
```bash
cd prodev/bots/prodev-수율개선-bot
claude --setting-sources project,local --strict-mcp-config --mcp-config .mcp.json \
       --dangerously-load-development-channels server:minidiscord-channel
```

| 조각 | 뜻 |
|---|---|
| 봇 폴더에서 켠다 | 훅 · 허용 목록 · 서버 연결이 전부 이 폴더의 설정에서 온다 |
| `--setting-sources project,local` | 이 PC 의 개인 설정을 봇에 섞지 않는다 |
| `--strict-mcp-config --mcp-config .mcp.json` | 이 파일에 적힌 채팅 서버 하나에만 붙는다 |
| `--dangerously-load-development-channels server:minidiscord-channel` | 채팅 서버와 세션을 잇는 채널 플러그인을 켠다 |

채팅에서 본방에 `@TO(prodev-수율개선-bot) 안녕` 하면 봇이 답한다.

사람이 외울 규칙은 한 줄: **말은 아무 데서나, 파일은 files 에.**

더 자세한 것(cron 등록 · 문제가 날 때 · 왜 이렇게 됐나)은 `prodev/docs/launch.md`. 검수 쪽 인수인계는 `meta/prodev-review/HANDOFF.md`.

### 시험할 때는 서버를 따로 띄운다
살아 있는 방을 건드리지 않으려고 **포트와 데이터 폴더를 둘 다** 바꾼다. 예: `MINIDISCORD_PORT=3123 MINIDISCORD_DATA_DIR=testplace/data2`. 2단계의 `MINIDISCORD_URL` 과 `MINIDISCORD_DB` 도 그에 맞춘다. 나머지 순서는 같다.
