import { useEffect, useState } from "react";
import { FormCancelButton, FormProceedButton } from "../../../../partials/buttons/FormButtons/FormButtons";
import { Field } from "../../../../partials/Elements/Elements";
import { CloseButton } from "../../components/Buttons";
import { ColorChip } from "./Elements";
import { riskBoundaryOptions, useAddRiskBoundary, useUpdateRiskBoundary } from "../../../../../queries/risks/risk-boundaries";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";

export default function RiskBoundaryDialog({context, onRemoveModal}) {
    const [isOverlapping, setIsOverLapping] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        lower_bound: '',
        higher_bound: '',
        color: 'black',
        other_applications: 'partial'
    });
    const [dataLoaded, setDataLoaded] = useState(false);

    const {mode, checkOverlap, id: boundaryId = null, record = null} = context;
    console.log(`RiskBoundaryDialog initialized with mode: ${mode}, id: ${boundaryId}, record:`, record);

    // queries
    const [boundaryQuery] = useQueries({
        queries: [riskBoundaryOptions(boundaryId, {
            enabled: !!boundaryId && mode === 'edit' && !record, // Only fetch if record not provided
            staleTime: 0,
            cacheTime: 0,
            refetchOnMount: true,
            refetchOnWindowFocus: false,
            retry: 3,
            onSuccess: (data) => {
                console.log('Successfully fetched boundary data:', data);
            },
            onError: (error) => {
                console.error('Error fetching boundary data:', error);
                dispatchMessage('failed', 'Failed to load boundary data for editing');
            }
        })]
    });

    // Important: Initialize dispatchMessage before it's used
    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();

    // Initialize form data from record if provided
    useEffect(() => {
        if (mode === 'edit' && record) {
            console.log('Using provided record data to populate form:', record);
            
            try {
                // Extract data using various possible field names
                const description = record.description;
                const lowerBound = record.lower_bound ?? record.lowerBound ?? record.lower;
                const higherBound = record.higher_bound ?? record.higherBound ?? record.higher;
                const color = record.color ?? record.colour ?? 'black';
                const otherApps = record.other_applications ?? record.otherApplications ?? 'partial';
                
                const updatedData = {
                    description: description || '',
                    lower_bound: lowerBound !== undefined ? String(lowerBound) : '',
                    higher_bound: higherBound !== undefined ? String(higherBound) : '',
                    color: color || 'black',
                    other_applications: otherApps || 'partial'
                };
                
                setFormData(updatedData);
                setDataLoaded(true);
                console.log('Form data populated from record:', updatedData);
            } catch (error) {
                console.error('Error processing record data:', error);
                dispatchMessage('failed', 'Error processing record data');
            }
        }
    }, [mode, record, dispatchMessage]);

    // Debug the query state
    useEffect(() => {
        if (mode === 'edit' && boundaryId && !record) {
            console.log('Query state:', {
                isLoading: boundaryQuery.isLoading,
                isError: boundaryQuery.isError,
                error: boundaryQuery.error,
                isFetching: boundaryQuery.isFetching,
                status: boundaryQuery.status,
                dataExists: !!boundaryQuery.data
            });
            
            // Force a refetch if needed
            if (!boundaryQuery.data && !boundaryQuery.isLoading && !boundaryQuery.isFetching) {
                console.log('Manually refetching boundary data...');
                boundaryQuery.refetch();
            }
        }
    }, [mode, boundaryId, boundaryQuery, record]);

    // populate formdata from API query when in edit mode (backup approach)
    useEffect(() => {
        // Only update form data when in edit mode, we have data from query, and no record was provided
        if (mode === 'edit' && boundaryQuery.data && !dataLoaded) {
            try {
                const boundary = boundaryQuery.data || {};
                console.log('Raw data from API for edit:', boundary);
                
                if (!boundary || Object.keys(boundary).length === 0) {
                    console.error('Boundary data is empty or invalid');
                    dispatchMessage('failed', 'Failed to load boundary data for editing');
                    return;
                }
                
                // Extract data using various possible field names
                const description = boundary.description;
                const lowerBound = boundary.lower_bound ?? boundary.lowerBound ?? boundary.lower;
                const higherBound = boundary.higher_bound ?? boundary.higherBound ?? boundary.higher;
                const color = boundary.color ?? boundary.colour ?? 'black';
                const otherApps = boundary.other_applications ?? boundary.otherApplications ?? 'partial';
                
                console.log('Extracted field values:', {
                    description,
                    lowerBound,
                    higherBound,
                    color,
                    otherApps
                });
                
                const updatedData = {
                    description: description || '',
                    lower_bound: lowerBound !== undefined ? String(lowerBound) : '',
                    higher_bound: higherBound !== undefined ? String(higherBound) : '',
                    color: color || 'black',
                    other_applications: otherApps || 'partial'
                };
                
                // Update form data and mark as loaded
                setFormData(updatedData);
                setDataLoaded(true);
                
                console.log('Form data being set for edit mode:', updatedData);
            } catch (error) {
                console.error('Error processing boundary data:', error);
                dispatchMessage('failed', 'Error processing boundary data');
            }
        }
    }, [mode, boundaryQuery.data, dispatchMessage, dataLoaded]);

    // Log form data after state update
    useEffect(() => {
        if (dataLoaded) {
            console.log('Updated form data after state change:', formData);
        }
    }, [formData, dataLoaded]);

    // mutations
    const {isPending: isAddingBoundary, mutate: addBoundary} = useAddRiskBoundary({onSuccess, onError, onSettled});
    const {isPending: isUpdatingBoundary, mutate: updateBoundary} = useUpdateRiskBoundary({onSuccess, onError, onSettled});

    useEffect(() => {
        let text = isAddingBoundary ? 'Adding new risk boundary...' : 'Updating risk boundary...';
        (isAddingBoundary || isUpdatingBoundary) && dispatchMessage('processing', text);
    }, [isAddingBoundary, isUpdatingBoundary, dispatchMessage]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', 'boundaries']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response?.data?.message || 'An error occurred');
    }
    function onSettled(data, error) {
        if (!error) {
            onRemoveModal();
        }
    }

    function handleChange(e) {
        setIsOverLapping(false);
        
        // Special handling for color field
        if (e.target.name === 'color') {
            // For dropdown selection
            if (e.target.type === 'select-one') {
                setFormData({...formData, color: e.target.value});
            } 
            // For color picker
            else {
                setFormData({...formData, color: e.target.value});
            }
        } else {
            setFormData({...formData, [e.target.name]: e.target.value});
        }
    }

    // Convert a color name to hexadecimal if needed
    function getColorValue(colorName) {
        // If it's already a hex value, return it
        if (colorName && colorName.startsWith('#')) {
            return colorName;
        }
        
        try {
            // Create a temporary element to convert color names to hex
            const tempElem = document.createElement('div');
            tempElem.style.color = colorName || 'black';
            document.body.appendChild(tempElem);
            const computedColor = getComputedStyle(tempElem).color;
            document.body.removeChild(tempElem);
            
            // Parse RGB format and convert to hex
            const rgbMatch = computedColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (rgbMatch) {
                const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
                const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
                const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
                return `#${r}${g}${b}`;
            }
        } catch (error) {
            console.error('Error converting color:', error);
        }
        
        return colorName || '#000000';
    }

    function handleSave() {
        if (checkOverlap(Number(formData.lower_bound), Number(formData.higher_bound), boundaryId)) {
            setIsOverLapping(true);
            return;
        }
        
        // Format data exactly like the sample payload
        const dataForApi = {
            description: formData.description,
            lower_bound: parseInt(formData.lower_bound) || 0,
            higher_bound: parseInt(formData.higher_bound) || 0,
            color: formData.color,
            other_applications: formData.other_applications
        };
        
        console.log(`Saving boundary with data:`, dataForApi);
        
        if (mode === 'add') {
            addBoundary({data: dataForApi});
        } else if (mode === 'edit') {
            updateBoundary({id: boundaryId, data: dataForApi});
        }
    }

    let content;
    
    const isLoading = boundaryQuery.isLoading;
    const error = boundaryQuery.error;

    if (isLoading) content = <div>Loading risk boundary data...</div>
    else if (error) content = <div>Error loading risk boundary: {error.message}</div>
    else {
        const boundary = (mode === 'view' && boundaryQuery.data) || {};

        if (mode === 'view' && Object.keys(boundary).length === 0) {
            content = <div>No data found for this risk boundary. It may have been deleted or is not accessible.</div>;
        } else {
            content = mode === 'edit' || mode === 'add' ?
                <>
                    <div className="flex flex-col gap-3">
                        {
                            isOverlapping &&
                            <div className="text-sm text-red-500">Selected boundary overlaps with existing boundary.</div>
                        }
                        <Field {...{name: 'description', label: 'Description', placeholder: 'Enter name of boundary', value: formData.description, onChange: handleChange}} />
                        <div className="flex gap-6">
                            <Field {...{type: 'number', name: 'lower_bound', label: 'Lower Bound', value: formData.lower_bound, onChange: handleChange}} />
                            <Field {...{type: 'number', name: 'higher_bound', label: 'Higher Bound', value: formData.higher_bound, onChange: handleChange}} />
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Color</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="color" 
                                        name="color" 
                                        value={getColorValue(formData.color)} 
                                        onChange={handleChange}
                                        className="border border-[#E2E2E2] rounded-md h-10"
                                    />
                                    <select 
                                        name="color" 
                                        className="border border-[#E2E2E2] rounded-md p-2" 
                                        value={formData.color} 
                                        onChange={handleChange}
                                    >
                                        <option value="black">Black</option>
                                        <option value="red">Red</option>
                                        <option value="green">Green</option>
                                        <option value="blue">Blue</option>
                                        <option value="yellow">Yellow</option>
                                        <option value="orange">Orange</option>
                                        <option value="purple">Purple</option>
                                        <option value="pink">Pink</option>
                                        <option value="gray">Gray</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-sm font-medium">Other Applications</label>
                                <select 
                                    name="other_applications" 
                                    className="border border-[#E2E2E2] rounded-md p-2" 
                                    value={formData.other_applications} 
                                    onChange={handleChange}
                                >
                                    <option value="partial">Partial</option>
                                    <option value="full">Full</option>
                                    <option value="none">None</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-6 mt-2">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">Color Preview</label>
                                <div className="flex items-center gap-2">
                                    <span style={{
                                        backgroundColor: formData.color, 
                                        width: '20px', 
                                        height: '20px', 
                                        display: 'inline-block',
                                        borderRadius: '4px',
                                        border: '1px solid #E2E2E2'
                                    }}></span>
                                    <span>{formData.color}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex gap-6">
                        <FormCancelButton text={'Discard'} onClick={onRemoveModal} />
                        <FormProceedButton disabled={isAddingBoundary || isUpdatingBoundary} text={'Save'} onClick={handleSave} />
                    </div>
                </> :
                <>
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Description</span>
                        <p>{boundary.description || 'No description'}</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex flex-col gap-3">
                            <span className="font-medium">Lower Bound</span>
                            <p>{boundary.lower_bound ?? 'Not set'}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="font-medium">Higher Bound</span>
                            <p>{boundary.higher_bound ?? 'Not set'}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="font-medium">Color</span>
                            <p className="flex gap-2 items-center">
                                <span style={{
                                    backgroundColor: boundary.color || boundary.colour || '#000000', 
                                    width: '20px', 
                                    height: '20px', 
                                    display: 'inline-block',
                                    borderRadius: '4px',
                                    border: '1px solid #E2E2E2'
                                }}></span>
                                {boundary.color || boundary.colour || 'Not set'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Other Applications</span>
                        <p>{boundary.other_applications || 'Not set'}</p>
                    </div>
                </>
        }
    }

    return (
        <div className="bg-white border border-[#E2E2E2] rounded-2xl w-[500px] p-6">
            <div className="flex flex-col gap-6">
                <header className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">Risk Boundary</h4>
                    <CloseButton onClose={onRemoveModal} />
                </header>
                {content}
            </div>
        </div>
    );
}