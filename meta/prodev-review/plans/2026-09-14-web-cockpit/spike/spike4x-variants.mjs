// 실증 4 변형 공용: node spike4x.mjs <cwd> <allowedTools: yes|no> <prompt>
// 검토 1차 #21 · #23 · #24 · #25 · #29 에 답하는 판들 (4f 대조군 · 4g 훅+allowedTools · 4h Write 규칙 · 4i 도우미 agentID)
import { query, createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
const [cwd, allowFlag, prompt] = process.argv.slice(2);
const chat = createSdkMcpServer({ name: 'minidiscord-channel', version: '0.0.1', tools: [
  tool('reply', 'Send a reply', { chat_id: z.string(), text: z.string() }, async (a) => { console.log('REPLY -> len', a.text.length); return { content: [{ type: 'text', text: 'sent' }] }; }),
  tool('fetch_history', 'Fetch history', { chat_id: z.string().optional(), limit: z.number().optional() }, async () => ({ content: [{ type: 'text', text: '{"cursor":null,"messages":[]}' }] })),
]});
const asked = [];
const q = query({ prompt, options: {
  cwd, settingSources: ['project', 'local'], strictMcpConfig: true, mcpServers: { 'minidiscord-channel': chat },
  permissionMode: 'default', persistSession: false, model: 'claude-haiku-4-5-20251001', maxTurns: 8, env: { ...process.env, PRODEV_BOT_DIR: cwd },
  ...(allowFlag === 'yes' ? { allowedTools: ['mcp__minidiscord-channel__reply', 'mcp__minidiscord-channel__fetch_history'] } : {}),
  canUseTool: async (toolName, input, opts) => { asked.push({ toolName, agentID: opts.agentID || null, input: JSON.stringify(input).slice(0, 60) }); console.log('CAN_USE_TOOL?', toolName, 'agentID=', opts.agentID || '-', JSON.stringify(input).slice(0, 60)); return { behavior: 'allow', updatedInput: input }; },
}});
for await (const m of q) {
  if (m.type === 'assistant') for (const b of m.message.content) if (b.type === 'tool_use') console.log('TOOL_USE', b.name, JSON.stringify(b.input).slice(0, 70), m.parent_tool_use_id ? '(in subagent)' : '');
  if (m.type === 'user') for (const b of (Array.isArray(m.message.content) ? m.message.content : [])) if (b.type === 'tool_result' && b.is_error) console.log('TOOL_RESULT_ERROR', JSON.stringify(b.content).slice(0, 160));
  if (m.type === 'result') console.log('RESULT', m.subtype, 'turns', m.num_turns, 'cost', m.total_cost_usd?.toFixed(3));
}
console.log('ASKED', JSON.stringify(asked));
