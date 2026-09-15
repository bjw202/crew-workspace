import { useId } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { Box } from "./stage";
import { THEME } from "./theme";

/** Box 는 가운데 좌표. corner: true 면 x·y 가 왼쪽 위 */
export type SpotRect = Box | { x: number; y: number; width: number; height: number; corner?: boolean };

export type SpotlightProps = {
  /** 구멍. 비우면 전부 덮는다 */
  rects: SpotRect[];
  opacity?: number;
  from?: number;
  /** 이 프레임부터 fadeFrames 동안 걷힌다 */
  until?: number;
  fadeFrames?: number;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// THEME.colors.dim 의 색에 opacity 를 알파로 준다
const dimFill = (alpha: number) => THEME.colors.dim.replace(/[\d.]+\)$/, `${alpha})`);

export const Spotlight: React.FC<SpotlightProps> = ({
  rects,
  opacity = 0.7,
  from,
  until,
  fadeFrames = 10,
}) => {
  const frame = useCurrentFrame();
  const id = `spot-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const up = from == null ? 1 : interpolate(frame, [from, from + fadeFrames], [0, 1], clamp);
  const down = until == null ? 1 : interpolate(frame, [until, until + fadeFrames], [1, 0], clamp);
  const v = Math.min(up, down);
  if (v <= 0) return null;

  // 카메라가 움직여도 화면을 다 덮도록 무대 밖까지 넓게
  const far = { x: -4000, y: -4000, width: 10000, height: 10000 };

  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" {...far}>
          <rect {...far} fill="white" />
          {rects.map((r, i) => {
            const corner = "corner" in r && r.corner;
            return (
              <rect
                key={i}
                x={corner ? r.x : r.x - r.width / 2}
                y={corner ? r.y : r.y - r.height / 2}
                width={r.width}
                height={r.height}
                rx={THEME.radius}
                fill="black"
              />
            );
          })}
        </mask>
      </defs>
      <rect {...far} fill={dimFill(opacity * v)} mask={`url(#${id})`} />
    </svg>
  );
};
