export const SpamIcon = ({ color }: { color?: string }) => {
    return (
        <svg width="16" height="16" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.15234 6.10618C8.15234 5.63757 8.53222 5.25769 9.00083 5.25769C9.46943 5.25769 9.84931 5.63757 9.84931 6.10618C9.84931 6.57478 9.46943 6.95466 9.00083 6.95466C8.53222 6.95466 8.15234 6.57478 8.15234 6.10618ZM8.15234 9.50011C8.15234 9.03151 8.53222 8.65163 9.00083 8.65163C9.46943 8.65163 9.84931 9.03151 9.84931 9.50011V12.8941C9.84931 13.3627 9.46943 13.7425 9.00083 13.7425C8.53222 13.7425 8.15234 13.3627 8.15234 12.8941V9.50011Z" fill={color ? color : '#575D73'} />
            <circle cx="9" cy="9.5" r="8" stroke={color ? color : '#575D73'} stroke-width="1.5" />
        </svg>
    )
}