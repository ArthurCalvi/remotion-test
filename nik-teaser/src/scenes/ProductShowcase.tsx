import { AbsoluteFill, useVideoConfig, staticFile, useCurrentFrame, interpolate, Sequence } from "remotion";
import { Video, Audio } from "@remotion/media";
import { theme } from "../NikTeaser";

// Caption position type
type CaptionPosition = "bottom-center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "center-big" | "center-right" | "center-top" | "center-bottom";

// Video clip configuration
type ClipConfig = {
  src: string;
  trimStart: number; // in seconds
  trimEnd: number; // in seconds
  duration: number; // in seconds (how long to show in our video)
  playbackRate?: number;
  caption: string;
  captionPosition?: CaptionPosition;
};

// All clips with their timings - respecting chronological order within each source
const clips: ClipConfig[] = [
  {
    src: "/videos/beach-better.mov",
    trimStart: 32,
    trimEnd: 34,
    duration: 2,
    caption: "Forget about complex UI",
    captionPosition: "center",
  },
  {
    src: "/videos/alpha-2-demo.mov",
    trimStart: 1,
    trimEnd: 4,
    duration: 3,
    caption: "Introducing your AI assistant",
    captionPosition: "center-right",
  },
  {
    src: "/videos/alpha-2-demo.mov",
    trimStart: 30,
    trimEnd: 75,
    duration: 5,
    playbackRate: 10,
    caption: "Watch your intent come to life",
    captionPosition: "center-right",
  },
  {
    src: "/videos/alpha-2-demo.mov",
    trimStart: 21,
    trimEnd: 23,
    duration: 3,
    caption: "One click. Any style.",
    captionPosition: "center-right",
  },
  {
    src: "/videos/ansel-adams.mov",
    trimStart: 66,
    trimEnd: 68,
    duration: 3,
    caption: "Instant transformation",
    captionPosition: "center-top",
  },
  {
    src: "/videos/ansel-adams.mov",
    trimStart: 72,
    trimEnd: 75,
    duration: 3,
    caption: "Every detail preserved",
    captionPosition: "center-top",
  },
  {
    src: "/videos/alpha-2-demo.mov",
    trimStart: 89,
    trimEnd: 91,
    duration: 2,
    caption: "Just describe what you want",
    captionPosition: "center-right",
  },
  {
    src: "/videos/manon.mov",
    trimStart: 79,
    trimEnd: 82,
    duration: 3,
    caption: "Fine control when you need it",
    captionPosition: "bottom-center",
  },
  {
    src: "/videos/alpha-2-demo.mov",
    trimStart: 130,
    trimEnd: 132,
    duration: 2,
    caption: "Professional-grade adjustments",
    captionPosition: "center-right",
  },
  {
    src: "/videos/manon.mov",
    trimStart: 96,
    trimEnd: 98,
    duration: 3,
    caption: "Gallery-ready in seconds",
    captionPosition: "center-bottom",
  },
  {
    src: "/videos/alpha-2-demo.mov",
    trimStart: 145,
    trimEnd: 147,
    duration: 2,
    caption: "Done.",
    captionPosition: "center-big",
  },
];

// Get position styles for caption
// Positions moved 20% closer to center, font sizes increased
const getPositionStyles = (position: CaptionPosition): React.CSSProperties => {
  const base: React.CSSProperties = {
    position: "absolute",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 40,
    fontWeight: 500,
    color: theme.text,
    textShadow: "0 2px 20px rgba(0,0,0,0.9), 0 4px 40px rgba(0,0,0,0.5)",
    letterSpacing: -0.5,
    padding: "0 60px",
  };

  switch (position) {
    case "top-left":
      return { ...base, top: 170, left: 60, textAlign: "left" };
    case "top-right":
      return { ...base, top: 170, right: 60, textAlign: "right" };
    case "bottom-left":
      return { ...base, bottom: 170, left: 60, textAlign: "left" };
    case "bottom-right":
      return { ...base, bottom: 170, right: 60, textAlign: "right" };
    case "center":
      return { ...base, top: "50%", left: 0, right: 0, textAlign: "center", transform: "translateY(-50%)", fontSize: 52, fontWeight: 600 };
    case "center-big":
      return { ...base, top: "50%", left: 0, right: 0, textAlign: "center", transform: "translateY(-50%)", fontSize: 96, fontWeight: 700, letterSpacing: 2 };
    case "center-right":
      return { ...base, top: "50%", right: 120, left: "auto", textAlign: "right", transform: "translateY(-50%)", padding: 0 };
    case "center-top":
      return { ...base, top: 190, left: 0, right: 0, textAlign: "center" };
    case "center-bottom":
      return { ...base, bottom: 190, left: 0, right: 0, textAlign: "center" };
    case "bottom-center":
    default:
      return { ...base, bottom: 170, left: 0, right: 0, textAlign: "center" };
  }
};

