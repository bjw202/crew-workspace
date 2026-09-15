import { useCurrentFrame } from "remotion";
import { litLevel, rise, visible } from "./anim";
import { THEME, Tone, tone as toneColor, withAlpha } from "./theme";

export type TreeLine = {
  text: string;
  depth?: number;
  from?: number;
  until?: number;
  lit?: boolean | number;
  /** 밝기 0~1 */
  dim?: number;
  warn?: boolean;
  mono?: boolean;
  lock?: boolean;
  number?: string;
  tone?: Tone;
};

export type FolderTreeProps = {
  /** 왼쪽 위 좌표 */
  x: number;
  y: number;
  width: number;
  fontSize?: number;
  lineHeight?: number;
  /** lit 일 때의 색 (기본 file) */
  tone?: Tone;
  opacity?: number;
  lines: TreeLine[];
};

/**
 * 줄마다 자리(slot)를 준다. 앞 줄의 until 이 이 줄의 from 과 같으면 그 자리를 이어 쓴다
 * (같은 자리에서 글자만 바꾸기, 04 4절).
 */
const assignSlots = (lines: TreeLine[]) => {
  const slots: number[] = [];
  const reused = new Set<number>();
  let next = 0;
  lines.forEach((line, i) => {
    let slot = -1;
    if (line.from != null) {
      for (let j = 0; j < i; j++) {
        if (!reused.has(j) && lines[j].until != null && lines[j].until === line.from) {
          slot = slots[j];
          reused.add(j);
          break;
        }
      }
    }
    if (slot < 0) slot = next++;
    slots.push(slot);
  });
  return slots;
};

export const FolderTree: React.FC<FolderTreeProps> = ({
  x,
  y,
  width,
  fontSize = THEME.sizes.tree,
  lineHeight = 1.7,
  tone = "file",
  opacity = 1,
  lines,
}) => {
  const frame = useCurrentFrame();
  const slots = assignSlots(lines);
  const lh = fontSize * lineHeight;

  return (
    <div style={{ position: "absolute", left: x, top: y, width, opacity }}>
      {lines.map((line, i) => {
        const v = visible(frame, line.from, line.until);
        if (v <= 0) return null;
        const L = litLevel(line.lit);
        const color = toneColor(line.tone ?? tone);
        const textColor = line.warn ? THEME.colors.warn : L > 0.5 ? color : THEME.colors.text;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (line.depth ?? 0) * fontSize * 1.4,
              top: slots[i] * lh,
              height: lh,
              display: "flex",
              alignItems: "center",
              opacity: v * (line.dim ?? 1),
              transform: rise(v),
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 6px",
                marginLeft: -6,
                borderRadius: 4,
                backgroundColor: L > 0 ? withAlpha(line.warn ? THEME.colors.warn : color, 0.16 * L) : undefined,
                fontFamily: line.mono === false ? THEME.fonts.sans : THEME.fonts.mono,
                fontSize,
                color: textColor,
                whiteSpace: "pre",
              }}
            >
              {line.number ? <span style={{ color }}>{line.number}</span> : null}
              <span>{line.text}</span>
              {line.lock ? <span>🔒</span> : null}
            </span>
          </div>
        );
      })}
    </div>
  );
};
