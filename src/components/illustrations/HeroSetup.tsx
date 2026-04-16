import React from 'react';
import HeroSetupSvg from '../../../assets/illustrations/hero-setup.svg';

interface HeroSetupProps {
  width: number;
  height: number;
}

export default function HeroSetup({ width, height }: HeroSetupProps) {
  return <HeroSetupSvg width={width} height={height} />;
}
