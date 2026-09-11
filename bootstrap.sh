#!/bin/sh
# workspace.json 을 읽어 저장소들을 적힌 커밋으로 받는다. 이미 있으면 fetch 뒤 그 커밋으로 맞춘다.
# 쓰는 법:  sh bootstrap.sh             (crew-workspace 뿌리에서. zsh · bash 로 돌려도 같다)
#           윈도우는 Git Bash 나 WSL 에서 같은 명령. PowerShell · CMD 에서는 돌지 않는다.
#           PowerShell 판을 따로 두지 않는 이유: 이 작업판은 여기 말고도 셸 도구(grep · sed · python3 …)를
#           전제로 한다 — 봇 허용 목록 · statusline · meta 도구가 전부 그렇다. 윈도우는 Git Bash 나 WSL
#           하나를 깔면 전부 풀린다 (README '무엇이 필요한가').
set -eu
cd "$(dirname "$0")"
node -e '
const j = require("./workspace.json");
for (const [name, r] of Object.entries(j.repos)) console.log(name, r.url, r.commit);
' | while read -r name url commit; do
  if [ -d "$name/.git" ]; then
    echo "[$name] 있음 → fetch"
    git -C "$name" fetch --quiet origin
  else
    echo "[$name] 없음 → clone"
    git clone --quiet "$url" "$name"
  fi
  git -C "$name" checkout --quiet "$commit"
  echo "[$name] $commit 로 맞춤 (작업하려면: git -C $name checkout main)"
done
mkdir -p projects
echo "끝. 다음은 README '봇을 돌리는 법'."
