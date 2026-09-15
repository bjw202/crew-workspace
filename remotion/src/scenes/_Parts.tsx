import { AbsoluteFill, Sequence } from "remotion";
import { AnchorLine } from "../lib/AnchorLine";
import { ApprovalCard } from "../lib/ApprovalCard";
import { Arrow } from "../lib/Arrow";
import { ChatPane } from "../lib/ChatPane";
import { ContextBar } from "../lib/ContextBar";
import { Cylinder } from "../lib/Cylinder";
import { Envelope } from "../lib/Envelope";
import { FileCard } from "../lib/FileCard";
import { FolderBox } from "../lib/FolderBox";
import { FolderTree } from "../lib/FolderTree";
import { Label } from "../lib/Label";
import { Mover } from "../lib/Mover";
import { Pillar } from "../lib/Pillar";
import { Spotlight } from "../lib/Spotlight";
import { Stage } from "../lib/StageView";
import { STAGE } from "../lib/stage";
import { ENVELOPE_6, ENVELOPE_8, LAYERS_10, SEVEN_A, TICKS_9 } from "../lib/text";
import { THEME } from "../lib/theme";
import { Timeline } from "../lib/Timeline";

// 부품 확인용 장면. 영상에는 들어가지 않는다.
// 구간: 0~89 부품 A · 90~179 부품 B · 180~239 무대 전경 · 240~299 무대 floor · 300~379 전경→floor 교차 페이드
export const PARTS_DURATION = 380;
export const PARTS_STILLS = { partsA: 60, partsB: 150, overview: 200, floor: 260, transition: 325 };

const PartsA: React.FC = () => (
  <AbsoluteFill>
    <Label x={220} y={60} text="Label · mono · tone server · glow" tone="server" glowFrom={0} />
    <Label x={220} y={110} text="✗ deny: Edit(…/common/hooks/**)" warn size={14} />
    <Label x={40} y={330} text="sdk-query.js" tone="server" vertical size={15} />

    <Pillar box={{ x: 200, y: 340, width: 200, height: 260 }} title="CLI" subtitle="cwd bots/…" tone="cli" status="working" />
    <Pillar box={{ x: 420, y: 340, width: 200, height: 260 }} title="CLI" subtitle="승인" tone="cli" status="waiting" />
    <Pillar box={{ x: 640, y: 340, width: 200, height: 260 }} title="CLI" subtitle="(봇)" tone="cli" status="off" />
    <Pillar box={{ x: 860, y: 340, width: 200, height: 260 }} title="CLI" subtitle="켜는 중" tone="cli" status="starting" />
    <Pillar box={{ x: 1080, y: 340, width: 150, height: 260 }} title="도우미" subtitle="data-reader · opus" tone="cli" status="working" />

    <Cylinder
      box={{ x: 1400, y: 150, width: 170, height: 120 }}
      name="chat.db"
      tone="server"
      rows={[
        { text: "rooms", from: 0 },
        { text: "messages", from: 5, highlightFrom: 0 },
        { text: "message_targets", from: 10 },
        { text: "bots", from: 15 },
      ]}
      chips={[
        { row: "messages", text: "#7", from: 10 },
        { row: "messages", text: "#8 bot", from: 20 },
        { row: "messages", text: "#9", from: 30 },
        { row: "messages", text: "#10 📎", from: 40 },
        { row: "rooms", text: "prodev-수율개선", from: 20 },
      ]}
    />

    <FolderBox box={{ x: 1600, y: 420, width: 520, height: 220 }} title="projects/수율개선/" subtitle="FolderBox" tone="file" glowFrom={0}>
      <FolderTree
        x={1360}
        y={340}
        width={480}
        fontSize={15}
        lines={[
          { text: "inbox/2026-09-15-라인3/", from: 0 },
          { text: "yield.csv  0444", depth: 1, from: 5, lock: true },
          { text: "cards/E-0001.md  status: draft", from: 10, until: 40 },
          { text: "cards/E-0001.md  status: valid", from: 40, lit: true },
          { text: "→ 굳히지 않는다 (파일 없음)", depth: 1, from: 15, warn: true },
          { text: "house.md", from: 20, number: "⑥", lit: 0.5 },
        ]}
      />
    </FolderBox>

    <FileCard x={1250} y={640} name="yield.csv" tone="file" lock badge="0444" number="①" lit />
    <FileCard x={1520} y={640} name="cards/E-0001.md" sub="실험 한 건 = 카드 한 장" tone="file" width={260} height={56} />

    <Mover from={{ x: 1100, y: 760, scale: 0.6, opacity: 0.3 }} to={{ x: 1700, y: 760, scale: 1 }} startFrame={0} durationInFrames={90}>
      <FileCard x={0} y={0} name="Mover · settings.json" tone="cli" width={240} />
    </Mover>

    <AnchorLine
      points={[
        { x: 120, y: 620 },
        { x: 120, y: 680 },
        { x: 700, y: 680 },
        { x: 700, y: 820 },
      ]}
      progress={1}
      climb={{
        points: [
          { x: 700, y: 820 },
          { x: 900, y: 820 },
          { x: 900, y: 640 },
        ],
        progress: 0.6,
      }}
    />
    <Label x={420} y={860} text="AnchorLine · climb 0.6" tone="cli" size={14} />

    <Spotlight rects={[{ x: 1250, y: 640, width: 240, height: 80 }, { x: 60, y: 900, width: 700, height: 150, corner: true }]} opacity={0.35} />
    <Label x={410} y={975} text="Spotlight 구멍 둘 (opacity 0.35)" size={16} />
  </AbsoluteFill>
);

