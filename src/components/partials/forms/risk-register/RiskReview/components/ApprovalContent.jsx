import { useEffect, useState } from "react";
import SelectDropdown from "../../../../dropdowns/SelectDropdown/SelectDropdown";
import { Field } from "../../../../Elements/Elements";
import { FormCancelButton, FormProceedButton } from "../../../../buttons/FormButtons/FormButtons";
import { StatusChip } from "./Elements";
import { useUpdateRiskApprovalStatus } from "../../../../../../queries/risks/risk-queries";
import { useLocation, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../../hooks/useDispatchMessage";
import axios from "axios";

export default function ApprovalContent({canApproveRisk = false, currentStatus, approvalStatuses, users}) {
    const [showForm, setShowForm] = useState(false);
    const { id: riskID } = useParams();
    const location = useLocation();
    const queryClient = useQueryClient();
    
    // Log for debugging
    console.log('ApprovalContent - currentStatus:', currentStatus);
    
    // Validate and set safe defaults if status data is missing
    const safeCurrentStatus = currentStatus || { status: 'Unknown', id: '' };
    
    // Check if we came from the approval queue with a request to refresh
    useEffect(() => {
        if (location.state?.forceRefresh && location.state?.fromApprovalQueue) {
            // Force refresh of approval history data
            queryClient.invalidateQueries(['approval-history', riskID]);
            console.log('Forced refresh of approval history from approval queue');
        }
    }, [location.state, riskID, queryClient]);
    
    // Fetch approval history
    const { data: historyData, isLoading, refetch, dataUpdatedAt } = useQuery({
        queryKey: ['approval-history', riskID],
        queryFn: async () => {
            try {
                const url = `risk/risk/${riskID}/approval-history/`;
                // Add a cache-busting parameter to avoid getting cached results
                const response = await axios.get(`${url}?_=${Date.now()}`);
                console.log('Approval history response:', response);
                
                // Process the response data
                let history = response.data;
                
                // Check if it's an array or needs extraction
                if (!Array.isArray(history)) {
                    // Try to find the array in the response
                    for (const key in history) {
                        if (Array.isArray(history[key])) {
                            history = history[key];
                            break;
                        }
                    }
                    
                    // If still not an array, wrap it
                    if (!Array.isArray(history)) {
                        history = [history];
                    }
                }
                
                // Process and normalize the data
                return history.map(record => ({
                    date: record.date || '',
                    time: record.time || '',
                    status: record.status || 'COMPLETED',
                    comment: record.risk_approval_note || '',
                    actionBy: record.action_by || ''
                }));
            } catch (error) {
                console.error('Error fetching approval history:', error);
                // Return empty array if error occurs
                return [];
            }
        },
        refetchOnWindowFocus: true,
        staleTime: 0,
        cacheTime: 30000,
        refetchInterval: 10000  // Refresh every 10 seconds
    });
    
    // Auto-refresh when form is submitted
    useEffect(() => {
        if (!showForm) {
            refetch();
        }
    }, [showForm, refetch]);
    
    // Format last updated time
    const getLastUpdatedText = () => {
        if (!dataUpdatedAt) return '';
        
        const date = new Date(dataUpdatedAt);
        const now = new Date();
        
        // If within last minute, show "Just now"
        const diffMs = now - date;
        if (diffMs < 60000) {
            return 'Updated just now';
        }
        
        // If within the hour, show minutes ago
        if (diffMs < 3600000) {
            const minutes = Math.floor(diffMs / 60000);
            return `Updated ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        }
        
        // Otherwise show full time
        return `Last updated: ${date.toLocaleTimeString()}`;
    };
    
    // Sort history with most recent first
    const sortedHistory = [...(historyData || [])].sort((a, b) => {
        // Extract date parts
        const dateA = a.date ? a.date.split('-').reverse().join('-') : '';
        const dateB = b.date ? b.date.split('-').reverse().join('-') : '';
        
        // Try to create proper date objects
        const fullDateA = dateA ? `${dateA} ${a.time || '00:00'}` : '';
        const fullDateB = dateB ? `${dateB} ${b.time || '00:00'}` : '';
        
        // Compare dates (most recent first)
        return fullDateB.localeCompare(fullDateA);
    });

    return (
        <div className='flex flex-col gap-6'>
            {
                showForm ?
                <ApprovalForm onRemoveForm={() => setShowForm(false)} currentStatus={safeCurrentStatus} statuses={approvalStatuses || []} users={users || []} /> :
                <div className="flex gap-6">
                    <p>Current Status: <StatusChip color={'#2F2F2F'} text={safeCurrentStatus?.status || 'Unknown'} /></p>
                    {
                        canApproveRisk &&
                        <button type="button" onClick={() => setShowForm(true)} className="text-sm font-medium text-text-pink">
                            Change Status
                        </button>
                    }
                </div>
            }
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium text-lg">Approval History</h4>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{getLastUpdatedText()}</span>
                        <button 
                            onClick={() => refetch()}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>
                {isLoading ? (
                    <div className="text-center py-4">Loading history...</div>
                ) : (
                    <ApprovalHistoryTable history={sortedHistory} />
                )}
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

    // Log for debugging
    console.log('ApprovalForm - currentStatus:', currentStatus);
    console.log('ApprovalForm - formData:', formData);
    console.log('ApprovalForm - available statuses:', statuses);

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
    if (!history || history.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No approval history available for this risk.</p>
            </div>
        );
    }
    
    return (
        <div className='mt-3 overflow-auto p-6 flex flex-col gap-6 rounded-lg border border-[#CCC] text-[#3B3B3B] text-sm'>
            <div className="w-full lg:w-[1024px]">
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
                                <li key={i} className={`px-4 flex gap-4 items-center ${i === 0 ? 'bg-blue-50' : ''}`}>
                                    <span className='py-4 flex-[1_0]'>
                                        {record.date}
                                        {i === 0 && <span className="ml-1 text-xs text-blue-600">(Latest)</span>}
                                    </span>
                                    <span className='py-4 flex-[1_0]'>{record.time}</span>
                                    <span className='py-4 flex-[1_0]'>
                                        <StatusChip 
                                            color={
                                                record.status === 'COMPLETED' ? '#22c55e' :
                                                record.status === 'REJECTED' ? '#ef4444' :
                                                record.status === 'FORWARDED' ? '#3b82f6' :
                                                record.status === 'ON HOLD' ? '#eab308' : '#2F2F2F'
                                            } 
                                            text={record.status} 
                                        />
                                    </span>
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