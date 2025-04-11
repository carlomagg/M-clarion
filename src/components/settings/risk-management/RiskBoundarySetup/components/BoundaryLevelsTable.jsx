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
        const options = [
            {text: 'View', type: 'action', action: () => setShowModal({context: {mode: 'view', id: record.id}})},
            {text: 'Edit', type: 'action', action: () => setShowModal({context: {mode: 'edit', id: record.id, checkOverlap}})},
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
    return (
        <div className='px-4 flex items-center gap-4'>
            <span className='py-2 flex-[.5_0]'>{record['sn']}</span>
            <span className='py-2 flex-[2_0]'>{record['description']}</span>
            <span className='py-2 flex-[1_0] text-center'>{record['lower_bound']}</span>
            <span className='py-2 flex-[1_0] text-center'>{record['higher_bound']}</span>
            <span className='py-2 flex-[1_0]'>
                <span className="flex items-center gap-2">
                    <ColorChip color={record['colour']} />
                    {record['colour']}
                </span>
            </span>
            <span className='py-2 flex-[.5_0]'>
                <OptionsDropdown options={options} />
            </span>
        </div>
    );
}