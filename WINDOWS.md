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

**회사 PC 가 WSL 2 를 허용하면 길 A 를 고른다.** 이 작업판에서 아직 윈도우로 밟아 본 적이 없는 자리가
여럿이라(5.2), 리눅스와 같은 바닥에 올려 두는 편이 나중에 덜 샌다.
가상화가 막혀 있으면 길 B 로 간다 — 그쪽도 된다. 대신 5절을 끝까지 읽는다.

---

## 1. 왜 셸이 필요한가

`bootstrap.sh` 하나 때문이 아니다. 셸을 전제로 하는 자리가 넷이고, **그 넷이 다 핵심 경로에 있다.**

| 자리 | 무엇이 셸을 쓰나 | 어디서 확인했나 |
|---|---|---|
| 저장소 받기 | `bootstrap.sh` | 이 저장소 뿌리 |
| **봇의 손** | 봇에게 허용된 명령 31건 가운데 24건이 유닉스 도구다 — `grep` · `sed` · `awk` · `find` · `sort` · `uniq` · `wc` · `head` · `tail` · `cat` · `cp` · `diff` · `stat` · `file` · `shasum` · `tr` · `cut` · `basename` … | `prodev/common/settings.template.json` |
| 봇 상태줄 | `common/statusline.sh` (첫 줄 `#!/bin/bash`) | `prodev/common/statusline.sh` |
| meta 의 검수 도구 | `gate-tests.sh` · `replay.sh` · `weekly.sh` (전부 zsh) | `meta/prodev-review/scripts/tools/` |
| 서버 켜는 명령 | `VAR=값 명령` 꼴 (PowerShell 문법이 아니다) | `README.md` '봇을 돌리는 법' |

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

## 5. 윈도우에서만 생기는 것

### 5.1 확인된 것 (코드를 읽어 안 것)

| # | 무엇 | 어떻게 되나 | 지금 어떻게 하나 |
|---|---|---|---|
| 1 | **줄끝(CRLF)** | Git for Windows 가 기본값으로 `.sh` 를 CRLF 로 바꾸면 `#!/bin/sh` 뒤에 `\r` 이 붙어 "bad interpreter" 로 죽는다 | **이 저장소가 막아 두었다** (`.gitattributes`). 3.1 의 as-is 를 고르면 더 확실하다 |
| 2 | **setup 의 환경 점검이 윈도우에서 헐겁다** | `setup.js` 는 맥·리눅스에서는 명령 열넷(`grep` · `sed` · `python3` …)이 있는지 보는데, 윈도우에서는 `git.exe` · `node.exe` **둘만** 본다. 그래서 `grep` 이 없어도 "명령 2개 모두 풀림" 이라고 초록으로 지나간다 | **4절의 점검을 사람이 대신 친다.** setup 의 ④ 줄만 믿지 않는다 |
| 3 | **봇 PATH 에 유닉스 도구 자리가 안 들어간다** | `setup.js` 가 봇 설정에 박아 넣는 기본 폴더가 윈도우에서는 `System32` 와 `Windows` 둘뿐이다. `grep` 이 사는 `C:\Program Files\Git\usr\bin` 은 그 목록에 없다 | **setup 을 반드시 Git Bash 창에서 돌린다.** 그러면 그 창의 PATH 를 setup 이 그대로 물려받는다. 돌린 뒤 `bots/<봇>/.claude/settings.json` 의 `env.PATH` 에 `Git\usr\bin` 이 들어 있는지 눈으로 본다 |
| 4 | **상태줄이 `.sh`** | 봇 터미널 아래 한 줄이 안 나올 수 있다 | 상태줄일 뿐이라 봇 동작에는 영향이 없다. 거슬리면 무시한다 |
| 5 | **cron 이 없다** | `setup.js cron` 이 내는 두 줄은 crontab 용이다. 윈도우에는 crontab 이 없다 | 길 A(WSL)면 WSL 안에서 `cron` 을 쓴다. 길 B 면 **작업 스케줄러**에 같은 명령을 등록한다. 아침 브리핑·저녁 일지만 해당하고, 없어도 나머지는 다 돈다 |
| 6 | **`python3` 라는 이름** | 3.2 의 상자와 같다 | `python3.exe` 를 만들어 둔다 |

