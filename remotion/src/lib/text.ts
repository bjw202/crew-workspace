// 화면 글자 상수. plan/03-storyboard.md 의 "화면 글자" 블록을 글자 그대로 옮겼다.
// 장면 파일 안에 긴 글자를 직접 쓰지 않는다. 경로 기준: cockpit/… = crew-workspace/cockpit/, prodev/… = crew-workspace/prodev/
//
// OPTIONS      — cockpit/src/session/options.js:11-31 (02-plan 장면 4 의 줄 그대로)
// ENVELOPE_6   — cockpit/src/envelope/wrap.js:62-68 · :13 REPLY_DIRECTIVE · 01-facts.md 3절 4
// ENVELOPE_7   — ENVELOPE_6 와 같은 틀(wrap.js:62-68), message_id 12 · 본문은 03 장면 7 의 셋째 글 (S07 압축 봉투 칩, compact 로만 쓴다)
// HISTORY_7    — cockpit/src/mcp/tools.js:60-64 filename · path, :129-135 id · at · author · body · attachments, :138 cursor (값은 예시)
// ENVELOPE_8   — wrap.js:62-68 · 첨부 줄 :45 · 절대 경로 :61 (uuid 와 사용자 폴더 이름은 예시)
// ENVELOPE_8C  — ENVELOPE_6 와 같은 틀(wrap.js:62-68), message_id 14 · 본문은 03 장면 8 의 확정 글 (S08 압축 봉투 칩, compact 로만 쓴다)
// BOT_8A       — 첫 줄 머리는 prodev README S2 줄, 나머지 값은 예시, 마지막 줄은 prodev/.claude/skills/intake/SKILL.md:63 (번호 E-0001)
// CHECK_8      — prodev/common/hooks/pre-reply.js:64-65 주석의 조건 ①~④
// TICKS_9      — prodev/common/settings.template.json:15-27 · 02-plan 장면 9 눈금 여섯
// BRANCH_9     — prodev/.claude/skills/prodev-orchestrator/SKILL.md:12-19 (분기표 앞 여덟 줄 요약)
// SKILLS_9     — prodev/.claude/skills/ 폴더 이름 15
// CHECKS_9     — prodev/common/hooks/pre-reply.js:7-12
// LAYERS_10    — prodev/scripts/find.js:7-12
// FINDLOG_10   — find.js:281 칸 순서 · :287-294 LAYER_NAME[2] (탭은 넓은 빈칸으로)
// HANDOFF_11   — prodev/common/hooks/pre-compact.js:144 머리 · :26 여섯 칸 (날짜는 예시)
// SECTIONS_11  — prodev/common/hooks/session-start.js:95-138 절 제목 (4 는 :112, 실이 하나 있는 것으로)
// WAKE_11      — session-start.js:85 (이름 뒤에 빈칸 없이 "다")
// TERM_12      — cockpit/bin/cockpit.js:237 · :231 · :251
// ENVELOPE_12  — 두 덩이를 빈 줄 하나로 잇는다 cockpit/src/session/manager.js:323
// RETRO_13     — 틀은 prodev/.claude/skills/retro/SKILL.md:80-82 (내용은 예시)
// SEVEN_A      — 01-facts.md 6절 · 02-plan 장면 14 (prodev 뿌리 쪽)
// SEVEN_BOT    — prodev/common/settings.local.template.json:3 · :27 (봇 폴더 쪽)
// SEVEN_PROJECT — 01-facts.md 6절 (과제 폴더 쪽)

export const OPTIONS = `query({ prompt: <입력 흐름>, options: {
  cwd: botDir,
  settingSources: ['project','local'],
  mcpServers: { cockpit },            // reply · fetch_history
  allowedTools: ['mcp__cockpit__reply','mcp__cockpit__fetch_history'],
  permissionMode: 'default', canUseTool,
  persistSession: true, resume: <session_id>,
  systemPrompt: { preset:'claude_code', append: INSTRUCTIONS },
}})`;

export const ENVELOPE_6 = `<channel source="cockpit" chat_id="1" message_id="7" delivery="to" sender="김피엘" author_type="user" room_name="prodev-수율개선">
[김피엘] @TO(prodev-수율개선-bot) 안녕하세요
→ delivery="to"로 받은 메시지에는 반드시 reply 도구로 답변하세요.
</channel>`;

export const HISTORY_7 = `{ "cursor": 11,
  "messages": [
    { "id": 10, "author": "김과제", "body": "어제 라인 3 자료입니다",
      "attachments": [ { "filename": "yield.csv", "path": "/Users/pl/cockpit-data/uploads/9b1e7c3d-yield.csv" } ] },
    { "id": 11, "author": "김피엘", "body": "B 로트가 낮네요" }
  ] }`;

export const ENVELOPE_7 = `<channel source="cockpit" chat_id="1" message_id="12" delivery="to" sender="김피엘" author_type="user" room_name="prodev-수율개선">
[김피엘] @TO(prodev-수율개선-bot) 위 파일 봐 주세요
→ delivery="to"로 받은 메시지에는 반드시 reply 도구로 답변하세요.
</channel>`;

export const ENVELOPE_8 = `<channel source="cockpit" chat_id="1" message_id="12" delivery="to" sender="김과제" author_type="user" room_name="prodev-수율개선">
[김과제] @TO(prodev-수율개선-bot) 어제 라인 3 자료입니다
(첨부 파일 경로: /Users/pl/cockpit-data/uploads/9b1e7c3d-yield.csv)
→ delivery="to"로 받은 메시지에는 반드시 reply 도구로 답변하세요.
</channel>`;

