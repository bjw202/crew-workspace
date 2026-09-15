import { interpolate, useCurrentFrame } from "remotion";
import { THEME, Tone, tone as toneColor, withAlpha } from "./theme";

export type EnvelopeProps = {
  /** 왼쪽 위 좌표 */
  x: number;
  y: number;
  width: number;
  /** 겉봉투 (<channel …> 덩이) 글자 그대로 */
  text: string;
  fontSize?: number;
  startFrame?: number;
  framesPerLine?: number;
  /** 1 부터 센다 */
  highlightLines?: number[];
  tone?: Tone;
  title?: string;
  /** 머리 한 줄 + 본문 한 줄만 */
  compact?: boolean;
};

const FADE = 6;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const isTagLine = (line: string) => line.startsWith("<channel") || line.startsWith("</channel");

/** 겉봉투. CodeBlock 과 달리 긴 머리 줄을 접는다(pre-wrap · break-all). 줄 번호 없음 */
export const Envelope: React.FC<EnvelopeProps> = ({
  x,
  y,
  width,
  text,
  fontSize = THEME.sizes.envelope,
  startFrame = 0,
  framesPerLine = 25,
  highlightLines = [],
  tone = "server",
  title,
  compact = false,
}) => {
  const frame = useCurrentFrame();
  const color = toneColor(tone);
  const all = text.split("\n");
  const lines = compact ? all.slice(0, 2) : all;
  const highlighted = new Set(highlightLines);

  const boxOpacity = interpolate(frame, [startFrame, startFrame + FADE], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        boxSizing: "border-box",
        opacity: boxOpacity,
        backgroundColor: THEME.colors.codeBackground,
        border: `2px solid ${color}`,
        borderRadius: THEME.radius,
        overflow: "hidden",
        fontFamily: THEME.fonts.mono,
        fontSize,
        lineHeight: 1.45,
      }}
    >
      {title ? (
        <div
          style={{
            padding: "10px 20px",
            borderBottom: `2px solid ${THEME.colors.border}`,
            color: THEME.colors.textMuted,
            fontSize: fontSize * 0.75,
          }}
        >
          {title}
        </div>
      ) : null}
      <div style={{ padding: "12px 0" }}>
        {lines.map((line, i) => {
          const local = frame - startFrame - FADE - i * framesPerLine;
          const shown = interpolate(local, [0, FADE], [0, 1], clamp);
          const isHl = highlighted.has(i + 1);
          const lineColor = isTagLine(line) || line.startsWith("→") ? color : THEME.colors.text;
          return (
            <div
              key={i}
              style={{
                position: "relative",
                padding: "2px 20px",
                minHeight: fontSize * 1.45,
                opacity: shown,
                transform: `translateY(${(1 - shown) * -8}px)`,
                backgroundColor: isHl ? withAlpha(color, 0.16) : undefined,
                color: lineColor,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {isHl ? (
                <div
                  style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, backgroundColor: color }}
                />
              ) : null}
              {compact && i === 0 && line.length > 60 ? `${line.slice(0, 60)}…` : line}
            </div>
          );
        })}
      </div>
    </div>
  );
};
