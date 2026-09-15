// 03 장면 13 — 쓸수록 맞아 간다, 굳는 길과 회고 (26초 · 절대 8580~9359)
// floor 배치 둘째 장면. 20 부터 Stage children · 밖의 형제 모두 floor 좌표(= 화면 좌표)다.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { ChatPane } from "../lib/ChatPane";
import { CodeBlock } from "../lib/CodeBlock";
import { ContextBar } from "../lib/ContextBar";
import { FileCard } from "../lib/FileCard";
import { FolderTree } from "../lib/FolderTree";
import { Label } from "../lib/Label";
import { Mover } from "../lib/Mover";
import { Spotlight } from "../lib/Spotlight";
import { STAGE } from "../lib/stage";
import { Stage } from "../lib/StageView";
import { RETRO_13 } from "../lib/text";
import { THEME, withAlpha } from "../lib/theme";

export const DURATION = 780;
export const STILLS = [0, 560, 700];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const TRANSITION = { to: "floor" as const, from: 0, durationInFrames: 40 };
const CHILD_SWITCH = TRANSITION.from + TRANSITION.durationInFrames / 2;

const P = STAGE.LEFT_PANEL; // 왼쪽 위 좌표 (80,140,820×740)
const MINI_Y = STAGE.MINI.y;
const MINI_BAND = { x: 0, y: STAGE.MINI.y - STAGE.MINI.height / 2, width: STAGE.W, height: STAGE.MINI.height, corner: true };

// ── 과제 폴더 오른쪽 열 (18px) ─────────────────────────────────
const RIGHT = { x: STAGE.BIG_PROJECT_RIGHT.x, y: 220, width: STAGE.BIG_PROJECT_RIGHT.width }; // 03 S13 비트 0~40
const RIGHT_LH = 18 * 1.7;
const rightY = (slot: number) => RIGHT.y + (slot + 0.5) * RIGHT_LH;
// 슬롯: 0 house · 1 templates/ · 2 회의-문서.md · 3·4 머리 셋 · 5 analysis/methods/ · 6 journal
const SLOT = { house: 0, templates: 1, doc: 2, analysis: 5, journal: 6 };

// ── 왼쪽 판 (16px) ─────────────────────────────────────────────
const LEFT_TREE = { x: 100, y: 160, width: 780 }; // 03 S13 비트 40~110
const LEFT_LH = 16 * 1.7;
const RETRO_BOX = { x: 100, y: 470, width: 780 }; // 03 S13 비트 530~620
// 갈래 셋 줄(슬롯 3)의 세 낱말 아래에서 과제 폴더 줄로 가는 얇은 점선. x 는 16px 글자 폭으로 어림했다
const BRANCH_Y = LEFT_TREE.y + 4 * LEFT_LH + 4; // 03 S13 비트 280~340
const BRANCH_WORD_X = [LEFT_TREE.x + 20, LEFT_TREE.x + 220, LEFT_TREE.x + 440]; // 03 S13 비트 280~340

// ── 봇 폴더의 find.log (장면 10 자리) ──────────────────────────
const BF = STAGE.BIG_BOT_FOLDER;
const FINDLOG = { x: BF.x - BF.width / 2 + 90, y: 740 }; // 03 S10 비트 760~839

const NOTE_CHANGE = { x: STAGE.PROJECT_BIG.x, y: 700 }; // 03 S13 비트 340~390
const HOUSE_NOTE_X = RIGHT.x - 20; // 03 S13 비트 620~700 (03 은 (1560,255). templates/ 줄과 겹쳐 house 줄 왼쪽 빈자리에 오른쪽 정렬로)
// 회고가 읽는 둘: CLI 칩 → 판 오른쪽 가장자리 → journal 줄 끝 / CLI 칩 → 띠와 판 사이 → 두 판 사이 틈 → find.log
const JOURNAL_PATH = [
  { x: 1780, y: MINI_Y }, // 03 S13 비트 450~530
  { x: 1850, y: MINI_Y },
  { x: 1850, y: RIGHT.y + 6.5 * 18 * 1.7 },
  { x: 1690, y: RIGHT.y + 6.5 * 18 * 1.7 },
];
const FINDLOG_PATH = [
  { x: 1500, y: MINI_Y + STAGE.MINI.height / 2 }, // 03 S13 비트 450~530
  { x: 1500, y: 120 },
  { x: 955, y: 120 },
  { x: 955, y: 740 },
  { x: 660, y: 740 },
];
const DOC_FROM = { x: STAGE.MINI.CLI_X, y: MINI_Y };
const HOUSE_TO = { x: 1560, y: 220 }; // 03 S13 비트 620~779

const SAY = "@TO(prodev-수율개선-bot) 앞으로 회의 문서는 이 양식대로 해  📎 회의양식.pptx";
const RETRO = "@TO(prodev-수율개선-bot) 돌아봐";
const OK = "@TO(prodev-수율개선-bot) 앞으로 그렇게 해";

