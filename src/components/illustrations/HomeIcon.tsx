import React from 'react';
import HomeIconSvg from '../../../assets/illustrations/home-icon.svg';

interface HomeIconProps {
  width?: number;
  height?: number;
}

export default function HomeIcon({ width = 24, height = 24 }: HomeIconProps) {
  return <HomeIconSvg width={width} height={height} />;
}
