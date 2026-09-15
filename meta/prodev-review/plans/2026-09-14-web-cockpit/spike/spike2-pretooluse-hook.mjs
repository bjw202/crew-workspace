import { query, createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
const cwd = process.argv[2];
const replies = [];
const chat = createSdkMcpServer({ name: 'minidiscord-channel', version: '0.0.1', tools: [
  tool('reply', 'Send a reply to the chat room', { chat_id: z.string(), text: z.string() }, async (a) => { replies.push(a.text.length); return { content: [{ type: 'text', text: 'sent' }] }; }),
]});
const hookEvents = []; const sdkHookCalls = [];
const q = query({
  prompt: '@TO(비서) 시험이다. reply 도구로 chat_id "1" 에 한글 1200자짜리 긴 글(아무 내용, 줄바꿈 없이)을 한 번 보내라. 막히면 그 이유를 그대로 한 줄로 말하고, 다시 시도하지 말고 끝내라.',
  options: {
    cwd, settingSources: ['project', 'local'], strictMcpConfig: true,
    mcpServers: { 'minidiscord-channel': chat },
    hooks: { PreToolUse: [{ matcher: 'mcp__minidiscord-channel__reply', hooks: [async (input) => { sdkHookCalls.push(input.tool_name); return {}; }] }] },
    permissionMode: 'bypassPermissions', allowDangerouslySkipPermissions: true,
    persistSession: false, model: 'claude-haiku-4-5-20251001', maxTurns: 4,
  },
});
let lastText = '';
for await (const m of q) {
  if (m.type === 'system' && m.subtype === 'hook_started') hookEvents.push(`${m.hook_event} ${m.hook_name || ''}`);
  if (m.type === 'system' && m.subtype === 'hook_response') hookEvents.push(`  -> ${m.hook_event} exit=${m.exit_code} ${(m.stderr||m.output||'').toString().slice(0,160).replace(/\n/g,' ')}`);
  if (m.type === 'user') for (const b of (m.message.content||[])) if (b.type === 'tool_result') console.log('TOOL_RESULT', JSON.stringify(b.content).slice(0, 300));
  if (m.type === 'assistant') for (const b of m.message.content) { if (b.type === 'tool_use') console.log('TOOL_USE', b.name, 'len=', (b.input.text||'').length); if (b.type === 'text') lastText = b.text; }
  if (m.type === 'result') console.log('RESULT', m.subtype, 'turns=', m.num_turns, 'cost=', m.total_cost_usd);
}
console.log('HOOKS', JSON.stringify(hookEvents, null, 1));
console.log('SDK_HOOK_CALLS', JSON.stringify(sdkHookCalls));
console.log('REPLIES sent lens', JSON.stringify(replies));
console.log('LAST TEXT', lastText.slice(0, 300));
