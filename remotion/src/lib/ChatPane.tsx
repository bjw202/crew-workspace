import { useCurrentFrame } from "remotion";
import { typed, visible } from "./anim";
import { ApprovalCard, ApprovalCardProps } from "./ApprovalCard";
import type { Box } from "./stage";
import { THEME, withAlpha } from "./theme";

export type ChatMessage = {
  author?: string;
  badge?: "BOT";
  body: string;
  kind: "user" | "bot" | "system";
  attach?: string;
  from: number;
};

export type ChatInput = {
  placeholder?: string;
  text?: string;
  typeFrom?: number;
  typeUntil?: number;
  autocomplete?: { items: string[]; from: number; until: number; pickAt: number };
  afterPick?: string;
  typeMoreFrom?: number;
  typeMoreUntil?: number;
  textFinal?: string;
  attach?: string;
  sendAt?: number;
};

export type ChatPaneProps = {
  /** = STAGE.BROWSER */
  box: Box;
  viewer: string;
  sidebar?: { rooms: { name: string; from: number }[]; plusPressAt?: number };
  dialog?: { label: string; text: string; from: number; typeUntil: number; until: number };
  chip?: { name: string; online: boolean; from?: number; workingFrom?: number; workingUntil?: number };
  messages: ChatMessage[];
  input?: ChatInput;
  panel?: { stateText?: string; stateFrom?: number; buttons?: string[]; pressAt?: number; contextPct?: number };
  card?: ApprovalCardProps;
};

// cockpit/web/glue.js:7 HINT_NO_BOT
const HINT = "봇에게 가지 않습니다 — 부르려면 @";
const PRESS = 14;

/** 입력칸의 지금 글자 (타자 · 자동완성 고르기 · 이어 치기 · 보내기) */
const inputText = (input: ChatInput, frame: number) => {
  const final = input.textFinal ?? "";
  const base = input.text ?? (input.afterPick != null ? "" : final);
  let cur = "";
  if (input.typeFrom != null && frame >= input.typeFrom) {
    cur = input.typeUntil != null ? typed(base, frame, input.typeFrom, input.typeUntil) : base;
  }
  if (input.autocomplete && input.afterPick != null && frame >= input.autocomplete.pickAt) {
    cur = input.afterPick;
  }
  if (input.typeMoreFrom != null && input.afterPick != null && frame >= input.typeMoreFrom) {
    cur =
      input.afterPick +
      typed(final.slice(input.afterPick.length), frame, input.typeMoreFrom, input.typeMoreUntil ?? input.typeMoreFrom);
  }
  if (input.sendAt != null && frame >= input.sendAt) cur = "";
  return cur;
};

/**
 * 브라우저 기둥 속 전부. 기둥 제목 띠(100~160) 아래 속(170~590)에 놓는다:
 * 사이드바 줄 170~200 · 봇 칩 200~226 · 글 목록 226~468 · 입력칸 470~518 · 조종석 판 522~592.
 */
