import { useEffect, useState, useMemo } from "react";
import { FormCancelButton, FormProceedButton } from "../../../../partials/buttons/FormButtons/FormButtons";
import { Field } from "../../../../partials/Elements/Elements";
import { CloseButton } from "../../../risk-management/components/Buttons";
import { ColorChip } from "./Elements";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";
import axios from "axios";

export default function ProcessBoundaryDialog({context, onRemoveModal}) {
    const [isOverlapping, setIsOverLapping] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        lower_bound: '',
        higher_bound: '',
        colour_description: '',
        colour: '#000000',
        sub_coy_id: 1000 // Default value as per the payload example
    });
    const [localError, setLocalError] = useState(null);

    const {mode, checkOverlap, id: boundaryId = null, title = '', mockData = null, boundaryData = null} = context;
    const queryClient = useQueryClient();
    const isMockMode = !!mockData;
    
    // Log all context props for debugging
    console.log('ProcessBoundaryDialog context:', {
        mode, 
        boundaryId, 
        title, 
        hasBoundaryData: !!boundaryData,
        hasMockData: !!mockData,
        isMockMode
    });
    
    if (boundaryData) {
        console.log('Direct boundary data provided:', boundaryData);
    }

    // Find the mock boundary data if we're in mock mode
    const mockBoundary = isMockMode && boundaryId ? 
        mockData.find(b => b.id === boundaryId) || {} : null;

    // queries with error handling - only run if we don't have direct data
    const { 
        isLoading, 
        error, 
        data: apiResponse = {} 
    } = useQuery({
        queryKey: ['process', 'boundaries', boundaryId],
        queryFn: async ({ queryKey }) => {
            // Extract ID from the queryKey
            const [_, __, id] = queryKey;
            
            // If mock mode is enabled or it's delete mode, return mock or empty data
            if (isMockMode) return mockBoundary;
            if (!id || mode === 'delete') return {};
            
            try {
                // Try the primary endpoint format
                try {
                console.log(`Fetching process boundary ${id} from /process/process-boundaries/${id}/view/`);
                const response = await axios.get(`/process/process-boundaries/${id}/view/`);
                    console.log('Boundary fetch response from primary endpoint:', response.data);
                return response.data;
                } catch (primaryError) {
                    console.warn(`Primary endpoint failed: ${primaryError.message}, trying alternative...`);
                    
                    // Try alternative endpoint format if primary fails
                    try {
                        console.log(`Trying alternative endpoint: /process/process-boundaries/${id}`);
                        const altResponse = await axios.get(`/process/process-boundaries/${id}`);
                        console.log('Boundary fetch response from alternative endpoint:', altResponse.data);
                        return altResponse.data;
                    } catch (altError) {
                        console.error(`Alternative endpoint also failed: ${altError.message}`);
                        throw primaryError; // Throw the original error
                    }
                }
            } catch (error) {
                console.error("Error fetching process boundary:", error);
                
                // Check for HTML response
                if (error.response?.data && typeof error.response.data === 'string' && 
                    error.response.data.includes('<!DOCTYPE')) {
                    throw new Error('Server returned an HTML page instead of JSON. The API endpoint may be incorrect or the server is returning an error page.');
                }
                
                throw error;
            }
        },
        // Only enable API fetch if we don't have direct data
        enabled: !!boundaryId && mode !== 'delete' && !isMockMode && !boundaryData,
        onError: (error) => {
            console.error("Error fetching process boundary:", error);
            setLocalError(error);
        },
        retry: 2
    });

    // Extract the boundary data from API response or use direct data if available
    const boundary = useMemo(() => {
        // If direct boundary data is provided, use it (highest priority)
        if (boundaryData) {
            console.log('Using directly provided boundary data');
            return boundaryData;
        }
        
        // If in mock mode and we have mock data, use that
        if (isMockMode && mockBoundary) {
            console.log('Using mock boundary data');
            return mockBoundary;
        }
        
        // Otherwise process the API response
        if (!apiResponse) return {};
        
        console.log('Processing API response for boundary view:', apiResponse);
        
        // Try to handle special case where the API returns { "1": { ... } } with ID as key
        if (typeof apiResponse === 'object' && !Array.isArray(apiResponse)) {
            // If the boundaryId exists as a key in the response
            if (boundaryId && apiResponse[boundaryId]) {
                console.log(`Found boundary data at key "${boundaryId}":`, apiResponse[boundaryId]);
                return apiResponse[boundaryId];
            }
            
            // If response has only one key and it's the boundary ID
            const keys = Object.keys(apiResponse);
            if (keys.length === 1 && keys[0] === String(boundaryId)) {
                console.log(`Found boundary data at key "${boundaryId}":`, apiResponse[keys[0]]);
                return apiResponse[keys[0]];
            }
        }
        
        // If it's already a simple object with the expected fields, use it directly
        if (apiResponse.description !== undefined || 
            apiResponse.lower_bound !== undefined || 
            apiResponse.higher_bound !== undefined) {
            console.log('Using API response directly as it contains expected fields');
            return apiResponse;
        }
        
        // Check common wrapper patterns
        if (typeof apiResponse === 'object') {
            // Try common response patterns
            const wrapperKeys = ['process_boundary', 'boundary', 'data', 'item'];
            
            for (const key of wrapperKeys) {
                if (apiResponse[key] && typeof apiResponse[key] === 'object') {
                    console.log(`Found boundary data in response wrapper at "${key}":`, apiResponse[key]);
                    return apiResponse[key];
                }
            }
            
            // If there's only one key with an object value, it might be the boundary
            const keys = Object.keys(apiResponse);
            if (keys.length === 1 && typeof apiResponse[keys[0]] === 'object') {
                console.log(`Found potential boundary data at key "${keys[0]}":`, apiResponse[keys[0]]);
                return apiResponse[keys[0]];
            }
        }
        
        console.log('No structured boundary data found, using raw response');
        return apiResponse;
    }, [apiResponse, boundaryId, boundaryData, isMockMode, mockBoundary]);

    // populate formdata when in edit mode
    useEffect(() => {
        try {
            // For edit mode, populate the form data
            if (mode === 'edit') {
                console.log('Populating form data in edit mode with data:', boundary);
                
                if (boundary && Object.keys(boundary).length > 0) {
                setFormData({
                        description: boundary.description || '',
                        lower_bound: boundary.lower_bound !== undefined && boundary.lower_bound !== null 
                            ? boundary.lower_bound 
                            : '',
                        higher_bound: boundary.higher_bound !== undefined && boundary.higher_bound !== null 
                            ? boundary.higher_bound 
                            : '',
                        colour_description: boundary.colour_description || '',
                        colour: boundary.colour || '#000000',
                        sub_coy_id: boundary.sub_coy_id || 1000
                    });
                    
                    console.log('Form data populated successfully');
                } else {
                    console.warn('No boundary data available to populate form');
                }
            }
        } catch (err) {
            console.error("Error setting form data:", err);
            setLocalError(err);
        }
    }, [mode, boundary]);

    // Handle mock mutations differently
    const handleMockMutation = (type, data = null) => {
        // Simulate a successful API response
        setTimeout(() => {
            // Show success message
            dispatchMessage('success', `Process boundary ${type === 'add' ? 'created' : type === 'edit' ? 'updated' : 'deleted'} successfully`);
            
            // Close the modal
            onRemoveModal();
        }, 1000);
    };

    // mutations with error handling
    const addBoundaryMutation = useMutation({
        mutationFn: async (data) => {
            if (isMockMode) {
                return handleMockMutation('add', data);
            }
            
            console.log('Creating new process boundary with data:', data);
            const response = await axios.post('/process/process-boundaries/', data);
            console.log('Create response:', response.data);
            return response.data;
        },
        onSuccess,
        onError: (error) => {
            console.error("Error adding boundary:", error);
            onError(error);
        },
        onSettled
    });
    
    const updateBoundaryMutation = useMutation({
        mutationFn: async ({id, data}) => {
            if (isMockMode) {
                return handleMockMutation('edit', data);
            }
            
            console.log(`Updating process boundary ${id} with data:`, data);
            const response = await axios.put(`/process/process-boundaries/${id}/update/`, data);
            console.log('Update response:', response.data);
            return response.data;
        },
        onSuccess,
        onError: (error) => {
            console.error("Error updating boundary:", error);
            onError(error);
        },
        onSettled
    });
    
    const deleteBoundaryMutation = useMutation({
        mutationFn: async (id) => {
            if (isMockMode) {
                return handleMockMutation('delete');
            }
            
            console.log(`Deleting process boundary ${id}`);
            const response = await axios.delete(`/process/process-boundaries/${id}/delete/`);
            console.log('Delete response:', response.data);
            return response.data;
        },
        onSuccess,
        onError: (error) => {
            console.error("Error deleting boundary:", error);
            onError(error);
        },
        onSettled
    });

    const dispatchMessage = useDispatchMessage();
    
    useEffect(() => {
        try {
            let text = addBoundaryMutation.isPending 
                ? 'Adding new process boundary...' 
                : updateBoundaryMutation.isPending 
                ? 'Updating process boundary...'
                : deleteBoundaryMutation.isPending
                ? 'Deleting process boundary...'
                : '';
            
            (addBoundaryMutation.isPending || updateBoundaryMutation.isPending || deleteBoundaryMutation.isPending) && dispatchMessage('processing', text);
        } catch (err) {
            console.error("Error dispatching message:", err);
            setLocalError(err);
        }
    }, [addBoundaryMutation.isPending, updateBoundaryMutation.isPending, deleteBoundaryMutation.isPending]);

    async function onSuccess(data) {
        try {
            console.log('Operation successful:', data);
            
            if (!isMockMode) {
                // Invalidate both the list and the individual item query if it exists
                await queryClient.invalidateQueries({queryKey: ['process', 'boundaries']});
                
                if (boundaryId) {
                    await queryClient.invalidateQueries({
                        queryKey: ['process', 'boundaries', boundaryId]
                    });
                }
            }
            
            const message = data?.message || 
                mode === 'add' ? 'Process boundary created successfully' :
                mode === 'edit' ? 'Process boundary updated successfully' :
                mode === 'delete' ? 'Process boundary deleted successfully' :
                'Operation successful';
                
            dispatchMessage('success', message);
        } catch (err) {
            console.error("Error in success handler:", err);
            setLocalError(err);
        }
    }
    
    function onError(error) {
        try {
            console.log('Operation failed:', error);
            
            // Check for HTML response in error
            if (error.response?.data && typeof error.response.data === 'string' && 
                error.response.data.includes('<!DOCTYPE')) {
                dispatchMessage('failed', 'Server returned an HTML page instead of JSON. The API endpoint may be incorrect or the server is returning an error page.');
                return;
            }
            
            // For network errors
            if (error.message === 'Network Error') {
                dispatchMessage('failed', 'Network error. Please check your connection and try again.');
                return;
            }
            
            // For 404 errors
            if (error.response?.status === 404) {
                dispatchMessage('failed', 'API endpoint not found (404). Please verify the API URL.');
                return;
            }
            
            // Default message
            dispatchMessage('failed', error?.response?.data?.message || error?.message || 'Operation failed');
        } catch (err) {
            console.error("Error in error handler:", err);
            setLocalError(err);
        }
    }
    
    function onSettled(data, error) {
        if (!error) {
            // Close the modal first
            onRemoveModal();
            
            // Only perform page refresh if not in mock mode
            if (!isMockMode) {
                // Short delay before refreshing to allow the success message to be seen
                setTimeout(() => {
                    window.location.reload();
                }, 1500); // 1.5 second delay
            }
        }
    }

    function handleChange(e) {
        try {
            setIsOverLapping(false);
            setFormData({...formData, [e.target.name]: e.target.value});
        } catch (err) {
            console.error("Error handling form change:", err);
            setLocalError(err);
        }
    }

    function handleSave() {
        try {
            // Clear any previous overlapping state
            setIsOverLapping(false);
            
            // For delete operations
            if (mode === 'delete') {
                if (!boundaryId) {
                    throw new Error("Cannot delete: Missing boundary ID");
                }
                console.log(`Deleting process boundary with ID: ${boundaryId}`);
                deleteBoundaryMutation.mutate(boundaryId);
                return;
            }
            
            // Validate form data for add and edit operations
            if (!formData.description) {
                dispatchMessage('failed', 'Description is required');
                return;
            }
            
            if (formData.lower_bound === '' || formData.higher_bound === '') {
                dispatchMessage('failed', 'Lower and higher bounds are required');
                return;
            }
            
            const lowerBound = Number(formData.lower_bound);
            const higherBound = Number(formData.higher_bound);
            
            if (isNaN(lowerBound) || isNaN(higherBound)) {
                dispatchMessage('failed', 'Bounds must be valid numbers');
                return;
            }
            
            if (lowerBound >= higherBound) {
                dispatchMessage('failed', 'Lower bound must be less than higher bound');
                return;
            }
            
            // Check for overlaps if the function is available
            if (checkOverlap && checkOverlap(lowerBound, higherBound, boundaryId)) {
                setIsOverLapping(true);
                dispatchMessage('failed', 'This boundary overlaps with an existing boundary');
                return;
            }
            
            // Execute the appropriate mutation based on mode
            if (mode === 'add') {
                console.log(`Creating new process boundary:`, formData);
                addBoundaryMutation.mutate(formData);
            } else if (mode === 'edit') {
                if (!boundaryId) {
                    throw new Error("Cannot update: Missing boundary ID");
                }
                console.log(`Updating process boundary with ID: ${boundaryId}`, formData);
                updateBoundaryMutation.mutate({id: boundaryId, data: formData});
            }
        } catch (err) {
            console.error("Error saving boundary:", err);
            setLocalError(err);
            dispatchMessage('failed', 'Error saving: ' + (err.message || 'Unknown error'));
        }
    }

    // Handle local errors
    if (localError) {
        return (
            <div className="bg-white border border-[#E2E2E2] rounded-2xl w-[500px] p-6">
                <div className="flex flex-col gap-6">
                    <header className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg text-red-600">Error</h4>
                        <CloseButton onClose={onRemoveModal} />
                    </header>
                    <div className="bg-red-50 p-4 rounded-md">
                        <p className="text-red-600">An error occurred: {localError.message || "Unknown error"}</p>
                        <button 
                            className="mt-3 bg-red-100 text-red-700 px-4 py-2 rounded-md"
                            onClick={onRemoveModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If in mock mode, display an information banner
    const MockModeBanner = isMockMode ? (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700">
            Running in demo mode with mock data. Changes won't be saved permanently.
        </div>
    ) : null;

    let content;

    if (mode === 'delete') {
        content = (
            <>
                {MockModeBanner}
                <div className="flex flex-col gap-3">
                    <p className="text-center">Are you sure you want to delete the process boundary: <strong>{title}</strong>?</p>
                    <p className="text-center text-sm text-gray-500">This action cannot be undone.</p>
                </div>
                <hr className="border border-red-[#CCC]" />
                <div className="flex gap-6 justify-center">
                    <FormCancelButton text={'Cancel'} onClick={onRemoveModal} />
                    <FormProceedButton disabled={deleteBoundaryMutation.isPending} text={'Delete'} onClick={handleSave} classes="bg-red-600 hover:bg-red-700" />
                </div>
            </>
        );
    } else if (isLoading && !isMockMode) {
        content = (
            <div className="flex flex-col items-center justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2">Loading...</p>
            </div>
        );
    } else if (error && !isMockMode) {
        content = (
            <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-600">Error loading process boundary: {error.message}</p>
            </div>
        );
    } else {
        const boundaryData = isMockMode ? mockBoundary : boundary;
        console.log('Rendering boundary data:', boundaryData);
        
        if (mode === 'view' && (!boundaryData || Object.keys(boundaryData).length === 0)) {
            content = (
                <div className="p-4 bg-yellow-50 rounded-md">
                    <p className="text-yellow-700">No data found for this process boundary. It may have been deleted or is not accessible.</p>
                    <p className="text-xs text-yellow-600 mt-2">Try refreshing the page or contact support if the issue persists.</p>
                </div>
            );
        } else {
            content = mode === 'edit' || mode === 'add' ?
                <>
                    {MockModeBanner}
                    <div className="flex flex-col gap-3">
                        {
                            isOverlapping &&
                            <div className="text-sm text-red-500">Selected boundary overlaps with existing boundary.</div>
                        }
                        <Field {...{name: 'description', label: 'Description', placeholder: 'Enter name of boundary', value: formData.description, onChange: handleChange}} />
                        <div className="flex gap-6">
                            <Field {...{type: 'number', name: 'lower_bound', label: 'Lower Bound', value: formData.lower_bound, onChange: handleChange}} />
                            <Field {...{type: 'number', name: 'higher_bound', label: 'Higher Bound', value: formData.higher_bound, onChange: handleChange}} />
                        </div>
                        <div className="flex gap-6">
                            <Field {...{name: 'colour_description', label: 'Color Description', placeholder: 'Enter color description', value: formData.colour_description, onChange: handleChange}} />
                            <Field {...{type: 'color', name: 'colour', label: 'Color', value: formData.colour, onChange: handleChange}} />
                        </div>
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex gap-6">
                        <FormCancelButton text={'Discard'} onClick={onRemoveModal} />
                        <FormProceedButton 
                          disabled={addBoundaryMutation.isPending || updateBoundaryMutation.isPending} 
                          text={'Save'} 
                          onClick={handleSave} 
                        />
                    </div>
                </> :
                <>
                    {MockModeBanner}
                    {/* View mode */}
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Description</span>
                        <p>{boundaryData.description || 'No description'}</p>
                        
                        {boundaryData.id !== undefined && (
                            <div className="text-xs text-gray-500 mt-1">
                                ID: {boundaryData.id}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-6">
                        <div className="flex flex-col gap-3">
                            <span className="font-medium">Lower Bound</span>
                            <p>{boundaryData.lower_bound ?? 'Not set'}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="font-medium">Higher Bound</span>
                            <p>{boundaryData.higher_bound ?? 'Not set'}</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex flex-col gap-3">
                            <span className="font-medium">Color Description</span>
                            <p>{boundaryData.colour_description || 'Not set'}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="font-medium">Color</span>
                            <p className="flex gap-2 items-center">
                                <ColorChip color={boundaryData.colour || '#000000'} />
                                {boundaryData.colour || 'Not set'}
                            </p>
                        </div>
                    </div>

                    {/* Display debug information in development mode */}
                    {process.env.NODE_ENV !== 'production' && (
                        <details className="mt-4 border-t pt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer">Debug Information</summary>
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                                <pre>{JSON.stringify(boundaryData, null, 2)}</pre>
                            </div>
                        </details>
                    )}
                </>
        }
    }

    return (
        <div className="bg-white border border-[#E2E2E2] rounded-2xl w-[500px] p-6">
            <div className="flex flex-col gap-6">
                <header className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">
                        {mode === 'add' ? 'Create Process Boundary' : 
                         mode === 'edit' ? 'Edit Process Boundary' : 
                         mode === 'delete' ? 'Delete Process Boundary' : 
                         'Process Boundary Details'}
                    </h4>
                    <CloseButton onClose={onRemoveModal} />
                </header>
                {content}
            </div>
        </div>
    );
} 