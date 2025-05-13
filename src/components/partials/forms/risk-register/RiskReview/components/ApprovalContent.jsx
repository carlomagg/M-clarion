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
    
    // Enhanced logging for debugging status issues
    console.log('ApprovalContent - currentStatus raw:', currentStatus);
    console.log('ApprovalContent - approvalStatuses:', approvalStatuses);
    
    // Try to get a better status from the available data
    let statusToDisplay = 'PENDING';
    
    // If we have a valid currentStatus object with a status property, use that
    if (currentStatus && typeof currentStatus === 'object' && currentStatus.status) {
        statusToDisplay = currentStatus.status;
    }
    // If currentStatus is a string, use it directly
    else if (typeof currentStatus === 'string') {
        statusToDisplay = currentStatus;
    }
    // If we have an ID, try to look it up in approvalStatuses
    else if (currentStatus && typeof currentStatus === 'object' && currentStatus.id && approvalStatuses) {
        const matchedStatus = approvalStatuses.find(s => s.id === currentStatus.id);
        if (matchedStatus) {
            statusToDisplay = matchedStatus.status;
        }
    }
    
    // Use a more meaningful default status instead of "Unknown"
    const safeCurrentStatus = { 
        status: statusToDisplay, 
        id: currentStatus?.id || '' 
    };
    
    console.log('ApprovalContent - safeCurrentStatus after processing:', safeCurrentStatus);
    
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
                console.log('Approval history full response:', response);
                
                // Process the response data
                let history = response.data;
                
                // Add detailed logging of the raw response structure
                console.log('Raw API response type:', typeof history);
                console.log('Raw API response structure:', history);
                
                // Check if the response has a risk_approval_status_data field which might contain the status
                if (history && typeof history === 'object' && history.risk_approval_status_data) {
                    console.log('Found risk_approval_status_data in response:', history.risk_approval_status_data);
                    
                    // If it's an object, try to extract status information
                    if (typeof history.risk_approval_status_data === 'object') {
                        if (history.risk_approval_status_data.status) {
                            console.log('Found status in risk_approval_status_data:', history.risk_approval_status_data.status);
                            history.status = history.risk_approval_status_data.status;
                        } else if (history.risk_approval_status_data.name) {
                            console.log('Found name in risk_approval_status_data:', history.risk_approval_status_data.name);
                            history.status = history.risk_approval_status_data.name;
                        } else if (history.risk_approval_status_data.status_name) {
                            console.log('Found status_name in risk_approval_status_data:', history.risk_approval_status_data.status_name);
                            history.status = history.risk_approval_status_data.status_name;
                        }
                    }
                    // If it's a string, use it directly
                    else if (typeof history.risk_approval_status_data === 'string') {
                        console.log('risk_approval_status_data is a string:', history.risk_approval_status_data);
                        history.status = history.risk_approval_status_data;
                    }
                }
                
                // Extract approval status directly from the response if available
                let extractedStatus = null;
                
                // Examine the response structure to find status information
                if (history && typeof history === 'object') {
                    console.log('Examining response for status information');
                    
                    // Try to find risk_approval_status directly in the response
                    if (history.risk_approval_status) {
                        extractedStatus = history.risk_approval_status;
                        console.log('Found risk_approval_status directly in response:', extractedStatus);
                    }
                    // Try to find status directly in the response
                    else if (history.status) {
                        extractedStatus = history.status;
                        console.log('Found status directly in response:', extractedStatus);
                    }
                    // Try to find risk_approval_status_id directly in the response
                    else if (history.risk_approval_status_id && approvalStatuses) {
                        const statusId = typeof history.risk_approval_status_id === 'string' 
                            ? parseInt(history.risk_approval_status_id, 10) 
                            : history.risk_approval_status_id;
                            
                        const statusObj = approvalStatuses.find(s => s.id === statusId);
                        if (statusObj) {
                            extractedStatus = statusObj.status;
                            console.log('Found status from risk_approval_status_id:', extractedStatus);
                        } else {
                            const directStatusMap = {
                                1: 'COMPLETED',
                                2: 'REJECTED',
                                3: 'FORWARDED',
                                4: 'ON HOLD'
                            };
                            extractedStatus = directStatusMap[statusId];
                            console.log('Mapped risk_approval_status_id to status:', extractedStatus);
                        }
                    }
                }
                
                // Special case: If the response contains a risk_approval_status_name field directly
                if (history && typeof history === 'object' && !Array.isArray(history) && 
                   (history.risk_approval_status_name || extractedStatus)) {
                    
                    const statusValue = history.risk_approval_status_name || extractedStatus;
                    console.log('Found status directly in response:', statusValue);
                    
                    // Create a history record with the status
                    history = [{
                        date: history.date || history.created_at || new Date().toLocaleDateString(),
                        time: history.time || new Date().toLocaleTimeString(),
                        status: statusValue, // Use the extracted status directly
                        risk_approval_note: history.risk_approval_note || history.comment || history.note || '',
                        action_by: history.action_by || history.actionBy || history.user_name || ''
                    }];
                    console.log('Created history record from direct response:', history);
                }
                
                if (history) {
                    if (typeof history === 'object' && !Array.isArray(history)) {
                        console.log('Response is an object. Keys:', Object.keys(history));
                        
                        // Check if there's a key that might contain status information
                        Object.keys(history).forEach(key => {
                            console.log(`Examining key "${key}":`, history[key]);
                            if (Array.isArray(history[key])) {
                                console.log(`Array found in key "${key}" with ${history[key].length} items`);
                                if (history[key].length > 0) {
                                    console.log(`Sample item from "${key}":`, history[key][0]);
                                    console.log(`Fields in sample item:`, Object.keys(history[key][0]));
                                }
                            }
                        });
                    } else if (Array.isArray(history)) {
                        console.log('Response is an array with', history.length, 'items');
                        if (history.length > 0) {
                            console.log('Sample item:', history[0]);
                            console.log('Fields in sample item:', Object.keys(history[0]));
                        }
                    }
                }
                
                // Check if it's an array or needs extraction
                if (!Array.isArray(history)) {
                    // Try to find the array in the response
                    for (const key in history) {
                        if (Array.isArray(history[key])) {
                            history = history[key];
                            console.log(`Found history array in key: ${key}`);
                            break;
                        }
                    }
                    
                    // If still not an array, wrap it
                    if (!Array.isArray(history)) {
                        console.log('History data is not an array, wrapping it:', history);
                        history = [history];
                    }
                }
                
                // Log raw history data
                console.log('Raw history data before processing:', history);
                
                // Process and normalize the data - IMPORTANT: don't default to 'COMPLETED'
                const processedHistory = history.map((record, index) => {
                    console.log(`--------- DETAILED DEBUG FOR RECORD ${index} ---------`);
                    console.log('Raw record:', JSON.stringify(record, null, 2));
                    console.log('Record keys:', Object.keys(record));
                    
                    if (record.status) console.log('status:', record.status, typeof record.status);
                    if (record.approval_status) console.log('approval_status:', record.approval_status, typeof record.approval_status);
                    if (record.risk_approval_status) console.log('risk_approval_status:', record.risk_approval_status, typeof record.risk_approval_status);
                    if (record.risk_approval_status_id) console.log('risk_approval_status_id:', record.risk_approval_status_id, typeof record.risk_approval_status_id);
                    if (record.risk_id) console.log('risk_id:', record.risk_id);
                    
                    console.log('Processing history record:', record);
                    
                    // NEW: Direct mapping for common numeric status values
                    const STATUS_MAP = {
                        1: 'COMPLETED',
                        2: 'REJECTED',
                        3: 'FORWARDED',
                        4: 'ON HOLD',
                        5: 'PENDING'
                    };
                    
                    // Try to map any numeric status values directly
                    if (record.status !== undefined && typeof record.status === 'number') {
                        console.log(`Found numeric status ${record.status}, mapping to:`, STATUS_MAP[record.status] || `Status ${record.status}`);
                        record.status = STATUS_MAP[record.status] || `Status ${record.status}`;
                    }
                    
                    if (record.risk_approval_status_id !== undefined && typeof record.risk_approval_status_id === 'number') {
                        console.log(`Found numeric risk_approval_status_id ${record.risk_approval_status_id}, should map to:`, 
                          STATUS_MAP[record.risk_approval_status_id] || `Status ${record.risk_approval_status_id}`);
                    }
                    
                    // Extract the original status without defaulting to 'COMPLETED'
                    // Check multiple possible field names for status
                    let originalStatus = null;
                    
                    // Direct status field checks
                    if (record.status) originalStatus = record.status;
                    else if (record.approval_status) originalStatus = record.approval_status;
                    else if (record.risk_approval_status) originalStatus = record.risk_approval_status;
                    else if (record.risk_approval_status_name) originalStatus = record.risk_approval_status_name;
                    else if (record.status_name) originalStatus = record.status_name;
                    else if (record.statusName) originalStatus = record.statusName;
                    
                    // Check for status in nested status object
                    else if (record.status_obj && record.status_obj.status) originalStatus = record.status_obj.status;
                    else if (record.statusObj && record.statusObj.status) originalStatus = record.statusObj.status;
                    else if (record.approval_status_obj && record.approval_status_obj.status) originalStatus = record.approval_status_obj.status;
                    
                    // Check for nested objects that might contain status information
                    else if (record.risk_approval_status_obj) {
                        if (record.risk_approval_status_obj.status) {
                            originalStatus = record.risk_approval_status_obj.status;
                        } else if (record.risk_approval_status_obj.name) {
                            originalStatus = record.risk_approval_status_obj.name;
                        } else if (record.risk_approval_status_obj.status_name) {
                            originalStatus = record.risk_approval_status_obj.status_name;
                        }
                    }
                    
                    // Check for approval_status_name which is commonly used
                    else if (record.approval_status_name) originalStatus = record.approval_status_name;
                    
                    // NEW: Try to obtain the status from a localized value if available
                    else if (record.approval_status_name_localized) originalStatus = record.approval_status_name_localized;
                    else if (record.status_name_localized) originalStatus = record.status_name_localized;
                    
                    // NEW: Try to extract status from risk_approval_status_data field
                    else if (record.risk_approval_status_data) {
                        if (typeof record.risk_approval_status_data === 'object') {
                            if (record.risk_approval_status_data.status) {
                                originalStatus = record.risk_approval_status_data.status;
                            } else if (record.risk_approval_status_data.name) {
                                originalStatus = record.risk_approval_status_data.name;
                            } else if (record.risk_approval_status_data.status_name) {
                                originalStatus = record.risk_approval_status_data.status_name;
                            }
                        } else if (typeof record.risk_approval_status_data === 'string') {
                            originalStatus = record.risk_approval_status_data;
                        }
                    }
                    
                    // Check for status ID and map to status text
                    else if (record.risk_approval_status_id && approvalStatuses) {
                        // Convert to number if it's a string
                        const statusId = typeof record.risk_approval_status_id === 'string' 
                            ? parseInt(record.risk_approval_status_id, 10) 
                            : record.risk_approval_status_id;
                            
                        // Direct mapping if not found in approvalStatuses
                        const directStatusMap = {
                            1: 'COMPLETED',
                            2: 'REJECTED',
                            3: 'FORWARDED',
                            4: 'ON HOLD',
                            5: 'PENDING'
                        };
                         
                        // Try to find in approvalStatuses first
                        const statusObj = approvalStatuses.find(s => s.id === statusId);
                        if (statusObj) {
                            originalStatus = statusObj.status;
                            console.log(`Found status from risk_approval_status_id in approvalStatuses: ${originalStatus}`);
                        }
                        else {
                            // Use direct mapping if approvalStatuses doesn't contain the ID
                            originalStatus = directStatusMap[statusId] || `Status ${statusId}`;
                            console.log(`Mapped risk_approval_status_id to status using direct mapping: ${originalStatus}`);
                        }
                    }
                    else if (record.status_id && approvalStatuses) {
                        // Convert to number if it's a string
                        const statusId = typeof record.status_id === 'string' 
                            ? parseInt(record.status_id, 10) 
                            : record.status_id;
                        
                        // Direct mapping if not found in approvalStatuses
                        const directStatusMap = {
                            1: 'COMPLETED',
                            2: 'REJECTED',
                            3: 'FORWARDED',
                            4: 'ON HOLD',
                            5: 'PENDING'
                        };
                        
                        // Try to find in approvalStatuses first
                        const statusObj = approvalStatuses.find(s => s.id === statusId);
                        if (statusObj) {
                            originalStatus = statusObj.status;
                            console.log(`Found status from status_id in approvalStatuses: ${originalStatus}`);
                        }
                        else {
                            // Use direct mapping if approvalStatuses doesn't contain the ID
                            originalStatus = directStatusMap[statusId] || `Status ${statusId}`;
                            console.log(`Mapped status_id to status using direct mapping: ${originalStatus}`);
                        }
                    }
                    
                    // Check for any field that might contain status information
                    if (!originalStatus) {
                        for (const key in record) {
                            if (typeof record[key] === 'string' && 
                                (key.toLowerCase().includes('status') || 
                                 ['completed', 'rejected', 'forwarded', 'on hold'].includes(record[key].toUpperCase()))) {
                                console.log(`Found potential status in field "${key}":`, record[key]);
                                originalStatus = record[key];
                                break;
                            }
                        }
                    }
                    
                    // Map common numeric status IDs to status names if we still don't have a status
                    if (!originalStatus && typeof record.status === 'number' && approvalStatuses) {
                        const statusObj = approvalStatuses.find(s => s.id === record.status);
                        if (statusObj) originalStatus = statusObj.status;
                    }
                    
                    // Last resort: Map common numeric values to standard statuses
                    if (!originalStatus && typeof record.status === 'number') {
                        // Common mapping pattern in many APIs
                        const statusMap = {
                            1: 'COMPLETED',
                            2: 'REJECTED',
                            3: 'FORWARDED',
                            4: 'ON HOLD',
                            5: 'PENDING'
                        };
                        originalStatus = statusMap[record.status] || `Status ${record.status}`;
                    }
                    
                    // Final check - scan all fields for anything that might contain status information
                    if (!originalStatus) {
                        console.log('No status found, scanning all fields for potential status information...');
                        for (const key in record) {
                            const value = record[key];
                            if (value !== null && value !== undefined) {
                                // Check if the field name contains 'status'
                                if (key.toLowerCase().includes('status')) {
                                    console.log(`Found potential status field: ${key} with value: ${value}`);
                                    if (typeof value === 'string') {
                                        originalStatus = value;
                                        console.log(`Using value from ${key} as status: ${originalStatus}`);
                                        break;
                                    } else if (typeof value === 'object' && value.status) {
                                        originalStatus = value.status;
                                        console.log(`Using value from ${key}.status as status: ${originalStatus}`);
                                        break;
                                    } else if (typeof value === 'object' && value.name) {
                                        originalStatus = value.name;
                                        console.log(`Using value from ${key}.name as status: ${originalStatus}`);
                                        break;
                                    } else if (typeof value === 'number') {
                                        const statusMap = {
                                            1: 'COMPLETED',
                                            2: 'REJECTED',
                                            3: 'FORWARDED',
                                            4: 'ON HOLD',
                                            5: 'PENDING'
                                        };
                                        originalStatus = statusMap[value] || `Status ${value}`;
                                        console.log(`Mapped numeric value from ${key} to status: ${originalStatus}`);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    
                    console.log('Final status value:', originalStatus || 'PENDING');
                    
                    // Check time format - it might be stored in a different format or field
                    let timeValue = record.time;
                    
                    // If time is in a format like "HH:MM:SS" without AM/PM, convert it to 12-hour format
                    if (timeValue && timeValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
                        const [hours, minutes] = timeValue.split(':');
                        const hoursNum = parseInt(hours, 10);
                        // Add 1 hour to fix the time being 1 hour behind
                        const adjustedHours = (hoursNum + 1) % 24;
                        const ampm = adjustedHours >= 12 ? 'PM' : 'AM';
                        const hours12 = adjustedHours % 12 || 12; // Convert 0 to 12 for 12 AM
                        timeValue = `${hours12}:${minutes} ${ampm}`;
                    }
                    
                    // If no time field, check for created_at or other timestamp fields
                    if (!timeValue && record.created_at) {
                        const date = new Date(record.created_at);
                        if (!isNaN(date.getTime())) {
                            // Add 1 hour to fix the time being 1 hour behind
                            date.setHours(date.getHours() + 1);
                            timeValue = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                    }
                    
                    return {
                        date: record.date || '',
                        time: timeValue || '',
                        status: originalStatus || 'PENDING', // Changed from 'Unknown' to 'PENDING' as a more meaningful default
                        comment: record.risk_approval_note || record.comment || record.note || '',
                        actionBy: record.action_by || record.actionBy || record.user_name || ''
                    };
                });
                
                console.log('Processed history data:', processedHistory);
                return processedHistory;
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
    
    // Log history data to help with debugging
    console.log('Rendering ApprovalHistoryTable with history:', history);
    
    // Function to determine status color based on status value
    const getStatusColor = (status) => {
        // Convert to uppercase for case-insensitive comparison
        const statusUpper = status.toUpperCase();
        if (statusUpper.includes('COMPLET') || statusUpper === 'APPROVED' || statusUpper === 'APPROVE') {
            return '#22c55e'; // Green
        } else if (statusUpper.includes('REJECT')) {
            return '#ef4444'; // Red
        } else if (statusUpper.includes('FORWARD')) {
            return '#3b82f6'; // Blue
        } else if (statusUpper.includes('HOLD') || statusUpper.includes('PEND')) {
            return '#eab308'; // Yellow
        } else {
            return '#2F2F2F'; // Default dark gray
        }
    };
    
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
                            // Log individual record for debugging
                            console.log(`Record ${i} status:`, record.status);
                            
                            // Use the function to determine status color
                            const statusColor = getStatusColor(record.status || 'PENDING');
                            
                            return (
                                <li key={i} className={`px-4 flex gap-4 items-center ${i === 0 ? 'bg-blue-50' : ''}`}>
                                    <span className='py-4 flex-[1_0]'>
                                        {record.date}
                                        {i === 0 && <span className="ml-1 text-xs text-blue-600">(Latest)</span>}
                                    </span>
                                    <span className='py-4 flex-[1_0]'>{record.time}</span>
                                    <span className='py-4 flex-[1_0]'>
                                        <StatusChip 
                                            color={statusColor} 
                                            text={record.status || 'PENDING'} 
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