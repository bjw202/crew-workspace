#!/usr/bin/env node
// 회차 판정 도구 — meta 가 돌린다. 봇에게 보이지 않는 자리다.
//
//   node notes/measure.js <시작 message_id> <끝 message_id> [이름]
//   node notes/measure.js 271 999 "회차 4"
//
// 채팅 DB 를 읽기 전용으로 열어 봇 발언의 길이·줄·어절·자기 계측을 센다.
// 세는 법은 notes/round-4-prediction.md 의 1절에 적힌 것 하나뿐이다.
// 서버는 켜 둔 채로 된다. WAL 이 붙어 있으므로 사본을 만들어 연다.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const SRC = process.env.MINIDISCORD_DB || require('path').resolve(__dirname, '..', '..', '..', 'minidiscord', 'server', 'data', 'minidiscord.db');   // <작업판>/minidiscord/server/data — 절대 경로를 뺐다 (2026-09-11 공개 전환)
const [loArg, hiArg, nameArg] = process.argv.slice(2);
if (!loArg || !hiArg) {
  console.error('쓰는 법: node notes/measure.js <시작 message_id> <끝 message_id> [이름]');
  process.exit(1);
}
const lo = Number(loArg), hi = Number(hiArg), name = nameArg || `${lo}–${hi}`;

// ── 사본을 뜬다 (.db · .db-wal · .db-shm 셋을 함께) ──
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'crew-measure-'));
for (const ext of ['', '-wal', '-shm']) {
  try { fs.copyFileSync(SRC + ext, path.join(tmp, 'md.db' + ext)); } catch { /* wal·shm 은 없을 수 있다 */ }
}
const db = new DatabaseSync(path.join(tmp, 'md.db'), { readOnly: true });

// ── 세는 법 (여기 한 곳에서만 정의한다) ──
const SELF = /\n?\(\s*\d+\s*자\s*·[^)\n]*\)\s*$/;          // 맨 끝의 자기 계측 줄
const TO = /^@TO\([^)\n]*\)\s*/;                            // 첫머리의 멘션 — 봉투지 글이 아니다
const strip = b => b.replace(/\s+$/, '').replace(TO, '').replace(SELF, '');
const chars = b => [...strip(b)].length;                    // 글자 수
const lines = b => strip(b).split('\n').filter(l => l.trim()).length;  // 줄 수 (빈 줄은 빼고)
const sentences = b => strip(b).split(/(?<=[.!?])\s+|\n/).map(s => s.trim()).filter(Boolean);
const eojeol = s => s.split(/\s+/).filter(Boolean).length;
const maxEojeol = b => Math.max(0, ...sentences(b).map(eojeol));
const TO_BOT = /^@TO\((orchestrator|analyst|archivist|researcher|reporter)\)/;

const med = a => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};
const pct = (k, n) => (n ? (100 * k / n).toFixed(0) + '%' : '—');

const rows = db.prepare(`
  SELECT m.id, m.author_type, m.created_at, m.body, COALESCE(b.name, u.username, 'system') AS who
  FROM messages m
  LEFT JOIN bots b ON b.id = m.author_bot_id
  LEFT JOIN users u ON u.id = m.author_user_id
  WHERE m.room_id = 1 AND m.id >= ? AND m.id <= ? ORDER BY m.id`).all(lo, hi);

const bots = rows.filter(r => r.author_type === 'bot');
const humans = rows.filter(r => r.author_type === 'user');
const sys = rows.filter(r => r.author_type === 'system');
const appr = sys.filter(r => r.body.includes('승인을 요청'));

if (!bots.length) { console.log(`${name}: 이 구간에 봇 발언이 없다.`); process.exit(0); }

const C = bots.map(r => chars(r.body));
const L = bots.map(r => lines(r.body));
const E = bots.map(r => maxEojeol(r.body));
const metered = bots.filter(r => SELF.test(r.body));

console.log(`\n## ${name}   message ${lo}–${hi}   (${rows[0].created_at} ~ ${rows[rows.length - 1].created_at})`);
console.log(`   봇 발언 ${bots.length}건 · 사람 ${humans.length}건 · 시스템 ${sys.length}건\n`);
console.log(`   봇 발언 글자 수 중앙값        ${med(C)}`);
console.log(`   600자 초과 비율               ${pct(C.filter(c => c > 600).length, C.length)}  (${C.filter(c => c > 600).length}/${C.length})`);
console.log(`   6줄 초과 비율                 ${pct(L.filter(l => l > 6).length, L.length)}  (${L.filter(l => l > 6).length}/${L.length})`);
console.log(`   최장 문장 25어절 초과 비율    ${pct(E.filter(e => e > 25).length, E.length)}  (${E.filter(e => e > 25).length}/${E.length})`);
console.log(`   자기 계측 줄이 붙은 비율      ${pct(metered.length, bots.length)}  (${metered.length}/${bots.length})`);

