#!/bin/zsh
# workspace.json 을 읽어 저장소들을 적힌 커밋으로 받는다. 이미 있으면 fetch 뒤 그 커밋으로 맞춘다.
# 쓰는 법:  zsh bootstrap.sh            (crew-workspace 뿌리에서)
set -eu
cd "$(dirname "$0")"
node -e '
const j = require("./workspace.json");
for (const [name, r] of Object.entries(j.repos)) console.log(name, r.url, r.commit);
' | while read name url commit; do
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
