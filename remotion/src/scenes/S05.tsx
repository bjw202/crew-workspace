// 03 장면 5 — 닻줄, cwd 로 물고 들어간다 (22초 · 절대 2400~3059)
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { dist, polylineLength } from "../lib/anim";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { ChatPane } from "../lib/ChatPane";
import { FileCard } from "../lib/FileCard";
import { FolderTree } from "../lib/FolderTree";
import { Label } from "../lib/Label";
import { Mover } from "../lib/Mover";
import { Spotlight } from "../lib/Spotlight";
import { STAGE } from "../lib/stage";
import { Stage } from "../lib/StageView";
import { THEME } from "../lib/theme";

export const DURATION = 660;
export const STILLS = [0, 350, 620];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const SETTINGS_CARD = { tone: "file" as const, width: 240, height: 26, fontSize: 14 };
const CARD_Y = [820, 852]; // 03 S03 비트 300~380 (장면 3 · 4 끝의 설정 카드 자리)
const HOOKS_LINE_Y = 225; // 03 S05 비트 220~300 (hooks 줄에서 나가는 점선 시작)
// hooks 읽기 점선: 기둥 사이 틈(x 1250) · 바닥 위(y 660)로 돈다 (C5 판정 ①)
const GAP_X = 1250; // 03 S05 비트 220~300 (C5: 서버와 CLI 사이 틈)
const OVER_FLOOR_Y = 660; // 03 S05 비트 220~300 (C5: 바닥 선 위)
const HOOKS_DROP_X = 640; // 03 S05 비트 220~300 (C5: common/hooks 카드 오른쪽 옆)
const HOOKS_PATH = [
  { x: STAGE.CLI_TREE.x, y: HOOKS_LINE_Y },
  { x: GAP_X, y: HOOKS_LINE_Y },
  { x: GAP_X, y: OVER_FLOOR_Y },
  { x: HOOKS_DROP_X, y: OVER_FLOOR_Y },
  { x: HOOKS_DROP_X, y: STAGE.ROOT_HOOKS.y },
  { x: STAGE.ROOT_HOOKS.x + STAGE.ROOT_HOOKS.width / 2, y: STAGE.ROOT_HOOKS.y },
];
/** 이름표는 첫 가로 구간 가운데 */
const HOOKS_LABEL_AT = dist(HOOKS_PATH[0], HOOKS_PATH[1]) / 2 / polylineLength(HOOKS_PATH);
const ROOT_TO_Y = [400, 440, 480]; // 03 S05 비트 400~520 (뿌리 셋이 닿는 CLI 속 y)

