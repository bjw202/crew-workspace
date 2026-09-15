// 03 장면 9 — 스킬 · 훅 · 도우미, 한 턴의 시계 (28초 · 절대 5580~6419)
// 카메라 RIGHT: 무대 x → 화면 x 는 x - 600. 화면 좌표로 적힌 것(시간축 · 도우미 기둥 · 시간축 옆 나무 · 이름표)은 Stage 밖에 둔다 (04 5절 규칙 5)
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { eased, lerpCamera, visible } from "../lib/anim";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { ChatPane } from "../lib/ChatPane";
import { Envelope } from "../lib/Envelope";
import { FileCard } from "../lib/FileCard";
import { FolderTree } from "../lib/FolderTree";
import { Label } from "../lib/Label";
import { Mover } from "../lib/Mover";
import { Pillar } from "../lib/Pillar";
import { Spotlight } from "../lib/Spotlight";
import { Box, STAGE } from "../lib/stage";
import { Stage } from "../lib/StageView";
import { BOT_8A, BRANCH_9, CHECKS_9, ENVELOPE_8, SKILLS_9, TICKS_9 } from "../lib/text";
import { THEME } from "../lib/theme";
import { Timeline } from "../lib/Timeline";

export const DURATION = 840;
export const STILLS = [0, 420, 620];

const SHIFT = STAGE.CAMERAS.RIGHT.cx - STAGE.CAMERAS.OVERVIEW.cx; // 600
const onScreen = (b: Box): Box => ({ ...b, x: b.x - SHIFT });

// ── 화면 좌표 (03 장면 9 은 화면 좌표로 적는다) ─────────────────
const TL = { x: 1300, yTop: 140, yBottom: 680 }; // 03 S09 비트 0~40
const TL_AREA = { x: 1260, y: 120, width: 640, height: 580, corner: true }; // 03 S09 비트 0~40
// 눈금 여섯은 100 간격. 03 은 y 를 적지 않는다
const TICK_Y = [170, 270, 370, 470, 570, 670]; // 03 S09 비트 0~40 (눈금 자리)
const TICK_AT = [60, 160, 330, 520, 680, 760];
const SIDE_X = 1340; // 03 S09 비트 160~330 · 520~680 (시간축 오른쪽 나무)
// 03 은 분기표 y 250 · 검사 y 470. 지금 눈금 글자 바로 아래로 내려 앞으로 올 눈금만 가린다
const BRANCH_Y = TICK_Y[1] + 30; // 03 S09 비트 160~330
const CHECKS_Y = TICK_Y[3] + 30; // 03 S09 비트 520~680
const SIDE_WIDTH = 540;

const HELPER: Box = { x: 705, y: 420, width: 180, height: 280 }; // 03 S09 비트 330~520 (C9 판정 ①: 폭 150 → 180, C10: x 720 → 705)
const CLI_LEFT = STAGE.CLI.x - STAGE.CLI.width / 2 - SHIFT; // 화면 840
const HELPER_RIGHT = HELPER.x + HELPER.width / 2 + 5; // 화면 800
const AGENT_Y = 420; // 03 S09 비트 330~520
const SUMMARY_Y = 380; // 03 S09 비트 330~520
const READING_FROM = { x: HELPER.x, y: 520 }; // 03 S09 비트 330~520
const READING_TO = { x: 950, y: 820 }; // 03 S09 비트 330~520
const EIGHT_FROM = { x: 950, y: 800 }; // 03 S09 비트 60~150
const EIGHT_TO = { x: 1020, y: 190 }; // 03 S09 비트 60~150
const ENV_FROM = { x: 600, y: 300, scale: 0.3 }; // 03 S09 비트 160~330
const ENV_TO = { x: 870, y: 230, scale: 0.3 }; // 03 S09 비트 160~330
const AGENTS_AT = { x: 1600, y: 420 }; // 03 S09 비트 330~520 (C9 판정 ③: 470 → 420)
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EXIT2_AT = { x: 1180, y: 500 }; // 03 S09 비트 520~680
const STDERR = { from: { x: 1180, y: 510 }, to: { x: 1000, y: 530 } }; // 03 S09 비트 520~680
const RETRY = { from: { x: CLI_LEFT, y: 300 }, to: { x: 560, y: 300 } }; // 03 S09 비트 520~680
const SERVER_TREE = { x: 180, y: 180 }; // 03 S09 비트 760~839

