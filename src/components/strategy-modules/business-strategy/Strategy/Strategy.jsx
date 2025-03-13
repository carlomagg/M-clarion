import { useContext, useEffect, useState } from 'react';
import styles from './Strategy.module.css';
import { addMonths, addYears, format } from 'date-fns';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { subsidiariesOptions } from '../../../../../queries/organization-queries';
import { analysisModelsOptions, strategiesOptions, strategyHistoryOptions, strategyOptions, useAddStrategy, useDeleteStrategy, useUpdateStrategy } from '../../../../../queries/strategies/strategy-queries';
import { Field, H3 } from '../../../Elements/Elements';
import SelectDropdown from '../../../dropdowns/SelectDropdown/SelectDropdown';
import { FormCancelButton, FormProceedButton } from '../../../buttons/FormButtons/FormButtons';
import { StrategyDrawerContext } from '../../../../pages/strategies/Index/Index';
import OptionsDropdown from '../../../dropdowns/OptionsDropdown/OptionsDropdown';
import ActionsDropdown from '../../../dropdowns/ActionsDropdown/ActionsDropdown';
import { createPortal } from 'react-dom';
import minimizeIcon from '../../../../../assets/icons/minimize.svg';
import useDispatchMessage from '../../../../../hooks/useDispatchMessage';
import useConfirmedAction from '../../../../../hooks/useConfirmedAction';

export function Strategy() {
    const {removeDrawer, mode: initialMode, bag, onNewlyCreated} = useContext(StrategyDrawerContext);
    const [context, setContext] = useState({mode: initialMode, id: bag?.strategyId});
    const queryClient = useQueryClient();

    const {mode, id: strategyId} = context;

    // fetch all strategies
    const strategiesQuery = useQuery(strategiesOptions());
    const strategyQuery = useQuery(strategyOptions(strategyId, {enabled: !!strategyId}));

    // add, update and delete strategy mutations
    const {isPending: isAddingStrategy, mutate: addStrategy} = useAddStrategy({onSuccess, onError, onSettled: onAddedSettled});
    const {isPending: isUpdatingStrategy, mutate: updateStrategy} = useUpdateStrategy(strategyId, {onSuccess, onError, onSettled});
    const {isPending: isDeletingStrategy, mutate: deleteStrategy} = useDeleteStrategy({onSuccess, onError});

    const dispatchMessage = useDispatchMessage()
    useEffect(() => {
        let text = isAddingStrategy ? 'Adding strategy' : (isUpdatingStrategy ? 'Updating strategy' : 'Delete strategy');
        (isAddingStrategy || isUpdatingStrategy || isDeletingStrategy) && dispatchMessage('processing', text);
    }, [isAddingStrategy, isUpdatingStrategy, isDeletingStrategy]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['strategies']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // remove form pannel if successful
        if (!error) removeDrawer();
    }
    function onAddedSettled(data, error) {
        // set newlyCreated strategy and remove strategy drawer if successful
        if (!error) {
            onNewlyCreated({type: 'strategy', bag: {components: data.components}});
            removeDrawer();
        }
    }

    const isLoading = strategiesQuery.isLoading || (strategyId && strategyQuery?.isLoading);
    const error = strategiesQuery.error || (strategyId && strategyQuery?.error);

    if (isLoading) {
        return <div>loading</div>
    }

    if (error) {
        return <div>error occured</div>
    }

    const strategies = strategiesQuery.data;

    return (
        <div className='flex flex-col gap-6 h-full overflow-auto'>
            {
                mode === 'view' ?
                <StrategyView strategy={strategyQuery?.data} onEditClicked={setContext} onDeleteClicked={deleteStrategy} /> :
                (
                    mode === 'edit' ?
                    <StrategyForm mode={mode} strategy={strategyQuery?.data} isPending={isAddingStrategy || isUpdatingStrategy} onAddStrategy={addStrategy} onUpdateStrategy={updateStrategy} /> :
                    (mode === 'add' && <StrategyForm mode={mode} onAddStrategy={addStrategy} onUpdateStrategy={updateStrategy} />)
                )
            }
            <StrategyTable strategies={strategies} setContext={setContext} onDeleteStrategy={deleteStrategy} />
        </div>
    )
}

