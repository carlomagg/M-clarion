import styles from './ProcessBoundarySetup.module.css';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import BackButton from '../../components/BackButton';
import Modal from '../../risk-management/components/Modal';
import BoundaryLevelsTable from "./components/BoundaryLevelsTable";
import { InfoButton, CreateNewItemButton } from '../../risk-management/components/Buttons';
import { processBoundariesOptions } from '../../../../queries/process/process-boundaries';

// Direct API call for troubleshooting
const fetchDirectly = async () => {
    try {
        console.log('Making direct API call to /process/process-boundaries/view-all/');
        const response = await axios.get('/process/process-boundaries/view-all/');
        console.log('Direct API call response:', response);
        
        // Log the structure of the data
        const data = response.data;
        console.log('Response data structure:', {
            type: typeof data,
            isArray: Array.isArray(data),
            keys: data && typeof data === 'object' ? Object.keys(data) : 'N/A'
        });
        
        return data;
    } catch (error) {
        console.error('Direct API call error:', error);
        return { error: error.message };
    }
};

function ProcessBoundarySetup() {
    const [error, setError] = useState(null);
    const [dialog, setDialog] = useState(null);
    const [processedBoundaries, setProcessedBoundaries] = useState([]);
    const [debugInfo, setDebugInfo] = useState({});

    // Make a direct API call on component mount for debugging
    useEffect(() => {
        fetchDirectly().then(data => {
            console.log('Direct fetch result:', data);
            setDebugInfo(prev => ({ ...prev, directFetch: data }));
            
            // Try to extract boundaries from direct fetch
            if (data && data.process_boundaries) {
                setProcessedBoundaries(data.process_boundaries);
            }
        });
    }, []);

    // Listen for modal open events
    useEffect(() => {
        function handleOpenModal(e) {
            if (e.detail && e.detail.type === 'processBoundary') {
                setDialog(e.detail.context);
            }
        }

        try {
            window.addEventListener('open-modal', handleOpenModal);
            return () => window.removeEventListener('open-modal', handleOpenModal);
        } catch (err) {
            console.error("Error setting up event listener:", err);
            setError(err);
        }
    }, []);

    // queries with error handling
    const { isLoading, error: queryError, data: apiResponse } = useQuery({
        ...processBoundariesOptions({
            onSuccess: (data) => {
                console.log("Process boundaries data received:", data);
                setDebugInfo(prev => ({ ...prev, queryResponse: data }));
                
                // Extract the actual boundaries array based on the API response structure
                let boundaries = [];
                
                if (data && typeof data === 'object') {
                    // Debug the response object structure
                    console.log('Response keys:', Object.keys(data));
                    
                    // Check for the process_boundaries wrapper from actual API
                    if (data.process_boundaries && Array.isArray(data.process_boundaries)) {
                        console.log('Found process_boundaries array with', data.process_boundaries.length, 'items');
                        boundaries = data.process_boundaries;
                    } 
                    // Check other common response patterns
                    else if (Array.isArray(data)) {
                        console.log('Response is an array with', data.length, 'items');
                        boundaries = data;
                    }
                    else if (data.data && Array.isArray(data.data)) {
                        console.log('Found data array with', data.data.length, 'items');
                        boundaries = data.data;
                    }
                    else if (data.boundaries && Array.isArray(data.boundaries)) {
                        console.log('Found boundaries array with', data.boundaries.length, 'items');
                        boundaries = data.boundaries;
                    }
                    else if (data.items && Array.isArray(data.items)) {
                        console.log('Found items array with', data.items.length, 'items');
                        boundaries = data.items;
                    }
                    else if (data.results && Array.isArray(data.results)) {
                        console.log('Found results array with', data.results.length, 'items');
                        boundaries = data.results;
                    }
                    else {
                        // Try to find any array in the response
                        for (const key in data) {
                            if (Array.isArray(data[key])) {
                                console.log(`Found array at key "${key}" with ${data[key].length} items`);
                                boundaries = data[key];
                                break;
                            }
                        }
                    }
                }
                
                console.log("Extracted boundaries:", boundaries);
                setDebugInfo(prev => ({ ...prev, extractedBoundaries: boundaries }));
                
                if (boundaries && boundaries.length > 0) {
                    setProcessedBoundaries(boundaries);
                }
            },
            onError: (err) => {
                console.error("Error fetching process boundaries:", err);
                setDebugInfo(prev => ({ ...prev, queryError: err }));
                setError(err);
            }
        }),
        retry: 1
    });

    function checkOverlap(lowerBound, higherBound, id = null) {
        try {
            // ensure new range does not overlap with any existing range
            if (!processedBoundaries || processedBoundaries.length === 0) return false;
            
            const isOverlapping = processedBoundaries.some((boundary) => {
                if (boundary.id === id) return false;
                if (
                    (lowerBound >= boundary.lower_bound && lowerBound <= boundary.higher_bound) ||
                    (higherBound >= boundary.lower_bound && higherBound <= boundary.higher_bound) ||
                    (lowerBound <= boundary.lower_bound && higherBound >= boundary.higher_bound)
                ) return true;
                return false;
            });
            return isOverlapping;
        } catch (err) {
            console.error("Error checking overlap:", err);
            return false;
        }
    }

    function openDialog(mode, id, title) {
        setDialog({mode, id, title});
    }

    function removeDialog() {
        setDialog(null);
    }

    if (isLoading && processedBoundaries.length === 0) return (
        <div className='p-4 text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto'></div>
            <p className='mt-2'>Loading process boundaries...</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-4 h-full bg-white p-4 rounded-xl">
            <div className='flex items-center mb-2'>
                <BackButton />
                <h3 className='font-semibold text-xl ml-3'>Process Boundary Setup</h3>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h4 className="font-medium">Process Boundaries</h4>
                    <InfoButton />
                </div>
                <CreateNewItemButton text={'New Boundary'} onClick={() => openDialog('add')} />
            </div>
            
            {(queryError || error) ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                    <p><strong>Error loading process boundaries:</strong> {(queryError || error)?.message || "An unexpected error occurred"}</p>
                </div>
            ) : (
                <>
                    <BoundaryLevelsTable 
                        items={processedBoundaries || []} 
                        checkOverlap={checkOverlap}
                    />
                    
                    {/* Only show debugging in development */}
                    {process.env.NODE_ENV !== 'production' && processedBoundaries.length === 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-yellow-800 font-medium">API Response Debugging</p>
                            <details className="mt-2">
                                <summary className="cursor-pointer text-sm">Show API Response Details</summary>
                                <div className="mt-2 p-2 bg-white rounded overflow-auto max-h-60 text-xs">
                                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                                </div>
                            </details>
                        </div>
                    )}
                </>
            )}

            {
                dialog &&
                <Modal 
                    type="processBoundary" 
                    context={{
                        ...dialog, 
                        checkOverlap
                    }}
                    onRemove={removeDialog}
                />
            }
        </div>
    );
}

export default ProcessBoundarySetup; 