// ── 무대 좌표 (CLI 속) ───────────────────────────────────────
// 서랍 세 열: 03 은 화면 x 860 · 970 · 1080. 둘째 열의 prodev-orchestrator(13px 약 145px)가 셋째 열에 닿아 벌렸다
const DRAWER_X = [STAGE.CLI_TREE.x, STAGE.CLI_TREE.x + 80, STAGE.CLI_TREE.x + 240]; // 03 S09 비트 160~330
const DRAWER_Y = 326; // 03 S09 비트 160~330 (03 은 300. 위 나무 여섯 줄 아래로)
const TURN_TREE_Y = 445; // 03 S09 비트 520~760 (reply · PreCompact 줄은 서랍 아래 따로)

const marker = (f: number) => {
  let idx = -1;
  TICK_AT.forEach((at, i) => {
    if (f >= at) idx = i;
  });
  return idx < 0 ? undefined : TICK_Y[idx];
};
// 분기표 훑는 불빛: 240 부터 20 프레임마다 한 줄 내려와 intake(넷째 줄)에서 멈춘다 (300)
const branchLit = (f: number) => (f < 240 ? -1 : Math.min(3, Math.floor((f - 240) / 20)));

const Backdrop: React.FC<{ y: number; lines: number; from: number; until: number }> = ({ y, lines, from, until }) => {
  const frame = useCurrentFrame();
  const v = visible(frame, from, until);
  if (v <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: SIDE_X - 12,
        top: y - 8,
        width: SIDE_WIDTH + 24,
        height: lines * 14 * 1.7 + 16,
        opacity: v,
        borderRadius: THEME.radiusSmall,
        backgroundColor: THEME.colors.background,
      }}
    />
  );
};

