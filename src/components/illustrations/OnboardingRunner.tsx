import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Path,
  Polygon,
  Circle,
  Ellipse,
  Line,
  G,
} from 'react-native-svg';

interface OnboardingRunnerProps {
  width?: number;
  height?: number;
}

export default function OnboardingRunner({ width = 390, height = 780 }: OnboardingRunnerProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 390 780"
      accessibilityLabel="Runner cresting Franconia Ridge at sunrise"
    >
      <Defs>
        <LinearGradient id="orSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"  stopColor="#C45A20" />
          <Stop offset="22%" stopColor="#E8904A" />
          <Stop offset="50%" stopColor="#F5C888" />
          <Stop offset="78%" stopColor="#F5E0C0" />
          <Stop offset="100%" stopColor="#F5F0E8" />
        </LinearGradient>
        <RadialGradient id="orSunGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"  stopColor="#E8A83A" stopOpacity={0.9} />
          <Stop offset="50%" stopColor="#E8A83A" stopOpacity={0.55} />
          <Stop offset="100%" stopColor="#E8A83A" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id="orSlope" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor="#C8B89A" />
          <Stop offset="100%" stopColor="#B8A888" />
        </LinearGradient>
      </Defs>

      {/* Sky */}
      <Rect x={0} y={0} width={390} height={780} fill="url(#orSky)" />

      {/* Sun glow + disk */}
      <Circle cx={200} cy={310} r={90}  fill="url(#orSunGlow)" opacity={0.5} />
      <Circle cx={200} cy={310} r={60}  fill="#E8A83A" opacity={0.5} />
      <Circle cx={200} cy={310} r={35}  fill="#E8A83A" opacity={0.9} />

      {/* Sun rays */}
      <G stroke="#E8A83A" strokeWidth={2} strokeLinecap="round" opacity={0.25}>
        <Line x1={265} y1={310} x2={320} y2={310} />
        <Line x1={248} y1={348} x2={290} y2={390} />
        <Line x1={200} y1={370} x2={200} y2={420} />
        <Line x1={152} y1={348} x2={110} y2={390} />
        <Line x1={135} y1={310} x2={80}  y2={310} />
        <Line x1={152} y1={272} x2={110} y2={230} />
        <Line x1={200} y1={250} x2={200} y2={195} />
        <Line x1={248} y1={272} x2={290} y2={230} />
      </G>

      {/* Far mountains — Presidential Range, sage light */}
      <Path
        d="M 0,340 L 0,310 C 12,305 24,300 38,292 C 52,284 60,278 70,272 C 82,264 92,260 100,262 C 108,264 114,270 122,276 C 130,282 138,286 148,282 C 158,278 164,270 172,264 C 180,258 186,254 196,252 C 204,250 210,252 216,256 C 226,262 232,268 240,272 C 250,277 260,278 270,282 C 282,287 292,292 300,296 C 308,300 314,300 322,296 C 332,290 340,280 352,272 C 362,264 374,258 390,256 L 390,380 L 0,380 Z"
        fill="#A8C490"
      />

      {/* Mid mountains — sage mid with talus jags */}
      <Path
        d="M 0,380 L 0,360 C 10,355 20,350 32,342 L 42,348 L 54,338 L 66,346 L 78,335 L 90,343 L 104,332 L 116,340 L 130,328 L 144,337 L 158,325 L 172,334 L 186,322 L 200,332 L 214,320 L 228,330 L 242,318 L 256,328 L 270,316 L 284,326 L 298,315 L 312,324 L 326,313 L 340,322 L 354,312 L 368,320 C 378,326 385,330 390,334 L 390,430 L 0,430 Z"
        fill="#8FA87A"
      />

      {/* Treeline — full width dense spruce/fir */}
      <Rect x={0} y={440} width={390} height={20} fill="#5E7A52" />
      <Polygon points="0,455 8,418 16,455"   fill="#5E7A52" />
      <Polygon points="10,455 20,406 30,455"  fill="#5E7A52" />
      <Polygon points="22,455 33,416 44,455"  fill="#5E7A52" />
      <Polygon points="36,455 47,402 58,455"  fill="#5E7A52" />
      <Polygon points="50,455 60,412 70,455"  fill="#5E7A52" />
      <Polygon points="62,455 72,420 82,455"  fill="#5E7A52" />
      <Polygon points="74,455 84,408 94,455"  fill="#5E7A52" />
      <Polygon points="86,455 98,400 110,455" fill="#5E7A52" />
      <Polygon points="100,455 112,414 124,455" fill="#5E7A52" />
      <Polygon points="114,455 126,404 138,455" fill="#5E7A52" />
      <Polygon points="128,455 140,418 152,455" fill="#5E7A52" />
      <Polygon points="142,455 154,406 166,455" fill="#5E7A52" />
      <Polygon points="156,455 168,398 180,455" fill="#5E7A52" />
      <Polygon points="170,455 182,410 194,455" fill="#5E7A52" />
      <Polygon points="184,455 196,402 208,455" fill="#5E7A52" />
      <Polygon points="198,455 210,416 222,455" fill="#5E7A52" />
      <Polygon points="212,455 224,404 236,455" fill="#5E7A52" />
      <Polygon points="226,455 238,412 250,455" fill="#5E7A52" />
      <Polygon points="240,455 252,400 264,455" fill="#5E7A52" />
      <Polygon points="254,455 266,414 278,455" fill="#5E7A52" />
      <Polygon points="268,455 280,406 292,455" fill="#5E7A52" />
      <Polygon points="282,455 294,418 306,455" fill="#5E7A52" />
      <Polygon points="296,455 308,402 320,455" fill="#5E7A52" />
      <Polygon points="310,455 322,412 334,455" fill="#5E7A52" />
      <Polygon points="324,455 336,404 348,455" fill="#5E7A52" />
      <Polygon points="338,455 350,416 362,455" fill="#5E7A52" />
      <Polygon points="352,455 364,406 376,455" fill="#5E7A52" />
      <Polygon points="366,455 378,418 390,455" fill="#5E7A52" />
      <Rect x={0} y={448} width={390} height={12} fill="#4A6644" opacity={0.5} />

      {/* Foreground slope — warm granite */}
      <Path
        d="M 0,540 L 0,520 C 8,515 18,510 30,505 L 42,512 L 52,502 L 65,510 L 78,498 L 92,507 L 106,496 L 120,505 L 136,494 L 150,503 L 165,492 L 180,501 L 195,488 L 210,498 L 226,486 L 242,496 L 258,484 L 274,494 L 290,482 L 306,492 L 322,481 L 338,490 L 354,480 L 370,488 C 380,494 386,498 390,502 L 390,780 L 0,780 Z"
        fill="url(#orSlope)"
      />
      {/* Rock shapes in slope */}
      <Polygon points="55,540 75,510 95,535 80,548"    fill="#9A8A70" opacity={0.55} />
      <Polygon points="150,560 172,528 196,555 178,572" fill="#A09080" opacity={0.50} />
      <Polygon points="260,548 282,516 308,542 290,560" fill="#9A8A70" opacity={0.50} />
      <Polygon points="330,570 352,538 374,562 358,578" fill="#A09080" opacity={0.45} />
      <Polygon points="30,600 52,572 70,596 50,614"    fill="#9A8A70" opacity={0.38} />
      <Polygon points="200,610 224,582 248,606 228,624" fill="#A09080" opacity={0.38} />

      {/* Trail — terracotta winding up slope */}
      <Path
        d="M 210,780 C 208,750 205,728 200,705 C 195,682 188,662 190,638 C 192,616 198,600 196,578 C 194,558 188,542 192,522 C 194,510 197,502 195,492"
        fill="none"
        stroke="#C4623A"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cairn */}
      <G transform="translate(148, 498)">
        <Ellipse cx={10} cy={20} rx={10}  ry={4}   fill="#5A4A36" />
        <Ellipse cx={10} cy={14} rx={7.5} ry={3.5} fill="#6A5846" />
        <Ellipse cx={10} cy={9}  rx={5.5} ry={3}   fill="#7A6856" />
        <Ellipse cx={10} cy={5}  rx={3.5} ry={2.5} fill="#8A7866" />
        <Ellipse cx={10} cy={2}  rx={2}   ry={1.5} fill="#9A8876" />
      </G>

      {/* Runner silhouette cresting the ridge */}
      <G transform="translate(180, 448)">
        {/* Head */}
        <Circle cx={18} cy={6} r={6} fill="#3A2E22" />
        {/* Torso */}
        <Path
          d="M 14,12 C 10,16 8,22 9,30 C 10,36 14,40 18,42 C 22,44 26,42 28,38 C 30,33 28,26 24,20 Z"
          fill="#C4623A"
        />
        {/* Pack */}
        <Path
          d="M 9,14 C 5,18 4,26 5,33 C 6,38 9,40 12,39 C 12,34 11,28 12,22 Z"
          fill="#3A2E22"
        />
        <Line x1={12} y1={14} x2={18} y2={16} stroke="#3A2E22" strokeWidth={1.5} />
        <Line x1={10} y1={20} x2={16} y2={22} stroke="#3A2E22" strokeWidth={1.2} opacity={0.6} />
        {/* Front arm */}
        <Path d="M 24,18 C 30,22 34,28 33,34" fill="none" stroke="#C4623A" strokeWidth={3.5} strokeLinecap="round" />
        {/* Back arm */}
        <Path d="M 12,18 C 6,24 2,28 4,36" fill="none" stroke="#3A2E22" strokeWidth={3} strokeLinecap="round" />
        {/* Front leg */}
        <Path d="M 20,40 C 22,48 24,54 28,60 C 30,64 34,66 36,70" fill="none" stroke="#C4623A" strokeWidth={4} strokeLinecap="round" />
        <Ellipse cx={37} cy={71} rx={5} ry={2.5} fill="#3A2E22" transform="rotate(15, 37, 71)" />
        {/* Back leg */}
        <Path d="M 16,40 C 14,46 10,50 6,54 C 3,58 0,60 -2,64" fill="none" stroke="#3A2E22" strokeWidth={4} strokeLinecap="round" />
        <Ellipse cx={-3} cy={65} rx={5} ry={2.5} fill="#3A2E22" transform="rotate(-10, -3, 65)" />
        {/* Shorts shading */}
        <Path d="M 14,40 C 16,44 20,46 22,44 C 24,42 24,40 22,38 L 18,38 Z" fill="#A03020" opacity={0.5} />
        {/* Bib */}
        <Rect x={14} y={22} width={9} height={7} rx={1} fill="#D4774A" opacity={0.6} />
      </G>
    </Svg>
  );
}
