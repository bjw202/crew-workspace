import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { eased, lerpCamera } from "./anim";
import { AnchorLine } from "./AnchorLine";
import { Cylinder, CylinderChip, CylinderRow } from "./Cylinder";
import { FileCard } from "./FileCard";
import { FolderBox } from "./FolderBox";
import { Pillar, PillarStatus } from "./Pillar";
import { Camera, cameraTransform, STAGE } from "./stage";
import { THEME, Tone, tone as toneColor, withAlpha } from "./theme";

export type PillarState = {
  status?: PillarStatus;
  title?: string;
  subtitle?: string;
  statusText?: string;
  enterFrame?: number;
  dim?: boolean | number;
  children?: React.ReactNode;
};

export type CylinderState = {
  rows?: CylinderRow[];
  chips?: CylinderChip[];
  dim?: boolean | number;
  enterFrame?: number;
};

export type FloorBoxState = {
  dim?: number;
  glowFrom?: number;
  glowUntil?: number;
  enterFrame?: number;
  children?: React.ReactNode;
};

export type MiniChip = { title?: string; sub?: string; lit?: boolean | number; tone?: Tone };
export type MiniState = { browser?: MiniChip; server?: MiniChip; cli?: MiniChip };

export type StageProps = {
  mode?: "overview" | "floor";
  camera?: Camera;
  /** 바닥 선이 왼쪽에서 그어진 정도 0~1 */
  floorProgress?: number;
  /** false 면 그리지 않는다. 안 주면 기본(브라우저 · 서버 on, CLI off) */
  browser?: PillarState | false;
  server?: PillarState | false;
  cli?: PillarState | false;
  /** 안 주면 그리지 않는다 */
  chatDb?: CylinderState;
  cockpitDb?: CylinderState;
  /** false 면 그리지 않는다. 안 주면 밝게 */
  prodev?: FloorBoxState | false;
  project?: FloorBoxState | false;
  /** 안 주면 그리지 않는다 */
  botsBox?: FloorBoxState;
  botFolder?: FloorBoxState;
  rootCards?: boolean;
  anchor?: number;
  anchorClimb?: number;
  transition?: { to: "floor" | "overview"; from: number; durationInFrames: number };
  /** 무대 좌표로 겹쳐 그린다 (overview 면 카메라 transform 안) */
  children?: React.ReactNode;
  /** floor 때 MINI 띠 셋 */
  mini?: MiniState;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const MiniChipView: React.FC<{ x: number; chip: MiniChip; title: string; tone: Tone }> = ({ x, chip, title, tone }) => {
  const color = toneColor(chip.tone ?? tone);
  const lit = typeof chip.lit === "number" ? chip.lit : chip.lit ? 1 : 0;
  const { width, height, y } = STAGE.MINI;
  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        boxSizing: "border-box",
        borderRadius: THEME.radiusSmall,
        border: `2px solid ${color}`,
        backgroundColor: withAlpha(color, 0.06 + 0.12 * lit),
        boxShadow: lit > 0 ? THEME.glow(withAlpha(color, 0.45 * lit)) : undefined,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 12px",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      <span style={{ fontFamily: THEME.fonts.sans, fontSize: 18, fontWeight: 700, color: THEME.colors.text }}>
        {chip.title ?? title}
      </span>
      {chip.sub ? (
        <span
          style={{
            fontFamily: THEME.fonts.mono,
            fontSize: 13,
            color: lit > 0.5 ? color : THEME.colors.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {chip.sub}
        </span>
      ) : null}
    </div>
  );
};

const Overview: React.FC<StageProps> = ({
  floorProgress = 1,
  browser,
  server,
  cli,
  chatDb,
  cockpitDb,
  prodev,
  project,
  botsBox,
  botFolder,
  rootCards = false,
  anchor = 0,
  anchorClimb = 0,
}) => {
  const fp = Math.min(1, Math.max(0, floorProgress));
  const prodevDim = prodev ? (prodev.dim ?? 1) : 1;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: STAGE.FLOOR_Y - 1,
          width: STAGE.W * fp,
          height: 2,
          backgroundColor: withAlpha(THEME.colors.file, 0.7),
        }}
      />
      {prodev !== false ? <FolderBox box={STAGE.PRODEV} title="prodev 저장소" tone="file" {...prodev} /> : null}
      {rootCards && prodev !== false ? (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: prodevDim }}>
          <FileCard {...STAGE.ROOT_CLAUDE} name="CLAUDE.md" tone="file" />
          <FileCard {...STAGE.ROOT_SKILLS} name=".claude/skills (15)" tone="file" />
          <FileCard {...STAGE.ROOT_AGENTS} name=".claude/agents (6)" tone="file" />
          <FileCard {...STAGE.ROOT_HOOKS} name="common/hooks (3)" tone="file" />
        </div>
      ) : null}
      {botsBox ? <FolderBox box={STAGE.BOTS_BOX} title="bots/" tone="file" {...botsBox} /> : null}
      {botFolder ? <FolderBox box={STAGE.BOT_FOLDER} title="prodev-수율개선-bot" tone="file" {...botFolder} /> : null}
      {project !== false ? <FolderBox box={STAGE.PROJECT} title="projects/수율개선/" tone="file" {...project} /> : null}

      {browser !== false ? (
        <Pillar box={STAGE.BROWSER} title="브라우저" subtitle="web/app.js" tone="human" status="on" {...browser} />
      ) : null}
      {server !== false ? (
        <Pillar
          box={STAGE.SERVER}
          title="cockpit 서버"
          subtitle="node bin/cockpit.js serve"
          tone="server"
          status="on"
          {...server}
        />
      ) : null}
      {cli !== false ? (
        <Pillar box={STAGE.CLI} title="Claude Code CLI" subtitle="(봇)" tone="cli" status="off" {...cli} />
      ) : null}

      {chatDb ? (
        <Cylinder box={STAGE.CHAT_DB} name="chat.db" tone="server" rows={[]} chipSide="left" {...chatDb} />
      ) : null}
      {cockpitDb ? (
        <Cylinder box={STAGE.COCKPIT_DB} name="cockpit.db" tone="server" rows={[]} chipSide="right" {...cockpitDb} />
      ) : null}

      <AnchorLine
        points={STAGE.ANCHOR}
        progress={anchor}
        climb={anchorClimb > 0 ? { points: STAGE.ANCHOR_CLIMB, progress: anchorClimb } : undefined}
      />
    </>
  );
};

