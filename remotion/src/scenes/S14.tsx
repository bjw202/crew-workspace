// 03 장면 14 — 어디를 고치면 봇이 달라지나 (21초 · 절대 9360~9989)
// 0~480 floor 배치(S13 끝에서 이어짐, 화면 좌표 = floor 좌표), 480~510 floor → overview, 510 부터 장면 1 의 전경.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loop } from "../lib/anim";
import { AnchorLine } from "../lib/AnchorLine";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { ChatPane } from "../lib/ChatPane";
import { CodeBlock } from "../lib/CodeBlock";
import { FileCard } from "../lib/FileCard";
import { FolderTree, TreeLine } from "../lib/FolderTree";
import { Label } from "../lib/Label";
import { Mover } from "../lib/Mover";
import { Spotlight } from "../lib/Spotlight";
import { STAGE } from "../lib/stage";
import { Stage } from "../lib/StageView";
import { RETRO_13, SEVEN_A, SEVEN_BOT, SEVEN_PROJECT } from "../lib/text";
import { THEME, Point, withAlpha } from "../lib/theme";

export const DURATION = 630;
export const STILLS = [0, 300, 600];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const TRANSITION = { to: "overview" as const, from: 480, durationInFrames: 30 };
const CHILD_SWITCH = TRANSITION.from + TRANSITION.durationInFrames / 2;

const MINI_BOTTOM = STAGE.MINI.y + STAGE.MINI.height / 2; // 88

// ── 일곱 자리 (나무 셋) ────────────────────────────────────────
const ROOT_SIZE = 18;
const ROOT_LH = ROOT_SIZE * 1.7;
const rootY = (slot: number) => STAGE.BIG_ROOT.y + (slot + 0.5) * ROOT_LH;
const BOT_SIZE = 14; // 03 S14 비트 0~30 (03 은 15. ⑤ 줄 불빛 바탕이 봇 폴더 오른변 910 을 넘어 14 로)
const BOT_LH = BOT_SIZE * 1.7;
const PROJECT_TREE = { x: 1000, y: 240, width: 800 }; // 03 S14 비트 0~30
const projectY = (slot: number) => PROJECT_TREE.y + (slot + 0.5) * ROOT_LH;

// 불 켜는 프레임 ①~⑦ (30 간격). 제 차례 30프레임은 세기 1, 뒤로는 0.6 으로 남는다
const LIT_AT = [20, 50, 80, 110, 140, 170, 200];
const SETTLE = 0.6;
const litFor = (frame: number, at: number, again: number[] = []) => {
  if (frame < at) return 0;
  const base = interpolate(frame, [at, at + 6, at + 24, at + 30], [0, 1, 1, SETTLE], clamp);
  const pulses = again.map((a) => interpolate(frame, [a, a + 6, a + 24, a + 30], [SETTLE, 1, 1, SETTLE], clamp));
  return Math.max(base, ...pulses);
};
// "① CLAUDE.md …" → number ① + 나머지 글자 (FolderTree 의 number 배지로)
const numbered = (text: string): TreeLine => {
  const m = text.match(/^([①-⑦])\s(.*)$/);
  return m ? { text: m[2], number: m[1] } : { text };
};

// ── 봇의 손: Edit 셋 (두 상자 사이 틈 x 955 로 내려와 줄 끝에 닿는다) ──
const GAP_X = (STAGE.PRODEV_BIG.x + STAGE.PRODEV_BIG.width / 2 + STAGE.PROJECT_BIG.x - STAGE.PROJECT_BIG.width / 2) / 2; // 955
const HAND_Y = 120; // 03 S14 비트 240~340 (MINI 띠와 상자 위변 사이)
const TIP_X = 930; // 03 S14 비트 240~340 (PRODEV_BIG · 봇 폴더 오른변 바깥)
const DENY_RIGHT = 905; // 03 S14 비트 240~340 (이름표 오른끝, 화살촉 앞)
const BOT_LINE_Y = STAGE.BIG_BOT_TREE.y + 0.5 * BOT_LH;
const handPath = (y: number): Point[] => [
  { x: STAGE.MINI.CLI_X, y: MINI_BOTTOM },
  { x: STAGE.MINI.CLI_X, y: HAND_Y },
  { x: GAP_X, y: HAND_Y },
  { x: GAP_X, y },
  { x: TIP_X, y },
];
const HANDS = [
  { y: rootY(3), deny: "✗ deny: Edit(…/common/hooks/**)", draw: 240, hit: 265, until: 290, labelDy: 0 },
  { y: rootY(4), deny: "✗ deny: Edit(…/scripts/**)", draw: 290, hit: 310, until: 315, labelDy: 0 },
  { y: BOT_LINE_Y, deny: "✗ deny: Edit(…/.claude/settings.local.json)", draw: 315, hit: 340, until: 420, labelDy: 26 }, // 03 S14 비트 315~340 (줄 아래)
];
const BOUNCE = 20;

