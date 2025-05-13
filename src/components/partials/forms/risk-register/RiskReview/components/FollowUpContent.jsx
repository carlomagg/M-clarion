import { useContext, useEffect, useState } from "react";
import SelectDropdown from "../../../../dropdowns/SelectDropdown/SelectDropdown";
import { Field } from "../../../../Elements/Elements";
import { FormCancelButton, FormProceedButton } from "../../../../buttons/FormButtons/FormButtons";
import plusIcon from '../../../../../../assets/icons/plus.svg';
import { SelectedItemsList } from "../../../../SelectedItemsList";
import OptionsDropdown from "../../../../dropdowns/OptionsDropdown/OptionsDropdown";
import { createPortal } from "react-dom";
import Modal from "./Modal";
import { CloseButton } from "./Elements";
import { riskFollowUpsOptions, riskLogOptions, useAddFollowUpResponse, useAddRiskFollowUp, useDeleteRiskFollowUp, useUpdateRiskFollowUp } from "../../../../../../queries/risks/risk-queries";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../../hooks/useDispatchMessage";
import { usersOptions } from "../../../../../../queries/users-queries";
import FollowUpContext from "../contexts/follow-up";

export default function FollowUpHistoryContent({followUps}) {
    console.log('FollowUpHistoryContent received followUps prop:', followUps);
    
    const {id: riskID} = useParams();
    const [showForm, setShowForm] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // Force a refresh of followUps data
    const queryClient = useQueryClient();
    
    // Listen for follow-up-updated events
    useEffect(() => {
        const handleFollowUpUpdated = (event) => {
            console.log('Follow-up-updated event received in FollowUpHistoryContent', event);
            // Check if this event is for the current risk ID
            if (event && event.detail && event.detail.riskID) {
                // Only refresh if this is for our risk ID or no risk ID is specified
                if (!event.detail.riskID || String(event.detail.riskID) === String(riskID)) {
                    console.log('Refreshing follow-ups for risk ID:', riskID);
                    setRefreshTrigger(prev => prev + 1);
                }
            } else {
                // If no detail is provided, refresh anyway
                setRefreshTrigger(prev => prev + 1);
            }
        };
        
        // Listen for the follow-up-updated custom event
        window.addEventListener('follow-up-updated', handleFollowUpUpdated);
        
        // Also listen for the follow-up-refresh event (for backward compatibility)
        document.addEventListener('follow-up-refresh', handleFollowUpUpdated);
        
        return () => {
            window.removeEventListener('follow-up-updated', handleFollowUpUpdated);
            document.removeEventListener('follow-up-refresh', handleFollowUpUpdated);
        };
    }, [riskID]);
    
    // Refresh follow-ups data whenever this component is mounted or refreshTrigger changes
    useEffect(() => {
        const refreshData = async () => {
            console.log("Manually refreshing follow-ups data");
            await queryClient.invalidateQueries({queryKey: ['risks', riskID, 'follow-ups']});
            await queryClient.refetchQueries({queryKey: ['risks', riskID, 'follow-ups'], force: true});
        };
        
        refreshData();
    }, [riskID, refreshTrigger, queryClient]);
    
    // mutations
    const {isPending, mutate: deleteFollowUp} = useDeleteRiskFollowUp({onSuccess, onError});
    
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = 'Deleting Risk Follow Up';
        (isPending) && dispatchMessage('processing', text);
    }, [isPending]);

    async function onSuccess(data) {
        console.log('Follow-up added/updated successfully:', data);
        await queryClient.invalidateQueries({queryKey: ['risks', riskID, 'follow-ups']});
        
        // Force an immediate refetch and log the result
        const result = await queryClient.refetchQueries({queryKey: ['risks', riskID, 'follow-ups'], force: true});
        console.log('Refetched follow-ups data:', result);
        
        // Trigger a refresh
        setRefreshTrigger(prev => prev + 1);
        
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }

    function createRecordOptions(record) {
        const options = [
            {text: 'View Details', type: 'action', action: () => setShowModal({context: {mode: 'view-response', followUp: record, riskId: riskID, setContext: (context) => setShowModal({context})}})},
            {text: 'Edit', type: 'action', action: () => setShowModal({context: {mode: 'edit', followUp: record, riskId: riskID, setContext: (context) => setShowModal({context})}})},
            {text: 'Delete', type: 'action', action: () => deleteFollowUp({id: record.id})},
        ];
        return options;
    }
    return (
        <div className='space-y-6'>
            {
                showModal &&
                createPortal(
                    <Modal type='followUp' context={showModal.context} onRemove={() => setShowModal(false)} />,
                    document.body
                )
            }
            {
                showForm ?
                <FollowUpForm mode={'add'} riskID={riskID} onRemoveForm={() => setShowForm(false)} /> :
                <button type="button" onClick={() => setShowForm(true)} className="text-sm font-medium text-text-pink flex gap-3 items-center">
                    <img src={plusIcon} alt="plus icon" />
                    Add Follow Up
                </button>
            }
            <FollowUpHistoryTable history={followUps} createRecordOptions={createRecordOptions} />
        </div>
    );
}

