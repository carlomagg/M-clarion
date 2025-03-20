import { useContext, useEffect, useState } from 'react';
import styles from './Initiative.module.css';
import { format } from 'date-fns';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { initiativeHistoryOptions, initiativeOptions, strategyHistoryOptions, unitMeasuresOptions, useAddBudgetSpend, useAddInitiative, useAddMilestone, useDeleteBudgetSpend, useDeleteInitiative, useDeleteMilestone, useUpdateBudgetSpend, useUpdateInitiative, useUpdateMilestone, useUpdateMilestoneStatus } from '../../../../../queries/strategies/strategy-queries';
import { Field, H3 } from '../../../Elements/Elements';
import SelectDropdown from '../../../dropdowns/SelectDropdown/SelectDropdown';
import { FormCancelButton, FormProceedButton } from '../../../buttons/FormButtons/FormButtons';
import { StrategyDrawerContext } from '../../../../pages/strategies/Index/Index';
import OptionsDropdown from '../../../dropdowns/OptionsDropdown/OptionsDropdown';
import ActionsDropdown from '../../../dropdowns/ActionsDropdown/ActionsDropdown';
import { createPortal } from 'react-dom';
import minimizeIcon from '../../../../../assets/icons/minimize.svg';
import useDispatchMessage from '../../../../../hooks/useDispatchMessage';
import { usersOptions } from '../../../../../queries/users-queries';
import AddNewButton from '../../../buttons/AddNewButton/AddNewButton';
import { convertToNumber, formatAmount } from '../../../../../utils/helpers';
import { useParams } from 'react-router-dom';
import useConfirmedAction from '../../../../../hooks/useConfirmedAction';

export function Initiative() {
    const {removeDrawer, mode: initialMode, bag} = useContext(StrategyDrawerContext);
    const [showHistory, setShowHistory] = useState(false);
    const [context, setContext] = useState({mode: initialMode, id: bag?.initiativeId});
    const queryClient = useQueryClient();
    const {id: strategyId} = useParams();

    const {mode, id: initiativeId} = context;

    // fetch initiative if in view or edit mode
    const {isLoading, error, data: initiative} = useQuery(initiativeOptions(strategyId, initiativeId, {enabled: !!initiativeId}));

    // add, update, delete initiative mutations
    const {isPending: isAddingInitiative, mutate: addInitiative} = useAddInitiative({onSuccess, onError, onSettled});
    const {isPending: isUpdatingInitiative, mutate: updateInitiative} = useUpdateInitiative(initiativeId, {onSuccess, onError, onSettled});
    const {isPending: isDeletingInitiative, mutate: deleteInitiative} = useDeleteInitiative(initiativeId, {onSuccess, onError, onSettled});

    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingInitiative ? 'Adding initiative' : (isUpdatingInitiative ? 'Updating initiative' : 'Deleting initiative');
        (isAddingInitiative || isUpdatingInitiative || isDeletingInitiative) && dispatchMessage('processing', text);
    }, [isAddingInitiative, isUpdatingInitiative, isDeletingInitiative]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['strategies', Number(strategyId)]});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // remove form pannel if successful
        if (!error) removeDrawer();
    }

    if (isLoading) {
        return <div>loading</div>
    }

    if (error) {
        return <div>error occured</div>
    }

    return (
        <div className='flex flex-col gap-6 h-full overflow-auto'>
            {
                showHistory && <InitiativeHistory initiativeId={initiativeId} onClose={() => setShowHistory(false)} />
            }
            {
                mode === 'view' ?

                <InitiativeView initiative={initiative} onEditClicked={() => setContext({mode: 'edit', id: initiativeId})} onDeleteClicked={deleteInitiative} onHistoryClicked={() => setShowHistory(true)} /> :

                <InitiativeForm mode={mode} initiative={initiative} isPending={isAddingInitiative || isUpdatingInitiative} onAddInitiative={addInitiative} onUpdateInitiative={updateInitiative} />
            }
        </div>
    );
}

