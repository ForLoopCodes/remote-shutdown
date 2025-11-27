/**
 * Pixel Art Icons
 *
 * Custom SVG pixel art icons for the app.
 * All icons are 30x30 pixels with a pixel/arcade style.
 */

import React from "react";
import Svg, { Path, G } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  opacity?: number;
}

// Home icon - pixel art house
export const HomeIcon: React.FC<IconProps> = ({
  size = 30,
  color = "#1c1f21",
  opacity = 1,
}) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    <G
      fill="none"
      strokeLinejoin="miter"
      strokeLinecap="butt"
      opacity={opacity}
    >
      <Path
        d="M3 15H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 19H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 23H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 27H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 11H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 27H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 7H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 19H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 23H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 27H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 3H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 19H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 7H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 19H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 23H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 27H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 11H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 27H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 15H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 19H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 23H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 27H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      {/* Semi-transparent pixels */}
      <Path
        d="M7 23H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M23 23H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
    </G>
  </Svg>
);

// Info icon - pixel art "i" information
export const InfoIcon: React.FC<IconProps> = ({
  size = 30,
  color = "#1c1f21",
  opacity = 1,
}) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    <G
      fill="none"
      strokeLinejoin="miter"
      strokeLinecap="butt"
      opacity={opacity}
    >
      <Path
        d="M7 11H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 7H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 3H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 3H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 3H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 7H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 11H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 19H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 27H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 15H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
    </G>
  </Svg>
);

// Settings icon - pixel art wrench/gear
export const SettingsIcon: React.FC<IconProps> = ({
  size = 30,
  color = "#1c1f21",
  opacity = 1,
}) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    <G
      fill="none"
      strokeLinejoin="miter"
      strokeLinecap="butt"
      opacity={opacity}
    >
      <Path
        d="M3 7H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 11H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 15H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 19H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 7H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 23H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 27H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 11H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 7H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 23H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 27H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 3H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 3H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 3H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 3H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 19H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 7H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 11H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 15H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      {/* Semi-transparent pixels */}
      <Path
        d="M7 11H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M7 15H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M11 19H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M15 19H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M15 23H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
    </G>
  </Svg>
);

// Shutdown icon - pixel art power button
export const ShutdownIcon: React.FC<IconProps> = ({
  size = 30,
  color = "#1c1f21",
  opacity = 1,
}) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    <G
      fill="none"
      strokeLinejoin="miter"
      strokeLinecap="butt"
      opacity={opacity}
    >
      <Path
        d="M3 11H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 15H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 19H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 7H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 23H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 27H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 3H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 7H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 11H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 15H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 27H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 27H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 7H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 23H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 11H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 15H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 19H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      {/* Semi-transparent pixels */}
      <Path
        d="M7 11H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M7 15H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M7 19H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M11 15H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M11 19H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M11 23H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M15 19H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M15 23H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M19 23H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
    </G>
  </Svg>
);

// Restart icon - pixel art refresh/circular arrow
export const RestartIcon: React.FC<IconProps> = ({
  size = 30,
  color = "#1c1f21",
  opacity = 1,
}) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    <G
      fill="none"
      strokeLinejoin="miter"
      strokeLinecap="butt"
      opacity={opacity}
    >
      <Path
        d="M27 15H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 19H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 23H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 11H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 27H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 11H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 11H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 27H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 27H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 7H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 11H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 15H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 19H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 3H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 7H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 11H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 15H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 11H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      {/* Semi-transparent pixels */}
      <Path
        d="M23 15H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M23 19H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M23 23H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M19 23H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
    </G>
  </Svg>
);

// Hibernate icon - pixel art moon/zzz
export const HibernateIcon: React.FC<IconProps> = ({
  size = 30,
  color = "#1c1f21",
  opacity = 1,
}) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    <G
      fill="none"
      strokeLinejoin="miter"
      strokeLinecap="butt"
      opacity={opacity}
    >
      <Path
        d="M3 11H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 15H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 19H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 7H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 23H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 7H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 11H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 3H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 27H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 15H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 27H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 19H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 27H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 7H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 3H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 3H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 19H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 23H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 7H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 19H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      {/* Semi-transparent pixels */}
      <Path
        d="M7 19H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M11 23H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
    </G>
  </Svg>
);

// Logout icon - pixel art door with arrow
export const LogoutIcon: React.FC<IconProps> = ({
  size = 30,
  color = "#1c1f21",
  opacity = 1,
}) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    <G
      fill="none"
      strokeLinejoin="miter"
      strokeLinecap="butt"
      opacity={opacity}
    >
      <Path
        d="M3 15H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 19H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 23H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 27H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 7H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 11H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 15H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 27H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 3H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 15H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 27H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 3H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 15H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 19H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 27H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 3H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 15H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 27H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 7H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 11H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 15H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 27H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 15H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 19H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 23H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 27H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      {/* Semi-transparent pixels */}
      <Path
        d="M7 19H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M7 23H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M11 19H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M11 23H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M15 23H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
    </G>
  </Svg>
);

// App Logo - Main icon (same as home but larger for branding)
export const AppLogo: React.FC<IconProps> = ({
  size = 80,
  color = "#1c1f21",
  opacity = 1,
}) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    <G
      fill="none"
      strokeLinejoin="miter"
      strokeLinecap="butt"
      opacity={opacity}
    >
      <Path
        d="M3 15H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 19H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 23H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M3 27H3.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 11H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M7 27H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 7H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 19H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 23H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M11 27H11.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 3H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M15 19H15.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 7H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 19H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 23H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M19 27H19.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 11H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M23 27H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 15H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 19H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 23H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      <Path
        d="M27 27H27.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
      {/* Semi-transparent pixels */}
      <Path
        d="M7 23H7.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
      <Path
        d="M23 23H23.01"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        opacity={0.25}
      />
    </G>
  </Svg>
);

export default {
  HomeIcon,
  InfoIcon,
  SettingsIcon,
  ShutdownIcon,
  RestartIcon,
  HibernateIcon,
  LogoutIcon,
  AppLogo,
};
