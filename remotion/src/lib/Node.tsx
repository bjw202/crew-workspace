import {
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Point, THEME } from "./theme";

export type NodeSide = "top" | "bottom" | "left" | "right";

export type NodeProps = {
  title: string;
  /** monospace 로 찍히는 경로 · 명령 */
  subtitle?: string;
  /** 상자 가운데 좌표 */
  x: number;
  y: number;
  width?: number;
  height?: number;
  /** true/false, 또는 0~1 사이 세기 (호출하는 쪽이 interpolate 로 서서히 켤 때) */
  highlighted?: boolean | number;
  /** 이 프레임부터 spring 으로 나타난다 */
  enterFrame?: number;
  titleSize?: number;
  subtitleSize?: number;
  backgroundColor?: string;
  borderColor?: string;
  accentColor?: string;
  textColor?: string;
  subtitleColor?: string;
};

export const NODE_WIDTH = 380;
export const NODE_HEIGHT = 140;

/** 상자 변의 가운데 좌표. 화살표를 상자 가장자리에 붙일 때 쓴다. gap 만큼 바깥으로 띄운다. */
export const nodeAnchor = (
  node: Pick<NodeProps, "x" | "y" | "width" | "height">,
  side: NodeSide,
  gap = 0,
): Point => {
  const w = node.width ?? NODE_WIDTH;
  const h = node.height ?? NODE_HEIGHT;
  switch (side) {
    case "top":
      return { x: node.x, y: node.y - h / 2 - gap };
    case "bottom":
      return { x: node.x, y: node.y + h / 2 + gap };
    case "left":
      return { x: node.x - w / 2 - gap, y: node.y };
    case "right":
      return { x: node.x + w / 2 + gap, y: node.y };
  }
};

export const Node: React.FC<NodeProps> = ({
  title,
  subtitle,
  x,
  y,
  width = NODE_WIDTH,
  height = NODE_HEIGHT,
  highlighted = false,
  enterFrame = 0,
  titleSize = THEME.sizes.nodeTitle,
  subtitleSize = THEME.sizes.nodeSubtitle,
  backgroundColor = THEME.colors.surface,
  borderColor = THEME.colors.border,
  accentColor = THEME.colors.accent,
  textColor = THEME.colors.text,
  subtitleColor = THEME.colors.textMuted,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 200 },
  });
  const glow =
    typeof highlighted === "number"
      ? Math.min(1, Math.max(0, highlighted))
      : highlighted
        ? 1
        : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 24}px) scale(${0.92 + 0.08 * enter})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: THEME.radius,
          boxShadow: `0 0 36px 4px ${accentColor}`,
          opacity: glow * 0.55,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxSizing: "border-box",
          borderRadius: THEME.radius,
          backgroundColor,
          border: `2px solid ${interpolateColors(glow, [0, 1], [borderColor, accentColor])}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          padding: "0 20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: THEME.fonts.sans,
            fontSize: titleSize,
            fontWeight: 700,
            color: textColor,
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              fontFamily: THEME.fonts.mono,
              fontSize: subtitleSize,
              color: interpolateColors(glow, [0, 1], [subtitleColor, accentColor]),
              whiteSpace: "nowrap",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
};
