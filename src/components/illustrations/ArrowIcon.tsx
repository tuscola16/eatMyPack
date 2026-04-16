import React from 'react';
import ArrowIconSvg from '../../../assets/illustrations/arrow-icon.svg';

interface ArrowIconProps {
  width?: number;
  height?: number;
}

export default function ArrowIcon({ width = 10, height = 24 }: ArrowIconProps) {
  return <ArrowIconSvg width={width} height={height} />;
}
