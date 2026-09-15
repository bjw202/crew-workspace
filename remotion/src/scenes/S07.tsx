// 03 장면 7 — 따라잡기와 승인 카드 (20초 · 절대 4020~4619)
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { ChatPane } from "../lib/ChatPane";
import { CodeBlock } from "../lib/CodeBlock";
import { Envelope } from "../lib/Envelope";
import { FolderTree } from "../lib/FolderTree";
import { Label } from "../lib/Label";
import { Mover } from "../lib/Mover";
import { PillarStatus } from "../lib/Pillar";
import { Spotlight } from "../lib/Spotlight";
import { STAGE } from "../lib/stage";
import { Stage } from "../lib/StageView";
import { ENVELOPE_7, HISTORY_7 } from "../lib/text";
import { THEME } from "../lib/theme";

export const DURATION = 600;
export const STILLS = [0, 260, 500];

const POST = {
  from: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_TOP_Y },
  to: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_TOP_Y },
};
const SSE = {
  from: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_SSE_Y },
  to: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_SSE_Y },
};
const MCP = {
  from: { x: STAGE.GAP_R.from.x, y: STAGE.ARROW_MID_Y },
  to: { x: STAGE.MCP_ARROW_TIP_X, y: STAGE.ARROW_MID_Y },
};
const TOOL = {
  cli: { x: STAGE.GAP_R.from.x, y: STAGE.ARROW_TOOL_Y },
  server: { x: STAGE.GAP_R.to.x, y: STAGE.ARROW_TOOL_Y },
};
const READ_FROM = { x: STAGE.MCP_BOX.x - 60, y: STAGE.MCP_BOX.y + STAGE.MCP_BOX.height / 2 }; // 03 S07 비트 150~210
const READ_TO = { x: STAGE.CHAT_DB.x, y: STAGE.CHAT_DB.y - STAGE.CHAT_DB.height / 2 - 2 };
const ENV_FROM_Y = 400; // 03 S07 비트 90~150 (서버 속 봉투 칩 출발)

// 결과 상자: 03 은 x 560 · width 800. attachments 줄(약 116자)이 잘려 가운데 960 을 두고 폭 1160 으로
const HIST = { x: STAGE.SERVER.x - 580, y: 120, width: 1160, fontSize: 16 }; // 03 S07 비트 210~330
const HIST_HEIGHT = 2 + 41 + 12 + HISTORY_7.split("\n").length * HIST.fontSize * 1.6 + 14; // 03 S07 비트 210~330 (머리 띠 · 여백)
const RESULT_TO_Y = 220; // 03 S07 비트 210~330

const CARD_Y = 525; // 03 S07 비트 470~540 (조종석 판 자리)
const TIMER_Y = 652; // 03 S07 비트 470~540 (03 은 640. 승인 카드 아래 변(약 632)과 겹쳐 내림)

const THIRD = "@TO(prodev-수율개선-bot) 위 파일 봐 주세요";

const cliStatus = (f: number): PillarStatus =>
  f >= 590 ? "working" : f >= 430 ? "waiting" : f >= 150 ? "working" : "idle";
// cockpit/web/cockpit.js:11 의 이름 (C6 판정 ③)
const PANEL_WORDS: Record<string, string> = { working: "일하는 중", waiting: "승인 대기", idle: "대기" };

const historyBox = (startFrame: number) => (
  <CodeBlock
    x={0}
    y={0}
    width={HIST.width}
    code={HISTORY_7}
    fontSize={HIST.fontSize}
    showLineNumbers={false}
    startFrame={startFrame}
    framesPerLine={6}
    highlightLines={[4]}
    title="fetch_history 결과 — src/mcp/tools.js:122-138"
  />
);

