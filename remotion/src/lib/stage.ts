// 무대 좌표. 값은 plan/04-implementation.md 2절 · plan/03-storyboard.md 0절.
// 장면 파일은 숫자를 새로 적지 않고 STAGE.* 를 쓴다. 상자는 Node 와 같은 규약(가운데 x·y · width · height).
import { Point } from "./theme";

export type Box = { x: number; y: number; width: number; height: number }; // 가운데 좌표

export const STAGE = {
  W: 1920,
  H: 1080,
  FPS: 30,

  // ── 전경 (mode: 'overview') ────────────────────────────
  PILLAR_TOP: 100,
  PILLAR_H: 500,
  BROWSER: { x: 300, y: 350, width: 360, height: 500 }, // 120~480 · 100~600
  SERVER: { x: 960, y: 350, width: 400, height: 500 }, // 760~1160
  CLI: { x: 1620, y: 350, width: 360, height: 500 }, // 1440~1800

  CHAT_DB: { x: 858, y: 520, width: 184, height: 136 }, // 서버 속 왼쪽 원통 (04 6.5: 폭 184 · 높이 136)
  COCKPIT_DB: { x: 1062, y: 520, width: 184, height: 136 }, // 서버 속 오른쪽 원통
  MCP_BOX: { x: 960, y: 300, width: 300, height: 64 }, // "MCP 도구 cockpit · src/mcp/tools.js"
  MCP_ARROW_TIP_X: 1140, // reply · fetch_history 화살표 끝 (MCP 이름표 글자에 닿지 않게, C6 판정)

  // 기둥 속 자리 (기둥 x 는 각 기둥의 것, y 만 여기)
  PILLAR_TITLE_Y: 130, // 제목 띠 100~160
  PILLAR_BODY_TOP: 170, // 속 170~590
  SERVER_LABEL_Y: 215, // createRoom · manager.start · bootResume 자리
  SERVER_LABEL2_Y: 240, // insertBotMessage · compact_boundary 자리
  SERVER_KICK_Y: [360, 390, 420], // #kick · pendingInbox · wrapChannel
  CLI_TREE: { x: 1460, y: 175, width: 320 }, // CLI 속 FolderTree 왼쪽 위
  CLI_INPUT_SLOT: { x: 1470, y: 200 }, // 겉봉투 · 옵션 상자가 도착하는 자리

  // 화살표 줄 (기둥 사이 y)
  ARROW_TOP_Y: 280, // 브라우저→서버 요청
  ARROW_MID_Y: 300, // CLI→서버 MCP (reply · fetch_history)
  ARROW_TOOL_Y: 380, // canUseTool · allow
  ARROW_SSE_Y: 420, // 서버→브라우저 SSE
  GAP_L: { from: { x: 488, y: 0 }, to: { x: 752, y: 0 } }, // 브라우저 오른변+8 ~ 서버 왼변-8
  GAP_R: { from: { x: 1432, y: 0 }, to: { x: 1168, y: 0 } }, // CLI 왼변-8 ~ 서버 오른변+8

  // ── 바닥 ───────────────────────────────────────────────
  FLOOR_Y: 680,
  PRODEV: { x: 650, y: 800, width: 1060, height: 200 }, // 120~1180 · 700~900
  ROOT_CLAUDE: { x: 250, y: 765, width: 200, height: 44 },
  ROOT_SKILLS: { x: 480, y: 765, width: 240, height: 44 },
  ROOT_AGENTS: { x: 250, y: 835, width: 200, height: 44 },
  ROOT_HOOKS: { x: 480, y: 835, width: 240, height: 44 },
  BOTS_BOX: { x: 1010, y: 810, width: 300, height: 160 }, // 860~1160 · 730~890
  BOT_FOLDER: { x: 1010, y: 830, width: 260, height: 100 }, // 880~1140 · 780~880
  BOT_TREE: { x: 890, y: 812, width: 240 }, // 04 6.5: 봇 폴더 제목 줄과 안 겹치게 800 → 812
  PROJECT: { x: 1550, y: 800, width: 500, height: 200 }, // 1300~1800 · 700~900
  PROJECT_TREE: { x: 1320, y: 735, width: 460 },
  ANCHOR: [
    { x: 1620, y: 600 },
    { x: 1620, y: 650 },
    { x: 1010, y: 650 },
    { x: 1010, y: 780 },
  ] as Point[],
  ANCHOR_CLIMB: [
    { x: 1010, y: 780 },
    { x: 1010, y: 735 },
    { x: 860, y: 735 },
    { x: 860, y: 705 },
    { x: 140, y: 705 },
  ] as Point[],
  CONTEXT_BAR: { x: 1848, y: 350, width: 36, height: 500 },

  // 떠 있는 상자 (겉봉투 · 옵션 · 검사표) 의 기본 자리 — 왼쪽 위 좌표
  OVERLAY: { x: 560, y: 120, width: 800 },
  ENVELOPE_BIG: { x: 460, y: 130, width: 1000 },
  ENVELOPE_WIDE: { x: 400, y: 120, width: 1120 },

  // ── 바닥 확대 (mode: 'floor') ───────────────────────────
  MINI: { y: 60, height: 56, width: 320, BROWSER_X: 300, SERVER_X: 960, CLI_X: 1620 },
  PRODEV_BIG: { x: 500, y: 540, width: 880, height: 720 }, // 60~940 · 180~900
  BIG_ROOT: { x: 90, y: 240, width: 560 },
  BIG_BOT_FOLDER: { x: 700, y: 780, width: 420, height: 180 }, // 490~910 · 690~870
  BIG_BOT_TREE: { x: 500, y: 720, width: 400 },
  PROJECT_BIG: { x: 1420, y: 540, width: 900, height: 720 }, // 970~1870 · 180~900
  BIG_PROJECT_LEFT: { x: 1000, width: 400 }, // 기억의 층 · 찾기 층
  BIG_PROJECT_RIGHT: { x: 1440, y: 200, width: 400 }, // 과제 문서
  LEFT_PANEL: { x: 80, y: 140, width: 820, height: 740 }, // S13 지시형 · 관찰형 판

  // ── 카메라 ─────────────────────────────────────────────
  CAMERAS: {
    OVERVIEW: { scale: 1, cx: 960, cy: 540 },
    SERVER: { scale: 1.35, cx: 900, cy: 420 },
    RIGHT: { scale: 1, cx: 1560, cy: 540 },
    FLOOR_ZOOM: { scale: 2.2, cx: 1550, cy: 800 }, // floor 로 넘어갈 때 지나가는 값
  },
} as const;

export type Camera = { scale: number; cx: number; cy: number };

/** 카메라를 CSS transform 으로. 초점(cx,cy)이 화면 가운데(960,540)에 오도록. transform-origin 은 0 0 */
export const cameraTransform = (c: Camera) =>
  `translate(${960 - c.cx * c.scale}px, ${540 - c.cy * c.scale}px) scale(${c.scale})`;
