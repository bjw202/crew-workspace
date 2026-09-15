import { useCurrentFrame } from "remotion";
import { loop, rise, visible } from "./anim";
import type { Box } from "./stage";
import { THEME, Tone, tone as toneColor, withAlpha } from "./theme";

export type PillarStatus = "off" | "on" | "starting" | "idle" | "working" | "waiting";

export type PillarProps = {
  box: Box;
  title: string;
  subtitle?: string;
  tone: Tone;
  status?: PillarStatus;
  /** 주면 상태 글자 대신 쓴다 */
  statusText?: string;
  enterFrame?: number;
  /** true 면 0.35, 숫자면 그 밝기 */
  dim?: boolean | number;
  /** 무대 좌표(절대)로 놓인다. 기둥이 꺼지면 함께 흐려진다 */
  children?: React.ReactNode;
};

// 04 4.1 · cockpit README 1.1 "세션" 의 상태 이름
const STATUS_WORDS: Record<PillarStatus, [string, string] | null> = {
  off: ["꺼짐", "stopped"],
  on: null,
  starting: ["켜는 중", "starting"],
  idle: ["대기", "idle"],
  working: ["일하는 중", "working"],
  waiting: ["승인 대기", "waiting_approval"],
};

export const Pillar: React.FC<PillarProps> = ({
  box,
  title,
  subtitle,
  tone,
  status = "on",
  statusText,
  enterFrame,
  dim,
  children,
}) => {
  const frame = useCurrentFrame();
  const v = enterFrame == null ? 1 : visible(frame, enterFrame);
  if (v <= 0) return null;

  const dimLevel = dim === true ? 0.35 : typeof dim === "number" ? dim : 1;
  const own = toneColor(tone);
  const cli = THEME.colors.cli;
  const human = THEME.colors.human;

  let border: string = own;
  let borderAlpha = 1;
  let glow: string | undefined;
  if (status === "off") border = THEME.colors.off;
  if (status === "starting" || status === "idle" || status === "working") border = cli;
  if (status === "starting") borderAlpha = 0.4 + 0.6 * (0.5 - 0.5 * Math.cos(2 * Math.PI * loop(frame, 0, 20)));
  if (status === "working") glow = THEME.glow(withAlpha(cli, 0.45));
  if (status === "waiting") {
    border = human;
    glow = THEME.glow(withAlpha(human, 0.45));
  }

  const words = STATUS_WORDS[status];
  const showWords = statusText != null || (words != null && (status !== "off" || tone === "cli"));
  const bodyAlpha = status === "off" ? 0.35 : 1;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: box.x - box.width / 2,
          top: box.y - box.height / 2,
          width: box.width,
          height: box.height,
          opacity: v * dimLevel,
          transform: rise(v),
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxSizing: "border-box",
            borderRadius: THEME.radius,
            border: `2px ${status === "off" ? "dashed" : "solid"} ${border === THEME.colors.off ? border : withAlpha(border, borderAlpha)}`,
            backgroundColor: withAlpha(THEME.colors.surface, 0.6),
            boxShadow: glow,
          }}
        />
        {/* 제목 띠 100~160 고정. 제목은 한 줄, 상태 글자는 부제 줄 오른쪽 끝 (C6 판정) */}
        <div
          style={{
            position: "relative",
            boxSizing: "border-box",
            height: 60,
            padding: "4px 14px",
            borderBottom: `1px solid ${THEME.colors.border}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 0,
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontFamily: THEME.fonts.sans,
              fontSize: THEME.sizes.pillarTitle,
              fontWeight: 700,
              lineHeight: 1.1,
              flexShrink: 0,
              color: status === "off" ? THEME.colors.textMuted : THEME.colors.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </span>
          {subtitle || showWords ? (
            <div style={{ display: "flex", alignItems: "baseline", columnGap: 10, lineHeight: 1.2 }}>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontFamily: THEME.fonts.mono,
                  fontSize: THEME.sizes.pillarSubtitle,
                  color: THEME.colors.textMuted,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {subtitle ?? ""}
              </span>
              {showWords ? (
                <span
                  style={{
                    flexShrink: 0,
                    textAlign: "right",
                    whiteSpace: "nowrap",
                    fontFamily: THEME.fonts.mono,
                    fontSize: 14,
                    color: status === "off" ? THEME.colors.textMuted : border,
                  }}
                >
                  {statusText != null ? statusText : words ? `${words[0]} ${words[1]}` : null}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      {children ? (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: v * dimLevel * bodyAlpha }}>{children}</div>
      ) : null}
    </>
  );
};
