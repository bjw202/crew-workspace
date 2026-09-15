// 실증 5: 설계 4.2 의 조합 전체. default + canUseTool + allowedTools(MCP 둘) + persistSession true + env 화이트리스트.
// 말 셋: 인사 → /compact → 이어서. 압축 경계 · 훅 둘 · "이어서" · handoff-compact.md 에 "못 썼다" 없음 을 본다.
import { query, createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import fs from 'node:fs';
const cwd = process.argv[2];
const WHITELIST = ['PATH', 'HOME', 'USER', 'SHELL', 'TMPDIR', 'LANG', 'CLAUDE_CONFIG_DIR', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'TEMP', 'TMP', 'SystemRoot', 'ComSpec', 'CLAUDE_CODE_GIT_BASH_PATH'];
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => WHITELIST.includes(k)));
env.PRODEV_BOT_DIR = cwd; env.PRODEV_FAKE_CLAUDE = '1';
console.log('ENV keys ->', Object.keys(env).join(','));
const chat = createSdkMcpServer({ name: 'cockpit', version: '0.0.1', tools: [
  tool('reply', 'Send a reply', { chat_id: z.string(), text: z.string() }, async (a) => { console.log('REPLY ->', a.text.slice(0, 80)); return { content: [{ type: 'text', text: 'sent' }] }; }),
]});
let resolveNext; const queue = [];
const input = { [Symbol.asyncIterator]() { return { next: () => queue.length ? Promise.resolve({ value: queue.shift(), done: false }) : new Promise(r => { resolveNext = r; }) }; } };
const send = (text) => { const v = { type: 'user', session_id: '', message: { role: 'user', content: [{ type: 'text', text }] }, parent_tool_use_id: null }; if (resolveNext) { const r = resolveNext; resolveNext = null; r({ value: v, done: false }); } else queue.push(v); };
const asked = [];
const q = query({ prompt: input, options: {
  cwd, settingSources: ['project', 'local'], strictMcpConfig: true, mcpServers: { cockpit: chat },
  permissionMode: 'default', allowedTools: ['mcp__cockpit__reply'], persistSession: true, env,
  model: 'claude-haiku-4-5-20251001', includePartialMessages: false,
  canUseTool: async (toolName, input) => { asked.push(toolName); console.log('CAN_USE_TOOL?', toolName); return { behavior: 'allow', updatedInput: input }; },
}});
const t0 = Date.now(); const log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(1) + 's', ...a);
const steps = ['@TO(비서) 안녕. reply 로 chat_id "1" 에 "안녕하세요, 비서입니다" 만 보내라.', '/compact', '@TO(비서) 방금 무엇을 했나. reply 로 chat_id "1" 에 한 줄로 답하라.'];
let i = 0; send(steps[i++]); let sid = '';
for await (const m of q) {
  if (m.session_id) sid = m.session_id;
  if (m.type === 'system' && m.subtype === 'hook_started') log('HOOK', m.hook_event, m.hook_name || '');
  if (m.type === 'system' && m.subtype === 'compact_boundary') log('COMPACT_BOUNDARY', JSON.stringify(m.compact_metadata).slice(0, 100));
  if (m.type === 'assistant') for (const b of m.message.content) if (b.type === 'text') log('TEXT', b.text.slice(0, 80).replace(/\n/g, ' '));
  if (m.type === 'result') { log('RESULT', m.subtype, 'turns', m.num_turns, 'cost', m.total_cost_usd?.toFixed(3)); if (i < steps.length) send(steps[i++]); else { q.close(); break; } }
}
console.log('ASKED', JSON.stringify(asked), 'session', sid);
const h = cwd + '/handoff-compact.md'; console.log('HANDOFF exists', fs.existsSync(h), fs.existsSync(h) ? (fs.readFileSync(h, 'utf8').includes('못 썼다') ? '못 썼다 있음' : '정상') : '');
