#!/bin/zsh
# 관문 시험: prodev 저장소 사본에서 npm test · test:server 를 돌린다 (실제 bots/ 를 안 만진다).
# 쓰는 법:  zsh gate-tests.sh <관문 이름, 예 T4M>   → runs/<날짜>-<관문>-tests.txt
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
WS=$(cd "$HERE/../../../.." && pwd)                    # crew-workspace
P=$WS/prodev
MD=$WS/minidiscord
G=${1:-gate}
S=$(mktemp -d)/prodev-copy
mkdir -p "$S"
(cd "$P" && git archive HEAD | tar -x -C "$S")
[ -d "$P/node_modules" ] && cp -r "$P/node_modules" "$S/"
OUT=$HERE/../../runs/$(date +%Y-%m-%d)-$G-tests.txt
{
echo "# $G 시험 실측 — $(date -u +%Y-%m-%dT%H:%M:%SZ) · HEAD $(git -C "$P" rev-parse --short HEAD) · 사본 $S"
echo "## npm test"; (cd "$S" && npm test 2>&1 | grep -E '^ℹ (tests|pass|fail)|✖')
echo "## npm run test:server"; (cd "$S" && MINIDISCORD_DIR="$MD" npm run test:server 2>&1 | grep -E '^ℹ (tests|pass|fail)|✖|실제 bots')
echo "## 실제 bots/ (시험 뒤)"; ls "$P/bots" 2>/dev/null
echo "## 금칙 grep (스킬·CLAUDE.md 가 세지 않는가)"; grep -rn '세[어라]\|글자 수\|줄 수\|900자\|확정 다섯\|결재자' "$P/.claude/skills" "$P/CLAUDE.md" | wc -l
echo "## CLAUDE.md 줄"; wc -l < "$P/CLAUDE.md"
} > "$OUT" 2>&1
rm -rf "$(dirname "$S")"
echo "저장: $OUT"; cat "$OUT"
