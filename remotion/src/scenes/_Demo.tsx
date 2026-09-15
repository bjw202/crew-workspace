import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { CodeBlock } from "../lib/CodeBlock";
import { Node, nodeAnchor } from "../lib/Node";
import { THEME } from "../lib/theme";

// 부품 넷을 한 화면에 놓아 보는 확인용 장면. 영상에는 들어가지 않는다.
export const DEMO_DURATION = 150;

const BROWSER = { x: 400, y: 220 };
const SERVER = { x: 1100, y: 220 };
const CLI = { x: 1580, y: 540 };

const OPTIONS_CODE = `query({ prompt: <입력 흐름>, options: {
  cwd: botDir,
  settingSources: ['project','local'],
  strictMcpConfig: true,
  mcpServers: { cockpit: mcpServer },
  allowedTools: ['mcp__cockpit__reply','mcp__cockpit__fetch_history'],
  canUseTool,
  persistSession: true, resume: <저장된 session_id>,
}})`;

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const serverGlow = interpolate(frame, [40, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.background }}>
      <Node {...BROWSER} title="브라우저" subtitle="web/app.js" enterFrame={0} />
      <Node
        {...SERVER}
        title="cockpit 서버"
        subtitle="node bin/cockpit.js serve"
        enterFrame={6}
        highlighted={serverGlow}
      />
      <Node
        {...CLI}
        title="Claude Code CLI"
        subtitle="src/session/sdk-query.js"
        enterFrame={12}
      />

      <Arrow
        from={nodeAnchor(BROWSER, "right", 8)}
        to={nodeAnchor(SERVER, "left", 8)}
        label="POST /api/rooms"
        startFrame={18}
        durationInFrames={22}
      />
      <Arrow
        route="orthogonal"
        bend="vh"
        from={nodeAnchor(SERVER, "bottom", 8)}
        to={nodeAnchor(CLI, "left", 8)}
        label="query()"
        labelAt={0.75}
        startFrame={40}
        durationInFrames={30}
      />

      <CodeBlock
        x={80}
        y={380}
        width={940}
        title="src/session/options.js"
        code={OPTIONS_CODE}
        highlightLines={[2, 3]}
        startFrame={10}
        framesPerLine={4}
        fontSize={20}
      />

      <Caption
        text="cockpit 서버는 봇마다 query() 로 Claude Code CLI 하나를 띄웁니다."
        from={30}
        durationInFrames={110}
      />
    </AbsoluteFill>
  );
};
