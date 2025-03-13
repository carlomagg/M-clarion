import { useEffect, useState } from "react";
import OptionsDropdown from "../../../../partials/dropdowns/OptionsDropdown/OptionsDropdown";
import { createPortal } from "react-dom";
import Modal from "../../components/Modal";
import { useDeleteRiskAppetite } from "../../../../../queries/risks/risk-appetites";
import { useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";
import useConfirmedAction from "../../../../../hooks/useConfirmedAction";

export default function AppetitesTable({items}) {
    const [showModal, setShowModal] = useState(false);
    const {confirmAction, confirmationDialog} = useConfirmedAction();

     // mutations
     const {isPending, mutate: deleteAppetite} = useDeleteRiskAppetite({onSuccess, onError});

     const queryClient = useQueryClient();
     const dispatchMessage = useDispatchMessage();
     useEffect(() => {
         let text = 'Deleting Risk Appetite';
         (isPending) && dispatchMessage('processing', text);
     }, [isPending]);
 
     async function onSuccess(data) {
         await queryClient.invalidateQueries({queryKey: ['risks', 'appetites']});
         dispatchMessage('success', data.message);
     }
     function onError(error) {
         dispatchMessage('failed', error.response.data.message);
     }

    function createRecordOptions(record) {
        const options = [
            {text: 'View details', type: 'action', action: () => setShowModal({context: {mode: 'view', id: record.risk_appetite_id}})},
            {text: 'Edit', type: 'action', action: () => setShowModal({context: {mode: 'edit', id: record.risk_appetite_id}})},
            {text: 'Delete', type: 'action', action: () => confirmAction(() => deleteAppetite({id: record.risk_appetite_id}))},
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
                        type={'riskAppetite'}
                        context={showModal.context}
                        onRemove={() => setShowModal(false)}
                    />,
                    document.body
                )
            }
            <div className='w-full'>
                <div className=' rounded-lg text-[#3B3B3B] text-sm'>
                    <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                        <span className='py-4 flex-[2_0]'>Category</span>
                        <span className='py-4 flex-[1_0] text-center'>Boundary</span>
                        <span className='py-4 flex-[1_0] text-center'>Acceptable Level</span>
                        <span className='py-4 flex-[1_0] text-center'>Trigger</span>
                        <span className='py-4 flex-[1_0] text-center'>Applicable Year</span>
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
            <span className='py-2 flex-[2_0]'>{record['category'].name}</span>
            <span className='py-2 flex-[1_0] text-center'>{record['boundary'].description}</span>
            <span className='py-2 flex-[1_0] text-center'>{record['acceptable_level']}</span>
            <span className='py-2 flex-[1_0] text-center'>{record['trigger']}</span>
            <span className='py-2 flex-[1_0] text-center'>{record['applicable_year']}</span>
            <span className='py-2 flex-[.5_0]'>
                <OptionsDropdown options={options} />
            </span>
        </div>
    );
}