# 윈도우에서 이 작업판을 세우는 법

이 작업판은 유닉스 셸 위에서 만들어졌다. 윈도우에서도 돌지만, **셸 하나를 먼저 깔아야 한다.**
이 문서는 그 한 번의 준비와, 윈도우에서만 생기는 자리들을 적는다.

맥·리눅스 사람은 이 문서를 읽을 필요가 없다. 받는 법은 `README.md` 의 '처음 받을 때'가 전부다.

---

## 0. 먼저 고르는 것 — WSL 2 냐 Git Bash 냐

둘 중 **하나만** 고르면 된다. 둘 다 깔 필요는 없다.

| | **길 A · WSL 2** (권함) | **길 B · Git Bash** |
|---|---|---|
| 한 줄 | 윈도우 안에 리눅스를 하나 띄우고, 작업판을 그 안에 둔다 | 윈도우에 그대로 두고, 셸만 Git 이 주는 bash 를 쓴다 |
| 맥에서 하던 것과 같은가 | **같다.** 이 문서의 나머지 대부분이 필요 없어진다 | 대체로 같지만 다른 자리가 몇 있다 (5절) |
| 깔 것 | WSL 2 + 그 안에 Node · git · python3 · Claude Code | Git for Windows + 윈도우용 Node · Python · Claude Code |
| 회사 PC 정책 | 가상화(Hyper-V)를 막아 두면 못 쓴다. **먼저 확인할 것** | 대개 막히지 않는다 |
| 파일을 윈도우 탐색기에서 보나 | 볼 수는 있다(`\\wsl$\…`). 다만 느리고 권한이 꼬인다 | 평소처럼 본다 |
| Claude Code 샌드박스 | 쓸 수 있다 | 쓸 수 없다 |

**회사 PC 는 길 C 다** — PowerShell 이 기본이고 Git for Windows 가 이미 깔려 있다(2026-09-11 실측, 3-C 절). 그 경우 아래 A · B 를 고를 필요가 없고 3-C 의 첫날 점검표로 바로 간다.

그 밖의 윈도우 기계라면 **어느 쪽이든 된다.** 2026-09-13 에 길 B·C 쪽(윈도우에 그대로)을 끝까지
밟아 서버 · 봇 · 방 · 첨부까지 확인했고, 그때 걸린 자리 열둘은 **코드로 고쳐 없앴다**(5.1).
그래서 "밟아 본 적이 없어서" WSL 을 고르던 까닭은 사라졌다.
WSL 2 는 여전히 **설정이 맥과 똑같아진다**는 이점이 있으니(5.2·6절을 읽지 않아도 된다) 편한 쪽을 고른다.
가상화가 막혀 있으면 길 B 로 간다. 대신 5절과 6절을 읽는다.

---

## 1. 왜 셸이 필요한가

`bootstrap.sh` 하나 때문이 아니다. 셸을 전제로 하는 자리가 넷이고, **그 넷이 다 핵심 경로에 있다.**

| 자리 | 무엇이 셸을 쓰나 | 어디서 확인했나 |
|---|---|---|
| 저장소 받기 | `bootstrap.sh` | 이 저장소 뿌리 |
| **봇의 손** | 봇에게 허용된 Bash 명령은 **열 건**(node · git · gh · python3 · mkdir · ls · date · echo · pwd · cd)이다. 2026-09-11 관문 A(ADR-033)에서 `grep` · `sed` · `find` 같은 유닉스 도구 스물하나를 뺐다 — `Grep` · `Glob` · `Read` 내장 도구가 덮는다. 그래도 `node` · `git` 은 셸로 부른다 | `prodev/common/settings.template.json` |
| 봇 상태줄 | `common/statusline.sh` (첫 줄 `#!/bin/bash`) | `prodev/common/statusline.sh` |
| meta 의 검수 도구 | `gate-tests.sh` · `replay.sh` · `weekly.sh` (전부 zsh) | `meta/prodev-review/scripts/tools/` |
| 서버 켜는 명령 | 맥 쪽 꼴이 `VAR=값 명령` 이다. **PowerShell 판은 `README.md` 에 나란히 있다** — 셸 없이도 서버·setup·봇은 켤 수 있다 | `README.md` '봇을 돌리는 법' |

Claude Code 자체는 윈도우에서 Git for Windows 없이도 돈다. 다만 그때는 **Bash 도구 대신 PowerShell 도구**를
쓰고, 위의 허용 목록 31건이 그 위에서는 맞지 않는다. 그래서 이 작업판에서는 셸이 선택이 아니다.

---

## 2. 길 A — WSL 2 (권함)

### 2.1 WSL 2 를 켠다
PowerShell 을 **관리자로** 열고:
```powershell
wsl --install -d Ubuntu
```
다시 켜라고 하면 다시 켠다. 그다음 시작 메뉴에서 **Ubuntu** 를 열면 리눅스 터미널이 뜬다.
여기서부터 치는 명령은 **전부 그 Ubuntu 창** 안이다. PowerShell 이 아니다.

`wsl --install` 이 "가상화를 쓸 수 없다"고 하면 회사 정책이 막은 것이다. 길 B 로 간다.