function StrategyView({strategy, onEditClicked, onDeleteClicked}) {
    const {confirmAction, confirmationDialog} = useConfirmedAction();
    const actions = [
        {text: 'Edit', type: 'action', onClick: () => onEditClicked({mode: 'edit', id: strategy.strategy_id}), permission: 'edit_subsidiary'},
        {text: 'Delete', type: 'action', onClick: () => confirmAction(() => onDeleteClicked({id: strategy.strategy_id})), permission: 'delete_subsidiary'},
    ];

    return (       
        <div className='flex flex-col p-6 gap-6'>
            {confirmationDialog}
            <div className='flex justify-between pr-14'>
                <H3>Strategy</H3>
                <ActionsDropdown label={'Actions'} items={actions} />
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Strategy Name</h4>
                <p>{strategy.strategy_title}</p>
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Description</h4>
                <p>{strategy.strategy_description}</p>
            </div>
            <div className='flex gap-6'>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Subsidiary</h4>
                    <p>{strategy.sub_coy}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Strategy Model</h4>
                    <p>{strategy.analysis_model}</p>
                </div>
            </div>
            <hr className='bg-[#CCC]' />
            <div className='space-y-3'>
                <h4 className='font-medium'>Plan Period</h4>
                <p>{strategy.strategy_period}{' '}{strategy.period_unit}</p>
            </div>
            <div className='flex gap-[18px]'>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Start Date</h4>
                    <p>{strategy.strategy_start_date}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>End Date</h4>
                    <p>{strategy.strategy_end_date}</p>
                </div>
            </div>
            <hr className='bg-[#CCC]' />
            <div className='space-y-3'>
                <h4 className='font-medium'>Note</h4>
                <p>{strategy.strategy_note}</p>
            </div>
        </div>
    );
}

