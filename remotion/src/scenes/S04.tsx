// 03 장면 4 — 켜기, `query()` 한 번 (28초 · 절대 1560~2399)
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { ChatPane } from "../lib/ChatPane";
import { CodeBlock } from "../lib/CodeBlock";
import { FileCard } from "../lib/FileCard";
import { FolderTree } from "../lib/FolderTree";
import { Label } from "../lib/Label";
import { Mover } from "../lib/Mover";
import { PillarStatus } from "../lib/Pillar";
import { Spotlight } from "../lib/Spotlight";
import { STAGE } from "../lib/stage";
import { Stage } from "../lib/StageView";
import { OPTIONS } from "../lib/text";
import { THEME, withAlpha } from "../lib/theme";

export const DURATION = 840;
export const STILLS = [0, 300, 760];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const POST = {
  from: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_TOP_Y },
  to: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_TOP_Y },
};
const SSE = {
  from: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_SSE_Y },
  to: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_SSE_Y },
};
const INIT_Y = 250; // 03 S04 비트 600~660 (init 화살표 줄)

// 옵션 상자 (CodeBlock 왼쪽 위 좌표). 높이는 CodeBlock 의 머리줄 · 줄 높이에서 셈한다
// 03 S04 비트 140~420 (03 은 x 600 · width 760. allowedTools 줄이 잘려 가운데 980 을 두고 폭 840 으로)
const OPT = { x: 560, y: 130, width: 840, fontSize: 19 };
const OPT_HEAD = 2 + 44 + 12; // 03 S04 비트 250~420 (테두리 + 제목 띠 + 위 여백)
const OPT_LINE_H = OPT.fontSize * 1.6;
const OPT_LINES = OPTIONS.split("\n").length;
const OPT_BOX = { x: OPT.x, y: OPT.y, width: OPT.width, height: OPT_HEAD + OPT_LINES * OPT_LINE_H + 14, corner: true };
const optLineY = (n: number) => OPT.y + OPT_HEAD + (n - 0.5) * OPT_LINE_H;
const NOTE_X = OPT.x + OPT.width + 12; // 03 S04 비트 250~420 (03 은 1400. 넓힌 상자 오른변 + 12, 왼쪽 정렬)

const cliStatus = (f: number): PillarStatus => (f >= 660 ? "idle" : f >= 520 ? "starting" : "off");
const panelState = (f: number) => (f >= 700 ? "대기" : f >= 560 ? "켜는 중" : "꺼짐");
const highlight = (f: number) =>
  f >= 385 && f < 420 ? [7] : f >= 340 ? (f < 385 ? [8] : []) : f >= 295 ? [3] : f >= 250 ? [2] : [];

const optionsBox = (startFrame: number, highlightLines: number[]) => (
  <CodeBlock
    x={0}
    y={0}
    width={OPT.width}
    title="src/session/options.js · buildQueryOptions"
    code={OPTIONS}
    startFrame={startFrame}
    framesPerLine={10}
    fontSize={OPT.fontSize}
    showLineNumbers={false}
    highlightLines={highlightLines}
  />
);