const PartsB: React.FC = () => (
  <AbsoluteFill>
    <Envelope
      x={40}
      y={40}
      width={900}
      text={ENVELOPE_8}
      fontSize={18}
      startFrame={0}
      framesPerLine={6}
      highlightLines={[3]}
      title="Envelope — wrapChannel · src/envelope/wrap.js:62-68"
    />
    <Envelope x={40} y={440} width={600} text={ENVELOPE_6} fontSize={14} compact />

    <Pillar box={{ x: 1200, y: 350, width: 360, height: 500 }} title="브라우저" subtitle="web/app.js" tone="human" status="on">
      <ChatPane
        box={{ x: 1200, y: 350, width: 360, height: 500 }}
        viewer="김피엘"
        sidebar={{ rooms: [{ name: "# prodev-수율개선", from: 0 }] }}
        chip={{ name: "prodev-수율개선-bot", online: true, from: 0, workingFrom: 0 }}
        messages={[
          { author: "김과제", attach: "yield.csv", body: "어제 라인 3 자료입니다", kind: "user", from: 0 },
          { author: "김피엘", body: "@TO(prodev-수율개선-bot) 안녕하세요", kind: "user", from: 5 },
          { author: "prodev-수율개선-bot", badge: "BOT", body: "이어서 합니다 — prodev-수율개선 방입니다. 붙들고 있는 실은 없습니다.", kind: "bot", from: 10 },
          { kind: "system", body: "🔒 Bash 요청 · curl --version", from: 15 },
        ]}
        input={{
          typeFrom: 10,
          text: "@",
          autocomplete: { items: ["TO prodev-수율개선-bot"], from: 20, until: 80, pickAt: 80 },
          afterPick: "@TO(prodev-수율개선-bot) ",
          textFinal: "@TO(prodev-수율개선-bot) 안녕하세요",
        }}
        panel={{ stateText: "승인 대기", buttons: ["켜기", "압축"], pressAt: 55, contextPct: 0.55 }}
      />
    </Pillar>

    <ApprovalCard
      x={1440}
      y={120}
      width={340}
      request={{ project: "수율개선", tool: "Bash", heading: "Bash", input: '{"command":"curl --version"}' }}
      buttons={["허용", "이번 세션 허용", "거부"]}
      enterFrame={0}
      pressAt={50}
      pressed="허용"
    />

    <ContextBar box={{ x: 1860, y: 700, width: 36, height: 300 }} pct={0.92} label="문맥 92%" />

    <Timeline
      x={80}
      yTop={640}
      yBottom={1040}
      ticks={TICKS_9.map((label, i) => ({ label, y: 660 + i * 70, from: 0 }))}
      markerY={800}
      labelWidth={1500}
    />
  </AbsoluteFill>
);

const overviewProps = {
  browser: {
    status: "on" as const,
    children: (
      <ChatPane
        box={STAGE.BROWSER}
        viewer="김피엘"
        sidebar={{ rooms: [{ name: "# prodev-수율개선", from: 0 }] }}
        chip={{ name: "prodev-수율개선-bot", online: true }}
        messages={[
          { author: "김피엘", body: "@TO(prodev-수율개선-bot) 안녕하세요", kind: "user" as const, from: 0 },
          { author: "prodev-수율개선-bot", badge: "BOT" as const, body: "이어서 합니다 — prodev-수율개선 방입니다.", kind: "bot" as const, from: 0 },
        ]}
        input={{}}
        panel={{ stateText: "대기", buttons: ["켜기", "압축"], contextPct: 0.55 }}
      />
    ),
  },
  server: { status: "on" as const },
  cli: { status: "on" as const, subtitle: "cwd bots/prodev-수율개선-bot" },
  chatDb: {
    rows: [{ text: "rooms" }, { text: "messages" }, { text: "message_targets" }, { text: "bots" }],
  },
  cockpitDb: {
    rows: [{ text: "bot_inbox (편지함)" }, { text: "agent_sessions" }, { text: "permission_requests" }],
  },
  prodev: {},
  project: {},
  botsBox: {},
  botFolder: {},
  rootCards: true,
  anchor: 1,
};

