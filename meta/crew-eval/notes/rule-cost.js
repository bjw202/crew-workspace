#!/usr/bin/env node
// 지침을 다시 읽는 값 — meta 가 돌린다. INTENT.md 의 숫자가 여기서 나온다.
//
//   node notes/rule-cost.js                     (회차 3 실측 호출 수로 잰다)
//   node notes/rule-cost.js <시작> <끝>          (그 창의 실제 호출 수로 잰다, UTC ISO)
//
// 지침은 봇이 매 호출에 다시 읽는다. 그래서 지침 줄이 늘면 회차마다 더 문다.
// knowledge 와 위키는 찾아 읽을 때만 들어오므로 여기서 세지 않는다 — 그것이 이 글의 요지다.

const fs = require('fs');
const path = require('path');
const os = require('os');

const CREW = require('path').resolve(__dirname, '..', '..', '..', 'crew');   // <작업판>/crew — 기계에 묶인 절대 경로를 뺐다 (2026-09-11 공개 전환)
const BOTS = ['orchestrator', 'analyst', 'archivist', 'researcher', 'reporter'];
const CACHE_READ = 0.5;            // $/1M — 표준단가. retro-cost.js 와 같은 값이다
const CHARS_PER_TOKEN = 1.6;       // 한국어 혼합 대략값. 정확한 토큰 수가 아니다

const rd = p => { try { return fs.readFileSync(path.join(CREW, p), 'utf8'); } catch { return ''; } };
const tok = s => Math.round([...s].length / CHARS_PER_TOKEN);
const lines = s => s ? s.trimEnd().split('\n').length : 0;

// ── 호출 수: 창을 주면 세션 기록에서, 안 주면 회차 3 실측값 ──
const [lo, hi] = process.argv.slice(2);
let calls, src;
if (lo && hi) {
  calls = {}; src = `${lo} ~ ${hi}`;
  const P = path.join(os.homedir(), '.claude', 'projects');
  for (const b of BOTS) {
    const d = fs.existsSync(P) ? fs.readdirSync(P).find(x => x.endsWith('-bots-' + b)) : null;
    let n = 0;
    if (d) for (const f of fs.readdirSync(path.join(P, d)).filter(x => x.endsWith('.jsonl'))) {
      for (const line of fs.readFileSync(path.join(P, d, f), 'utf8').split('\n')) {
        if (!line.trim()) continue;
        let o; try { o = JSON.parse(line); } catch { continue; }
        if (o.type === 'assistant' && o.timestamp >= lo && o.timestamp <= hi && (o.message || {}).usage) n++;
      }
    }
    calls[b] = n;
  }
} else {
  calls = { orchestrator: 344, analyst: 196, archivist: 272, researcher: 193, reporter: 133 };
  src = '회차 3 실측 (2026-09-08T14:44 ~ 09-09T05:01)';
}

const common = rd('common/CLAUDE-common.md');
const worker = rd('common/CLAUDE-worker.md');

console.log(`\n지침 재읽기 값 · 호출 수 출처: ${src}\n`);
console.log(`  공통 지침   common/CLAUDE-common.md  ${lines(common)}줄 · 약 ${tok(common)}토큰`);
console.log(`  worker 지침 common/CLAUDE-worker.md  ${lines(worker)}줄 · 약 ${tok(worker)}토큰\n`);

let total = 0, totalCalls = 0;
for (const b of BOTS) {
  const own = rd(`bots/${b}/CLAUDE.md`), mem = rd(`bots/${b}/memory.md`);
  const t = tok(common) + tok(own) + tok(mem) + (b === 'orchestrator' ? 0 : tok(worker));
  const cost = t * calls[b] * CACHE_READ / 1e6;
  total += cost; totalCalls += calls[b];
  console.log(`  ${b.padEnd(13)} 자기 지침 ${String(lines(own)).padStart(3)}줄 + memory ${String(lines(mem)).padStart(2)}줄`
    + ` → 매 호출 약 ${String(t).padStart(5)}토큰 × ${String(calls[b]).padStart(4)}회 = $${cost.toFixed(2)}`);
}
console.log(`\n  회차 하나에 지침만 다시 읽는 값  $${total.toFixed(2)}  (호출 ${totalCalls}회)`);
console.log(`  호출 한 번당                     $${(total / Math.max(totalCalls, 1)).toFixed(4)}`);
console.log(`\n  지침 한 줄을 지우면 회차마다 약 $${(total / Math.max(lines(common) + lines(worker), 1)).toFixed(3)} 가 준다.`);
console.log(`  (거친 환산이다. 토큰은 1.6자=1토큰으로 어림했고, 실제 청구액이 아니라 견주기 위한 값이다.)\n`);
