import type { Box } from "./stage";
import { THEME, Tone, tone as toneColor, withAlpha } from "./theme";

export type ContextBarProps = {
  box: Box;
  /** 0~1 */
  pct: number;
  label?: string;
  tone?: Tone;
};

/** 세로 문맥 막대. 아래에서 pct 만큼 찬다. 글자는 막대 위에 */
export const ContextBar: React.FC<ContextBarProps> = ({ box, pct, label, tone = "cli" }) => {
  const color = toneColor(tone);
  const p = Math.min(1, Math.max(0, pct));
  const left = box.x - box.width / 2;
  const top = box.y - box.height / 2;

  return (
    <>
      {label ? (
        <div
          style={{
            position: "absolute",
            left: box.x,
            top: top - 14,
            transform: "translate(-50%, -100%)",
            fontFamily: THEME.fonts.mono,
            fontSize: THEME.sizes.labelSmall,
            color,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: box.width,
          height: box.height,
          boxSizing: "border-box",
          borderRadius: 6,
          border: `2px solid ${color}`,
          backgroundColor: THEME.colors.surface,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: `${p * 100}%`,
            backgroundColor: withAlpha(color, 0.55),
            borderTop: p > 0 ? `2px solid ${color}` : undefined,
          }}
        />
      </div>
    </>
  );
};
