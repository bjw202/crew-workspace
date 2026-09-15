import { useCurrentFrame } from "remotion";
import { rise, visible } from "./anim";
import { THEME, withAlpha } from "./theme";

export type ApprovalCardProps = {
  /** 왼쪽 위 좌표 */
  x: number;
  y: number;
  width: number;
  request: { project: string; tool: string; heading: string; input: string };
  buttons: string[];
  enterFrame: number;
  pressAt?: number;
  pressed?: string;
  leaveFrame?: number;
};

/** 조종석 판의 승인 카드. 줄 순서는 cockpit/web/card.js:54-73 (meta 줄 · 제목 · input pre · 단추 줄) */
export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  x,
  y,
  width,
  request,
  buttons,
  enterFrame,
  pressAt,
  pressed,
  leaveFrame,
}) => {
  const frame = useCurrentFrame();
  const v = visible(frame, enterFrame, leaveFrame);
  if (v <= 0) return null;

  const human = THEME.colors.human;
  const isPressed = pressAt != null && frame >= pressAt;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        boxSizing: "border-box",
        opacity: v,
        transform: rise(v),
        padding: "8px 12px",
        borderRadius: THEME.radiusSmall,
        border: `2px solid ${human}`,
        backgroundColor: THEME.colors.surfaceRaised,
        boxShadow: THEME.glow(withAlpha(human, 0.3)),
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ fontFamily: THEME.fonts.sans, fontSize: 12, color: THEME.colors.textMuted }}>
        {`${request.project} · ${request.tool}`}
      </div>
      <div style={{ fontFamily: THEME.fonts.sans, fontSize: 15, fontWeight: 700, color: THEME.colors.text }}>
        {request.heading}
      </div>
      <pre
        style={{
          margin: 0,
          padding: "3px 6px",
          borderRadius: 4,
          backgroundColor: THEME.colors.codeBackground,
          fontFamily: THEME.fonts.mono,
          fontSize: 12,
          color: THEME.colors.text,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {request.input}
      </pre>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {buttons.map((b) => {
          const on = isPressed && b === pressed;
          return (
            <span
              key={b}
              style={{
                fontFamily: THEME.fonts.sans,
                fontSize: 13,
                padding: "2px 9px",
                borderRadius: 6,
                border: `1px solid ${human}`,
                backgroundColor: on ? human : "transparent",
                color: on ? THEME.colors.background : human,
                fontWeight: on ? 700 : 400,
              }}
            >
              {b}
            </span>
          );
        })}
      </div>
    </div>
  );
};
