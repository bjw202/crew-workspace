#!/usr/bin/env node
// meta 의 자리를 지키는 훅 (PreToolUse). meta 는 재고 검수한다 — 만들지 않는다.
//
// 막는 것 넷 (CLAUDE.md 의 규칙을 기계로 옮긴 것):
//   1. prodev/      — 어떤 쓰기도 (Edit·Write·NotebookEdit, 그리고 Bash 의 쓰기 명령)
//   2. crew/        — 직접 편집 (고칠 때는 worktree 를 뜬다. crew-wt-* 는 허용)
//   3. minidiscord/ — 편집 (진단은 여기서, 수정은 그 저장소에서)
//   4. knowledge/   — 편집 (회사 지식은 읽기만)
// 읽기(cat·ls·grep·node 스크립트 실행·npm test)는 막지 않는다.
// 막으면 exit 2 와 이유 한 줄. 세션은 그 줄을 읽고 다른 길을 찾는다.

const fs = require('fs');
const path = require('path');

const WS = path.resolve(__dirname, '..', '..', '..');          // crew-workspace
// 관문 진행 중 표시. 있으면 prodev-wt-* 까지 막는다 (crew 식: 관문 사이에만 고친다).
const IN_PROGRESS = path.join(WS, 'meta', 'prodev-review', 'runs', 'IN-PROGRESS');
const gateOpen = fs.existsSync(IN_PROGRESS);
const RULES = [
  { root: path.join(WS, 'prodev'),      why: 'prodev 본 체크아웃을 고치지 않는다. 관문 사이에 worktree 를 뜬다: git -C ../prodev worktree add -b <브랜치> ../prodev-wt-<이름> origin/main (CLAUDE.md).' },
  { root: path.join(WS, 'crew'),        why: 'crew 를 직접 고치지 않는다. 고칠 때는 worktree 를 뜬다: git -C ../crew worktree add -b <브랜치> ../crew-wt-<이름> origin/main (CLAUDE.md).' },
  { root: path.join(WS, 'minidiscord'), why: 'minidiscord 는 읽기 위해 붙였다. 고칠 것은 그 저장소에서 세션을 따로 띄운다 (CLAUDE.md).' },
  { root: path.join(WS, 'knowledge'),   why: 'knowledge 는 읽기 위해 붙였다. 회사 지식은 meta 에서 고치지 않는다 (CLAUDE.md).' },
];

function under(p, root) {
  const a = path.resolve(p);
  return a === root || a.startsWith(root + path.sep);
}
function underWorktree(p) {                                     // <ws>/prodev-wt-*/…
  const a = path.resolve(p);
  const rel = path.relative(WS, a);
  return !rel.startsWith('..') && /^prodev-wt-[^/]+(\/|$)/.test(rel);
}
const GATE_WHY = '관문 진행 중이다 (meta/prodev-review/runs/IN-PROGRESS). 검수가 끝나면 그 파일을 지우고 worktree 에서 고친다 (CLAUDE.md).';

function block(why) { process.stderr.write(why + '\n'); process.exit(2); }

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch {}
const tool = input.tool_name || '';
const ti = input.tool_input || {};
const cwd = input.cwd || process.cwd();

if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
  const fp = ti.file_path || ti.notebook_path || '';
  if (!fp) process.exit(0);
  const abs = path.isAbsolute(fp) ? fp : path.resolve(cwd, fp);
  for (const r of RULES) if (under(abs, r.root)) block(r.why);
  if (gateOpen && underWorktree(abs)) block(GATE_WHY);
  process.exit(0);
}

if (tool === 'Bash') {
  const cmd = String(ti.command || '');
  // prodev 를 건드리는 명령 가운데 쓰기 냄새가 나는 것만 막는다.
  // "prodev-review" (meta 의 폴더) 는 걸리면 안 된다 — prodev 뒤에 / · 공백 · 따옴표 · 끝만 허용
  const mentionsProdev = /(^|[\s/'"=])(\.\.\/)?prodev(?=[\/\s'"]|$)/.test(cmd) || cmd.includes(path.join(WS, 'prodev') + path.sep) || cmd.endsWith(path.join(WS, 'prodev'));
  if (mentionsProdev) {
    const writeish = /(^|\s|;|&&|\|)(rm|mv|cp|mkdir|touch|tee|chmod|chown|ln|truncate|npm (i|install|ci|uninstall|update)|pip|git (add|commit|checkout|switch|reset|rm|mv|push|pull|merge|rebase|stash|clean|init|apply)|sed -i|perl -i|python3? -c)\b/.test(cmd)
      || /(^|[^<>])>{1,2}(?!&)\s*[^&\s]/.test(cmd.replace(/2>&1|2>\/dev\/null|>\/dev\/null/g, ''))
      || /git -C\s+\S*prodev\S*\s+(add|commit|checkout|switch|reset|push|pull|merge|rebase|init|apply|stash)\b/.test(cmd);
    if (writeish) block(RULES[0].why + ' (막힌 명령: 쓰기 냄새가 나는 Bash. 읽기만 하는 형태로 바꿔라)');
  }
  // 관문 중에는 worktree 를 가리키는 쓰기 명령도 막는다
  if (gateOpen && /prodev-wt-/.test(cmd)) {
    const writeish = /(^|\s|;|&&|\|)(rm|mv|cp|mkdir|touch|tee|chmod|ln|truncate|sed -i|perl -i|git (add|commit|checkout|switch|reset|push|merge|rebase|apply|stash))\b/.test(cmd)
      || /(^|[^<>])>{1,2}(?!&)\s*[^&\s]/.test(cmd.replace(/2>&1|2>\/dev\/null|>\/dev\/null/g, ''))
      || /git -C\s+\S*prodev-wt-\S*\s+(add|commit|checkout|switch|reset|push|pull|merge|rebase|apply|stash)\b/.test(cmd);
    if (writeish) block(GATE_WHY);
  }
  // crew 본 체크아웃의 브랜치를 바꾸는 명령
  if (/git -C\s+\S*\/crew(\/|\s)/.test(cmd) && !/crew-wt-/.test(cmd) && /\b(switch|checkout|reset --hard|rebase)\b/.test(cmd)) {
    block('crew 본 체크아웃의 브랜치를 바꾸지 않는다. worktree 를 쓴다 (CLAUDE.md).');
  }
  process.exit(0);
}

process.exit(0);
