import React from 'react';
import PhaseMidSvg from '../../../assets/illustrations/phase-mid.svg';

interface PhaseMidProps {
  width?: number;
  height?: number;
}

export default function PhaseMid({ width = 160, height = 100 }: PhaseMidProps) {
  return <PhaseMidSvg width={width} height={height} />;
}
