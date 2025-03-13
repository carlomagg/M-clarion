import { useContext, useEffect, useState } from 'react';
import styles from './Goal.module.css';
import { StrategyDrawerContext } from '../../../../pages/strategies/Index/Index';
import { Field, H3 } from '../../../Elements/Elements';
import SelectDropdown from '../../../dropdowns/SelectDropdown/SelectDropdown';
import { FormCancelButton, FormProceedButton } from '../../../buttons/FormButtons/FormButtons';
import { useParams } from 'react-router-dom';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalHistoryOptions, goalOptions, indicatorsOptions, strategyOptions, strategyThemesOptions, unitMeasuresOptions, useAddGoal, useAddPeriodicPortion, useDeleteGoal, useDeletePeriodicPortion, useUpdateGoal, useUpdatePeriodicPortion } from '../../../../../queries/strategies/strategy-queries';
import useDispatchMessage from '../../../../../hooks/useDispatchMessage';
import ActionsDropdown from '../../../dropdowns/ActionsDropdown/ActionsDropdown';
import AddNewButton from '../../../buttons/AddNewButton/AddNewButton';
import OptionsDropdown from '../../../dropdowns/OptionsDropdown/OptionsDropdown';
import { convertToNumber, formatAmount } from '../../../../../utils/helpers';
import { usersOptions } from '../../../../../queries/users-queries';
import { createPortal } from 'react-dom';
import minimizeIcon from '../../../../../assets/icons/minimize.svg';
import useConfirmedAction from '../../../../../hooks/useConfirmedAction';

function Goal() {
    const {removeDrawer, mode: initialMode, bag, onNewlyCreated} = useContext(StrategyDrawerContext);
    const [showHistory, setShowHistory] = useState(false);
    const [context, setContext] = useState({mode: initialMode, id: bag?.goalId});
    const {mode, id: goalId} = context;
    const {id: strategyId} = useParams();
    
    // fetch goal query if in view or edit mode
    const {isLoading, error, data: goal} = useQuery(goalOptions(strategyId, goalId, {enabled: !!goalId}));

    // add, update and delete goal and periodic portion mutation
    const {isPending: isAddingGoal, mutate: addGoal} = useAddGoal({onSuccess, onError, onSettled});
    const {isPending: isUpdatingGoal, mutate: updateGoal} = useUpdateGoal(goalId, {onSuccess, onError, onSettled});
    const {isPending: isDeletingGoal, mutate: deleteGoal} = useDeleteGoal(goalId, {onSuccess, onError, onSettled});
    const {isPending: isAddingPortion, mutate: addPeriodicPortion} = useAddPeriodicPortion(goalId, {onSuccess, onError});
    const {isPending: isUpdatingPortion, mutate: updatePeriodicPortion} = useUpdatePeriodicPortion({onSuccess, onError});
    const {isPending: isDeletingPortion, mutate: deletePeriodicPortion} = useDeletePeriodicPortion({onSuccess, onError});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage()
    useEffect(() => {
        let text = isAddingGoal ? 'Adding goal' : (isUpdatingGoal ? 'Updating goal' : (isDeletingGoal ? 'Deleting goal' : (isAddingPortion ? 'Adding periodic portion' : (isUpdatingPortion ? 'Updating periodic portion' : (isDeletingPortion && 'Deleting periodic portion')))));
        (isAddingGoal || isUpdatingGoal || isDeletingGoal || isAddingPortion || isUpdatingPortion || isDeletingPortion) && dispatchMessage('processing', text);
    }, [isAddingGoal, isUpdatingGoal, isDeletingGoal, isAddingPortion, isUpdatingPortion, isDeletingPortion]);

    async function onSuccess(data) {
        dispatchMessage('success', data.message);
        return await queryClient.invalidateQueries({queryKey: ['strategies', Number(strategyId)]});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // remove form pannel if successful
        if (!error) removeDrawer();
    }

    if ((mode === 'view' || mode === 'edit') && isLoading) return <div>Loading</div>
    if ((mode === 'view' || mode === 'edit') && error) return <div>error</div>

    return (
        <div className='flex flex-col gap-6 h-full overflow-auto'>
            {
                showHistory && <GoalHistory goalId={goalId} onClose={() => setShowHistory(false)} />
            }
            {
                mode === 'view' ?

                <GoalView goal={goal} onEditClicked={() => setContext({mode: 'edit', id: goalId})} onDeleteClicked={deleteGoal} onHistoryClicked={() => setShowHistory(true)} /> :

                <GoalForm mode={mode} goal={goal} onAddGoal={addGoal} onUpdateGoal={updateGoal} onDeleteGoal={deleteGoal} {...{isAddingGoal, isUpdatingGoal}} onAddPeriodicPortion={addPeriodicPortion} onUpdatePeriodicPortion={updatePeriodicPortion} onDeletePeriodicPortion={deletePeriodicPortion} />
            }
        </div>
    );
}

