import React from 'react';
import EmptyPlansSvg from '../../../assets/illustrations/empty-plans.svg';

interface EmptyPlansProps {
  width?: number;
  height?: number;
}

export default function EmptyPlans({ width = 240, height = 240 }: EmptyPlansProps) {
  return <EmptyPlansSvg width={width} height={height} />;
}
