import { Composition } from "remotion";
import { NikTeaser } from "./NikTeaser";

// Video specs
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const DURATION_SECONDS = 42;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="NikTeaser"
      component={NikTeaser}
      durationInFrames={DURATION_SECONDS * FPS}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