// ── 제작 세션의 PR (MINI 왼쪽 칩 → ② 줄 끝) ──────────────────────
const PR_PATH: Point[] = [
  { x: STAGE.MINI.BROWSER_X, y: MINI_BOTTOM },
  { x: STAGE.MINI.BROWSER_X, y: 140 }, // 03 S14 비트 340~420
  { x: 800, y: 140 }, // 03 S14 비트 340~420 (① 줄 글자를 가로지르지 않게 오른쪽으로 돌아 ② 줄로)
  { x: 800, y: rootY(1) },
  { x: 700, y: rootY(1) }, // 03 S14 비트 340~420
];
const SKILL_TO = { x: 760, y: rootY(1) }; // 03 S14 비트 380~410 (03 은 (420,300). ② 줄 글자 오른쪽 빈자리)

// ── 봇의 손: Write ✓ (house.md · templates/ 두 줄 오른쪽) ────────
const WRITE_PATH: Point[] = [
  { x: STAGE.MINI.CLI_X, y: MINI_BOTTOM },
  { x: STAGE.MINI.CLI_X, y: (projectY(0) + projectY(1)) / 2 },
  { x: 1180, y: (projectY(0) + projectY(1)) / 2 }, // 03 S14 비트 420~445 (03 은 (1100,250). 줄 글자 위에 닿지 않게 오른쪽 끝에서 멈춤)
];

// ── floor 닻줄 (03 그대로) ─────────────────────────────────────
const FLOOR_ANCHOR: Point[] = [
  { x: STAGE.MINI.CLI_X, y: MINI_BOTTOM },
  { x: STAGE.MINI.CLI_X, y: 140 }, // 03 S14 비트 450~475
  { x: 700, y: 140 },
  { x: 700, y: 690 },
];
// 03 은 y 240(나무 윗변). 빛 덩이가 ① 줄 글자를 덮어 제목과 나무 사이 y 225 로 올렸다
const CLIMB_Y = 225; // 03 S14 비트 475~495
const FLOOR_CLIMB: Point[] = [
  { x: 700, y: 690 }, // 03 S14 비트 475~495
  { x: 700, y: CLIMB_Y },
  { x: STAGE.BIG_ROOT.x, y: CLIMB_Y },
];

// ── 장면 13 끝 (0~15 에 걷힌다) ────────────────────────────────
const P = STAGE.LEFT_PANEL;
const MINI_BAND = { x: 0, y: STAGE.MINI.y - STAGE.MINI.height / 2, width: STAGE.W, height: STAGE.MINI.height, corner: true };
const S13_RIGHT = { x: STAGE.BIG_PROJECT_RIGHT.x, y: 220, width: STAGE.BIG_PROJECT_RIGHT.width }; // 03 S13 비트 0~40
const S13_OUT = 15;

// ── 전경 ──────────────────────────────────────────────────────
const POST = {
  from: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_TOP_Y },
  to: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_TOP_Y },
};
const SSE = {
  from: { x: STAGE.GAP_L.to.x, y: STAGE.ARROW_SSE_Y },
  to: { x: STAGE.GAP_L.from.x, y: STAGE.ARROW_SSE_Y },
};

const SUMMARY =
  'cockpit 서버가 봇 폴더를 cwd 로 Claude Code CLI 를 한 번 켜 두고, 사람의 @TO 글을 겉봉투에 싸서 넣어 주면, 그 CLI 가 두 층 위 prodev 의 지침·스킬·훅으로 일하고 과제 폴더의 파일에 기억을 남긴다 — 그래서 압축되고 꺼져도 "이어서 합니다".';

