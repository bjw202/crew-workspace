// 03 장면 1 — 세 기둥과 바닥 (12초 · 절대 0~359)
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loop } from "../lib/anim";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { ChatPane } from "../lib/ChatPane";
import { STAGE } from "../lib/stage";
import { Stage } from "../lib/StageView";
import { THEME } from "../lib/theme";

export const DURATION = 360;
export const STILLS = [0, 200, 340];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// cockpit/web/glue.js:7 HINT_NO_BOT
const HINT_NO_BOT = "봇에게 가지 않습니다 — 부르려면 @";

const POST = {
  from: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_TOP_Y },
  to: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_TOP_Y },
};
const SSE = {
  from: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_SSE_Y },
  to: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_SSE_Y },
};

export const S01: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Stage
        floorProgress={interpolate(frame, [0, 30], [0, 1], clamp)}
        browser={{
          status: "on",
          enterFrame: 20,
          children: (
            <ChatPane
              box={STAGE.BROWSER}
              viewer="김피엘"
              sidebar={{ rooms: [] }}
              messages={[]}
              input={{ placeholder: HINT_NO_BOT }}
            />
          ),
        }}
        server={{ status: "on", enterFrame: 60 }}
        cli={{ status: "off", enterFrame: 100, subtitle: "(봇 · 꺼짐)" }}
        prodev={{ enterFrame: 140, dim: 0.35 }}
        project={{ enterFrame: 160, dim: 0.35 }}
      >
        <Arrow
          from={POST.from}
          to={POST.to}
          label="POST /api/*"
          color={THEME.colors.human}
          startFrame={180}
          durationInFrames={40}
        />
        {frame >= 230 ? (
          <Arrow
            from={SSE.from}
            to={SSE.to}
            dashed
            label="SSE /api/stream"
            labelOffset={{ x: 0, y: 28 }}
            color={THEME.colors.server}
            progress={loop(frame, 230, 60)}
          />
        ) : null}
      </Stage>
      <Caption text="웹 앱 하나가 Claude Code CLI 를 봇으로 켜 둔다." from={30} durationInFrames={150} />
      <Caption text="브라우저와 CLI 사이에 선은 없다." from={195} durationInFrames={155} />
    </AbsoluteFill>
  );
};
