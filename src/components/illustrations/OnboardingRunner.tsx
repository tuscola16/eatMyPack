import React from 'react';
import OnboardingRunnerSvg from '../../../assets/illustrations/onboarding-runner.svg';

interface OnboardingRunnerProps {
  width?: number;
  height?: number;
}

export default function OnboardingRunner({ width = 390, height = 780 }: OnboardingRunnerProps) {
  return <OnboardingRunnerSvg width={width} height={height} />;
}