function StrategyForm({mode, strategy = null, isPending, onAddStrategy, onUpdateStrategy}) {
    const {removeDrawer, data} = useContext(StrategyDrawerContext);
    const [subsidiariesDropdownCollapsed, setSubsidiariesDropdownCollapsed] = useState(true);
    const [modelsDropdownCollapsed, setModelsDropdownCollapsed] = useState(true);
    const [durationUnitsDropdownCollapsed, setDurationUnitsDropdownCollapsed] = useState(true);
    const [formData, setFormData] = useState({
        subsidiary_id: strategy?.sub_coy || '',
        analysis_model_id: strategy?.analysis_model || '',
        name: strategy?.strategy_title || '',
        description: strategy?.strategy_description || '',
        period_duration: strategy?.strategy_period || '',
        period_unit: strategy?.period_unit || '',
        start_date: strategy?.strategy_start_date || '',
        end_date: strategy?.strategy_end_date || '',
        note: strategy?.strategy_note || '',
        freeze: false,
    });
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (!formData.start_date || !formData.period_duration || !formData.period_unit) return;

        let startDate = new Date(formData.start_date);
        let duration = Number(String(formData.period_duration).trim());
        let endDate = formData.period_unit === 'Years' ? addYears(startDate, duration) : addMonths(startDate, duration);

        setFormData({
            ...formData,
            end_date: format(endDate, 'yyyy-MM-dd') 
        })
    }, [formData.start_date, formData.period_unit, formData.period_duration]);

    // fetch subsidiaries and strategy models
    const [subsidiariesQuery, modelsQuery] = useQueries({
        queries: [
            subsidiariesOptions({enabled: mode === 'add' || (mode === 'edit' && !!strategy)}),
            analysisModelsOptions({enabled: mode === 'add' || (mode === 'edit' && !!strategy)}),
        ]
    });

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    function handleSubmit() {
        mode === 'add' ? onAddStrategy({data: formData}) : onUpdateStrategy({data: formData})
    }

    const isLoading = subsidiariesQuery.isLoading || modelsQuery.isLoading;
    const error = subsidiariesQuery.error || modelsQuery.error;

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    const subsidiaries = subsidiariesQuery.data.filter(s => s.status === 'Active').map(s => ({id: s.id, text: s.name}));
    
    const models = modelsQuery.data.map(m => ({id: m.analysis_model_id, text: m.analysis_model}));
    
    return (
        <form className='flex flex-col gap-2 justify-between'>
            <div className='flex flex-col p-6 gap-6'>
                <H3>Strategy</H3>
                <Field {...{label: 'Strategy Name', name: 'name', value: formData.name, onChange: handleChange, placeholder: 'Enter strategy name', error: validationErrors['name']}} />
                <Field {...{type: 'textbox', label: 'Description', name: 'description', value: formData.description, onChange: handleChange, placeholder: 'Enter description', error: validationErrors['description'], height: '100'}} />
                <div className='flex gap-6'>
                    <SelectDropdown {...{label: 'Subsidiary', placeholder: 'Choose subsidiary', name: 'subsidiary_id', selected: formData.subsidiary_id, items: subsidiaries, onSelect: handleChange, isCollapsed: subsidiariesDropdownCollapsed, onToggleCollpase: setSubsidiariesDropdownCollapsed}} />
                    <SelectDropdown {...{label: 'Strategy Model', placeholder: 'Choose default model', name: 'analysis_model_id', selected: formData.analysis_model_id, items: models, onSelect: handleChange, isCollapsed: modelsDropdownCollapsed, onToggleCollpase: setModelsDropdownCollapsed}} />
                </div>
                <div className='flex flex-col gap-3 flex-1 max-w-44'>
                    <label htmlFor={'period_duration'} className='font-medium'>Plan Period</label>
                    <div className='flex flex-col gap-2 relative'>
                        <div className='flex gap-[10px]'> 
                            <input id='period_duration' type='number' name='period_duration' min={1} value={formData.period_duration} onChange={handleChange} className={`w-16 h-12 self-start placeholder:text-placeholder-gray border border-border-gray rounded-lg p-3 outline-text-pink disabled:bg-[#EBEBEB]`} />
                            <SelectDropdown {...{name: 'period_unit', selected: formData.period_unit, items: ['Years', 'Months'], onSelect: handleChange, isCollapsed: durationUnitsDropdownCollapsed, onToggleCollpase: setDurationUnitsDropdownCollapsed}} />
                        </div>
                        {validationErrors['plan_unit'] && <div className='text-sm text-red-500'>{validationErrors['plan_unit']}</div>}
                    </div>
                </div>
                <div className='flex gap-[18px]'>
                    <Field {...{type: 'date', label: 'Start date', name: 'start_date', value: formData.start_date, onChange: handleChange,  error: validationErrors['start_date']}} />
                    <Field {...{type: 'date', label: 'End date', name: 'end_date', disabled: true, value: formData.end_date,  error: validationErrors['end_date']}} />
                </div>
                <Field {...{type: 'textbox', label: 'Note', name: 'note', value: formData.note, onChange: handleChange, placeholder: 'Add note', error: validationErrors['note'], height: '100'}} />

                <label className='flex gap-2'>
                    <input type="checkbox" name="freeze" value={formData.freeze} />
                    <span>Freeze</span>
                </label>
            </div>
            <div className='flex gap-6 px-6'>
                <FormCancelButton text={'Discard'} colorBlack={true} onClick={removeDrawer} />
                <FormProceedButton text={'Save changes'} disabled={isPending} onClick={handleSubmit} />
            </div>
        </form>
    );
}

