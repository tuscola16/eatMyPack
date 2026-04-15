import React from 'react';
import Svg, {
  Defs,
  ClipPath,
  RadialGradient,
  Stop,
  Rect,
  Path,
  Polygon,
  Circle,
  Line,
  G,
} from 'react-native-svg';

interface PhaseNightProps {
  width?: number;
  height?: number;
}

export default function PhaseNight({ width = 160, height = 100 }: PhaseNightProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 100" accessibilityLabel="Night mountain running scene" accessibilityElementsHidden>
      <Defs>
        <ClipPath id="pnClip">
          <Path d="M0,0 H144 Q160,0 160,16 V100 H0 Z" />
        </ClipPath>
        <RadialGradient id="pnLamp" cx="50%" cy="100%" r="80%">
          <Stop offset="0%" stopColor="#FFE880" stopOpacity={0.35} />
          <Stop offset="100%" stopColor="#FFE880" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <G clipPath="url(#pnClip)">
        {/* Night sky */}
        <Rect width="160" height="100" fill="#1E2A3A" />
        {/* Stars */}
        <Circle cx={8} cy={8} r={1.2} fill="#F5F0E8" />
        <Circle cx={20} cy={15} r={0.9} fill="#F5F0E8" />
        <Circle cx={35} cy={6} r={1.5} fill="#F5F0E8" />
        <Circle cx={50} cy={18} r={1.0} fill="#F5F0E8" />
        <Circle cx={42} cy={28} r={0.8} fill="#F5F0E8" />
        <Circle cx={62} cy={10} r={1.8} fill="#F5F0E8" />
        <Circle cx={74} cy={22} r={1.1} fill="#F5F0E8" />
        <Circle cx={60} cy={35} r={0.9} fill="#F5F0E8" />
        <Circle cx={85} cy={12} r={1.3} fill="#F5F0E8" />
        <Circle cx={95} cy={30} r={0.8} fill="#F5F0E8" />
        <Circle cx={100} cy={8} r={2.0} fill="#F5F0E8" />
        <Circle cx={112} cy={18} r={1.0} fill="#F5F0E8" />
        <Circle cx={108} cy={38} r={0.9} fill="#F5F0E8" />
        <Circle cx={118} cy={45} r={1.1} fill="#F5F0E8" />
        <Circle cx={14} cy={40} r={1.0} fill="#F5F0E8" />
        <Circle cx={28} cy={48} r={0.8} fill="#F5F0E8" />
        <Circle cx={48} cy={44} r={1.4} fill="#F5F0E8" />
        <Circle cx={78} cy={42} r={0.8} fill="#F5F0E8" />
        <Circle cx={90} cy={50} r={1.2} fill="#F5F0E8" />
        <Circle cx={148} cy={12} r={1.0} fill="#F5F0E8" />
        <Circle cx={155} cy={30} r={0.8} fill="#F5F0E8" />
        <Circle cx={138} cy={40} r={1.3} fill="#F5F0E8" />
        {/* Crescent moon */}
        <Circle cx={130} cy={20} r={9} fill="#F5F0E8" />
        <Circle cx={134} cy={18} r={8} fill="#1E2A3A" />
        {/* Headlamp beam */}
        <Polygon points="80,100 36,50 62,50" fill="#E8A83A" opacity={0.18} />
        <Polygon points="80,100 46,52 56,52" fill="#FFE880" opacity={0.22} />
        <Rect width="160" height="100" fill="url(#pnLamp)" />
        {/* Ridge silhouette */}
        <Polygon
          points="0,82 10,70 18,74 26,62 34,67 42,57 50,64 58,54 66,62 74,58 80,67 88,60 96,66 104,56 112,64 120,60 130,68 140,62 150,70 160,74 160,100 0,100"
          fill="#2C3E50"
        />
        {/* Runner with headlamp */}
        <Circle cx={80} cy={93} r={3} fill="#D4C5B0" />
        <Circle cx={80} cy={90} r={1.8} fill="#FFE880" />
        <Line x1={80} y1={93} x2={80} y2={100} stroke="#D4C5B0" strokeWidth={2} strokeLinecap="round" />
      </G>
    </Svg>
  );
}
