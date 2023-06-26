import React from 'react';

export const NewMessage = ({
    stroke,
    fill,
}: {
    stroke?: string;
    fill?: string;
}) => {
    return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 30V2C0 1.43333 0.191667 0.958333 0.575 0.575C0.958333 0.191667 1.43333 0 2 0H28C28.5667 0 29.0417 0.191667 29.425 0.575C29.8083 0.958333 30 1.43333 30 2V20C30 20.5667 29.8083 21.0417 29.425 21.425C29.0417 21.8083 28.5667 22 28 22H8L0 30ZM10 32C9.43333 32 8.95833 31.8083 8.575 31.425C8.19167 31.0417 8 30.5667 8 30V26H34V8H38C38.5667 8 39.0417 8.19167 39.425 8.575C39.8083 8.95833 40 9.43333 40 10V40L32 32H10ZM26 4H4V20.35L6.35 18H26V4Z" fill="#62626A" />
        </svg>
    );
};