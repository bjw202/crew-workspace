#!/bin/zsh
# 대본 재생 도우미. 토큰 파일을 읽어 prodev 의 replay.js 를 돌린다.
# 쓰는 법:  zsh replay.sh <대본.json> [기록 이름]   예) zsh replay.sh ../R3-find.json R3-2
#   토큰 파일: ../../runs/.tokens.env  (REPLAY_TOKEN_PL · REPLAY_TOKEN_MEMBER · MINIDISCORD_URL)
#   사람 손 걸음(manual)은 화면 안내대로 <기록>.manual-<id>.ok 파일을 만들면 이어 돈다.
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
WS=$(cd "$HERE/../../../.." && pwd)
RUNS=$HERE/../../runs
DABON=$1; NAME=${2:-$(basename "$DABON" .json)}
[ -f "$RUNS/.tokens.env" ] || { echo "토큰 파일이 없다: $RUNS/.tokens.env (HANDOFF.md 3절)"; exit 1; }
set -a; source "$RUNS/.tokens.env"; set +a
OUT=$RUNS/$(date +%Y-%m-%d)-$NAME.jsonl
node "$WS/prodev/scripts/replay.js" "$DABON" "$OUT" --base "${MINIDISCORD_URL:-http://127.0.0.1:3000}" < /dev/null
echo "기록: $OUT"
