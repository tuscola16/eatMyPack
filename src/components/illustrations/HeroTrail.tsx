import React from 'react';
import Svg, {
  Defs,
  ClipPath,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Path,
  Ellipse,
  Circle,
  Line,
  G,
} from 'react-native-svg';

interface HeroTrailProps {
  width: number;
  height: number;
}

export default function HeroTrail({ width, height }: HeroTrailProps) {
  // Original artboard is 390×340; scale to fit
  const scaleX = width / 390;
  const scaleY = height / 340;

  return (
    <Svg width={width} height={height} viewBox="0 0 390 340">
      <Defs>
        <ClipPath id="heroClip">
          <Path d="M0,0 H390 V316 Q390,340 366,340 H24 Q0,340 0,316 Z" />
        </ClipPath>
        <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#D86A28" />
          <Stop offset="28%" stopColor="#EDA860" />
          <Stop offset="60%" stopColor="#F5DDB8" />
          <Stop offset="100%" stopColor="#F5F0E8" />
        </LinearGradient>
        <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFDB90" stopOpacity={0.7} />
          <Stop offset="100%" stopColor="#FFDB90" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id="ridgeGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#B5C4AA" />
          <Stop offset="100%" stopColor="#9CAE90" />
        </LinearGradient>
        <LinearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#D4C5B0" />
          <Stop offset="100%" stopColor="#C2B09A" />
        </LinearGradient>
      </Defs>

      <G clipPath="url(#heroClip)">
        {/* Sky */}
        <Rect width="390" height="340" fill="url(#skyGrad)" />

        {/* Sun glow */}
        <Ellipse cx={192} cy={95} rx={140} ry={95} fill="url(#sunGlow)" />
        <Ellipse cx={192} cy={148} rx={28} ry={28} fill="#F5C860" opacity={0.55} />

        {/* Cloud wisps */}
        <Path
          d="M52,85 Q88,72 118,80 Q144,87 162,76"
          stroke="rgba(255,255,255,0.42)"
          strokeWidth={11}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M235,65 Q272,53 308,62 Q332,69 350,58"
          stroke="rgba(255,255,255,0.30)"
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
        />

        {/* Presidential Range (far, hazy) */}
        <Path
          d="M-8,210 C18,190 38,168 58,150 C72,137 84,144 98,131 C108,121 118,113 130,103 C142,94 152,108 164,98 C172,91 180,82 192,71 C200,64 208,74 216,67 C224,60 234,68 244,64 C254,58 263,70 272,65 C282,60 292,73 306,81 C319,90 334,99 354,113 C367,123 380,133 398,148 L398,212 L-8,212 Z"
          fill="url(#ridgeGrad)"
        />

        {/* Rocky summit zone */}
        <Path
          d="M162,112 C170,101 180,88 192,71 C200,64 208,74 216,67 C224,61 234,69 244,65 C240,77 232,87 222,93 C212,99 200,99 190,101 C180,104 170,111 162,117 Z"
          fill="#C8B898"
          opacity={0.72}
        />

        {/* Haze band */}
        <Path
          d="M-8,200 Q195,216 398,200 L398,215 Q195,231 -8,215 Z"
          fill="rgba(245,240,230,0.38)"
        />

        {/* Franconia Ridge (mid) */}
        <Path
          d="M-8,244 C22,224 52,230 80,220 C102,212 118,222 140,214 C158,208 172,217 195,210 C216,204 236,212 260,210 C282,208 308,216 338,224 C358,230 376,236 398,242 L398,258 L-8,258 Z"
          fill="#8FA87A"
        />

        {/* Rocky shoulders */}
        <Path
          d="M155,230 C165,220 175,213 190,208 C204,204 212,210 225,208 C218,218 210,224 200,226 C190,228 174,230 162,234 Z"
          fill="#A8C290"
          opacity={0.55}
        />

        {/* Spruce-Fir treeline */}
        <Path
          d="M-8,272 L-8,256 L4,238 L14,256 L20,244 L30,226 L40,244 L46,238 L56,220 L66,238 L72,248 L82,230 L92,248 L98,240 L108,222 L118,240 L124,250 L134,232 L144,250 L150,242 L160,224 L170,242 L176,254 L186,234 L196,254 L202,244 L212,226 L222,244 L228,252 L238,234 L248,252 L254,242 L264,224 L274,242 L280,250 L290,232 L300,250 L306,244 L316,226 L326,244 L332,254 L342,236 L352,254 L358,246 L368,228 L378,246 L384,256 L392,240 L398,253 L398,272 Z"
          fill="#4A6640"
        />
        <Rect x={-8} y={268} width={408} height={15} fill="#4A6640" />

        {/* Darker spruce base */}
        <Path
          d="M-8,278 C60,272 160,276 260,274 C328,272 368,277 398,282 L398,288 C368,285 328,280 260,282 C160,284 60,280 -8,286 Z"
          fill="#3A5030"
          opacity={0.7}
        />

        {/* Foreground ground */}
        <Path
          d="M-8,280 C60,272 160,276 260,274 C328,272 368,278 398,284 L398,345 L-8,345 Z"
          fill="url(#groundGrad)"
        />

        {/* Ground texture line */}
        <Path
          d="M-8,288 C80,283 190,287 310,285 C350,284 376,287 398,290"
          stroke="#C4B098"
          strokeWidth={1.2}
          fill="none"
          opacity={0.55}
        />

        {/* Foreground rocks */}
        <Ellipse cx={65} cy={292} rx={9} ry={5} fill="#B8A888" opacity={0.6} />
        <Ellipse cx={80} cy={298} rx={6} ry={3.5} fill="#C8B898" opacity={0.5} />
        <Ellipse cx={332} cy={290} rx={8} ry={4} fill="#B8A888" opacity={0.55} />
        <Ellipse cx={350} cy={296} rx={5} ry={3} fill="#C4B498" opacity={0.45} />

        {/* Trail — terracotta */}
        <Path
          d="M30,342 C80,320 140,300 190,289 C228,281 264,284 300,276 C328,270 358,263 384,254"
          stroke="#C4623A"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Trail highlight */}
        <Path
          d="M30,342 C80,320 140,300 190,289 C228,281 264,284 300,276 C328,270 358,263 384,254"
          stroke="rgba(255,240,220,0.25)"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />

        {/* Runner silhouette */}
        <Circle cx={193} cy={279} r={4.5} fill="#3A2E22" />
        <Path d="M189,277 L183,275" stroke="#3A2E22" strokeWidth={2} strokeLinecap="round" />
        <Line x1={193} y1={284} x2={193} y2={295} stroke="#3A2E22" strokeWidth={3} strokeLinecap="round" />
        <Path
          d="M188,287 L194,285 L200,288"
          stroke="#3A2E22"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path d="M193,295 L188,304 M193,295 L199,303" stroke="#3A2E22" strokeWidth={2.5} strokeLinecap="round" />
        <Path d="M195,285 L202,284 L203,292 L196,293 Z" fill="#C4623A" opacity={0.9} />

        {/* Mist at forest base */}
        <Path
          d="M-8,278 Q195,270 398,276 L398,286 Q195,280 -8,288 Z"
          fill="rgba(245,242,236,0.30)"
        />
      </G>
    </Svg>
  );
}
