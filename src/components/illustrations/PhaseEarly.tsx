import React from 'react';
import PhaseEarlySvg from '../../../assets/illustrations/phase-early.svg';

interface PhaseEarlyProps {
  width?: number;
  height?: number;
}

export default function PhaseEarly({ width = 160, height = 100 }: PhaseEarlyProps) {
  return <PhaseEarlySvg width={width} height={height} />;
}
