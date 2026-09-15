import { useCurrentFrame } from "remotion";
import { visible } from "./anim";
import { THEME, Tone, tone as toneColor, withAlpha } from "./theme";

export type TimelineProps = {
  /** 화면 좌표 */
  x: number;
  yTop: number;
  yBottom: number;
  ticks: { label: string; y: number; from: number }[];
  /** 빛나는 점 자리. 이 y 까지의 눈금은 밝다 */
  markerY?: number;
  enterFrame?: number;
  tone?: Tone;
  labelSize?: number;
  labelWidth?: number;
};

/** 세로 시간축. 눈금 글자는 축 오른쪽 (mono) */
export const Timeline: React.FC<TimelineProps> = ({
  x,
  yTop,
  yBottom,
  ticks,
  markerY,
  enterFrame,
  tone = "cli",
  labelSize = 14,
  labelWidth = 560,
}) => {
  const frame = useCurrentFrame();
  const v = enterFrame == null ? 1 : visible(frame, enterFrame);
  if (v <= 0) return null;
  const color = toneColor(tone);
  const lh = labelSize * 1.4;

  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: v }}>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={x} y1={yTop} x2={x} y2={yBottom} stroke={withAlpha(color, 0.5)} strokeWidth={2} />
        {ticks.map((t, i) => {
          const tv = visible(frame, t.from);
          const passed = markerY != null && t.y <= markerY + 0.5;
          return (
            <circle
              key={i}
              cx={x}
              cy={t.y}
              r={6}
              opacity={tv}
              fill={passed ? color : THEME.colors.background}
              stroke={passed ? color : THEME.colors.off}
              strokeWidth={2}
            />
          );
        })}
        {markerY != null ? (
          <>
            <circle cx={x} cy={markerY} r={18} fill={withAlpha(color, 0.3)} />
            <circle cx={x} cy={markerY} r={9} fill={color} />
          </>
        ) : null}
      </svg>
      {ticks.map((t, i) => {
        const tv = visible(frame, t.from);
        const passed = markerY != null && t.y <= markerY + 0.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + 22,
              top: t.y - lh / 2,
              width: labelWidth,
              opacity: tv * (passed ? 1 : 0.45),
              fontFamily: THEME.fonts.mono,
              fontSize: labelSize,
              lineHeight: `${lh}px`,
              color: passed ? THEME.colors.text : THEME.colors.textMuted,
              whiteSpace: "pre-wrap",
            }}
          >
            {t.label}
          </div>
        );
      })}
    </div>
  );
};
