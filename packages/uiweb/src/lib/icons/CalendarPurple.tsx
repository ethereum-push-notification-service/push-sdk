import React from 'react';

export const CalendarPurple = ({ height, width }: { height?: string, width?: string }) => {
    return (
        < svg
            width={width || "15"}
            height={height || "14"}
            viewBox = "0 0 15 14"
            fill = "none"
            xmlns = "http://www.w3.org/2000/svg"
        >
            <path
                d = "M5.72237 11.7409H3.94459C3.31593 11.7409 2.71301 11.4912 2.26848 11.0466C1.82395 10.6021 1.57422 9.99918 1.57422 9.37052V4.03718C1.57422 3.40852 1.82395 2.80561 2.26848 2.36108C2.71301 1.91655 3.31593 1.66681 3.94459 1.66681H10.4631C11.0918 1.66681 11.6947 1.91655 12.1392 2.36108C12.5837 2.80561 12.8335 3.40852 12.8335 4.03718V5.81496M5.12977 1.07422V2.2594M9.27792 1.07422V2.2594M1.57422 4.62977H12.8335M11.352 9.15896L10.4631 10.0478"
                stroke = "#8B5CF6"
                stroke-width = "1.18519"
                stroke-linecap = "round"
                stroke-linejoin = "round"
            />
            <path
                d = "M10.463 12.9259C12.0994 12.9259 13.4259 11.5994 13.4259 9.96296C13.4259 8.32656 12.0994 7 10.463 7C8.82656 7 7.5 8.32656 7.5 9.96296C7.5 11.5994 8.82656 12.9259 10.463 12.9259Z"
                stroke = "#8B5CF6"
                stroke-width = "1.18519"
                stroke-linecap = "round"
                stroke-linejoin = "round"
            />
        </svg>
    );
};
