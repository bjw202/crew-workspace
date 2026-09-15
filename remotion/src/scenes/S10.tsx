// 03 장면 10 — 바닥, 지식이 쌓이고 찾힌다 (28초 · 절대 6420~7259)
// floor 배치는 카메라가 없으므로 Stage children · 밖의 형제 모두 화면 좌표 = floor 좌표다.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { THEME } from "../lib/theme";
import { FileCard } from "../lib/FileCard";
import { FolderTree } from "../lib/FolderTree";
import { Label } from "../lib/Label";
import { Mover } from "../lib/Mover";
import { Spotlight } from "../lib/Spotlight";
import { STAGE } from "../lib/stage";
import { Stage } from "../lib/StageView";
import { FINDLOG_10, LAYERS_10, SKILLS_9, TICKS_9 } from "../lib/text";
import { Timeline } from "../lib/Timeline";

export const DURATION = 840;
export const STILLS = [0, 580, 800];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const TRANSITION = { to: "floor" as const, from: 0, durationInFrames: 40 };
const CHILD_SWITCH = TRANSITION.from + TRANSITION.durationInFrames / 2; // Stage 가 children 좌표를 floor 로 바꾸는 프레임

// ── 기억의 층 넷 (왼쪽 열) ─────────────────────────────────────
const LEFT_X = STAGE.BIG_PROJECT_LEFT.x + STAGE.BIG_PROJECT_LEFT.width / 2; // 1200
const LAYER_CARDS = [
  { y: 800, name: "inbox/2026-09-15-라인3/", sub: "yield.csv 🔒 · files.md", at: 60 }, // 03 S10 비트 60~250
  { y: 690, name: "cards/E-0001.md", sub: "실험 한 건 = 카드 한 장", at: 110 }, // 03 S10 비트 60~250
  { y: 580, name: "wiki/수율.md", sub: "문장마다 카드 번호", at: 160 }, // 03 S10 비트 60~250
  { y: 470, name: "index.md · index.json", sub: "index.js 가 만든다", at: 210 }, // 03 S10 비트 60~250
];
const RISE_FROM = 60; // 03 S10 비트 60~250 (아래서 솟아오르는 거리)

// ── 찾기 층 여섯 (오른쪽 아래) ────────────────────────────────
const FIND_CMD_Y = 400; // 03 S10 비트 420~460
const LAYERS_Y = 440; // 03 S10 비트 460~700
const LAYERS_SIZE = 17;
const LAYERS_LH = LAYERS_SIZE * 1.7;
const HIT_X = STAGE.BIG_PROJECT_RIGHT.x + 200; // 03 S10 비트 460~700 (② 줄 글자 오른쪽)

// ── MINI 띠 ───────────────────────────────────────────────────
const MINI_Y = STAGE.MINI.y;
const QUESTION = "@TO(prodev-수율개선-bot) B 로트 수율 어디 있었지?";
const ANSWER = "B 로트 수율 … (cards/E-0001.md)";
const MINI_BAND = { x: 0, y: STAGE.MINI.y - STAGE.MINI.height / 2, width: STAGE.W, height: STAGE.MINI.height, corner: true };

// ── 봇 폴더의 find.log ────────────────────────────────────────
// 03 은 find.log 카드 (520,720) · 기록 나무 (500,780). 카드가 폴더 왼변(490) 밖으로 나가 폴더 안으로 옮겼다
const BF = STAGE.BIG_BOT_FOLDER;
const FINDLOG_CARD = { x: BF.x - BF.width / 2 + 90, y: 740 }; // 03 S10 비트 760~839
const FINDLOG_TREE = { x: 500, y: 780 }; // 03 S10 비트 760~839
const FINDLOG_FROM = { x: STAGE.BIG_PROJECT_RIGHT.x, y: 560 }; // 03 S10 비트 760~839
const FINDLOG_TO = { x: BF.x, y: 800 }; // 03 S10 비트 760~839
// 한 줄(약 590px)이 폴더 안(약 390px)을 넘어 칸 셋씩 두 줄로 나눈다 (글자는 그대로)
const FINDLOG_FIELDS = FINDLOG_10.split("    ");
const FINDLOG_LINES = [FINDLOG_FIELDS.slice(0, 3).join("    "), FINDLOG_FIELDS.slice(3).join("    ")];

// 장면 9 끝 (0~30 에 걷힌다): 시간축 · 조명 · 화살표 셋 · CLI 속 아래 나무
const S09_TICK_Y = [170, 270, 370, 470, 570, 670]; // 03 S09 비트 0~40 (장면 9 끝 자리)
const S09_SHIFT = STAGE.CAMERAS.RIGHT.cx - STAGE.CAMERAS.OVERVIEW.cx;
const S09_CLI = { ...STAGE.CLI, x: STAGE.CLI.x - S09_SHIFT };
const S09_SERVER = { ...STAGE.SERVER, x: STAGE.SERVER.x - S09_SHIFT };
const S09_TL_AREA = { x: 1260, y: 120, width: 640, height: 580, corner: true }; // 03 S09 비트 0~40
const S09_CLI_LEFT = S09_CLI.x - S09_CLI.width / 2;
const S09_HELPER_RIGHT = 705 + 180 / 2 + 5; // 03 S09 비트 330~520 (C9 · C10 판정 뒤 도우미 기둥 오른변 + 5)
const TURN_TREE_Y = 445; // 03 S09 비트 520~760 (장면 9 끝 자리)

