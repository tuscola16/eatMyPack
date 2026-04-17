import React from 'react';
import PantryIconSvg from '../../../assets/illustrations/pantry-icon.svg';

interface PantryIconProps {
  width?: number;
  height?: number;
}

export default function PantryIcon({ width = 40, height = 40 }: PantryIconProps) {
  return <PantryIconSvg width={width} height={height} />;
}
