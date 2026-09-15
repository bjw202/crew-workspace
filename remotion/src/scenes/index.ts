// 장면 목록. 각 장면 파일의 DURATION 을 누적해 from 을 만든다 (04 1절).
import { DURATION as D01, S01, STILLS as ST01 } from "./S01";
import { DURATION as D02, S02, STILLS as ST02 } from "./S02";
import { DURATION as D03, S03, STILLS as ST03 } from "./S03";
import { DURATION as D04, S04, STILLS as ST04 } from "./S04";
import { DURATION as D05, S05, STILLS as ST05 } from "./S05";
import { DURATION as D06, S06, STILLS as ST06 } from "./S06";
import { DURATION as D07, S07, STILLS as ST07 } from "./S07";
import { DURATION as D08, S08, STILLS as ST08 } from "./S08";
import { DURATION as D09, S09, STILLS as ST09 } from "./S09";
import { DURATION as D10, S10, STILLS as ST10 } from "./S10";
import { DURATION as D11, S11, STILLS as ST11 } from "./S11";
import { DURATION as D12, S12, STILLS as ST12 } from "./S12";
import { DURATION as D13, S13, STILLS as ST13 } from "./S13";
import { DURATION as D14, S14, STILLS as ST14 } from "./S14";

export const TOTAL_FRAMES = 9990;

type SceneEntry = { id: string; component: React.FC; durationInFrames: number; stills: number[] };

const LIST: SceneEntry[] = [
  { id: "S01", component: S01, durationInFrames: D01, stills: ST01 },
  { id: "S02", component: S02, durationInFrames: D02, stills: ST02 },
  { id: "S03", component: S03, durationInFrames: D03, stills: ST03 },
  { id: "S04", component: S04, durationInFrames: D04, stills: ST04 },
  { id: "S05", component: S05, durationInFrames: D05, stills: ST05 },
  { id: "S06", component: S06, durationInFrames: D06, stills: ST06 },
  { id: "S07", component: S07, durationInFrames: D07, stills: ST07 },
  { id: "S08", component: S08, durationInFrames: D08, stills: ST08 },
  { id: "S09", component: S09, durationInFrames: D09, stills: ST09 },
  { id: "S10", component: S10, durationInFrames: D10, stills: ST10 },
  { id: "S11", component: S11, durationInFrames: D11, stills: ST11 },
  { id: "S12", component: S12, durationInFrames: D12, stills: ST12 },
  { id: "S13", component: S13, durationInFrames: D13, stills: ST13 },
  { id: "S14", component: S14, durationInFrames: D14, stills: ST14 },
];

export const SCENES = LIST.reduce<(SceneEntry & { from: number })[]>((acc, s) => {
  const prev = acc[acc.length - 1];
  acc.push({ ...s, from: prev ? prev.from + prev.durationInFrames : 0 });
  return acc;
}, []);

const sum = LIST.reduce((n, s) => n + s.durationInFrames, 0);
if (sum !== TOTAL_FRAMES) {
  throw new Error(`장면 프레임 합 ${sum} 이 ${TOTAL_FRAMES} 가 아니다`);
}
