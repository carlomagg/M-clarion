import { useContext, useEffect, useState } from 'react';
import styles from './Objective.module.css';
import { StrategyDrawerContext } from '../../../../pages/strategies/Index/Index';
import { Field, H3 } from '../../../Elements/Elements';
import SelectDropdown from '../../../dropdowns/SelectDropdown/SelectDropdown';
import { FormCancelButton, FormProceedButton } from '../../../buttons/FormButtons/FormButtons';
import { useParams } from 'react-router-dom';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { objectiveHistoryOptions, objectiveOptions, optimizationsOptions, unitMeasuresOptions, useAddObjective, useDeleteObjective, useUpdateObjective } from '../../../../../queries/strategies/strategy-queries';
import useDispatchMessage from '../../../../../hooks/useDispatchMessage';
import ActionsDropdown from '../../../dropdowns/ActionsDropdown/ActionsDropdown';
import { convertToNumber, formatAmount } from '../../../../../utils/helpers';
import { usersOptions } from '../../../../../queries/users-queries';
import { createPortal } from 'react-dom';
import minimizeIcon from '../../../../../assets/icons/minimize.svg';
import CurrentValuesTable from '../globals/CurrentValueTable';
import useConfirmedAction from '../../../../../hooks/useConfirmedAction';

function Objective() {
    const {removeDrawer, mode: initialMode, bag} = useContext(StrategyDrawerContext);
    const [showHistory, setShowHistory] = useState(false);
    const [context, setContext] = useState({mode: initialMode, id: bag?.objectiveId});
    const {mode, id: objectiveId} = context;
    const {id: strategyId} = useParams();
    
    // fetch objective query if in view or edit mode
    const {isLoading, error, data: objective} = useQuery(objectiveOptions(strategyId, objectiveId, {enabled: !!objectiveId}));

    // add, update, delete objective mutations
    const {isPending: isAddingObjective, mutate: addObjective} = useAddObjective({onSuccess, onError, onSettled});
    const {isPending: isUpdatingObjective, mutate: updateObjective} = useUpdateObjective(objectiveId, {onSuccess, onError, onSettled});
    const {isPending: isDeletingObjective, mutate: deleteObjective} = useDeleteObjective(objectiveId, {onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage()
    useEffect(() => {
        let text = isAddingObjective ? 'Adding objective' : (isUpdatingObjective ? 'Updating objective' : 'Deleting objective');
        (isAddingObjective || isUpdatingObjective || isDeletingObjective) && dispatchMessage('processing', text);
    }, [isAddingObjective, isUpdatingObjective, isDeletingObjective]);

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
                showHistory && <ObjectiveHistory objectiveId={objectiveId} onClose={() => setShowHistory(false)} />
            }
            {
                mode === 'view' ?
                <ObjectiveView objective={objective} onEditClicked={() => setContext({mode: 'edit', id: objectiveId})} onDeleteClicked={deleteObjective} onHistoryClicked={() => setShowHistory(true)} /> :
                <ObjectiveForm mode={mode} objective={objective} onAddObjective={addObjective} onUpdateObjective={updateObjective} {...{isAddingObjective, isUpdatingObjective}} /> 
            }
        </div>
    );
}

function ObjectiveView({objective, onEditClicked, onDeleteClicked, onHistoryClicked}) {
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
                <H3>Objective</H3>
                <ActionsDropdown label={'Actions'} items={actions} />
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Objective Name</h4>
                <p>{objective.name}</p>
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Description</h4>
                <p>{objective.description}</p>
            </div>
            <div className='flex gap-6'>
                <div className='flex gap-3 flex-1 items-center'>
                    <span className='font-medium whitespace-nowrap'>Initiative Status:</span>
                    <span className='font-medium text-sm bg-[#D5D5D5] px-2 py-1 rounded-full whitespace-nowrap'>0% Completion</span>
                </div>
                <div className='flex gap-3 flex-1 items-center'>
                    <span className='font-medium'>Result:</span>
                    <span className='font-medium text-sm bg-[#D5D5D5] px-2 py-1 rounded-full whitespace-nowrap'>{objective.result_indicator}% Success</span>
                </div>
            </div>
            <div className='flex gap-[18px]'>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Start Date</h4>
                    <p>{objective.start_date}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>End Date</h4>
                    <p>{objective.end_Date}</p>
                </div>
            </div>
            <hr className='bg-[#CCC]' />
            <div className='flex gap-6'>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Unit Measure</h4>
                    <p>{objective.unit_measure.name}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Optimization</h4>
                    <p>{objective.optimization.name}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Update Frequency</h4>
                    <p>{objective.update_frequency}</p>
                </div>
            </div>
            <div className='flex gap-6'>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Baseline</h4>
                    <p>{formatAmount(objective.baseline)}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Target</h4>
                    <p>{formatAmount(objective.target)}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Weight</h4>
                    <p>{objective.weight}</p>
                </div>
            </div>
            <CurrentValuesTable values={objective.current_values} type='objective' />
            <hr className='bg-[#CCC]' />
            <div className='space-y-3'>
                <h4 className='font-medium'>Note</h4>
                <p>{objective.note}</p>
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Owner{objective.owners.length > 1}</h4>
                <OwnersList owners={objective.owners} />
            </div>
        </div>
    );
}

