#!/usr/bin/env node
// prodev 봇 세션 기록에서 시간 창마다 표준단가 비용을 잰다 (retro-cost.js 와 같은 단가 · 같은 잣대).
// 쓰는 법:
//   node cost.js --bot prodev-<과제>-비서 --since 2026-09-10T07:59:00Z --until 2026-09-10T09:40:00Z [--label "R2 들이기"]
//   node cost.js --bot prodev-<과제>-비서 --since 2026-09-14 --until 2026-09-21 --label "T4 1주"
// 기록 자리: ~/.claude/projects/<봇 폴더 경로를 -로 바꾼 것>/*.jsonl (서브에이전트는 <세션>/subagents/*.jsonl 도 센다)
const fs = require('fs'); const path = require('path'); const os = require('os');
const argv = process.argv.slice(2);
const arg = k => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const bot = arg('--bot'); const since = arg('--since'); const until = arg('--until') || new Date().toISOString(); const label = arg('--label') || '';
if (!bot || !since) { console.error('쓰는 법: node cost.js --bot <봇 이름> --since <ISO> [--until <ISO>] [--label <이름>]'); process.exit(1); }
const P = { input: 5, output: 25, cacheRead: 0.5, cacheWrite: 7.5 };
const PROJECTS = path.join(os.homedir(), '.claude', 'projects');
const dirs = fs.readdirSync(PROJECTS).filter(d => d.includes('-bots-') && d.endsWith('-' + bot.replace(/[^A-Za-z0-9]/g, '-').replace(/-+$/, '')) || d.includes('bots-' + bot));
// 한글 봇 이름은 경로에서 '-' 로 바뀌므로 넉넉히 잡는다: bots- 뒤가 봇 이름의 ASCII 부분으로 시작하는 폴더
const ascii = bot.replace(/[^A-Za-z0-9-]/g, '');
const cands = dirs.length ? dirs : fs.readdirSync(PROJECTS).filter(d => d.includes('-bots-' + ascii));
if (!cands.length) { console.error('기록 폴더를 못 찾았다: ' + PROJECTS + ' 안에 -bots-' + ascii + '…'); process.exit(1); }
const t0 = Date.parse(since), t1 = Date.parse(until);
const s = { calls: 0, input: 0, output: 0, cr: 0, cw: 0, sub: 0, files: 0 }; const seen = new Set();
function eat(file, isSub) {
  s.files++;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line) continue; let j; try { j = JSON.parse(line); } catch { continue; }
    if (j.type !== 'assistant' || !j.message || !j.message.usage || !j.timestamp) continue;
    const t = Date.parse(j.timestamp); if (!(t >= t0 && t <= t1)) continue;
    const key = j.message.id || j.uuid; if (seen.has(key)) continue; seen.add(key);
    const u = j.message.usage;
    s.calls++; s.input += u.input_tokens || 0; s.output += u.output_tokens || 0; s.cr += u.cache_read_input_tokens || 0; s.cw += u.cache_creation_input_tokens || 0;
    if (isSub) s.sub++;
  }
}
for (const d of cands) {
  const D = path.join(PROJECTS, d);
  for (const f of fs.readdirSync(D)) {
    const p = path.join(D, f);
    if (f.endsWith('.jsonl')) eat(p, false);
    else if (fs.statSync(p).isDirectory()) {
      const sub = path.join(p, 'subagents');
      if (fs.existsSync(sub)) for (const g of fs.readdirSync(sub)) if (g.endsWith('.jsonl')) eat(path.join(sub, g), true);
    }
  }
}
const cost = (s.input * P.input + s.output * P.output + s.cr * P.cacheRead + s.cw * P.cacheWrite) / 1e6;
console.log(`${label || bot}\t${since} ~ ${until}\t호출 ${s.calls} (서브 ${s.sub})\t출력 ${s.output}\t캐시읽기 ${s.cr}\t캐시쓰기 ${s.cw}\t표준단가 $${cost.toFixed(2)}\t(기록 파일 ${s.files})`);
