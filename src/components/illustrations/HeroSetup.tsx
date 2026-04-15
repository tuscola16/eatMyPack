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

interface HeroSetupProps {
  width: number;
  height: number;
}

export default function HeroSetup({ width, height }: HeroSetupProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 390 200">
      <Defs>
        <ClipPath id="setupClip">
          <Path d="M0,0 H390 V176 Q390,200 366,200 H24 Q0,200 0,176 Z" />
        </ClipPath>
        <LinearGradient id="setupSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#C3D9B8" />
          <Stop offset="60%" stopColor="#E8E0D4" />
          <Stop offset="100%" stopColor="#F4EFE6" />
        </LinearGradient>
      </Defs>

      <G clipPath="url(#setupClip)">
        <Rect width="390" height="200" fill="url(#setupSky)" />

        {/* Mountain range silhouette */}
        <Path
          d="M0,180 C30,160 60,140 90,120 C110,105 130,115 150,100 C170,85 185,75 195,65 C205,75 215,85 235,100 C255,115 275,105 295,120 C325,140 355,155 390,170 L390,200 L0,200 Z"
          fill="#8FA87A"
          opacity={0.6}
        />
        <Path
          d="M0,190 C40,175 80,160 120,145 C150,135 170,140 195,130 C220,140 240,135 270,145 C310,160 350,175 390,185 L390,200 L0,200 Z"
          fill="#4A6640"
          opacity={0.5}
        />

        {/* Treeline */}
        <Path
          d="M0,192 L10,182 L20,192 L28,184 L36,192 L44,180 L52,192 L60,185 L68,192 L76,178 L84,192 L92,184 L100,192 L108,180 L116,192 L124,186 L132,192 L140,178 L148,192 L156,184 L164,192 L172,180 L180,192 L188,186 L196,192 L204,180 L212,192 L220,184 L228,192 L236,178 L244,192 L252,184 L260,192 L268,180 L276,192 L284,186 L292,192 L300,180 L308,192 L316,184 L324,192 L332,178 L340,192 L348,184 L356,192 L364,180 L372,192 L380,186 L390,192 L390,200 L0,200 Z"
          fill="#3A5030"
        />

        {/* Pack/backpack silhouette */}
        <G x={180} y={100}>
          <Path
            d="M20,60 L20,30 Q20,15 35,10 Q50,5 50,20 L50,30 Q60,25 65,30 L65,55 Q65,65 55,68 L15,68 Q5,65 5,55 L5,45 Q8,40 15,42 Z"
            fill="#3A2E22"
            opacity={0.7}
          />
          <Rect x={22} y={15} width={26} height={6} rx={3} fill="#C4623A" opacity={0.8} />
        </G>
      </G>
    </Svg>
  );
}
