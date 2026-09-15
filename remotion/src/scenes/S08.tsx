// 03 장면 8 — 일이 되는 모습, 들이기 한 건 (32초 · 절대 4620~5579)
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Arrow } from "../lib/Arrow";
import { Caption } from "../lib/Caption";
import { ChatInput, ChatPane } from "../lib/ChatPane";
import { CodeBlock } from "../lib/CodeBlock";
import { Envelope } from "../lib/Envelope";
import { FileCard } from "../lib/FileCard";
import { FolderTree } from "../lib/FolderTree";
import { Label } from "../lib/Label";
import { Mover } from "../lib/Mover";
import { PillarStatus } from "../lib/Pillar";
import { Spotlight } from "../lib/Spotlight";
import { STAGE } from "../lib/stage";
import { Stage } from "../lib/StageView";
import { BOT_8A, CHECK_8, ENVELOPE_8, ENVELOPE_8C } from "../lib/text";
import { THEME } from "../lib/theme";

export const DURATION = 960;
export const STILLS = [0, 740, 900];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

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
const READ_ONLY = {
  from: { x: STAGE.GAP_R.from.x, y: 436 }, // 03 S08 비트 640~700 (C8 판정 ③: 470 → 436, cockpit.db 원통 위를 지나지 않게)
  to: { x: STAGE.CHAT_DB.x + STAGE.CHAT_DB.width / 2 - 5, y: STAGE.CHAT_DB.y },
};

const CLI_X = STAGE.CLI.x;
const COPY_LABEL_Y = 300; // 03 S08 비트 340~430
const YIELD_FROM_Y = 340; // 03 S08 비트 340~430
const CARD_FROM_Y = 420; // 03 S08 비트 430~520
const INDEX_FROM_Y = 520; // 03 S08 비트 780~860
const YIELD_TO = { x: 1440, y: 790 }; // 03 S08 비트 340~430
const CARD_TO = { x: 1450, y: 830 }; // 03 S08 비트 430~520
const INDEX_TO = { x: STAGE.PROJECT.x, y: 860 }; // 03 S08 비트 780~860
const GIT_AT = { x: 1720, y: 880 }; // 03 S08 비트 780~860
const EXIT_Y = 440; // 03 S08 비트 700~780
const ENV_CHIP_FROM_Y = 400; // 03 S08 비트 540~640 (S07 과 같은 서버 속 출발)

// 검사 상자 (CodeBlock 왼쪽 위). 높이는 머리 띠 · 줄 높이에서 셈한다
const CHECK = { x: 560, y: 120, width: 780, fontSize: 18 }; // 03 S08 비트 700~780
const CHECK_HEIGHT = 2 + 43 + 12 + CHECK_8.split("\n").length * CHECK.fontSize * 1.6 + 14; // 03 S08 비트 700~780

const FIRST = "@TO(prodev-수율개선-bot) 어제 라인 3 자료입니다";
const CONFIRM = "@TO(prodev-수율개선-bot) 확정";

const firstInput: ChatInput = { text: FIRST, attach: "yield.csv", typeFrom: 0, typeUntil: 50, sendAt: 60 };
const confirmInput: ChatInput = { textFinal: CONFIRM, typeFrom: 540, typeUntil: 570, sendAt: 580 };

// 첫 답(470~510) 뒤 확정 글이 올 때까지는 대기로 둔다 (03 은 640 에 working 을 다시 적는다)
const cliStatus = (f: number): PillarStatus =>
  f >= 930 ? "idle" : f >= 640 ? "working" : f >= 520 ? "idle" : f >= 300 ? "working" : "idle";
const PANEL_WORDS: Record<string, string> = { working: "일하는 중", waiting: "승인 대기", idle: "대기" };

const bigEnvelope = (startFrame: number, highlightLines: number[]) => (
  <Envelope
    x={0}
    y={0}
    width={STAGE.ENVELOPE_WIDE.width}
    fontSize={20}
    text={ENVELOPE_8}
    startFrame={startFrame}
    framesPerLine={22}
    highlightLines={highlightLines}
  />
);

