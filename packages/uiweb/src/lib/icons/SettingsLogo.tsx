import React from 'react';

export const SettingsLogo = ({ height, width, color }: { height?: string, width?: string, color?: string }) => {
  return (
    <svg width={width ?? "36"} height={height ?? "40"} viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 12C16 13.1046 16.8954 14 18 14C19.1046 14 20 13.1046 20 12C20 10.8954 19.1046 10 18 10C16.8954 10 16 10.8954 16 12Z" fill={color ?? "black"} />
    <path d="M16 20C16 21.1046 16.8954 22 18 22C19.1046 22 20 21.1046 20 20C20 18.8954 19.1046 18 18 18C16.8954 18 16 18.8954 16 20Z" fill={color ?? "black"} />
    <path d="M16 28C16 29.1046 16.8954 30 18 30C19.1046 30 20 29.1046 20 28C20 26.8954 19.1046 26 18 26C16.8954 26 16 26.8954 16 28Z" fill={color ?? "black"} />
    </svg>
);
}