### 2.2 필요한 것을 깐다 (Ubuntu 창에서)
```bash
sudo apt update
sudo apt install -y git python3 python3-pip
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -   # Node 22
sudo apt install -y nodejs
pip3 install openpyxl matplotlib
curl -fsSL https://claude.ai/install.sh | bash                       # Claude Code
```
Node 는 **22 이상**이어야 한다. 채팅 서버가 `node:sqlite` 를 쓰는데 그 아래 판에는 없다.

### 2.3 작업판을 리눅스 쪽에 둔다
```bash
cd ~
git clone https://github.com/bjw202/crew-workspace.git
cd crew-workspace
sh bootstrap.sh
```

> **`/mnt/c/…` 에 두지 않는다.** 윈도우 디스크를 WSL 이 건너다보는 자리라 git 과 파일 읽기가 몇 배 느리고,
> 파일 권한(`chmod`)이 제대로 걸리지 않는다. `~/crew-workspace` 처럼 리눅스 쪽 집에 둔다.
> 탐색기에서 봐야 하면 주소창에 `\\wsl$\Ubuntu\home\<이름>\crew-workspace` 를 친다.

### 2.4 나머지는 README 대로
`README.md` 의 '봇을 돌리는 법'을 그대로 따른다. 이 뒤로는 맥·리눅스와 다른 것이 없다.

---

## 3. 길 B — Git Bash (윈도우에 그대로)

### 3.1 Git for Windows 를 깐다
<https://git-scm.com/downloads/win> 에서 받아 깐다. 설치 중 물어보는 것 둘만 신경 쓴다:

| 물음 | 고를 것 | 까닭 |
|---|---|---|
| "Configuring the line ending conversions" | **Checkout as-is, commit as-is** | 줄끝을 건드리지 않는다. (이 저장소는 `.gitattributes` 로도 막아 두었으니 어느 쪽이어도 `.sh` 는 안전하다. 다만 `projects/` 의 회사 자료까지 생각하면 as-is 가 낫다) |
| "Adjusting your PATH environment" | 가운데(**Git from the command line and also from 3rd-party software**) | 다른 프로그램이 git 을 찾을 수 있게 한다 |

깔고 나면 시작 메뉴에 **Git Bash** 가 생긴다. 이 뒤로 치는 명령은 **전부 Git Bash 창** 안이다.

### 3.2 Node · Python · Claude Code 를 깐다 (윈도우용)
- **Node 22 이상** — <https://nodejs.org> 에서 LTS 설치본. 깐 뒤 Git Bash 에서 `node -v` 가 `v22` 이상이면 된다.
- **Python 3** — <https://python.org> 설치본을 쓸 때 **"Add python.exe to PATH"** 를 반드시 켠다.
  깐 뒤 `pip install openpyxl matplotlib`.
- **Claude Code** — PowerShell 에서 `irm https://claude.ai/install.ps1 | iex`. 그다음 Git Bash 에서 `claude --version` 으로 확인한다.

> **`python3` 라는 이름을 만들어 둔다.** 이 작업판의 코드는 `python3` 를 부른다(`prodev/scripts/peek.js` ·
> `scripts/plot.py`). 그런데 python.org 설치본은 `python.exe` 만 만든다. Git Bash 에서
> `python3 -V` 가 안 되면, 그 창에서 한 번만:
> ```bash
> echo 'alias python3=python' >> ~/.bashrc
> ```
> 이것만으로는 **봇 안에서는 안 풀린다** (봇은 별도 PATH 로 뜨고, 별칭은 그 PATH 에 없다). 확실한 쪽은
> Python 설치 폴더에서 `python.exe` 를 `python3.exe` 라는 이름으로 **복사**해 두는 것이다.
> 마이크로소프트 스토어판 Python 을 깔면 `python3.exe` 가 처음부터 생기므로 그쪽이 더 간단하다.

### 3.3 받는다 (Git Bash 창에서)
```bash
cd ~
git clone https://github.com/bjw202/crew-workspace.git
cd crew-workspace
sh bootstrap.sh
```

### 3.4 Claude Code 가 Git Bash 를 못 찾을 때
`claude` 가 Bash 도구 대신 PowerShell 을 쓰고 있으면, 사용자 설정(`%USERPROFILE%\.claude\settings.json`)에
자리를 박아 준다:
```json
{ "env": { "CLAUDE_CODE_GIT_BASH_PATH": "C:\\Program Files\\Git\\bin\\bash.exe" } }
```

---

## 3-C. 길 C — PowerShell + Git Bash (회사 PC 가 이 경우다 · 2026-09-11 실측)

길 A 도 길 B 도 "셸 창을 연다"를 전제했다. 회사 PC 는 **PowerShell 이 기본이고 Git for Windows 가 이미 깔려 있다.**
2026-09-11 에 사람이 그 기계의 Claude Code 세션에서 직접 쳐 본 결과라 **추측이 아니라 실측이다**
(`meta/prodev-review/plans/2026-09-11-handoff-evolution.md` 6.0).

