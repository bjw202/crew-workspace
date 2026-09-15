// 색 · 글꼴 · 크기. 값은 plan/04-implementation.md 3절.
// 색은 넷(human · server · cli · file) + 경고(warn) 하나 + 배경 · 글자. 그 밖의 색은 없다.
export const THEME = {
  colors: {
    background: "#0f1216",
    surface: "#1a1f26",
    surfaceRaised: "#222933",
    border: "#2e3642",
    text: "#e8eaed",
    textMuted: "#9aa4b2",
    off: "#5b6573", // 꺼진 기둥 테두리 · 흐린 줄

    human: "#e8c15a", // 사람 · 브라우저 · 사람이 보낸 글 · admin 승인
    server: "#4f9dff", // cockpit 서버 · DB 둘 · SSE · MCP 상자
    cli: "#7dd3a0", // Claude Code CLI · 봇 · 닻줄 · 훅 · 스킬
    file: "#c9a27e", // 바닥 · 파일 · 폴더 · 카드
    warn: "#ff5c5c", // exit 2 · deny · "굳히지 않는다"

    accent: "#4f9dff", // = server (Node · CodeBlock 기본값용)
    arrow: "#8a96a8", // 색을 안 준 화살표 (쓰지 않는 것이 원칙)
    codeBackground: "#12161c",
    lineNumber: "#5b6573",
    highlightLine: "rgba(79, 157, 255, 0.16)",
    captionBackground: "rgba(0, 0, 0, 0.62)",
    dim: "rgba(15, 18, 22, 0.72)", // Spotlight 가 덮는 색
  },
  fonts: {
    sans: '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Segoe UI", "Malgun Gothic", sans-serif',
    mono: 'ui-monospace, "SF Mono", Menlo, Consolas, "Malgun Gothic", "Courier New", monospace',
  },
  sizes: {
    caption: 40,
    captionSmall: 28,
    nodeTitle: 34,
    nodeSubtitle: 20,
    pillarTitle: 26,
    pillarSubtitle: 18,
    pillarStatus: 16,
    code: 24,
    envelope: 21,
    codeSmall: 18,
    codeTiny: 16,
    arrowLabel: 20,
    arrowLabelSmall: 14,
    tree: 16,
    treeSmall: 14,
    treeTiny: 13,
    chat: 15,
    chatSmall: 13,
    label: 18,
    labelSmall: 14,
    cylinderName: 16,
    cylinderRow: 14, // 04 6.5: 15 → 14
  },
  radius: 14,
  radiusSmall: 8,
  glow: (color: string) => `0 0 28px 4px ${color}`,
} as const;

export type Point = { x: number; y: number };
export type Tone = "human" | "server" | "cli" | "file" | "warn";
export const tone = (t: Tone) => THEME.colors[t];

/** "#rrggbb" 에 투명도를 붙인다. tone 12% 배경 같은 곳에 쓴다. */
export const withAlpha = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};