export const ChatPane: React.FC<ChatPaneProps> = ({
  box,
  viewer,
  sidebar,
  dialog,
  chip,
  messages,
  input,
  panel,
  card,
}) => {
  const frame = useCurrentFrame();
  const left = box.x - box.width / 2 + 12;
  const width = box.width - 24;
  const bottom = box.y + box.height / 2;
  const top = box.y - box.height / 2 + 70;

  const human = THEME.colors.human;
  const cli = THEME.colors.cli;
  const sans = THEME.fonts.sans;
  const mono = THEME.fonts.mono;

  const plusOn = sidebar?.plusPressAt != null && frame >= sidebar.plusPressAt && frame < sidebar.plusPressAt + PRESS;
  const cur = input ? inputText(input, frame) : "";
  const sent = input?.sendAt != null && frame >= input.sendAt;
  const typing = input?.typeFrom != null && frame >= input.typeFrom && !sent;
  const ac = input?.autocomplete;
  const acV = ac ? visible(frame, ac.from, ac.until, 4) : 0;
  const shownMessages = messages.filter((m) => frame >= m.from).sort((a, b) => a.from - b.from);
  const chipV = chip ? visible(frame, chip.from) : 0;
  const working =
    chip?.workingFrom != null && frame >= chip.workingFrom && (chip.workingUntil == null || frame < chip.workingUntil);
  const dialogV = dialog ? visible(frame, dialog.from, dialog.until) : 0;
  const panelPressOn = panel?.pressAt != null && frame >= panel.pressAt && frame < panel.pressAt + PRESS;
  const stateV = panel?.stateText == null ? 0 : visible(frame, panel.stateFrom);

  return (
    <>
      {/* 사이드바 줄 */}
      <div
        style={{
          position: "absolute",
          left,
          top,
          width,
          height: 30,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: sans,
          fontSize: 14,
          color: THEME.colors.textMuted,
          whiteSpace: "nowrap",
        }}
      >
        <span>방</span>
        <span
          style={{
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            border: `1px solid ${human}`,
            backgroundColor: plusOn ? human : "transparent",
            color: plusOn ? THEME.colors.background : human,
            fontWeight: 700,
          }}
        >
          +
        </span>
        {sidebar?.rooms.map((r) => (
          <span key={r.name} style={{ opacity: visible(frame, r.from), color: THEME.colors.text, fontFamily: mono, fontSize: 13 }}>
            {r.name}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12 }}>{viewer}</span>
      </div>

      {/* 봇 칩 */}
      {chip && chipV > 0 ? (
        <div
          style={{
            position: "absolute",
            left,
            top: top + 30,
            height: 26,
            display: "flex",
            alignItems: "center",
            gap: 6,
            opacity: chipV,
            fontFamily: mono,
            fontSize: 13,
            color: chip.online ? cli : THEME.colors.textMuted,
            whiteSpace: "nowrap",
          }}
        >
          <span>{chip.online ? "🟢" : "⚪"}</span>
          <span>{chip.name}</span>
          {working ? <span style={{ fontFamily: sans, color: THEME.colors.textMuted }}>(입력 중…)</span> : null}
        </div>
      ) : null}

      {/* 글 목록 — 맨 아래 정렬, 넘치면 위가 밀린다 */}
      <div
        style={{
          position: "absolute",
          left,
          top: top + 56,
          width,
          height: bottom - 132 - (top + 56),
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 7,
        }}
      >
        {shownMessages.map((m, i) => {
          const v = visible(frame, m.from);
          if (m.kind === "system") {
            return (
              <div
                key={i}
                style={{
                  opacity: v,
                  fontFamily: sans,
                  fontSize: THEME.sizes.chatSmall,
                  color: THEME.colors.textMuted,
                  borderLeft: `2px solid ${THEME.colors.off}`,
                  paddingLeft: 8,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  flexShrink: 0,
                }}
              >
                {m.body}
              </div>
            );
          }
          const who = m.kind === "bot" ? cli : human;
          return (
            <div key={i} style={{ opacity: v, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: sans, fontSize: 12, fontWeight: 700, color: who }}>
                <span>{m.author}</span>
                {m.badge ? (
                  <span style={{ fontSize: 10, padding: "0 4px", borderRadius: 3, border: `1px solid ${cli}` }}>{m.badge}</span>
                ) : null}
              </div>
              {m.attach ? (
                <div style={{ fontFamily: mono, fontSize: 12, color: THEME.colors.file }}>📎 {m.attach}</div>
              ) : null}
              <div
                style={{
                  fontFamily: sans,
                  fontSize: THEME.sizes.chat,
                  lineHeight: 1.35,
                  color: THEME.colors.text,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {m.body}
              </div>
            </div>
          );
        })}
      </div>

      {/* 새 방 대화 상자 */}
      {dialog && dialogV > 0 ? (
        <div
          style={{
            position: "absolute",
            left: left + 20,
            top: top + 90,
            width: width - 40,
            boxSizing: "border-box",
            opacity: dialogV,
            padding: "10px 12px",
            borderRadius: THEME.radiusSmall,
            border: `2px solid ${human}`,
            backgroundColor: THEME.colors.surfaceRaised,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span style={{ fontFamily: sans, fontSize: 13, color: THEME.colors.textMuted }}>{dialog.label}</span>
          <span
            style={{
              fontFamily: sans,
              fontSize: 16,
              color: THEME.colors.text,
              padding: "4px 8px",
              borderRadius: 4,
              border: `1px solid ${THEME.colors.border}`,
              minHeight: 22,
            }}
          >
            {typed(dialog.text, frame, dialog.from, dialog.typeUntil)}
          </span>
        </div>
      ) : null}

      {/* 자동완성 */}
      {ac && acV > 0 ? (
        <div
          style={{
            position: "absolute",
            left,
            top: bottom - 130 - 6 - ac.items.length * 26,
            width,
            boxSizing: "border-box",
            opacity: acV,
            borderRadius: 6,
            border: `1px solid ${THEME.colors.border}`,
            backgroundColor: THEME.colors.surfaceRaised,
            overflow: "hidden",
          }}
        >
          {ac.items.map((item, k) => (
            <div
              key={item}
              style={{
                height: 26,
                display: "flex",
                alignItems: "center",
                padding: "0 10px",
                fontFamily: mono,
                fontSize: 13,
                color: k === 0 ? human : THEME.colors.text,
                backgroundColor: k === 0 ? withAlpha(human, 0.18) : undefined,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      ) : null}

      {/* 입력칸 */}
      {input ? (
        <div
          style={{
            position: "absolute",
            left,
            top: bottom - 130,
            width,
            height: 48,
            boxSizing: "border-box",
            padding: "0 10px",
            borderRadius: THEME.radiusSmall,
            border: `1px solid ${typing ? human : THEME.colors.border}`,
            backgroundColor: THEME.colors.surfaceRaised,
            display: "flex",
            alignItems: "center",
            gap: 6,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {input.attach && !sent && input.typeFrom != null && frame >= input.typeFrom ? (
            <span style={{ fontFamily: mono, fontSize: 12, color: THEME.colors.file }}>📎 {input.attach}</span>
          ) : null}
          {cur === "" ? (
            <span style={{ fontFamily: sans, fontSize: 13, color: THEME.colors.textMuted }}>{input.placeholder ?? HINT}</span>
          ) : (
            <span
              style={{
                fontFamily: sans,
                fontSize: 14,
                color: THEME.colors.text,
                overflow: "hidden",
                textOverflow: "ellipsis",
                direction: "rtl",
                textAlign: "left",
              }}
            >
              {/* 긴 글은 끝이 보이게 */}
              <bdi>{cur}</bdi>
              {typing && Math.floor(frame / 8) % 2 === 0 ? <span style={{ color: human }}>|</span> : null}
            </span>
          )}
        </div>
      ) : null}

      {/* 조종석 판 */}
      {panel ? (
        <div
          style={{
            position: "absolute",
            left,
            top: bottom - 78,
            width,
            height: 70,
            boxSizing: "border-box",
            padding: "6px 10px",
            borderRadius: THEME.radiusSmall,
            border: `1px solid ${THEME.colors.border}`,
            backgroundColor: withAlpha(THEME.colors.surfaceRaised, 0.8),
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: sans, fontSize: 13, color: THEME.colors.textMuted }}>
            <span>조종석</span>
            {panel.stateText != null ? (
              <span style={{ opacity: stateV, color: THEME.colors.text }}>상태: {panel.stateText}</span>
            ) : null}
            {panel.contextPct != null ? (
              <span style={{ marginLeft: "auto", fontFamily: mono }}>문맥 {Math.round(panel.contextPct * 100)}%</span>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(panel.buttons ?? []).map((b, k) => {
              const on = panelPressOn && k === 0;
              return (
                <span
                  key={b}
                  style={{
                    fontFamily: sans,
                    fontSize: 13,
                    padding: "2px 10px",
                    borderRadius: 6,
                    border: `1px solid ${human}`,
                    backgroundColor: on ? human : "transparent",
                    color: on ? THEME.colors.background : human,
                  }}
                >
                  {b}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      {card ? <ApprovalCard {...card} /> : null}
    </>
  );
};
