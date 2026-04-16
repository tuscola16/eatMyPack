import React from 'react';
import PhaseNightSvg from '../../../assets/illustrations/phase-night.svg';

interface PhaseNightProps {
  width?: number;
  height?: number;
}

export default function PhaseNight({ width = 160, height = 100 }: PhaseNightProps) {
  return <PhaseNightSvg width={width} height={height} />;
}