function GoalView({goal, onEditClicked, onDeleteClicked, onHistoryClicked}) {
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
                <H3>Strategic Goal</H3>
                <ActionsDropdown label={'Actions'} items={actions} />
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Goal Name</h4>
                <p>{goal.name}</p>
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Description</h4>
                <p>{goal.description}</p>
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Theme</h4>
                <p>{goal.theme_id}</p>
            </div>
            <div className='flex gap-6'>
                <div className='flex gap-3 flex-1 items-center'>
                    <span className='font-medium whitespace-nowrap'>Objective Status:</span>
                    <span className='font-medium text-sm bg-[#D5D5D5] px-2 py-1 rounded-full whitespace-nowrap'>0% Completion</span>
                </div>
                <div className='flex gap-3 flex-1 items-center'>
                    <span className='font-medium'>Result:</span>
                    <span className='font-medium text-sm bg-[#D5D5D5] px-2 py-1 rounded-full whitespace-nowrap'>{goal.result}% Success</span>
                </div>
            </div>
            <hr className='bg-[#CCC]' />
            <div className='flex gap-6'>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Indicator</h4>
                    <p>{goal.kpi.name}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Unit Measure</h4>
                    <p>{goal.unit_measure.name}</p>
                </div>
            </div>
            <PortionsTable portions={goal.portion_distribution} />
            <div className='space-y-3'>
                <h4 className='font-medium'>Overall Target</h4>
                <p>{formatAmount(goal.overall_target)}</p>
            </div>
            <hr className='bg-[#CCC]' />
            <div className='space-y-3'>
                <h4 className='font-medium'>Note</h4>
                <p>{goal.note}</p>
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Owner{goal.owners.length > 1}</h4>
                <OwnersList owners={goal.owners} />
            </div>
        </div>
    );
}