const Floor: React.FC<StageProps> = ({ prodev, project, botFolder, mini = {} }) => (
  <>
    <MiniChipView x={STAGE.MINI.BROWSER_X} chip={mini.browser ?? {}} title="브라우저" tone="human" />
    <MiniChipView x={STAGE.MINI.SERVER_X} chip={mini.server ?? {}} title="cockpit 서버" tone="server" />
    <MiniChipView x={STAGE.MINI.CLI_X} chip={mini.cli ?? {}} title="Claude Code CLI" tone="cli" />
    {prodev !== false ? <FolderBox box={STAGE.PRODEV_BIG} title="prodev 저장소" tone="file" {...prodev} /> : null}
    <FolderBox box={STAGE.BIG_BOT_FOLDER} title="bots/prodev-수율개선-bot" tone="file" {...botFolder} />
    {project !== false ? <FolderBox box={STAGE.PROJECT_BIG} title="projects/수율개선/" tone="file" {...project} /> : null}
  </>
);

/**
 * 무대의 고정 부분. overview 는 세 기둥 · 원통 · 바닥, floor 는 MINI 띠 + PRODEV_BIG + BIG_BOT_FOLDER + PROJECT_BIG.
 * transition 이 있으면 두 배치를 교차 페이드하고(옛 배치 0~75%, 새 배치 25~100%) 카메라를 FLOOR_ZOOM 과 잇는다 (04 4.2).
 */
export const Stage: React.FC<StageProps> = (props) => {
  const { mode = "overview", camera, transition, children } = props;
  const frame = useCurrentFrame();
  const base = camera ?? STAGE.CAMERAS.OVERVIEW;
  const zoom = STAGE.CAMERAS.FLOOR_ZOOM;

  let overviewOpacity = mode === "overview" ? 1 : 0;
  let floorOpacity = mode === "floor" ? 1 : 0;
  let overviewCam: Camera = base;
  let childMode = mode;

  if (transition) {
    const { to, from: t0, durationInFrames: d } = transition;
    const out = interpolate(frame, [t0, t0 + d * 0.75], [1, 0], clamp);
    const inn = interpolate(frame, [t0 + d * 0.25, t0 + d], [0, 1], clamp);
    if (to === "floor") {
      overviewOpacity = out;
      floorOpacity = inn;
      overviewCam = lerpCamera(base, zoom, eased(frame, t0, d * 0.75));
    } else {
      floorOpacity = out;
      overviewOpacity = inn;
      overviewCam = lerpCamera(zoom, base, eased(frame, t0, d));
    }
    childMode = frame < t0 + d / 2 ? (to === "floor" ? "overview" : "floor") : to;
  }

  const layer = (opacity: number, transform?: string): React.CSSProperties => ({
    position: "absolute",
    left: 0,
    top: 0,
    width: STAGE.W,
    height: STAGE.H,
    transformOrigin: "0 0",
    transform,
    opacity,
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {overviewOpacity > 0 ? (
        <div style={layer(overviewOpacity, cameraTransform(overviewCam))}>
          <Overview {...props} />
        </div>
      ) : null}
      {floorOpacity > 0 ? (
        <div style={layer(floorOpacity)}>
          <Floor {...props} />
        </div>
      ) : null}
      {children ? (
        <div style={layer(1, childMode === "overview" ? cameraTransform(overviewCam) : undefined)}>{children}</div>
      ) : null}
    </AbsoluteFill>
  );
};
