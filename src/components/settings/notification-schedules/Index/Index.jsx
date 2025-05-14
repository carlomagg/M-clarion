import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import { useState } from 'react';

function Index() {
    const [errorState, setErrorState] = useState(null);
    
    const settingOptions = [
        { title: 'Notification Schedules', description: 'Configure notification intervals and schedule settings', path: '/settings/notification-schedules/manage' },
        // Add more options as needed for future notification settings
    ];

    // Error handler for links
    const handleLinkClick = (e, path) => {
        try {
            // If there was a previous error, allow navigation again
            if (errorState) {
                setErrorState(null);
            }
        } catch (err) {
            console.error("Navigation error:", err);
            e.preventDefault();
            setErrorState(err.message || "An error occurred during navigation");
        }
    };

    // If there was an error, show it
    if (errorState) {
        return (
            <div className='flex flex-col gap-6'>
                <div className='bg-white border border-red-200 p-6 flex flex-col gap-8'>
                    <header className='flex gap-3'>
                        <BackButton />
                        <h3 className='font-semibold text-xl text-red-600'>Error</h3>
                    </header>
                    <div className='bg-red-50 p-4 rounded-md'>
                        <p className='text-red-600'>{errorState}</p>
                        <button 
                            className='mt-3 bg-red-100 text-red-700 px-4 py-2 rounded-md'
                            onClick={() => setErrorState(null)}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
                <BackButton type='large' />
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-6'>
            <div className='bg-white p-6 flex flex-col gap-8'>
                <header className='flex gap-3'>
                    <BackButton />
                    <h3 className='font-semibold text-xl'>Notification Settings</h3>
                </header>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {settingOptions.map((option, index) => (
                        <Link 
                            key={index}
                            to={option.path}
                            className='p-4 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-md transition-colors'
                            onClick={(e) => handleLinkClick(e, option.path)}
                        >
                            <h4 className='font-medium text-lg'>{option.title}</h4>
                            <p className='text-sm text-gray-600 mt-1'>{option.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
            <BackButton type='large' />
        </div>
    );
}

export default Index; 