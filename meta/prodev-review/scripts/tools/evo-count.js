#!/usr/bin/env node
// evo-count.js — "진화하는 비서" 관문 셋(evo-seat · evo-path · evo-carry)을 meta 가 **기계로** 세는 도구.
// node 하나로 돈다 (회사 PowerShell 에서도). 손으로 센 숫자는 근거가 아니다.
//
//   node evo-count.js gen   --out <csv> [--seed 20260911]            공급사 둘 × 20 개체 자료를 만들고 정답 숫자를 낸다 (관문 B 정답지 재료)
//   node evo-count.js setup [--copy <사본 폴더>]                      사본에서 setup.js --project probe 를 돌리고 A1 A2 A5 A6 을 센다
//   node evo-count.js hook  [--copy <사본 폴더>]                      사본의 session-start.js 에 house.md 20줄 · 51줄을 먹여 A3 A4 를 센다
//   node evo-count.js allow [--copy <사본 폴더>]                      스킬·에이전트·CLAUDE.md 가 부르는 셸 명령 대 allow 목록 (A7)
//   node evo-count.js cells <run.md ...>                               run.md 여섯 칸 (B2)
//   node evo-count.js rerun <analysis 폴더 ...>                        python3 run.py 를 다시 돌려 run.md 4칸 숫자와 맞댄다 (B3)
//   node evo-count.js key   <run.md ...> --key <evo-key.md>            정답지 숫자가 run.md 에 있나 (B4)
//   node evo-count.js retro <회고 답 파일> --key <evo-key.md>          넷 절 · 근거 · 지어낸 항목 · 판별 넷 (B13)
//   node evo-count.js evidence [--names a,b,c]                         runs/*.md 와 prodev/docs/evidence/*.md 의 sha256 대조 (C1)
//
// --copy 를 안 주면 사본을 새로 뜬다: git -C <ws>/prodev archive HEAD | tar -x  (본 체크아웃과 bots/ 는 안 만진다).
// 출력은 한 줄에 한 칸: "<칸>\t<값>\t<근거>" — runs/ 표에 그대로 옮긴다.

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFileSync, execSync } = require('child_process');

const HERE = __dirname;
const REVIEW = path.resolve(HERE, '..', '..');            // meta/prodev-review
const WS = path.resolve(REVIEW, '..', '..');               // crew-workspace
const PRODEV = path.join(WS, 'prodev');

function args() {
  const a = process.argv.slice(2);
  const cmd = a.shift();
  const pos = [], opt = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith('--')) { opt[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : true; }
    else pos.push(a[i]);
  }
  return { cmd, pos, opt };
}
const out = (칸, 값, 근거 = '') => process.stdout.write(`${칸}\t${값}\t${근거}\n`);
const read = f => fs.readFileSync(f, 'utf8');
const lines = f => read(f).replace(/\s+$/, '').split(/\r?\n/);

