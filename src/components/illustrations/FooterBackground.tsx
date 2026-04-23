import React from 'react';
import FooterBackgroundSvg from '../../../assets/illustrations/footer-background.svg';

interface FooterBackgroundProps {
  width?: number;
  height?: number;
}

export default function FooterBackground({ width = 1126, height = 135 }: FooterBackgroundProps) {
  return <FooterBackgroundSvg width={width} height={height} preserveAspectRatio="none" />;
}
