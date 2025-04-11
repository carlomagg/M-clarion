import { useEffect, useState } from "react";
import SelectDropdown from "../../../../dropdowns/SelectDropdown/SelectDropdown";
import { Field } from "../../../../Elements/Elements";
import { FormCancelButton, FormProceedButton } from "../../../../buttons/FormButtons/FormButtons";
import { StatusChip } from "./Elements";
import { useUpdateRiskApprovalStatus } from "../../../../../../queries/risks/risk-queries";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../../hooks/useDispatchMessage";

export default function ApprovalContent({canApproveRisk = false, currentStatus, approvalStatuses, users}) {
    const [showForm, setShowForm] = useState(false);
    const history = [
        {date: '12/02/2024', time: '12:03', status: 'On Hold', comment: 'Lorem ipsum dolor sit amet', actionBy: "Ibrahim"},
        {date: '12/02/2024', time: '12:03', status: 'Forwareded', comment: 'Lorem ipsum dolor sit amet', actionBy: "Ibrahim"},
        {date: '12/02/2024', time: '12:03', status: 'Forwareded', comment: 'Lorem ipsum dolor sit amet', actionBy: "Ibrahim"}
    ];
    console.log(currentStatus)
    return (
        <div className='flex flex-col gap-6'>
            {
                showForm ?
                <ApprovalForm onRemoveForm={() => setShowForm(false)} currentStatus={currentStatus} statuses={approvalStatuses} users={users} /> :
                <div className="flex gap-6">
                    <p>Current Status: <StatusChip color={'#2F2F2F'} text={currentStatus?.status} /></p>
                    {
                        canApproveRisk &&
                        <button type="button" onClick={() => setShowForm(true)} className="text-sm font-medium text-text-pink">
                            Change Status
                        </button>
                    }
                </div>
            }
            <div className="flex flex-col gap-3">
                <h4 className="font-medium text-lg">Approval History</h4>
                <ApprovalHistoryTable history={history} />
            </div>
        </div>
    );
}

function ApprovalForm({onRemoveForm, currentStatus, statuses, users}) {
    const {id: riskID} = useParams();
    const [isDropdownCollapsed, setIsDropdownCollapsed] = useState(true);
    const [showUsersDropdown, setShowUsersDropdown] = useState(false);
    const [formData, setFormData] = useState({
        status_id: currentStatus?.id || '',
        approval_note: '',
    });

    useEffect(() => {
        if (formData.status_id == 2) setShowUsersDropdown(true);
        else setShowUsersDropdown(false);
    }, [formData.status_id]);


    // mutations
    const {isPending, mutate: updateApprovalStatus} = useUpdateRiskApprovalStatus(riskID, {onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = 'Updating Risk Approval Status';
        (isPending) && dispatchMessage('processing', text);
    }, [isPending]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', riskID]});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // remove form if successful
        if (!error) {
            onRemoveForm();
        }
    }

    function handleChange(e) {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    const approvalStatusActionMap = {
        'FORWARDED': 'Forward',
        'COMPLETED': 'Approve',
        'REJECTED': 'Reject',
        'ON HOLD': 'Keep Pending'
    };

    const sortedStatuses = statuses
    .filter(status => !!approvalStatusActionMap[status.status])
    .map(status => ({id: status.id, text: approvalStatusActionMap[status.status]}))
    .sort((a, b) => a.text < b.text ? -1 : 1);

    return (
        <form className='flex flex-col gap-6'>
            <div className='w-1/3 self-start'>
                <SelectDropdown {...{items: sortedStatuses, name: 'status_id', label: 'Status', placeholder: 'Select status', selected: formData.status_id, onSelect: handleChange, isCollapsed: isDropdownCollapsed, onToggleCollpase: setIsDropdownCollapsed}} />
            </div>
            {
                showUsersDropdown &&
                <UsersDropdown users={users} selected={formData.user_id} onChange={handleChange} />
            }
            <Field {...{name: 'approval_note', label: 'Comment', value: formData.approval_note, onChange: handleChange, placeholder: 'Enter comment'}} />
            <div className='flex gap-3 w-1/3'>
                <FormCancelButton onClick={onRemoveForm} text={'Discard'} />
                <FormProceedButton text={'Save'} onClick={() => updateApprovalStatus({data: formData})} />
            </div>
        </form>
    );
}

function UsersDropdown({users, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [filterTerm, setFilterTerm] = useState('');

    const filteredUsers = users.filter(o => new RegExp(filterTerm, 'i').test(o.text));

    return (
        <SelectDropdown label={'Forward To'} placeholder={'Select User'} items={filteredUsers} name={'user_id'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} filterable={true} filterTerm={filterTerm} setFilterTerm={setFilterTerm} />
    );
}

export function ApprovalHistoryTable({history}) {
    
    return (
        <div className='mt-3 overflow-auto p-6 flex flex-col gap-6 rounded-lg border border-[#CCC] text-[#3B3B3B] text-sm'>
            <div className="w-[1024px]">
                <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                    <span className='py-4 flex-[1_0]'>Date</span>
                    <span className='py-4 flex-[1_0]'>Time</span>
                    <span className='py-4 flex-[1_0]'>Status</span>
                    <span className='py-4 flex-[3_0]'>Comment</span>
                    <span className='py-4 flex-[1_0]'>Action By</span>
                </header>
                <ul className='flex flex-col'>
                    {
                        history.map((record, i) => {
                            return (
                                <li key={i} className='px-4 flex gap-4 items-center'>
                                    <span className='py-4 flex-[1_0]'>{record.date}</span>
                                    <span className='py-4 flex-[1_0]'>{record.time}</span>
                                    <span className='py-4 flex-[1_0]'>{record.status}</span>
                                    <span className='py-4 flex-[3_0]'>{record.comment}</span>
                                    <span className='py-4 flex-[1_0]'>{record.actionBy}</span>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        </div>
    );
}