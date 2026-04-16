import React from 'react';
import { ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SvgProps } from 'react-native-svg';
import { FoodCategory } from '@/types/food';

import GelSvg from '../../../assets/gels.svg';
import BarSvg from '../../../assets/bars.svg';
import ChewSvg from '../../../assets/blocks.svg';
import DrinkMixSvg from '../../../assets/drink_mixes.svg';
import RealFoodSvg from '../../../assets/real_food.svg';
import NutButterSvg from '../../../assets/nut_butters.svg';

interface CategoryIconProps {
  category: FoodCategory;
  size?: number;
  style?: ViewStyle;
}

// freeze_dried.svg is actually a PNG — keep hand-coded
function FreezeDriedIcon({ size }: { size: number }) {
  return (
    <Svg viewBox="0 0 200 240" width={size} height={size} fill="none">
      <Path
        d="M30 50 Q30 40 40 40 L160 40 Q170 40 170 50 L170 200 Q170 220 150 220 L50 220 Q30 220 30 200 Z"
        fill="#D9D9D9"
        stroke="black"
        strokeWidth={4}
      />
      <Path
        d="M25 40 Q25 20 100 20 Q175 20 175 40 L175 55 Q175 60 170 60 L30 60 Q25 60 25 55 Z"
        fill="#807F7F"
        stroke="black"
        strokeWidth={3}
      />
      <Path
        d="M55 90 L145 90 L145 170 L55 170 Z"
        fill="#AEAEAE"
        stroke="black"
        strokeWidth={2}
      />
      <Path
        d="M170 80 L185 75 L185 85 Z"
        fill="#807F7F"
        stroke="black"
        strokeWidth={2}
      />
    </Svg>
  );
}

const SVG_CATEGORY_MAP: Record<string, React.FC<SvgProps>> = {
  gel: GelSvg,
  bar: BarSvg,
  chew: ChewSvg,
  drink_mix: DrinkMixSvg,
  real_food: RealFoodSvg,
  nut_butter: NutButterSvg,
};

export default function CategoryIcon({ category, size = 28 }: CategoryIconProps) {
  if (category === 'freeze_dried') {
    return <FreezeDriedIcon size={size} />;
  }

  const SvgComponent = SVG_CATEGORY_MAP[category];
  if (!SvgComponent) {
    return <GelSvg width={size} height={size} />;
  }
  return <SvgComponent width={size} height={size} />;
}
