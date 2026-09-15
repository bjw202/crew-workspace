// 03 장면 2 — 서버 안의 두 DB 와 SSE (18초 · 절대 360~899)
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { eased, lerpCamera, loop } from "../lib/anim";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { ChatPane } from "../lib/ChatPane";
import { Label } from "../lib/Label";
import { Spotlight } from "../lib/Spotlight";
import { STAGE } from "../lib/stage";
import { Stage } from "../lib/StageView";
import { THEME } from "../lib/theme";

export const DURATION = 540;
export const STILLS = [0, 320, 520];

const POST = {
  from: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_TOP_Y },
  to: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_TOP_Y },
};
const SSE = {
  from: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_SSE_Y },
  to: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_SSE_Y },
};

const ROLE_Y = STAGE.SERVER.y + STAGE.SERVER.height / 2 + 22; // 사람 시사 1차 ② (기둥 아래변 600 밖, 622)
const DENY_Y = STAGE.FLOOR_Y - 8; // 사람 시사 1차 ② (바닥 선 680 바로 위, 672)

export const S02: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = lerpCamera(STAGE.CAMERAS.OVERVIEW, STAGE.CAMERAS.SERVER, eased(frame, 0, 40));

  return (
    <AbsoluteFill>
      <Stage
        camera={camera}
        browser={{
          status: "on",
          children: <ChatPane box={STAGE.BROWSER} viewer="김피엘" sidebar={{ rooms: [] }} messages={[]} input={{}} />,
        }}
        server={{ status: "on" }}
        cli={{ status: "off", subtitle: "(봇 · 꺼짐)" }}
        prodev={{ dim: 0.35 }}
        project={{ dim: 0.35 }}
        chatDb={{
          enterFrame: 60,
          rows: [
            { text: "rooms", from: 90 },
            { text: "messages", from: 110, highlightFrom: 300, highlightUntil: 340 },
            { text: "message_targets", from: 130 },
          ],
          chips: [{ row: "messages", text: "#1", from: 300 }],
        }}
        cockpitDb={{
          enterFrame: 160,
          rows: [
            { text: "bot_inbox (편지함)", from: 190 },
            { text: "agent_sessions", from: 210 },
          ],
        }}
      >
        <Spotlight rects={[STAGE.SERVER]} opacity={0.45} from={40} />
        <Label
          x={STAGE.MCP_BOX.x}
          y={STAGE.MCP_BOX.y}
          text="MCP 도구 cockpit · src/mcp/tools.js"
          tone="server"
          size={16}
          from={50}
        />
        {/* 원통 역할 이름표 (사람 시사 1차 ②): 원통 아래변 588 + 14 */}
        <Label
          x={STAGE.CHAT_DB.x}
          y={ROLE_Y}
          text={"사람과 봇이 나눈 말\n방 · 글 · 첨부"}
          mono={false}
          size={14}
          tone="server"
          maxWidth={250}
          from={140}
        />
        <Label
          x={STAGE.COCKPIT_DB.x}
          y={ROLE_Y}
          text={"서버의 살림\n계정 · 편지함 · 세션 · 승인"}
          mono={false}
          size={14}
          tone="server"
          maxWidth={250}
          from={220}
        />
        <Label
          x={STAGE.SERVER.x}
          y={DENY_Y}
          text="봇은 chat.db 를 훅으로 읽기만, cockpit.db 는 읽지 못한다 (deny)"
          mono={false}
          size={13}
          tone="server"
          from={260}
        />
        <Arrow
          from={POST.from}
          to={POST.to}
          label="POST /api/*"
          color={THEME.colors.human}
          startFrame={260}
          durationInFrames={40}
        />
        {frame < 380 ? (
          <Arrow
            from={SSE.from}
            to={SSE.to}
            dashed
            label="SSE message"
            labelAt={0.5}
            color={THEME.colors.server}
            startFrame={340}
            durationInFrames={40}
          />
        ) : (
          <Arrow
            from={SSE.from}
            to={SSE.to}
            dashed
            label="SSE message"
            labelAt={0.5}
            color={THEME.colors.server}
            progress={loop(frame, 380, 60)}
          />
        )}
      </Stage>
      <Caption text="대화는 chat.db, 봇 편지함과 세션은 cockpit.db 에 적힌다." from={60} durationInFrames={200} />
      <Caption text="서버에서 브라우저로는 SSE 한 줄이 계속 흐른다." from={300} durationInFrames={220} />
    </AbsoluteFill>
  );
};
