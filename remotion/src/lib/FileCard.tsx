import { useCurrentFrame } from "remotion";
import { litLevel, rise, visible } from "./anim";
import { THEME, Tone, tone as toneColor, withAlpha } from "./theme";

export type FileCardProps = {
  /** 가운데 좌표 */
  x: number;
  y: number;
  name: string;
  /** 둘째 줄 */
  sub?: string;
  tone: Tone;
  width?: number;
  height?: number;
  fontSize?: number;
  enterFrame?: number;
  lock?: boolean;
  /** 0444 · PR 같은 작은 표 */
  badge?: string;
  /** ① 같은 번호 */
  number?: string;
  lit?: boolean | number;
};

export const FileCard: React.FC<FileCardProps> = ({
  x,
  y,
  name,
  sub,
  tone,
  width = 200,
  height = 44,
  fontSize,
  enterFrame,
  lock = false,
  badge,
  number,
  lit,
}) => {
  const frame = useCurrentFrame();
  const v = enterFrame == null ? 1 : visible(frame, enterFrame);
  if (v <= 0) return null;

  const color = toneColor(tone);
  const L = litLevel(lit);
  const fs = fontSize ?? (sub ? THEME.sizes.labelSmall : 15);

  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        boxSizing: "border-box",
        opacity: v,
        transform: rise(v),
        borderRadius: THEME.radiusSmall,
        border: `2px solid ${L > 0 ? color : withAlpha(color, 0.55)}`,
        backgroundColor: THEME.colors.surfaceRaised,
        boxShadow: L > 0 ? THEME.glow(withAlpha(color, 0.45 * L)) : undefined,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: withAlpha(color, 0.14 * L),
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 8px",
          gap: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: THEME.fonts.mono,
            fontSize: fs,
            color: L > 0.5 ? color : THEME.colors.text,
            whiteSpace: "nowrap",
          }}
        >
          {number ? <span style={{ color }}>{number}</span> : null}
          <span>{name}</span>
          {lock ? <span>🔒</span> : null}
          {badge ? (
            <span
              style={{
                fontSize: fs - 3,
                padding: "0 5px",
                borderRadius: 4,
                border: `1px solid ${color}`,
                color,
              }}
            >
              {badge}
            </span>
          ) : null}
        </div>
        {sub ? (
          <div
            style={{
              fontFamily: THEME.fonts.mono,
              fontSize: fs - 2,
              color: THEME.colors.textMuted,
              whiteSpace: "nowrap",
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
};