| 무엇 | 결과 | 그래서 |
|---|---|---|
| Git Bash | **있다. Claude Code 안에서 Bash 도구가 돈다** | 봇 허용 목록이 그대로 맞는다. 셸 창을 따로 열 필요가 없다 |
| 경로 꼴 | `/d/claude-workspace/…` | 맥과 같은 슬래시 표기 |
| `node` | v24.14.0 | `node:sqlite`(22 이상) 문제없다 |
| `claude -p` 를 node 가 띄우나 | 성공 | 압축 인수인계서(`pre-compact.js`)가 돈다 |
| `zsh` | **없다** | meta 도구 셋(`gate-tests.sh` · `replay.sh` · `weekly.sh`)이 안 돈다. `evo-count.js` 는 node 라 돈다 |
| `crontab` · `schtasks` | 없다 / bash 에서 못 부른다 | **상관없다** — 자동 브리핑을 두지 않기로 했다(계획 문서 9절) |
| `python` | 3.14.3 | **`python3` 라는 이름으로도 불리는지 미확인.** 코드는 `python3` 를 부른다(3.2 상자) |
| 파이썬 꾸러미 | 미확인 | `openpyxl` · `matplotlib`(봇용) · `pandas` · `scipy` · `statsmodels`(분석용) — **사람이 미리 깐다**(`prodev/docs/launch.md` 10.4) |

**PowerShell 에서 할 것은 둘뿐이다** — Claude Code 설치(`irm https://claude.ai/install.ps1 | iex`)와 `claude` 를 띄우는 것. 그 뒤로는 Claude Code 의 Bash 도구가 Git Bash 를 쓴다.
봇 설정에는 `setup.js` 가 `CLAUDE_CODE_GIT_BASH_PATH` 를 박아 두므로(ADR-033) 3.4 를 손으로 할 일이 줄었다 — 다만 Git 이 다른 자리에 깔렸으면 같은 이름의 환경변수로 덮는다.

### 길 C 첫날 점검표

순서대로. 막히면 거기서 멈추고 **무엇이 어떻게 막혔는지** `meta/prodev-review/runs/` 에 한 줄 적는다. 고치는 것은 그다음이다.
1주차는 **계측 교정 주**로 친다 — 도구가 그 기계에서 처음 돈다(계획 문서 10.2).

| # | 무엇 | 어떻게 확인하나 | 막히면 무엇이 안 되나 |
|---|---|---|---|
| 1 | `python3 -V` 가 Git Bash 안에서 된다 | Claude Code 의 Bash 도구로 `python3 -V` | `peek.js` 의 xlsx 와 `plot.py` 그림, 분석 `run.py` 전부 |
| 2 | 분석 꾸러미 다섯 | `python3 -c "import openpyxl, matplotlib, pandas, scipy, statsmodels"` | xlsx · 그림 · 분석(`analysis` 스킬)이 각각 빠진다. 설치는 `py -m pip install …` |
| 3 | `setup.js --project <과제>` 가 자리 넷을 만든다 | `ls projects/<과제>` 에 `analysis/` · `templates/` · `house.md` · `.gitignore` | 진화 장치가 꽂힐 자리가 없다 |
| 4 | 봇 설정의 PATH 와 Git Bash | `bots/<봇>/.claude/settings.json` 의 `env.PATH` 에 `Git\usr\bin`, `env.CLAUDE_CODE_GIT_BASH_PATH` 가 실제 `bash.exe` 자리 | 봇의 `node scripts/*.js` 가 승인 창을 만난다 |
| 5 | 봇 권한 패턴 | 봇을 띄워 과제 폴더에 파일 하나를 쓰게 한다 — 승인 창 없이 되는가 | 5.1 의 1 (코드로 고쳤다. 여기서는 확인만 — 7절 18·19) |
| 6 | 봇이 사진을 보나 | 과제 폴더의 그림 하나를 읽혀 무엇이 보이는지 묻는다 | 이미지 계측(`analysis` 스킬 "사람 눈으로만 확인되는 것")이 못 돈다 |
| 7 | 채널 플러그인 빌드 | `minidiscord` 에서 `npm install` · `npm run build -w channel` → `channel/dist/index.js` | 봇이 방에 못 붙는다 |
| 8 | 서버 첨부 경로 | 방에 파일을 올리고 봇이 카드에 첨부하는 데까지 | 5.1 의 7 (코드로 고쳤다 — 소문자 드라이브 문자에 첨부가 조용히 사라지던 자리) |
| 9 | 한글 폴더 이름 · 경로 길이 | `setup.js --project 수율개선` · 작업판을 `C:\Users\<이름>\` 바로 아래에 | 260자 제한 · 코드페이지 |
| 10 | `house.md` 상한 | 51줄로 만들어 봇을 켠 첫 답에 "50줄을 넘어 안 실렸다"가 나오는가 | 규칙 폭주를 막는 자리(ADR-032) |
| 11 | meta 도구 | `node meta/prodev-review/scripts/tools/evo-count.js` 가 돈다 (zsh 셋은 안 돈다 — 옮길 후보) | 주간 계측(`weekly.sh`)을 손으로 대신한다 |

---

## 4. 깔고 나서 한 번 치는 점검

Git Bash 또는 Ubuntu 창에서 `crew-workspace` 안에 들어가 아래를 통째로 붙인다.
**봇이 실제로 쓰는 것만** 고른 목록이다.

```bash
for c in git node npm python3 grep sed awk find sort uniq wc head tail cat cp diff stat file tr cut basename dirname; do
  command -v "$c" >/dev/null 2>&1 && echo "OK   $c" || echo "없음 $c   <-- 이것을 쓰는 일이 전부 막힌다"