function GoalForm({mode, goal = null, onAddGoal, onUpdateGoal, isAddingGoal, isUpdatingGoal, onUpdatePeriodicPortion, onAddPeriodicPortion, onDeletePeriodicPortion}) {
    const {removeDrawer, bag: {componentId = null}} = useContext(StrategyDrawerContext);
    const {id: strategy_id} = useParams();
    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useState({
        strategy_id,
        component_id: goal?.component_id || componentId,
        theme_id: goal?.theme_id || '',
        name: goal?.name || '',
        description: goal?.description || '',
        kpi: goal?.kpi.id || '',
        unit_measure: goal?.unit_measure.id || '',
        allocate_periodic_portions: goal?.allocate_periodic_portions || false,
        portion_distribution: goal?.portion_distribution.map(p => ({...p, baseline: formatAmount(p.baseline), target: formatAmount(p.target)})) || [],
        baseline: '',
        target: '',
        overall_target: goal?.overall_target || '',
        note: goal?.note || '',
        owner_ids: goal?.owners.map(o => o.id) || []
    });
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedUsersJSX, setSelectedUsersJSX] = useState('');

    useEffect(() => {
        setFormData({
            ...formData,
            owner_ids: selectedUsers.map(u => u.id)
        });

        setSelectedUsersJSX(
            <OwnersList owners={selectedUsers} editable={true} onRemoveOwner={handleRemoveOwner} />
        );
    }, [selectedUsers]);

    // themes, indicators, unitmeasures, parentStrategy and users queries
    const [themesQuery, indicatorsQuery, unitMeasuresQuery, strategyQuery, usersQuery] = useQueries({
        queries: [strategyThemesOptions(strategy_id), indicatorsOptions(), unitMeasuresOptions(), strategyOptions(strategy_id), usersOptions()],
    });

    // add the first portion in the portion distribution table. the portion year is the strategy start year. this is not applicable in edit mode
    useEffect(() => {strategyQuery.data && mode === 'add' && addPortion();}, [strategyQuery.data]);

    // when allocating periodic portions, set the overall target to the target of the last portion
    useEffect(() => {
        if (formData.allocate_periodic_portions) {
            const lastPortion = formData.portion_distribution.slice(-1)[0];
            setFormData({
                ...formData,
                overall_target: formatAmount(lastPortion.target)
            });
        }
    }, [formData.allocate_periodic_portions, formData.portion_distribution]);

    // set current owners in edit mode
    useEffect(() => {
        if (usersQuery.data && goal) {
            let currentOwners = [];
            let ownerIds = new Set(goal.owners.map(o => o.id));

            usersQuery.data.forEach(u => {
                if (ownerIds.has(u.user_id)) {
                    currentOwners.push({id: u.user_id, name: (!u.firstname && !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`});
                }
            })
            setSelectedUsers(currentOwners);
        }
    }, [usersQuery.data, goal]);

    function handleChange(e) {
        const {name, value} = e.target;
        if (e.target.type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: !!e.target.checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: name === 'baseline' || name === 'target' ? formatAmount(value) : value
            });
        }
    }

    function addPortion() {
        const year = new Date(strategyQuery.data.strategy_start_date).getFullYear();
        const period = year + formData.portion_distribution.length;
        const portion = 0;
        const portionsCount = formData.portion_distribution.length;
        const baseline = portionsCount > 0 ? formData.portion_distribution[portionsCount - 1].target : '';
        const target = '';

        const newFormData = {
            ...formData,
            portion_distribution: [...formData.portion_distribution, {period, baseline, target, portion}]
        };

        setFormData(newFormData);
    }

    function handleRemovePortion(index) {
        const periodicPortion = formData.portion_distribution.find((p,i) => i === index);
        if (periodicPortion.id) {
            // existing portion, remove from server
            onDeletePeriodicPortion({id: periodicPortion.id});
        } else {
            // new portion, remove from form
            const newFormData = {
                ...formData,
                portion_distribution: formData.portion_distribution.filter((p, i) => i !== index).map((p, i) => {
                    return i >= index ? {...p, period: p.period - 1} : p;
                })
            };
            setFormData(newFormData);
        }

    }

    function handleSavePeriodicPortionChanges(index) {
        const periodicPortion = formData.portion_distribution.find((p,i) => i === index);
        const {id = null, period, baseline, target, portion} = periodicPortion;
        if (id) { 
            // update existing portion
            onUpdatePeriodicPortion({id, data: {period, baseline: convertToNumber(baseline), target: convertToNumber(target), portion}});
        } else {
            // add new periodic portion
            onAddPeriodicPortion({data: {period, baseline: convertToNumber(baseline), target: convertToNumber(target), portion}})
        }
    }

    function handlePortionChange(e, index) {
        const {name, value} = e.target;
        const formattedValue = formatAmount(value);

        // update the percentage for each portion. the percentage for each portion is calculated as the ratio of increase in the particular portion to the total increase * 100. the following get the total increase.
        let totalIncrease = formData.portion_distribution
        .map((p, i) => {
            let target, baseline;
            if (i === index) {
                target = convertToNumber(name === 'target' ? value : p.target);;
                baseline = convertToNumber(name === 'baseline' ? value : p.baseline);
            } else {
                target = convertToNumber(p.target);
                baseline = convertToNumber(p.baseline);
            }
            return target - baseline;
        })
        .reduce((x, y) => x + y, 0);
        
        const newFormData = {
            ...formData,
            portion_distribution: formData.portion_distribution.map((dist, i) => {
                let newDist;
                if (index === i) {
                    newDist = {
                        ...dist,
                        [name]: formattedValue
                    }
                } else newDist = dist;

                let newPercentage = Number((convertToNumber(newDist.target) - convertToNumber(newDist.baseline)) * 100 / totalIncrease).toFixed(2);
                return {...newDist, portion: newPercentage};
            })
        }

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
        let sanitizedFormData = {
            ...formData,
            baseline: formData.baseline ? convertToNumber(formData.baseline) : '',
            target: formData.target ? convertToNumber(formData.target) : '',
            portion_distribution: formData.portion_distribution.map(p => ({...p, baseline: convertToNumber(p.baseline), target: convertToNumber(p.target)})),
            overall_target: convertToNumber(formData.overall_target)
        }
        mode === 'add' ? onAddGoal({data: sanitizedFormData}) : onUpdateGoal({data: sanitizedFormData});
    }

    const isLoading = themesQuery.isLoading || indicatorsQuery.isLoading || unitMeasuresQuery.isLoading || strategyQuery.isLoading || usersQuery.isLoading;
    const error = themesQuery.error || indicatorsQuery.error || unitMeasuresQuery.error || strategyQuery.error || usersQuery.error;

    if (isLoading) return <div>Loading</div>
    if (error) return <div>Error</div>

    const themes = themesQuery.data.map(t => ({id: t.id, text: t.name}));
    const indicators = indicatorsQuery.data.map(i=> ({id: i.id, text: i.name}));
    const unitMeasures = unitMeasuresQuery.data.map(u => ({id: u.id, text: u.name}));
    const users = usersQuery.data.map(u => ({id: u.user_id, text: (!u.firstname || !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`}));

    return (
        <form className='flex flex-col gap-2 justify-between'>
            <div className='flex flex-col p-6 gap-6'>
                <H3>Strategic Goal</H3>
                <Field {...{label: 'Goal Name', name: 'name', value: formData.name, onChange: handleChange, placeholder: 'Enter goal name', error: validationErrors['name']}} />
                <Field {...{type: 'textbox', label: 'Description', name: 'description', value: formData.description, onChange: handleChange, placeholder: 'Enter description', error: validationErrors['description'], height: '100'}} />
                <ThemesDropdown themes={themes} selected={formData.theme_id} onChange={handleChange} />
                <div className='flex gap-6'>
                    <IndicatorDropdown indicators={indicators} selected={formData.kpi} onChange={handleChange} />
                    <UnitMeasureDropdown unitMeasures={unitMeasures} selected={formData.unit_measure} onChange={handleChange} />
                </div>
                <label className='flex gap-2'>
                    <input type="checkbox" name="allocate_periodic_portions" checked={formData.allocate_periodic_portions} onChange={handleChange} />
                    <span>Allocate Periodic Portions</span>
                </label>
                {
                    formData.allocate_periodic_portions ?
                    <div className='flex flex-col gap-6'>
                        <PortionsTable mode={mode} onAddPortion={addPortion} onSaveChanges={handleSavePeriodicPortionChanges} onRemovePortion={handleRemovePortion} onPortionChange={handlePortionChange} portions={formData.portion_distribution} editable={true} />
                        <Field {...{label: 'Overall Target', name: 'overall_target', value: formData.overall_target, disabled: true,  error: validationErrors['overall_target']}} />
                    </div> :
                    <div className='flex gap-6'>
                        <Field {...{label: 'Baseline', name: 'baseline', value: formData.baseline, onChange: handleChange,  error: validationErrors['baseline']}} />
                        <Field {...{label: 'Target', name: 'target', value: formData.target, onChange: handleChange,  error: validationErrors['target']}} />
                    </div>
                }
                <Field {...{type: 'textbox', label: 'Note', name: 'note', value: formData.note, onChange: handleChange, placeholder: 'Add note', error: validationErrors['note'], height: '100'}} />
                <OwnerDropdown users={users} onSelectOwner={handleSelectOwner} selectedUsersJSX={selectedUsersJSX} />
            </div>
            <div className='flex gap-6 px-6'>
                <FormCancelButton text={'Discard'} colorBlack={true} onClick={removeDrawer} />
                <FormProceedButton text={isAddingGoal || isUpdatingGoal ? 'Saving changes...' : 'Save changes'} disabled={isAddingGoal || isUpdatingGoal} onClick={handleSubmit} />
            </div>
        </form>
    );
}

function ThemesDropdown({themes, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Theme'} placeholder={'Choose Theme'} items={themes} name={'theme_id'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

function IndicatorDropdown({indicators, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Indicator'} placeholder={'Choose Indicator'} items={indicators} name={'kpi'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
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

function PortionsTable({portions, onAddPortion, onPortionChange, onRemovePortion, onSaveChanges, mode, editable = false}) {
    const [focusedPortion, setFocusedPortion] = useState(mode === 'add' ? portions.length - 1 : null);
    const [showSaveButton, setShowSaveButton] = useState(false);
    const [addNewClicked, setAddNewClicked] = useState(false);

    function itemOptions(index) {
        let options = [];

        if (editable) {
            options.push({text: 'Edit', type: 'action', action: () => setFocusedPortion(index)});
            options.push({text: 'Delete', type: 'action', action: () => onRemovePortion(index)});
        }
        else options.push({text: 'Completed', type: 'action', action: () => console.log('completed clicked')},);

        return options;
    }

    useEffect(() => {
        if (mode !== 'add') {
            if (focusedPortion !== null) setShowSaveButton(true);
            else setShowSaveButton(false);
        }
    }, [focusedPortion, mode]);

    useEffect(() => {
        if (addNewClicked) {
            setFocusedPortion(portions.length - 1);
            setAddNewClicked(false);
        }
    }, [addNewClicked]);

    function handleAddNew() {
        onAddPortion();
        setAddNewClicked(true);
    }

    let indexOfEditablePortion = null;
    if (editable && focusedPortion !== null) indexOfEditablePortion = focusedPortion;
    
    return (
        <div>
            <h4 className='font-medium'>Portion Distribution</h4>
            <div className='mt-3 p-6 flex flex-col gap-6 rounded-lg border border-[#CCC] text-[#3B3B3B] text-sm'>
                <div>
                    <header className='px-4 border-b border-b-[#B7B7B7] flex'>
                        <span className='py-4 flex-1 text-center'>Period</span>
                        <span className='py-4 flex-[1.2_1] text-center'>Basline</span>
                        <span className='py-4 flex-[1.2_1] text-center'>Target</span>
                        <span className='py-4 flex-1 text-center'>Portion</span>
                        <span className='flex-[0.4_1] text-center'></span>
                    </header>
                    <ul className='flex flex-col'>
                        {
                            portions.map((portion, i) => {
                                return (
                                    <li key={i} className='px-4 flex items-center'>
                                        <span className='py-4 flex-1 text-center'>{portion.period}</span>
                                        <span className='px-1 flex-[1.2_1] text-center'>
                                            {
                                                i === indexOfEditablePortion ?
                                                <input type="text" name='baseline' value={portion.baseline} onChange={(e) => onPortionChange(e, i)} className='p-2 outline-none rounded-lg border border-border-gray w-full' /> :
                                                formatAmount(portion.baseline)
                                            }
                                        </span>
                                        <span className='px-1 flex-[1.2_1] text-center'>
                                            {
                                                i === indexOfEditablePortion ?
                                                <input type="text" name='target' value={portion.target} onChange={(e) => onPortionChange(e, i)} className='p-2 outline-none rounded-lg border border-border-gray w-full' /> :
                                                formatAmount(portion.target)
                                            }
                                        </span>
                                        <span className='py-4 flex-1 text-center'>{portion.portion}%</span>
                                        <span className='py-4 flex-[0.4_1] text-center'>
                                            <OptionsDropdown options={itemOptions(i)} />
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
                        <FormCancelButton text={'Discard'} onClick={() => setFocusedPortion(null)} />
                        <FormProceedButton text={false ? 'Saving changes...' : 'Save changes'} disabled={false} onClick={() => onSaveChanges(focusedPortion)} />
                    </div>
                }
            </div>
        </div>
    );
}

function GoalHistory({goalId, onClose}) {
    const {isLoading, error, data: history} = useQuery(goalHistoryOptions(goalId));

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
                    <div className='w-[1800px] p-6 rounded-lg text-[#3B3B3B] text-sm'>
                        <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                            <span className='py-4 flex-[1_0_9rem]'>Change Date</span>
                            <span className='py-4 flex-[1_0_9rem]'>Name</span>
                            <span className='py-4 flex-[1.5_0_13rem]'>Description</span>
                            <span className='py-4 flex-[.8_0_7rem]'>Theme</span>
                            <span className='py-4 flex-[1_0_7rem]'>Indicator</span>
                            <span className='py-4 flex-[.8_0_7rem]'>Unit Measure</span>
                            <span className='py-4 flex-[.8_0_7rem]'>Target (overall)</span>
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
            <span className='py-4 flex-[1_0_9rem]'>{record['change_date']}</span>
            <span className='py-4 flex-[1_0_9rem]'>{record['name']}</span>
            <span className='py-4 flex-[1.5_0_13rem]'>{record['description']}</span>
            <span className='py-4 flex-[.8_0_7rem]'>{record['theme']}</span>
            <span className='py-4 flex-[1_0_7rem]'>{record['indicator']}</span>
            <span className='py-4 flex-[.8_0_7rem]'>{record['unit_measure']}</span>
            <span className='py-4 flex-[.8_0_7rem]'>{record['target']}</span>
            <span className='py-4 flex-[1.5_0_13rem]'>{record['note']}</span>
            <span className='py-4 flex-[1_0_9rem]'>{record['user']}</span>
        </div>
    );
}

export default Goal;