function ObjectiveForm({objective = null, mode, onAddObjective, onUpdateObjective, isAddingObjective, isUpdatingObjective}) {
    const {removeDrawer, bag: {goalId = null}} = useContext(StrategyDrawerContext);
    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useState({
        goal_id: objective?.goal_id || goalId,
        name: objective?.name || '',
        description: objective?.description || '',
        start_date: objective?.start_date || '',
        end_date: objective?.end_Date || '',
        unit_measure: objective?.unit_measure.id || '',
        optimization: objective?.optimization.id || '',
        update_frequency: objective?.update_frequency || '',
        baseline: objective ? formatAmount(objective.baseline) : '',
        target: objective ? formatAmount(objective.target) : '',
        weight: objective?.weight || '',
        note: objective?.note || '',
        owner_ids: objective?.owners.map(o => o.id) || []
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

    // unitmeasures, optimizations and users queries
    const [unitMeasuresQuery, optimizationsQuery, usersQuery] = useQueries({
        queries: [unitMeasuresOptions(), optimizationsOptions(), usersOptions()],
    });

    // set current owners in edit mode
    useEffect(() => {
        if (usersQuery.data && objective) {
            let currentOwners = [];
            let ownerIds = new Set(objective.owners.map(o => o.id));

            usersQuery.data.forEach(u => {
                if (ownerIds.has(u.user_id)) {
                    currentOwners.push({id: u.user_id, name: (!u.firstname && !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`});
                }
            })
            setSelectedUsers(currentOwners);
        }
    }, [usersQuery.data, objective]);

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
        }
        console.log(sanitizedFormData)
        mode === 'add' ? onAddObjective({data: sanitizedFormData}) : onUpdateObjective({data: sanitizedFormData});
    }

    const isLoading = unitMeasuresQuery.isLoading || optimizationsQuery.isLoading || usersQuery.isLoading;
    const error = unitMeasuresQuery.error || optimizationsQuery.error || usersQuery.error;

    if (isLoading) return <div>Loading</div>
    if (error) return <div>Error</div>

    const unitMeasures = unitMeasuresQuery.data.map(u => ({id: u.id, text: u.name}));
    const optimizations = optimizationsQuery.data.map(o=> ({id: o.id, text: o.name}));
    const users = usersQuery.data.map(u => ({id: u.user_id, text: (!u.firstname || !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`}));

    return (
        <form className='flex flex-col gap-2 justify-between'>
            <div className='flex flex-col p-6 gap-6'>
                <H3>Objective</H3>
                <Field {...{label: 'Objective Name', name: 'name', value: formData.name, onChange: handleChange, placeholder: 'Enter objective name', error: validationErrors['name']}} />
                <Field {...{type: 'textbox', label: 'Description', name: 'description', value: formData.description, onChange: handleChange, placeholder: 'Enter description', error: validationErrors['description'], height: '100'}} />
                <div className='flex gap-6'>
                    <div className='flex gap-3 flex-1 items-center'>
                        <span className='font-medium whitespace-nowrap'>Initiative Status:</span>
                        <span className='font-medium text-sm bg-[#D5D5D5] px-2 py-1 rounded-full whitespace-nowrap'>0% Completion</span>
                    </div>
                    <div className='flex gap-3 flex-1 items-center'>
                        <span className='font-medium'>Result:</span>
                        <span className='font-medium text-sm bg-[#D5D5D5] px-2 py-1 rounded-full whitespace-nowrap'>0% Success</span>
                    </div>
                </div>
                <div className='flex gap-[18px]'>
                    <Field {...{type: 'date', label: 'Start date', name: 'start_date', value: formData.start_date, onChange: handleChange,  error: validationErrors['start_date']}} />
                    <Field {...{type: 'date', label: 'End date', name: 'end_date', value: formData.end_date, onChange: handleChange, error: validationErrors['end_date']}} />
                </div>
                <div className='flex gap-6'>
                    <UnitMeasureDropdown unitMeasures={unitMeasures} selected={formData.unit_measure} onChange={handleChange} />
                    <OptimizationsDropdown optimizations={optimizations} selected={formData.optimization} onChange={handleChange} />
                    <FrequencyDropdown selected={formData.update_frequency} onChange={handleChange} />
                </div>
                <div className='flex gap-6'>
                    <Field {...{label: 'Baseline', name: 'baseline', value: formData.baseline, onChange: handleChange,  error: validationErrors['baseline']}} />
                    <Field {...{label: 'Target', name: 'target', value: formData.target, onChange: handleChange,  error: validationErrors['target']}} />
                    <Field {...{label: 'Weight', type: 'number', name: 'weight', value: formData.weight, onChange: handleChange,  error: validationErrors['weight']}} />
                </div>
                <Field {...{type: 'textbox', label: 'Note', name: 'note', value: formData.note, onChange: handleChange, placeholder: 'Add note', error: validationErrors['note'], height: '100'}} />
                <OwnerDropdown users={users} onSelectOwner={handleSelectOwner} selectedUsersJSX={selectedUsersJSX} />
            </div>
            <div className='flex gap-6 px-6'>
                <FormCancelButton text={'Discard'} colorBlack={true} onClick={removeDrawer} />
                <FormProceedButton text={isAddingObjective || isUpdatingObjective ? 'Saving changes...' : 'Save changes'} disabled={isAddingObjective || isUpdatingObjective} onClick={handleSubmit} />
            </div>
        </form>
    );
}

function FrequencyDropdown({selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Update Frequency'} placeholder={'Frequency'} items={['Daily', 'Weekly', 'Monthly']} name={'update_frequency'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

function OptimizationsDropdown({optimizations, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Optimization'} placeholder={'Optimization'} items={optimizations} name={'optimization'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

function UnitMeasureDropdown({unitMeasures, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Unit Measure'} placeholder={'Unit Measure'} items={unitMeasures} name={'unit_measure'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
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

function ObjectiveHistory({objectiveId, onClose}) {
    const {isLoading, error, data: history} = useQuery(objectiveHistoryOptions(objectiveId));

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
                            <span className='py-4 flex-[.8_0_7rem]'>Unit Measure</span>
                            <span className='py-4 flex-[.8_0_7rem]'>Optimization</span>
                            <span className='py-4 flex-[.8_0_7rem]'>Start Date</span>
                            <span className='py-4 flex-[.8_0_7rem]'>End Date</span>
                            <span className='py-4 flex-[.5_0_4rem]'>Baseline</span>
                            <span className='py-4 flex-[.5_0_4rem]'>Target</span>
                            <span className='py-4 flex-[.5_0_4rem]'>Weight</span>
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
            <span className='py-4 flex-[1_0_9rem]'>{record['Change Date']}</span>
            <span className='py-4 flex-[1_0_9rem]'>{record['Name']}</span>
            <span className='py-4 flex-[1.5_0_13rem]'>{record['Description']}</span>
            <span className='py-4 flex-[.8_0_7rem]'>{record['Unit Measure']}</span>
            <span className='py-4 flex-[.8_0_7rem]'>{record['Optimization']}</span>
            <span className='py-4 flex-[.8_0_7rem]'>{record['Start Date']}</span>
            <span className='py-4 flex-[.8_0_7rem]'>{record['End Date']}</span>
            <span className='py-4 flex-[.5_0_4rem]'>{record['Baseline']}</span>
            <span className='py-4 flex-[.5_0_4rem]'>{record['Target']}</span>
            <span className='py-4 flex-[.5_0_4rem]'>{record['Weight']}</span>
            <span className='py-4 flex-[1.5_0_13rem]'>{record['Note']}</span>
            <span className='py-4 flex-[1_0_9rem]'>{record['User']}</span>
        </div>
    );
}

export default Objective;