import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../NikTeaser";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Simple fade in for the tagline
  const taglineOpacity = interpolate(frame, [0, fps * 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Fade in for the release info (1 second after tagline)
  const releaseOpacity = interpolate(frame, [fps * 2, fps * 2.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out at the very end
  const fadeOut = interpolate(frame, [fps * 4, fps * 5], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.background,
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      {/* Tagline and release info */}
      <div
        style={{
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: 42,
            fontWeight: 600,
            fontStyle: "italic",
            color: "#ffffff",
            letterSpacing: 1,
            opacity: taglineOpacity,
          }}
        >
          "Your intent. Instantly realized."
        </div>
        <div
          style={{
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: 20,
            fontWeight: 300,
            color: "#666666",
            letterSpacing: 2,
            marginTop: 30,
            opacity: releaseOpacity,
          }}
        >
          Coming with Nik 9 in 2026
        </div>
      </div>
    </AbsoluteFill>
  );
};
