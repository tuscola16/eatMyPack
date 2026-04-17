import React from 'react';
import ColdIconSvg from '../../../assets/illustrations/cold-icon.svg';

interface ColdIconProps {
  width?: number;
  height?: number;
}

export default function ColdIcon({ width = 24, height = 24 }: ColdIconProps) {
  return <ColdIconSvg width={width} height={height} />;
}
