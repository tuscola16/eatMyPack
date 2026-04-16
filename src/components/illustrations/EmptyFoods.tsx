import React from 'react';
import Svg, {
  Rect,
  Path,
  Circle,
  Line,
  G,
} from 'react-native-svg';

interface EmptyFoodsProps {
  width?: number;
  height?: number;
}

export default function EmptyFoods({ width = 180, height = 180 }: EmptyFoodsProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 180 180" accessibilityLabel="Empty food search illustration">
      {/* Background */}
      <Rect width="180" height="180" fill="#F5F0E8" />

      {/* Palm base */}
      <Rect x={55} y={133} width={68} height={30} rx={10} ry={10} fill="#D4C5B0" />

      {/* Thumb */}
      <Rect x={47} y={130} width={14} height={24} rx={7} ry={7} fill="#C4B8A8" transform="rotate(-10, 54, 142)" />

      {/* Index finger */}
      <Rect x={62} y={98} width={13} height={42} rx={6.5} ry={6.5} fill="#C4B8A8" transform="rotate(-3, 68, 120)" />

      {/* Middle finger */}
      <Rect x={77} y={95} width={13} height={44} rx={6.5} ry={6.5} fill="#C4B8A8" />

      {/* Ring finger */}
      <Rect x={92} y={97} width={13} height={42} rx={6.5} ry={6.5} fill="#C4B8A8" transform="rotate(2, 98, 118)" />

      {/* Pinky */}
      <Rect x={107} y={101} width={11} height={38} rx={5.5} ry={5.5} fill="#C4B8A8" transform="rotate(5, 112, 120)" />

      {/* Palm knuckle overlay */}
      <Rect x={55} y={128} width={68} height={20} rx={8} ry={8} fill="#D4C5B0" />

      {/* Palm crease lines */}
      <Path d="M 62 148 Q 88 144 116 148" stroke="#C4B8A8" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      <Path d="M 65 154 Q 88 151 114 154" stroke="#C4B8A8" strokeWidth={1} fill="none" strokeLinecap="round" />

      {/* Gel packet */}
      <G transform="rotate(-4, 84, 109)">
        <Rect x={74} y={87} width={20} height={42} rx={5} ry={5} fill="#C4623A" />
        <Rect x={74} y={87} width={20} height={10} rx={5} ry={5} fill="#A84F2A" />
        <Rect x={74} y={93} width={20} height={4} fill="#A84F2A" />
        <Line x1={74} y1={102} x2={94} y2={102} stroke="#D4C5B0" strokeWidth={1} opacity={0.7} />
        <Line x1={74} y1={104} x2={94} y2={104} stroke="#D4C5B0" strokeWidth={1} opacity={0.5} />
        <Rect x={77} y={108} width={14} height={10} rx={2} ry={2} fill="#8FA87A" />
        <Rect x={76} y={99} width={4} height={20} rx={2} ry={2} fill="#E07050" opacity={0.4} />
      </G>

      {/* Question mark */}
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
