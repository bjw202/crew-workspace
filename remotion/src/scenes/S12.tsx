// 03 장면 12 — 껐다 켜도, 이어 붙기(resume) (16초 · 절대 8100~8579)
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { ChatPane } from "../lib/ChatPane";
import { ContextBar } from "../lib/ContextBar";
import { Envelope } from "../lib/Envelope";
import { FileCard } from "../lib/FileCard";
import { FolderBox } from "../lib/FolderBox";
import { FolderTree } from "../lib/FolderTree";
import { Label } from "../lib/Label";
import { Mover } from "../lib/Mover";
import { PillarStatus } from "../lib/Pillar";
import { Spotlight } from "../lib/Spotlight";
import { STAGE } from "../lib/stage";
import { Stage } from "../lib/StageView";
import { ENVELOPE_12, SECTIONS_11, TERM_12, WAKE_11 } from "../lib/text";
import { THEME } from "../lib/theme";

export const DURATION = 480;
export const STILLS = [0, 260, 440];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const POST = {
  from: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_TOP_Y },
  to: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_TOP_Y },
};

// ── 서버 창 ───────────────────────────────────────────────────
const TERM_BOX = { x: STAGE.SERVER.x, y: 200, width: 800, height: 170 }; // 03 S12 비트 0~60
const TERM_TREE = { x: 580, y: 140, width: 760 }; // 03 S12 비트 0~60
const TERM_FROM = [10, 25, 130, 160, 300];

// 03 은 release · bootResume 이름표를 (960,200) 에 둔다. 서버 창(115~285) 글자와 겹쳐 창 아래로 내렸다
const SERVER_NOTE_Y = STAGE.SERVER_KICK_Y[1]; // 390
const DB_NOTE = { x: STAGE.COCKPIT_DB.x, y: 600 }; // 03 S12 비트 60~130 · 170~300 · 440~479
const CHIP_FROM = { x: STAGE.SERVER.x, y: 300, scale: 0.7 }; // 03 S12 비트 170~300
const EIGHT_TO = { x: STAGE.CLI.x, y: 260 }; // 03 S12 비트 300~360
const PENDING_Y = STAGE.SERVER_KICK_Y[0]; // 360

// 장면 11 끝의 CLI 속 (13px): 깨어남 두 줄 + 여덟 절
const WAKE_SPLIT = WAKE_11.indexOf(" 앞 문맥");
const S11_TREE = [
  { text: WAKE_11.slice(0, WAKE_SPLIT), mono: false, lit: true },
  { text: WAKE_11.slice(WAKE_SPLIT + 1), mono: false, lit: true },
  ...SECTIONS_11.map((text) => ({ text })),
];

const LINE4 = "@TO(prodev-수율개선-bot) 라인 4 자료도 있어요";
const MEETING = "@TO(prodev-수율개선-bot) 내일 회의 전에 봐 주세요";

const cliStatus = (f: number): PillarStatus =>
  f >= 450 ? "working" : f >= 310 ? "idle" : f >= 250 ? "starting" : f >= 60 ? "off" : "idle";
// cockpit/web/cockpit.js:11 의 이름
const PANEL_WORDS: Record<PillarStatus, string> = {
  off: "꺼짐",
  on: "대기",
  starting: "켜는 중",
  idle: "대기",
  working: "일하는 중",
  waiting: "승인 대기",
};
const cliSubtitle = (f: number) =>
  // C12 판정: `session_id` 를 빼고 짧게 (상태 글자에 밀려 잘리지 않게)
  f >= 250 ? "프로세스 2 · abc…" : f >= 60 ? "(봇 · 꺼짐)" : "cwd bots/prodev-수율개선-bot";

const bundle = (startFrame: number) => (
  <Envelope
    x={0}
    y={0}
    width={STAGE.ENVELOPE_WIDE.width}
    fontSize={16}
    text={ENVELOPE_12}
    startFrame={startFrame}
    framesPerLine={6}
  />
);

