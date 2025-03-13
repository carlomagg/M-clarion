import { useEffect, useState } from "react";
import OptionsDropdown from "../../../../partials/dropdowns/OptionsDropdown/OptionsDropdown";
import { createPortal } from "react-dom";
import Modal from "../../components/Modal";
import { useDeleteRiskClass } from "../../../../../queries/risks/risk-classes";
import { useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";
import { truncateString } from "../../../../../utils/helpers";
import useConfirmedAction from "../../../../../hooks/useConfirmedAction";

export default function ClassesTable({items}) {
    const [showModal, setShowModal] = useState(null);
    const {confirmAction, confirmationDialog} = useConfirmedAction();

    // mutations
    const {isPending, mutate: deleteClass} = useDeleteRiskClass({onSuccess, onError});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = 'Deleting Risk Class';
        (isPending) && dispatchMessage('processing', text);
    }, [isPending]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', 'classes']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }

    function createRecordOptions(record) {
        const options = [
            {text: 'View', type: 'action', action: () => setShowModal({context: {mode: 'view', id: record.class_id}})},
            {text: 'Edit', type: 'action', action: () => setShowModal({context: {mode: 'edit', id: record.class_id}})},
            {text: 'Delete', type: 'action', action: () => confirmAction(() => deleteClass({id: record.class_id}))},
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
                        type={'riskClass'}
                        context={showModal.context}
                        onRemove={() => setShowModal(false)}
                    />,
                    document.body
                )
            }
            <div className='w-full'>
                <div className=' rounded-lg text-[#3B3B3B] text-sm'>
                    <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                        <span className='py-4 flex-[1_0]'>Class</span>
                        <span className='py-4 flex-[3_0]'>Description</span>
                        <span className='py-4 flex-[1_0]'>Category</span>
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
            <span className='py-2 flex-[1_0]'>{record['class_name']}</span>
            <span className='py-2 flex-[3_0]'>{truncateString(record['class_description'])}</span>
            <span className='py-2 flex-[1_0]'>{record['category_name']}</span>
            <span className='py-2 flex-[.5_0]'>
                <OptionsDropdown options={options} />
            </span>
        </div>
    );
}