done
command -v shasum >/dev/null 2>&1 || command -v sha256sum >/dev/null 2>&1 \
  && echo "OK   shasum/sha256sum" || echo "없음 shasum/sha256sum"
node -e 'const v=+process.versions.node.split(".")[0]; console.log(v>=22?"OK   node "+process.versions.node:"낮음 node "+process.versions.node+"  <-- 22 이상이어야 한다")'
node -e 'require("node:sqlite"); console.log("OK   node:sqlite")' 2>/dev/null || echo "없음 node:sqlite  <-- 채팅 DB 를 못 읽는다"
python3 -c 'import openpyxl' 2>/dev/null && echo "OK   openpyxl" || echo "없음 openpyxl  <-- xlsx 를 못 연다 (csv 는 된다)"
python3 -c 'import matplotlib' 2>/dev/null && echo "OK   matplotlib" || echo "없음 matplotlib  <-- 그림만 안 그려진다 (죽지는 않는다)"
claude --version >/dev/null 2>&1 && echo "OK   claude" || echo "없음 claude  <-- 봇을 못 띄운다"
```

**"없음" 이 하나도 없어야 다음으로 간다.** 무엇이 없으면 무엇이 안 되는지는
`prodev/docs/launch.md` 10.4 절에 표로 있다.

---

## 5. 윈도우에서만 생기는 것 — **2026-09-13 에 끝까지 밟고 고쳤다**

여기까지의 절(0~4)은 "깔고 받는" 이야기다. 이 절부터는 **실제로 밟아 본 결과**다.
윈도우 11 Home 26200 · Git for Windows 2.49 · Node 24.19 · Python 3.13 · Claude Code 2.1.269 ·
시스템 코드페이지 **949**(UTF-8 아님) 에서, 채팅 서버를 띄우고 봇을 방에 넣어 답과 첨부까지 받았다.

막히는 자리는 **열둘**이었다. 그중 **아홉이 오류를 내지 않는다** — 봇이 일을 안 하거나 결과만 틀린다.
그래서 "봇이 떴다"를 성공으로 치면 안 된다. 7절 확인표를 끝까지 친다.

### 5.1 코드로 고쳐 없앤 것 — **사람이 할 일이 없다**

아래는 전부 `prodev` · `minidiscord` 저장소에 들어간 고침이다.
**맥·리눅스 동작은 한 바이트도 바뀌지 않는다** (플랫폼 갈래는 win32 쪽에만 있고, posix 값은 그대로다).

| # | 무엇이 어떻게 망가졌나 | 밖에서 보이던 모습 | 고친 자리 |
|---|---|---|---|
| 1 | 봇 권한 패턴이 `//C:/…` 꼴이라 **한 건도 안 맞았다** | 봇이 말은 하는데 **파일을 하나도 못 만든다.** 오류 없음 | `prodev/scripts/setup.js` `pat()` |
| 2 | 훅 명령이 역슬래시라 **bash 가 escape 로 먹었다** (`C:\a\b` → `C:ab`) | 세션이 멀쩡히 뜨고 방에도 붙는다. 그런데 **헌장·규칙이 안 실리고 분량 검사·확정 관문·발송 결재가 안 걸린다** | 같은 파일 `{{HOOKS}}`·`{{STATUSLINE}}` |
| 3 | 봇 PATH 에 Git 의 유닉스 도구 자리가 안 들어갔다 | 봇이 `ls`·`mkdir`·`date` 를 못 찾아 **승인 창**이 뜬다 (오류가 아니다) | 같은 파일 `FIRST_DIRS` — Git 자리를 스스로 찾아 **앞에** 넣는다 |
| 4 | 환경 점검이 윈도우에서 `git`·`node` **둘만** 봤다 | `grep` 이 없어도 "명령 2개 모두 풀림" 이라고 **초록으로** 지나간다 | 같은 파일 `NEEDED` — 목록을 플랫폼으로 안 가른다 |
| 5 | 방 알림이 `curl` 을 불렀다 | 알림 한 줄의 한글이 `????` 로 올라간다. **어느 `curl` 이 잡히는지에 따라 달라진다** (5.3 ①) | `prodev/common/hooks/places.js` — `fetch` + `FormData` 로 바꿔 curl 의존을 없앴다 |
| 6 | 파이썬 stdout 이 콘솔 코드페이지였다 | xlsx 요약과 그림 경로가 `?????` 로 **깨진 채 카드에 들어간다** | `prodev/scripts/peek.js`(`PYTHONIOENCODING`) · `scripts/plot.py`(스스로 `reconfigure`) |
| 7 | 서버가 첨부 뿌리를 대소문자까지 맞춰 비교했다 | `MINIDISCORD_BOT_FILES_DIR` 을 `c:/…`(소문자 드라이브)로 주면 **봇 첨부가 전부 조용히 사라진다** | `minidiscord/server/src/gateway.ts` `뿌리안()` — win32 만 대소문자 무시 |
| 8 | `chat.js` 가 준비된 문장을 안 붙잡았다 | Node 22 에서 `statement has been finalized` — **대화 검색(find 6층)이 통째로 못 돈다** | `prodev/scripts/chat.js` |
| 9 | 시험·러너가 `spawn('npx', …)` 를 썼다 | 윈도우에는 실행 가능한 `npx` 가 없다 → `ENOENT`. **서버 시험 25건 중 17건이 안 돌았다** | `prodev/test/server/setup.test.js` · `minidiscord/scripts/e2e-lib.mts` |
| 10 | e2e 종료가 `process.kill(-pid)`(프로세스 그룹)였다 | 윈도우에는 그룹 신호가 없다 → 러너가 안 끝난다 | `minidiscord/scripts/e2e-lib.mts` `stopServer` |
| 11 | 시험 둘이 열린 SQLite 핸들 위에서 폴더를 지웠다 | 윈도우는 열린 파일을 못 지운다 → `EPERM` → **sse 시험 아홉이 통째로 붉는다.** posix 에서는 조용히 새고 있었다 | `minidiscord/server/test/sse.test.ts` |
| 12 | 시험 하나가 `entry.startsWith('/')` 로 «절대 경로인가» 를 쟀다 | `C:\…` 에서 틀린다 | `minidiscord/server/test/rooms-bots.test.ts` → `isAbsolute` |

