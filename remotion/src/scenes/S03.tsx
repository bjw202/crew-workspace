// 03 장면 3 — `+` 하나가 폴더 둘을 만든다 (22초 · 절대 900~1559)
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { eased, lerpCamera } from "../lib/anim";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { ChatPane } from "../lib/ChatPane";
import { FileCard } from "../lib/FileCard";
import { FolderTree } from "../lib/FolderTree";
import { Label } from "../lib/Label";
import { Mover } from "../lib/Mover";
import { STAGE } from "../lib/stage";
import { Stage } from "../lib/StageView";
import { THEME, withAlpha } from "../lib/theme";

export const DURATION = 660;
export const STILLS = [0, 360, 600];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const POST = {
  from: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_TOP_Y },
  to: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_TOP_Y },
};
const SSE = {
  from: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_SSE_Y },
  to: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_SSE_Y },
};
const SERVER_BOTTOM = STAGE.SERVER.y + STAGE.SERVER.height / 2;
const SETUP_AT = { x: STAGE.PRODEV.x, y: 650 }; // 03 S03 비트 180~240 (setup 칩이 내려앉는 자리, 04 6.5: 690 → 650)

export const S03: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = lerpCamera(STAGE.CAMERAS.SERVER, STAGE.CAMERAS.OVERVIEW, eased(frame, 0, 40));

  return (
    <AbsoluteFill>
      <Stage
        camera={camera}
        browser={{
          status: "on",
          children: (
            <ChatPane
              box={STAGE.BROWSER}
              viewer="김피엘"
              sidebar={{ rooms: [{ name: "# prodev-수율개선", from: 520 }], plusPressAt: 20 }}
              dialog={{ label: "새 방(과제) 이름", text: "수율개선", from: 30, typeUntil: 70, until: 100 }}
              chip={{ name: "prodev-수율개선-bot", online: false, from: 540 }}
              messages={[]}
              input={{}}
            />
          ),
        }}
        server={{ status: "on" }}
        cli={{ status: "off", subtitle: "(봇 · 꺼짐)" }}
        prodev={{ dim: interpolate(frame, [300, 330], [0.35, 1], clamp) }}
        project={{ dim: interpolate(frame, [240, 270], [0.35, 1], clamp) }}
        botsBox={{ enterFrame: 300 }}
        botFolder={{ enterFrame: 310 }}
        chatDb={{
          rows: [{ text: "rooms" }, { text: "messages" }, { text: "message_targets" }, { text: "bots", from: 420 }],
          chips: [
            { row: "messages", text: "#1", from: -8 }, // 장면 2 끝의 칩이 이어진다 (frame 0 에 이미 보이게)
            { row: "bots", text: "prodev-수율개선-bot", from: 430 },
            { row: "rooms", text: "prodev-수율개선", from: 445 },
          ],
        }}
        cockpitDb={{
          rows: [{ text: "bot_inbox (편지함)" }, { text: "agent_sessions" }],
          chips: [{ row: "agent_sessions", text: "stopped", from: 460 }],
        }}
      >
        <Arrow
          from={POST.from}
          to={POST.to}
          label="POST /api/rooms"
          color={THEME.colors.human}
          startFrame={90}
          durationInFrames={40}
        />
        <Label x={STAGE.SERVER.x} y={STAGE.SERVER_LABEL_Y} text="createRoom · 이름 검사" size={18} from={130} until={420} />

        {/* setup 칩: 서버 아래에서 바닥으로 내려가고 410~440 에 사라진다 */}
        {frame < 440 ? (
          <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(frame, [410, 440], [1, 0], clamp) }}>
            <Mover
              from={{ x: STAGE.SERVER.x, y: SERVER_BOTTOM, scale: 0.6, opacity: 0 }}
              to={{ x: SETUP_AT.x, y: SETUP_AT.y, scale: 1, opacity: 1 }}
              startFrame={180}
              durationInFrames={60}
            >
              <Label
                x={0}
                y={0}
                text="node scripts/setup.js --project 수율개선 --cockpit cockpit.json"
                size={16}
                backgroundColor={withAlpha(THEME.colors.server, 0.2)}
              />
            </Mover>
          </div>
        ) : null}
        <Label
          x={STAGE.SERVER.x}
          y={612} // 03 S03 비트 180~240 (04 6.5: 640 → 612)
          text="① 먼저"
          mono={false}
          size={16}
          tone="server"
          from={190}
          until={420}
        />

        {/* 뿌리 카드 넷: prodev 상자가 밝아질 때(300~330) 함께 나타난다 (C5 판정) */}
        <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(frame, [300, 330], [0, 1], clamp) }}>
          <FileCard {...STAGE.ROOT_CLAUDE} name="CLAUDE.md" tone="file" />
          <FileCard {...STAGE.ROOT_SKILLS} name=".claude/skills (15)" tone="file" />
          <FileCard {...STAGE.ROOT_AGENTS} name=".claude/agents (6)" tone="file" />
          <FileCard {...STAGE.ROOT_HOOKS} name="common/hooks (3)" tone="file" />
        </div>

        <FolderTree
          x={STAGE.PROJECT_TREE.x}
          y={STAGE.PROJECT_TREE.y}
          width={STAGE.PROJECT_TREE.width}
          fontSize={15}
          lines={[
            { text: "cards/ · wiki/ · inbox/ · journal/ · threads/ · research/", from: 260 },
            { text: "patent/ · paper/ · report/ · tmp/ · analysis/ · templates/", from: 280 },
            { text: "house.md  (골격 · 상한 50줄)", from: 305 },
            { text: ".git  (git init)", from: 325 },
          ]}
        />

        {/* 설정 두 장이 setup 칩에서 봇 폴더로 떨어진다 */}
        <Mover
          from={SETUP_AT}
          to={{ x: STAGE.BOT_FOLDER.x, y: 820 }} // 03 S03 비트 300~380
          startFrame={330}
          durationInFrames={30}
          easing={Easing.in(Easing.quad)}
        >
          <FileCard x={0} y={0} name=".claude/settings.json" tone="file" width={240} height={26} fontSize={14} />
        </Mover>
        <Mover
          from={SETUP_AT}
          to={{ x: STAGE.BOT_FOLDER.x, y: 852 }} // 03 S03 비트 300~380
          startFrame={350}
          durationInFrames={30}
          easing={Easing.in(Easing.quad)}
        >
          <FileCard x={0} y={0} name=".claude/settings.local.json" tone="file" width={240} height={26} fontSize={14} />
        </Mover>

        <Label
          x={STAGE.PRODEV.x}
          y={725} // 03 S03 비트 390~420
          text="exit 0"
          size={18}
          tone="cli"
          from={390}
          until={440}
        />
        <Label
          x={STAGE.SERVER.x}
          y={440} // 03 S03 비트 420~470
          text="② setup 이 성공하면"
          mono={false}
          size={16}
          tone="server"
          from={420}
          until={520}
        />
        <Arrow
          from={SSE.from}
          to={SSE.to}
          dashed
          label="SSE room_created"
          color={THEME.colors.server}
          startFrame={480}
          durationInFrames={40}
        />
      </Stage>
      <Caption text="방 하나 = 과제 하나 = 봇 하나." from={40} durationInFrames={260} />
      <Caption
        text="setup.js 가 먼저 성공해야 DB 에 방이 생기고, 그래도 봇은 아직 꺼져 있다."
        from={420}
        durationInFrames={220}
      />
    </AbsoluteFill>
  );
};
