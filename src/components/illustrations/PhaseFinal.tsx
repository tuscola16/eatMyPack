import React from 'react';
import Svg, {
  Defs,
  ClipPath,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Polygon,
  Ellipse,
  Circle,
  Line,
  G,
} from 'react-native-svg';

interface PhaseFinalProps {
  width?: number;
  height?: number;
}

export default function PhaseFinal({ width = 160, height = 100 }: PhaseFinalProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 100" accessibilityLabel="Summit push mountain scene" accessibilityElementsHidden>
      <Defs>
        <ClipPath id="pfClip">
          <Path d="M0,0 H144 Q160,0 160,16 V100 H0 Z" />
        </ClipPath>
        <LinearGradient id="pfSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#F5F0E8" />
          <Stop offset="100%" stopColor="#F2C98A" />
        </LinearGradient>
      </Defs>
      <G clipPath="url(#pfClip)">
        {/* Sky */}
        <Rect width="160" height="100" fill="url(#pfSky)" />
        {/* Summit cone */}
        <Polygon points="80,15 -10,62 170,62" fill="#C4623A" />
        {/* Left rocky jags */}
        <Polygon points="80,15 30,62 22,62 32,50 24,50 36,38 28,38 42,28" fill="#B55630" />
        {/* Right rocky jags */}
        <Polygon points="80,15 130,62 138,62 128,50 136,50 124,38 132,38 118,28" fill="#B55630" />
        {/* Granite highlights */}
        <Polygon points="80,15 95,38 88,50 72,50 65,38" fill="#D07848" opacity={0.40} />
        {/* Rock texture chips */}
        <Polygon points="72,24 68,30 76,30" fill="#B55630" />
        <Polygon points="84,22 80,28 88,28" fill="#B55630" />
        <Polygon points="76,32 72,38 80,38" fill="#B55630" />
        {/* Talus boulders */}
        <Ellipse cx={32} cy={58} rx={8} ry={4} fill="#A84A28" opacity={0.60} />
        <Ellipse cx={52} cy={60} rx={6} ry={3} fill="#B85030" opacity={0.55} />
        <Ellipse cx={112} cy={59} rx={7} ry={3.5} fill="#A84A28" opacity={0.55} />
        <Ellipse cx={130} cy={57} rx={5} ry={2.5} fill="#B85030" opacity={0.50} />
        {/* Lower slopes: forest */}
        <Rect x={0} y={62} width={160} height={38} fill="#5E7A52" />
        {/* Forest edge */}
        <Path
          d="M0,62 L8,55 L16,62 L24,57 L32,62 L40,56 L48,62 L56,57 L64,62 L72,56 L80,62 L88,56 L96,62 L104,57 L112,62 L120,56 L128,62 L136,57 L144,62 L152,57 L160,62"
          fill="#4A6640"
        />
        {/* Runner near summit */}
        <Circle cx={88} cy={30} r={2.5} fill="#3A2E22" />
        <Rect x={87} y={32} width={2} height={6} fill="#3A2E22" />
        <Line x1={88} y1={38} x2={85} y2={44} stroke="#3A2E22" strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={88} y1={38} x2={91} y2={44} stroke="#3A2E22" strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={88} y1={34} x2={85} y2={38} stroke="#3A2E22" strokeWidth={1.2} strokeLinecap="round" />
        <Line x1={88} y1={34} x2={91} y2={37} stroke="#3A2E22" strokeWidth={1.2} strokeLinecap="round" />
        {/* Summit cairn */}
        <Rect x={77} y={10} width={6} height={2.5} rx={0.5} fill="#3A2E22" />
        <Rect x={77.5} y={7.5} width={5} height={2.5} rx={0.5} fill="#3A2E22" />
        <Rect x={78.5} y={5.2} width={3} height={2.5} rx={0.5} fill="#3A2E22" />
      </G>
    </Svg>
  );
}
