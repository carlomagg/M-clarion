import styles from './ErrorPage.module.css';

import PageHeader from '../../partials/PageHeader/PageHeader';
import { useNavigate, useRouteError } from 'react-router-dom';

function ErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();
    return (
        <div className='w-full h-full flex items-center justify-center'>
            <div className='flex flex-col gap-6 items-center'>
                <span className='text-lg font-medium'>Something went wrong!</span>
                <div className='text-sm'>{error.error?.message}</div>
                <button type="button" onClick={() => navigate('/')} className='bg-[#E44195] text-white font-semibold p-2 w-40 rounded-lg'>
                    Go home
                </button>
            </div>
        </div>
    )
}

export default ErrorPage;