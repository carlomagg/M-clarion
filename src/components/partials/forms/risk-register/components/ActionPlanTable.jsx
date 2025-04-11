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
                    <AISuggestionBox onFetch={fetchActionPlanSuggestion} isFetching={isPending} error={aiError} content={aiSuggestion} suggestion={promptSuggestion} onSuggestionChange={(e) => setPromptSuggestion(e.target.value)} />
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
                        <NameDropdown names={users} selected={plan.assigned_to.id} onChange={(e) => onPlanChange(e, true, index)} /> :
                        <span>{plan.assigned_to.name}</span>

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