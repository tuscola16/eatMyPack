import React from 'react';
import PhaseLateSvg from '../../../assets/illustrations/phase-late.svg';

interface PhaseLateProps {
  width?: number;
  height?: number;
}

export default function PhaseLate({ width = 160, height = 100 }: PhaseLateProps) {
  return <PhaseLateSvg width={width} height={height} />;
}
