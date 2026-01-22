import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  random,
  Sequence,
  staticFile,
} from "remotion";
import { Audio } from "@remotion/media";
import { theme } from "../NikTeaser";

// Matrix-style background characters
const BackgroundMatrix: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const columns = 40;
  const rows = 20;

  const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ<>{}[]";

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        opacity: 0.06,
      }}
    >
      {Array.from({ length: columns }).map((_, colIdx) => (
        <div
          key={colIdx}
          style={{
            position: "absolute",
            left: `${(colIdx / columns) * 100}%`,
            top: 0,
            fontFamily: "monospace",
            fontSize: 14,
            color: theme.primary,
            lineHeight: 1.2,
            transform: `translateY(${((frame * 0.5 + colIdx * 7) % 100) - 50}%)`,
          }}
        >
          {Array.from({ length: rows }).map((_, rowIdx) => {
            const charIdx = Math.floor(random(`${colIdx}-${rowIdx}-${Math.floor(frame / 3)}`) * chars.length);
            return (
              <div key={rowIdx} style={{ opacity: random(`opacity-${colIdx}-${rowIdx}`) * 0.8 + 0.2 }}>
                {chars[charIdx]}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Animated grid lines
const GridLines: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0.03,
      }}
    >
      {/* Horizontal scanning line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: theme.primary,
          top: `${(frame * 2) % 100}%`,
          boxShadow: `0 0 20px ${theme.primary}`,
          opacity: 0.5,
        }}
      />
      {/* Grid pattern */}
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundImage: `
            linear-gradient(${theme.subtle} 1px, transparent 1px),
            linear-gradient(90deg, ${theme.subtle} 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
};

// Typewriter component
const TypeWriter: React.FC<{
  text: string;
  startFrame: number;
  charFrames?: number;
  style?: React.CSSProperties;
}> = ({ text, startFrame, charFrames = 2, style }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const charsToShow = Math.min(text.length, Math.floor(localFrame / charFrames));
  const displayText = text.slice(0, charsToShow);

  return <span style={style}>{displayText}</span>;
};

// Blinking cursor
const Cursor: React.FC<{ visible?: boolean }> = ({ visible = true }) => {
  const frame = useCurrentFrame();
  const opacity = visible ? (Math.floor(frame / 8) % 2 === 0 ? 1 : 0) : 0;

  return (
    <span
      style={{
        color: theme.primary,
        opacity,
        fontWeight: "normal",
      }}
    >
      │
    </span>
  );
};

// Tech tag component with glitch effect
const TechTag: React.FC<{
  text: string;
  delay: number;
  color?: string;
}> = ({ text, delay, color = theme.secondary }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 150 },
  });

  // Subtle glitch offset
  const glitchX = Math.floor(frame / 4) % 10 === 0 ? random(`glitch-${frame}`) * 2 - 1 : 0;

  if (frame < delay) return null;

  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: `${color}15`,
        border: `1px solid ${color}40`,
        borderRadius: 4,
        padding: "4px 10px",
        marginRight: 10,
        fontSize: 14,
        fontFamily: "monospace",
        color: color,
        transform: `scale(${scale}) translateX(${glitchX}px)`,
        opacity,
      }}
    >
      {text}
    </span>
  );
};

// Animated action line - cycling through different actions before settling
const AnimatedActionLine: React.FC<{
  name: string;
  finalAction: string;
  startFrame: number;
  dotDuration?: number;
}> = ({ name, finalAction, startFrame, dotDuration = 18 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const totalDots = 20;
  const dotsToShow = Math.min(totalDots, Math.floor((localFrame / dotDuration) * totalDots));
  const isComplete = localFrame > dotDuration;

  // Cycling actions during loading
  const loadingActions = [
    "initializing...",
    "connecting...",
    "authenticating...",
    "loading modules...",
    "syncing data...",
    "compiling...",
    "optimizing...",
    "ready",
  ];

  // Cycle through actions rapidly during loading
  const actionIndex = Math.floor(localFrame / 3) % loadingActions.length;
  const currentAction = isComplete ? finalAction : loadingActions[actionIndex];

  const opacity = interpolate(localFrame, [0, 3], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        fontFamily: "monospace",
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        gap: 6,
        opacity,
        marginBottom: 3,
        height: 20,
      }}
    >
      {isComplete ? (
        <span style={{ color: theme.primary, width: 14, fontSize: 12 }}>✓</span>
      ) : (
        <span
          style={{
            color: theme.muted,
            width: 14,
            fontSize: 12,
            animation: "spin 1s linear infinite",
          }}
        >
          ◐
        </span>
      )}
      <span style={{ color: theme.text, width: 140, flexShrink: 0, fontSize: 12 }}>{name}</span>
      <span style={{ color: theme.subtle, letterSpacing: -2, fontSize: 10 }}>
        {".".repeat(dotsToShow)}
      </span>
      <span
        style={{
          color: isComplete ? theme.secondary : theme.muted,
          marginLeft: "auto",
          fontSize: 11,
          fontStyle: isComplete ? "normal" : "italic",
          minWidth: 120,
          textAlign: "right",
        }}
      >
        {currentAction}
      </span>
    </div>
  );
};

// Progress bar component with more technical feel
const ProgressBar: React.FC<{
  startFrame: number;
  durationFrames: number;
}> = ({ startFrame, durationFrames }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const progress = Math.min(1, localFrame / durationFrames);
  const percentage = Math.floor(progress * 100);

  // Hex progress display
  const hexProgress = `0x${Math.floor(progress * 255).toString(16).toUpperCase().padStart(2, "0")}`;

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: theme.muted,
          marginBottom: 6,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>COMPILING PROJECT</span>
        <span>{hexProgress} [{percentage}%]</span>
      </div>
      <div
        style={{
          width: 320,
          height: 4,
          backgroundColor: theme.subtle,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            backgroundColor: theme.primary,
            borderRadius: 2,
            boxShadow: `0 0 10px ${theme.primary}40`,
          }}
        />
      </div>
    </div>
  );
};

// Confidential project reveal - typewriter style with classified feel
const ConfidentialReveal: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  // Decrypt effect - scramble then reveal
  const projectName = "NIK SILVER EFEX ASSISTANT";
  const scrambleChars = "!@#$%^&*()_+-=[]{}|;:',.<>?/~`0123456789";

  const revealProgress = Math.min(1, localFrame / 20);
  const charsRevealed = Math.floor(revealProgress * projectName.length);

  const displayText = projectName
    .split("")
    .map((char, i) => {
      if (i < charsRevealed) return char;
      if (char === " ") return " ";
      return scrambleChars[Math.floor(random(`scramble-${i}-${frame}`) * scrambleChars.length)];
    })
    .join("");

  const opacity = interpolate(localFrame, [0, 5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Blinking classification badge
  const badgeBlink = Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        marginTop: 20,
        fontFamily: "monospace",
        opacity,
      }}
    >
      {/* Classification header */}
      <div
        style={{
          fontSize: 9,
          color: theme.muted,
          letterSpacing: 2,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            backgroundColor: badgeBlink ? theme.primary : "transparent",
            color: badgeBlink ? theme.background : theme.primary,
            padding: "2px 6px",
            borderRadius: 2,
            border: `1px solid ${theme.primary}`,
          }}
        >
          CLASSIFIED
        </span>
        <span>PROJECT INITIALIZED</span>
      </div>

      {/* Project name with decrypt effect */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: theme.text,
          letterSpacing: 3,
          textShadow: `0 0 20px ${theme.primary}30`,
        }}
      >
        {displayText}
      </div>

      {/* Codename */}
      <div
        style={{
          fontSize: 10,
          color: theme.muted,
          marginTop: 6,
          letterSpacing: 1,
        }}
      >
        CODENAME: SILVER-AI // STATUS: ACTIVE
      </div>
    </div>
  );
};

// Blinking dot for tension moment
const TensionDot: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const blink = Math.floor(localFrame / 12) % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "monospace",
        fontSize: 14,
        color: theme.primary,
        opacity: blink ? 1 : 0.3,
      }}
    >
      ●
    </div>
  );
};

