import styles from './ErrorPage.module.css';

import PageHeader from '../../partials/PageHeader/PageHeader';
import { useNavigate, useRouteError } from 'react-router-dom';

function ErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();

    const getErrorMessage = () => {
        if (error?.status === 404) {
            return "Page not found";
        }
        return error?.error?.message || "Something went wrong!";
    };

    return (
        <div className='w-full h-full flex items-center justify-center'>
            <div className='flex flex-col gap-6 items-center'>
                <span className='text-lg font-medium'>{getErrorMessage()}</span>
                {error?.status === 404 ? (
                    <div className='text-sm'>The page you're looking for doesn't exist or has been moved.</div>
                ) : (
                    <div className='text-sm'>{error?.error?.message || "An unexpected error occurred."}</div>
                )}
                <button 
                    type="button" 
                    onClick={() => navigate('/')} 
                    className='bg-[#E44195] text-white font-semibold p-2 w-40 rounded-lg hover:bg-[#d13b8a] transition-colors'
                >
                    Go home
                </button>
            </div>
        </div>
    );
}

export default ErrorPage;