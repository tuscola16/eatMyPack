import React from 'react';
import HeroTrailSvg from '../../../assets/illustrations/hero-trail.svg';

interface HeroTrailProps {
  width: number;
  height: number;
}

export default function HeroTrail({ width, height }: HeroTrailProps) {
  return <HeroTrailSvg width={width} height={height} />;
}
