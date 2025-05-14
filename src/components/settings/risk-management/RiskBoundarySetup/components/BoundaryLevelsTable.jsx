import { useEffect, useState } from "react";
import OptionsDropdown from "../../../../partials/dropdowns/OptionsDropdown/OptionsDropdown";
import { createPortal } from "react-dom";
import Modal from "../../components/Modal";
import { ColorChip } from "./Elements";
import { useDeleteRiskBoundary } from "../../../../../queries/risks/risk-boundaries";
import { useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";
import useConfirmedAction from "../../../../../hooks/useConfirmedAction";

export default function BoundaryLevelsTable({items, checkOverlap }) {
    const [showModal, setShowModal] = useState(false);
    const {confirmAction, confirmationDialog} = useConfirmedAction();

    // mutations
    const {isPending, mutate: deleteBoundary} = useDeleteRiskBoundary({onSuccess, onError});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = 'Deleting Risk Boundary';
        (isPending) && dispatchMessage('processing', text);
    }, [isPending]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', 'boundaries']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }

    function createRecordOptions(record) {
        console.log('Creating options for record:', record);
        
        // Make sure we're passing a complete record to the edit modal
        const handleEdit = () => {
            console.log('Edit button clicked for record:', record);
            // Ensure the record has the necessary fields before opening the edit modal
            if (!record.id) {
                console.error('Record is missing ID, cannot edit');
                dispatchMessage('failed', 'Cannot edit this record - missing ID');
                return;
            }
            
            setShowModal({
                context: {
                    mode: 'edit', 
                    id: record.id,
                    checkOverlap,
                    // Optionally pre-populate with existing data to ensure it's available
                    record: record
                }
            });
        };

        // Handler for view action that passes the full record
        const handleView = () => {
            console.log('View button clicked for record:', record);
            if (!record.id) {
                console.error('Record is missing ID, cannot view');
                dispatchMessage('failed', 'Cannot view this record - missing ID');
                return;
            }
            
            setShowModal({
                context: {
                    mode: 'view', 
                    id: record.id,
                    // Include the record data for view mode
                    record: record
                }
            });
        };
        
        const options = [
            {text: 'View', type: 'action', action: handleView},
            {text: 'Edit', type: 'action', action: handleEdit},
            {text: 'Delete', type: 'action', action: () => confirmAction(() => deleteBoundary({id: record.id}))},
            {text: 'History', type: 'action', action: () => {}},
        ];
        return options;
    }

    return (
        <div className="">
            {confirmationDialog}
            {
                showModal &&
                createPortal(
                    <Modal
                        type={'riskBoundary'}
                        context={showModal.context}
                        onRemove={() => setShowModal(false)} />,
                    document.body
                )
            }
            <div className='w-full'>
                <div className=' rounded-lg text-[#3B3B3B] text-sm'>
                    <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                        <span className='py-4 flex-[.5_0]'>#</span>
                        <span className='py-4 flex-[2_0]'>Description</span>
                        <span className='py-4 flex-[1_0] text-center'>Lower Bound</span>
                        <span className='py-4 flex-[1_0] text-center'>Higher Bound</span>
                        <span className='py-4 flex-[1_0]'>Color</span>
                        <span className='py-4 flex-[.5_0]'></span>
                    </header>
                    <ul className='flex flex-col'>
                        {
                            items.map((item, i) => {
                                return (
                                    <li key={i}>
                                        <TableRecord record={{...item, sn: i+1}} options={createRecordOptions(item)} />
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>
    );
}

function TableRecord({record, options}) {
    // Add logging to debug the record data
    console.log('TableRecord received record:', record);
    
    // Handle various field naming conventions
    const colorValue = record.color || record.colour || 'black';
    const lowerBound = record.lower_bound ?? record.lowerBound ?? record.lower ?? 'N/A';
    const higherBound = record.higher_bound ?? record.higherBound ?? record.higher ?? 'N/A';
    const description = record.description || 'No description';
    
    return (
        <div className='px-4 flex items-center gap-4'>
            <span className='py-2 flex-[.5_0]'>{record.sn}</span>
            <span className='py-2 flex-[2_0]'>{description}</span>
            <span className='py-2 flex-[1_0] text-center'>{lowerBound}</span>
            <span className='py-2 flex-[1_0] text-center'>{higherBound}</span>
            <span className='py-2 flex-[1_0]'>
                <span className="flex items-center gap-2">
                    <ColorChip color={colorValue} />
                    {colorValue}
                </span>
            </span>
            <span className='py-2 flex-[.5_0]'>
                <OptionsDropdown options={options} />
            </span>
        </div>
    );
}