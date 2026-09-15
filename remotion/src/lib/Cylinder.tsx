import { useCurrentFrame } from "remotion";
import { rise, visible } from "./anim";
import type { Box } from "./stage";
import { THEME, Tone, tone as toneColor, withAlpha } from "./theme";

export type CylinderRow = { text: string; from?: number; highlightFrom?: number; highlightUntil?: number };
/** row 는 줄 글자의 앞 낱말 ('bot_inbox (편지함)' 이면 'bot_inbox') */
export type CylinderChip = { row: string; text: string; from: number; until?: number };

export type CylinderProps = {
  box: Box;
  name: string;
  tone: Tone;
  enterFrame?: number;
  rows: CylinderRow[];
  chips?: CylinderChip[];
  /** true 면 0.35, 숫자면 그 밝기 */
  dim?: boolean | number;
  /** 칩이 쌓이는 쪽. 서버 속 왼쪽 원통은 'left' (오른쪽 원통과 부딪치지 않게) */
  chipSide?: "left" | "right";
};

const RY = 12;
const ROW_H = 16;
const MAX_CHIPS = 3;

const rowKey = (text: string) => text.split(" ")[0];

export const Cylinder: React.FC<CylinderProps> = ({
  box,
  name,
  tone,
  enterFrame,
  rows,
  chips = [],
  dim,
  chipSide = "right",
}) => {
  const frame = useCurrentFrame();
  const v = enterFrame == null ? 1 : visible(frame, enterFrame);
  if (v <= 0) return null;

  const color = toneColor(tone);
  const dimLevel = dim === true ? 0.35 : typeof dim === "number" ? dim : 1;
  const { width: w, height: h } = box;
  // 이름을 12px 내린 만큼(04 6.5) 줄도 내리고, 네 줄이 원통 안에 들게 줄 높이를 16 으로
  const rowsTop = RY * 2 + 30;

  const body = `M 1 ${RY} A ${w / 2 - 1} ${RY} 0 0 0 ${w - 1} ${RY} V ${h - RY} A ${w / 2 - 1} ${RY} 0 0 1 1 ${h - RY} Z`;

  return (
    <div
      style={{
        position: "absolute",
        left: box.x - w / 2,
        top: box.y - h / 2,
        width: w,
        height: h,
        opacity: v * dimLevel,
        transform: rise(v),
      }}
    >
      <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <path d={body} fill={THEME.colors.surfaceRaised} stroke={color} strokeWidth={2} />
        <ellipse cx={w / 2} cy={RY} rx={w / 2 - 1} ry={RY - 1} fill={withAlpha(color, 0.2)} stroke={color} strokeWidth={2} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: w,
          top: RY * 2 + 10,
          textAlign: "center",
          fontFamily: THEME.fonts.mono,
          fontSize: THEME.sizes.cylinderName,
          fontWeight: 700,
          color,
        }}
      >
        {name}
      </div>
      {rows.map((row, i) => {
        const rv = visible(frame, row.from);
        const hl = row.highlightFrom == null ? 0 : visible(frame, row.highlightFrom, row.highlightUntil);
        const key = rowKey(row.text);
        const live = chips
          .filter((c) => c.row === key && visible(frame, c.from, c.until) > 0)
          .sort((a, b) => a.from - b.from);
        const shown = live.slice(-MAX_CHIPS);
        const hidden = live.length - shown.length;
        const top = rowsTop + i * ROW_H;

        return (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                left: 6,
                right: 6,
                top,
                height: ROW_H,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
                opacity: rv,
                backgroundColor: hl > 0 ? withAlpha(color, 0.28 * hl) : undefined,
                fontFamily: THEME.fonts.mono,
                fontSize: THEME.sizes.cylinderRow,
                color: hl > 0.5 ? color : THEME.colors.text,
                whiteSpace: "nowrap",
              }}
            >
              {row.text}
            </div>
            {rv > 0 && live.length > 0 ? (
              <div
                style={{
                  position: "absolute",
                  top: top + 1,
                  height: ROW_H - 2,
                  ...(chipSide === "right" ? { left: w + 6 } : { right: w + 6 }),
                  display: "flex",
                  flexDirection: chipSide === "right" ? "row" : "row-reverse",
                  gap: 4,
                }}
              >
                {shown.map((c, k) => {
                  const cv = visible(frame, c.from, c.until);
                  return (
                    <div
                      key={k}
                      style={{
                        opacity: cv,
                        transform: `translateY(${(1 - cv) * -12}px)`,
                        height: ROW_H - 2,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 6px",
                        borderRadius: 4,
                        border: `1px solid ${color}`,
                        backgroundColor: withAlpha(color, 0.22),
                        fontFamily: THEME.fonts.mono,
                        fontSize: THEME.sizes.chatSmall,
                        color: THEME.colors.text,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.text}
                    </div>
                  );
                })}
                {hidden > 0 ? (
                  <div
                    style={{
                      height: ROW_H - 2,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 5px",
                      fontFamily: THEME.fonts.mono,
                      fontSize: THEME.sizes.chatSmall,
                      color,
                    }}
                  >
                    +{hidden}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
