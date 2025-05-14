import { useNavigate } from "react-router-dom";

function BackButton({ onClick = null, type = 'small' }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(-1);
        }
    };

    return type === 'small' ? (
        <button
            type="button"
            onClick={handleClick}
            className="hover:bg-gray-100 p-2 rounded-full"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
            </svg>
        </button>
    ) : (
        <button
            type="button"
            onClick={handleClick}
            className="mt-4 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
        </button>
    );
}

export default BackButton;