export const S12: React.FC = () => {
  const frame = useCurrentFrame();
  const status = cliStatus(frame);

  return (
    <AbsoluteFill>
      <Stage
        browser={{
          status: "on",
          children: (
            <ChatPane
              box={STAGE.BROWSER}
              viewer="김피엘"
              sidebar={{ rooms: [{ name: "# prodev-수율개선", from: -8 }] }}
              chip={{ name: "prodev-수율개선-bot", online: frame < 60 || frame >= 310, from: -8 }}
              messages={[
                { kind: "system", body: "문맥을 정리 중입니다. 곧 이어서 합니다.", from: -8 },
                { kind: "system", body: "정리가 끝났습니다. 이어서 하려면 말을 걸어 주세요.", from: -8 },
                { author: "김피엘", body: "@TO(prodev-수율개선-bot) 어디까지 했지?", kind: "user", from: -8 },
                {
                  author: "prodev-수율개선-bot",
                  badge: "BOT",
                  body: "이어서 합니다 — E-0001 확정까지 마쳤습니다. 다음 한 걸음은 wiki/수율.md 갱신입니다.",
                  kind: "bot",
                  from: -8,
                },
                { author: "김과제", body: LINE4, kind: "user", from: 180 },
                { author: "김과제", body: MEETING, kind: "user", from: 225 },
              ]}
              input={{}}
              panel={{ stateText: PANEL_WORDS[status], contextPct: 0.12, buttons: ["압축"] }}
            />
          ),
        }}
        server={{ status: frame >= 90 && frame < 160 ? "off" : "on" }}
        cli={{ status, subtitle: cliSubtitle(frame) }}
        botsBox={{}}
        botFolder={{}}
        rootCards
        prodev={{ glowFrom: 100, glowUntil: 130 }}
        project={{ glowFrom: 100, glowUntil: 130 }}
        anchor={interpolate(frame, [60, 90], [1, 0], clamp)}
        chatDb={{
          rows: [{ text: "rooms" }, { text: "messages" }, { text: "message_targets" }, { text: "bots" }],
          chips: [{ row: "messages", text: "#15 bot", from: -8 }],
        }}
        cockpitDb={{
          rows: [{ text: "bot_inbox (편지함)" }, { text: "agent_sessions" }, { text: "permission_requests" }],
          chips: [
            { row: "agent_sessions", text: "idle", from: -8 },
            { row: "bot_inbox", text: "#16 미배달", from: 200, until: 445 },
            { row: "bot_inbox", text: "#17 미배달", from: 245, until: 445 },
            { row: "bot_inbox", text: "#16 delivered", from: 445 },
            { row: "bot_inbox", text: "#17 delivered", from: 445 },
          ],
        }}
      >
        {/* 장면 11 끝에서 이어지는 바닥 */}
        <FolderTree
          x={STAGE.BOT_TREE.x}
          y={STAGE.BOT_TREE.y}
          width={STAGE.BOT_TREE.width}
          fontSize={13}
          lines={[{ text: ".claude/" }, { text: "settings.json", depth: 1 }, { text: "settings.local.json", depth: 1 }]}
        />
        <FolderTree
          x={STAGE.PROJECT_TREE.x}
          y={STAGE.PROJECT_TREE.y}
          width={STAGE.PROJECT_TREE.width}
          fontSize={14}
          lines={[
            { text: "inbox/2026-09-15-라인3/" },
            { text: "yield.csv  🔒 0444", depth: 1 },
            { text: "files.md  (SHA-256)", depth: 1 },
            { text: "cards/E-0001.md  status: valid" },
            { text: "index.md · index.json  (index.js)" },
          ]}
        />
        <Label x={STAGE.MCP_BOX.x} y={STAGE.MCP_BOX.y} text="MCP 도구 cockpit · src/mcp/tools.js" tone="server" size={16} />

        {/* CLI 속: 장면 11 끝의 문맥은 프로세스와 함께 60~90 에 걷히고, 310 부터 새로 싣는다 */}
        {frame < 90 ? (
          <FolderTree
            x={STAGE.CLI_TREE.x}
            y={STAGE.CLI_TREE.y}
            width={STAGE.CLI_TREE.width}
            fontSize={13}
            tone="cli"
            opacity={interpolate(frame, [60, 90], [1, 0], clamp)}
            lines={S11_TREE}
          />
        ) : null}
        <FolderTree
          x={STAGE.CLI_TREE.x}
          y={STAGE.CLI_TREE.y}
          width={STAGE.CLI_TREE.width}
          fontSize={14}
          tone="cli"
          lines={[
            { text: "SessionStart (resume) ·", from: 310, lit: true },
            { text: "session-start.js", depth: 1, from: 310, lit: true },
            { text: "여덟 절 (1 handoff … 8 house.md)", depth: 1, from: 340 },
          ]}
        />

        {/* 끄기 */}
        <Label x={STAGE.SERVER.x} y={SERVER_NOTE_Y} text="release" size={16} from={40} until={100} />
        <Label
          x={DB_NOTE.x}
          y={DB_NOTE.y}
          text="session_id = abc… · state idle (남음)"
          size={13}
          tone="server"
          from={100}
          until={250}
        />

        {/* 다시 켜기: bootResume → resume 칩 → CLI starting */}
        <Label x={STAGE.SERVER.x} y={SERVER_NOTE_Y} text="bootResume" size={16} from={170} />
        <Arrow
          from={{ x: STAGE.SERVER.x, y: SERVER_NOTE_Y + 15 }}
          to={{ x: STAGE.COCKPIT_DB.x, y: STAGE.COCKPIT_DB.y - STAGE.COCKPIT_DB.height / 2 - 2 }}
          route="orthogonal"
          bend="vh"
          dashed
          label="stopped 가 아닌 줄"
          labelSize={13}
          color={THEME.colors.server}
          startFrame={180}
          durationInFrames={20}
        />
        <Mover
          from={CHIP_FROM}
          to={{ x: STAGE.CLI_INPUT_SLOT.x, y: STAGE.CLI_INPUT_SLOT.y, scale: 0.7 }}
          startFrame={210}
          durationInFrames={40}
          holdAfter={false}
        >
          <FileCard x={0} y={0} name="resume: abc…" tone="server" width={180} height={32} />
        </Mover>

        {/* 그 사이 온 글 둘: 편지함에 미배달 */}
        {frame < 225 ? (
          <Arrow
            from={POST.from}
            to={POST.to}
            label="POST /api/rooms/:id/messages"
            labelSize={14}
            color={THEME.colors.human}
            startFrame={180}
            durationInFrames={20}
          />
        ) : (
          <Arrow
            from={POST.from}
            to={POST.to}
            label="POST /api/rooms/:id/messages"
            labelSize={14}
            color={THEME.colors.human}
            startFrame={225}
            durationInFrames={20}
          />
        )}
        <Label
          x={DB_NOTE.x}
          y={DB_NOTE.y}
          text="starting — 아직 배달하지 않는다"
          size={13}
          tone="server"
          from={250}
          until={330}
        />

        {/* 여덟 절 다시 싣기 */}
        <Mover
          from={{ x: STAGE.PROJECT.x, y: STAGE.PROJECT.y }}
          to={EIGHT_TO}
          startFrame={315}
          durationInFrames={30}
          holdAfter={false}
        >
          <FileCard x={0} y={0} name="여덟 절" tone="file" width={140} height={32} />
        </Mover>

        {/* 밀린 글 둘 → 한 겉봉투 묶음 */}
        <Label x={STAGE.SERVER.x} y={PENDING_Y} text="pendingInbox (BATCH_LIMIT 20)" size={14} from={360} />
        <Label x={DB_NOTE.x} y={DB_NOTE.y} text="session_id abc… (같음)" size={13} tone="cli" from={440} />
      </Stage>

      {/* 장면 11 끝의 문맥 막대 (12%) */}
      <ContextBar box={STAGE.CONTEXT_BAR} pct={0.12} label="문맥 12%" />

      {/* 서버 창: 0~340 위에 떠 있다 */}
      {frame < 340 ? (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(frame, [330, 340], [1, 0], clamp) }}>
          {/* 03 "상자 배경만": FolderBox 배경이 반투명이라 아래 서버 기둥 글자가 비치지 않게 불투명 바탕을 깐다 */}
          <div
            style={{
              position: "absolute",
              left: TERM_BOX.x - TERM_BOX.width / 2,
              top: TERM_BOX.y - TERM_BOX.height / 2,
              width: TERM_BOX.width,
              height: TERM_BOX.height,
              borderRadius: THEME.radius,
              backgroundColor: THEME.colors.background,
            }}
          />
          <FolderBox box={TERM_BOX} title="서버 창" tone="server" enterFrame={0} />
          <FolderTree
            x={TERM_TREE.x}
            y={TERM_TREE.y}
            width={TERM_TREE.width}
            fontSize={18}
            lineHeight={1.6} // 03 은 기본 1.7. 다섯째 줄이 상자 아래 변(285)을 넘어 줄였다
            lines={TERM_12.map((text, i) => ({ text, from: TERM_FROM[i] }))}
          />
        </div>
      ) : null}

      <Spotlight rects={[]} opacity={0.6} from={370} until={420} />
      {frame < 420 ? (
        <div style={{ position: "absolute", left: STAGE.ENVELOPE_WIDE.x, top: STAGE.ENVELOPE_WIDE.y }}>
          {bundle(370)}
        </div>
      ) : null}
      {/* 묶음이 CLI 입력 자리에 닿으면 흐려진다 (S06 판정과 같은 규칙) */}
      {frame < 470 ? (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(frame, [450, 470], [1, 0], clamp) }}>
          <Mover
            from={{ x: STAGE.ENVELOPE_WIDE.x, y: STAGE.ENVELOPE_WIDE.y, scale: 1 }}
            to={{ x: STAGE.CLI_INPUT_SLOT.x, y: STAGE.CLI_INPUT_SLOT.y, scale: 0.25 }}
            startFrame={420}
            durationInFrames={25}
          >
            {bundle(0)}
          </Mover>
        </div>
      ) : null}

      <Caption text="프로세스는 바뀌어도 대화 번호는 같다." from={40} durationInFrames={190} />
      <Caption text="꺼진 동안 온 글은 편지함에 남았다가 켜지면 들어간다." from={250} durationInFrames={220} />
    </AbsoluteFill>
  );
};
