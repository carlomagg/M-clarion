import { useNavigate } from 'react-router-dom';
import styles from './Error.module.css';

function Error({error = null}) {
    const navigate = useNavigate();
    return (
        <div className='h-full w-full grid place-items-center'>
            <div className='flex flex-col gap-4'>
                <span className='italic text-text-gray'>An error occured:</span>
                {
                    error ?
                    <span className='font-semibold text-lg'>{error.message}</span> :
                    <span className='font-semibold text-lg'>Something went wrong. Please try again later.</span>
                }
                <div className='flex gap-4'>
                    <button type="button" onClick={() => {navigate(-1)}} className='bg-[#E44195] text-white font-semibold p-2 w-40 rounded-lg'>
                        Go back
                    </button>
                    <button type="button" onClick={() => {location.reload()}} className='bg-[#E44195] text-white font-semibold p-2 w-40 rounded-lg'>
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Error;