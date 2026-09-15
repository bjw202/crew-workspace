import { useCurrentFrame } from "remotion";
import { rise, visible } from "./anim";
import type { Box } from "./stage";
import { THEME, Tone, tone as toneColor, withAlpha } from "./theme";

export type FolderBoxProps = {
  box: Box;
  title: string;
  subtitle?: string;
  tone: Tone;
  enterFrame?: number;
  /** 밝기 0~1 (기본 1). 0.35 면 자리만 흐릿하게 */
  dim?: number;
  glowFrom?: number;
  glowUntil?: number;
  /** 무대 좌표(절대)로 놓인다. 상자 밝기를 함께 받는다 */
  children?: React.ReactNode;
};

export const FolderBox: React.FC<FolderBoxProps> = ({
  box,
  title,
  subtitle,
  tone,
  enterFrame,
  dim = 1,
  glowFrom,
  glowUntil,
  children,
}) => {
  const frame = useCurrentFrame();
  const v = enterFrame == null ? 1 : visible(frame, enterFrame);
  if (v <= 0) return null;

  const color = toneColor(tone);
  const g = glowFrom == null ? 0 : visible(frame, glowFrom, glowUntil, 10);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: box.x - box.width / 2,
          top: box.y - box.height / 2,
          width: box.width,
          height: box.height,
          boxSizing: "border-box",
          opacity: v * dim,
          transform: rise(v),
          borderRadius: THEME.radius,
          border: `2px solid ${withAlpha(color, 0.7 + 0.3 * g)}`,
          backgroundColor: withAlpha(color, 0.06 + 0.1 * g),
          boxShadow: g > 0 ? THEME.glow(withAlpha(color, 0.6 * g)) : undefined,
          padding: "6px 12px",
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          whiteSpace: "nowrap",
          overflow: "visible",
        }}
      >
        <span style={{ fontFamily: THEME.fonts.mono, fontSize: THEME.sizes.tree, fontWeight: 700, color }}>
          {title}
        </span>
        {subtitle ? (
          <span style={{ fontFamily: THEME.fonts.mono, fontSize: THEME.sizes.treeTiny, color: THEME.colors.textMuted }}>
            {subtitle}
          </span>
        ) : null}
      </div>
      {children ? (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: v * dim }}>{children}</div>
      ) : null}
    </>
  );
};
