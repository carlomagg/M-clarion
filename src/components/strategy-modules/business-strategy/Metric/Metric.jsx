import { useContext, useEffect, useState } from 'react';
import styles from './Metric.module.css';
import { StrategyDrawerContext } from '../../../../pages/strategies/Index/Index';
import { Field, H3 } from '../../../Elements/Elements';
import SelectDropdown from '../../../dropdowns/SelectDropdown/SelectDropdown';
import { FormCancelButton, FormProceedButton } from '../../../buttons/FormButtons/FormButtons';
import { useParams } from 'react-router-dom';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { metricOptions, optimizationsOptions, parametersOptions, tacticHistoryOptions, unitMeasuresOptions, useAddMetric, useDeleteMetric, useUpdateMetric } from '../../../../../queries/strategies/strategy-queries';
import useDispatchMessage from '../../../../../hooks/useDispatchMessage';
import ActionsDropdown from '../../../dropdowns/ActionsDropdown/ActionsDropdown';
import { createPortal } from 'react-dom';
import plusIcon from '../../../../../assets/icons/plus.svg';
import { convertToNumber, formatAmount } from '../../../../../utils/helpers';
import CurrentValuesTable from '../globals/CurrentValueTable';
import useConfirmedAction from '../../../../../hooks/useConfirmedAction';

function Metric() {
    const {removeDrawer, mode: initialMode, bag} = useContext(StrategyDrawerContext);
    const [showHistory, setShowHistory] = useState(false);
    const [context, setContext] = useState({mode: initialMode, id: bag?.metricId});
    const {mode, id: metricId} = context;
    const {id: strategyId} = useParams();
    const {tacticId} = bag;
    
    // fetch metric query if in view or edit mode
    const {isLoading, error, data: metric} = useQuery(metricOptions(strategyId, metricId, {enabled: !!metricId}));

    // add, update, delete metric mutations
    const {isPending: isAddingMetric, mutate: addMetric} = useAddMetric(tacticId, {onSuccess, onError, onSettled});
    const {isPending: isUpdatingMetric, mutate: updateMetric} = useUpdateMetric(metricId, {onSuccess, onError, onSettled});
    const {isPending: isDeletingMetric, mutate: deleteMetric} = useDeleteMetric(metricId, {onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage()
    useEffect(() => {
        let text = isAddingMetric ? 'Adding metric' : (isUpdatingMetric ? 'Updating metric' : 'Deleting metric');
        (isAddingMetric || isUpdatingMetric || isDeletingMetric) && dispatchMessage('processing', text);
    }, [isAddingMetric, isUpdatingMetric, isDeletingMetric]);

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
                showHistory && <MetricHistory metricId={metricId} onClose={() => setShowHistory(false)} />
            }
            {
                mode === 'view' ?
                <MetricView metric={metric} onEditClicked={() => setContext({mode: 'edit', id: metricId})} onDeleteClicked={deleteMetric} onHistoryClicked={() => setShowHistory(true)} /> :

                <MetricForm metric={metric} mode={mode} onAddMetric={addMetric} onUpdateMetric={updateMetric} {...{isAddingMetric, isUpdatingMetric}} /> 
            }
        </div>
    );
}

function MetricView({metric, onEditClicked, onDeleteClicked, onHistoryClicked}) {
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
                <H3>Metric</H3>
                <ActionsDropdown label={'Actions'} items={actions} />
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Metric</h4>
                <p>{metric.metric.name}</p>
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Parameter</h4>
                <p>{metric.parameter.name}</p>
            </div>
            <div className='space-y-3'>
                <h4 className='font-medium'>Indicator</h4>
                <p>{metric.indicator.name}</p>
            </div>
            <div className='flex gap-6'>
                <div className='flex gap-3 flex-1 items-center'>
                    <span className='font-medium'>Result:</span>
                    <span className='font-medium text-sm bg-[#D5D5D5] px-2 py-1 rounded-full whitespace-nowrap'>{metric.result_indicator}% Success</span>
                </div>
            </div>
            <hr className='bg-[#CCC]' />
            <div className='flex gap-[18px]'>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Unit Measure</h4>
                    <p>{metric.unit_measure.name}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Optimization</h4>
                    <p>{metric.optimization.name}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Update Frequency</h4>
                    <p>{metric.update_frequency}</p>
                </div>
            </div>
            <div className='flex gap-[18px]'>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Baseline</h4>
                    <p>{formatAmount(metric.baseline)}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Target</h4>
                    <p>{formatAmount(metric.target)}</p>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className='font-medium'>Weight</h4>
                    <p>{metric.weight}</p>
                </div>
            </div>
            <CurrentValuesTable values={metric.current_values} type='metric' />
        </div>
    );
}