export const S10: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [0, 30], [1, 0], clamp);
  const layerLit = (i: number) => (i === 0 ? frame >= 520 && frame < 560 : i === 1 ? frame >= 560 : false);

  return (
    <AbsoluteFill>
      <Stage
        mode="floor"
        camera={STAGE.CAMERAS.RIGHT}
        transition={TRANSITION}
        browser={{ status: "on" }}
        server={{ status: "on" }}
        cli={{ status: "idle", subtitle: "cwd bots/prodev-수율개선-bot" }}
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
        mini={{
          browser: {},
          server: {},
          cli: { sub: frame >= 410 ? "find" : undefined, lit: frame >= 410 },
        }}
      >
        {frame < CHILD_SWITCH ? (
          // 장면 9 끝의 CLI 속 (무대 좌표, 옛 배치와 함께 걷힌다)
          <div style={{ position: "absolute", left: 0, top: 0, opacity: out }}>
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
            <FolderTree
              x={STAGE.CLI_TREE.x}
              y={TURN_TREE_Y}
              width={STAGE.CLI_TREE.width}
              fontSize={14}
              tone="cli"
              lines={[
                { text: "reply →  PreToolUse · pre-reply.js", lit: true },
                { text: "PreCompact · pre-compact.js", lit: true },
                { text: "(timeout 180)", depth: 1, lit: true },
              ]}
            />
            <FolderTree
              x={STAGE.CLI_TREE.x}
              y={STAGE.CLI_TREE.y}
              width={STAGE.CLI_TREE.width}
              fontSize={14}
              lines={[
                { text: "실린 것 (CLAUDE.md · skills 15 ·", dim: 0.6 },
                { text: "agents 6 · settings 두 장)", depth: 1, dim: 0.6 },
                { text: "[문맥 맨 앞] 여덟 절", lit: true },
                { text: 'CLAUDE.md: "과제 방에서 사람 말(@TO)이' },
                { text: "오면 먼저 prodev-orchestrator", depth: 1 },
                { text: '스킬로"', depth: 1 },
              ]}
            />
            {SKILLS_9.map((col, c) => (
              <FolderTree
                key={c}
                x={[STAGE.CLI_TREE.x, STAGE.CLI_TREE.x + 80, STAGE.CLI_TREE.x + 240][c]}
                y={326} // 03 S09 비트 160~330 (장면 9 끝 자리)
                width={160}
                fontSize={13}
                tone="cli"
                lines={col.map((name) => ({ text: name, lit: name === "intake" }))}
              />
            ))}
          </div>
        ) : (
          <>
            {/* 기억의 층: 아래에서 위로 */}
            {LAYER_CARDS.map((c) => (
              <Mover
                key={c.name}
                from={{ x: LEFT_X, y: c.y + RISE_FROM, opacity: 0 }}
                to={{ x: LEFT_X, y: c.y }}
                startFrame={c.at}
                durationInFrames={40}
              >
                <FileCard x={0} y={0} name={c.name} sub={c.sub} tone="file" width={380} height={88} fontSize={18} />
              </Mover>
            ))}

            {/* 과제 문서 */}
            <FolderTree
              x={STAGE.BIG_PROJECT_RIGHT.x}
              y={STAGE.BIG_PROJECT_RIGHT.y}
              width={STAGE.BIG_PROJECT_RIGHT.width}
              fontSize={18}
              lines={[
                { text: "charter.md", from: 260 },
                { text: "schedule.md", from: 280 },
                { text: "journal/2026-09-14.md", from: 300 },
                { text: "house.md", from: 320 },
              ]}
            />

            {/* 찾기: find.js 와 층 여섯 */}
            <Label
              x={STAGE.PROJECT_BIG.x}
              y={FIND_CMD_Y}
              text="node ../../scripts/find.js B 로트 수율"
              size={18}
              tone="cli"
              from={420}
            />
            <FolderTree
              x={STAGE.BIG_PROJECT_RIGHT.x}
              y={LAYERS_Y}
              width={STAGE.BIG_PROJECT_RIGHT.width}
              fontSize={LAYERS_SIZE}
              tone="cli"
              lines={LAYERS_10.map((text, i) => ({
                text,
                from: 460 + i * 10,
                lit: layerLit(i),
                dim: i >= 2 ? interpolate(frame, [600, 610], [1, 0.4], clamp) : 1,
              }))}
            />
            <Label
              x={HIT_X}
              y={LAYERS_Y + 1.5 * LAYERS_LH}
              text="✓ → cards/E-0001.md:14"
              size={16}
              tone="cli"
              align="left"
              from={600}
            />

            {/* find.log 에 한 줄 */}
            <FileCard x={FINDLOG_CARD.x} y={FINDLOG_CARD.y} name="find.log" tone="file" width={140} height={32} enterFrame={760} />
            <Mover from={FINDLOG_FROM} to={FINDLOG_TO} startFrame={770} durationInFrames={40} holdAfter={false}>
              <Label x={0} y={0} text={FINDLOG_10} size={12} tone="file" />
            </Mover>
            <FolderTree
              x={FINDLOG_TREE.x}
              y={FINDLOG_TREE.y}
              width={400}
              fontSize={12}
              lines={FINDLOG_LINES.map((text, i) => ({ text, depth: i, from: 810 }))}
            />
          </>
        )}
      </Stage>

      {/* 장면 9 끝의 화면 좌표 것들(조명 · 시간축 · 화살표 셋 · 서버 hook 줄): 옛 배치와 함께 걷힌다 */}
      <Spotlight rects={[S09_CLI, S09_TL_AREA, S09_SERVER]} opacity={0.45} until={0} fadeFrames={30} />
      {frame < 30 ? (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: out }}>
          <Arrow from={{ x: S09_CLI_LEFT, y: 420 }} to={{ x: S09_HELPER_RIGHT, y: 420 }} label="Agent" labelSize={13} color={THEME.colors.cli} progress={1} /* 03 S09 비트 330~520 */ />
          <Arrow from={{ x: S09_HELPER_RIGHT, y: 380 }} to={{ x: S09_CLI_LEFT, y: 380 }} label="20줄 요약" labelSize={13} color={THEME.colors.cli} progress={1} /* 03 S09 비트 330~520 */ />
          <Arrow from={{ x: S09_CLI_LEFT, y: 300 }} to={{ x: 560, y: 300 }} label="reply (고쳐서 다시)" labelSize={13} color={THEME.colors.cli} progress={1} /* 03 S09 비트 520~680 */ />
          <FolderTree
            x={180} // 03 S09 비트 760~839
            y={180}
            width={360}
            fontSize={14}
            tone="server"
            lines={[{ text: "hook · hook_started", lit: true }, { text: "hook · hook_response · exit_code" }]}
          />
          <Timeline
            x={1300} // 03 S09 비트 0~40 (장면 9 끝 자리)
            yTop={140}
            yBottom={680}
            ticks={TICKS_9.map((label, i) => ({ label: `${i + 1} ${label}`, y: S09_TICK_Y[i], from: -8 }))}
            markerY={S09_TICK_Y[5]}
            labelSize={13}
          />
        </div>
      ) : null}

      {/* 조명: 과제 폴더(+ MINI 띠), 760 부터 봇 폴더 추가 */}
      <Spotlight rects={[STAGE.PROJECT_BIG, MINI_BAND]} opacity={0.5} from={30} until={760} />
      <Spotlight rects={[STAGE.PROJECT_BIG, MINI_BAND, STAGE.BIG_BOT_FOLDER]} opacity={0.5} from={760} />

      {/* MINI 띠: 물음 칩 브라우저 → 서버 → CLI, 답 칩 CLI → 브라우저 */}
      <Label x={STAGE.MINI.BROWSER_X} y={MINI_Y} text={QUESTION} size={14} tone="human" from={360} until={380} />
      <Mover
        from={{ x: STAGE.MINI.BROWSER_X, y: MINI_Y }}
        to={{ x: STAGE.MINI.SERVER_X, y: MINI_Y }}
        startFrame={380}
        durationInFrames={15}
        holdAfter={false}
      >
        <Label x={0} y={0} text={QUESTION} size={14} tone="human" />
      </Mover>
      <Mover
        from={{ x: STAGE.MINI.SERVER_X, y: MINI_Y }}
        to={{ x: STAGE.MINI.CLI_X, y: MINI_Y }}
        startFrame={395}
        durationInFrames={15}
        holdAfter={false}
      >
        <Label x={0} y={0} text={QUESTION} size={14} tone="human" />
      </Mover>
      <Label x={STAGE.MINI.CLI_X} y={MINI_Y} text={ANSWER} size={14} tone="cli" from={700} until={720} />
      <Mover
        from={{ x: STAGE.MINI.CLI_X, y: MINI_Y }}
        to={{ x: STAGE.MINI.BROWSER_X, y: MINI_Y }}
        startFrame={720}
        durationInFrames={30}
        holdAfter={false}
      >
        <Label x={0} y={0} text={ANSWER} size={14} tone="cli" />
      </Mover>

      <Caption text="봇의 기억은 대화가 아니라 과제 폴더의 파일이다." from={60} durationInFrames={340} />
      <Caption text="물으면 답이 떠올라도 find.js 를 먼저 돌려 출처를 붙인다." from={430} durationInFrames={370} />
    </AbsoluteFill>
  );
};
