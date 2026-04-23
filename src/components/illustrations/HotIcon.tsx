import React from 'react';
import HotIconSvg from '../../../assets/illustrations/hot-icon.svg';

interface HotIconProps {
  width?: number;
  height?: number;
}

export default function HotIcon({ width = 24, height = 24 }: HotIconProps) {
  return <HotIconSvg width={width} height={height} />;
}