function InitiativeView({initiative, onEditClicked, onDeleteClicked, onHistoryClicked}) {
    const {confirmAction, confirmationDialog} = useConfirmedAction();
    const actions = [
        {text: 'Edit', type: 'action', onClick: onEditClicked , permission: 'edit_subsidiary'},
        {text: 'Delete', type: 'action', onClick: () => confirmAction(onDeleteClicked), permission: 'delete_subsidiary'},
        {text: 'View History', type: 'action', onClick: onHistoryClicked , permission: 'edit_subsidiary'},
    ];

    return (       
        <div className='flex flex-col p-6 gap-6'>
            {confirmationDialog}
            <div className='flex justify-between pr-14'>
                <H3>Initiative</H3>
                <ActionsDropdown label={'Actions'} items={actions} />
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Name</h4>
                <p>{initiative.initiative_name}</p>
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Description</h4>
                <p>{initiative.description}</p>
            </div>
            <div className='flex gap-6'>
                <div className='flex gap-3 flex-1 items-center'>
                    <span className='font-medium whitespace-nowrap'>Tactics Status:</span>
                    <span className='font-medium text-sm bg-[#D5D5D5] px-2 py-1 rounded-full whitespace-nowrap'>0% Completion</span>
                </div>
                <div className='flex gap-3 flex-1 items-center'>
                    <span className='font-medium'>Result:</span>
                    <span className='font-medium text-sm bg-[#D5D5D5] px-2 py-1 rounded-full whitespace-nowrap'>{initiative.result_indicator}% Success</span>
                </div>
            </div>
            <div className='flex gap-[18px]'>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Start Date</h4>
                    <p>{initiative.start_date}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>End Date</h4>
                    <p>{initiative.end_date}</p>
                </div>
            </div>
            <hr className='bg-[#CCC]' />
            <div className='flex gap-[18px]'>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Budget</h4>
                    <p>{formatAmount(initiative.budget)}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Weight</h4>
                    <p>{initiative.weight}</p>
                </div>
            </div>
            {
                initiative.allocate_budget &&
                <BudgetSpendTable budget={initiative.budget} budgetSpends={initiative.budget_spend} />
            }
            <MilestonesTable milestones={initiative.milestones} mode='view' />
            <hr className='bg-[#CCC]' />
            <div className='space-y-3'>
                <h4 className='font-medium'>Note</h4>
                <p>{initiative.note}</p>
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Owner{initiative.owners.length > 1}</h4>
                <OwnersList owners={initiative.owners} />
            </div>
        </div>
    );
}

