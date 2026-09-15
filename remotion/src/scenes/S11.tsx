// 03 장면 11 — 압축, 문맥은 캐시 · 파일이 진실 (28초 · 절대 7260~8099)
// 0~40 floor → overview. 40 부터 카메라 OVERVIEW 라 Stage 밖의 화면 좌표 = 무대 좌표다.
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { ChatPane } from "../lib/ChatPane";
import { CodeBlock } from "../lib/CodeBlock";
import { ContextBar } from "../lib/ContextBar";
import { FileCard } from "../lib/FileCard";
import { FolderBox } from "../lib/FolderBox";
import { FolderTree } from "../lib/FolderTree";
import { Label } from "../lib/Label";
import { Mover } from "../lib/Mover";
import { Spotlight } from "../lib/Spotlight";
import { STAGE } from "../lib/stage";
import { Stage } from "../lib/StageView";
import { FINDLOG_10, HANDOFF_11, LAYERS_10, SECTIONS_11, WAKE_11 } from "../lib/text";
import { THEME } from "../lib/theme";

export const DURATION = 840;
export const STILLS = [0, 440, 700];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const TRANSITION = { to: "overview" as const, from: 0, durationInFrames: 40 };
const CHILD_SWITCH = TRANSITION.from + TRANSITION.durationInFrames / 2;

const POST = {
  from: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_TOP_Y },
  to: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_TOP_Y },
};
const SSE = {
  from: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_SSE_Y },
  to: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_SSE_Y },
};
const REPLY = {
  from: { x: STAGE.GAP_R.from.x, y: STAGE.ARROW_MID_Y },
  to: { x: STAGE.MCP_ARROW_TIP_X, y: STAGE.ARROW_MID_Y },
};

// ── 무대 좌표 (03 장면 11) ─────────────────────────────────────
const PENDING_Y = 200; // 03 S11 비트 120~170
const PUSH_Y = 400; // 03 S11 비트 170~200 (서버 속 칩 출발 · input.push 이름표)
const SUB_BOX = { x: 1260, y: 300, width: 340, height: 90 }; // 03 S11 비트 260~360 (claude -p 상자, C11 판정 ①: x 1300 → 1260 · 폭 240 → 340)
const CLI_OUT = { x: STAGE.CLI.x, y: 250 }; // 03 S11 비트 260~410 (CLI 에서 나가고 들어오는 자리)
const BOT_DROP = { x: STAGE.BOT_FOLDER.x, y: 840 }; // 03 S11 비트 360~440 (봇 폴더에 떨어지는 자리 · 절 [1] 출발)
const PROJECT_FROM = { x: STAGE.PROJECT.x, y: STAGE.PROJECT.y }; // 절 [2~8] 출발
const HANDOFF_BOX = { x: 560, y: 120, width: 700, fontSize: 18 }; // 03 S11 비트 360~440
const HANDOFF_HEIGHT = 2 + 43 + 12 + HANDOFF_11.split("\n").length * HANDOFF_BOX.fontSize * 1.6 + 14; // 03 S11 비트 360~440

// CLI 속 새 나무 (13px) — 슬롯 0 은 SessionStart(700 에 깨어남 두 줄로), 1 은 session-start.js 둘째 줄, 2~9 는 여덟 절
const NEW_TREE_SIZE = 13;
const NEW_TREE_LH = NEW_TREE_SIZE * 1.7;
const sectionY = (n: number) => STAGE.CLI_TREE.y + (n + 1.5) * NEW_TREE_LH; // n = 1..8 → 03 의 230 + 22·(n−1)
const SECTION_START = [570, 585, 600, 615, 630, 645, 660, 675];
const SECTION_CARDS = [
  "handoff-compact.md",
  "charter.md",
  "schedule.md",
  "threads/<실>.md",
  "journal/2026-09-14.md",
  "index.md",
  "마지막 일지",
  "house.md",
];
// 깨어남 한 줄(03 은 Label maxWidth 320 두 줄)은 CLI 나무 맨 위 두 슬롯에 같은 글자를 두 줄로 나눠 쓴다
const WAKE_SPLIT = WAKE_11.indexOf(" 앞 문맥");
const WAKE_LINES = [WAKE_11.slice(0, WAKE_SPLIT), WAKE_11.slice(WAKE_SPLIT + 1)];

const ASK = "@TO(prodev-수율개선-bot) 어디까지 했지?";