### 5.2 그 기계에서 처음 밟아 봐야 아는 것

아래는 **아직 아무도 윈도우에서 해 본 적이 없다.** 코드를 읽어 "여기가 위험하다"까지만 알아낸 자리다.
추측을 확인으로 적지 않으려고 따로 둔다.

| 무엇 | 왜 위험한가 | 어떻게 확인하나 |
|---|---|---|
| 봇 권한 패턴 | `setup.js` 가 허용·거부 패턴을 `//C:/Users/…/projects/**` 꼴로 만든다. Claude Code 가 윈도우 경로를 이 꼴로 맞춰 주는지 확인된 바 없다 | 봇을 띄우고 과제 폴더에 파일 하나를 쓰게 시켜 본다. 승인 창이 뜨거나 거부되면 이 자리다 |
| 채널 플러그인 빌드 | `minidiscord/channel/dist/index.js` 를 윈도우에서 빌드해 본 적이 없다 | `npm install` · `npm run build -w channel` 뒤 그 파일이 생기는지 |
| 서버 파일 첨부 경로 | `MINIDISCORD_BOT_FILES_DIR` 안팎 판정이 역슬래시 경로에서도 같은지 | 방에 파일을 올리고 봇이 카드에 첨부하는 데까지 |
| 한글 폴더 이름 | 과제 폴더가 `projects/수율개선` 처럼 한글이다. 윈도우 기본 코드페이지에서 깨지는 자리가 있을 수 있다 | 과제를 하나 열어 `setup.js --project 수율개선` 까지 |
| 경로 길이 | 윈도우는 260자 제한이 남아 있다. `crew-workspace/prodev/bots/prodev-<과제>-bot/.claude/…` 는 꽤 길다 | 집 폴더 바로 아래(`C:\Users\<이름>\crew-workspace`)에 두면 대체로 안전하다 |

---

## 6. 첫날 밟아 볼 것

순서대로 하나씩. 막히면 거기서 멈추고 무엇이 어떻게 막혔는지 적는다 (고치는 것은 그다음 일이다).

- [ ] 4절 점검에 "없음" 이 0건
- [ ] `sh bootstrap.sh` 가 저장소 셋을 받는다
- [ ] `minidiscord` 에서 `npm install` · `npm run build -w channel` → `channel/dist/index.js` 가 생긴다
- [ ] 채팅 서버가 뜨고 브라우저에서 열린다
- [ ] `setup.js --project <과제>` → 봇 설정이 생기고, `settings.json` 의 `env.PATH` 에 유닉스 도구 자리가 들어 있다 (5.1 의 3)
- [ ] `setup.js rooms <과제>` → 방 둘이 생긴다
- [ ] 봇을 띄워 본방에서 `@TO(<봇>) 안녕` 에 답한다
- [ ] 봇에게 과제 폴더에 파일 하나를 쓰게 시켜 승인 창 없이 되는지 (5.2 의 첫 줄)

---

## 7. 이 문서가 손대지 않은 것

- **`prodev/` 안의 코드는 고치지 않았다.** 5.1 의 2·3(윈도우 점검이 헐겁고 봇 PATH 기본 자리가 모자란 것)은
  `setup.js` 를 고쳐야 제대로 풀리는데, prodev 는 관문 사이에 예측을 적고 worktree + PR 로만 고친다
  (`meta/CLAUDE.md`). 그래서 여기서는 **사람이 대신 확인하는 법**만 적었다. 고칠 거리로는
  `meta/prodev-review/notes/2026-09-10-between-gates.md` 에 올려 두었다.
- **`prodev/docs/launch.md` 에 윈도우 줄을 넣지 않았다.** 같은 까닭이다. 다음 관문 사이에 PR 로 넣을 후보다.