export const S04: React.FC = () => {
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
              chip={{ name: "prodev-수율개선-bot", online: frame >= 700, from: -8 }}
              messages={[]}
              input={{}}
              panel={{ stateText: panelState(frame), buttons: [frame >= 700 ? "끄기" : "켜기"], pressAt: 20 }}
            />
          ),
        }}
        server={{ status: "on" }}
        cli={{
          status: cliStatus(frame),
          subtitle: frame >= 520 ? "cwd bots/prodev-수율개선-bot" : "(봇 · 꺼짐)",
        }}
        botsBox={{}}
        botFolder={{}}
        rootCards
        chatDb={{
          rows: [{ text: "rooms" }, { text: "messages" }, { text: "message_targets" }, { text: "bots" }],
          chips: [
            { row: "messages", text: "#1", from: -8 },
            { row: "bots", text: "prodev-수율개선-bot", from: -8 },
            { row: "rooms", text: "prodev-수율개선", from: -8 },
          ],
        }}
        cockpitDb={{
          rows: [{ text: "bot_inbox (편지함)" }, { text: "agent_sessions", highlightFrom: 125, highlightUntil: 170 }],
          chips: [
            { row: "agent_sessions", text: "stopped", from: -8, until: 660 },
            { row: "agent_sessions", text: "idle", from: 660 },
          ],
        }}
        anchor={interpolate(frame, [720, 839], [0, 0.35], clamp)}
      >
        {/* 장면 3 끝에서 이어지는 바닥: 과제 폴더 줄 넷 · 봇 폴더의 설정 두 장 */}
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
        <FileCard
          x={STAGE.BOT_FOLDER.x}
          y={820} // 03 S03 비트 300~380 (장면 3 끝 자리)
          name=".claude/settings.json"
          tone="file"
          width={240}
          height={26}
          fontSize={14}
        />
        <FileCard
          x={STAGE.BOT_FOLDER.x}
          y={852} // 03 S03 비트 300~380 (장면 3 끝 자리)
          name=".claude/settings.local.json"
          tone="file"
          width={240}
          height={26}
          fontSize={14}
        />

        <Arrow
          from={POST.from}
          to={POST.to}
          label="POST /api/projects/수율개선/session/start"
          labelSize={15}
          color={THEME.colors.human}
          startFrame={40}
          durationInFrames={40}
        />
        <Label
          x={STAGE.SERVER.x}
          y={200} // 03 S04 비트 80~140
          text="manager.start"
          size={18}
          from={80}
        />
        <Arrow
          from={{ x: STAGE.SERVER.x, y: STAGE.SERVER_LABEL_Y }}
          to={{ x: STAGE.COCKPIT_DB.x, y: STAGE.COCKPIT_DB.y - STAGE.COCKPIT_DB.height / 2 - 2 }}
          route="orthogonal"
          bend="vh"
          dashed
          label="bot_dir · session_id"
          labelSize={14}
          color={THEME.colors.server}
          startFrame={95}
          durationInFrames={30}
        />

        {/* 조명은 상자 밑에 깐다 — 상자와 옆 이름표는 덮이지 않는다 */}
        <Spotlight rects={[OPT_BOX]} opacity={0.55} from={140} until={420} />

        {frame < 420 ? (
          <div style={{ position: "absolute", left: OPT.x, top: OPT.y }}>{optionsBox(140, highlight(frame))}</div>
        ) : null}
        <Label x={NOTE_X} y={optLineY(2)} text="켜지는 폴더" mono={false} size={14} align="left" from={250} until={295} />
        <Label
          x={NOTE_X}
          y={optLineY(3)}
          text="설정을 읽을 자리 스위치"
          mono={false}
          size={14}
          align="left"
          from={295}
          until={340}
        />
        <Label x={NOTE_X} y={optLineY(8)} text="덧붙인 지시문" mono={false} size={14} align="left" from={340} until={385} />

        {/* 상자가 CLI 기둥 왼쪽 변의 문을 지난다 */}
        {/* CLI 속에 닿은 상자는 660~700 에 사라진다 (C4 판정) */}
        {frame < 700 ? (
          <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(frame, [660, 700], [1, 0], clamp) }}>
            <Mover
              from={{ x: OPT.x, y: OPT.y, scale: 1 }}
              to={{ x: STAGE.CLI_INPUT_SLOT.x - 10, y: 180, scale: 0.4, opacity: 0.9 }} // 03 S04 비트 420~520 (y)
              startFrame={420}
              durationInFrames={100}
            >
              {optionsBox(0, [])}
            </Mover>
          </div>
        ) : null}
        <Label
          x={STAGE.CLI.x - STAGE.CLI.width / 2}
          y={STAGE.CLI.y}
          text="sdk-query.js"
          size={15}
          tone="server"
          backgroundColor={withAlpha(THEME.colors.server, 0.2)}
          vertical
          from={440}
          glowFrom={470}
          glowUntil={520}
        />
        <Label
          x={STAGE.CLI_INPUT_SLOT.x - 10}
          y={395} // 03 S04 비트 420~520 (03 은 x 1440 가운데. 세로 문 글자와 겹쳐 1460 왼쪽 정렬)
          text="SDK import 는 이 파일뿐"
          size={13}
          align="left"
          from={470}
          until={560}
        />

        <Arrow
          from={{ x: STAGE.GAP_R.from.x, y: INIT_Y }}
          to={{ x: STAGE.GAP_R.to.x, y: INIT_Y }}
          label="init"
          color={THEME.colors.cli}
          startFrame={600}
          durationInFrames={30}
        />
        <Arrow
          from={SSE.from}
          to={SSE.to}
          dashed
          label="SSE session_state idle"
          labelSize={14}
          color={THEME.colors.server}
          startFrame={640}
          durationInFrames={30}
        />
      </Stage>
      <Caption text="서버가 CLI 에 넘기는 것은 query() 옵션 하나뿐이다." from={150} durationInFrames={280} />
      <Caption text="어느 폴더에서, 어느 설정만 읽고, 앞 대화에 이어서 켜라." from={460} durationInFrames={340} />
    </AbsoluteFill>
  );
};
