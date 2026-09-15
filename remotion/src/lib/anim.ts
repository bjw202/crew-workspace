// 공통 움직임 도우미. plan/04-implementation.md 4.2 · 4.3.
import { Easing, interpolate } from "remotion";
import type { Camera } from "./stage";
import type { Point } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const FADE = 8; // 나타남 · 사라짐
export const RISE = 12; // 나타날 때 올라오는 px

export const fadeIn = (frame: number, from: number, dur = FADE) =>
  interpolate(frame, [from, from + dur], [0, 1], clamp);

export const between = (frame: number, from?: number, until?: number) =>
  (from == null || frame >= from) && (until == null || frame < until);

/** 0~1: from 에서 fade 동안 오르고, until-fade 부터 내려 until 에 0 */
export const visible = (frame: number, from?: number, until?: number, fade = FADE) => {
  const up = from == null ? 1 : interpolate(frame, [from, from + fade], [0, 1], clamp);
  const down = until == null ? 1 : interpolate(frame, [until - fade, until], [1, 0], clamp);
  return Math.min(up, down);
};

/** 나타남 세기(0~1)에 맞춘 올라오기 translateY */
export const rise = (v: number) => `translateY(${(1 - v) * RISE}px)`;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const lerpCamera = (a: Camera, b: Camera, t: number): Camera => ({
  scale: lerp(a.scale, b.scale, t),
  cx: lerp(a.cx, b.cx, t),
  cy: lerp(a.cy, b.cy, t),
});

/** 카메라 · 이동 보간 (inOut cubic) 의 진행 0~1 */
export const eased = (frame: number, from: number, dur: number) =>
  interpolate(frame, [from, from + Math.max(1, dur)], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

/** SSE 점선 반복 */
export const loop = (frame: number, from: number, period: number) =>
  frame < from ? 0 : ((frame - from) % period) / period;

export const typed = (text: string, frame: number, from: number, until: number) =>
  text.slice(
    0,
    Math.round(interpolate(frame, [from, Math.max(from + 1, until)], [0, text.length], clamp)),
  );

/** lit: boolean | 0~1 → 세기 */
export const litLevel = (lit?: boolean | number) =>
  typeof lit === "number" ? Math.min(1, Math.max(0, lit)) : lit ? 1 : 0;

// ── 꺾은선 기하 (AnchorLine) ─────────────────────────────
export const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

export const polylineLength = (points: Point[]) => {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += dist(points[i - 1], points[i]);
  return total;
};

/** 꺾은선 앞에서부터 d 만큼 간 자리까지의 점들 · 끝점 · 끝 방향(라디안) */
export const walkPolyline = (points: Point[], d: number) => {
  const out: Point[] = [points[0]];
  let left = Math.max(0, d);
  let angle = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const len = dist(a, b);
    angle = Math.atan2(b.y - a.y, b.x - a.x);
    if (left <= len) {
      const t = len === 0 ? 0 : left / len;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      return { points: out, tip: out[out.length - 1], angle };
    }
    out.push(b);
    left -= len;
  }
  return { points: out, tip: out[out.length - 1], angle };
};

export const pathD = (points: Point[]) =>
  points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