곁들여 고친 것 둘 (윈도우와 무관한데 포팅 중에 걸렸다):
- `session-start` 훅이 일지 날짜는 **로컬 달력**으로 짓고 «며칠 전» 은 **UTC 자정** 기준으로 셌다.
  한국(UTC+9)에서는 자정~오전 9시에 어제 일지가 "0일 전" 으로 나왔다. 로컬 달력 하나로 통일했다.
- `curl -sS` 는 4xx 에도 0 으로 끝나 알림 기록에 "보냄" 이라 적혔다. 이제 상태를 본다.

### 5.2 기계에서 사람이 하는 것 — **코드로 없앨 수 없는 것**

이 넷은 코드가 못 건드리는 자리다. 없으면 조용히 틀리거나 아예 안 깔린다.

| 무엇 | 왜 사람이 하나 | 안 하면 |
|---|---|---|
| **Python + C++ 빌드 도구** | `better-sqlite3@13` 은 미리 빌드된 바이너리를 안 받고 `node-gyp` 로 소스 빌드한다 | `npm install` 이 `gyp ERR! find Python` 으로 죽는다 |
| **`python3` 라는 이름** | 코드가 `python3` 를 부르는데 python.org 설치본은 `python.exe` 만 만든다. 별칭은 봇 안에서 안 풀린다 (봇은 다른 PATH 로 뜬다) | xlsx · 그림 · 분석 스킬이 전부 빠진다 |
| **파이썬 꾸러미 여섯** | 봇은 꾸러미를 깔지 않는다 (일부러 그렇게 정했다) | `openpyxl` 없으면 xlsx 를, `matplotlib` 없으면 그림을, `pandas`·`scipy`·`statsmodels` 없으면 분석을 못 한다 |
| **`core.autocrlf=false` (global)** | `setup.js --project` 가 과제 폴더마다 `git init` 을 하므로, system 기본값 `true` 면 **새로 여는 과제마다** 봇이 쓰는 카드·위키·일지가 CRLF 가 된다 | 스킬 머리말(`---`)을 못 찾고 `'…\r' !== '…'` 로 어긋난다 |

그리고 **한 번만** 하는 것 하나 — **작업판 신뢰(trust)**. 윈도우 전용이 아니라 **새 기계 첫날** 자리다.
승인 전이면 봇 세션 첫 줄에 `Ignoring 22 permissions.allow entries … this workspace has not been trusted`
가 뜨고 허용 목록이 **통째로 무시**돼 봇이 아무 파일도 못 쓴다.
봇 폴더에서 `claude` 를 한 번 대화형으로 켜 신뢰 물음에 예를 하면 끝난다.
(`~/.claude.json` 에 직접 넣을 수도 있다. 키는 **슬래시 꼴**이고, 오류 메시지가 정확한 키를 알려 준다.)

### 5.3 두 번 틀리게 적었던 것 — **고쳐 둔다**

먼저 밟은 세션이 남긴 진단 둘이 **틀렸다.** 다시 재서 바로잡는다. 틀린 진단은 다음 사람을 엉뚱한 데로 보낸다.

**① "MSYS 셸이 한글 인자를 ANSI 코드페이지로 떨어뜨린다" — 아니다.**
갈리는 것은 셸이 아니라 **그 exe 가 argv 를 ANSI 로 읽는가**다. 같은 인자를 네 군데로 넘겨 재 본 결과:

| 무엇 | bash → | node execFileSync → |
|---|---|---|
| `C:\Windows\System32\curl.exe` | 멀쩡 (UTF-8) | 멀쩡 (UTF-8) |
| `C:\Program Files\Git\mingw64\bin\curl.exe` | **깨짐** (cp949) | **깨짐** (cp949) |
| `python3` (Python 3.13) | 멀쩡 | 멀쩡 |
| `node` | 멀쩡 | 멀쩡 |

즉 `LC_ALL` 이나 시스템 코드페이지를 만질 일이 아니었다. 진짜 결함은 **`curl` 이라는 이름이
두 프로그램을 가리키고 둘이 다른 글자를 보낸다**는 것, 그리고 **어느 것이 잡히는지를 사람이 못 고른다**는 것이었다 —
같은 창에서 `curl` 은 System32 인데 `npm test` 안에서는 mingw 이 잡혔다(npm 이 PATH 를 다시 짠다).
**PATH 순서가 방에 올라가는 글자를 바꾸고 있었다.** 그래서 PATH 순서를 문서로 지키는 대신
알림 경로에서 curl 을 **뺐다**(5.1 의 5). 이제 prodev 는 `curl` 을 한 번도 부르지 않는다.

**② "윈도우에서 시험 133 통과 · 실패 0" — 아니었다.**
그 판에서 실제로는 **셋이 실패**했고(위 ①의 알림 셋), 그것을 못 본 채 통과로 적혔다.
지금은 133 통과 · 0 실패다 (7절 숫자는 전부 이 기계에서 실제로 센 것이다).

---

## 6. 설정 — **쓰는 법은 `README.md` 가 진실이다**

맥·윈도우 명령을 나란히 둔 «무엇이 필요한가» 와 «켜는 순서 — 터미널 셋» 은
[`README.md`](./README.md) 에 있다. **여기에 같은 것을 다시 적지 않는다** — 두 벌이 되면 갈리고,
갈리면 어느 쪽이 맞는지 아무도 모른다.

한 줄로 요약하면: **코드는 같고, 환경변수를 주는 문법과 경로 꼴만 다르다.**
`export VAR=값` ↔ `$env:VAR = "값"` · 줄 잇는 문자 `\` ↔ 백틱 `` ` `` · `/a/b` ↔ `C:/a/b`.

> **경로는 슬래시(`/`)로 줘도 된다** — 노드와 윈도우 API 가 둘 다 받는다. 역슬래시를 쓰려면
> PowerShell 에서는 그대로, **bash 안에서는 두 번**(`C:\\…`) 써야 한다. 섞기 싫으면 슬래시만 쓴다.
>
> 드라이브 문자 대소문자는 이제 **상관없다** (5.1 의 7 을 고쳤다). 그래도 큰 `C:` 로 적기를 권한다 —
> 눈으로 대조할 때 한 꼴이 편하다.

아래 6.1 은 **윈도우에만 있는 자리**라 여기 남긴다.

### 6.1 창마다 먼저 치는 PATH 한 줄 (사람 편의)

**`setup.js` 가 Git 의 유닉스 도구 자리를 스스로 찾아 봇 PATH 에 넣으므로(5.1 의 3) 봇에게는 필요 없다.**
**사람이** 그 창에서 직접 `ls` · `date` · `python3` 를 치려면 있어야 편하다.

PowerShell:
```powershell
$g = "C:\Program Files\Git"; $py = "$env:LOCALAPPDATA\Programs\Python\Python313"
$env:Path = "$g\bin;$g\usr\bin;C:\WINDOWS\system32;$g\mingw64\bin;" +
            "C:\Program Files\nodejs;$py;$py\Scripts;$env:USERPROFILE\.local\bin;C:\WINDOWS"
```

Git Bash:
```bash
g="/c/Program Files/Git"; py="$LOCALAPPDATA/Programs/Python/Python313"
export PATH="$g/bin:$g/usr/bin:/c/Windows/System32:$g/mingw64/bin:/c/Program Files/nodejs:$py:$py/Scripts:$HOME/.local/bin:/c/Windows"
```

**순서에 뜻이 있다.** `System32` 에도 `find.exe` · `sort.exe` 가 있는데 **전혀 다른 프로그램**이라
Git 의 것이 먼저 와야 한다. `mingw64\bin` 은 `pdftotext` 때문에 뒤에 둔다 —
거기 있는 `curl.exe` 는 한글 인자를 cp949 로 떨어뜨리므로 **앞에 두면 안 된다**(5.3 의 ①).
이 작업판은 이제 `curl` 을 부르지 않으니 봇에게는 상관없고, 사람이 손으로 칠 때만 해당한다.

잡히는 자리 확인:
```powershell
"bash","curl","node","python3","git","claude","pdftotext" | ForEach-Object {
  "{0,-10} {1}" -f $_, (Get-Command $_ -ErrorAction SilentlyContinue | Select-Object -First 1).Source
}
```
`bash` 가 `Git\bin`, `curl` 이 `System32` 여야 한다.

## 7. 확인표 — 여기까지 쳐야 «세운 것» 이다

위에서부터. 앞이 안 되면 뒤로 가지 않는다.
오른쪽 숫자는 **2026-09-13 에 이 기계에서 실제로 센 것**이다 (손으로 센 것이 아니라 스크립트 출력).