// Main Terminal Intro component
export const TerminalIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timeline (in frames) - 6 seconds total = 180 frames at 30fps
  // Last ~1 second is static "tension" moment
  const TITLE_START = 0;
  const SUBTITLE_START = Math.floor(0.3 * fps);
  const TAGS_START = Math.floor(0.7 * fps);
  const TEAM_START = Math.floor(1.2 * fps);
  const PROGRESS_START = Math.floor(3.4 * fps);
  const REVEAL_START = Math.floor(4.1 * fps);
  const TENSION_START = Math.floor(5 * fps); // Static moment starts at 5s

  // Team members with their contributions
  const team = [
    { name: "Boris Oliviero", action: "photography + editing" },
    { name: "Iryna Veremenko", action: "planification" },
    { name: "Kostiantyn Dudnyk", action: "mcp server" },
    { name: "Yurii Lukash", action: "nik integration" },
    { name: "Adrien Pre", action: "infrastructure" },
    { name: "Arthur Calvi", action: "ai agent" },
  ];

  // No fade out - we'll use a transition instead

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Animated background */}
      <BackgroundMatrix />
      <GridLines />

      {/* === SOUND EFFECTS === */}

      {/* Typing sound during typewriter */}
      <Sequence from={SUBTITLE_START} durationInFrames={Math.floor(2 * fps)}>
        <Audio
          src={staticFile("/audio/sfx/keyboard-typing-sound-effect-335503.mp3")}
          volume={0.15}
        />
      </Sequence>

      {/* Blip sounds for each team member completion */}
      {team.map((_, i) => (
        <Sequence key={`blip-${i}`} from={TEAM_START + i * 6 + 15} durationInFrames={30}>
          <Audio
            src={staticFile("/audio/sfx/blip-131856.mp3")}
            volume={0.25}
          />
        </Sequence>
      ))}

      {/* Progress bar hum */}
      <Sequence from={PROGRESS_START} durationInFrames={Math.floor(0.8 * fps)}>
        <Audio
          src={staticFile("/audio/sfx/low-hum-32-hz-94656.mp3")}
          volume={0.3}
        />
      </Sequence>

      {/* Impact at CLASSIFIED reveal - bip sound synced with blinking badge */}
      <Sequence from={REVEAL_START} durationInFrames={Math.floor(1 * fps)}>
        <Audio
          src={staticFile("/audio/sfx/bip-sound-189733.mp3")}
          volume={0.5}
        />
      </Sequence>

      {/* Terminal window - centered */}
      <div
        style={{
          backgroundColor: "#0a0a0a",
          border: `1px solid ${theme.subtle}`,
          borderRadius: 8,
          padding: 30,
          width: 500,
          position: "relative",
          boxShadow: `0 0 60px ${theme.background}, 0 0 100px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Terminal header */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 20,
            alignItems: "center",
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#ff5f56" }} />
          <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#ffbd2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#27ca40" }} />
          <span style={{ marginLeft: 10, color: theme.muted, fontFamily: "monospace", fontSize: 10 }}>
            dxo-labs@secure ~/projects/silver-ai
          </span>
        </div>

        {/* Main title */}
        <div style={{ fontFamily: "monospace", fontSize: 22, marginBottom: 6 }}>
          <span style={{ color: theme.primary }}>DxO</span>
          <span style={{ color: theme.text }}> Labs</span>
          <Cursor visible={frame < SUBTITLE_START + 10} />
        </div>

        {/* Subtitle */}
        <div style={{ fontFamily: "monospace", fontSize: 12, color: theme.muted, marginBottom: 14 }}>
          <TypeWriter
            text=">> Initializing Anthropic Integration..."
            startFrame={SUBTITLE_START}
            charFrames={1}
          />
        </div>

        {/* Tech tags */}
        <div style={{ marginBottom: 16 }}>
          <TechTag text="MCP" delay={TAGS_START} color={theme.secondary} />
          <TechTag text="claude-agent-sdk" delay={TAGS_START + 3} color={theme.primary} />
          <TechTag text="Haiku" delay={TAGS_START + 6} color={theme.accent} />
        </div>

        {/* Separator */}
        <div
          style={{
            height: 1,
            backgroundColor: theme.subtle,
            marginBottom: 12,
            opacity: 0.5,
          }}
        />

        {/* Team credits - animated action lines */}
        <div style={{ marginBottom: 12 }}>
          {team.map((member, i) => (
            <AnimatedActionLine
              key={i}
              name={member.name}
              finalAction={member.action}
              startFrame={TEAM_START + i * 6}
              dotDuration={15}
            />
          ))}
        </div>

        {/* Progress bar */}
        <ProgressBar startFrame={PROGRESS_START} durationFrames={Math.floor(0.6 * fps)} />

        {/* Confidential reveal */}
        <ConfidentialReveal startFrame={REVEAL_START} />
      </div>

      {/* Tension moment - blinking dot */}
      <TensionDot startFrame={TENSION_START} />
    </AbsoluteFill>
  );
};
