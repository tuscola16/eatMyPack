import React from 'react';
import SettingsIconSvg from '../../../assets/illustrations/settings-icon.svg';

interface SettingsIconProps {
  width?: number;
  height?: number;
}

export default function SettingsIcon({ width = 24, height = 24 }: SettingsIconProps) {
  return <SettingsIconSvg width={width} height={height} />;
}