const miniChip = (text: string, labelFrom: number, moveAt: number, moveDur: number) => (
  <>
    <Label x={STAGE.MINI.BROWSER_X} y={MINI_Y} text={text} size={13} tone="human" from={labelFrom} until={moveAt} />
    <Mover
      from={{ x: STAGE.MINI.BROWSER_X, y: MINI_Y }}
      to={{ x: STAGE.MINI.CLI_X, y: MINI_Y }}
      startFrame={moveAt}
      durationInFrames={moveDur}
      holdAfter={false}
    >
      <Label x={0} y={0} text={text} size={13} tone="human" />
    </Mover>
  </>
);

export const S13: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [0, 30], [1, 0], clamp);
  const readLit = interpolate(frame, [490, 500, 610, 620], [0, 1, 1, 0], clamp);
  const findLit = interpolate(frame, [520, 530, 610, 620], [0, 1, 1, 0], clamp);

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
              panel={{ stateText: "일하는 중", contextPct: 0.12, buttons: ["압축"] }}
            />
          ),
        }}
        server={{ status: "on" }}
        cli={{ status: "working", subtitle: "프로세스 2 · abc…" }}
        botsBox={{}}
        botFolder={{}}
        rootCards
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
          browser: {},
          server: {},
          cli: { sub: frame >= 420 ? "retro" : undefined, lit: frame >= 420 },
        }}
      >
        {frame < CHILD_SWITCH ? (
          // 장면 12 끝 (무대 좌표, 옛 배치와 함께 걷힌다)
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
            <Label x={STAGE.MCP_BOX.x} y={STAGE.MCP_BOX.y} text="MCP 도구 cockpit · src/mcp/tools.js" tone="server" size={16} />
            <FolderTree
              x={STAGE.CLI_TREE.x}
              y={STAGE.CLI_TREE.y}
              width={STAGE.CLI_TREE.width}
              fontSize={14}
              tone="cli"
              lines={[
                { text: "SessionStart (resume) ·", lit: true },
                { text: "session-start.js", depth: 1, lit: true },
                { text: "여덟 절 (1 handoff … 8 house.md)", depth: 1 },
              ]}
            />
            <Label x={STAGE.SERVER.x} y={STAGE.SERVER_KICK_Y[0]} text="pendingInbox (BATCH_LIMIT 20)" size={14} />
            <Label x={STAGE.SERVER.x} y={STAGE.SERVER_KICK_Y[1]} text="bootResume" size={16} />
            <Label x={STAGE.COCKPIT_DB.x} y={600} text="session_id abc… (같음)" size={13} tone="cli" /* 03 S12 비트 440~479 */ />
          </div>
        ) : (
          <>
            {/* 왼쪽 판: 지시형 · 관찰형 */}
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
                opacity: interpolate(frame, [20, 40], [0, 1], clamp),
              }}
            />
            <FolderTree
              x={LEFT_TREE.x}
              y={LEFT_TREE.y}
              width={LEFT_TREE.width}
              fontSize={16}
              tone="cli"
              lines={[
                { text: '분기표 2 · "앞으로" · "다음부터" → 굳는 길', from: 100, lit: true },
                { text: "봇: 회의록만인가요, PL 께 나가는 문서 전부인가요?", from: 120, mono: false },
                { text: "PL: 회의록만", from: 170, mono: false },
                { text: "규칙 → house.md  ·  양식 → templates/  ·  방법 → analysis/methods/", from: 290 },
                { text: "PL: 이번에는 짧게", from: 345, mono: false },
                { text: "→ 굳히지 않는다 (파일 없음)", depth: 1, from: 365, warn: true },
                { text: "── 관찰형 ── 회고 retro", from: 430 },
              ]}
            />
            <CodeBlock
              x={RETRO_BOX.x}
              y={RETRO_BOX.y}
              width={RETRO_BOX.width}
              code={RETRO_13}
              fontSize={15}
              showLineNumbers={false}
              startFrame={530}
              framesPerLine={14}
              title="retro 제안 — .claude/skills/retro/SKILL.md:80-82"
            />

            {/* 과제 폴더 오른쪽 열 */}
            <FolderTree
              x={RIGHT.x}
              y={RIGHT.y}
              width={RIGHT.width}
              fontSize={18}
              lines={[
                { text: "house.md   23 / 50", from: 20, until: 690 },
                { text: "templates/", from: 35 },
                { text: "회의-문서.md", depth: 1, from: 240, lit: true },
                // 03 은 한 줄. 18px 로 화면 오른쪽 밖까지 나가 두 줄로 나눴다
                { text: "언제부터 2026-09-15 · 누가 김피엘", depth: 2, from: 260 },
                { text: "무엇을 보고 회의양식.pptx", depth: 2, from: 260 },
                { text: "analysis/methods/", from: 50 },
                { text: "journal/2026-09-14.md", from: 65, lit: readLit },
                { text: "house.md   24 / 50", from: 690, lit: true },
              ]}
            />
            <Label
              x={HOUSE_NOTE_X}
              y={rightY(SLOT.house)}
              text="### 문체와 어휘  + 1줄  (언제부터 · 누가 · 무엇을 보고)"
              size={12}
              tone="file"
              align="right"
              from={690}
            />
            <Label x={NOTE_CHANGE.x} y={NOTE_CHANGE.y} text="변화 없음" size={13} from={370} until={400} />

            {/* 봇 폴더 */}
            <FileCard x={FINDLOG.x} y={FINDLOG.y} name="find.log" tone="file" width={140} height={32} enterFrame={70} lit={findLit} />

            {/* 갈래 셋: 낱말 → 과제 폴더 줄 */}
            {/* 300~330 에 그려지고 345 에 걷힌다 (남겨 두면 아래 줄 글자를 가로지른다) */}
            {frame < 345 ? (
              <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(frame, [335, 345], [1, 0], clamp) }}>
                {[SLOT.house, SLOT.templates, SLOT.analysis].map((slot, i) => (
                  <Arrow
                    key={slot}
                    from={{ x: BRANCH_WORD_X[i], y: BRANCH_Y }}
                    to={{ x: RIGHT.x - 10, y: rightY(slot) }}
                    dashed
                    strokeWidth={1.5}
                    headSize={10}
                    color={THEME.colors.file}
                    startFrame={300}
                    durationInFrames={30}
                  />
                ))}
              </div>
            ) : null}

            {/* 회고가 읽는 둘 */}
            {/* 03 은 CLI 칩에서 곧장 내리꽂는다. 그러면 과제 폴더 줄 글자를 가로질러, 판 가장자리 틈으로 돌렸다. 620 에 걷힌다 */}
            {frame < 630 ? (
              <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(frame, [620, 630], [1, 0], clamp) }}>
                <Arrow
                  from={JOURNAL_PATH[0]}
                  to={JOURNAL_PATH[JOURNAL_PATH.length - 1]}
                  points={JOURNAL_PATH}
                  dashed
                  label="journal/*.md  ## 되풀이된 말"
                  labelSize={13}
                  labelAt={0.27} // 세로 구간 위쪽 (y 약 150) — CLI 칩 제목을 덮지 않게 띠와 판 사이 틈에
                  labelOffset={{ x: -120, y: 0 }}
                  color={THEME.colors.cli}
                  startFrame={450}
                  durationInFrames={40}
                />
                <Arrow
                  from={FINDLOG_PATH[0]}
                  to={FINDLOG_PATH[FINDLOG_PATH.length - 1]}
                  points={FINDLOG_PATH}
                  dashed
                  label="find.log  (건수 0 인 줄)"
                  labelSize={13}
                  labelAt={0.25}
                  labelOffset={{ x: 0, y: 14 }} // 선 아래로 — 서버 칩 아래 변에 닿지 않게
                  color={THEME.colors.cli}
                  startFrame={470}
                  durationInFrames={50}
                />
              </div>
            ) : null}
          </>
        )}
      </Stage>

      {/* 장면 12 끝의 문맥 막대 (옛 배치와 함께 걷힌다) */}
      {frame < 30 ? (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: out }}>
          <ContextBar box={STAGE.CONTEXT_BAR} pct={0.12} label="문맥 12%" />
        </div>
      ) : null}

      <Spotlight rects={[STAGE.PROJECT_BIG, STAGE.BIG_BOT_FOLDER, { ...P, corner: true }, MINI_BAND]} opacity={0.5} from={30} />

      {/* MINI 띠: 지시형 · 관찰형 · 승인 */}
      {miniChip(SAY, 40, 60, 30)}
      {miniChip(RETRO, 390, 400, 20)}
      {miniChip(OK, 620, 630, 20)}

      {/* 파일이 오간다 */}
      <Mover from={DOC_FROM} to={{ x: 1600, y: 300 }} startFrame={200} durationInFrames={40} holdAfter={false} /* 03 S13 비트 200~280 */>
        <FileCard x={0} y={0} name="templates/회의-문서.md" tone="file" width={240} height={32} />
      </Mover>
      <Mover from={DOC_FROM} to={HOUSE_TO} startFrame={655} durationInFrames={30} holdAfter={false}>
        <FileCard x={0} y={0} name="house.md 에 한 줄" tone="file" width={180} height={32} />
      </Mover>
      <Label x={STAGE.MINI.CLI_X} y={MINI_Y} text="다음 켜기 · SessionStart" size={13} tone="cli" from={710} />
      <Mover from={HOUSE_TO} to={DOC_FROM} startFrame={720} durationInFrames={40} holdAfter={false}>
        <FileCard x={0} y={0} name="8 ## 이 과제의 규칙 (house.md)" tone="file" width={280} height={32} />
      </Mover>

      <Caption text={'"앞으로" 라고 말한 것만 파일로 굳고 "이번에는" 은 굳지 않는다.'} from={40} durationInFrames={340} />
      <Caption text="회고는 일지와 find.log 를 읽어 제안까지만 한다." from={400} durationInFrames={360} />
    </AbsoluteFill>
  );
};
