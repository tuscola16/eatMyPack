import React from 'react';
import HeroPlanSvg from '../../../assets/illustrations/hero-plan.svg';

interface HeroPlanProps {
  width: number;
  height: number;
}

export default function HeroPlan({ width, height }: HeroPlanProps) {
  return <HeroPlanSvg width={width} height={height} />;
}
