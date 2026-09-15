import { AbsoluteFill, Composition, Sequence } from "remotion";
import { THEME } from "./lib/theme";
import { SCENES, TOTAL_FRAMES } from "./scenes";
import { Demo, DEMO_DURATION } from "./scenes/_Demo";
import { Parts, PARTS_DURATION } from "./scenes/_Parts";

const Main: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: THEME.colors.background }}>
    {SCENES.map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.durationInFrames} name={s.id}>
        <s.component />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// 장면 Composition 은 배경을 깔고 장면 하나만 그린다 (still 검수용, 04 6절)
const withBackground = (Scene: React.FC): React.FC => {
  const Wrapped: React.FC = () => (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.background }}>
      <Scene />
    </AbsoluteFill>
  );
  return Wrapped;
};

const SCENE_COMPONENTS = SCENES.map((s) => ({ ...s, wrapped: withBackground(s.component) }));

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Main" component={Main} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      {SCENE_COMPONENTS.map((s) => (
        <Composition
          key={s.id}
          id={s.id}
          component={s.wrapped}
          durationInFrames={s.durationInFrames}
          fps={30}
          width={1920}
          height={1080}
        />
      ))}
      <Composition id="Demo" component={Demo} durationInFrames={DEMO_DURATION} fps={30} width={1920} height={1080} />
      <Composition id="Parts" component={Parts} durationInFrames={PARTS_DURATION} fps={30} width={1920} height={1080} />
    </>
  );
};
