import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { THEME } from "./theme";

export type CaptionProps = {
  /** 한 번에 한 문장 */
  text: string;
  /** 이 프레임에 나타나기 시작한다 */
  from?: number;
  /** 보이는 프레임 수. 앞뒤 fadeFrames 만큼은 흐려지며 들고 난다 */
  durationInFrames: number;
  fadeFrames?: number;
  /** 화면 아래에서 띠까지의 거리 */
  bottom?: number;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  maxWidth?: number;
};

export const Caption: React.FC<CaptionProps> = ({
  text,
  from = 0,
  durationInFrames,
  fadeFrames = 8,
  bottom = 56,
  fontSize = THEME.sizes.caption,
  color = THEME.colors.text,
  backgroundColor = THEME.colors.captionBackground,
  maxWidth = 1500,
}) => {
  const frame = useCurrentFrame();
  const end = from + durationInFrames;
  if (frame < from || frame >= end) return null;

  // 길이가 짧아도 입력 구간이 늘 커지도록 fade 를 줄인다.
  const fade = Math.max(1, Math.min(fadeFrames, Math.floor((durationInFrames - 1) / 2)));
  const opacity =
    durationInFrames < 3
      ? 1
      : interpolate(frame, [from, from + fade, end - fade, end], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", pointerEvents: "none" }}
    >
      <div
        style={{
          marginBottom: bottom,
          opacity,
          transform: `translateY(${(1 - opacity) * 12}px)`,
          backgroundColor,
          borderRadius: 12,
          padding: "18px 40px",
          maxWidth,
          fontFamily: THEME.fonts.sans,
          fontSize,
          lineHeight: 1.4,
          color,
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