export const ENVELOPE_8C = `<channel source="cockpit" chat_id="1" message_id="14" delivery="to" sender="김과제" author_type="user" room_name="prodev-수율개선">
[김과제] @TO(prodev-수율개선-bot) 확정
→ delivery="to"로 받은 메시지에는 반드시 reply 도구로 답변하세요.
</channel>`;

export const BOT_8A = `이렇게 읽었습니다 — 40행 · 열 5 (lot · line · yield_pct · date · note)
물음 셋: ① yield_pct 단위가 % 인가요 ② date 는 측정일인가요 ③ 전수인가요
E-0001 로 만들겠습니다. 맞으면 '확정'이라고 답해 주세요.`;

export const CHECK_8 = `확정 글 #14 — chat.db 에서 읽는다
① author_type = 'user'  ✓
② 같은 과제의 방 (prodev-수율개선)  ✓
③ 본문이 확정 어휘로 시작 ("확정")  ✓
④ 직전 봇 글에 같은 카드 번호 (E-0001)  ✓`;

export const TICKS_9 = [
  "켜질 때  SessionStart  matcher: startup|resume|clear|compact  → session-start.js",
  "글이 오면  CLAUDE.md → prodev-orchestrator 분기표 → 스킬 하나",
  "긴 일이면  Agent → data-reader  model: opus",
  "답하기 직전  PreToolUse  matcher: mcp__cockpit__reply  → pre-reply.js",
  "문맥이 차면  PreCompact  timeout: 180  → pre-compact.js",
  "훅이 돌 때마다  서버가 hook 사건 한 줄",
];

export const BRANCH_9 = [
  "따라잡기 → fetch_history",
  '"앞으로" → 굳는 길',
  "첨부 + 시키는 말 → report · paper · patent",
  "실험 자료 첨부 → intake",
  "시키는 말 → patent · paper · report",
  "바깥을 알아봐 → research (먼저 find)",
  "분석 → analysis",
  "물음 → find",
];

/** 서랍 세 열 (열마다 다섯) */
export const SKILLS_9 = [
  ["analysis", "brief", "charter", "close", "find"],
  ["intake", "journal", "paper", "patent", "prodev-orchestrator"],
  ["report", "research", "retro", "review", "schedule"],
];

export const CHECKS_9 = [
  "1 chat_id 없음",
  "2 분량 — 900자 · 10줄",
  "3 [카드] 확정 다섯 조건",
  "4 [발송] 결재 = charter 의 PL",
  "5 index.json 의 errors > 0",
];

export const LAYERS_10 = [
  "① index.json 의 title · aliases · tags",
  "② cards/*.md 본문",
  "③ wiki/*.md",
  "④ charter.md 절 · schedule.md 표 행",
  "⑤ inbox/*/files.md",
  "⑥ chat.js search (대화)",
];

export const FINDLOG_10 =
  "2026-09-15T09:12:00.000Z    2    카드 본문    1    cards/E-0001.md    B 로트 수율";

export const HANDOFF_11 = `# 인수인계서 (압축 직전 2026-09-15 09:40)
## 하던 일
## 방과 마지막 message_id
## 사람이 기다리는 것
## 미해결 질문
## 다음 한 걸음
## 열어 둔 파일`;

export const SECTIONS_11 = [
  "1 ## 인수인계서 (handoff-compact.md)",
  "2 ## 헌장 (charter.md)",
  "3 ## 일정 (schedule.md)",
  "4 ## threads/<실>.md (열린 실마다 하나)",
  "5 ## 어제 일지 (journal/2026-09-14.md)",
  "6 ## 색인 머리 (index.md)",
  "7 ## 마지막 일지",
  "8 ## 이 과제의 규칙 (house.md)",
];

export const WAKE_11 =
  "[깨어남: compact] 나는 prodev-수율개선-bot다. 앞 문맥과 요약은 캐시다 — 아래 파일이 진실이다.";

export const TERM_12 = [
  "^C",
  "끄는 중 — 세션 상태는 그대로 두고 다음 기동에 resume 한다",
  "node bin/cockpit.js serve --config cockpit.json",
  "cockpit 듣는 중 http://127.0.0.1:3000",
  "resume 수율개선 → idle",
];

export const ENVELOPE_12 = `<channel source="cockpit" chat_id="1" message_id="16" delivery="to" sender="김과제" author_type="user" room_name="prodev-수율개선">
[김과제] @TO(prodev-수율개선-bot) 라인 4 자료도 있어요
→ delivery="to"로 받은 메시지에는 반드시 reply 도구로 답변하세요.
</channel>

<channel source="cockpit" chat_id="1" message_id="17" delivery="to" sender="김과제" author_type="user" room_name="prodev-수율개선">
[김과제] @TO(prodev-수율개선-bot) 내일 회의 전에 봐 주세요
→ delivery="to"로 받은 메시지에는 반드시 reply 도구로 답변하세요.
</channel>`;

export const RETRO_13 = `굳힐 후보 1
(a) 원본 경로 — journal/2026-09-12.md · journal/2026-09-14.md  ## 되풀이된 말
(b) 바꿀 문장 — "숫자에는 출처 카드 번호를 단다"  → house.md ### 문체와 어휘
(c) 까닭 — 같은 지적이 두 일지에 있다 (#415 · #459). 아직 아무 데도 안 굳었다`;

export const SEVEN_A = [
  "① CLAUDE.md  (전 봇 공통 지침)",
  "② .claude/skills/<이름>/SKILL.md  (스킬 추가)",
  "③ .claude/agents/<이름>.md  (도우미 추가)",
  "④ common/hooks/*.js  (훅)",
  "scripts/**",
];

export const SEVEN_BOT = ["⑤ .claude/settings.local.json  (allow · deny)"];

export const SEVEN_PROJECT = ["⑥ house.md", "⑦ templates/"];
