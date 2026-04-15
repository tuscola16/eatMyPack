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

interface PhaseLateProps {
  width?: number;
  height?: number;
}

export default function PhaseLate({ width = 160, height = 100 }: PhaseLateProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 100" accessibilityLabel="Golden hour mountain scene" accessibilityElementsHidden>
      <Defs>
        <ClipPath id="plClip">
          <Path d="M0,0 H144 Q160,0 160,16 V100 H0 Z" />
        </ClipPath>
        <LinearGradient id="plSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#C4623A" />
          <Stop offset="50%" stopColor="#E8A83A" />
          <Stop offset="100%" stopColor="#F5C870" />
        </LinearGradient>
      </Defs>
      <G clipPath="url(#plClip)">
        {/* Sky */}
        <Rect width="160" height="100" fill="url(#plSky)" />
        {/* Low sun near horizon */}
        <Circle cx={28} cy={48} r={20} fill="#FFD060" opacity={0.20} />
        <Circle cx={28} cy={48} r={14} fill="#FFE080" opacity={0.80} />
        {/* Cover upper half so only lower portion shows */}
        <Rect x={0} y={0} width={160} height={48} fill="url(#plSky)" />
        {/* Long runner shadow */}
        <Polygon points="58,72 76,72 160,100 140,100" fill="#3A2E22" opacity={0.28} />
        {/* Presidential Range ridge at golden hour */}
        <Polygon
          points="0,78 8,60 18,52 26,57 35,44 44,50 52,38 60,44 68,34 76,40 84,46 90,38 98,50 106,40 114,54 122,47 130,57 140,50 150,58 160,62 160,78 0,78"
          fill="#7B9E6B"
        />
        {/* Rocky summits at golden light */}
        <Polygon points="52,38 60,44 68,34 76,40 72,46 60,48 54,44" fill="#C8A060" opacity={0.45} />
        {/* Foreground ground in shadow */}
        <Rect x={0} y={74} width={160} height={26} fill="#5E7A52" />
        {/* Ground edge */}
        <Path d="M0,74 C30,72 80,75 130,73 C148,72 156,73 160,74" stroke="#4A6640" strokeWidth={1.5} fill="none" />
      </G>
    </Svg>
  );
}
