import { pathD, polylineLength, walkPolyline } from "./anim";
import { Point, Tone, tone as toneColor, withAlpha } from "./theme";

export type AnchorLineProps = {
  points: Point[];
  /** 0~1 */
  progress: number;
  tone?: Tone;
  /** 두 번째 꺾은선 위로 빛 덩이가 달린다 (0→1) */
  climb?: { points: Point[]; progress: number };
  strokeWidth?: number;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** 닻줄(cwd). 꺾은선을 progress 만큼 그리고 끝에 닻 표시(원 + 가로 막대) */
export const AnchorLine: React.FC<AnchorLineProps> = ({
  points,
  progress,
  tone = "cli",
  climb,
  strokeWidth = 4,
}) => {
  const color = toneColor(tone);
  const p = clamp01(progress);
  const drawn = walkPolyline(points, polylineLength(points) * p);

  const cp = climb ? clamp01(climb.progress) : 0;
  const climbWalk = climb ? walkPolyline(climb.points, polylineLength(climb.points) * cp) : null;

  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}
    >
      {p > 0 ? (
        <>
          <path
            d={pathD(drawn.points)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx={drawn.tip.x} cy={drawn.tip.y} r={strokeWidth + 3} fill={color} />
          <rect
            x={drawn.tip.x - 14}
            y={drawn.tip.y + strokeWidth + 4}
            width={28}
            height={strokeWidth}
            rx={strokeWidth / 2}
            fill={color}
          />
        </>
      ) : null}
      {climbWalk && cp > 0 ? (
        <>
          <path
            d={pathD(climbWalk.points)}
            fill="none"
            stroke={withAlpha(color, 0.55)}
            strokeWidth={Math.max(2, strokeWidth - 1)}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {cp < 1 ? (
            <>
              <circle cx={climbWalk.tip.x} cy={climbWalk.tip.y} r={20} fill={withAlpha(color, 0.25)} />
              <circle cx={climbWalk.tip.x} cy={climbWalk.tip.y} r={9} fill={color} />
            </>
          ) : null}
        </>
      ) : null}
    </svg>
  );
};