export const S09: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = lerpCamera(STAGE.CAMERAS.OVERVIEW, STAGE.CAMERAS.RIGHT, eased(frame, 0, 40));
  const lit = branchLit(frame);

  return (
    <AbsoluteFill>
      <Stage
        camera={camera}
        browser={{
          status: "on",
          children: (
            <ChatPane
              box={STAGE.BROWSER}
              viewer="김과제"
              sidebar={{ rooms: [{ name: "# prodev-수율개선", from: -8 }] }}
              chip={{ name: "prodev-수율개선-bot", online: true, from: -8 }}
              messages={[
                { author: "김과제", attach: "yield.csv", body: "@TO(prodev-수율개선-bot) 어제 라인 3 자료입니다", kind: "user", from: -8 },
                { author: "prodev-수율개선-bot", badge: "BOT", body: BOT_8A, kind: "bot", from: -8 },
                { author: "김과제", body: "@TO(prodev-수율개선-bot) 확정", kind: "user", from: -8 },
                {
                  author: "prodev-수율개선-bot",
                  badge: "BOT",
                  body: "[카드] E-0001 · 라인 3 수율 · cards/E-0001.md",
                  kind: "bot",
                  from: -8,
                },
              ]}
              input={{}}
              panel={{ stateText: "대기", buttons: ["끄기"] }}
            />
          ),
        }}
        server={{ status: "on" }}
        cli={{ status: "idle", subtitle: "cwd bots/prodev-수율개선-bot" }}
        botsBox={{}}
        botFolder={{}}
        rootCards
        anchor={1}
        chatDb={{
          rows: [{ text: "rooms" }, { text: "messages" }, { text: "message_targets" }, { text: "bots" }],
          chips: [
            { row: "bots", text: "prodev-수율개선-bot", from: -8 },
            { row: "rooms", text: "prodev-수율개선", from: -8 },
            { row: "messages", text: "#12 📎", from: -8 },
            { row: "message_targets", text: "#12 → bot", from: -8 },
            { row: "messages", text: "#13 bot", from: -8 },
            { row: "messages", text: "#14", from: -8 },
            { row: "message_targets", text: "#14 → bot", from: -8 },
            { row: "messages", text: "#15 bot", from: -8 },
          ],
        }}
        cockpitDb={{
          rows: [{ text: "bot_inbox (편지함)" }, { text: "agent_sessions" }, { text: "permission_requests" }],
          chips: [
            { row: "agent_sessions", text: "idle", from: -8 },
            { row: "bot_inbox", text: "#14 delivered", from: -8 },
          ],
        }}
      >
        {/* 장면 8 끝에서 이어지는 바닥 */}
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
        <Label
          x={STAGE.MCP_BOX.x}
          y={STAGE.MCP_BOX.y}
          text="MCP 도구 cockpit · src/mcp/tools.js"
          tone="server"
          size={16}
        />

        {/* CLI 속: 실린 것 두 줄만 흐리게 남기고 이번 턴의 줄 */}
        <FolderTree
          x={STAGE.CLI_TREE.x}
          y={STAGE.CLI_TREE.y}
          width={STAGE.CLI_TREE.width}
          fontSize={14}
          lines={[
            { text: "실린 것 (CLAUDE.md · skills 15 ·", dim: 0.6 },
            { text: "agents 6 · settings 두 장)", depth: 1, dim: 0.6 },
            { text: "[문맥 맨 앞] 여덟 절", from: 130, lit: true },
            { text: 'CLAUDE.md: "과제 방에서 사람 말(@TO)이', from: 200 },
            { text: "오면 먼저 prodev-orchestrator", depth: 1, from: 200 },
            { text: '스킬로"', depth: 1, from: 200 },
          ]}
        />
        {SKILLS_9.map((col, c) => (
          <FolderTree
            key={c}
            x={DRAWER_X[c]}
            y={DRAWER_Y}
            width={160}
            fontSize={13}
            tone="cli"
            lines={col.map((name) => ({ text: name, from: 260, lit: name === "intake" && frame >= 310 }))}
          />
        ))}
        <FolderTree
          x={STAGE.CLI_TREE.x}
          y={TURN_TREE_Y}
          width={STAGE.CLI_TREE.width}
          fontSize={14}
          tone="cli"
          lines={[
            { text: "reply →  PreToolUse · pre-reply.js", from: 530, lit: true },
            { text: "PreCompact · pre-compact.js", from: 690, lit: true },
            { text: "(timeout 180)", depth: 1, from: 690, lit: true },
          ]}
        />
      </Stage>

      {/* ── 화면 좌표 ── */}
      <Spotlight rects={[onScreen(STAGE.CLI), TL_AREA]} opacity={0.45} from={40} until={760} />
      <Spotlight rects={[onScreen(STAGE.CLI), TL_AREA, onScreen(STAGE.SERVER)]} opacity={0.45} from={760} />

      <Timeline
        x={TL.x}
        yTop={TL.yTop}
        yBottom={TL.yBottom}
        ticks={TICKS_9.map((label, i) => ({ label: `${i + 1} ${label}`, y: TICK_Y[i], from: 30 }))}
        markerY={marker(frame)}
        enterFrame={30}
        labelSize={13}
      />

      {/* 눈금 1: 여덟 절 묶음이 바닥에서 CLI 문맥 맨 앞으로 */}
      <Mover from={EIGHT_FROM} to={EIGHT_TO} startFrame={70} durationInFrames={60} holdAfter={false}>
        <FileCard x={0} y={0} name="여덟 절 (session-start.js)" tone="file" width={240} height={32} />
      </Mover>

      {/* 눈금 2: 봉투 칩 · 분기표 */}
      <Mover from={ENV_FROM} to={ENV_TO} startFrame={160} durationInFrames={30} holdAfter={false}>
        <Envelope x={0} y={0} width={STAGE.ENVELOPE_BIG.width} text={ENVELOPE_8} compact />
      </Mover>
      <Backdrop y={BRANCH_Y} lines={BRANCH_9.length} from={220} until={330} />
      <FolderTree
        x={SIDE_X}
        y={BRANCH_Y}
        width={SIDE_WIDTH}
        fontSize={14}
        tone="cli"
        lines={BRANCH_9.map((text, i) => ({ text, from: 220 + i * 12, until: 330, lit: i === lit }))}
      />

      {/* 눈금 3: 도우미 */}
      <Arrow
        from={{ x: CLI_LEFT, y: AGENT_Y }}
        to={{ x: HELPER_RIGHT, y: AGENT_Y }}
        label="Agent"
        labelSize={13}
        color={THEME.colors.cli}
        startFrame={340}
        durationInFrames={20}
      />
      {/* C9 판정 ②: 500~520 에 사라진다 (reply 화살표가 그 위를 지나지 않게). ①: 상태 글자는 비운다 */}
      {frame < 520 ? (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(frame, [500, 520], [1, 0], clamp) }}>
          <Pillar
            box={HELPER}
            title="도우미"
            subtitle="data-reader" // C10: `· opus` 는 눈금 3 글자에 있다
            statusText=""
            tone="cli"
            status={frame >= 500 ? "off" : "working"}
            enterFrame={360}
          />
        </div>
      ) : null}
      <Mover from={READING_FROM} to={READING_TO} startFrame={400} durationInFrames={40} holdAfter={false}>
        <FileCard x={0} y={0} name="reading.md" tone="file" width={150} height={32} />
      </Mover>
      <Arrow
        from={{ x: HELPER_RIGHT, y: SUMMARY_Y }}
        to={{ x: CLI_LEFT, y: SUMMARY_Y }}
        label="20줄 요약"
        labelSize={13}
        color={THEME.colors.cli}
        startFrame={440}
        durationInFrames={30}
      />
      <Label
        x={AGENTS_AT.x}
        y={AGENTS_AT.y}
        text="data-reader · researcher · reviewer · report-writer · paper-writer · patent-analyst"
        size={14}
        maxWidth={520}
        from={470}
        until={520}
      />

      {/* 눈금 4: 답하기 직전 */}
      <Backdrop y={CHECKS_Y} lines={CHECKS_9.length} from={540} until={680} />
      <FolderTree
        x={SIDE_X}
        y={CHECKS_Y}
        width={SIDE_WIDTH}
        fontSize={14}
        lines={CHECKS_9.map((text, i) => ({ text, from: 540 + i * 15, until: 680 }))}
      />
      <Label x={EXIT2_AT.x} y={EXIT2_AT.y} text="exit 2" size={16} warn from={610} until={660} />
      {/* 남겨 두면 690 의 PreCompact 줄 글자를 덮어 눈금 5 전에 지운다 */}
      {frame < 680 ? (
        <Arrow
          from={STDERR.from}
          to={STDERR.to}
          label="stderr: 이유 한 줄"
          labelSize={13}
          color={THEME.colors.warn}
          startFrame={615}
          durationInFrames={25}
        />
      ) : null}
      <Arrow
        from={RETRY.from}
        to={RETRY.to}
        label="reply (고쳐서 다시)"
        labelSize={13}
        color={THEME.colors.cli}
        startFrame={655}
        durationInFrames={25}
      />

      {/* 눈금 6: 서버가 hook 사건을 적는다 */}
      <FolderTree
        x={SERVER_TREE.x}
        y={SERVER_TREE.y}
        width={360}
        fontSize={14}
        tone="server"
        lines={[
          { text: "hook · hook_started", from: 770, lit: interpolate(frame, [770, 780], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) },
          { text: "hook · hook_response · exit_code", from: 800 },
        ]}
      />

      <Caption
        text="스킬은 말이 올 때 골라지고, 도우미는 스킬이 부르며, 훅은 정해진 순간에 반드시 돈다."
        from={60}
        durationInFrames={360}
      />
      <Caption text="막힌 답은 이유 한 줄과 함께 되돌아온다." from={530} durationInFrames={270} />
    </AbsoluteFill>
  );
};
