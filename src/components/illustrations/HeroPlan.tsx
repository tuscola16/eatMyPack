import React from 'react';
import Svg, {
  Defs,
  ClipPath,
  LinearGradient,
  Stop,
  Rect,
  Path,
  G,
} from 'react-native-svg';

interface HeroPlanProps {
  width: number;
  height: number;
}

export default function HeroPlan({ width, height }: HeroPlanProps) {
  // Original artboard is 390×160; scale to fit
  return (
    <Svg width={width} height={height} viewBox="0 0 390 160">
      <Defs>
        <ClipPath id="planClip">
          <Path d="M0,0 H390 V136 Q390,160 366,160 H24 Q0,160 0,136 Z" />
        </ClipPath>
        <LinearGradient id="planSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#C3D9B8" />
          <Stop offset="40%" stopColor="#D4DFC8" />
          <Stop offset="100%" stopColor="#F4EFE6" />
        </LinearGradient>
        <LinearGradient id="planRidge" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#8FA87A" />
          <Stop offset="100%" stopColor="#7A9E6E" />
        </LinearGradient>
      </Defs>

      <G clipPath="url(#planClip)">
        {/* Sage gradient sky */}
        <Rect width="390" height="160" fill="url(#planSky)" />

        {/* Far ridge silhouette */}
        <Path
          d="M-8,120 C30,100 60,108 90,95 C120,82 150,90 180,85 C210,80 240,88 270,82 C300,76 330,85 360,90 C375,93 388,98 398,105 L398,130 L-8,130 Z"
          fill="url(#planRidge)"
          opacity={0.5}
        />

        {/* Near ridge */}
        <Path
          d="M-8,135 C30,118 70,125 110,115 C150,105 180,112 210,108 C240,104 270,110 310,105 C340,100 370,108 398,115 L398,165 L-8,165 Z"
          fill="#7A9E6E"
          opacity={0.75}
        />

        {/* Treeline silhouette */}
        <Path
          d="M-8,148 L0,138 L10,148 L18,140 L28,128 L38,140 L46,146 L56,134 L66,146 L74,140 L84,128 L94,140 L102,148 L112,136 L122,148 L130,140 L140,130 L150,140 L158,148 L168,136 L178,148 L186,142 L196,130 L206,142 L214,148 L224,138 L234,148 L242,142 L252,130 L262,142 L270,148 L280,138 L290,148 L298,142 L308,132 L318,142 L326,148 L336,138 L346,148 L354,142 L364,132 L374,142 L382,148 L392,138 L398,145 L398,165 L-8,165 Z"
          fill="#4A6640"
        />
      </G>
    </Svg>
  );
}
