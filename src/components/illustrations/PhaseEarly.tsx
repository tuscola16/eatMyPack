import React from 'react';
import Svg, {
  Defs,
  ClipPath,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Polygon,
  Circle,
  G,
} from 'react-native-svg';

interface PhaseEarlyProps {
  width?: number;
  height?: number;
}

export default function PhaseEarly({ width = 160, height = 100 }: PhaseEarlyProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 100" accessibilityLabel="Dawn mountain scene" accessibilityElementsHidden>
      <Defs>
        <ClipPath id="peClip">
          <Path d="M0,0 H144 Q160,0 160,16 V100 H0 Z" />
        </ClipPath>
        <LinearGradient id="peSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#D87A30" />
          <Stop offset="45%" stopColor="#F2C98A" />
          <Stop offset="100%" stopColor="#F5F0E8" />
        </LinearGradient>
      </Defs>
      <G clipPath="url(#peClip)">
        {/* Sky */}
        <Rect width="160" height="100" fill="url(#peSky)" />
        {/* Sun glow bloom */}
        <Circle cx={80} cy={56} r={42} fill="#FFDB80" opacity={0.38} />
        {/* Rising sun half-disk */}
        <Circle cx={80} cy={54} r={12} fill="#F5C050" />
        {/* Cover upper half so only half-disk shows */}
        <Rect x={0} y={0} width={160} height={54} fill="url(#peSky)" />
        {/* Franconia Ridge silhouette */}
        <Polygon
          points="0,64 8,59 16,52 24,46 32,42 38,46 46,39 53,44 60,36 68,42 76,54 83,49 90,42 98,48 106,41 114,47 122,54 130,59 138,52 148,56 160,60 160,80 0,80"
          fill="#A8C490"
        />
        {/* Rocky summit zone */}
        <Polygon points="60,36 76,54 68,56 54,50 50,44" fill="#C8B898" opacity={0.55} />
        {/* Atmospheric mist */}
        <Rect x={0} y={57} width={160} height={11} fill="#F5F0E8" opacity={0.32} />
        {/* Spruce-fir treeline */}
        <Path
          d="M0,80 L0,70 L8,57 L16,70 L24,62 L32,72 L40,58 L48,72 L56,64 L64,76 L72,66 L80,76 L88,62 L96,76 L104,66 L112,78 L120,68 L128,80 L136,72 L144,84 L152,74 L160,82 L160,100 L0,100 Z"
          fill="#4A6640"
        />
      </G>
    </Svg>
  );
}
