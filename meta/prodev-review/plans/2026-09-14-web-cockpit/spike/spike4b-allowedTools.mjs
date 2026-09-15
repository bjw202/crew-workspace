// 실증 4: permissionMode 'default' + 봇 허용 목록. 목록 밖 도구(curl)만 canUseTool 로 오는가, 목록 안(node · reply)은 안 오는가.
import { query, createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
const cwd = process.argv[2];
const chat = createSdkMcpServer({ name: 'minidiscord-channel', version: '0.0.1', tools: [
  tool('reply', 'Send a reply', { chat_id: z.string(), text: z.string() }, async (a) => { console.log('REPLY ->', a.text.slice(0, 120).replace(/\n/g, ' ')); return { content: [{ type: 'text', text: 'sent' }] }; }),
]});
const asked = [];
const t0 = Date.now(); const log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(1) + 's', ...a);
const q = query({
  prompt: '@TO(비서) 시험이다. 순서대로: ① Bash 로 `curl --version | head -1` ② Bash 로 `node -e "console.log(2)"` ③ Read 로 CLAUDE.md 첫 줄. 셋의 결과를 reply 도구로 chat_id "1" 에 세 줄로 보내라.',
  options: {
    cwd, settingSources: ['project', 'local'], strictMcpConfig: true, mcpServers: { 'minidiscord-channel': chat },
    allowedTools: ['Bash(node:*)', 'mcp__minidiscord-channel__reply'], permissionMode: 'default', persistSession: false, model: 'claude-haiku-4-5-20251001', maxTurns: 8,
    env: { ...process.env, PRODEV_BOT_DIR: cwd },
    canUseTool: async (toolName, input, { suggestions }) => {
      asked.push({ toolName, input: JSON.stringify(input).slice(0, 80), suggestions: (suggestions || []).length });
      log('CAN_USE_TOOL?', toolName, JSON.stringify(input).slice(0, 80)); await new Promise(r => setTimeout(r, 3000)); log('  -> allow (3초 뒤)');
      return { behavior: 'allow', updatedInput: input };
    },
  },
});
for await (const m of q) {
  if (m.type === 'assistant') for (const b of m.message.content) if (b.type === 'tool_use') log('TOOL_USE', b.name, JSON.stringify(b.input).slice(0, 80));
  if (m.type === 'system' && m.subtype === 'init') log('INIT permissionMode=', m.permissionMode);
  if (m.type === 'result') log('RESULT', m.subtype, 'turns', m.num_turns, 'cost', m.total_cost_usd?.toFixed(3), 'denials', JSON.stringify(m.permission_denials || []).slice(0, 200));
}
console.log('ASKED', JSON.stringify(asked, null, 1));
