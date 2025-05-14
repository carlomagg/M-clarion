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

    // Important: Initialize dispatchMessage before it's used
    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();

    // queries - Enable for view mode too if record not provided
    const [boundaryQuery] = useQueries({
        queries: [
            {
                ...riskBoundaryOptions(boundaryId),
                enabled: mode === 'edit' && boundaryId !== null && !record,
            }
        ]
    });

    // Handle view mode with record provided
    useEffect(() => {
        if (mode === 'view' && record && !dataLoaded) {
            console.log('View mode with record provided:', record);
            
            try {
                // For view mode, we just need the record data normalized for display
                // Extract the color value from the record (support both spellings)
                const color = record.color ?? record.colour ?? 'black';
                console.log(`View mode color value: ${color}`);
                
                // No need to set form data here as view mode doesn't use editable form
                setDataLoaded(true);
            } catch (error) {
                console.error('Error processing view mode record:', error);
            }
        }
    }, [mode, record, dataLoaded]);

    // Initialize form data for edit mode
    useEffect(() => {
        // First, handle record data if provided (for quick editing without additional API call)
        if (mode === 'edit' && record && !dataLoaded) {
            try {
                console.log('Edit mode with record provided:', record);
                // Extract the color value from the record (support both spellings)
                const color = record.color ?? record.colour ?? 'black';
                
                const formattedData = {
                    description: record.description || '',
                    lower_bound: String(record.lower_bound ?? record.lowerBound ?? ''),
                    higher_bound: String(record.higher_bound ?? record.higherBound ?? ''),
                    color, // Use the extracted color value
                    other_applications: record.other_applications ?? record.otherApplications ?? 'partial'
                };
                
                setFormData(formattedData);
                setDataLoaded(true);
                console.log('Set form data from record for edit mode:', formattedData);
            } catch (error) {
                console.error('Error processing edit mode record:', error);
                dispatchMessage('failed', 'Error processing boundary data');
            }
        }
    }, [mode, record, dispatchMessage, dataLoaded]);

    // Handle data from API for edit mode
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
        // Special handling for color field
        if (e.target.name === 'color') {
            if (e.target.type === 'select-one') {
                // For dropdown selection
                setFormData({...formData, color: e.target.value});
            } else {
                // For color picker
                setFormData({...formData, color: e.target.value});
            }
        }
        // Standard handling for other fields
        else {
            setFormData({...formData, [e.target.name]: e.target.value});
        }
    }

    // Convert a color name to hexadecimal if needed
    function getColorValue(colorName) {
        try {
            if (colorName && colorName.startsWith('#')) {
                return colorName;
            }
            
            // Create a temporary element to convert color names to hex
            const tempElem = document.createElement('div');
            tempElem.style.color = colorName || 'black';
            document.body.appendChild(tempElem);
            
            const computedColor = getComputedStyle(tempElem).color;
            document.body.removeChild(tempElem);
            
            // Convert rgb format to hex
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
        
        // Format data for API - include both color and colour for maximum compatibility
        const dataForApi = {
            description: formData.description,
            lower_bound: parseInt(formData.lower_bound) || 0,
            higher_bound: parseInt(formData.higher_bound) || 0,
            color: formData.color,       // Include American spelling
            colour: formData.color,      // Include British spelling 
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
        // Get boundary data from either record or query
        let boundary;
        
        if (mode === 'view') {
            // In view mode, use record if available, otherwise use query data
            if (record) {
                console.log('Using provided record data for view mode:', record);
                boundary = record;
            } else if (boundaryQuery.data) {
                console.log('Using query data for view mode:', boundaryQuery.data);
                boundary = boundaryQuery.data;
            } else {
                console.warn('No data available for view mode');
                boundary = {};
            }
        } else {
            boundary = {};
        }

        // Log the boundary data being used
        console.log('Boundary data for rendering:', boundary);

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
                        </div>
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
                    <div className="flex justify-end gap-2">
                        <FormCancelButton text="Discard" onClick={onRemoveModal} />
                        <FormProceedButton 
                            disabled={isAddingBoundary || isUpdatingBoundary} 
                            text={isAddingBoundary || isUpdatingBoundary ? 'Saving...' : 'Save'} 
                            onClick={handleSave} 
                        />
                    </div>
                </> :
                <>
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-3">
                            <span className="font-medium">Description</span>
                            <p>{boundary?.description || 'No description'}</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex flex-col gap-3">
                            <span className="font-medium">Lower Bound</span>
                            <p>{boundary?.lower_bound ?? boundary?.lowerBound ?? 'Not set'}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="font-medium">Higher Bound</span>
                            <p>{boundary?.higher_bound ?? boundary?.higherBound ?? 'Not set'}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Color</span>
                        <p className="flex gap-2 items-center">
                            <span style={{
                                backgroundColor: boundary?.color || boundary?.colour || '#000000', 
                                width: '20px', 
                                height: '20px', 
                                display: 'inline-block',
                                borderRadius: '4px',
                                border: '1px solid #E2E2E2'
                            }}></span>
                            {boundary?.color || boundary?.colour || 'Not set'}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Other Applications</span>
                        <p>{boundary?.other_applications ?? boundary?.otherApplications ?? 'Not set'}</p>
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