const OverviewExtras: React.FC = () => (
  <>
    <Label x={STAGE.MCP_BOX.x} y={STAGE.MCP_BOX.y} text="MCP 도구 cockpit · src/mcp/tools.js" tone="server" size={16} />
    <Arrow
      from={{ x: STAGE.GAP_L.from.x, y: STAGE.ARROW_TOP_Y }}
      to={{ x: STAGE.GAP_L.to.x, y: STAGE.ARROW_TOP_Y }}
      label="POST /api/*"
      color={THEME.colors.human}
      progress={1}
    />
    <Arrow
      from={{ x: STAGE.GAP_L.to.x, y: STAGE.ARROW_SSE_Y }}
      to={{ x: STAGE.GAP_L.from.x, y: STAGE.ARROW_SSE_Y }}
      label="SSE /api/stream"
      labelOffset={{ x: 0, y: 28 }}
      dashed
      color={THEME.colors.server}
      progress={1}
    />
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
      fontSize={15}
      lines={[
        { text: "cards/ · wiki/ · inbox/ · journal/ · threads/ · research/" },
        { text: "patent/ · paper/ · report/ · tmp/ · analysis/ · templates/" },
        { text: "house.md  (골격 · 상한 50줄)" },
        { text: ".git  (git init)" },
      ]}
    />
  </>
);

const floorMini = {
  browser: { sub: "@TO(prodev-수율개선-bot) B 로트 수율 어디 있었지?" },
  server: {},
  cli: { sub: "find", lit: true },
};

const FloorExtras: React.FC = () => (
  <>
    <FolderTree
      x={STAGE.BIG_ROOT.x}
      y={STAGE.BIG_ROOT.y}
      width={STAGE.BIG_ROOT.width}
      fontSize={20}
      lines={SEVEN_A.map((text) => ({ text }))}
    />
    <FolderTree
      x={STAGE.BIG_BOT_TREE.x}
      y={STAGE.BIG_BOT_TREE.y}
      width={STAGE.BIG_BOT_TREE.width}
      fontSize={15}
      lines={[{ text: ".claude/settings.json · settings.local.json" }, { text: "find.log · handoff-compact.md" }]}
    />
    <FileCard x={1200} y={470} name="index.md · index.json" sub="index.js 가 만든다" tone="file" width={380} height={88} fontSize={18} />
    <FileCard x={1200} y={580} name="wiki/수율.md" sub="문장마다 카드 번호" tone="file" width={380} height={88} fontSize={18} />
    <FileCard x={1200} y={690} name="cards/E-0001.md" sub="실험 한 건 = 카드 한 장" tone="file" width={380} height={88} fontSize={18} lit />
    <FileCard x={1200} y={800} name="inbox/2026-09-15-라인3/" sub="yield.csv 🔒 · files.md" tone="file" width={380} height={88} fontSize={18} />
    <FolderTree
      x={STAGE.BIG_PROJECT_RIGHT.x}
      y={STAGE.BIG_PROJECT_RIGHT.y}
      width={STAGE.BIG_PROJECT_RIGHT.width}
      fontSize={18}
      lines={[{ text: "charter.md" }, { text: "schedule.md" }, { text: "journal/2026-09-14.md" }, { text: "house.md" }]}
    />
    <FolderTree
      x={1440}
      y={440}
      width={400}
      fontSize={17}
      lines={LAYERS_10.map((text, i) => ({ text, lit: i === 1, dim: i > 1 ? 0.4 : 1 }))}
    />
  </>
);

export const Parts: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: THEME.colors.background }}>
    <Sequence durationInFrames={90} name="부품 A">
      <PartsA />
    </Sequence>
    <Sequence from={90} durationInFrames={90} name="부품 B">
      <PartsB />
    </Sequence>
    <Sequence from={180} durationInFrames={60} name="무대 전경">
      <Stage {...overviewProps}>
        <OverviewExtras />
      </Stage>
    </Sequence>
    <Sequence from={240} durationInFrames={60} name="무대 floor">
      <Stage mode="floor" mini={floorMini} prodev={{ dim: 0.5 }}>
        <FloorExtras />
      </Stage>
    </Sequence>
    <Sequence from={300} durationInFrames={80} name="전경→floor">
      <Stage {...overviewProps} mini={floorMini} transition={{ to: "floor", from: 10, durationInFrames: 40 }} />
    </Sequence>
  </AbsoluteFill>
);
