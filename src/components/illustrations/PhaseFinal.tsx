import React from 'react';
import PhaseFinalSvg from '../../../assets/illustrations/phase-final.svg';

interface PhaseFinalProps {
  width?: number;
  height?: number;
}

export default function PhaseFinal({ width = 160, height = 100 }: PhaseFinalProps) {
  return <PhaseFinalSvg width={width} height={height} />;
}