// ── 사본 ─────────────────────────────────────────────────────
function copyRepo(opt) {
  if (opt.copy && fs.existsSync(path.join(opt.copy, 'scripts', 'setup.js'))) return path.resolve(opt.copy);
  const dir = opt.copy ? path.resolve(opt.copy) : fs.mkdtempSync(path.join(os.tmpdir(), 'evo-copy-'));
  fs.mkdirSync(dir, { recursive: true });
  execSync(`git -C "${PRODEV}" archive HEAD | tar -x -C "${dir}"`, { stdio: ['ignore', 'ignore', 'inherit'] });
  const head = execFileSync('git', ['-C', PRODEV, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  out('사본', dir, `HEAD ${head}`);
  return dir;
}

// ── gen ──────────────────────────────────────────────────────
function mulberry32(seed) {
  let t = seed >>> 0;
  return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
function normal(rng, mu, sd) { const u = 1 - rng(), v = rng(); return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
const sd = xs => { const m = mean(xs); return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1)); };
// 정규화 불완전 베타 (Numerical Recipes betacf) → Student t 양측 p
function betacf(a, b, x) {
  const MAXIT = 200, EPS = 3e-14, FPMIN = 1e-300;
  let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN; d = 1 / d; let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m; let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d;
    const del = d * c; h *= del; if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}
function lgamma(x) { // Lanczos
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  x -= 1; let a = c[0]; const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
function ibeta(a, b, x) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
}
const tTwoSided = (t, df) => ibeta(df / 2, 0.5, df / (df + t * t));
function welch(x, y) {
  const mx = mean(x), my = mean(y), vx = sd(x) ** 2, vy = sd(y) ** 2, nx = x.length, ny = y.length;
  const se = Math.sqrt(vx / nx + vy / ny), t = (mx - my) / se;
  const df = (vx / nx + vy / ny) ** 2 / ((vx / nx) ** 2 / (nx - 1) + (vy / ny) ** 2 / (ny - 1));
  return { t, df, p: tTwoSided(Math.abs(t), df) };
}
const cpk = (xs, lsl, usl) => { const m = mean(xs), s = sd(xs); return Math.min((usl - m) / (3 * s), (m - lsl) / (3 * s)); };

function gen(opt) {
  const seed = Number(opt.seed || 20260911);
  const rng = mulberry32(seed);
  const spec = { lsl: 2.0, usl: 3.0 };
  const 공급사 = [['BSTech', 2.75, 0.15, 'B'], ['AlphaParts', 2.30, 0.15, 'A']];
  const rows = [], vals = {};
  let day = Date.UTC(2026, 7, 24); // 2026-08-24
  let n = { B: 610, A: 1201 };
  for (let i = 0; i < 20; i++) {
    for (const [name, mu, s, code] of 공급사) {
      const v = Math.round(normal(rng, mu, s) * 100) / 100;
      (vals[name] = vals[name] || []).push(v);
      const d = new Date(day + Math.floor(i / 2) * 86400000).toISOString().slice(0, 10);
      rows.push(`${d},SH-2200,SH2200-${code}-${String(n[code]++).padStart(4, '0')},${name},coating_um,${spec.lsl.toFixed(1)},${spec.usl.toFixed(1)},${v.toFixed(2)},um`);
    }
  }
  const csv = 'recv_date,part_no,serial,supplier,spec_item,spec_min,spec_max,measured,unit\n' + rows.join('\n') + '\n';
  if (opt.out) { fs.mkdirSync(path.dirname(opt.out), { recursive: true }); fs.writeFileSync(opt.out, csv); out('csv', opt.out, `${rows.length}행 · sha256 ${crypto.createHash('sha256').update(csv).digest('hex').slice(0, 16)}`); }
  const B = vals.BSTech, A = vals.AlphaParts;
  const w = welch(B, A);
  out('seed', seed);
  out('n', `${B.length} · ${A.length}`);
  out('mean_BSTech', mean(B).toFixed(3)); out('sd_BSTech', sd(B).toFixed(3));
  out('mean_AlphaParts', mean(A).toFixed(3)); out('sd_AlphaParts', sd(A).toFixed(3));
  out('diff', (mean(B) - mean(A)).toFixed(3));
  out('welch_t', w.t.toFixed(3)); out('welch_df', w.df.toFixed(2)); out('welch_p', w.p.toExponential(3));
  out('cpk_BSTech', cpk(B, spec.lsl, spec.usl).toFixed(3)); out('cpk_AlphaParts', cpk(A, spec.lsl, spec.usl).toFixed(3));
  out('over_usl_BSTech', B.filter(v => v > spec.usl).length); out('over_usl_AlphaParts', A.filter(v => v > spec.usl).length);
  out('under_lsl_BSTech', B.filter(v => v < spec.lsl).length); out('under_lsl_AlphaParts', A.filter(v => v < spec.lsl).length);
}

// ── setup (A1 A2 A5 A6) ──────────────────────────────────────
const 뺄것 = ['grep', 'find', 'sed', 'awk', 'sort', 'uniq', 'wc', 'head', 'tail', 'cat', 'diff', 'tr', 'cut', 'stat', 'file', 'shasum'];
function setup(opt) {
  const copy = copyRepo(opt);
  const 뿌리 = path.join(copy, 'probe-projects');
  const 과제 = path.join(뿌리, 'probe');
  fs.mkdirSync(뿌리, { recursive: true });
  const env = { ...process.env, MINIDISCORD_BOT_FILES_DIR: 뿌리, MINIDISCORD_DB: path.join(copy, 'none.db'), MINIDISCORD_URL: 'http://127.0.0.1:9', MINIDISCORD_DIR: path.join(copy, 'no-minidiscord') };
  let log = '';
  try { log = execFileSync('node', ['scripts/setup.js', '--project', 과제], { cwd: copy, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { log = String(e.stdout || '') + String(e.stderr || ''); out('setup.js', '실패', log.split('\n').slice(-3).join(' | ')); }
  fs.writeFileSync(path.join(copy, 'setup-probe.log'), log);
  const 넷 = ['analysis', 'templates', 'house.md', '.gitignore'];
  const 있음 = 넷.filter(n => fs.existsSync(path.join(과제, n)));
  out('A1 자리 넷', `${있음.length}/4`, `있음: ${있음.join(' ')} · 없음: ${넷.filter(n => !있음.includes(n)).join(' ') || '-'}`);
  let gi = 0, untracked = '-';
  if (fs.existsSync(path.join(과제, '.gitignore'))) {
    gi = lines(path.join(과제, '.gitignore')).filter(l => l.trim() === 'tmp/' || l.trim() === 'tmp').length;
    fs.mkdirSync(path.join(과제, 'tmp'), { recursive: true });
    fs.writeFileSync(path.join(과제, 'tmp', 'x.png'), 'x');
    try { untracked = execFileSync('git', ['-C', 과제, 'status', '--short'], { encoding: 'utf8' }).split('\n').filter(l => /tmp/.test(l)).length; } catch { untracked = 'git 없음'; }
  }
  out('A2 .gitignore tmp/ 줄 · tmp 미추적 줄', `${gi} · ${untracked}`);
  const sj = path.join(copy, 'bots', 'prodev-probe-bot', '.claude', 'settings.json');
  if (!fs.existsSync(sj)) { out('A5', '설정 파일 없음', sj); out('A6', '설정 파일 없음'); return; }
  const s = JSON.parse(read(sj));
  const gb = (s.env || {}).CLAUDE_CODE_GIT_BASH_PATH;
  out('A5 CLAUDE_CODE_GIT_BASH_PATH', gb === undefined ? '키 없음 0/1' : (String(gb).trim() ? '1/1' : '키만 있고 값 비었음'), gb === undefined ? '' : String(gb));
  const bash = (s.permissions.allow || []).filter(a => a.startsWith('Bash('));
  const names = bash.map(a => a.replace(/^Bash\(/, '').replace(/[:)].*$/, ''));
  const 남은 = names.filter(n => 뺄것.includes(n));
  out('A6 Bash 항목 수 · 뺄 열여섯 잔존', `${bash.length} · ${남은.length}`, `남은 것: ${남은.join(' ') || '-'} · 전체: ${names.join(' ')}`);
  out('허용 목록 전체', bash.length, sj);
}

// ── hook (A3 A4) ─────────────────────────────────────────────
function hook(opt) {
  const copy = copyRepo(opt);
  const hookFile = path.join(copy, 'common', 'hooks', 'session-start.js');
  for (const [이름, n] of [['20줄', 20], ['51줄', 51]]) {
    const 과제 = fs.mkdtempSync(path.join(os.tmpdir(), 'evo-hook-'));
    for (const d of ['cards', 'wiki', 'inbox', 'journal', 'threads']) fs.mkdirSync(path.join(과제, d));
    fs.writeFileSync(path.join(과제, 'charter.md'), '# 헌장\n한 줄\n');
    fs.writeFileSync(path.join(과제, 'schedule.md'), '# 일정\n한 줄\n');
    fs.writeFileSync(path.join(과제, 'index.md'), '# 색인\n');
    fs.writeFileSync(path.join(과제, 'house.md'), Array.from({ length: n }, (_, i) => `- 규칙 ${i + 1}`).join('\n') + '\n');
    const botDir = fs.mkdtempSync(path.join(os.tmpdir(), 'evo-bot-'));
    let res = '';
    try {
      res = execFileSync('node', [hookFile], { input: JSON.stringify({ source: 'startup' }), encoding: 'utf8',
        env: { ...process.env, PRODEV_PROJECT: 과제, PRODEV_BOT: 'probe', PRODEV_BOT_DIR: botDir, MINIDISCORD_URL: '', PRODEV_NOTIFY_TOKEN: '' } });
    } catch (e) { out(`hook ${이름}`, '실패', String(e.stderr || e.message).split('\n')[0]); continue; }
    let ctx = '';
    try { ctx = JSON.parse(res).hookSpecificOutput.additionalContext; } catch { out(`hook ${이름}`, 'JSON 아님', res.slice(0, 80)); continue; }
    const 절들 = ctx.split(/\n(?=## )/).filter(s => s.startsWith('## '));
    const 제목들 = 절들.map(s => s.split('\n')[0]);
    const idx = 제목들.findIndex(t => /house/i.test(t));
    const house = idx >= 0 ? 절들[idx] : null;
    if (이름 === '20줄') {
      out('A3 ## 절 수 · house 절 순서(1부터)', `${절들.length} · ${idx + 1}`, 제목들.map((t, i) => `${i + 1}:${t.replace(/^## /, '').slice(0, 24)}`).join(' | '));
    } else {
      const body = house ? house.split('\n').slice(1).filter(l => /^- 규칙/.test(l)).length : -1;
      out('A4 51줄 → 실린 규칙 줄 · 잘림 표시', `${body} · ${house && /잘림/.test(제목들[idx]) ? 1 : 0}`, house ? 제목들[idx] : 'house 절 없음');
    }
  }
}

// ── allow (A7) ───────────────────────────────────────────────
function allow(opt) {
  const copy = copyRepo(opt);
  const s = JSON.parse(read(path.join(copy, 'common', 'settings.template.json')));
  const allowed = new Set((s.permissions.allow || []).filter(a => a.startsWith('Bash(')).map(a => a.replace(/^Bash\(/, '').replace(/[:)].*$/, '')));
  const shellBuiltin = new Set(['cd', 'export', 'set', 'source', '.', 'if', 'for', 'while', 'then', 'fi', 'do', 'done', 'echo', 'true', 'false', 'exit']);
  const files = [];
  const walk = d => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.md$/.test(f)) files.push(p); } };
  for (const d of ['.claude/skills', '.claude/agents']) if (fs.existsSync(path.join(copy, d))) walk(path.join(copy, d));
  if (fs.existsSync(path.join(copy, 'CLAUDE.md'))) files.push(path.join(copy, 'CLAUDE.md'));
  const 미허용 = [], 호출 = new Map();
  for (const f of files) {
    let fence = false;
    lines(f).forEach((l, i) => {
      if (/^\s*```/.test(l)) { fence = !fence; return; }
      const m = fence ? /^\s*(?:\$\s*)?([A-Za-z0-9_./-]+)\b/.exec(l) : /`((?:node|python3|python|git|gh|bash|sh|zsh|curl|pip|npm|ls|mkdir|cp|rm|mv|cat|grep|find|sed|awk|sort|uniq|wc|head|tail|diff|tr|cut|stat|file|shasum|sha256sum|chmod|date|basename|dirname|pwd)\b[^`]*)`/.exec(l);
      if (!m) return;
      // 본문 속 `find` 처럼 낱말 하나만 든 백틱은 스킬·도구의 **이름**이다 — 인자가 있을 때만 명령으로 센다 (evo-seat 에서 오탐 3 을 냈다)
      if (!fence && !/\s/.test(m[1].trim())) return;
      const tok = (fence ? m[1] : m[1].split(/\s+/)[0]).replace(/^\.\//, '');
      if (!/^[a-z][a-z0-9_.-]*$/.test(tok) || shellBuiltin.has(tok) || /^(#|\/\/)/.test(tok)) return;
      // 명령 이름으로만 센다 — `find.js` 같은 파일 이름은 명령이 아니다
      if (!/^(node|python3?|git|gh|bash|sh|curl|pip|npm|ls|mkdir|cp|rm|mv|cat|grep|find|sed|awk|sort|uniq|wc|head|tail|diff|tr|cut|stat|file|shasum|sha256sum|chmod|date|basename|dirname|pwd|tar|zip|unzip|pdftotext|open)$/.test(tok)) return;
      호출.set(tok, (호출.get(tok) || 0) + 1);
      if (!allowed.has(tok)) 미허용.push(`${path.relative(copy, f)}:${i + 1} ${tok}`);
    });
  }
  out('A7 allow 에 없는 호출', 미허용.length, 미허용.join(' | ') || '-');
  out('호출된 명령 분포', [...호출.entries()].map(([k, v]) => `${k}:${v}`).join(' '));
}

// ── cells (B2) ───────────────────────────────────────────────
const 칸패턴 = [/알고 싶은|물음|목적|무엇을/, /가정/, /코드|스크립트/, /숫자|결과|검증/, /해석/, /뒤집|반증|틀린 것으로/];
function splitSections(md) {
  const 절 = []; let cur = null;
  for (const l of md.split(/\r?\n/)) {
    if (/^#{1,3}\s/.test(l)) { cur = { title: l.replace(/^#+\s*/, ''), body: [] }; 절.push(cur); }
    else if (cur) cur.body.push(l);
  }
  return 절;
}
function cells(pos) {
  for (const f of pos) {
    const 절 = splitSections(read(f)).filter(s => !/^run\.md|^분석|^#/.test(s.title) || true);
    const found = 칸패턴.map(p => 절.find(s => p.test(s.title)));
    const nonEmpty = s => s && s.body.join('\n').replace(/\s/g, '').length > 0;
    const c3 = found[2] ? found[2].body.join('\n') : '';
    const seed = /seed|random_state|난수|rng/i.test(c3) ? 1 : 0;
    const ver = /\b\d+\.\d+(\.\d+)?\b/.test(c3) && /scipy|numpy|pandas|statsmodels|python/i.test(c3) ? 1 : 0;
    const res = `제목 ${found.filter(Boolean).length}/6 · 가정 ${nonEmpty(found[1]) ? 1 : 0} · 코드(seed ${seed} · 판 ${ver}) · 반증 ${nonEmpty(found[5]) ? 1 : 0}`;
    out(`B2 ${path.basename(path.dirname(f))}`, res, 절.map(s => s.title.slice(0, 20)).join(' | '));
  }
}

// ── rerun (B3) ───────────────────────────────────────────────
// 유니코드 마이너스(−, U+2212)를 ASCII 로 — 봇이 run.md 에 −0.211 로 적고 스크립트는 -0.211 로 찍는다 (evo-path 에서 오탐 1)
const numsOf = s => (s.replace(/−/g, '-').match(/-?\d+\.\d+(?:e-?\d+)?/g) || []).map(Number);
function rerun(pos) {
  for (const dir of pos) {
    const md = path.join(dir, 'run.md'), py = path.join(dir, 'run.py');
    if (!fs.existsSync(py)) { out(`B3 ${path.basename(dir)}`, 'run.py 없음'); continue; }
    let stdout = '';
    try { stdout = execFileSync('python3', ['run.py'], { cwd: dir, encoding: 'utf8', timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'] }); }
    catch (e) { out(`B3 ${path.basename(dir)}`, 'run.py 실패', String(e.stderr || e.message).split('\n').filter(Boolean).slice(-1)[0]); continue; }
    // 재는 판(봇의 폴더)에 파일을 남기지 않는다 — evo-path 에서 rerun.out.txt 가 봇 폴더에 남아 봇이 두 번 알아챘다
    const outDir = path.join(os.tmpdir(), 'evo-rerun'); fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, `${path.basename(dir)}.out.txt`), stdout);
    const 절 = splitSections(read(md));
    const c4 = 절.find(s => 칸패턴[3].test(s.title));
    const want = c4 ? numsOf(c4.body.join('\n')).filter(v => Math.abs(v) >= 0.001) : [];
    const got = numsOf(stdout);
    const missing = want.filter(w => !got.some(g => Math.abs(g - w) <= Math.max(0.005, Math.abs(w) * 0.001)));
    out(`B3 ${path.basename(dir)}`, `run.md 4칸 숫자 ${want.length} 중 재실행에 없는 것 ${missing.length}`, missing.length ? `없는 것: ${missing.join(' ')}` : `rerun.out.txt`);
  }
}

// ── key (B4) ─────────────────────────────────────────────────
function keyNums(keyFile) {
  const m = new Map();
  for (const l of lines(keyFile)) { const k = /^- (\S+): ([-\d.e+]+)(?:\s*\((.*?)\))?/.exec(l); if (k) m.set(k[1], { v: Number(k[2]), tol: k[3] }); }
  return m;
}
function keyCheck(pos, opt) {
  const K = keyNums(opt.key);
  const text = pos.map(f => read(f)).join('\n');
  const nums = numsOf(text);
  let hit = 0;
  for (const [name, { v, tol }] of K) {
    let ok;
    if (tol && /^</.test(tol)) ok = nums.some(n => n > 0 && n < Number(tol.slice(1)));    // p 는 "< 0.01" 로 본다
    else ok = nums.some(n => Math.abs(n - v) <= (tol ? Number(tol) : 0.011));
    out(`B4 ${name}`, ok ? '○' : '✗', `정답 ${v}${tol ? ` (${tol})` : ''}`);
    if (ok) hit++;
  }
  out('B4 합', `${hit}/${K.size}`);
}

// ── retro (B13) ──────────────────────────────────────────────
function retro(pos, opt) {
  const 답 = read(pos[0]);
  const key = read(opt.key);
  const 심은 = [...key.matchAll(/^- 심은것: (.+)$/gm)].map(m => m[1].split('|').map(s => s.trim()));
  const 절 = splitSections(답);
  const 넷 = [/되풀이|반복/, /막힌|막힘/, /굳힐|굳히/, /스킬|에이전트/].map(p => 절.find(s => p.test(s.title)));
  out('B13 넷 절', `${넷.filter(Boolean).length}/4`, 절.map(s => s.title.slice(0, 16)).join(' | '));
  const items = 답.split(/\r?\n/).filter(l => /^\s*(?:[-*]|\d+\.)\s+\S/.test(l));
  // 봇은 09-01(#415) · W37 · review.md 꼴로도 근거를 댄다 (evo-path 에서 도구가 5 를 냈고 파일 대조는 0 이었다)
  const 근거 = /20\d\d-\d\d-\d\d|\b\d\d-\d\d\b|#\d{2,}|W\d\d|review\.md|find\.log|\b[EDRN]-\d{4}\b|journal\/|일지 \d|\.md\b|\.py\b/;
  const 닫음 = /없음|없다|해당 없음|후보 없음/;                 // "없음" 으로 닫은 항목은 근거가 필요 없다
  const 무근거 = items.filter(l => !근거.test(l) && !닫음.test(l));
  out('B13 항목 · 근거 없는 항목', `${items.length} · ${무근거.length}`, 무근거.map(l => l.trim().slice(0, 40)).join(' | ') || '-');
  const 지어냄 = items.filter(l => !심은.some(keys => keys.some(k => l.includes(k))));
  out('B13 지어낸 항목 (심은 낱말이 하나도 없는 것)', 지어냄.length, 지어냄.map(l => l.trim().slice(0, 40)).join(' | ') || '-');
  const 스킬절 = 넷[3];
  const 제안 = 스킬절 ? 스킬절.body.filter(l => /^\s*(?:[-*]|\d+\.)\s+\S/.test(l)) : [];
  const 판별없음 = 제안.filter(l => !/데이터로|md 로|숫자|타이밍|문맥|시키지 않아도|덮/.test(l) && !/없음|없다|해당 없음|후보 없음/.test(l));
  out('B13 스킬·에이전트 제안 · 판별 넷 답 없는 것', `${제안.length} · ${판별없음.length}`, 판별없음.map(l => l.trim().slice(0, 40)).join(' | ') || '-');
}

// ── evidence (C1) ────────────────────────────────────────────
function evidence(opt) {
  const names = (opt.names || '2026-09-10-T1M,2026-09-10-T2M,2026-09-10-T2M-2,2026-09-10-T3M,2026-09-11-search,2026-09-11-search-2').split(',').map(s => s.trim());
  const ev = path.join(PRODEV, 'docs', 'evidence');
  const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  let have = 0, mismatch = 0;
  for (const n of names) {
    const a = path.join(REVIEW, 'runs', `${n}.md`), b = path.join(ev, `${n}.md`);
    if (!fs.existsSync(b)) { out(`C1 ${n}`, '사본 없음'); continue; }
    have++;
    const same = fs.existsSync(a) && sha(a) === sha(b);
    if (!same) mismatch++;
    out(`C1 ${n}`, same ? '○ 같음' : '✗ 다름', sha(b).slice(0, 12));
  }
  out('C1 합', `${have}/${names.length} · 불일치 ${mismatch}`, fs.existsSync(ev) ? `${fs.readdirSync(ev).length}개 파일` : 'evidence 폴더 없음');
}

const { cmd, pos, opt } = args();
({ gen, setup, hook, allow, cells: () => cells(pos), rerun: () => rerun(pos), key: () => keyCheck(pos, opt), retro: () => retro(pos, opt), evidence }[cmd] || (() => { console.error(read(__filename).split('\n').slice(1, 16).join('\n')); process.exit(2); }))(opt);
