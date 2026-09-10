#!/bin/zsh
# 4단계(실전 2주) 주간 계측. meta 가 주 1회 돌려 runs/<날짜>-T4-week<N>.md 에 붙인다.
# 쓰는 법:  zsh weekly.sh <과제 폴더> <봇 이름> <주 시작 ISO> [주 끝 ISO] [minidiscord DB 경로]
#   예) zsh weekly.sh /path/projects/<과제> prodev-<과제>-비서 2026-09-14T00:00:00Z 2026-09-21T00:00:00Z /path/data/minidiscord.db
set -u
HERE=$(cd "$(dirname "$0")" && pwd)
WS=$(cd "$HERE/../../../.." && pwd)
PROJ=$1; BOT=$2; FROM=$3; TO=${4:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}; DB=${5:-}
BOTDIR=$WS/prodev/bots/$BOT
echo "# 주간 계측 $FROM ~ $TO · 과제 $PROJ · 봇 $BOT"
echo "## 값 (표준단가)"; node "$HERE/cost.js" --bot "$BOT" --since "$FROM" --until "$TO" --label "주간"
echo "## 카드"; ls "$PROJ/cards" 2>/dev/null | wc -l | xargs echo "카드 수:"; grep -l '^status: valid' "$PROJ"/cards/*.md 2>/dev/null | wc -l | xargs echo "valid:"; grep -l '^status: void' "$PROJ"/cards/*.md 2>/dev/null | wc -l | xargs echo "void:"
echo "## 위키"; ls "$PROJ/wiki" 2>/dev/null | wc -l | xargs echo "페이지:"; for f in "$PROJ"/wiki/*.md; do [ -f "$f" ] && grep -vcE '^#|^\s*$|^\||^---|^>|[ERD]-[0-9]{4}' "$f" | xargs echo "$(basename "$f") 카드 번호 없는 줄:"; done 2>/dev/null
echo "## find.log 층 분포 (기간)"; awk -F'\t' -v a="$FROM" -v b="$TO" '$1>=a && $1<=b {c[$2]++; n++} END {for (k in c) printf "%s층 %d\n", k, c[k]; printf "합 %d\n", n}' "$BOTDIR/find.log" 2>/dev/null
echo "## 일지의 카드 없는 첨부"; for f in "$PROJ"/journal/*.md; do [ -f "$f" ] && awk '/^## 카드 없는 첨부/{f=1;next} /^## /{f=0} f && /^\| `/' "$f" | wc -l | xargs echo "$(basename "$f"):"; done 2>/dev/null
echo "## 인수인계서·알림 로그 (압축 횟수)"; grep -c '알림:' "$BOTDIR/handoff-compact.md.log" 2>/dev/null | xargs echo "압축·알림 줄:"
if [ -n "$DB" ]; then echo "## 승인 요청 글 (🔒)"; MINIDISCORD_DB="$DB" node "$WS/prodev/scripts/chat.js" search 🔒 --limit 200 2>/dev/null | tail -1; fi
echo "## git"; git -C "$PROJ" log --since="$FROM" --until="$TO" --format='%h %ci %s' 2>/dev/null | wc -l | xargs echo "커밋:"