// ── 장면 10 끝 (floor 좌표, 0~30 에 걷힌다) ─────────────────────
const S10_LEFT_X = STAGE.BIG_PROJECT_LEFT.x + STAGE.BIG_PROJECT_LEFT.width / 2;
const S10_LAYERS = [
  { y: 800, name: "inbox/2026-09-15-라인3/", sub: "yield.csv 🔒 · files.md" }, // 03 S10 비트 60~250
  { y: 690, name: "cards/E-0001.md", sub: "실험 한 건 = 카드 한 장" }, // 03 S10 비트 60~250
  { y: 580, name: "wiki/수율.md", sub: "문장마다 카드 번호" }, // 03 S10 비트 60~250
  { y: 470, name: "index.md · index.json", sub: "index.js 가 만든다" }, // 03 S10 비트 60~250
];
const S10_MINI_BAND = { x: 0, y: STAGE.MINI.y - STAGE.MINI.height / 2, width: STAGE.W, height: STAGE.MINI.height, corner: true };
const S10_FINDLOG = FINDLOG_10.split("    ");

const pctAt = (f: number) =>
  f < 500 ? interpolate(f, [0, 110], [0.55, 0.92], clamp) : interpolate(f, [500, 550], [0.92, 0.12], clamp);

export const S11: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [0, 30], [1, 0], clamp);
  const pct = pctAt(frame);
  // C11 판정 ②: 서버가 /compact 를 넣을 때 working (cockpit/src/session/manager.js:302), 700 부터 idle
  const working = frame >= 200 && frame < 700;

  return (
    <AbsoluteFill>
      <Stage
        mode="overview"
        transition={TRANSITION}
        browser={{
          status: "on",
          children: (
            <ChatPane
              box={STAGE.BROWSER}
              viewer="김피엘"
              sidebar={{ rooms: [{ name: "# prodev-수율개선", from: -8 }] }}
              chip={{ name: "prodev-수율개선-bot", online: true, from: -8 }}
              messages={[
                { kind: "system", body: "문맥을 정리 중입니다. 곧 이어서 합니다.", from: 460 },
                { kind: "system", body: "정리가 끝났습니다. 이어서 하려면 말을 걸어 주세요.", from: 740 },
                { author: "김피엘", body: ASK, kind: "user", from: 820 },
                {
                  author: "prodev-수율개선-bot",
                  badge: "BOT",
                  body: "이어서 합니다 — E-0001 확정까지 마쳤습니다. 다음 한 걸음은 wiki/수율.md 갱신입니다.",
                  kind: "bot",
                  from: 830,
                },
              ]}
              input={{ textFinal: ASK, typeFrom: 770, typeUntil: 790, sendAt: 795 }}
              panel={{ stateText: working ? "일하는 중" : "대기", contextPct: pct, buttons: ["압축"], pressAt: 110 }}
            />
          ),
        }}
        server={{ status: "on" }}
        cli={{ status: working ? "working" : "idle", subtitle: "cwd bots/prodev-수율개선-bot" }}
        botsBox={{}}
        botFolder={{}}
        rootCards
        anchor={1}
        chatDb={{
          rows: [{ text: "rooms" }, { text: "messages" }, { text: "message_targets" }, { text: "bots" }],
          chips: [{ row: "messages", text: "#15 bot", from: -8 }],
        }}
        cockpitDb={{
          rows: [{ text: "bot_inbox (편지함)" }, { text: "agent_sessions" }, { text: "permission_requests" }],
          chips: [{ row: "agent_sessions", text: "idle", from: -8 }],
        }}
        mini={{ browser: {}, server: {}, cli: { sub: "find", lit: true } }}
      >
        {frame < CHILD_SWITCH ? (
          // 장면 10 끝의 floor 겹침
          <div style={{ position: "absolute", left: 0, top: 0, opacity: out }}>
            {S10_LAYERS.map((c) => (
              <FileCard key={c.name} x={S10_LEFT_X} y={c.y} name={c.name} sub={c.sub} tone="file" width={380} height={88} fontSize={18} />
            ))}
            <FolderTree
              x={STAGE.BIG_PROJECT_RIGHT.x}
              y={STAGE.BIG_PROJECT_RIGHT.y}
              width={STAGE.BIG_PROJECT_RIGHT.width}
              fontSize={18}
              lines={[{ text: "charter.md" }, { text: "schedule.md" }, { text: "journal/2026-09-14.md" }, { text: "house.md" }]}
            />
            <Label x={STAGE.PROJECT_BIG.x} y={400} text="node ../../scripts/find.js B 로트 수율" size={18} tone="cli" /* 03 S10 비트 420~460 */ />
            <FolderTree
              x={STAGE.BIG_PROJECT_RIGHT.x}
              y={440} // 03 S10 비트 460~700
              width={STAGE.BIG_PROJECT_RIGHT.width}
              fontSize={17}
              tone="cli"
              lines={LAYERS_10.map((text, i) => ({ text, lit: i === 1, dim: i >= 2 ? 0.4 : 1 }))}
            />
            <Label
              x={STAGE.BIG_PROJECT_RIGHT.x + 200}
              y={440 + 1.5 * 17 * 1.7} // 03 S10 비트 460~700
              text="✓ → cards/E-0001.md:14"
              size={16}
              tone="cli"
              align="left"
            />
            <FileCard
              x={STAGE.BIG_BOT_FOLDER.x - STAGE.BIG_BOT_FOLDER.width / 2 + 90}
              y={740} // 03 S10 비트 760~839
              name="find.log"
              tone="file"
              width={140}
              height={32}
            />
            <FolderTree
              x={500} // 03 S10 비트 760~839
              y={780}
              width={400}
              fontSize={12}
              lines={[
                { text: S10_FINDLOG.slice(0, 3).join("    ") },
                { text: S10_FINDLOG.slice(3).join("    "), depth: 1 },
              ]}
            />
          </div>
        ) : (
          <>
            {/* 장면 8~9 까지의 기본 상태 */}
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

            {/* CLI 속 (압축 전): 실린 것 · PreCompact. 500~540 에 흐려지고 560 에 걷힌다 */}
            {frame < 560 ? (
              <FolderTree
                x={STAGE.CLI_TREE.x}
                y={STAGE.CLI_TREE.y}
                width={STAGE.CLI_TREE.width}
                fontSize={14}
                opacity={interpolate(frame, [500, 540, 552, 560], [1, 0.15, 0.15, 0], clamp)}
                lines={[
                  { text: "실린 것 (CLAUDE.md · skills 15 ·", dim: 0.6 },
                  { text: "agents 6 · settings 두 장)", depth: 1, dim: 0.6 },
                  { text: "PreCompact · pre-compact.js", from: 200, lit: true, tone: "cli" },
                  { text: "기록 꼬리 40턴", depth: 1, from: 230 },
                  { text: "(tool_result 300자 · thinking 제외)", depth: 2, from: 230 },
                ]}
              />
            ) : null}

            {/* CLI 속 (압축 뒤): SessionStart → 여덟 절 → 깨어남 */}
            <FolderTree
              x={STAGE.CLI_TREE.x}
              y={STAGE.CLI_TREE.y}
              width={STAGE.CLI_TREE.width}
              fontSize={NEW_TREE_SIZE}
              tone="cli"
              lines={[
                { text: "SessionStart (compact) ·", from: 560, until: 700, lit: true },
                { text: "session-start.js", depth: 1, from: 560, until: 700, lit: true },
                ...SECTIONS_11.map((text, i) => ({ text, from: SECTION_START[i] + 30 })),
                { text: WAKE_LINES[0], from: 700, mono: false, lit: true },
                { text: WAKE_LINES[1], from: 700, mono: false, lit: true },
              ]}
            />

            {/* 서버: compact 를 걸어 둔다 */}
            <Label x={STAGE.SERVER.x} y={PENDING_Y} text="compact → pendingCompact" size={15} from={140} until={260} />
            <Label x={STAGE.SERVER.x} y={PUSH_Y} text="input.push('/compact')" size={14} from={170} until={220} />
            <Mover
              from={{ x: STAGE.SERVER.x, y: PUSH_Y, scale: 0.6 }}
              to={{ x: STAGE.CLI_INPUT_SLOT.x, y: STAGE.CLI_INPUT_SLOT.y, scale: 0.6 }}
              startFrame={170}
              durationInFrames={30}
              holdAfter={false}
            >
              <FileCard x={0} y={0} name="/compact" tone="server" width={140} height={32} />
            </Mover>

            {/* 훅이 파일을 쓴다: 40턴 → claude -p → 요약 → handoff-compact.md 가 봇 폴더로 */}
            {frame < 370 ? (
              <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(frame, [360, 370], [1, 0], clamp) }}>
                <FolderBox box={SUB_BOX} title="claude -p --model sonnet" subtitle="빈 폴더 · 180초" tone="server" enterFrame={260} />
              </div>
            ) : null}
            <Mover from={CLI_OUT} to={SUB_BOX} startFrame={270} durationInFrames={40} holdAfter={false}>
              <FileCard x={0} y={0} name="마지막 40턴" tone="file" width={140} height={32} />
            </Mover>
            <Mover from={SUB_BOX} to={CLI_OUT} startFrame={310} durationInFrames={40} holdAfter={false}>
              <FileCard x={0} y={0} name="요약 (여섯 칸)" tone="file" width={160} height={32} />
            </Mover>
            {/* 떨어진 카드는 절 [1] 이 거기서 올라가는 570 까지 봇 폴더에 머문다 */}
            <Mover
              from={CLI_OUT}
              to={BOT_DROP}
              startFrame={360}
              durationInFrames={50}
              easing={Easing.in(Easing.quad)}
            >
              {frame < SECTION_START[0] ? (
                <FileCard x={0} y={0} name="handoff-compact.md" tone="file" width={220} height={30} lit={frame >= 410} />
              ) : null}
            </Mover>

            <Label x={STAGE.SERVER.x} y={STAGE.SERVER_LABEL2_Y} text="status: compacting" size={14} from={430} until={500} />
            <Label x={STAGE.SERVER.x} y={STAGE.SERVER_LABEL2_Y} text="compact_boundary" from={540} until={600} />

            {/* 훅이 파일을 읽는다: 여덟 절이 번호 순으로 올라온다 */}
            {SECTION_CARDS.map((name, i) => (
              <Mover
                key={name}
                from={i === 0 ? BOT_DROP : PROJECT_FROM}
                to={{ x: STAGE.CLI.x, y: sectionY(i + 1) }}
                startFrame={SECTION_START[i]}
                durationInFrames={30}
                holdAfter={false}
              >
                <FileCard x={0} y={0} name={name} tone="file" width={220} height={28} fontSize={14} />
              </Mover>
            ))}

            {/* 화살표 */}
            {/* C11 판정 ③: 압축 POST 는 260 에 지운다 (compact → pendingCompact 이름표와 같이) */}
            {frame < 260 ? (
              <Arrow
                from={POST.from}
                to={POST.to}
                label="POST /api/projects/수율개선/session/compact"
                labelSize={14}
                color={THEME.colors.human}
                startFrame={120}
                durationInFrames={30}
              />
            ) : frame < 795 ? null : (
              <Arrow
                from={POST.from}
                to={POST.to}
                label="POST /api/rooms/:id/messages"
                labelSize={14}
                color={THEME.colors.human}
                startFrame={795}
                durationInFrames={10}
              />
            )}
            {frame >= 810 ? (
              <Arrow
                from={REPLY.from}
                to={REPLY.to}
                label="mcp__cockpit__reply"
                labelSize={15}
                color={THEME.colors.cli}
                startFrame={810}
                durationInFrames={10}
              />
            ) : null}
            {[440, 720, 820].map((start, i, all) =>
              frame >= (i === 0 ? -Infinity : start) && (i === all.length - 1 || frame < all[i + 1]) ? (
                <Arrow
                  key={start}
                  from={SSE.from}
                  to={SSE.to}
                  dashed
                  label="SSE message"
                  color={THEME.colors.server}
                  startFrame={start}
                  durationInFrames={i === 0 ? 20 : 10}
                />
              ) : null,
            )}
          </>
        )}
      </Stage>

      {/* 장면 10 끝 조명 (0~30 에 걷힌다) */}
      <Spotlight rects={[STAGE.PROJECT_BIG, S10_MINI_BAND, STAGE.BIG_BOT_FOLDER]} opacity={0.5} until={0} fadeFrames={30} />

      {/* 문맥 막대: 전경이 선 뒤 */}
      <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(frame, [20, 40], [0, 1], clamp) }}>
        <ContextBar box={STAGE.CONTEXT_BAR} pct={pct} label={`문맥 ${Math.round(pct * 100)}%`} />
      </div>

      {/* 인수인계서 상자: 봇 폴더와 함께 비춘다 */}
      <Spotlight
        rects={[STAGE.BOT_FOLDER, { x: HANDOFF_BOX.x, y: HANDOFF_BOX.y, width: HANDOFF_BOX.width, height: HANDOFF_HEIGHT, corner: true }]}
        opacity={0.55}
        from={400}
        until={520}
      />
      {frame >= 400 && frame < 530 ? (
        <div
          style={{
            position: "absolute",
            left: HANDOFF_BOX.x,
            top: HANDOFF_BOX.y,
            opacity: interpolate(frame, [520, 530], [1, 0], clamp),
          }}
        >
          <CodeBlock
            x={0}
            y={0}
            width={HANDOFF_BOX.width}
            code={HANDOFF_11}
            fontSize={HANDOFF_BOX.fontSize}
            showLineNumbers={false}
            startFrame={400}
            framesPerLine={9}
            title="bots/prodev-수율개선-bot/handoff-compact.md"
          />
        </div>
      ) : null}

      <Caption
        text="압축 직전에 인수인계서를 파일로 떨구고, 압축 뒤에 훅이 파일에서 다시 싣는다."
        from={200}
        durationInFrames={320}
      />
      <Caption text={'첫 마디는 "이어서 합니다".'} from={560} durationInFrames={270} />
    </AbsoluteFill>
  );
};
