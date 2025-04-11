import { useContext, useEffect, useState } from 'react';
import styles from './Tactic.module.css';
import { StrategyDrawerContext } from '../../../../pages/strategies/Index/Index';
import { Field, H3 } from '../../../Elements/Elements';
import SelectDropdown from '../../../dropdowns/SelectDropdown/SelectDropdown';
import { FormCancelButton, FormProceedButton } from '../../../buttons/FormButtons/FormButtons';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tacticHistoryOptions, tacticOptions, useAddTactic, useDeleteTactic, useUpdateTactic } from '../../../../../queries/strategies/strategy-queries';
import useDispatchMessage from '../../../../../hooks/useDispatchMessage';
import ActionsDropdown from '../../../dropdowns/ActionsDropdown/ActionsDropdown';
import { usersOptions } from '../../../../../queries/users-queries';
import { createPortal } from 'react-dom';
import minimizeIcon from '../../../../../assets/icons/minimize.svg';
import CurrentValuesTable from '../globals/CurrentValueTable';

function Tactic() {
    const {removeDrawer, mode: initialMode, bag} = useContext(StrategyDrawerContext);
    const [showHistory, setShowHistory] = useState(false);
    const [context, setContext] = useState({mode: initialMode, id: bag?.tacticId});
    const {mode, id: tacticId} = context;
    const {id: strategyId} = useParams();
    const {initiativeId = null} = bag;
    
    // fetch tactic query if in view or edit mode
    const {isLoading, error, data: tactic} = useQuery(tacticOptions(strategyId, tacticId, {enabled: !!tacticId}));

    // add, update, delete tactic mutations
    const {isPending: isAddingTactic, mutate: addTactic} = useAddTactic(initiativeId, {onSuccess, onError, onSettled});
    const {isPending: isUpdatingTactic, mutate: updateTactic} = useUpdateTactic(tacticId, {onSuccess, onError, onSettled});
    const {isPending: isDeletingTactic, mutate: deleteTactic} = useDeleteTactic(tacticId, {onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage()
    useEffect(() => {
        let text = isAddingTactic ? 'Adding tactic' : (isUpdatingTactic ? 'Updating tactic' : 'Deleting tactic');
        (isAddingTactic || isUpdatingTactic || isDeletingTactic) && dispatchMessage('processing', text);
    }, [isAddingTactic, isUpdatingTactic, isDeletingTactic]);

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

    if ((mode === 'view' || mode === 'edit') && isLoading) return <div>Loading</div>
    if ((mode === 'view' || mode === 'edit') && error) return <div>error</div>


    return (
        <div className='flex flex-col gap-6 h-full overflow-auto'>
            {
                showHistory && <TacticHistory tacticId={tacticId} onClose={() => setShowHistory(false)} />
            }
            {
                mode === 'view' ?
                <TacticView tactic={tactic} onEditClicked={() => setContext({mode: 'edit', id: tacticId})} onDeleteClicked={deleteTactic} onHistoryClicked={() => setShowHistory(true)} /> :

                <TacticForm mode={mode} tactic={tactic} onAddTactic={addTactic} onUpdateTactic={updateTactic} {...{isAddingTactic, isUpdatingTactic}} />
            }
        </div>
    );
}

function TacticView({tactic, onEditClicked, onDeleteClicked, onHistoryClicked}) {

    const actions = [
        {text: 'Edit', type: 'action', onClick: onEditClicked , permission: 'edit_subsidiary'},
        {text: 'Delete', type: 'action', onClick: onDeleteClicked, permission: 'delete_subsidiary'},
        {text: 'View History', type: 'action', onClick: onHistoryClicked , permission: 'edit_subsidiary'},
    ];

    return (       
        <div className='flex flex-col p-6 gap-6'>
            <div className='flex justify-between pr-14'>
                <H3>Tactic</H3>
                <ActionsDropdown label={'Actions'} items={actions} />
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Task</h4>
                <p>{tactic.strategic_tactic}</p>
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Description</h4>
                <p>{tactic.st_description}</p>
            </div>
            <div className='flex gap-6'>
                <div className='flex gap-3 flex-1 items-center'>
                    <span className='font-medium whitespace-nowrap'>Tactic Status:</span>
                    <span className='font-medium text-sm bg-[#D5D5D5] px-2 py-1 rounded-full whitespace-nowrap'>0% Completion</span>
                </div>
                <div className='flex gap-3 flex-1 items-center'>
                    <span className='font-medium'>Result:</span>
                    <span className='font-medium text-sm bg-[#D5D5D5] px-2 py-1 rounded-full whitespace-nowrap'>{tactic.result_indicator}% Success</span>
                </div>
            </div>
            <div className='flex gap-[18px]'>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Start Date</h4>
                    <p>{tactic.start_date}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>End Date</h4>
                    <p>{tactic.end_date}</p>
                </div>
            </div>
            <hr className='bg-[#CCC]' />
            <div className='flex gap-[18px]'>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Target (Completion Count)</h4>
                    <p>{tactic.target}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Weight</h4>
                    <p>{tactic.weight}</p>
                </div>
            </div>
            <CurrentValuesTable values={tactic.current_values} type='tactic' />
            <hr className='bg-[#CCC]' />
            <div className='space-y-3'>
                <h4 className='font-medium'>Note</h4>
                <p>{tactic.note}</p>
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Owner{tactic.owners.length > 1}</h4>
                <OwnersList owners={tactic.owners} />
            </div>
        </div>
    );
}

function TacticForm({tactic = null, mode, onAddTactic, onUpdateTactic, isAddingTactic, isUpdatingTactic}) {
    const {removeDrawer} = useContext(StrategyDrawerContext);
    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useState({
        task: tactic?.strategic_tactic || '',
        description: tactic?.st_description || '',
        target: tactic?.target || '',
        weight: tactic?.weight || '',
        start_date: tactic?.start_date || '',
        end_date: tactic?.end_date || '',
        note: tactic?.note || '',
        owner_ids: tactic?.owners.map(o => o.id) || []
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
    const usersQuery = useQuery(usersOptions());

    // set current owners in edit mode
    useEffect(() => {
        if (usersQuery.data && tactic) {
            let currentOwners = [];
            let ownerIds = new Set(tactic.owners.map(o => o.id));

            usersQuery.data.forEach(u => {
                if (ownerIds.has(u.user_id)) {
                    currentOwners.push({id: u.user_id, name: (!u.firstname && !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`});
                }
            })
            setSelectedUsers(currentOwners);
        }
    }, [usersQuery.data, tactic]);

    function handleChange(e) {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    }

    function handleSelectOwner(user) {
        if (selectedUsers.some(u => u.id === user.id)) return;
        setSelectedUsers([...selectedUsers, user]);
    }

    function handleRemoveOwner(user) {
        setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    }

    function handleSubmit() {
        mode === 'add' ? onAddTactic({data: formData}) : onUpdateTactic({data: formData});
    }

    const isLoading = usersQuery.isLoading;
    const error = usersQuery.error;

    if (isLoading) return <div>Loading</div>
    if (error) return <div>Error</div>

    const users = usersQuery.data.map(u => ({id: u.user_id, text: (!u.firstname || !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`}));

    return (
        <form className='flex flex-col gap-2 justify-between'>
            <div className='flex flex-col p-6 gap-6'>
                <H3>Tactic</H3>
                <Field {...{label: 'Task', name: 'task', value: formData.task, onChange: handleChange, placeholder: 'Enter task', error: validationErrors['task']}} />
                <Field {...{type: 'textbox', label: 'Description', name: 'description', value: formData.description, onChange: handleChange, placeholder: 'Enter description', error: validationErrors['description'], height: '100'}} />
                <div className='flex gap-[18px]'>
                    <Field {...{type: 'date', label: 'Start date', name: 'start_date', value: formData.start_date, onChange: handleChange,  error: validationErrors['start_date']}} />
                    <Field {...{type: 'date', label: 'End date', name: 'end_date', value: formData.end_date, onChange: handleChange, error: validationErrors['end_date']}} />
                </div>
                <div className='flex gap-6'>
                    <Field {...{type: 'number', label: 'Target (Completion Count)', name: 'target', value: formData.target, onChange: handleChange,  error: validationErrors['target']}} />
                    <Field {...{type: 'number', label: 'Weight', name: 'weight', value: formData.weight, onChange: handleChange,  error: validationErrors['weight']}} />
                </div>
                <Field {...{type: 'textbox', label: 'Note', name: 'note', value: formData.note, onChange: handleChange, placeholder: 'Add note', error: validationErrors['note'], height: '100'}} />
                <OwnerDropdown users={users} onSelectOwner={handleSelectOwner} selectedUsersJSX={selectedUsersJSX} />
            </div>
            <div className='flex gap-6 px-6'>
                <FormCancelButton text={'Discard'} colorBlack={true} onClick={removeDrawer} />
                <FormProceedButton text={isAddingTactic || isUpdatingTactic ? 'Saving changes...' : 'Save changes'} disabled={isAddingTactic || isUpdatingTactic} onClick={handleSubmit} />
            </div>
        </form>
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

function TacticHistory({tacticId, onClose}) {
    const {isLoading, error, data: history} = useQuery(tacticHistoryOptions(tacticId));

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
            <span className='py-4 flex-[1_0_9rem]'>{record['changed_date']}</span>
            <span className='py-4 flex-[1_0_9rem]'>{record['name']}</span>
            <span className='py-4 flex-[1.5_0_13rem]'>{record['description']}</span>
            <span className='py-4 flex-[.8_0_7rem]'>{record['start_date']}</span>
            <span className='py-4 flex-[.8_0_7rem]'>{record['end_date']}</span>
            <span className='py-4 flex-[.5_0_4rem]'>{record['target']}</span>
            <span className='py-4 flex-[.5_0_4rem]'>{record['weight']}</span>
            <span className='py-4 flex-[1.5_0_13rem]'>{record['note']}</span>
            <span className='py-4 flex-[1_0_9rem]'>{record['user']}</span>
        </div>
    );
}

export default Tactic;