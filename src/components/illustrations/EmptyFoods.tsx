import React from 'react';
import EmptyFoodsSvg from '../../../assets/illustrations/empty-foods.svg';

interface EmptyFoodsProps {
  width?: number;
  height?: number;
}

export default function EmptyFoods({ width = 180, height = 180 }: EmptyFoodsProps) {
  return <EmptyFoodsSvg width={width} height={height} />;
}