| # | 확인 | 되면 |
|---|---|---|
| 1 | `node -v` · `python -V` · `python3 -V` | Node ≥ 22 · 파이썬 두 이름이 **같은 판** |
| 2 | `python -c "import openpyxl, matplotlib, pandas, scipy, statsmodels"` | 조용히 끝난다 |
| 3 | `git config --get core.autocrlf` (global) | `false` |
| 4 | `npm install` (양쪽) · `npm run build -w channel` | `channel/dist/index.js` 생김 |
| 5 | minidiscord `npm test` | **server 293 통과 · 5 건너뜀 · 0 실패** · **channel 103 통과** |
| 6 | prodev `npm test` | **133 통과 · 0 실패** |
| 7 | prodev `MINIDISCORD_DIR=… npm run test:server` | **24 통과 · 1 건너뜀 · 0 실패** (건너뜀은 win32 의 crontab 칸) |
| 8 | minidiscord `npm run e2e` · `npm run e2e:scenario` | **15/15** · **20/20** |
| 9 | `chat.js search 수율` (fixture DB) | **141건** |
| 10 | 서버 health | `{"ok":true}` |
| 11 | `setup.js --project` | 과제 폴더 · `git` · 봇 폴더 · `.env` 토큰 둘 · `.mcp.json` · **"명령 15개 모두 풀림"** |
| 12 | 봇 설정에 `(//` 로 시작하는 허용/거부 패턴 | **0건** |
| 13 | 봇 설정의 훅 셋·statusLine 에 역슬래시 | **0건** |
| 14 | 봇 설정 `env.PATH` 에 `Git\usr\bin` | 있다 |
| 15 | 훅 셋과 statusLine 을 **bash 로 한 번 거쳐** 돌린다 (7.1) | 넷 다 `exit 0` · SessionStart 가 절 여덟을 낸다 |
| 16 | 봇을 띄운다 | **`SessionStart:startup hook error` 가 없다** · `Ignoring N permissions…` 가 없다 |
| 17 | 본방에 `@TO(prodev-<과제>-bot) 안녕` | 봇이 그 방에 답한다 (한글이 안 깨진다) |
| 18 | 봇에게 과제 폴더에 파일 하나를 쓰게 시킨다 | **승인 창 없이** 생긴다. UTF-8 · LF |
| 19 | 봇에게 과제 폴더 **밖**에 쓰게 시킨다 | **거부된다** (파일이 안 생긴다) |
| 20 | 봇에게 과제 폴더의 파일 하나를 방에 **첨부**하게 시킨다 | 방 글에 첨부가 붙고 업로드 폴더에 내용이 그대로 있다 |

### 7.1 12 · 13 · 14 를 한 번에 보는 스크립트 (PowerShell)

```powershell
$s = Get-Content "…\prodev\bots\prodev-수율개선-bot\.claude\settings.json" -Raw | ConvertFrom-Json
"허용/거부 중 '(//' 로 시작: " + (@($s.permissions.allow + $s.permissions.deny | Where-Object { $_ -like '*(//*' })).Count
$shell = @(); foreach ($k in $s.hooks.PSObject.Properties.Name) { foreach ($g in $s.hooks.$k) { foreach ($h in $g.hooks) { $shell += $h.command } } }
$shell += $s.statusLine.command
"셸이 읽는 값 중 역슬래시 든 것: " + (@($shell | Where-Object { $_ -like '*\*' })).Count
"env.PATH 에 Git\usr\bin: " + ($s.env.PATH -like '*Git\usr\bin*')
```
**세 줄이 `0` · `0` · `True` 여야 한다.**

15 는 **셸을 한 번 거쳐서** 돌리는 것이 요점이다. `node <훅>` 로 직접 부르면 언제나 초록이고,
실전에서 깨지던 자리(5.1 의 2)를 못 본다. Git Bash 에서:
```bash
printf '%s' '{"source":"startup"}' | bash -c "$(node -e "console.log(JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8')).hooks.SessionStart[0].hooks[0].command)")"
```

### 7.2 시험은 어디서 돌리나

`test:server` 는 `setup.js` 를 돌리지만 **저장소 사본**에서 돌린다 (`저장소사본()`), 그래서
실제 `bots/` 를 건드리지 않는다 — 맨 끝 시험이 시험 전후의 `bots/` 목록을 견주어 그것을 증거로 남긴다.
따로 사본을 뜰 필요가 없다. (`meta` 의 `gate-tests.sh` 는 zsh 라 윈도우에서 안 돈다 — 아래 8절.)

---

## 8. 아직 남은 것 — 윈도우에서 **잴 수 없거나 안 잰** 것