export const S07: React.FC = () => {
  const frame = useCurrentFrame();
  const status = cliStatus(frame);

  return (
    <AbsoluteFill>
      <Stage
        browser={{
          status: "on",
          children: (
            <ChatPane
              box={STAGE.BROWSER}
              viewer="김피엘"
              sidebar={{ rooms: [{ name: "# prodev-수율개선", from: -8 }] }}
              chip={{ name: "prodev-수율개선-bot", online: true, from: -8 }}
              messages={[
                { author: "김과제", attach: "yield.csv", body: "어제 라인 3 자료입니다", kind: "user", from: -8 },
                { author: "김피엘", body: "B 로트가 낮네요", kind: "user", from: -8 },
                { author: "김피엘", body: THIRD, kind: "user", from: 140 },
                {
                  author: "prodev-수율개선-bot",
                  badge: "BOT",
                  body: "이렇게 이해했습니다 — 글 2개 · yield.csv",
                  kind: "bot",
                  from: 380,
                },
                { kind: "system", body: "🔒 Bash 요청 · curl --version", from: 450 },
                { kind: "system", body: "✅ 김피엘 허용 · Bash", from: 585 },
              ]}
              input={{ typeFrom: 30, typeUntil: 80, textFinal: THIRD, sendAt: 90 }}
              panel={{ stateText: PANEL_WORDS[status], buttons: ["끄기"] }}
              card={{
                x: STAGE.BROWSER.x - STAGE.BROWSER.width / 2 + 10,
                y: CARD_Y,
                width: STAGE.BROWSER.width - 20,
                request: { project: "수율개선", tool: "Bash", heading: "Bash", input: '{"command":"curl --version"}' },
                buttons: ["허용", "이번 세션 허용", "거부"],
                enterFrame: 470,
                pressAt: 530,
                pressed: "허용",
                leaveFrame: 585,
              }}
            />
          ),
        }}
        server={{ status: "on" }}
        cli={{ status, subtitle: "cwd bots/prodev-수율개선-bot" }}
        botsBox={{}}
        botFolder={{}}
        rootCards
        anchor={1}
        chatDb={{
          rows: [{ text: "rooms" }, { text: "messages" }, { text: "message_targets" }, { text: "bots" }],
          chips: [
            { row: "bots", text: "prodev-수율개선-bot", from: -8 },
            { row: "rooms", text: "prodev-수율개선", from: -8 },
            { row: "messages", text: "#10 📎", from: -8 },
            { row: "messages", text: "#11", from: -8 },
            { row: "messages", text: "#12", from: 115 },
            { row: "message_targets", text: "#12 → bot", from: 120 },
            { row: "messages", text: "#13 bot", from: 360 },
          ],
        }}
        cockpitDb={{
          rows: [
            { text: "bot_inbox (편지함)" },
            { text: "agent_sessions" },
            { text: "permission_requests", from: 435 },
          ],
          chips: [
            { row: "agent_sessions", text: "idle", from: -8 },
            { row: "bot_inbox", text: "enqueue #12", from: 125, until: 150 },
            { row: "bot_inbox", text: "#12 delivered", from: 150 }, // C7 판정 (c): 봉투가 CLI 에 닿을 때
            { row: "permission_requests", text: "Bash", from: 440, until: 585 },
            { row: "permission_requests", text: "Bash · allow", from: 585 },
          ],
        }}
      >
        {/* 장면 6 끝에서 이어지는 바닥 · CLI 속 */}
        <FolderTree
          x={STAGE.PROJECT_TREE.x}
          y={STAGE.PROJECT_TREE.y}
          width={STAGE.PROJECT_TREE.width}
          fontSize={15}
          lines={[
            { text: "cards/ · wiki/ · inbox/ · journal/ · threads/ · research/" },
            { text: "patent/ · paper/ · report/ · tmp/ · analysis/ · templates/" },
            { text: "house.md  (골격 · 상한 50줄)" },
            { text: ".git  (git init)" },
          ]}
        />
        <FolderTree
          x={STAGE.BOT_TREE.x}
          y={STAGE.BOT_TREE.y}
          width={STAGE.BOT_TREE.width}
          fontSize={13}
          lines={[{ text: ".claude/" }, { text: "settings.json", depth: 1 }, { text: "settings.local.json", depth: 1 }]}
        />
        {/* Bash(curl --version) 는 03 의 y 400 이 실린 것 줄과 겹쳐 열한째 줄로 잇는다 (시사 1차 ① 로 env 가 한 줄이 되어 한 칸 올라왔다) */}
        <FolderTree
          x={STAGE.CLI_TREE.x}
          y={STAGE.CLI_TREE.y}
          width={STAGE.CLI_TREE.width}
          fontSize={15}
          lines={[
            { text: "settings.json" },
            { text: "hooks: SessionStart ·", depth: 1 },
            { text: "PreCompact · PreToolUse", depth: 2 },
            { text: "env: PRODEV_BOT · PRODEV_PROJECT", depth: 1 },
            { text: "settings.local.json" },
            { text: "allow 22 · deny 10 ·", depth: 1 },
            { text: "additionalDirectories 3", depth: 2 },
            { text: "CLAUDE.md" },
            { text: ".claude/skills (15)" },
            { text: ".claude/agents (도우미 6)" },
            { text: "Bash(curl --version)", from: 390, lit: true, tone: "cli" },
          ]}
        />
        <Label
          x={STAGE.MCP_BOX.x}
          y={STAGE.MCP_BOX.y}
          text="MCP 도구 cockpit · src/mcp/tools.js"
          tone="server"
          size={16}
        />

        {/* 셋째 글: 장면 6 의 길을 압축 */}
        {frame < 540 ? (
          <Arrow
            from={POST.from}
            to={POST.to}
            label="POST /api/rooms/:id/messages"
            labelSize={15}
            color={THEME.colors.human}
            startFrame={90}
            durationInFrames={25}
          />
        ) : null}
        <Mover
          from={{ x: STAGE.SERVER.x, y: ENV_FROM_Y, scale: 0.3 }}
          to={{ x: STAGE.CLI_INPUT_SLOT.x, y: STAGE.CLI_INPUT_SLOT.y, scale: 0.3 }}
          startFrame={125}
          durationInFrames={25}
          holdAfter={false}
        >
          <Envelope x={0} y={0} width={STAGE.ENVELOPE_BIG.width} text={ENVELOPE_7} compact />
        </Mover>

        {/* 따라잡기: fetch_history → chat.db 읽기 → 결과 상자 */}
        {frame < 330 ? (
          <Arrow
            from={MCP.from}
            to={MCP.to}
            label="mcp__cockpit__fetch_history"
            labelSize={14}
            color={THEME.colors.cli}
            startFrame={150}
            durationInFrames={40}
          />
        ) : null}
        <Arrow
          from={READ_FROM}
          to={READ_TO}
          dashed
          label="chat_id=1 · since_id"
          labelSize={13}
          color={THEME.colors.server}
          startFrame={190}
          durationInFrames={20}
        />
        {frame >= 330 ? (
          <Arrow
            from={MCP.from}
            to={MCP.to}
            label="mcp__cockpit__reply"
            labelSize={15}
            color={THEME.colors.cli}
            startFrame={330}
            durationInFrames={25}
          />
        ) : null}
        {frame < 440 ? (
          <Arrow
            from={SSE.from}
            to={SSE.to}
            dashed
            label="SSE message"
            color={THEME.colors.server}
            startFrame={360}
            durationInFrames={20}
            progress={frame < 360 ? 0 : undefined}
          />
        ) : null}

        {/* 승인: canUseTool → 카드 → allow */}
        {frame < 560 ? (
          <Arrow
            from={TOOL.cli}
            to={TOOL.server}
            label="canUseTool"
            color={THEME.colors.cli}
            startFrame={400}
            durationInFrames={30}
          />
        ) : null}
        {frame >= 440 ? (
          <Arrow
            from={SSE.from}
            to={SSE.to}
            dashed
            label="SSE permission_request"
            labelSize={13}
            color={THEME.colors.server}
            startFrame={440}
            durationInFrames={30}
          />
        ) : null}
        <Label x={STAGE.BROWSER.x} y={TIMER_Y} text="⏳ 10분" size={16} from={480} until={540} />
        {frame >= 540 ? (
          <Arrow
            from={POST.from}
            to={POST.to}
            label="POST /api/permissions/:toolUseId"
            labelSize={13}
            color={THEME.colors.human}
            startFrame={540}
            durationInFrames={20}
          />
        ) : null}
        {frame >= 560 ? (
          <Arrow
            from={TOOL.server}
            to={TOOL.cli}
            label="allow"
            color={THEME.colors.server}
            startFrame={560}
            durationInFrames={25}
          />
        ) : null}

        {/* 결과 상자는 조명 위에 */}
        <Spotlight
          rects={[{ x: HIST.x, y: HIST.y, width: HIST.width, height: HIST_HEIGHT, corner: true }]}
          opacity={0.5}
          from={210}
          until={300}
        />
        {frame < 300 ? (
          <div style={{ position: "absolute", left: HIST.x, top: HIST.y }}>{historyBox(210)}</div>
        ) : null}
        <Mover
          from={{ x: HIST.x, y: HIST.y, scale: 1 }}
          to={{ x: STAGE.CLI_INPUT_SLOT.x, y: RESULT_TO_Y, scale: 0.25 }}
          startFrame={300}
          durationInFrames={30}
          holdAfter={false}
        >
          {historyBox(0)}
        </Mover>
      </Stage>
      <Caption
        text="봇은 부른 글의 첨부만 바로 받고 나머지는 fetch_history 로 따라잡는다."
        from={40}
        durationInFrames={260}
      />
      <Caption text="허용 목록 밖 도구는 admin 의 승인 카드를 기다린다." from={400} durationInFrames={190} />
    </AbsoluteFill>
  );
};