function MetricForm({metric = null, mode, onAddMetric, onUpdateMetric, isAddingMetric, isUpdatingMetric}) {
    const {removeDrawer, changeDrawerContext, bag} = useContext(StrategyDrawerContext);
    const [validationErrors, setValidationErrors] = useState({});
    const [indicators, setIndicators] = useState([]);
    const [formData, setFormData] = useState({
        metric: metric?.metric.name || '',
        parameter_id: metric?.parameter.id || '',
        indicator_id: metric?.indicator.id || '',
        unit_measure_id: metric?.unit_measure.id || '',
        optimization_id: metric?.optimization.id || '',
        update_frequency: metric?.update_frequency || '',
        baseline: metric ? formatAmount(metric.baseline) : '',
        target: metric ? formatAmount(metric.target) : '',
        weight: metric?.weight || []
    });

    // parameters, unitmeasures and optimizations queries
    const [parametersQuery, unitMeasuresQuery, optimizationsQuery] = useQueries({
        queries: [parametersOptions(), unitMeasuresOptions(), optimizationsOptions()],
    });

    // set indicators for selected parameter
    useEffect(() => {
        if (formData.parameter_id && parametersQuery.data) {
            const selectedParameter = parametersQuery.data.find(param => param.id == formData.parameter_id);
            setIndicators(
                selectedParameter ?
                selectedParameter.indicators.map(i => ({id: i.id, text: i.name})) :
                []
            );
        }
    }, [formData.parameter_id, parametersQuery.data]);

    function handleChange(e) {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: name === 'baseline' || name === 'target' ? formatAmount(value) : value
        });
    }

    function handleSubmit() {
        const sanitaizedFormData = {...formData, baseline: convertToNumber(formData.baseline), target: convertToNumber(formData.target)};
        mode === 'add' ? onAddMetric({data: sanitaizedFormData}) : onUpdateMetric({data: sanitaizedFormData});
    }

    const isLoading = parametersQuery.isLoading || unitMeasuresQuery.isLoading || optimizationsQuery.isLoading;
    const error = parametersQuery.error || unitMeasuresQuery.error || optimizationsQuery.error;

    if (isLoading) return <div>Loading</div>
    if (error) return <div>Error</div>

    const parameters = parametersQuery.data.map(p => ({id: p.id, text: p.name}));
    const unitMeasures = unitMeasuresQuery.data.map(u => ({id: u.id, text: u.name}));
    const optimizations = optimizationsQuery.data.map(o=> ({id: o.id, text: o.name}));

    return (
        <form className='flex flex-col gap-2 justify-between'>
            <div className='flex flex-col p-6 gap-6'>
                <H3>Metric</H3>
                <Field {...{label: 'Metric Name', name: 'metric', value: formData.metric, onChange: handleChange,  error: validationErrors['metric']}} />
                <div className='flex gap-3'>
                    <ParametersDropdown parameters={parameters} selected={formData.parameter_id} onChange={handleChange} />
                    <button type="button" onClick={() => changeDrawerContext({type: 'parameters-and-indicators', mode: 'add', bag: {metricBag: bag, metricMode: mode}})} className='rounded-lg border border-[#CCCCCC] self-end p-3'>
                        <img src={plusIcon} alt="" />
                    </button>
                </div>
                <div className='flex gap-3'>
                    <IndicatorsDropdown indicators={indicators} selected={formData.indicator_id} onChange={handleChange} />
                    <button type="button" onClick={() => changeDrawerContext({type: 'parameters-and-indicators', mode: 'add', bag: {metricBag: bag, metricMode: mode, parameter: parametersQuery.data.find(p => p.id == formData.parameter_id)}})} className='rounded-lg border border-[#CCCCCC] self-end p-3'>
                        <img src={plusIcon} alt="" />
                    </button>
                </div>
                <div className='flex gap-6'>
                    <UnitMeasureDropdown unitMeasures={unitMeasures} selected={formData.unit_measure_id} onChange={handleChange} />
                    <OptimizationsDropdown optimizations={optimizations} selected={formData.optimization_id} onChange={handleChange} />
                    <FrequencyDropdown selected={formData.update_frequency} onChange={handleChange} />
                </div>
                <div className='flex gap-6'>
                    <Field {...{label: 'Baseline', name: 'baseline', value: formData.baseline, onChange: handleChange,  error: validationErrors['baseline']}} />
                    <Field {...{label: 'Target', name: 'target', value: formData.target, onChange: handleChange,  error: validationErrors['target']}} />
                    <Field {...{label: 'Weight', name: 'weight', value: formData.weight, onChange: handleChange,  error: validationErrors['weight'], type: 'number'}} />
                </div>
            </div>
            <div className='flex gap-6 px-6'>
                <FormCancelButton text={'Discard'} colorBlack={true} onClick={removeDrawer} />
                <FormProceedButton text={isAddingMetric || isUpdatingMetric ? 'Saving changes...' : 'Save changes'} disabled={isAddingMetric || isUpdatingMetric} onClick={handleSubmit} />
            </div>
        </form>
    );
}

function ParametersDropdown({parameters, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Parameter'} placeholder={'Select parameter'} items={parameters} name={'parameter_id'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

function IndicatorsDropdown({indicators, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <SelectDropdown label={'Indicator'} placeholder={'Select indicator'} items={indicators} name={'indicator_id'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
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
        <SelectDropdown label={'Optimization'} placeholder={'Optimization'} items={optimizations} name={'optimization_id'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

function UnitMeasureDropdown({unitMeasures, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Unit Measure'} placeholder={'Unit Measure'} items={unitMeasures} name={'unit_measure_id'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}


function MetricHistory({tacticId, onClose}) {
    const {isLoading, error, data: history} = useQuery(tacticHistoryOptions(tacticId));

    console.log(history)

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

export default Metric;