export const S08: React.FC = () => {
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
              viewer="김과제"
              sidebar={{ rooms: [{ name: "# prodev-수율개선", from: -8 }] }}
              chip={{ name: "prodev-수율개선-bot", online: true, from: -8 }}
              messages={[
                { author: "김과제", attach: "yield.csv", body: FIRST, kind: "user", from: 115 },
                { author: "prodev-수율개선-bot", badge: "BOT", body: BOT_8A, kind: "bot", from: 470 },
                { author: "김과제", body: CONFIRM, kind: "user", from: 625 },
                {
                  author: "prodev-수율개선-bot",
                  badge: "BOT",
                  body: "[카드] E-0001 · 라인 3 수율 · cards/E-0001.md",
                  kind: "bot",
                  from: 900,
                },
              ]}
              input={frame < 540 ? firstInput : confirmInput}
              panel={{ stateText: PANEL_WORDS[status], buttons: ["끄기"] }}
            />
          ),
        }}
        server={{ status: "on" }}
        cli={{ status, subtitle: "cwd bots/prodev-수율개선-bot" }}
        botsBox={{}}
        botFolder={{}}
        rootCards
        anchor={1}
        chatDb={{
          rows: [{ text: "rooms" }, { text: "messages" }, { text: "message_targets" }, { text: "bots" }],
          chips: [
            { row: "bots", text: "prodev-수율개선-bot", from: -8 },
            { row: "rooms", text: "prodev-수율개선", from: -8 },
            { row: "messages", text: "#12 📎", from: 95 },
            { row: "message_targets", text: "#12 → bot", from: 100 },
            { row: "messages", text: "#13 bot", from: 460 },
            { row: "messages", text: "#14", from: 600 },
            { row: "message_targets", text: "#14 → bot", from: 605 },
            { row: "messages", text: "#15 bot", from: 890 },
          ],
        }}
        cockpitDb={{
          rows: [{ text: "bot_inbox (편지함)" }, { text: "agent_sessions" }, { text: "permission_requests" }],
          chips: [
            { row: "agent_sessions", text: "idle", from: -8 },
            { row: "bot_inbox", text: "enqueue #12", from: 105, until: 300 },
            { row: "bot_inbox", text: "#12 delivered", from: 300, until: 610 },
            { row: "bot_inbox", text: "enqueue #14", from: 610, until: 640 },
            { row: "bot_inbox", text: "#14 delivered", from: 640 },
          ],
        }}
      >
        {/* 장면 7 끝에서 이어지는 바닥 */}
        <FolderTree
          x={STAGE.BOT_TREE.x}
          y={STAGE.BOT_TREE.y}
          width={STAGE.BOT_TREE.width}
          fontSize={13}
          lines={[{ text: ".claude/" }, { text: "settings.json", depth: 1 }, { text: "settings.local.json", depth: 1 }]}
        />
        {/* 과제 폴더: 장면 7 까지의 줄 넷은 400 에 걷히고, 들이기 줄이 같은 자리에 선다 */}
        <FolderTree
          x={STAGE.PROJECT_TREE.x}
          y={STAGE.PROJECT_TREE.y}
          width={STAGE.PROJECT_TREE.width}
          fontSize={15}
          lines={[
            { text: "cards/ · wiki/ · inbox/ · journal/ · threads/ · research/", until: 400 },
            { text: "patent/ · paper/ · report/ · tmp/ · analysis/ · templates/", until: 400 },
            { text: "house.md  (골격 · 상한 50줄)", until: 400 },
            { text: ".git  (git init)", until: 400 },
          ]}
        />
        <FolderTree
          x={STAGE.PROJECT_TREE.x}
          y={STAGE.PROJECT_TREE.y}
          width={STAGE.PROJECT_TREE.width}
          fontSize={14}
          lines={[
            { text: "inbox/2026-09-15-라인3/", from: 400 },
            { text: "yield.csv  🔒 0444", depth: 1, from: 410 }, // 03 은 lock:true 도 준다 — 글자에 🔒 가 있어 두 번 찍혀 뺐다
            { text: "files.md  (SHA-256)", depth: 1, from: 420 },
            { text: "cards/E-0001.md  status: draft", from: 510, until: 790 },
            { text: "cards/E-0001.md  status: valid", from: 790, lit: true },
            { text: "index.md · index.json  (index.js)", from: 815 },
          ]}
        />

        {/* CLI 속: 실린 것은 한 줄로 접고(meta 결정) 그 아래에 이번 턴의 줄 */}
        <FolderTree
          x={STAGE.CLI_TREE.x}
          y={STAGE.CLI_TREE.y}
          width={STAGE.CLI_TREE.width}
          fontSize={15}
          lines={[
            { text: "실린 것 (CLAUDE.md · skills 15 ·", dim: 0.6 },
            { text: "agents 6 · settings 두 장)", depth: 1, dim: 0.6 },
            { text: "prodev-orchestrator (분기표)", from: 300 },
            { text: "→ intake", depth: 1, from: 325, lit: true, tone: "cli" },
            { text: "reply → [카드] E-0001 …", from: 645 },
            { text: "PreToolUse · pre-reply.js", depth: 1, from: 660, lit: true, tone: "cli" },
          ]}
        />
        <Label
          x={STAGE.MCP_BOX.x}
          y={STAGE.MCP_BOX.y}
          text="MCP 도구 cockpit · src/mcp/tools.js"
          tone="server"
          size={16}
        />

        {/* 첨부 글: 장면 6 의 길 압축 */}
        {frame < 580 ? (
          <Arrow
            from={POST.from}
            to={POST.to}
            label="POST /api/rooms/:id/messages"
            labelSize={15}
            color={THEME.colors.human}
            startFrame={60}
            durationInFrames={30}
          />
        ) : (
          <Arrow
            from={POST.from}
            to={POST.to}
            label="POST /api/rooms/:id/messages"
            labelSize={15}
            color={THEME.colors.human}
            startFrame={580}
            durationInFrames={20}
          />
        )}
        {[105, 460, 610, 890].map((start, i, all) =>
          frame >= (i === 0 ? -Infinity : start) && (i === all.length - 1 || frame < all[i + 1]) ? (
            <Arrow
              key={start}
              from={SSE.from}
              to={SSE.to}
              dashed
              label="SSE message"
              color={THEME.colors.server}
              startFrame={start}
              durationInFrames={15}
            />
          ) : null,
        )}

        {/* intake: 스킬 → 복사 → 과제 폴더 */}
        <Label
          x={CLI_X}
          y={COPY_LABEL_Y}
          text="node ../../scripts/intake-copy.js 라인3 <경로>"
          size={13}
          tone="cli"
          from={340}
          until={430}
        />
        <Mover
          from={{ x: CLI_X, y: YIELD_FROM_Y }}
          to={YIELD_TO}
          startFrame={360}
          durationInFrames={50}
          holdAfter={false}
        >
          <FileCard x={0} y={0} name="yield.csv" tone="file" width={160} height={32} />
        </Mover>

        {/* 첫 답 · 카드 draft */}
        {frame < 860 ? (
          <Arrow
            from={REPLY.from}
            to={REPLY.to}
            label="mcp__cockpit__reply"
            labelSize={15}
            color={THEME.colors.cli}
            startFrame={430}
            durationInFrames={25}
          />
        ) : (
          <Arrow
            from={REPLY.from}
            to={REPLY.to}
            label="mcp__cockpit__reply"
            labelSize={15}
            color={THEME.colors.cli}
            startFrame={860}
            durationInFrames={25}
          />
        )}
        <Mover
          from={{ x: CLI_X, y: CARD_FROM_Y }}
          to={CARD_TO}
          startFrame={480}
          durationInFrames={30}
          holdAfter={false}
        >
          <FileCard x={0} y={0} name="cards/E-0001.md" tone="file" width={200} height={32} />
        </Mover>

        {/* 확정 글: 봉투 칩 압축 */}
        <Mover
          from={{ x: STAGE.SERVER.x, y: ENV_CHIP_FROM_Y, scale: 0.3 }}
          to={{ x: STAGE.CLI_INPUT_SLOT.x, y: STAGE.CLI_INPUT_SLOT.y, scale: 0.3 }}
          startFrame={615}
          durationInFrames={25}
          holdAfter={false}
        >
          <Envelope x={0} y={0} width={STAGE.ENVELOPE_BIG.width} text={ENVELOPE_8C} compact />
        </Mover>

        {/* 확정 관문: chat.db 로 읽기 전용 점선 */}
        <Arrow
          from={READ_ONLY.from}
          to={READ_ONLY.to}
          route="orthogonal"
          bend="hv"
          dashed
          label="readOnly: true"
          labelSize={14}
          color={THEME.colors.cli}
          startFrame={670}
          durationInFrames={30}
        />

        {/* 바닥: valid · index.js · git commit */}
        <Mover
          from={{ x: CLI_X, y: INDEX_FROM_Y }}
          to={INDEX_TO}
          startFrame={800}
          durationInFrames={30}
          holdAfter={false}
        >
          <FileCard x={0} y={0} name="index.js" tone="file" width={140} height={32} />
        </Mover>
        <Label x={GIT_AT.x} y={GIT_AT.y} text="git commit" size={14} tone="file" from={840} />

        {/* 조명 1: 겉봉투 */}
        <Spotlight rects={[]} opacity={0.7} from={120} until={260} />
        {frame < 260 ? (
          <div style={{ position: "absolute", left: STAGE.ENVELOPE_WIDE.x, top: STAGE.ENVELOPE_WIDE.y }}>
            {bigEnvelope(120, frame >= 200 ? [3] : [])}
          </div>
        ) : null}
        {frame < 330 ? (
          <div style={{ position: "absolute", left: 0, top: 0, opacity: interpolate(frame, [300, 330], [1, 0], clamp) }}>
            <Mover
              from={{ x: STAGE.ENVELOPE_WIDE.x, y: STAGE.ENVELOPE_WIDE.y, scale: 1 }}
              to={{ x: STAGE.CLI_INPUT_SLOT.x, y: STAGE.CLI_INPUT_SLOT.y, scale: 0.28 }}
              startFrame={260}
              durationInFrames={40}
            >
              {bigEnvelope(0, [3])}
            </Mover>
          </div>
        ) : null}

        {/* 조명 2: chat.db 와 검사 상자 */}
        <Spotlight
          rects={[STAGE.CHAT_DB, { x: CHECK.x, y: CHECK.y, width: CHECK.width, height: CHECK_HEIGHT, corner: true }]}
          opacity={0.55}
          from={700}
          until={790}
        />
        {frame < 800 ? (
          <div
            style={{
              position: "absolute",
              left: CHECK.x,
              top: CHECK.y,
              opacity: interpolate(frame, [790, 800], [1, 0], clamp),
            }}
          >
            <CodeBlock
              x={0}
              y={0}
              width={CHECK.width}
              code={CHECK_8}
              fontSize={CHECK.fontSize}
              showLineNumbers={false}
              startFrame={700}
              framesPerLine={8} // C8 판정 ①: 03 의 14 로는 넷째 조건이 762 에 나와 740 still 에 다 안 보인다
              title="pre-reply.js — 확정 조건 (common/hooks/pre-reply.js:64-65)"
            />
          </div>
        ) : null}
        <Label x={STAGE.SERVER.x} y={EXIT_Y} text="exit 0" size={18} tone="cli" from={770} until={800} />
      </Stage>
      <Caption text={'봇은 "이렇게 읽었습니다" 표를 보이고 셋까지만 묻는다.'} from={130} durationInFrames={330} />
      <Caption
        text={'사람이 "확정" 이라 해야 카드가 확정되고, 그것을 지침이 아니라 훅이 DB 로 확인한다.'}
        from={640}
        durationInFrames={280}
      />
    </AbsoluteFill>
  );
};
