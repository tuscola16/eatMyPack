import React from 'react';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Rect,
  Path,
  Ellipse,
  Circle,
  Line,
  G,
} from 'react-native-svg';

interface EmptyPlansProps {
  width?: number;
  height?: number;
}

export default function EmptyPlans({ width = 240, height = 240 }: EmptyPlansProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 240 240" accessibilityLabel="Empty pack illustration">
      <Defs>
        <RadialGradient id="epSunGlow" cx="50%" cy="60%" r="50%">
          <Stop offset="0%" stopColor="#F2C98A" stopOpacity={0.35} />
          <Stop offset="100%" stopColor="#F2C98A" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* Background */}
      <Rect width="240" height="240" fill="#F5F0E8" />

      {/* Sun glow */}
      <Ellipse cx={120} cy={145} rx={120} ry={100} fill="url(#epSunGlow)" />

      {/* Hill: Franconia Ridge style */}
      <Path
        d="M 0 240 L 0 185 Q 15 175 25 178 Q 35 181 45 170 Q 55 160 62 165 Q 70 170 78 155 Q 86 142 95 148 Q 102 153 108 143 Q 114 135 120 138 Q 126 141 132 135 Q 138 129 145 138 Q 151 146 158 142 Q 166 137 174 150 Q 180 160 188 157 Q 196 154 204 165 Q 212 176 220 172 Q 230 168 240 178 L 240 240 Z"
        fill="#8FA87A"
      />

      {/* Hill darker base layer */}
      <Path
        d="M 0 240 L 0 200 Q 30 195 60 200 Q 90 205 120 198 Q 150 191 180 200 Q 210 209 240 200 L 240 240 Z"
        fill="#7B9E6B"
        opacity={0.5}
      />

      {/* Small rocks */}
      <Ellipse cx={100} cy={145} rx={7} ry={4} fill="#3A2E22" opacity={0.7} />
      <Ellipse cx={143} cy={147} rx={5} ry={3} fill="#3A2E22" opacity={0.6} />

      {/* Tiny wildflower */}
      <Line x1={152} y1={143} x2={152} y2={130} stroke="#7B9E6B" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={152} y1={138} x2={147} y2={134} stroke="#7B9E6B" strokeWidth={1.2} strokeLinecap="round" />
      <Line x1={152} y1={136} x2={157} y2={132} stroke="#7B9E6B" strokeWidth={1.2} strokeLinecap="round" />
      <Circle cx={152} cy={129} r={3} fill="#E8A83A" />

      {/* Shoulder straps */}
      <Path d="M 108 113 Q 103 125 104 138" stroke="#D4C5B0" strokeWidth={4} strokeLinecap="round" fill="none" />
      <Path d="M 132 113 Q 137 125 136 138" stroke="#D4C5B0" strokeWidth={4} strokeLinecap="round" fill="none" />

      {/* Hydration tube */}
      <Path d="M 110 108 Q 105 115 102 120 Q 100 124 103 127" stroke="#7B9E6B" strokeWidth={2} strokeLinecap="round" fill="none" />

      {/* Main pack body */}
      <Rect x={99} y={93} width={42} height={52} rx={7} ry={7} fill="#C4623A" />

      {/* Top lid */}
      <Rect x={102} y={84} width={36} height={14} rx={5} ry={5} fill="#A84F2A" />

      {/* Front pocket */}
      <Rect x={107} y={113} width={26} height={18} rx={4} ry={4} fill="#8FA87A" />

      {/* Pocket detail line */}
      <Line x1={107} y1={122} x2={133} y2={122} stroke="#7B9E6B" strokeWidth={1} opacity={0.6} />

      {/* Hip belt wings */}
      <Rect x={88} y={137} width={14} height={6} rx={3} ry={3} fill="#C4623A" />
      <Rect x={138} y={137} width={14} height={6} rx={3} ry={3} fill="#C4623A" />

      {/* Compression straps */}
      <Line x1={99} y1={108} x2={99} y2={118} stroke="#A84F2A" strokeWidth={1.5} strokeLinecap="round" opacity={0.7} />
      <Line x1={141} y1={108} x2={141} y2={118} stroke="#A84F2A" strokeWidth={1.5} strokeLinecap="round" opacity={0.7} />

      {/* Question mark — sage dark */}
      <G transform="translate(108, 38)">
        <Path
          d="M 4 6 C 4 2, 8 0, 12 0 C 17 0, 21 3, 21 8 C 21 12, 18 14, 14 16 C 12 17, 11 18, 11 21 L 11 24"
          stroke="#7B9E6B"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Circle cx={11} cy={30} r={2.2} fill="#7B9E6B" />
      </G>
    </Svg>
  );
}
