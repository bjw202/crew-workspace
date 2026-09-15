import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Point, THEME } from "./theme";

/**
 * 꺾은선 모양. h 는 가로, v 는 세로로 먼저 간다는 뜻이다.
 * hv · vh 는 한 번 꺾고, hvh · vhv 는 가운데에서 두 번 꺾는다.
 */
export type ArrowBend = "hv" | "vh" | "hvh" | "vhv";

export type ArrowProps = {
  from: Point;
  to: Point;
  route?: "straight" | "orthogonal";
  /** 주면 route · bend 대신 이 꺾은선을 그대로 쓴다 (from · to 는 무시) */
  points?: Point[];
  bend?: ArrowBend;
  /** 0~1. 주면 이것을 쓰고, 안 주면 startFrame · durationInFrames 로 스스로 그린다 */
  progress?: number;
  startFrame?: number;
  durationInFrames?: number;
  /** 선 위에 얹는 monospace 라벨 (예: POST /api/rooms) */
  label?: string;
  /** 라벨이 놓일 자리. 경로 길이 기준 0~1 */
  labelAt?: number;
  labelOffset?: Point;
  color?: string;
  strokeWidth?: number;
  headSize?: number;
  dashed?: boolean;
  labelColor?: string;
  labelSize?: number;
  labelBackground?: string;
};

const routePoints = (
  from: Point,
  to: Point,
  route: "straight" | "orthogonal",
  bend: ArrowBend,
): Point[] => {
  if (route === "straight") return [from, to];
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  switch (bend) {
    case "hv":
      return [from, { x: to.x, y: from.y }, to];
    case "vh":
      return [from, { x: from.x, y: to.y }, to];
    case "hvh":
      return [from, { x: midX, y: from.y }, { x: midX, y: to.y }, to];
    case "vhv":
      return [from, { x: from.x, y: midY }, { x: to.x, y: midY }, to];
  }
};

const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

/** 길이 0 인 마디를 뺀다. 두 점이 줄을 맞춰 있으면 꺾은선의 한 마디가 0 이 된다. */
const dedupe = (points: Point[]) =>
  points.filter((p, i) => i === 0 || dist(points[i - 1], p) > 0.01);

/** 경로 앞에서부터 d 만큼 간 자리까지의 점들과, 그 끝의 방향(라디안) */
const walk = (points: Point[], d: number) => {
  const out: Point[] = [points[0]];
  let left = d;
  let angle = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const len = dist(a, b);
    angle = Math.atan2(b.y - a.y, b.x - a.x);
    if (left <= len) {
      const t = len === 0 ? 0 : left / len;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      return { points: out, tip: out[out.length - 1], angle };
    }
    out.push(b);
    left -= len;
  }
  return { points: out, tip: out[out.length - 1], angle };
};

export const Arrow: React.FC<ArrowProps> = ({
  from,
  to,
  route = "straight",
  points: givenPoints,
  bend = "hvh",
  progress,
  startFrame = 0,
  durationInFrames = 20,
  label,
  labelAt = 0.5,
  labelOffset = { x: 0, y: -24 },
  color = THEME.colors.arrow,
  strokeWidth = 3,
  headSize = 16,
  dashed = false,
  labelColor = THEME.colors.text,
  labelSize = THEME.sizes.arrowLabel,
  labelBackground = THEME.colors.background,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const p =
    progress !== undefined
      ? Math.min(1, Math.max(0, progress))
      : interpolate(
          frame,
          [startFrame, startFrame + Math.max(1, durationInFrames)],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.cubic),
          },
        );

  const points = dedupe(givenPoints ?? routePoints(from, to, route, bend));
  if (points.length < 2) return null;

  let total = 0;
  for (let i = 1; i < points.length; i++) total += dist(points[i - 1], points[i]);

  const drawn = total * p;
  const head = walk(points, drawn);
  // 선은 화살촉 밑동에서 멈춘다. 끝이 촉 앞으로 삐져나오지 않게.
  const line = walk(points, Math.max(0, drawn - headSize * 0.8));
  const d = line.points.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ");

  const cos = Math.cos(head.angle);
  const sin = Math.sin(head.angle);
  const baseX = head.tip.x - cos * headSize;
  const baseY = head.tip.y - sin * headSize;
  const halfW = headSize * 0.55;
  const headPoints = [
    `${head.tip.x},${head.tip.y}`,
    `${baseX - sin * halfW},${baseY + cos * halfW}`,
    `${baseX + sin * halfW},${baseY - cos * halfW}`,
  ].join(" ");

  const labelStart = Math.min(labelAt, 1) * 0.9;
  const labelOpacity = interpolate(p, [labelStart, labelStart + 0.1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelPoint = walk(points, total * Math.min(1, Math.max(0, labelAt))).tip;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
      >
        {p > 0 ? (
          <>
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              strokeDasharray={dashed ? "12 10" : undefined}
            />
            <polygon
              points={headPoints}
              fill={color}
              // 막 출발할 때 촉이 출발점 뒤로 삐져나오지 않게, 촉 길이만큼 그려질 때까지 흐리게 둔다.
              opacity={Math.min(1, drawn / headSize)}
            />
          </>
        ) : null}
      </svg>
      {label ? (
        <div
          style={{
            position: "absolute",
            left: labelPoint.x + labelOffset.x,
            top: labelPoint.y + labelOffset.y,
            transform: "translate(-50%, -50%)",
            opacity: labelOpacity,
            fontFamily: THEME.fonts.mono,
            fontSize: labelSize,
            color: labelColor,
            backgroundColor: labelBackground,
            padding: "4px 10px",
            borderRadius: 6,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
