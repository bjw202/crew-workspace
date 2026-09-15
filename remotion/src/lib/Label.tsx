import { useCurrentFrame } from "remotion";
import { rise, visible } from "./anim";
import { THEME, Tone, tone as toneColor, withAlpha } from "./theme";

export type LabelProps = {
  /** 가운데 좌표 (align 이 left 면 왼쪽 가운데, right 면 오른쪽 가운데) */
  x: number;
  y: number;
  text: string;
  from?: number;
  until?: number;
  mono?: boolean;
  size?: number;
  tone?: Tone;
  /** tone 보다 앞선다 */
  color?: string;
  align?: "center" | "left" | "right";
  background?: boolean;
  /** 배경 상자 색 (기본 THEME.colors.background) */
  backgroundColor?: string;
  /** 주면 이 폭에서 접는다 */
  maxWidth?: number;
  warn?: boolean;
  vertical?: boolean;
  glowFrom?: number;
  glowUntil?: number;
};

export const Label: React.FC<LabelProps> = ({
  x,
  y,
  text,
  from,
  until,
  mono = true,
  size = THEME.sizes.label,
  tone,
  color,
  align = "center",
  background = true,
  backgroundColor,
  maxWidth,
  warn = false,
  vertical = false,
  glowFrom,
  glowUntil,
}) => {
  const frame = useCurrentFrame();
  const v = visible(frame, from, until);
  if (v <= 0) return null;

  const base = warn ? THEME.colors.warn : tone ? toneColor(tone) : THEME.colors.text;
  const g = glowFrom == null ? 0 : visible(frame, glowFrom, glowUntil);
  const tx = align === "center" ? "-50%" : align === "left" ? "0%" : "-100%";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${tx}, -50%) ${rise(v)}`,
        opacity: v,
        fontFamily: mono ? THEME.fonts.mono : THEME.fonts.sans,
        fontSize: size,
        lineHeight: 1.35,
        color: color ?? base,
        backgroundColor: background ? (backgroundColor ?? THEME.colors.background) : undefined,
        padding: background ? "3px 9px" : 0,
        borderRadius: 6,
        whiteSpace: maxWidth ? "pre-wrap" : "pre",
        maxWidth,
        width: maxWidth ? "max-content" : undefined,
        writingMode: vertical ? "vertical-rl" : undefined,
        textAlign: align === "right" ? "right" : align === "left" ? "left" : "center",
        boxShadow: g > 0 ? THEME.glow(withAlpha(base, 0.75 * g)) : undefined,
      }}
    >
      {text}
    </div>
  );
};
