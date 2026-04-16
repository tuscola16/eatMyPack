import React from 'react';
import SettingsHeaderSvg from '../../../assets/illustrations/settings-header.svg';

interface SettingsHeaderProps {
  width: number;
  height: number;
}

export default function SettingsHeader({ width, height }: SettingsHeaderProps) {
  return <SettingsHeaderSvg width={width} height={height} />;
}
