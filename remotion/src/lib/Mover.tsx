import { Easing, interpolate, useCurrentFrame } from "remotion";
import { lerp } from "./anim";

export type MoverPoint = { x: number; y: number; scale?: number; opacity?: number };

export type MoverProps = {
  from: MoverPoint;
  to: MoverPoint;
  startFrame: number;
  durationInFrames: number;
  /** false 면 시작 전엔 안 보인다 */
  holdBefore?: boolean;
  /** false 면 끝난 뒤엔 안 보인다 */
  holdAfter?: boolean;
  easing?: (t: number) => number;
  /** (0,0) 기준으로 그린다. Mover 가 translate(x,y) scale(s) 를 준다 (원점 0 0) */
  children: React.ReactNode;
};

export const Mover: React.FC<MoverProps> = ({
  from,
  to,
  startFrame,
  durationInFrames,
  holdBefore = false,
  holdAfter = true,
  easing,
  children,
}) => {
  const frame = useCurrentFrame();
  const end = startFrame + Math.max(1, durationInFrames);
  if (frame < startFrame && !holdBefore) return null;
  if (frame >= end && !holdAfter) return null;

  const t = interpolate(frame, [startFrame, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easing ?? Easing.inOut(Easing.cubic),
  });
  const x = lerp(from.x, to.x, t);
  const y = lerp(from.y, to.y, t);
  const s = lerp(from.scale ?? 1, to.scale ?? 1, t);
  const o = lerp(from.opacity ?? 1, to.opacity ?? 1, t);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px) scale(${s})`,
        transformOrigin: "0 0",
        opacity: o,
      }}
    >
      {children}
    </div>
  );
};
