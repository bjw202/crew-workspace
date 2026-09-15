import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "./theme";

export type CodeBlockProps = {
  code: string;
  /** 상자 왼쪽 위 좌표 */
  x: number;
  y: number;
  width: number;
  /** 머리줄에 찍는 파일 경로 (예: src/session/options.js) */
  title?: string;
  /** 강조할 줄 번호. 1 부터 센다 */
  highlightLines?: number[];
  /** 이 프레임부터 상자가 뜨고, 줄이 위에서 아래로 차례로 나타난다 */
  startFrame?: number;
  framesPerLine?: number;
  showLineNumbers?: boolean;
  fontSize?: number;
  /** 글자 크기의 몇 배를 한 줄 높이로 쓸지 */
  lineHeight?: number;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  titleColor?: string;
  lineNumberColor?: string;
  highlightColor?: string;
  highlightBarColor?: string;
};

const FADE = 6;

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  x,
  y,
  width,
  title,
  highlightLines = [],
  startFrame = 0,
  framesPerLine = 4,
  showLineNumbers = true,
  fontSize = THEME.sizes.code,
  lineHeight = 1.6,
  backgroundColor = THEME.colors.codeBackground,
  borderColor = THEME.colors.border,
  textColor = THEME.colors.text,
  titleColor = THEME.colors.textMuted,
  lineNumberColor = THEME.colors.lineNumber,
  highlightColor = THEME.colors.highlightLine,
  highlightBarColor = THEME.colors.accent,
}) => {
  const frame = useCurrentFrame();
  const lines = code.replace(/\n$/, "").split("\n");
  const highlighted = new Set(highlightLines);
  const numberWidth = String(lines.length).length;

  const boxOpacity = interpolate(frame, [startFrame, startFrame + FADE], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        boxSizing: "border-box",
        opacity: boxOpacity,
        backgroundColor,
        border: `2px solid ${borderColor}`,
        borderRadius: THEME.radius,
        overflow: "hidden",
        fontFamily: THEME.fonts.mono,
        fontSize,
      }}
    >
      {title ? (
        <div
          style={{
            padding: "12px 20px",
            borderBottom: `2px solid ${borderColor}`,
            color: titleColor,
            fontSize: fontSize * 0.8,
          }}
        >
          {title}
        </div>
      ) : null}
      <div style={{ padding: "12px 0" }}>
        {lines.map((text, i) => {
          const local = frame - startFrame - FADE - i * framesPerLine;
          const shown = interpolate(local, [0, FADE], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const isHighlighted = highlighted.has(i + 1);
          return (
            <div
              key={i}
              style={{
                position: "relative",
                display: "flex",
                height: fontSize * lineHeight,
                alignItems: "center",
                padding: "0 20px",
                opacity: shown,
                transform: `translateY(${(1 - shown) * -8}px)`,
                backgroundColor: isHighlighted ? highlightColor : undefined,
              }}
            >
              {isHighlighted ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 5,
                    backgroundColor: highlightBarColor,
                  }}
                />
              ) : null}
              {showLineNumbers ? (
                <span
                  style={{
                    color: lineNumberColor,
                    width: `${numberWidth + 1}ch`,
                    flexShrink: 0,
                    textAlign: "right",
                    marginRight: "1.2ch",
                  }}
                >
                  {i + 1}
                </span>
              ) : null}
              <span style={{ color: textColor, whiteSpace: "pre" }}>{text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
