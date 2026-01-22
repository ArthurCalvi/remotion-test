import { AbsoluteFill, Sequence, useVideoConfig, staticFile, useCurrentFrame, interpolate } from "remotion";
import { Audio } from "@remotion/media";
import { TerminalIntro } from "./scenes/TerminalIntro";
import { ProductShowcase } from "./scenes/ProductShowcase";
import { Outro } from "./scenes/Outro";

// Flash/Glitch transition component
const FlashTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Duration of transition effect (in frames)
  const transitionDuration = Math.floor(fps * 0.4); // 0.4 seconds

  // Flash intensity - bright white flash that fades
  const flashOpacity = interpolate(
    frame,
    [0, 3, transitionDuration * 0.3, transitionDuration],
    [0, 1, 0.8, 0],
    { extrapolateRight: "clamp" }
  );

  // Glitch bars
  const showGlitch = frame < transitionDuration * 0.5;
  const glitchBars = showGlitch ? [
    { top: "20%", height: "3px", delay: 0 },
    { top: "45%", height: "8px", delay: 2 },
    { top: "70%", height: "2px", delay: 1 },
    { top: "85%", height: "5px", delay: 3 },
  ] : [];

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* White flash */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#ffffff",
          opacity: flashOpacity,
        }}
      />

      {/* Glitch horizontal bars */}
      {glitchBars.map((bar, i) => {
        const barOpacity = frame > bar.delay ? interpolate(
          frame - bar.delay,
          [0, 2, 6],
          [0, 1, 0],
          { extrapolateRight: "clamp" }
        ) : 0;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: bar.top,
              left: 0,
              right: 0,
              height: bar.height,
              backgroundColor: "#4ade80",
              opacity: barOpacity * 0.8,
              boxShadow: "0 0 20px #4ade80",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Theme colors - Elegant minimal, Apple-inspired
export const theme = {
  background: "#0a0a0a",
  primary: "#4ade80", // Softer green
  secondary: "#38bdf8", // Softer blue/cyan
  accent: "#a78bfa", // Soft purple
  text: "#ffffff",
  muted: "#71717a", // Warmer gray
  subtle: "#27272a", // For borders/cards
};

export const NikTeaser: React.FC = () => {
  const { fps } = useVideoConfig();

  // Timeline in seconds
  const TERMINAL_DURATION = 6; // 6s terminal intro (last second = tension build)
  const SHOWCASE_DURATION = 31; // 31s product showcase (clips total 31s)
  const OUTRO_DURATION = 5; // 5s outro

  // Convert to frames
  const terminalFrames = TERMINAL_DURATION * fps;
  const showcaseFrames = SHOWCASE_DURATION * fps;
  const outroFrames = OUTRO_DURATION * fps;


  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      {/* Background music - Adrian Berenguer - Epoch */}
      {/* Start at 25s in the track (drop is at 30s = 5s into our video) */}
      <Audio
        src={staticFile("/audio/epoch.mp3")}
        trimBefore={Math.floor(25 * fps)}
        volume={0.8}
      />

      {/* Scenes */}
      {/* Terminal Intro (0-6s) */}
      <Sequence from={0} durationInFrames={terminalFrames}>
        <TerminalIntro />
      </Sequence>

      {/* Flash transition at the cut + impact sound */}
      <Sequence from={terminalFrames - 3} durationInFrames={Math.floor(fps * 0.4)}>
        <FlashTransition />
        <Audio
          src={staticFile("/audio/sfx/bip-sound-189733.mp3")}
          volume={0.5}
        />
      </Sequence>

      {/* Product Showcase (6s-37s) */}
      <Sequence from={terminalFrames} durationInFrames={showcaseFrames}>
        <ProductShowcase />
      </Sequence>

      {/* Outro (37s-42s) */}
      <Sequence from={terminalFrames + showcaseFrames} durationInFrames={outroFrames}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
