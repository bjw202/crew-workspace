// 03 장면 6 — 글 한 번 왕복 (32초 · 절대 3060~4019)
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { ChatInput, ChatPane } from "../lib/ChatPane";
import { Envelope } from "../lib/Envelope";
import { FileCard } from "../lib/FileCard";
import { FolderTree } from "../lib/FolderTree";
import { Label } from "../lib/Label";
import { Mover } from "../lib/Mover";
import { PillarStatus } from "../lib/Pillar";
import { Spotlight } from "../lib/Spotlight";
import { STAGE } from "../lib/stage";
import { Stage } from "../lib/StageView";
import { ENVELOPE_6 } from "../lib/text";
import { THEME } from "../lib/theme";

export const DURATION = 960;
export const STILLS = [0, 400, 720];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const POST = {
  from: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_TOP_Y },
  to: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_TOP_Y },
};
const SSE = {
  from: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_SSE_Y },
  to: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_SSE_Y },
};
const REPLY = {
  from: { x: STAGE.GAP_R.from.x, y: STAGE.ARROW_MID_Y },
  to: { x: STAGE.MCP_ARROW_TIP_X, y: STAGE.ARROW_MID_Y },
};
const CARD_FROM = { x: STAGE.BROWSER.x, y: 495, scale: 0.8 }; // 03 S06 비트 120~160 (작성기 자리)
const CARD_TO = { x: STAGE.SERVER.x, y: STAGE.SERVER_LABEL_Y, scale: 0.8 };
const INPUT_PUSH_Y = 170; // 03 S06 비트 500~560
const NO_INBOX_Y = 600; // 03 S06 비트 780~959

const FIRST = "@TO(prodev-수율개선-bot) 안녕하세요";
const SECOND = "B 로트가 낮네요";
const HINT = "봇에게 가지 않습니다 — 부르려면 @";

const firstInput: ChatInput = {
  typeFrom: 10,
  text: "@",
  autocomplete: { items: ["TO prodev-수율개선-bot"], from: 20, until: 60, pickAt: 60 },
  afterPick: "@TO(prodev-수율개선-bot) ",
  typeMoreFrom: 80,
  typeMoreUntil: 110,
  textFinal: FIRST,
  sendAt: 120,
};
const secondInput: ChatInput = { typeFrom: 790, typeUntil: 830, textFinal: SECOND, sendAt: 840, placeholder: HINT };

const cliStatus = (f: number): PillarStatus => (f >= 560 && f < 740 ? "working" : "idle");

const cardMover = (startFrame: number, body: string) => (
  <Mover from={CARD_FROM} to={CARD_TO} startFrame={startFrame} durationInFrames={40} holdAfter={false}>
    <FileCard x={0} y={0} name={body} tone="human" width={300} height={28} fontSize={13} />
  </Mover>
);

const envelope = (startFrame: number) => (
  <Envelope
    x={0}
    y={0}
    width={STAGE.ENVELOPE_BIG.width}
    fontSize={THEME.sizes.envelope}
    text={ENVELOPE_6}
    startFrame={startFrame}
    framesPerLine={25}
    title="wrapChannel — src/envelope/wrap.js:62-68"
  />
);