function FollowUpForm({mode, riskID, onRemoveForm, followUp = null, inModalView = false, removeModal = null}) {
    const [formData, setFormData] = useState({
        note: '',
        user_ids: [],
    });
    const [selectedUsers, setSelectedUsers] = useState([]);
    // Track if submission was successful to reset form
    const [wasSuccessful, setWasSuccessful] = useState(false);
    // Add a refresh trigger state to force re-rendering of follow-up history
    const [refreshFollowUps, setRefreshFollowUps] = useState(0);

    useEffect(() => {
        setFormData(() => ({
            ...formData,
            user_ids: selectedUsers.map(u => u.id)
        }));
    }, [selectedUsers]);

    useEffect(() => {
        if (mode === 'edit' && followUp) {
            setFormData((prev) => {
                return {
                    note: followUp['follow up note'],
                    user_ids: followUp['responder names'].map(u => u.id)
                };
            });
            setSelectedUsers(followUp['responder names']);
        }
    }, [mode, followUp]);

    // Reset form after successful submission
    useEffect(() => {
        if (wasSuccessful && mode === 'add') {
            setFormData({
                note: '',
                user_ids: [],
            });
            setSelectedUsers([]);
            setWasSuccessful(false);
        }
    }, [wasSuccessful, mode]);

    // users query
    const {isLoading, error, data: fetchedUsers} = useQuery(usersOptions());

    // mutations
    const {isPending: isAddingFollowUp, mutate: addRiskFollowUp} = useAddRiskFollowUp(riskID, {onSuccess, onError, onSettled});
    const {isPending: isUpdatingFollowUp, mutate: updateRiskFollowUp} = useUpdateRiskFollowUp({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingFollowUp ? 'Adding Risk Follow Up' : 'Updating Risk Follow Up';
        (isAddingFollowUp || isUpdatingFollowUp) && dispatchMessage('processing', text);
    }, [isAddingFollowUp, isUpdatingFollowUp]);

    async function onSuccess(data) {
        console.log('Follow-up added/updated successfully:', data);
        
        try {
            // Forcefully invalidate and refetch the follow-ups data
            await queryClient.invalidateQueries({queryKey: ['risks', riskID, 'follow-ups']});
            
            // Get current date and time for manual addition to the history
            const now = new Date();
            const date = now.toLocaleDateString();
            const time = now.toLocaleTimeString();
            
            // Force a refetch with specific options to ensure data is updated
            await queryClient.refetchQueries({
                queryKey: ['risks', riskID, 'follow-ups'],
                force: true,
                throwOnError: true
            });
            
            // If we're in dialog mode, directly add the new follow-up to the history
            if (inModalView) {
                // Get current user info
                const userData = await queryClient.fetchQuery({
                    queryKey: ['currentUser'],
                    queryFn: () => ({ name: 'Current User' }), // Replace with actual user fetch if available
                });
                
                // Create a new follow-up record manually to add to the UI immediately
                const newFollowUp = {
                    id: Date.now(), // Temporary ID
                    date,
                    time,
                    'follow up note': formData.note,
                    name: userData.name,
                    'responder names': selectedUsers
                };
                
                // Trigger a refresh of the parent component with the new data
                window.dispatchEvent(new CustomEvent('follow-up-added', { 
                    detail: { followUp: newFollowUp, riskID } 
                }));
                
                // For immediate refresh, also dispatch the follow-up-updated event
                window.dispatchEvent(new CustomEvent('follow-up-updated', { 
                    detail: { riskID } 
                }));
            }
            
            // Force parent components to refresh
            document.dispatchEvent(new Event('follow-up-refresh'));
            
            // Increment the refresh trigger to force re-rendering
            setRefreshFollowUps(prev => prev + 1);
            
            dispatchMessage('success', data.message);
            
            // Set flag to reset form
            if (mode === 'add') {
                setWasSuccessful(true);
            }
        } catch (err) {
            console.error('Error refreshing follow-ups data:', err);
            dispatchMessage('failed', 'Failed to refresh follow-ups list');
        }
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) {
            // Don't automatically close the form or modal on success
            // Allow user to close it manually
            // mode === 'add' && onRemoveForm();
            // mode === 'edit' && removeModal();
            
            // Instead of closing, trigger a refresh of the parent component with the updated data
            if (inModalView) {
                // Force a refresh of the parent component
                document.dispatchEvent(new Event('follow-up-refresh'));
                // Notify any listeners that a follow-up was added/updated
                window.dispatchEvent(new CustomEvent('follow-up-updated', { 
                    detail: { riskID } 
                }));
            }
        }
    }

    function handleSelectUser(user) {
        if (selectedUsers.some(u => u.id === user.id)) return;
        setSelectedUsers([...selectedUsers, user]);
    }

    function handleRemoveUser(user) {
        setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    }

    function handleSaveClicked() {
        // Show loading indicator
        dispatchMessage('processing', 'Adding risk follow-up...');
        if (mode === 'add') {
            addRiskFollowUp({data: formData});
            // Note: we don't call onRemoveForm() here to keep the form open
        }
        else if (mode === 'edit') {
            updateRiskFollowUp({id: followUp.id, data: {...formData, risk: riskID}});
            // Note: modal closing is handled in onSettled
        }
    }

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    const users = fetchedUsers.map(u => ({id: u.user_id, text: (!u.firstname || !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`}));

    const selectedUsersList = <SelectedItemsList list={selectedUsers} editable={true} onRemove={handleRemoveUser} />

    return (
        <form className='flex flex-col gap-6'>
            <div className={`${inModalView ? 'w-full' : 'w-1/3'} self-start`}>
                <UsersDropdown users={users} onSelect={handleSelectUser} selectedList={selectedUsersList} />
            </div>
            <Field {...{label: 'Comment', name: 'note', value: formData.note, onChange: (e) => setFormData({...formData, [e.target.name]: e.target.value}), placeholder: 'Enter follow up'}} />
            <div className='flex gap-3 w-1/3'>
                <FormCancelButton text={'Discard'} onClick={onRemoveForm} />
                <FormProceedButton text={'Save'} onClick={handleSaveClicked} />
            </div>
        </form>
    );
}

export function FollowUpDialog({onRemove}) {
    const context = useContext(FollowUpContext);
    const [data, setData] = useState({
        response: ''
    });
    // Track if response was successfully submitted
    const [responseSubmitted, setResponseSubmitted] = useState(false);
    // Add a refresh trigger state to force re-rendering of follow-up history
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    // Local state to store follow-ups data for immediate updates
    const [localFollowUps, setLocalFollowUps] = useState([]);

    const [riskID, setRiskID] = useState(context.riskId);
    const {mode, setContext, followUp = null} = context;

    // query
    const {isLoading, error, data: followUps, refetch} = useQuery(riskFollowUpsOptions(String(riskID), {
        enabled: mode !== 'view-response',
        refetchOnWindowFocus: true,
        // Force the query to refetch when refreshTrigger changes
        refetchInterval: refreshTrigger > 0 ? 0 : false,
    }));

    // Listen for follow-up-updated events
    useEffect(() => {
        const handleFollowUpUpdated = (event) => {
            console.log('Follow-up-updated event received in FollowUpDialog', event);
            // Check if this event is for the current risk ID
            if (event && event.detail && event.detail.riskID) {
                // Only refresh if this is for our risk ID or no risk ID is specified
                if (!event.detail.riskID || String(event.detail.riskID) === String(riskID)) {
                    console.log('Refreshing follow-ups for risk ID:', riskID);
                    setRefreshTrigger(prev => prev + 1);
                    // Force an immediate refetch
                    refetch();
                }
            } else {
                // If no detail is provided, refresh anyway
                setRefreshTrigger(prev => prev + 1);
                // Force an immediate refetch
                refetch();
            }
        };
        
        // Listen for the follow-up-updated custom event
        window.addEventListener('follow-up-updated', handleFollowUpUpdated);
        
        // Also listen for the follow-up-refresh event (for backward compatibility)
        document.addEventListener('follow-up-refresh', handleFollowUpUpdated);
        
        return () => {
            window.removeEventListener('follow-up-updated', handleFollowUpUpdated);
            document.removeEventListener('follow-up-refresh', handleFollowUpUpdated);
        };
    }, [refetch, riskID]);

    // mutations
    const {isPending: isAddingResponse, mutate: addResponse} = useAddFollowUpResponse({onSuccess, onError, onSettled});
    const {isPending: isDeletingFollowUp, mutate: deleteFollowUp} = useDeleteRiskFollowUp({onSuccess, onError});

    // Reset response field after successful submission
    useEffect(() => {
        if (responseSubmitted) {
            setData({response: ''});
            setResponseSubmitted(false);
        }
    }, [responseSubmitted]);

    // Force refetch when refreshTrigger changes
    useEffect(() => {
        if (refreshTrigger > 0) {
            refetch();
        }
    }, [refreshTrigger, refetch]);

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingResponse ? 'Adding follow-up response...' : 'Deleting risk follow-up...';
        (isAddingResponse || isDeletingFollowUp) && dispatchMessage('processing', text);
    }, [isAddingResponse, isDeletingFollowUp]);

    async function onSuccess(data) {
        console.log('Follow-up added/updated successfully:', data);
        
        // Forcefully invalidate the cache first
        await queryClient.invalidateQueries({queryKey: ['risks', String(riskID), 'follow-ups']});
        
        // Force a refetch with specific options to ensure data is updated
        const result = await queryClient.refetchQueries({
            queryKey: ['risks', String(riskID), 'follow-ups'], 
            force: true,
            throwOnError: true
        });
        console.log('Refetched follow-ups data:', result);
        
        // Increment the trigger to force a refetch
        setRefreshTrigger(prev => prev + 1);
        
        dispatchMessage('success', data.message);
        
        // Set flag to reset response field if we added a response
        if (isAddingResponse) {
            setResponseSubmitted(true);
        }
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) {
            // Don't automatically close the dialog on success
            // Allow user to close it manually
            // mode === 'add' && onRemove();
            // mode === 'edit' && onRemove();
        }
    }

    function handleChange(e) {
        setData({...data, [e.target.name]: e.target.value});
    }

    function handleSaveResponse() {
        addResponse({data: {response_id: followUp.response_id, response: data.response}});
    }

    function createRecordOptions(record) {
        const options = [
            {text: 'View Details', type: 'action', action: () => setContext({...context, mode: 'view-response', followUp: record, riskId: riskID})},
            {text: 'Edit', type: 'action', action: () => setContext({...context, mode: 'edit', followUp: record, riskId: riskID})},
            {text: 'Delete', type: 'action', action: () => deleteFollowUp({id: record.id})},
        ];
        return options;
    }

    let content;

    if (isLoading) content = <div>Loading</div>
    else if (error) content = <div>error</div>
    else {
        content = mode === 'view-response' ?
        <>
            <div className="flex flex-col gap-3">
                <span className="font-medium">Risk Name</span>
                <p>{followUp.name}</p>
            </div>
            <div className="flex flex-col gap-3">
                <span className="font-medium">Follow Up Note</span>
                <p>{followUp['follow up note']}</p>
            </div>
            <div className="flex flex-col gap-3">
                <span className="font-semibold text-lg">Response</span>
                {
                    followUp['follow up response'] ?
                    <p>{followUp['follow up response']}</p> :
                    <p className="italic text-sm text-text-gray">No response has been provided</p>
                }
            </div>
            {
                !followUp['follow up response'] &&
                <>
                    <Field {...{name: 'response', label: 'My Response', placeholder: 'Enter response', value: data.response, onChange: handleChange}} />
                    <div className="flex gap-6 w-1/2">
                        <FormCancelButton text={'Discard'} onClick={onRemove} />
                        <FormProceedButton text={'Save'} onClick={handleSaveResponse} />
                    </div>
                </>
            }
        </> :
        (mode === 'add' || mode === 'edit') &&
        <>
            <RiskSelector selectedRisk={Number(riskID)} onSelect={setRiskID} />
            <FollowUpForm mode={mode} riskID={riskID} inModalView={true} onRemoveForm={onRemove} followUp={followUp} removeModal={onRemove} />
            <div className="flex flex-col gap-3">
                <span className="font-semibold text-lg">Follow Up History</span>
                <FollowUpHistoryTable history={followUps} createRecordOptions={createRecordOptions} />
            </div>
        </>
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="bg-white border border-[#E2E2E2] rounded-2xl w-[800px] p-6 min-h-96">
                <div className="flex flex-col gap-6">
                    <header className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg">Follow Up{mode === 'view-responses' && ' Response'}</h4>
                        <CloseButton onClose={onRemove} />
                    </header>
                    {content}
                </div>
            </div>
        </div>
    );
}

function FollowUpHistoryTable({history, createRecordOptions}) {
    console.log('FollowUpHistoryTable rendered with history:', history);
    
    // Generate a unique key for the table based on history content and current timestamp
    // This will force React to re-render the table completely on every render
    const tableKey = `follow-up-table-${history ? history.length : 0}-${Date.now()}`;
    
    return (
        <div className='mt-3 overflow-auto p-6 flex flex-col gap-6 rounded-lg border border-[#CCC] text-[#3B3B3B] text-sm'>
            <div className="w-[1024px]" key={tableKey}>
                <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                    <span className='py-4 flex-[1_0]'>Date</span>
                    <span className='py-4 flex-[1_0]'>Time</span>
                    <span className='py-4 flex-[3_0]'>Follow up Note</span>
                    <span className='py-4 flex-[1_0]'>Name</span>
                    <span className='py-4 flex-[2_0]'>CC</span>
                    <span className='py-4 flex-[.5_0]'></span>
                </header>
                {history && history.length > 0 ? (
                    <ul className='flex flex-col'>
                        {
                            history.map((record, i) => (
                                <li key={`${record.id || i}-${Date.now()}`} className='px-4 flex gap-4 items-center'>
                                    <span className='py-4 flex-[1_0]'>{record.date}</span>
                                    <span className='py-4 flex-[1_0]'>{record.time}</span>
                                    <span className='py-4 flex-[3_0]'>{record['follow up note']}</span>
                                    <span className='py-4 flex-[1_0]'>{record.name}</span>
                                    <span className='py-4 flex-[2_0]'>{record['responder names'].map(r => r.name).join(', ')}</span>
                                    <span className='py-4 flex-[.5_0]'>
                                        <OptionsDropdown options={createRecordOptions(record)} />
                                    </span>
                                </li>
                            ))
                        }
                    </ul>
                ) : (
                    <p className='py-4 px-4 text-gray-500 italic'>No follow-up history available.</p>
                )}
            </div>
        </div>
    );
}

function RiskSelector({selectedRisk, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    //risks query
    const {isLoading, error, data} = useQuery(riskLogOptions({}));

    if (isLoading) return <div>loading</div>
    if (error) return <div>error</div>

    const risks = data.map(risk => ({id: risk.risk_id, text: risk.Title}));

    return (
        <SelectDropdown placeholder={'Select Risk'} items={risks} selected={selectedRisk} onSelect={(e) => onSelect(e.target.value)} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

function UsersDropdown({users, onSelect, selectedList}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [filterTerm, setFilterTerm] = useState('');

    const filteredUsers = users.filter(o => new RegExp(filterTerm, 'i').test(o.text));

    return (
        <SelectDropdown label={'Who To Respond'} customAction={onSelect} contentAfterLabel={selectedList} placeholder={'Select Users'} items={filteredUsers} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} filterable={true} filterTerm={filterTerm} setFilterTerm={setFilterTerm} />
    );
}