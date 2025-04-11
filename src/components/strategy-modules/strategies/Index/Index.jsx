import styles from './Index.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import { createContext, useContext, useEffect, useState } from 'react';

import addChildIcon from '../../../../assets/icons/add-child.svg';
import importIcon from '../../../../assets/icons/import.svg';
import exportIcon from '../../../../assets/icons/export.svg';
import plusIcon from '../../../../assets/icons/plus.svg';
import { Tooltip } from 'react-tooltip';
import LinkButton from '../../../partials/buttons/LinkButton/LinkButton';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { strategiesOptions, strategyItemsOptions, useDeleteGoal, useDeleteInitiative, useDeleteMetric, useDeleteObjective, useDeleteTactic } from '../../../../queries/strategies/strategy-queries';
import StrategyDrawer from '../../../partials/forms/business-strategy/StrategyDrawer/StrategyDrawer';
import { useNavigate, useParams } from 'react-router-dom';
import OptionsDropdown from '../../../partials/dropdowns/OptionsDropdown/OptionsDropdown';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import LoadingIndicatorThree from '../../../partials/skeleton-loading-indicators/LoadingIndicatorThree';
import Error from '../../../partials/Error/Error';
import useConfirmedAction from '../../../../hooks/useConfirmedAction';

const FunctionsContext = createContext(null);
export const StrategyDrawerContext = createContext(null);

function Index() {
    const {id} = useParams();
    const [selectedStrategy, setSelectedStrategy] = useState('');
    const [showItemForm, setShowItemForm] = useState(null);
    const [isNewlyCreated, setIsNewlyCreated] = useState(null);
    const navigate = useNavigate();

    const {confirmAction, confirmationDialog} = useConfirmedAction();

    // fetch all strategies, and selected strategy
    const [strategiesQuery, strategyItemsQuery] = useQueries({
        queries: [strategiesOptions(), strategyItemsOptions(selectedStrategy, {enabled: !!selectedStrategy})]
    });

    useEffect(() => {
        setSelectedStrategy(Number(id) || '');
    }, [id]);

    useEffect(() => {
        if (isNewlyCreated) {
            let strategies = strategiesQuery.data;
            if (isNewlyCreated['type'] === 'strategy') {
                navigate(`/strategies/${strategies[strategies.length - 1].id}`);
                setIsNewlyCreated(null);
            }
        }
    }, [isNewlyCreated, strategiesQuery.data]);

    function addNewStrategy() {
        setShowItemForm({type: 'strategy', mode: 'add', bag: {}});
    }

    function removeDrawer() {
        setShowItemForm(null);
    }

    const isLoading = strategiesQuery.isLoading || (selectedStrategy && strategyItemsQuery.isLoading);
    const error = strategiesQuery.error || (selectedStrategy && strategyItemsQuery.error);

    if (isLoading) {
        return <LoadingIndicatorThree />
    }
    if (error) {
        return <Error error={error} />
    }

    const strategies = strategiesQuery.data;
    const components = selectedStrategy && strategyItemsQuery.data.data.components;

    return (
        <div className={`p-10 pt-4 max-w-7xl flex flex-col gap-6 relative ${strategies.length === 0 && 'h-full'}`}>
            {
                showItemForm &&
                <StrategyDrawerContext.Provider value={{...showItemForm, removeDrawer, onNewlyCreated: setIsNewlyCreated, changeDrawerContext: setShowItemForm}}>
                    <StrategyDrawer />
                </StrategyDrawerContext.Provider>
            }
            <PageTitle title={'Business strategy'} />
            <PageHeader>
                <div className='flex gap-3 items-center'>
                    {
                        strategies.length > 0 &&
                        <>
                            <LinkButton text={'Import'} icon={importIcon} />
                            <LinkButton text={'Export'} icon={exportIcon} />
                        </>
                    }
                    <LinkButton text={'Create new strategy'} icon={plusIcon} onClick={addNewStrategy} />
                </div>
            </PageHeader>
            {
                strategies.length > 0 ?
                <div className='mt-4 p-6 flex flex-col gap-6 bg-white rounded-lg border border-[#CCC]'>
                    <div className='flex justify-between'>
                        <StrategyDropdown {...{strategies, selectedStrategy, setSelectedStrategy}} />
                        <div className='flex gap-3 items-center'>
                            {
                                selectedStrategy &&
                                <>
                                    <LinkButton text={'View Details'} icon={plusIcon} onClick={() => setShowItemForm({type: 'strategy', mode: 'view', bag: {strategyId: selectedStrategy}})} classes={'border border-[#D7D7D7]'} />
                                    <LinkButton text={'Themes'} icon={plusIcon} location={`themes`} classes={'border border-[#D7D7D7]'} />
                                    <LinkButton text={'VMC'} icon={plusIcon} location={`vmc`} classes={'border border-[#D7D7D7]'} />
                                    <LinkButton text={'Insight'} icon={plusIcon} classes={'border border-[#D7D7D7]'} />
                                </>
                            }
                        </div>
                    </div>
                    {
                        components &&
                        <FunctionsContext.Provider value={{setShowItemForm, confirmAction}}>
                            {confirmationDialog}
                            <StrategyTable components={components} />
                        </FunctionsContext.Provider>
                    }
                </div> :
                <div className='w-full h-full flex items-center justify-center'>
                    <div className='flex flex-col gap-6 items-center'>
                        <div className='text-sm'>You haven't created any strategy</div>
                        <button type="button" onClick={addNewStrategy} className='bg-[#E44195] text-white font-semibold p-2 w-96 rounded-lg'>
                            Create New Strategy
                        </button>
                    </div>
                </div>
            }
        </div>
    )
}


