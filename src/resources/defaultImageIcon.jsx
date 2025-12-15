import React from 'react';

const ImageIcon = ({ size = 24, color = "#6B7280", className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rounded rectangle frame */}
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="3"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      
      {/* Sun/Moon circle in top left */}
      <circle
        cx="8"
        cy="8"
        r="2"
        fill={color}
      />
      
      {/* Mountain shapes */}
      <path
        d="M2 18 L8 12 L12 16 L16 11 L22 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default ImageIcon;