export const S05: React.FC = () => {
  const frame = useCurrentFrame();
  const hooksLit = interpolate(frame, [270, 278, 292, 300], [0, 1, 1, 0], clamp);
  const botTreeLit = interpolate(frame, [540, 550], [0, 1], clamp);

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
              chip={{ name: "prodev-수율개선-bot", online: true, from: -8 }}
              messages={[]}
              input={{}}
              panel={{ stateText: "대기", buttons: ["끄기"] }}
            />
          ),
        }}
        server={{ status: "on" }}
        cli={{ status: "idle", subtitle: "cwd bots/prodev-수율개선-bot" }}
        botsBox={{}}
        botFolder={{ glowFrom: 80 }}
        rootCards
        chatDb={{
          rows: [{ text: "rooms" }, { text: "messages" }, { text: "message_targets" }, { text: "bots" }],
          chips: [
            { row: "messages", text: "#1", from: -8 },
            { row: "bots", text: "prodev-수율개선-bot", from: -8 },
            { row: "rooms", text: "prodev-수율개선", from: -8 },
          ],
        }}
        cockpitDb={{
          rows: [{ text: "bot_inbox (편지함)" }, { text: "agent_sessions" }],
          chips: [{ row: "agent_sessions", text: "idle", from: -8 }],
        }}
        anchor={interpolate(frame, [0, 80], [0.35, 1], clamp)}
        anchorClimb={interpolate(frame, [300, 400], [0, 1], clamp)}
      >
        {/* 장면 4 끝에서 이어지는 과제 폴더 줄 넷 */}
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

        {/* 봇 폴더 속: 장면 4 끝의 설정 카드 둘이 170 에 나무 세 줄로 바뀐다 */}
        <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(frame, [162, 170], [1, 0], clamp) }}>
          <FileCard x={STAGE.BOT_FOLDER.x} y={CARD_Y[0]} name=".claude/settings.json" {...SETTINGS_CARD} />
          <FileCard x={STAGE.BOT_FOLDER.x} y={CARD_Y[1]} name=".claude/settings.local.json" {...SETTINGS_CARD} />
        </div>
        <FolderTree
          x={STAGE.BOT_TREE.x}
          y={STAGE.BOT_TREE.y}
          width={STAGE.BOT_TREE.width}
          fontSize={13}
          lines={[
            { text: ".claude/", from: 170, lit: botTreeLit },
            { text: "settings.json", depth: 1, from: 170, lit: botTreeLit },
            { text: "settings.local.json", depth: 1, from: 170, lit: botTreeLit },
          ]}
        />

        {/* 설정 두 장이 봇 폴더에서 CLI 속으로 올라간다 */}
        <Mover
          from={{ x: STAGE.BOT_FOLDER.x, y: CARD_Y[0] }}
          to={{ x: STAGE.CLI.x, y: 190 }} // 03 S05 비트 80~220
          startFrame={80}
          durationInFrames={40}
          holdAfter={false}
        >
          <FileCard x={0} y={0} name="settings.json" {...SETTINGS_CARD} />
        </Mover>
        <Mover
          from={{ x: STAGE.BOT_FOLDER.x, y: CARD_Y[1] }}
          to={{ x: STAGE.CLI.x, y: 280 }} // 03 S05 비트 80~220
          startFrame={130}
          durationInFrames={40}
          holdAfter={false}
        >
          <FileCard x={0} y={0} name="settings.local.json" {...SETTINGS_CARD} />
        </Mover>

        {/* 긴 줄 셋은 기둥 폭(320)을 넘어 두 줄로 잇는다 */}
        <FolderTree
          x={STAGE.CLI_TREE.x}
          y={STAGE.CLI_TREE.y}
          width={STAGE.CLI_TREE.width}
          fontSize={15}
          lines={[
            { text: "settings.json", from: 120 },
            { text: "hooks: SessionStart ·", depth: 1, from: 140 },
            { text: "PreCompact · PreToolUse", depth: 2, from: 140 },
            { text: "env: PRODEV_BOT · PRODEV_PROJECT", depth: 1, from: 160 },
            { text: "settings.local.json", from: 170 },
            { text: "allow 22 · deny 10 ·", depth: 1, from: 200 },
            { text: "additionalDirectories 3", depth: 2, from: 200 },
            { text: "CLAUDE.md", from: 440 },
            { text: ".claude/skills (15)", from: 470 },
            { text: ".claude/agents (도우미 6)", from: 500 },
          ]}
        />

        {/* hooks 줄 → 뿌리의 common/hooks 카드 (읽기 점선) */}
        <Arrow
          from={HOOKS_PATH[0]}
          to={HOOKS_PATH[HOOKS_PATH.length - 1]}
          points={HOOKS_PATH}
          dashed
          label="node …/common/hooks/<이름>.js  (절대 경로)"
          labelSize={14}
          labelAt={HOOKS_LABEL_AT}
          labelOffset={{ x: -80, y: -24 }} // 03 S05 비트 220~300 (C5: 첫 가로 구간 210px 보다 이름표가 넓어 CLI 속 줄을 덮지 않게 왼쪽으로)
          color={THEME.colors.cli}
          startFrame={220}
          durationInFrames={50}
        />
        {hooksLit > 0 ? (
          <FileCard {...STAGE.ROOT_HOOKS} name="common/hooks (3)" tone="file" lit={hooksLit} />
        ) : null}

        <Label
          x={STAGE.BOTS_BOX.x}
          y={715} // 03 S05 비트 300~400
          text="한 층 위 bots/"
          size={15}
          tone="cli"
          from={320}
        />
        <Label
          x={500} // 03 S05 비트 300~400
          y={690} // 03 S05 비트 300~400
          text="두 층 위 prodev/"
          size={15}
          tone="cli"
          from={360}
        />

        {/* 뿌리의 셋이 CLI 속으로 끌려 올라간다 */}
        <Mover
          from={{ x: STAGE.ROOT_CLAUDE.x, y: STAGE.ROOT_CLAUDE.y }}
          to={{ x: STAGE.CLI.x, y: ROOT_TO_Y[0] }}
          startFrame={400}
          durationInFrames={40}
          holdAfter={false}
        >
          <FileCard x={0} y={0} width={STAGE.ROOT_CLAUDE.width} height={STAGE.ROOT_CLAUDE.height} name="CLAUDE.md" tone="file" />
        </Mover>
        <Mover
          from={{ x: STAGE.ROOT_SKILLS.x, y: STAGE.ROOT_SKILLS.y }}
          to={{ x: STAGE.CLI.x, y: ROOT_TO_Y[1] }}
          startFrame={430}
          durationInFrames={40}
          holdAfter={false}
        >
          <FileCard
            x={0}
            y={0}
            width={STAGE.ROOT_SKILLS.width}
            height={STAGE.ROOT_SKILLS.height}
            name=".claude/skills (15)"
            tone="file"
          />
        </Mover>
        <Mover
          from={{ x: STAGE.ROOT_AGENTS.x, y: STAGE.ROOT_AGENTS.y }}
          to={{ x: STAGE.CLI.x, y: ROOT_TO_Y[2] }}
          startFrame={460}
          durationInFrames={40}
          holdAfter={false}
        >
          <FileCard
            x={0}
            y={0}
            width={STAGE.ROOT_AGENTS.width}
            height={STAGE.ROOT_AGENTS.height}
            name=".claude/agents (6)"
            tone="file"
          />
        </Mover>

        {/* 조명: 봇 폴더와 CLI 기둥만. 이름표는 조명 위에 */}
        <Spotlight rects={[STAGE.BOT_FOLDER, STAGE.CLI]} opacity={0.5} from={540} until={640} />
        <Label
          x={STAGE.PRODEV.x}
          y={650} // 03 S05 비트 520~600
          text="복사 없음 · 링크 없음"
          size={20}
          tone="file"
          from={520}
        />
      </Stage>
      <Caption text="복사도 링크도 없다." from={30} durationInFrames={270} />
      <Caption text="봇 폴더가 prodev 안에 있다는 자리 자체가 스킬을 받는 법이다." from={330} durationInFrames={300} />
    </AbsoluteFill>
  );
};
