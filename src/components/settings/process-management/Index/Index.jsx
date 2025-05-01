import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import { useState } from 'react';

function Index() {
    const [errorState, setErrorState] = useState(null);
    
    const settingOptions = [
        { title: 'Process Boundary Setup', description: 'Configure process boundary levels and thresholds', path: '/settings/process-management/process-boundary' },
        // Add more options as needed for future PM Parameters
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
            <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8'>
                <header className='flex gap-3'>
                    <BackButton />
                    <h3 className='font-semibold text-xl'>Process Management Parameters</h3>
                </header>
                <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {
                        settingOptions.map((option, idx) => (
                            <Link 
                                key={idx} 
                                to={option.path} 
                                className='border border-[#E2E2E2] rounded-lg p-4 flex flex-col gap-2 transition-all hover:shadow-md'
                                onClick={(e) => handleLinkClick(e, option.path)}
                            >
                                <h4 className='font-medium text-base'>{option.title}</h4>
                                <p className='text-[#757575] text-sm'>{option.description}</p>
                            </Link>
                        ))
                    }
                </section>
            </div>
            <BackButton type='large' />
        </div>
    );
}

export default Index; 