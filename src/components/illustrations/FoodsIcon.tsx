import React from 'react';
import FoodsIconSvg from '../../../assets/illustrations/foods-icon.svg';

interface FoodsIconProps {
  width?: number;
  height?: number;
}

export default function FoodsIcon({ width = 24, height = 24 }: FoodsIconProps) {
  return <FoodsIconSvg width={width} height={height} />;
}