export function StrategyDropdown({strategies, selectedStrategy, setSelectedStrategy, shouldNavigate = true}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const navigate = useNavigate();

    function handleStrategySelect(id) {
        shouldNavigate && navigate(`/strategies/${id}`);
        setSelectedStrategy(id);
        setIsCollapsed(true);
    };

    const selectedStrategyName = selectedStrategy && strategies.find(s => s.id === selectedStrategy)?.name

    return (
        <div className='cursor-pointer relative w-max'>
            <div className='flex gap-4 items-center p-3' onClick={() => {setIsCollapsed(!isCollapsed)}}>
                <span className='font-semibold text-xl whitespace-nowrap select-none'>{selectedStrategyName || 'Select strategy'}</span>
                <span className='inline-block w-2 h-2 rotate-45 border-2 border-black border-t-transparent border-l-transparent -translate-y-1'></span>
            </div>
            <ul className={`mt-2 absolute z-10 top-full w-max left-0 bg-white overflow-y-auto border border-[#D5D5D5] rounded-lg ${isCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-52'}`}>
                {
                    strategies.map(strategy => <li key={strategy.id} onClick={() => handleStrategySelect(strategy.id)} className='p-3 whitespace-nowrap border-b border-[#D5D5D5] last:border-b-0'>{strategy.name}</li>)
                }
            </ul>
        </div>
    )
}

function StrategyTable({components}) {
    return (
        <section className=''>
            <header className='flex px-4 text-sm text-[#3B3B3B]'>
                <span className='flex-[5_1] py-4'>Name</span>
                <span className='flex-[1_1] py-4 text-center'>Weight</span>
                <span className='flex-[1_1] py-4 text-center'>Progress</span>
                <span className='flex-[1_1] py-4 text-center'>Result</span>
                <span className='flex-[1_1] py-4 text-center'>Status</span>
                <span className='flex-[1.2_1] py-4 text-center'>Measure</span>
                <span className='flex-[1_1] py-4 text-center'></span>
            </header>
            <ul>
                {
                    components.map(component => {
                        return (
                            <li key={component.id}>
                                <Component component={component} />
                            </li>
                        );
                    })
                }
            </ul>
        </section>
    );
}