// ── 자기 계측 값과 실측의 어긋남 ──
if (metered.length) {
  console.log(`\n   자기 계측 대조 (자칭 → 실측):`);
  let worst = 0, ok = 0;
  for (const r of metered) {
    const m = r.body.match(/\((\s*\d+)\s*자\s*·\s*(\d+)\s*줄(?:\s*·\s*최장\s*(\d+)\s*어절)?\s*\)\s*$/);
    if (!m) { console.log(`     msg ${r.id} ${r.who}: 계측 줄의 서식이 어긋난다`); continue; }
    const dc = chars(r.body) - Number(m[1]), dl = lines(r.body) - Number(m[2]);
    const de = m[3] ? maxEojeol(r.body) - Number(m[3]) : null;
    if (Math.abs(dc) <= 2 && dl === 0) ok++;
    worst = Math.max(worst, Math.abs(dc));
    console.log(`     msg ${r.id} ${r.who.padEnd(13)} 자 ${String(m[1]).trim()}→${chars(r.body)} (${dc >= 0 ? '+' : ''}${dc})` +
      ` · 줄 ${m[2]}→${lines(r.body)} (${dl >= 0 ? '+' : ''}${dl})` +
      (de === null ? '' : ` · 어절 ${m[3]}→${maxEojeol(r.body)} (${de >= 0 ? '+' : ''}${de})`));
    // 계측 줄을 넣고 센 값도 함께 보인다 — 어느 세는 법으로도 안 맞으면 기계로 세지 않은 것이다.
    const withLine = [...r.body].length, withLineL = r.body.split('\n').filter(l => l.trim()).length;
    console.log(`        ↳ 계측 줄을 넣고 세면 ${withLine}자 · ${withLineL}줄 (자칭과의 차 ${withLine - Number(m[1])}자)`);
  }
  console.log(`   계측이 맞은 비율 (±2자·줄 정확)  ${pct(ok, metered.length)}  (${ok}/${metered.length}) · 가장 큰 어긋남 ${worst}자`);
}

// ── orchestrator 를 따로 ──
const orch = bots.filter(r => r.who === 'orchestrator');
if (orch.length) {
  const toBot = orch.filter(r => TO_BOT.test(r.body)), toHuman = orch.filter(r => !TO_BOT.test(r.body));
  const bc = toBot.map(r => chars(r.body)), hc = toHuman.map(r => chars(r.body));
  console.log(`\n   orchestrator ${orch.length}건`);
  console.log(`     봇 대상  ${toBot.length}건 · 중앙값 ${med(bc)}자 · 최대 ${Math.max(0, ...bc)}자 · 600자 초과 ${pct(bc.filter(c => c > 600).length, bc.length)}`);
  console.log(`     사람 대상 ${toHuman.length}건 · 중앙값 ${med(hc)}자 · 최대 ${Math.max(0, ...hc)}자 · 900자 초과 ${pct(hc.filter(c => c > 900).length, hc.length)}`);
  console.log(`     자기 계측 줄이 붙은 비율 ${pct(orch.filter(r => SELF.test(r.body)).length, orch.length)}`);
}

console.log(`\n   방에 뜬 도구 승인 요청       ${appr.length}건`);
console.log(`   (승인 수는 봇 세션의 permissionMode 에 딸린다. auto 면 0 이 나온다 — 규칙의 효과가 아니다.)`);

// ── 봇 세션의 권한 모드 · 채팅 DB 읽는 법 ──
const P = path.join(os.homedir(), '.claude', 'projects');
// 창을 잇는다: 앞 메시지 시각부터 재야 두 창 사이에 낀 호출이 새지 않는다.
// 다만 30분 넘게 벌어진 틈은 잇지 않는다 — 그 틈은 방이 쉰 시간이지 이 창의 일이 아니다.
const prev = db.prepare('SELECT created_at FROM messages WHERE room_id=1 AND id < ? ORDER BY id DESC LIMIT 1').get(lo);
const gapMin = prev ? (Date.parse(rows[0].created_at + 'Z') - Date.parse(prev.created_at + 'Z')) / 60000 : Infinity;
const since = (prev && gapMin <= 30 ? prev.created_at : rows[0].created_at).replace(' ', 'T');
const until = rows[rows.length - 1].created_at.replace(' ', 'T') + '￿';
let modes = new Set(), sqlite3 = 0, nodeSqlite = 0, chained = 0;
if (fs.existsSync(P)) {
  for (const bot of ['orchestrator', 'analyst', 'archivist', 'researcher', 'reporter']) {
    const d = fs.readdirSync(P).find(x => x.endsWith('-bots-' + bot));
    if (!d) continue;
    for (const f of fs.readdirSync(path.join(P, d)).filter(x => x.endsWith('.jsonl'))) {
      for (const line of fs.readFileSync(path.join(P, d, f), 'utf8').split('\n')) {
        if (!line.trim()) continue;
        let o; try { o = JSON.parse(line); } catch { continue; }
        if (!o.timestamp || o.timestamp < since || o.timestamp > until) continue;
        const mm = line.match(/"permissionMode":"([a-zA-Z]+)"/);
        if (mm) modes.add(bot + '=' + mm[1]);
        if (o.type !== 'assistant') continue;
        for (const c of (o.message || {}).content || []) {
          if (c && c.type === 'tool_use' && c.name === 'Bash') {
            const cmd = (c.input || {}).command || '';
            if (!/minidiscord\.db/.test(cmd)) continue;
            if (/\bsqlite3\b/.test(cmd)) sqlite3++; else if (/node:sqlite/.test(cmd)) nodeSqlite++;
            if (/&&|;\s*\S|\|\s*\S/.test(cmd.replace(/["'][^"']*["']/g, ''))) chained++;
          }
        }
      }
    }
  }
}
console.log(`   봇 세션 권한 모드            ${[...modes].sort().join(' · ') || '알 수 없음'}`);
console.log(`   채팅 DB 읽기                 node:sqlite ${nodeSqlite}회 · sqlite3 ${sqlite3}회 · 명령을 이어 붙인 것 ${chained}회`);

fs.rmSync(tmp, { recursive: true, force: true });
