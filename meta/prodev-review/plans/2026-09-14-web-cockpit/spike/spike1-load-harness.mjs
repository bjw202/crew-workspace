import { query, createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
const cwd = process.argv[2];
const replies = [];
const chat = createSdkMcpServer({ name: 'minidiscord-channel', version: '0.0.1', tools: [
  tool('reply', 'Send a reply to the chat room', { chat_id: z.string(), text: z.string() }, async (a) => { replies.push(a); return { content: [{ type: 'text', text: 'sent' }] }; }),
]});
const seen = {};
const hookEvents = [];
const q = query({
  prompt: '@TO(비서) 안녕. reply 도구로 chat_id "1" 에 "안녕하세요" 한 줄만 보내고 끝내라. 다른 도구는 쓰지 마라.',
  options: {
    cwd, settingSources: ['project', 'local'], strictMcpConfig: true,
    mcpServers: { 'minidiscord-channel': chat },
    permissionMode: 'bypassPermissions', allowDangerouslySkipPermissions: true,
    persistSession: false, model: 'claude-haiku-4-5-20251001', maxTurns: 4,
    stderr: (d) => { if (/error|hook/i.test(d)) console.error('[stderr]', d.trim().slice(0, 300)); },
  },
});
const init = await q.initializationResult();
console.log('INIT hooks_applied=', init.hooks_applied, 'plugins_applied=', init.plugins_applied);
console.log('INIT commands(skills)=', init.commands.length, init.commands.map(c => c.name).filter(n => /prodev|intake|find|charter|retro|analysis/.test(n)).join(','));
console.log('INIT agents=', init.agents.map(a => a.name).join(','));
console.log('INIT account=', JSON.stringify({ apiKeySource: init.account?.apiKeySource, sub: init.account?.subscriptionType, org: init.account?.organizationName ? 'yes' : 'no' }));
for await (const m of q) {
  seen[m.type] = (seen[m.type] || 0) + 1;
  if (m.type === 'system' && m.subtype === 'init') console.log('SYS init mcp=', JSON.stringify(m.mcp_servers), 'model=', m.model, 'permMode=', m.permissionMode);
  if (m.type === 'system' && m.subtype === 'hook_started') hookEvents.push(`${m.hook_event} ${m.hook_name || ''}`);
  if (m.type === 'system' && m.subtype === 'hook_response') hookEvents.push(`  -> ${m.hook_event} exit=${m.exit_code} ${(m.stderr||m.output||'').toString().slice(0,120).replace(/\n/g,' ')}`);
  if (m.type === 'assistant') for (const b of m.message.content) if (b.type === 'tool_use') console.log('TOOL_USE', b.name, JSON.stringify(b.input).slice(0, 120));
  if (m.type === 'result') console.log('RESULT', m.subtype, 'turns=', m.num_turns, 'cost=', m.total_cost_usd, 'session=', m.session_id);
}
console.log('MSG TYPES', JSON.stringify(seen));
console.log('HOOKS', JSON.stringify(hookEvents, null, 1));
console.log('REPLIES', JSON.stringify(replies));
