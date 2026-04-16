import React from 'react';
import { ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { FoodCategory } from '@/types/food';

import GelSvg from '../../../assets/gels.svg';
import BarSvg from '../../../assets/bars.svg';
import ChewSvg from '../../../assets/blocks.svg';
import DrinkMixSvg from '../../../assets/drink_mixes.svg';
import RealFoodSvg from '../../../assets/real_food.svg';
import NutButterSvg from '../../../assets/nut_butters.svg';
import FreezeDriedSvg from '../../../assets/freeze_dried.svg';

interface CategoryIconProps {
  category: FoodCategory;
  size?: number;
  style?: ViewStyle;
}

const SVG_CATEGORY_MAP: Record<string, React.FC<SvgProps>> = {
  gel: GelSvg,
  bar: BarSvg,
  chew: ChewSvg,
  drink_mix: DrinkMixSvg,
  real_food: RealFoodSvg,
  nut_butter: NutButterSvg,
  freeze_dried: FreezeDriedSvg,
};

export default function CategoryIcon({ category, size = 28 }: CategoryIconProps) {
  const SvgComponent = SVG_CATEGORY_MAP[category];
  if (!SvgComponent) {
    return <GelSvg width={size} height={size} />;
  }
  return <SvgComponent width={size} height={size} />;
}