export const S14: React.FC = () => {
  const frame = useCurrentFrame();
  const s13Out = interpolate(frame, [0, S13_OUT], [1, 0], clamp);
  const floorOut = interpolate(frame, [TRANSITION.from, TRANSITION.from + TRANSITION.durationInFrames * 0.75], [1, 0], clamp);
  const maker = frame >= 340;

  return (
    <AbsoluteFill>
      <Stage
        mode="floor"
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
                { author: "김피엘", body: "@TO(prodev-수율개선-bot) 어디까지 했지?", kind: "user", from: -8 },
                { author: "김과제", body: "@TO(prodev-수율개선-bot) 라인 4 자료도 있어요", kind: "user", from: -8 },
                { author: "김과제", body: "@TO(prodev-수율개선-bot) 내일 회의 전에 봐 주세요", kind: "user", from: -8 },
              ]}
              input={{}}
              panel={{ stateText: "대기", contextPct: 0.12, buttons: ["압축"] }}
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
          chips: [{ row: "messages", text: "#15 bot", from: -8 }],
        }}
        cockpitDb={{
          rows: [{ text: "bot_inbox (편지함)" }, { text: "agent_sessions" }, { text: "permission_requests" }],
          chips: [
            { row: "agent_sessions", text: "idle", from: -8 },
            { row: "bot_inbox", text: "#16 delivered", from: -8 },
            { row: "bot_inbox", text: "#17 delivered", from: -8 },
          ],
        }}
        mini={{
          browser: maker ? { title: "prodev 제작 세션", sub: "(사람 + worktree + PR)", tone: "human", lit: frame < 420 } : {},
          server: {},
          cli: frame < S13_OUT ? { sub: "retro", lit: s13Out } : {},
        }}
      >
        {frame < CHILD_SWITCH ? (
          <div style={{ position: "absolute", left: 0, top: 0, opacity: floorOut }}>
            {/* 장면 13 끝: 왼쪽 판 · 과제 폴더 오른쪽 열 · find.log (이름표는 넘기지 않는다) */}
            {frame < S13_OUT ? (
              <div style={{ position: "absolute", left: 0, top: 0, opacity: s13Out }}>
                <div
                  style={{
                    position: "absolute",
                    left: P.x,
                    top: P.y,
                    width: P.width,
                    height: P.height,
                    borderRadius: THEME.radius,
                    border: `1px solid ${THEME.colors.border}`,
                    backgroundColor: withAlpha(THEME.colors.surface, 0.9),
                  }}
                />
                <FolderTree
                  x={100} // 03 S13 비트 40~110
                  y={160}
                  width={780}
                  fontSize={16}
                  tone="cli"
                  lines={[
                    { text: '분기표 2 · "앞으로" · "다음부터" → 굳는 길', lit: true },
                    { text: "봇: 회의록만인가요, PL 께 나가는 문서 전부인가요?", mono: false },
                    { text: "PL: 회의록만", mono: false },
                    { text: "규칙 → house.md  ·  양식 → templates/  ·  방법 → analysis/methods/" },
                    { text: "PL: 이번에는 짧게", mono: false },
                    { text: "→ 굳히지 않는다 (파일 없음)", depth: 1, warn: true },
                    { text: "── 관찰형 ── 회고 retro" },
                  ]}
                />
                <CodeBlock
                  x={100} // 03 S13 비트 530~620
                  y={470}
                  width={780}
                  code={RETRO_13}
                  fontSize={15}
                  showLineNumbers={false}
                  startFrame={-1000}
                  framesPerLine={14}
                  title="retro 제안 — .claude/skills/retro/SKILL.md:80-82"
                />
                <FolderTree
                  x={S13_RIGHT.x}
                  y={S13_RIGHT.y}
                  width={S13_RIGHT.width}
                  fontSize={18}
                  lines={[
                    { text: "house.md   24 / 50", lit: true },
                    { text: "templates/" },
                    { text: "회의-문서.md", depth: 1, lit: true },
                    { text: "언제부터 2026-09-15 · 누가 김피엘", depth: 2 },
                    { text: "무엇을 보고 회의양식.pptx", depth: 2 },
                    { text: "analysis/methods/" },
                    { text: "journal/2026-09-14.md" },
                  ]}
                />
                <FileCard
                  x={STAGE.BIG_BOT_FOLDER.x - STAGE.BIG_BOT_FOLDER.width / 2 + 90}
                  y={740} // 03 S10 비트 760~839
                  name="find.log"
                  tone="file"
                  width={140}
                  height={32}
                />
              </div>
            ) : null}

            {/* 고칠 수 있는 자리 일곱 */}
            <FolderTree
              x={STAGE.BIG_ROOT.x}
              y={STAGE.BIG_ROOT.y}
              width={STAGE.BIG_ROOT.width}
              fontSize={ROOT_SIZE}
              lines={SEVEN_A.map((text, i) => ({
                ...numbered(text),
                from: 10,
                lit: i < 4 ? litFor(frame, LIT_AT[i], i === 1 ? [410, 495] : []) : 0,
              }))}
            />
            <FolderTree
              x={STAGE.BIG_BOT_TREE.x}
              y={STAGE.BIG_BOT_TREE.y}
              width={STAGE.BIG_BOT_TREE.width}
              fontSize={BOT_SIZE}
              lines={SEVEN_BOT.map((text) => ({ ...numbered(text), from: 10, lit: litFor(frame, LIT_AT[4]) }))}
            />
            <FolderTree
              x={PROJECT_TREE.x}
              y={PROJECT_TREE.y}
              width={PROJECT_TREE.width}
              fontSize={ROOT_SIZE}
              lines={SEVEN_PROJECT.map((text, i) => ({ ...numbered(text), from: 10, lit: litFor(frame, LIT_AT[5 + i]) }))}
            />

            {/* 닻줄은 deny 이름표 뒤로 지나간다 (이름표 바탕이 덮는다) */}
            <AnchorLine
              points={FLOOR_ANCHOR}
              progress={interpolate(frame, [450, 475], [0, 1], clamp)}
              climb={frame >= 475 ? { points: FLOOR_CLIMB, progress: interpolate(frame, [475, 495], [0, 1], clamp) } : undefined}
            />

            {/* 봇의 손이 deny 에 튕긴다 */}
            {HANDS.map((h) =>
              frame >= h.draw && frame < h.until ? (
                <Arrow
                  key={h.deny}
                  from={handPath(h.y)[0]}
                  to={handPath(h.y)[4]}
                  points={handPath(h.y)}
                  label="Edit"
                  labelSize={13}
                  labelAt={0.2}
                  color={frame >= h.hit ? THEME.colors.warn : THEME.colors.cli}
                  progress={
                    frame < h.hit
                      ? interpolate(frame, [h.draw, h.hit], [0, 1], clamp)
                      : interpolate(frame, [h.hit, h.hit + BOUNCE], [1, 0.8], clamp)
                  }
                />
              ) : null,
            )}
            {HANDS.map((h) => (
              <Label key={h.deny} x={DENY_RIGHT} y={h.y + h.labelDy} text={h.deny} size={13} warn align="right" from={h.hit} />
            ))}

            {/* 제작 세션이 PR 로 SKILL.md 한 장 */}
            {frame >= 350 && frame < 420 ? (
              <Arrow
                from={PR_PATH[0]}
                to={PR_PATH[PR_PATH.length - 1]}
                points={PR_PATH}
                label="PR"
                labelAt={0.35}
                color={THEME.colors.human}
                startFrame={350}
                durationInFrames={30}
              />
            ) : null}
            {frame < 440 ? (
              <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(frame, [420, 440], [1, 0], clamp) }}>
                <Mover from={{ x: STAGE.MINI.BROWSER_X, y: MINI_BOTTOM }} to={SKILL_TO} startFrame={380} durationInFrames={30}>
                  <FileCard x={0} y={0} name="<이름>/SKILL.md" tone="human" width={180} height={32} lit={frame >= 410} />
                </Mover>
              </div>
            ) : null}

            {/* 봇의 손은 과제 폴더에만 닿는다 */}
            {frame >= 420 && frame < 450 ? (
              <Arrow
                from={WRITE_PATH[0]}
                to={WRITE_PATH[WRITE_PATH.length - 1]}
                points={WRITE_PATH}
                label="Write ✓"
                labelSize={13}
                labelAt={0.75}
                color={THEME.colors.cli}
                startFrame={420}
                durationInFrames={25}
              />
            ) : null}
            <Label x={900} y={150} text="다음 켜기 때 cwd 로 다시 읽는다" size={14} tone="cli" from={480} /* 03 S14 비트 420~480 */ />
          </div>
        ) : (
          <>
            {/* 장면 1 의 전경 + 그동안 쌓인 바닥 줄 */}
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
            <Arrow
              from={POST.from}
              to={POST.to}
              label="POST /api/*"
              color={THEME.colors.human}
              startFrame={510}
              durationInFrames={30}
            />
            {frame >= 540 ? (
              <Arrow
                from={SSE.from}
                to={SSE.to}
                dashed
                label="SSE /api/stream"
                labelOffset={{ x: 0, y: 28 }}
                color={THEME.colors.server}
                progress={loop(frame, 540, 60)}
              />
            ) : null}
          </>
        )}
      </Stage>

      {/* 장면 13 끝의 조명: 걷혀서 바닥 전체가 밝다 */}
      <Spotlight rects={[STAGE.PROJECT_BIG, STAGE.BIG_BOT_FOLDER, { ...P, corner: true }, MINI_BAND]} opacity={0.5} until={0} fadeFrames={30} />

      <Caption text="전 봇 공통은 prodev 뿌리에 PR 로, 이 과제만의 것은 과제 폴더에 봇이 쓴다." from={20} durationInFrames={240} />
      <Caption text="봇은 자기 훅과 설정을 못 고친다." from={280} durationInFrames={190} />
      <Caption text={SUMMARY} from={485} durationInFrames={140} fontSize={28} maxWidth={1700} fadeFrames={6} />
    </AbsoluteFill>
  );
};
