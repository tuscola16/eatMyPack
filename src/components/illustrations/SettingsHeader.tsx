import React from 'react';
import Svg, {
  Defs,
  ClipPath,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Circle,
  Line,
  G,
} from 'react-native-svg';

interface SettingsHeaderProps {
  width: number;
  height: number;
}

export default function SettingsHeader({ width, height }: SettingsHeaderProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 390 140">
      <Defs>
        <ClipPath id="settingsClip">
          <Path d="M0,0 H390 V116 Q390,140 366,140 H24 Q0,140 0,116 Z" />
        </ClipPath>
        <LinearGradient id="settingsGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#C3D9B8" />
          <Stop offset="100%" stopColor="#F4EFE6" />
        </LinearGradient>
      </Defs>

      <G clipPath="url(#settingsClip)">
        <Rect width="390" height="140" fill="url(#settingsGrad)" />

        {/* Topo line pattern (decorative) */}
        <Path
          d="M0,40 C40,35 80,42 120,38 C160,34 200,45 240,40 C280,35 320,42 360,38 L390,40"
          stroke="#8FA87A"
          strokeWidth={1}
          fill="none"
          opacity={0.25}
        />
        <Path
          d="M0,60 C50,54 100,62 150,57 C200,52 250,65 300,58 C340,52 370,60 390,56"
          stroke="#8FA87A"
          strokeWidth={1}
          fill="none"
          opacity={0.2}
        />
        <Path
          d="M0,80 C60,73 120,82 180,76 C240,70 300,84 360,78 L390,80"
          stroke="#8FA87A"
          strokeWidth={1}
          fill="none"
          opacity={0.15}
        />
        <Path
          d="M0,100 C40,93 80,102 120,96 C160,90 200,104 240,98 C280,92 320,102 360,96 L390,100"
          stroke="#8FA87A"
          strokeWidth={1}
          fill="none"
          opacity={0.12}
        />
        <Path
          d="M0,120 C50,114 100,122 150,117 C200,112 250,124 300,118 C350,112 380,120 390,118"
          stroke="#8FA87A"
          strokeWidth={1}
          fill="none"
          opacity={0.1}
        />

        {/* Small runner adjusting pack */}
        <G x={300} y={80}>
          <Circle cx={0} cy={0} r={4} fill="#3A2E22" opacity={0.5} />
          <Line x1={0} y1={5} x2={0} y2={16} stroke="#3A2E22" strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />
          <Path
            d="M-4,8 L0,6 L6,10"
            stroke="#3A2E22"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            opacity={0.5}
          />
          <Path
            d="M0,16 L-3,24 M0,16 L4,23"
            stroke="#3A2E22"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.5}
          />
          <Rect x={2} y={6} width={6} height={8} rx={2} fill="#C4623A" opacity={0.4} />
        </G>
      </G>
    </Svg>
  );
}
