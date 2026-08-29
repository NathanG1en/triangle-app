import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconProps {
  color?: string;
  size?: number;
}

export const CompassIcon: React.FC<IconProps> = ({ color = '#1A1A1A', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z" />
  </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ color = '#1A1A1A', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M8 2v4M16 2v4" />
    <Path d="M3 10h18" />
    <Path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
  </Svg>
);

export const PersonIcon: React.FC<IconProps> = ({ color = '#1A1A1A', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);
