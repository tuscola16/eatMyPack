import React from 'react';
import Svg, {
  Defs,
  ClipPath,
  Path,
  Polygon,
  Rect,
  Circle,
  G,
} from 'react-native-svg';

interface PhaseMidProps {
  width?: number;
  height?: number;
}

export default function PhaseMid({ width = 160, height = 100 }: PhaseMidProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 100" accessibilityLabel="Forest trail midday scene" accessibilityElementsHidden>
      <Defs>
        <ClipPath id="pmClip">
          <Path d="M0,0 H144 Q160,0 160,16 V100 H0 Z" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#pmClip)">
        {/* Sky: sage mid, bright midday */}
        <Rect width="160" height="100" fill="#8FA87A" />
        {/* Dappled sunlight patches */}
        <Circle cx={22} cy={18} r={4} fill="#E8A83A" opacity={0.22} />
        <Circle cx={58} cy={14} r={3} fill="#E8A83A" opacity={0.18} />
        <Circle cx={95} cy={20} r={5} fill="#E8A83A" opacity={0.22} />
        <Circle cx={130} cy={16} r={3.5} fill="#E8A83A" opacity={0.18} />
        <Circle cx={148} cy={28} r={2.5} fill="#E8A83A" opacity={0.20} />
        <Circle cx={42} cy={32} r={6} fill="#F5C060" opacity={0.12} />
        <Circle cx={112} cy={35} r={4} fill="#F5C060" opacity={0.12} />
        {/* Back tree layer */}
        <Polygon points="0,62 8,10 16,62" fill="#7B9E6B" />
        <Polygon points="12,65 20,18 28,65" fill="#7B9E6B" />
        <Polygon points="22,60 32,12 42,60" fill="#7B9E6B" />
        <Polygon points="36,68 44,22 52,68" fill="#7B9E6B" />
        <Polygon points="48,62 57,15 66,62" fill="#7B9E6B" />
        <Polygon points="60,70 68,24 76,70" fill="#7B9E6B" />
        <Polygon points="72,64 80,14 88,64" fill="#7B9E6B" />
        <Polygon points="84,68 93,20 102,68" fill="#7B9E6B" />
        <Polygon points="96,62 105,12 114,62" fill="#7B9E6B" />
        <Polygon points="108,66 116,18 124,66" fill="#7B9E6B" />
        <Polygon points="120,60 129,14 138,60" fill="#7B9E6B" />
        <Polygon points="133,65 141,20 149,65" fill="#7B9E6B" />
        <Polygon points="146,62 155,16 164,62" fill="#7B9E6B" />
        {/* Trail: terracotta converging path */}
        <Polygon points="71,100 89,100 84,52 76,52" fill="#C4623A" opacity={0.85} />
        <Polygon points="77,100 81,100 79,52 77,52" fill="rgba(255,240,220,0.20)" />
        {/* Front tree layer */}
        <Polygon points="-4,100 8,20 20,100" fill="#5E7A52" />
        <Polygon points="14,100 26,28 38,100" fill="#5E7A52" />
        <Polygon points="34,100 46,22 58,100" fill="#5E7A52" />
        <Polygon points="54,100 64,30 74,100" fill="#5E7A52" />
        <Polygon points="86,100 96,30 106,100" fill="#5E7A52" />
        <Polygon points="102,100 114,24 126,100" fill="#5E7A52" />
        <Polygon points="122,100 134,22 146,100" fill="#5E7A52" />
        <Polygon points="142,100 154,28 166,100" fill="#5E7A52" />
      </G>
    </Svg>
  );
}
