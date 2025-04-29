import OptionsDropdown from "../../../dropdowns/OptionsDropdown/OptionsDropdown";
import AddNewButton from '../../../buttons/AddNewButton/AddNewButton';
import SelectDropdown from "../../../dropdowns/SelectDropdown/SelectDropdown";
import { useEffect, useState } from "react";
import AISuggestionBox from "../../../AISuggestion/AISuggestion";
import useActionPlansSuggestion from "../../../../../queries/ai/risks/action-plans";

export default function ActionPlanTable({onAddPlan, onRemovePlan, plans, onPlanChange, users, registerStatuses, aiSuggestionData = {}, editable = false}) {

    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [aiError, setAiError] = useState(null);
    const [promptSuggestion, setPromptSuggestion] = useState('');

    const {isPending, mutate} = useActionPlansSuggestion({
        onSuccess: (data) => {setAiSuggestion(data)},
        onError: (error) => setAiError(error.response.data.error),
    });

    useEffect(() => {
        setAiSuggestion(null);
        setAiError(null);
    }, [aiSuggestionData.risk, aiSuggestionData.risk_response, aiSuggestionData.control_family, aiSuggestionData.recommended_control, aiSuggestionData.contingency_plan]);

    function fetchActionPlanSuggestion() {
        if (aiSuggestionData.risk === '' || aiSuggestionData.risk_response === '' || aiSuggestionData.control_family === '' || aiSuggestionData.recommended_control === '' || aiSuggestionData.contingency_plan === '') {
            setAiError('The risk name, response, family, recommended control and contingency plan must be specified.');
            return;
        }
        mutate({...aiSuggestionData, suggestion: promptSuggestion});
    }

    function handleApplySuggestion(suggestion) {
        try {
            // Parse the suggested action plans and apply them
            // AI usually returns action plans in a format like:
            // 1. Action 1
            // 2. Action 2
            // We need to parse this and create new action plan items
            
            // Split by numbered items or line breaks
            const actionItems = suggestion.split(/\n\d+[\.\)]\s|\n-\s/).filter(item => item.trim());
            
            // If no proper splitting occurred, try a different approach
            let parsedItems = actionItems.length > 0 ? actionItems : suggestion.split('\n').filter(item => item.trim());
            
            // Remove any remaining numbers at the beginning of items
            parsedItems = parsedItems.map(item => item.replace(/^\d+[\.\)]\s/, '').trim());
            
            // Add each action item to the plan
            parsedItems.forEach(actionText => {
                if (actionText) {
                    // First add a new plan
                    onAddPlan();
                    
                    // Wait a moment for the state to update
                    setTimeout(() => {
                        // Get the index of the newly added plan
                        const newPlanIndex = plans.length;
                        
                        // Create an event to set the action text
                        const event = {
                            target: {
                                name: 'action',
                                value: actionText
                            }
                        };
                        
                        // Update the action text of the new plan
                        onPlanChange(event, true, newPlanIndex);
                    }, 0);
                }
            });
        } catch (error) {
            console.error("Error applying AI suggestion:", error);
            setAiError("Error applying the suggestion. Please try again or apply manually.");
        }
    }

    function createRecordOptions(index) {
        let options = [
            {text: 'Edit', type: 'action', action: () => console.log('edit clicked')},
        ];

        if (editable) options.push({text: 'Delete', type: 'action', action: () => onRemovePlan(index)});
        else options.unshift({text: 'Completed', type: 'action', action: () => console.log('completed clicked')},);

        return options;
    }
    
    return (
        <div>
            <header className="flex justify-between">
                <h4 className='font-medium'>Action Plan</h4>
                {
                    editable &&
                    <AISuggestionBox 
                        onFetch={fetchActionPlanSuggestion} 
                        onApply={handleApplySuggestion}
                        isFetching={isPending} 
                        error={aiError} 
                        content={aiSuggestion} 
                        suggestion={promptSuggestion} 
                        onSuggestionChange={(e) => setPromptSuggestion(e.target.value)} 
                    />
                }
            </header>
            <div className='mt-3 overflow-auto p-6 flex flex-col gap-6 rounded-lg border border-[#CCC] text-[#3B3B3B] text-sm'>
                <div className="w-[1024px]">
                    <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                        <span className='py-4 flex-[.3_0]'>#</span>
                        <span className='py-4 flex-[3_0]'>Action</span>
                        <span className='py-4 flex-[2_0]'>Assigned To</span>
                        <span className='py-4 flex-[1_0]'>Due Date</span>
                        <span className='py-4 flex-[1_0]'>Status</span>
                        <span className='flex-[0.4_1]'></span>
                    </header>
                    <ul className='flex flex-col'>
                        {
                            plans.map((plan, i) => {
                                return (
                                    <li key={i}>
                                        <ActionPlanRow plan={plan} serialNo={i+1} index={i} options={createRecordOptions(i)} onPlanChange={onPlanChange} editable={editable} users={users} registerStatuses={registerStatuses} aiSuggestionData={aiSuggestionData} />
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
                {editable && <AddNewButton small={true} text={'Add new'} onClick={onAddPlan} />}
            </div>
        </div>
    );
}

function ActionPlanRow({plan, serialNo, index, onPlanChange, options, editable, users, registerStatuses}) {
    const handleAssignedToChange = (e) => {
        // Create a modified event object with the correct structure for assigned_to
        const modifiedEvent = {
            target: {
                name: 'assigned_to',
                value: { 
                    id: e.target.value
                }
            }
        };
        onPlanChange(modifiedEvent, true, index);
    };

    // Ensure assigned_to exists and has an id property to prevent errors
    const assignedToId = plan.assigned_to && plan.assigned_to.id !== undefined ? plan.assigned_to.id : '';
    const assignedToName = plan.assigned_to && plan.assigned_to.name ? plan.assigned_to.name : '';

    return (
        <div className="relative">
            <div className='px-4 flex gap-4 items-center'>
                <span className='py-4 flex-[.3_0]'>{serialNo}</span>
                <span className='py-4 flex-[3_0]'>
                    {
                        editable ?
                        <input type="text" name='action' value={plan.action} onChange={(e) => onPlanChange(e, true, index)} placeholder='Enter action' className='p-2 outline-none rounded-lg border border-border-gray w-full' /> :
                        <span>{plan.action}</span>
                    }
                </span>
                <span className='py-4 flex-[2_0]'>
                    {
                        editable ?
                        <NameDropdown names={users} selected={assignedToId} onChange={handleAssignedToChange} /> :
                        <span>{assignedToName}</span>
                    }
                </span>
                <span className='py-4 flex-[1_0]'>
                    {
                        editable ?
                        <input type="date" name='due_date' value={plan.due_date} onChange={(e) => onPlanChange(e, true, index)} className='p-2 outline-none rounded-lg border border-border-gray w-full' /> :
                        <span>{plan.due_date}</span>
                    }
                </span>
                <span className='py-4 flex-[1_0]'>
                    {
                        editable ?
                        <StatusDropdown noLabel={true} statuses={registerStatuses} selected={plan.status_id} onChange={(e) => onPlanChange(e, true, index)} /> :
                        <span>{plan.status?.name}</span>
                    }
                </span>
                <span className='py-4 flex-[0.4_1] text-center'>
                    <OptionsDropdown options={options} />
                </span>
            </div>
        </div>
    );
}

function StatusDropdown({statuses, selected, onChange, noLabel}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={noLabel ? null : 'Status'} placeholder={'Status'} items={statuses} name={'status_id'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

function NameDropdown({names, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown placeholder={'Name'} items={names} name={'assigned_to'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}