export const S06: React.FC = () => {
  const frame = useCurrentFrame();

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
                { author: "김피엘", body: FIRST, kind: "user", from: 250 },
                {
                  author: "prodev-수율개선-bot",
                  badge: "BOT",
                  body: "이어서 합니다 — prodev-수율개선 방입니다. 붙들고 있는 실은 없습니다.",
                  kind: "bot",
                  from: 720,
                },
                { author: "김피엘", body: SECOND, kind: "user", from: 930 },
              ]}
              input={frame < 780 ? firstInput : secondInput}
              panel={{ stateText: cliStatus(frame) === "working" ? "일하는 중" : "대기", buttons: ["끄기"] }}
            />
          ),
        }}
        server={{ status: "on" }}
        cli={{ status: cliStatus(frame), subtitle: "cwd bots/prodev-수율개선-bot" }}
        botsBox={{}}
        botFolder={{}}
        rootCards
        anchor={1}
        chatDb={{
          rows: [{ text: "rooms" }, { text: "messages" }, { text: "message_targets" }, { text: "bots" }],
          chips: [
            { row: "messages", text: "#1", from: -8 },
            { row: "bots", text: "prodev-수율개선-bot", from: -8 },
            { row: "rooms", text: "prodev-수율개선", from: -8 },
            { row: "messages", text: "#7", from: 170 },
            { row: "message_targets", text: "#7 → bot · to", from: 185 },
            { row: "messages", text: "#8 bot", from: 660 },
            { row: "messages", text: "#9", from: 890 },
          ],
        }}
        cockpitDb={{
          rows: [{ text: "bot_inbox (편지함)" }, { text: "agent_sessions" }],
          chips: [
            { row: "bot_inbox", text: "enqueue #7", from: 200, until: 540 },
            { row: "bot_inbox", text: "#7 delivered", from: 540 },
            { row: "agent_sessions", text: "idle", from: -8 },
          ],
        }}
      >
        {/* 장면 5 끝에서 이어지는 바닥 · CLI 속 */}
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
          ]}
        />

        {/* 봉투 붙은 글: 작성기 → 서버 */}
        {frame < 840 ? (
          <Arrow
            from={POST.from}
            to={POST.to}
            label="POST /api/rooms/:id/messages"
            labelSize={15}
            color={THEME.colors.human}
            startFrame={120}
            durationInFrames={40}
          />
        ) : null}
        {cardMover(120, FIRST)}
        {frame < 680 ? (
          <Arrow
            from={SSE.from}
            to={SSE.to}
            dashed
            label="SSE message"
            color={THEME.colors.server}
            startFrame={220}
            durationInFrames={30}
          />
        ) : null}

        <Label x={STAGE.SERVER.x} y={STAGE.SERVER_KICK_Y[0]} text="#kick" size={16} from={260} until={520} />
        <Label x={STAGE.SERVER.x} y={STAGE.SERVER_KICK_Y[1]} text="pendingInbox" size={16} from={280} until={520} />
        <Label x={STAGE.SERVER.x} y={STAGE.SERVER_KICK_Y[2]} text="wrapChannel" size={16} from={300} until={520} />

        {/* reply: CLI → 서버 안 MCP 상자 */}
        <Label
          x={STAGE.MCP_BOX.x}
          y={STAGE.MCP_BOX.y}
          text="MCP 도구 cockpit · src/mcp/tools.js"
          tone="server"
          size={16}
          glowFrom={620}
        />
        <Arrow
          from={REPLY.from}
          to={REPLY.to}
          label="mcp__cockpit__reply"
          labelSize={15}
          color={THEME.colors.cli}
          startFrame={580}
          durationInFrames={40}
        />
        <Label
          x={STAGE.SERVER.x}
          y={STAGE.SERVER_LABEL2_Y}
          text="insertBotMessage"
          size={16}
          from={640}
          until={720}
        />
        <Label x={STAGE.SERVER.x} y={STAGE.SERVER_LABEL_Y} text="onBotMessage" from={670} />
        {frame < 900 ? (
          <Arrow
            from={SSE.from}
            to={SSE.to}
            dashed
            label="SSE message"
            color={THEME.colors.server}
            startFrame={680}
            durationInFrames={30}
          />
        ) : null}

        {/* 봉투 없는 글: chat.db 까지만 */}
        <Arrow
          from={POST.from}
          to={POST.to}
          label="POST /api/rooms/:id/messages"
          labelSize={15}
          color={THEME.colors.human}
          startFrame={840}
          durationInFrames={30}
          progress={frame < 840 ? 0 : undefined}
        />
        {cardMover(840, SECOND)}
        <Arrow
          from={SSE.from}
          to={SSE.to}
          dashed
          label="SSE message"
          color={THEME.colors.server}
          startFrame={900}
          durationInFrames={30}
          progress={frame < 900 ? 0 : undefined}
        />
        <Label
          x={STAGE.COCKPIT_DB.x}
          y={NO_INBOX_Y}
          text="편지함 bot_inbox 줄 없음"
          size={15}
          from={900}
          until={959}
        />

        {/* 겉봉투: 전체 조명 아래에서 가운데 크게 → CLI 입력 흐름으로 */}
        <Spotlight rects={[]} opacity={0.7} from={320} until={500} />
        {frame < 500 ? (
          <div style={{ position: "absolute", left: STAGE.ENVELOPE_BIG.x, top: STAGE.ENVELOPE_BIG.y }}>
            {envelope(320)}
          </div>
        ) : null}
        {frame < 640 ? (
          <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(frame, [600, 640], [1, 0], clamp) }}>
            <Mover
              from={{ x: STAGE.ENVELOPE_BIG.x, y: STAGE.ENVELOPE_BIG.y, scale: 1 }}
              to={{ x: STAGE.CLI_INPUT_SLOT.x, y: STAGE.CLI_INPUT_SLOT.y, scale: 0.3, opacity: 0.85 }}
              startFrame={500}
              durationInFrames={50}
            >
              {envelope(0)}
            </Mover>
          </div>
        ) : null}
        <Label x={STAGE.CLI.x} y={INPUT_PUSH_Y} text="input.push" size={15} tone="cli" from={520} until={600} />
      </Stage>
      <Caption text="봉투가 붙은 글만 겉봉투에 싸여 봇에게 간다." from={130} durationInFrames={350} />
      <Caption text="봇이 방에 말하는 길은 reply 하나뿐이다." from={560} durationInFrames={220} />
    </AbsoluteFill>
  );
};
