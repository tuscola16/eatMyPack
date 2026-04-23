import React from 'react';
import ModerateIconSvg from '../../../assets/illustrations/moderate-icon.svg';

interface ModerateIconProps {
  width?: number;
  height?: number;
}

export default function ModerateIcon({ width = 24, height = 24 }: ModerateIconProps) {
  return <ModerateIconSvg width={width} height={height} />;
}