function StrategyTable({strategies, setContext, onDeleteStrategy}) {
    const [showHistory, setShowHistory] = useState(false);
    const {confirmAction, confirmationDialog} = useConfirmedAction();

    function itemOptions(itemId) {
        return [
            {text: 'View', type: 'action', action: () => setContext({mode: 'view', id: itemId})},
            {text: 'Edit', type: 'action', action: () => setContext({mode: 'edit', id: itemId})},
            {text: 'Delete', type: 'action', action: () => confirmAction(() => onDeleteStrategy({id: itemId}))},
            {text: 'View History', type: 'action', action: () => setShowHistory({id: itemId})},
        ];
    }

    return (
        <div className='px-6'>
            {
                showHistory &&
                createPortal(
                    <StrategyHistory strategyId={showHistory.id} onClose={() => setShowHistory(null)} />,
                    document.body
                )
            }
            <H3>Strategies</H3>
            <div className='mt-3 p-6 rounded-lg border border-[#CCC] text-[#3B3B3B] text-sm'>
                {confirmationDialog}
                <header className='px-4 border-b border-b-[#B7B7B7] flex'>
                    <span className='py-4 flex-[0.8_1]'>ID</span>
                    <span className='py-4 flex-[3_1]'>Strategy</span>
                    <span className='py-4 flex-[1.2_1]'>Duration</span>
                    <span className='flex-[0.4_1]'></span>
                </header>
                <ul className='flex flex-col'>
                    {
                        strategies.map(strategy => {
                            return (
                                <li key={strategy.id} className='px-4 flex items-center'>
                                    <span className='py-4 flex-[0.8_1]'>
                                        <span className='bg-[#FFD3D8] px-2 py-1 rounded-full font-medium text-[#C01E1E]'>{strategy.id}</span>
                                    </span>
                                    <span className='py-4 flex-[2.5_1]'>{strategy.name}</span>
                                    <span className='py-4 flex-[1.2_1]'>{strategy.duration}</span>
                                    <span className='py-4 flex-[0.4_1]'>
                                        <OptionsDropdown options={itemOptions(strategy.id)} />
                                    </span>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        </div>
    );
}

function StrategyHistory({strategyId, onClose}) {
    const {isLoading, error, data: history} = useQuery(strategyHistoryOptions(strategyId));

    let content;

    if (isLoading) content = <div>Loading</div>
    else if (error) content = <div>Error</div>
    else if (history) {
        content = (
            <div className='py-[18px] px-6 flex flex-col gap-6'>
                <div className='flex justify-between items-center'>
                    <H3>{history[0].strategy_title} History</H3>
                    <button type="button" onClick={onClose} className='rounded-[4px] border border-[#CFCFCF]/50 py-1 px-3 flex gap-2 text-xs items-center'>
                        <img src={minimizeIcon} alt="" />
                        Close
                    </button>
                </div>
                <div className='p-6 rounded-lg border border-[#CCC] text-[#3B3B3B] text-sm'>
                    <header className='px-4 border-b border-b-[#B7B7B7] flex gap-1'>
                        <span className='py-4 flex-[1_1]'>Change Date</span>
                        <span className='py-4 flex-[1_1]'>Name</span>
                        <span className='py-4 flex-[1.5_1]'>Description</span>
                        <span className='py-4 flex-[.5_1]'>Plan period</span>
                        <span className='py-4 flex-[.5_1]'>Duration</span>
                        <span className='py-4 flex-[1.5_1]'>Note</span>
                        <span className='py-4 flex-[.5_1]'>User</span>
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
        )
    }

    return (
        <div className='fixed z-40 top-0 left-0 w-full h-full bg-black/20 grid place-items-center p-4'>
            <div className='bg-white rounded-lg py-[18px] w-full h-96 overflow-auto'>
                {content}
            </div>
        </div>
    );
}

function HistoryRecord({record}) {

    const changeDate = format(record.history_created_date, 'dd/M/yyyy, H:mm')

    return (
        <div className='px-4 flex items-center gap-1'>
            <span className='py-4 flex-[1_1]'>{changeDate}</span>
            <span className='py-4 flex-[1_1]'>{record.strategy_title}</span>
            <span className='py-4 flex-[1.5_1]'>{record.description}</span>
            <span className='py-4 flex-[.5_1]'>
                {record.strategy_period}{' '}{record.period_unit}
            </span>
            <span className='py-4 flex-[.5_1]'>{record.duration}</span>
            <span className='py-4 flex-[1.5_1]'>{record.history_note}</span>
            <span className='py-4 flex-[.5_1]'>{record.user}</span>
        </div>
    );
}

export default Strategy;