function InitiativeForm({mode, initiative = null, isPending, onAddInitiative, onUpdateInitiative}) {
    const {removeDrawer, bag} = useContext(StrategyDrawerContext);
    const [validationErrors, setValidationErrors] = useState({});
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedUsersJSX, setSelectedUsersJSX] = useState('');
    const [formData, setFormData] = useState({
        objective_id: bag?.objectiveId || '',
        name: '',
        description: '',
        allocate_budget: false,
        weight: '',
        budget: '',
        start_date: '',
        end_date: '',
        type: 'quantitative',
        unit_measure: '',
        milestones: [],
        note: '',
        owner_ids: []
    });

    // update formData when initiative changes
    useEffect(() => {
        if (initiative) {
            setFormData(prevFormData => ({
                ...prevFormData,
                name: initiative.initiative_name,
                description: initiative.description,
                allocate_budget: initiative.allocate_budget,
                weight: initiative.weight,
                budget: formatAmount(initiative.budget),
                start_date: initiative.start_date,
                end_date: initiative.end_date,
                type: 'quantitative',
                unit_measure: initiative.unit_measure?.id,
                milestones: initiative.milestones,
                note: initiative.note,
                owner_ids: initiative.owners.map(i => i.id)
            }));
        }
    }, [initiative]);


    useEffect(() => {
        setFormData(prevFormData => ({
            ...prevFormData,
            owner_ids: selectedUsers.map(u => u.id)
        }));

        setSelectedUsersJSX(
            <OwnersList owners={selectedUsers} editable={true} onRemoveOwner={handleRemoveOwner} />
        );
    }, [selectedUsers]);

    
    // fetch unit measures
    const [unitMeasuresQuery, usersQuery] = useQueries({
        queries: [unitMeasuresOptions(), usersOptions()]
    });

    // set current owners in edit mode
    useEffect(() => {
        if (usersQuery.data && initiative) {
            let currentOwners = [];
            let ownerIds = new Set(initiative.owners.map(o => o.id));

            usersQuery.data.forEach(u => {
                if (ownerIds.has(u.user_id)) {
                    currentOwners.push({id: u.user_id, name: (!u.firstname && !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`});
                }
            })
            setSelectedUsers(currentOwners);
        }
    }, [usersQuery.data, initiative]);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.name === 'budget' ? formatAmount(e.target.value) : (e.target.type === 'checkbox' ? e.target.checked : e.target.value)
        })
    }

    function handleMilestoneChange(e, index) {
        const newFormData = {
            ...formData,
            milestones: formData.milestones.map((m, i) => {
                if (i !== index) return m
                return {...m, [e.target.name]: e.target.name === 'milestone' && formData.type === 'quantitative' ? formatAmount(e.target.value) : e.target.value}
            })
        };
        setFormData(newFormData);
    }

    function handleAddMilestone() {
        const newFormData = {
            ...formData,
            milestones: [...formData.milestones, {start_date: '', end_date: '', [formData.type === 'quantitative' ? 'milestone' : 'description']: '', weight: ''}]
        };

        setFormData(newFormData);
    }

    function handleRemoveMilestone(index) {
        const newFormData = {
            ...formData,
            milestones: formData.milestones.filter((_, i) => i !== index)
        };

        setFormData(newFormData);
    }

    function handleSelectOwner(user) {
        if (selectedUsers.some(u => u.id === user.id)) return;
        setSelectedUsers([...selectedUsers, user]);
    }

    function handleRemoveOwner(user) {
        setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    }

    function handleSubmit() {
        // convert comma delimited amount values in form data to numbers
        const formattedFormData = {
            ...formData,
            budget: formData.budget ? convertToNumber(formData.budget) : '',
            milestones: formData.type === 'quantitative' ? formData.milestones.map(m => ({...m, milestone: convertToNumber(m.milestone)})) : formData.milestones.map(m => ({...m, milestone: m.description})),
            unit_measure: formData.type === 'qualitative' ? null : formData.unit_measure

        };
        mode === 'add' ? onAddInitiative({data: formattedFormData}) : onUpdateInitiative({data: formattedFormData})
    }

    const isLoading = unitMeasuresQuery.isLoading || usersQuery.isLoading;
    const error = unitMeasuresQuery.error || usersQuery.error;

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    const unitMeasures = unitMeasuresQuery.data.map(u => ({id: u.id, text: u.name}));
    const users = usersQuery.data.map(u => ({id: u.user_id, text: (!u.firstname || !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`}));
    
    return (
        <form className='flex flex-col gap-2 justify-between'>
            <div className='flex flex-col p-6 gap-6'>
                <H3>Initiative</H3>
                <Field {...{label: 'Initiative Name', name: 'name', value: formData.name, onChange: handleChange, placeholder: 'Enter initiative name', error: validationErrors['name']}} />
                <Field {...{type: 'textbox', label: 'Description', name: 'description', value: formData.description, onChange: handleChange, placeholder: 'Enter description', error: validationErrors['description'], height: '100'}} />
                <label className='flex gap-2'>
                    <input type="checkbox" name="allocate_budget" checked={formData.allocate_budget} onChange={handleChange} />
                    <span>Allocate Budget</span>
                </label>
                <div className='flex gap-[18px]'>
                    <Field {...{type: 'number', label: 'Weight', name: 'weight', value: formData.weight, onChange: handleChange,  error: validationErrors['weight']}} />
                    <Field {...{label: 'Budget', name: 'budget', value: formData.budget, onChange: handleChange,  error: validationErrors['budget']}} />
                </div>
                <div className='flex gap-[18px]'>
                    <Field {...{type: 'date', label: 'Start date', name: 'start_date', value: formData.start_date, onChange: handleChange,  error: validationErrors['start_date']}} />
                    <Field {...{type: 'date', label: 'End date', name: 'end_date', value: formData.end_date, onChange: handleChange, error: validationErrors['end_date']}} />
                </div>
                <div className='flex flex-col gap-3'>
                    <label htmlFor="" className='font-medium'>Type</label>
                    <div className='flex gap-1'>
                        <button type="button" onClick={() => setFormData({...formData, type: 'quantitative'})} className={`rounded-l-2xl p-3 ${formData.type === 'quantitative' ? 'bg-text-pink text-white' : 'border border-[#CCC]'}`}>
                            Quantitative
                        </button>
                        <button type="button" onClick={() => setFormData({...formData, type: 'qualitative'})} className={`rounded-r-2xl p-3 ${formData.type === 'qualitative' ? 'bg-text-pink text-white' : 'border border-[#CCC]'}`}>
                            Qualitative
                        </button>
                    </div>
                </div>
                {
                    formData.type === 'quantitative' &&
                    <UnitMeasureDropdown unitMeasures={unitMeasures} selected={formData.unit_measure} onChange={handleChange} />
                }
                <MilestonesTable type={formData.type} onAddMilestone={handleAddMilestone} onRemoveMilestone={handleRemoveMilestone} onMilestoneChange={handleMilestoneChange} milestones={formData.milestones} editable={true} mode={mode} />
                <Field {...{type: 'textbox', label: 'Note', name: 'note', value: formData.note, onChange: handleChange, placeholder: 'Add note', error: validationErrors['note'], height: '100'}} />
                <OwnerDropdown users={users} onSelectOwner={handleSelectOwner} selectedUsersJSX={selectedUsersJSX} />
            </div>
            <div className='flex gap-6 px-6'>
                <FormCancelButton text={'Discard'} colorBlack={true} onClick={removeDrawer} />
                <FormProceedButton text={'Save changes'} disabled={isPending} onClick={handleSubmit} />
            </div>
        </form>
    );
}

function UnitMeasureDropdown({unitMeasures, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Unit Measure'} placeholder={'Choose Unit Measure'} items={unitMeasures} name={'unit_measure'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

function OwnerDropdown({users, onSelectOwner, selectedUsersJSX}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Owner'} contentAfterLabel={selectedUsersJSX} placeholder={'Choose group or individual'} items={users} name={'owner_ids'} selected={null} customAction={onSelectOwner} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

function OwnersList({owners, editable, onRemoveOwner}) {
    return owners.length > 0 ?
    <ul className='flex flex-wrap gap-2'>
        {
            owners.map((o, i) => {
                return <li key={o.id} className='flex gap-2 items-center text-sm'>
                    <span>{i + 1}.</span>
                    <div className='flex gap-2 py-1 px-4 bg-[#CDF8EB] rounded-full text-[#025D63] items-center'>
                        {o.name || o.text}
                        {
                            editable &&
                            <button type="button" onClick={() => onRemoveOwner(o)} className='rounded-full w-4 h-4 bg-[#0A0005] text-[#CDF8EB] flex items-center justify-center'>&#215;</button>
                        }
                    </div>
                </li>
            })
        }
    </ul> :
    ''
}

function BudgetSpendTable({budget, budgetSpends}) {
    const {bag: {initiativeId}} = useContext(StrategyDrawerContext);
    const [newBudgetSpend, setNewBudgetSpend] = useState(null);
    const [focusedBS, setFocusedBS] = useState(null);
    const {id: strategyId} = useParams();

    // add, update, delete initiative mutations
    const {isPending: isAddingBudgetSpend, mutate: addBudgetSpend} = useAddBudgetSpend(initiativeId, {onSuccess, onError, onSettled});
    const {isPending: isUpdatingBudgetSpend, mutate: updateBudgetSpend} = useUpdateBudgetSpend({onSuccess, onError, onSettled});
    const {isPending: isDeletingBudgetSpend, mutate: deleteBudgetSpend} = useDeleteBudgetSpend({onSuccess, onError, onSettled});

    const dispatchMessage = useDispatchMessage();
    const queryClient = useQueryClient();
    useEffect(() => {
        let text = isAddingBudgetSpend ? 'Adding budget spend' : (isUpdatingBudgetSpend ? 'Updating budget spend' :'Deleting budget spend');
        (isAddingBudgetSpend || isUpdatingBudgetSpend || isDeletingBudgetSpend) && dispatchMessage('processing', text);
    }, [isAddingBudgetSpend, isUpdatingBudgetSpend, isDeletingBudgetSpend]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['strategies', Number(strategyId), 'initiatives', Number(initiativeId)]});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // empty and remove input field
        if (!error) {
            setNewBudgetSpend(null);
            setFocusedBS(null);
        }
    }

    useEffect(() => {
        if (focusedBS !== null) {
            const budgetSpend = budgetSpends.find((bs, i) => i === focusedBS);
            setNewBudgetSpend({...budgetSpend, spend: formatAmount(budgetSpend.spend), remaining: formatAmount(budgetSpend.remaining)});
        }
    }, [focusedBS]);

    function itemOptions(id, index) {
        let options = [
            {text: 'Edit', type: 'action', action: () => setFocusedBS(index)},
            {text: 'Delete', type: 'action', action: () => deleteBudgetSpend({id})}
        ];
        return options;
    }

    const remainingBudget = budgetSpends.length > 0 ? budgetSpends[budgetSpends.length - 1].remaining : budget;

    function handleChange(e) {
        const {value} = e.target;

        const newSpend = formatAmount(value);
        const newRemaining = formatAmount(convertToNumber(formatAmount(remainingBudget)) - convertToNumber(value));

        setNewBudgetSpend({...newBudgetSpend, spend: newSpend, remaining: newRemaining});
    }

    function handleSubmit(type) {
        const formattedFormData = {
            initiative_budget_spend: convertToNumber(newBudgetSpend.spend),
            initiative_budget_remaining: convertToNumber(newBudgetSpend.remaining),
        }
        type === 'add' ?
        addBudgetSpend({data: formattedFormData}) :
        updateBudgetSpend({id: newBudgetSpend.id, data: formattedFormData});
    }

    const newFieldAdded = newBudgetSpend !== null && focusedBS === null;
    
    return (
        <div>
            <h4 className='font-medium'>Budget Spend</h4>
            <div className='mt-3 p-6 flex flex-col gap-6 rounded-lg border border-[#CCC] text-[#3B3B3B] text-sm'>
                <div>
                    <header className='px-4 border-b border-b-[#B7B7B7] flex'>
                        <span className='py-4 flex-1 text-center'>Spend</span>
                        <span className='py-4 flex-1 text-center'>Remaining</span>
                        <span className='py-4 flex-1 text-center'>Date</span>
                        <span className='py-4 flex-1 text-center'>User</span>
                        <span className='flex-[0.4_1] text-center'></span>
                    </header>
                    <ul className='flex flex-col'>
                        {
                            budgetSpends.map((spend, i) => {
                                return (
                                    i === focusedBS ? 
                                    (
                                        <li key={i} className='px-4 flex gap-6 items-center'>
                                            <span className='px-1 flex-1 text-center'>
                                                <input type="text" name='spend' value={newBudgetSpend?.spend || ''} onChange={handleChange} className='p-2 outline-none rounded-lg border border-border-gray w-full' />
                                            </span>
                                            <span className='px-1 flex-1 text-center'>
                                                <input type="text" name='remaining' value={newBudgetSpend?.remaining || ''} disabled className='p-2 outline-none rounded-lg border border-border-gray w-full' />
                                            </span>
                                            <div className='py-4 flex-1 flex gap-4 text-center'>
                                                <FormCancelButton text={'Discard'} colorBlack={true} onClick={() => {setFocusedBS(null);setNewBudgetSpend(null);}} />
                                                <FormProceedButton text={isUpdatingBudgetSpend ? 'Saving' : 'Save'} disabled={isUpdatingBudgetSpend} onClick={() => handleSubmit('update')} />
                                            </div>
                                        </li>
                                    ) :
                                    (
                                        <li key={i} className='px-4 flex items-center'>
                                            <span className='px-1 flex-1 text-center'>{formatAmount(spend.spend)}</span>
                                            <span className='py-4 flex-1 text-center'>{formatAmount(spend.remaining)}</span>
                                            <span className='py-4 flex-1 text-center'>{spend.date}</span>
                                            <span className='py-4 flex-1 text-center'>{spend.user}</span>
                                            <span className='py-4 flex-[0.4_1] text-center'>
                                                <OptionsDropdown options={itemOptions(spend.id, i)} />
                                            </span>
                                        </li>
                                    )
                                );
                            })
                        }
                        {
                            newFieldAdded &&
                            <li className='px-4 flex gap-6 items-center'>
                                <span className='px-1 flex-1 text-center'>
                                    <input type="text" name='spend' value={newBudgetSpend?.spend} onChange={handleChange} className='p-2 outline-none rounded-lg border border-border-gray w-full' />
                                </span>
                                <span className='px-1 flex-1 text-center'>
                                    <input type="text" name='remaining' value={newBudgetSpend?.remaining} disabled className='p-2 outline-none rounded-lg border border-border-gray w-full' />
                                </span>
                                <div className='py-4 flex-1 flex gap-4 text-center'>
                                    <FormCancelButton text={'Discard'} colorBlack={true} onClick={() => setNewBudgetSpend(null)} />
                                    <FormProceedButton text={isAddingBudgetSpend ? 'Adding' : 'Add'} disabled={isAddingBudgetSpend} onClick={() => handleSubmit('add')} />
                                </div>
                            </li>
                        }
                    </ul>
                </div>
                {
                    !newFieldAdded &&
                    <AddNewButton small={true} text={'Add new'} onClick={() => setNewBudgetSpend({spend: '', remaining: formatAmount(remainingBudget)})} />
                }
            </div>
        </div>
    );
}

function MilestonesTable({ milestones, type, onAddMilestone, onMilestoneChange, onRemoveMilestone, mode, editable = false}) {
    const {bag: {initiativeId = null}} = useContext(StrategyDrawerContext);
    const [focusedMilestone, setFocusedMilestone] = useState(mode === 'add' ? milestones.length - 1 : null);
    const [addNewClicked, setAddNewClicked] = useState(false);
    const [showSaveButton, setShowSaveButton] = useState(false);
    const {id: strategyId} = useParams();

    // add, update, delete milestone mutations
    const {isPending: isAddingMilestone, mutate: addMilestone} = useAddMilestone(initiativeId, {onSuccess, onError, onSettled});
    const {isPending: isUpdatingMilestone, mutate: updateMilestone} = useUpdateMilestone({onSuccess, onError, onSettled});
    const {isPending: isUpdatingMilestoneStatus, mutate: updateMilestoneStatus} = useUpdateMilestoneStatus({onSuccess, onError});
    const {isPending: isDeletingMilestone, mutate: deleteMilestone} = useDeleteMilestone({onSuccess, onError, onSettled});

    const dispatchMessage = useDispatchMessage();
    const queryClient = useQueryClient();
    useEffect(() => {
        let text = isAddingMilestone ? 'Adding milestone' : (isUpdatingMilestone ? 'Updating milestone' : (isUpdatingMilestoneStatus ? 'Updating milestone status' : 'Deleting milestone'));
        (isAddingMilestone || isUpdatingMilestone || isUpdatingMilestoneStatus || isDeletingMilestone) && dispatchMessage('processing', text);
    }, [isAddingMilestone, isUpdatingMilestone, isUpdatingMilestoneStatus, isDeletingMilestone]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['strategies', Number(strategyId), 'initiatives', Number(initiativeId)]});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // set focused milestone to null if successful
        if (!error) setFocusedMilestone(null);
    }

    useEffect(() => {
        if (mode !== 'add') {
            if (focusedMilestone !== null) setShowSaveButton(true);
            else setShowSaveButton(false);
        }
    }, [focusedMilestone, mode]);

    useEffect(() => {
        if (addNewClicked) {
            setFocusedMilestone(milestones.length - 1);
            setAddNewClicked(false);
        }
    }, [addNewClicked]);

    function handleSaveChanges(index) {
        const focusedMilestone = milestones.find((m, i) => i === index);
        const {id = null, start_date, end_date, milestone, description, weight} = focusedMilestone;
        if (id) {
            // update existing milestone
            updateMilestone({id, data: {start_date, end_date, milestone: type === 'quantitative' ? convertToNumber(milestone) : description, weight}});
        } else {
            // add new milestone to server
            addMilestone({data: {start_date, end_date, milestone: type === 'quantitative' ? convertToNumber(milestone) : description, weight}});
        }
    }

    function handleUpdateMilestoneStatus(milestone, newStatus) {
        updateMilestoneStatus({id: milestone.id, data: {status: newStatus}});
    }

    function handleDelete(index) {
        const focusedMilestone = milestones.find((m, i) => i === index);
        if (focusedMilestone.id) {
            // remove persisted milestone from server
            deleteMilestone({id: focusedMilestone.id});
        } else {
            // remove non persisted milestone from form
            onRemoveMilestone(index);
        }
    }

    function handleAddNew() {
        onAddMilestone();
        setAddNewClicked(true);
    }

    function itemOptions(milestone, index) {
        let options = [];

        if (editable) {
            options.push({text: 'Edit', type: 'action', action: () => setFocusedMilestone(index)});
            options.push({text: 'Delete', type: 'action', action: () => handleDelete(index)});
        } else {
            (milestone.status !== 'completed') && options.push({text: 'Completed', type: 'action', action: () => handleUpdateMilestoneStatus(milestone, 'completed')});
            (milestone.status !== 'ongoing') && options.push({text: 'Ongoing', type: 'action', action: () => handleUpdateMilestoneStatus(milestone, 'ongoing')});
            (milestone.status !== 'pending') && options.push({text: 'Pending', type: 'action', action: () => handleUpdateMilestoneStatus(milestone, 'pending')});
        }

        return options;
    }

    let indexOfEditableMilestone = null;
    if (editable && focusedMilestone !== null) indexOfEditableMilestone = focusedMilestone;
    
    
    return (
        <div>
            <h4 className='font-medium'>Milestones</h4>
            <div className='mt-3 p-6 flex flex-col gap-6 rounded-lg border border-[#CCC] text-[#3B3B3B] text-sm'>
                <div>
                    <header className='px-4 border-b border-b-[#B7B7B7] flex'>
                        <span className='py-4 flex-1 text-center'>Start Date</span>
                        <span className='py-4 flex-1 text-center'>End Date</span>
                        <span className='py-4 flex-1 text-center'>{type === 'quantitative' ? 'Milestone' : 'Description'}</span>
                        <span className='py-4 flex-[.5_1] text-center'>Weight</span>
                        {
                            mode === 'view' &&
                            <span className='py-4 flex-1 text-center'>Status</span>
                        }
                        <span className='flex-[0.4_1] text-center'></span>
                    </header>
                    <ul className='flex flex-col'>
                        {
                            milestones.map((milestone, i) => {
                                return (
                                    <li key={i} className='px-4 flex items-center'>
                                        <span className='px-1 flex-1 text-center'>
                                            {
                                                i === indexOfEditableMilestone ? 
                                                <input type="date" name='start_date' value={milestone.start_date} onChange={(e) => onMilestoneChange(e, i)} className='p-2 outline-none rounded-lg border border-border-gray w-full' /> :
                                                milestone.start_date
                                            }
                                        </span>
                                        <span className='px-1 flex-1 text-center'>
                                            {
                                                i === indexOfEditableMilestone ?
                                                <input type="date" name='end_date' value={milestone.end_date} onChange={(e) => onMilestoneChange(e, i)} className='p-2 outline-none rounded-lg border border-border-gray w-full' /> :
                                                milestone.end_date
                                            }
                                        </span>
                                        <span className='px-1 flex-1 text-center'>
                                            {
                                                i === indexOfEditableMilestone ?
                                                (
                                                    type === 'quantitative' ?
                                                    <input type="text" name='milestone' value={milestone.milestone} onChange={(e) => onMilestoneChange(e, i)} className='p-2 outline-none rounded-lg border border-border-gray w-full' /> :
                                                    <textarea rows={2} name='description' value={milestone.description} onChange={(e) => onMilestoneChange(e, i)} className='resize-none p-2 outline-none rounded-lg border border-border-gray w-full' />
                                                ) :
                                                (
                                                    type === 'quantitative' ?
                                                    formatAmount(milestone.milestone) :
                                                    milestone.description
                                                )
                                            }
                                        </span>
                                        <span className='px-1 flex-[.5_1] text-center'>
                                            {
                                                i === indexOfEditableMilestone ?
                                                <input type="number" name='weight' value={milestone.weight} onChange={(e) => onMilestoneChange(e, i)} className='p-2 outline-none rounded-lg border border-border-gray w-full' /> :
                                                milestone.weight
                                            }
                                        </span>
                                        {
                                            mode === 'view' &&
                                            <span className='px-1 flex-1 text-center capitalize'>
                                                {milestone.status}
                                            </span>
                                        }
                                        <span className='py-4 flex-[0.4_1] text-center'>
                                            <OptionsDropdown options={itemOptions(milestone, i)} />
                                        </span>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
                {(editable && !showSaveButton) && <AddNewButton small={true} text={'Add new'} onClick={handleAddNew} />}
                {
                    (editable && showSaveButton) &&
                    <div className='flex gap-6 px-6'>
                        <FormCancelButton text={'Discard'} onClick={() => setFocusedMilestone(null)} />
                        <FormProceedButton text={(isAddingMilestone || isUpdatingMilestone) ? 'Saving changes...' : 'Save changes'} disabled={isAddingMilestone || isUpdatingMilestone} onClick={() => handleSaveChanges(focusedMilestone)} />
                    </div>
                }
            </div>
        </div>
    );
}



function InitiativeHistory({initiativeId, onClose}) {
    const {isLoading, error, data: history} = useQuery(initiativeHistoryOptions(initiativeId));

    let content;

    if (isLoading) content = <div>Loading</div>
    else if (error) content = <div>Error</div>
    else if (history) {
        content = (
            <div className='py-[18px] px-6 flex flex-col gap-6'>
                <div className='flex justify-between items-center'>
                    <H3>{history[0].name} History</H3>
                    <button type="button" onClick={onClose} className='rounded-[4px] border border-[#CFCFCF]/50 py-1 px-3 flex gap-2 text-xs items-center'>
                        <img src={minimizeIcon} alt="" />
                        Close
                    </button>
                </div>
                <div className='overflow-auto w-full rounded-lg border border-[#CCC]'>
                    <div className='w-[2000px] p-6 rounded-lg text-[#3B3B3B] text-sm'>
                        <header className='w-full px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                            <span className='py-4 flex-[1_0_9rem]'>Change Date</span>
                            <span className='py-4 flex-[1_0_9rem]'>Name</span>
                            <span className='py-4 flex-[1.5_0_13rem]'>Description</span>
                            <span className='py-4 flex-[.8_0_7rem]'>Start Date</span>
                            <span className='py-4 flex-[.8_0_7rem]'>End Date</span>
                            <span className='py-4 flex-[.5_0_4rem]'>Weight</span>
                            <span className='py-4 flex-[.5_0_4rem]'>Budget</span>
                            <span className='py-4 flex-[1.5_0_13rem]'>Note</span>
                            <span className='py-4 flex-[1_0_9rem]'>User</span>
                        </header>
                        <ul className='flex flex-col'>
                            {
                                history.map((record, i) => {
                                    return (
                                        <li key={i}>
                                            <HistoryRecord record={record} />
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

    return createPortal(
        <div className='fixed z-40 top-0 left-0 w-full h-full bg-black/20 grid place-items-center p-4'>
            <div className='bg-white rounded-lg py-[18px] w-[1280px] mx-auto min-h-24 max-h-[500px] overflow-auto'>
                {content}
            </div>
        </div>,
        document.body
    );
}

function HistoryRecord({record}) {
    return (
        <div className='px-4 flex items-center gap-4'>
            <span className='py-4 flex-[1_0_9rem]'>{record['Change_date']}</span>
            <span className='py-4 flex-[1_0_9rem]'>{record['Name']}</span>
            <span className='py-4 flex-[1.5_0_13rem]'>{record['Description']}</span>
            <span className='py-4 flex-[.8_0_7rem]'>{record['Start_date']}</span>
            <span className='py-4 flex-[.8_0_7rem]'>{record['End_date']}</span>
            <span className='py-4 flex-[.5_0_4rem]'>{record['Weight']}</span>
            <span className='py-4 flex-[.5_0_4rem]'>{formatAmount(record['Budget'])}</span>
            <span className='py-4 flex-[1.5_0_13rem]'>{record['History_note']}</span>
            <span className='py-4 flex-[1_0_9rem]'>{record['User']}</span>
        </div>
    );
}

export default Initiative;