function Component({component}) {
    const {name} = component;
    return (
        <div>
            <Row data={{name,componentId: component.id}} type={'component'} />
            <ul>
                {
                    component.goals?.length > 0 &&
                    component.goals.map(goal => {
                        return (
                            <li key={goal.name}>
                                <Goal goal={goal} />
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    );
}

function Goal({goal}) {
    const {setShowItemForm, confirmAction} = useContext(FunctionsContext);
    const {name, id: goalId, unit_measure: unitMeasure, goal_progress: progress, result_indicator: result} = goal;
    const queryClient = useQueryClient();
    const {id: strategyId} = useParams();
    
    // deleteItem mutations
    const {isPending: isDeletingGoal, mutate: deleteGoal} = useDeleteGoal(goalId, {onSuccess, onError});
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = 'Deleting goal';
        (isDeletingGoal) && dispatchMessage('processing', text);
    }, [isDeletingGoal]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['strategies', Number(strategyId), 'items']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }

    const options = [
        {text: 'View', type: 'action', action: () => setShowItemForm({type: 'goal', mode: 'view', bag: {goalId}})},
        {text: 'Edit', type: 'action', action: () => setShowItemForm({type: 'goal', mode: 'edit', bag: {goalId}})},
        {text: 'Delete', type: 'action', action: () => confirmAction(deleteGoal)},
        // {text: 'History', type: 'action', action: () => console.log('hsitory '+type+' '+data.id)},
    ];
    return (
        <div>
            <Row data={{name, goalId, unitMeasure, progress, result}} type={'goal'} options={options} />
            <ul>
                {
                    goal.objectives?.length > 0 &&
                    goal.objectives.map(objective => {
                        return (
                            <li key={objective.name}>
                                <Objective objective={objective} />
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    );
}

function Objective({objective}) {
    const {id: objectiveId, name, weight, unit_measure: unitMeasure, objective_progress: progress, result_indicator: result} = objective; 
    const {setShowItemForm, confirmAction} = useContext(FunctionsContext);
    const queryClient = useQueryClient();
    const {id: strategyId} = useParams();
    
    // deleteItem mutations
    const {isPending: isDeletingObjective, mutate: deleteObjective} = useDeleteObjective(objectiveId, {onSuccess, onError});
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = 'Deleting objective';
        (isDeletingObjective) && dispatchMessage('processing', text);
    }, [isDeletingObjective]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['strategies', Number(strategyId), 'items']});
        dispatchMessage('success', data.message);

    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }

    const options = [
        {text: 'View', type: 'action', action: () => setShowItemForm({type: 'objective', mode: 'view', bag: {objectiveId}})},
        {text: 'Edit', type: 'action', action: () => setShowItemForm({type: 'objective', mode: 'edit', bag: {objectiveId}})},
        {text: 'Delete', type: 'action', action: () => confirmAction(deleteObjective)},
        // {text: 'History', type: 'action', action: () => console.log('hsitory '+type+' '+data.id)},
    ];
    return (
        <div>
            <Row data={{objectiveId, name, weight, unitMeasure, progress, result}} type={'objective'} options={options} />
            <ul>
                {
                    objective.initiatives?.length > 0 &&
                    objective.initiatives.map(initiative => {
                        return (
                            <li key={initiative.name}>
                                <Initiative initiative={initiative} />
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    );
}

function Initiative({initiative}) {
    const {id: initiativeId, name, weight, unit_measure: unitMeasure, initiative_progress: progress, result_indicator: result} = initiative; 
    const {setShowItemForm, confirmAction} = useContext(FunctionsContext);
    const queryClient = useQueryClient();
    const {id: strategyId} = useParams();
    
    // deleteItem mutations
    const {isPending: isDeletingInitiative, mutate: deleteInitiative} = useDeleteInitiative(initiativeId, {onSuccess, onError});
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = 'Deleting initiative';
        (isDeletingInitiative) && dispatchMessage('processing', text);
    }, [isDeletingInitiative]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['strategies', Number(strategyId), 'items']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }

    const options = [
        {text: 'View', type: 'action', action: () => setShowItemForm({type: 'initiative', mode: 'view', bag: {initiativeId}})},
        {text: 'Edit', type: 'action', action: () => setShowItemForm({type: 'initiative', mode: 'edit', bag: {initiativeId}})},
        {text: 'Delete', type: 'action', action: () => confirmAction(deleteInitiative)},
        // {text: 'History', type: 'action', action: () => console.log('hsitory '+type+' '+data.id)},
    ];

    return (
        <div>
            <Row data={{initiativeId, name, weight, unitMeasure, progress, result}} type={'initiative'} options={options} />
            <ul>
                {
                    initiative.tactics?.length > 0 &&
                    initiative.tactics.map(tactic => {
                        return (
                            <li key={tactic.name}>
                                <Tactic tactic={tactic} />
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    );
}

function Tactic({tactic}) {
    const {id: tacticId, name, weight, unit_measure: unitMeasure, tactic_progress: progress, result_indicator: result} = tactic; 
    const {setShowItemForm, confirmAction} = useContext(FunctionsContext);
    const queryClient = useQueryClient();
    const {id: strategyId} = useParams();
    
    // deleteItem mutations
    const {isPending: isDeletingTactic, mutate: deleteTactic} = useDeleteTactic(tacticId, {onSuccess, onError});
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = 'Deleting tactic';
        (isDeletingTactic) && dispatchMessage('processing', text);
    }, [isDeletingTactic]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['strategies', Number(strategyId), 'items']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }

    const options = [
        {text: 'View', type: 'action', action: () => setShowItemForm({type: 'tactic', mode: 'view', bag: {tacticId}})},
        {text: 'Edit', type: 'action', action: () => setShowItemForm({type: 'tactic', mode: 'edit', bag: {tacticId}})},
        {text: 'Delete', type: 'action', action: () => confirmAction(deleteTactic)},
        // {text: 'History', type: 'action', action: () => console.log('hsitory '+type+' '+data.id)},
    ];

    return (
        <div>
            <Row data={{tacticId, name, weight, unitMeasure, progress, result}} type={'tactic'} options={options} />
            <ul>
                {
                    tactic.metrics?.length > 0 &&
                    tactic.metrics.map(metric => {
                        return (
                            <li key={metric.name}>
                                <Metric metric={metric} />
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    );
}

function Metric({metric}) {
    const {id: metricId, name, weight, unit_measure: unitMeasure, result_indicator: result} = metric;
    const {setShowItemForm, confirmAction} = useContext(FunctionsContext);
    const queryClient = useQueryClient();
    const {id: strategyId} = useParams();
    
    // deleteItem mutations
    const {isPending: isDeletingMetric, mutate: deleteMetric} = useDeleteMetric(metricId, {onSuccess, onError});
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = 'Deleting metric';
        (isDeletingMetric) && dispatchMessage('processing', text);
    }, [isDeletingMetric]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['strategies', Number(strategyId), 'items']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }

    const options = [
        {text: 'View', type: 'action', action: () => setShowItemForm({type: 'metric', mode: 'view', bag: {metricId}})},
        {text: 'Edit', type: 'action', action: () => setShowItemForm({type: 'metric', mode: 'edit', bag: {metricId}})},
        {text: 'Delete', type: 'action', action: () => confirmAction(deleteMetric)},
    ];
    return <Row data={{name, weight, unitMeasure, result}} type={'metric'} options={options} />;
}

function Row({type, data, options}) {
    const {setShowItemForm} = useContext(FunctionsContext);

    const namesOfChildren = {
        'component': 'goal',
        'goal': 'objective',
        'objective': 'initiative',
        'initiative': 'tactic',
        'tactic': 'metric'
    };

    function addNewStrategyItem() { // adds a new child to the present item
        setShowItemForm({type: namesOfChildren[type], mode: 'add', bag: data})
    }

    let hasChildren = true;
    let hasDash = true;
    let paddingLeft;

    switch (type) {
        case 'component':
            paddingLeft = 0;
            hasDash = false;
            break;
        case 'goal':
            paddingLeft = 0;
            break;
        case 'objective':
            paddingLeft = 28;
            break;
        case 'initiative':
            paddingLeft = 56;
            break;
        case 'tactic':
            paddingLeft = 84;
            break;
        case 'metric':
            paddingLeft = 116;
            hasChildren = false
            break;
    };

    // const styles = {backgroundColor, paddingLeft: paddingLeft ? paddingLeft+'px' : ''};
    const classString = 'flex px-4 text-sm text-[#3B3B3B] group whitespace-nowrap items-center h-[46px]';

    const dashIcon = (
        <svg width="10" height="4" viewBox="0 0 10 4" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="10" height="3" transform="translate(0 0.5)" fill="#DD127A"/>
        </svg>
    );

    return (
        <div className={classString}>
            <span className='flex-[5_1]'>
                <span className='flex gap-2 items-center' style={{marginLeft: paddingLeft ? paddingLeft+'px':''}}>
                    {hasDash && dashIcon}
                    <span data-tooltip-id={'item-type'} data-tooltip-content={type}>{data.name}</span>
                    <Tooltip id='item-type' />
                </span>
            </span>
            <span className='flex-[1_1] text-center'>{data.weight || ''}</span>
            <span className='flex-[1_1] text-center'>{data.progress ? data.progress+'%' : ''}</span>
            <span className='flex-[1_1] text-center'>{data.result ? data.result+'%' : ''}</span>
            <span className='flex-[1_1] text-center'>{data.status || ''}</span>
            <span className='flex-[1.2_1] text-center'>{data.unitMeasure || ''}</span>
            <div className='flex-[1_1] text-center flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-[opacity] duration-300 ease-in-out'>
                {
                    (type === 'component' || type === 'metric') && <div className='grow'></div>
                }
                {
                    hasChildren &&    
                    <button type='button' onClick={addNewStrategyItem} data-tooltip-id='add-child' data-tooltip-content={'Add new '+namesOfChildren[type]+' to '+type} className='grid place-items-center hover:bg-[#CCC]/50 rounded-lg transition-colors w-8 h-8 shrink-0'>
                        <img src={addChildIcon} alt="" />
                        <Tooltip id='add-child' />
                    </button>
                }
                {
                    type !== 'component' &&
                    <OptionsDropdown options={options} />
                }
            </div>
        </div>
    );
}

export default Index;