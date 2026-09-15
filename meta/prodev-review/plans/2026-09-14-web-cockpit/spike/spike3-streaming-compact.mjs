// 장수 세션: 스트리밍 입력으로 말 셋 (인사 → /compact → 이어서), 훅과 압축 경계 관찰
import { query, createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
const cwd = process.argv[2];
const chat = createSdkMcpServer({ name: 'minidiscord-channel', version: '0.0.1', tools: [
  tool('reply', 'Send a reply', { chat_id: z.string(), text: z.string() }, async (a) => { console.log('REPLY ->', a.text.slice(0, 80)); return { content: [{ type: 'text', text: 'sent' }] }; }),
]});
let resolveNext; const queue = []; 
const input = { [Symbol.asyncIterator]() { return { next: () => queue.length ? Promise.resolve({ value: queue.shift(), done: false }) : new Promise(r => { resolveNext = r; }) }; } };
const send = (text) => { const v = { type: "user", session_id: "", message: { role: "user", content: [{ type: "text", text }] }, parent_tool_use_id: null }; if (resolveNext) { const r = resolveNext; resolveNext = null; r({ value: v, done: false }); } else queue.push(v); };
const q = query({ prompt: input, options: {
  cwd, settingSources: ['project', 'local'], strictMcpConfig: true, mcpServers: { 'minidiscord-channel': chat },
  permissionMode: 'bypassPermissions', allowDangerouslySkipPermissions: true, persistSession: false,
  model: 'claude-haiku-4-5-20251001', env: { ...process.env, PRODEV_FAKE_CLAUDE: '1' },
}});
const t0 = Date.now(); const log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(1) + 's', ...a);
const steps = ['@TO(비서) 안녕. reply 로 chat_id "1" 에 "안녕하세요, 비서입니다" 만 보내라.', '/compact', '@TO(비서) 방금 무엇을 했나. reply 로 chat_id "1" 에 한 줄로 답하라.'];
let i = 0; send(steps[i++]);
for await (const m of q) {
  if (m.type === 'system' && m.subtype === 'hook_started') log('HOOK', m.hook_event, m.hook_name || '');
  if (m.type === 'system' && m.subtype === 'hook_response') log('  ->', m.hook_event, 'exit', m.exit_code, (m.stderr || m.output || '').toString().slice(0, 100).replace(/\n/g, ' '));
  if (m.type === 'system' && m.subtype === 'compact_boundary') log('COMPACT_BOUNDARY', JSON.stringify(m.compact_metadata).slice(0, 120));
  if (m.type === 'assistant') log('ASSISTANT', JSON.stringify(m.message.content).slice(0,160)); if (m.type === 'system' && !['init','hook_started','hook_response','compact_boundary'].includes(m.subtype)) log('SYS', m.subtype);
  if (m.type === "result") { log("RESULT", JSON.stringify(m).slice(0, 400)); if (i < steps.length) send(steps[i++]); else { q.close(); break; } }
}
log('done');