| 무엇 | 왜 |
|---|---|
| **봇이 방의 글에 스스로 깨어나는 것** | 채널이 글을 세션에 밀어 넣으려면 **대화형 창(TTY)** 이 필요하다. 도구로 띄우면 `--print` 로 떨어진다. `README.md` '켜는 순서' ③ 을 사람이 창에서 한 번 켜 확인한다. 채널을 지나 방에 답하고 첨부하는 경로 자체는 `reply`·`fetch_history` 로 재 두었다 (확인표 17 · 20) |
| **심볼릭 링크 보안 경계 두 칸** | 윈도우는 개발자 모드나 관리자 권한 없이 `symlinkSync` 가 `EPERM` 이다. AC-019 는 링크 칸만 빼고 나머지 넷을 그대로 재고, 링크가 전부인 AC-GW-023 은 «건너뜀» 으로 남는다 — 통과로 위장하지 않는다. **설정 → 개인 정보 및 보안 → 개발자용 → 개발자 모드**를 켜면 윈도우에서도 돈다 |
| **`zsh` 도구 셋** (`gate-tests.sh` · `replay.sh` · `weekly.sh`) | 윈도우에 zsh 이 없다. node 도구(`evo-count.js` · `cost.js`)는 돈다. 7.2 처럼 손으로 대신하거나, zsh 을 깔거나, node 로 옮긴다 (옮기는 것이 옳은 방향이다) |
| **`crontab`** | 없다. **상관없다** — 자동 브리핑을 두지 않기로 했다 (2026-09-11 결정). `brief`·`journal` 은 사람이 말을 걸 때 뜬다 |
| **봇이 사진(이미지)을 읽나** | 대화형 세션에서 사람이 해야 한다 |
| **Node 22** | 8번 고침(`chat.js`)이 22 에서 실제로 초록인지는 이 기계에 22 가 없어 못 쟀다. 24 에서만 확인했다 |
| **경로에 공백** | 훅 명령에 따옴표가 없다. 작업판 경로에 **공백**이 있으면 5.1 의 2 가 다시 깨진다. `C:\project\…` 처럼 공백 없는 자리에 둔다 |
| **`settings.template.json` 의 `Write(<경로>)` 규칙 넷** | Claude Code 가 "`Write(path)` 규칙은 파일 권한 검사에 안 쓴다 — `Edit(path)` 가 모든 편집 도구를 덮는다" 고 봇 세션마다 경고한다. `Edit(...)` 짝이 나란히 있어 **구멍은 없고** 경고만 시끄럽다. 지우면 허용 22건이 20건이 되어 ADR-033 의 숫자를 함께 고쳐야 하므로 손대지 않았다 |

---

## 9. 왜 단위 시험이 이것들을 못 잡았나

**이 작업판의 prodev 시험 133건이 윈도우에서 (거의) 통과하면서도 봇의 훅 셋이 통째로 죽어 있었다.**
남길 만한 교훈이라 따로 적는다.

| 결함 | 시험이 왜 못 봤나 |
|---|---|
| 훅 명령이 셸에서 깨짐 | 시험은 훅을 `node` 로 **직접** 부른다. 실전은 Claude Code 가 **셸을 거쳐** 부른다. 그 사이의 escape 규칙이 시험 경로에 없다 |
| 권한 패턴이 안 맞음 | 시험은 생성된 **문자열의 모양**을 본다. 그 패턴을 Claude Code 가 **실제로 매칭하는지**는 안 본다 |
| 첨부 뿌리 대소문자 | 시험은 자기가 만든 뿌리를 `mkdtempSync` 로 얻는다 — 사람이 env 로 주는 값의 대소문자가 시험 밖이다 |
| 환경 자리 넷 | 시험은 자기가 만든 환경에서 돈다. 사람이 쓰는 PATH · 코드페이지 · 줄끝은 시험 밖이다 |

**규칙 후보 셋**
1. 설정 파일에 넣는 값은 **누가 읽는가**(셸 · 노드 · Claude Code)로 나눠 적는다.
   셸이 읽는 값은 시험도 **셸을 한 번 거쳐서** 돌려 본다 (확인표 15).
2. 플랫폼 갈래를 하나라도 파면, 같은 파일에서 플랫폼에 따라 달라지는 자리를 **전부 세어 적는다.**
   `setup.js` 에는 이미 win32 갈래가 셋 있었고(`STD_DIRS` · `NEEDED` · `exts`) `pat()` 만 없었다.
   **갈래를 일부만 판 것이 안 판 것보다 나쁘다** — 앞의 갈래들이 "윈도우를 본 코드" 라는 인상을 주어
   나머지를 안 보게 한다.
3. **진단을 적을 때는 갈라 보고 적는다.** 5.3 의 둘은 "그럴 것이다" 를 "그렇다" 로 적은 것이었고,
   한쪽(코드페이지)은 고칠 수 없는 자리를 가리켜 **고칠 수 있는 자리(PATH 순서)를 가렸다.**

---

## 10. 이 문서가 손대지 않은 것

- **`README.md` 의 켜는 순서** — 2026-09-13 에 **거기가 맥·윈도우 명령을 나란히 들도록** 바꿨고,
  이 문서의 6절은 그쪽을 가리키기만 한다. 두 문서에 같은 명령을 두 벌 두면 반드시 갈린다.
- **`prodev/docs/launch.md`** — 윈도우 줄을 넣지 않았다. 넣는다면 `README.md` 를 가리키는 한 줄이어야 한다.
- **`meta` 의 zsh 도구 셋** — node 로 옮기는 것이 옳은데 그것은 포팅이 아니라 도구 다시 쓰기다 (8절).
