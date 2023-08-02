import React from 'react';

export const RejectRequest = ({ height, width, color }: { height?: string, width?: string, color?: string }) => {
    return (
        < svg
            width={width || "48"}
            height={height || "48"}
            viewBox = "0 0 48 48"
            fill = "none"
            xmlns = "http://www.w3.org/2000/svg"
        >
            <path d="M24 42C33.9411 42 42 33.9411 42 24C42 14.0589 33.9411 6 24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42Z" stroke="#E93636" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M30 18L18 30" stroke="#E93636" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M30 30L18 18" stroke="#E93636" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    );
};