// Caption component - varied positions with subtle movement
const Caption: React.FC<{ text: string; durationInFrames: number; position?: CaptionPosition }> = ({
  text,
  durationInFrames,
  position = "bottom-center"
}) => {
  const frame = useCurrentFrame();

  // Delay caption appearance by 15 frames (~0.5s) to let video load
  const fadeInStart = 15;
  const fadeInEnd = 25;
  const fadeOutStart = durationInFrames - 20;
  const fadeOutEnd = durationInFrames - 8;

  const opacity = interpolate(
    frame,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Subtle drift movement (only during visible period)
  const driftX = interpolate(frame, [fadeInStart, durationInFrames], [0, 6], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const driftY = interpolate(frame, [fadeInStart, durationInFrames], [0, -3], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const positionStyles = getPositionStyles(position);
  const existingTransform = positionStyles.transform || "";

  return (
    <div
      style={{
        ...positionStyles,
        opacity,
        transform: `${existingTransform} translate(${driftX}px, ${driftY}px)`.trim(),
      }}
    >
      {text}
    </div>
  );
};

// Single video clip component with caption
const VideoClip: React.FC<{
  config: ClipConfig;
  durationInFrames: number;
}> = ({ config, durationInFrames }) => {
  const { fps } = useVideoConfig();
  const { src, trimStart, trimEnd, playbackRate = 1, caption, captionPosition } = config;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      <Video
        src={staticFile(src)}
        trimBefore={Math.floor(trimStart * fps)}
        playbackRate={playbackRate}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <Caption text={caption} durationInFrames={durationInFrames} position={captionPosition} />
    </AbsoluteFill>
  );
};

// Main Product Showcase component
export const ProductShowcase: React.FC = () => {
  const { fps } = useVideoConfig();

  // Calculate start frames for each clip (direct cuts, no transitions)
  let currentFrame = 0;
  const clipStartFrames: number[] = [];

  clips.forEach((clip) => {
    clipStartFrames.push(currentFrame);
    currentFrame += Math.floor(clip.duration * fps);
  });

  const lastClipIndex = clips.length - 1;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      {/* Video clips */}
      {clips.map((clip, index) => {
        const durationInFrames = Math.floor(clip.duration * fps);
        return (
          <Sequence
            key={`clip-${index}`}
            from={clipStartFrames[index]}
            durationInFrames={durationInFrames}
          >
            <VideoClip config={clip} durationInFrames={durationInFrames} />
          </Sequence>
        );
      })}

      {/* Whoosh sounds between clips (skip first clip) */}
      {clips.slice(1).map((_, index) => (
        <Sequence
          key={`whoosh-${index}`}
          from={clipStartFrames[index + 1]}
          durationInFrames={15}
        >
          <Audio
            src={staticFile("/audio/sfx/whoosh-end-384629.mp3")}
            volume={0.15}
          />
        </Sequence>
      ))}

      {/* Complete/notification sound at "Done." */}
      <Sequence from={clipStartFrames[lastClipIndex]} durationInFrames={30}>
        <Audio
          src={staticFile("/audio/sfx/new-notification-07-210334.mp3")}
          volume={0.4}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
