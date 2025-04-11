import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";


// query functions
// STRATEGY
async function fetchStrategies({queryKey}) {
    let respone = await axios.get('strategy/strategies/view-all');
    return respone.data['strategies'];
}

async function fetchStrategy({queryKey}) {
    let respone = await axios.get(`strategy/strategies/${queryKey[1]}/view`);
    return respone.data;
}

async function fetchStrategyItems({queryKey}) {
    let respone = await axios.get(`strategy/strategy-items/${queryKey[1]}/view`);
    return respone.data;
}

async function fetchAnalysisModels({queryKey}) {
    let respone = await axios.get('strategy/models/view-all');
    return respone.data['analysis_models'];
}

async function fetchStrategyHistory({queryKey}) {
    let respone = await axios.get(`strategy/strategies/${queryKey[1]}/history`);
    return respone.data['data'];
}

async function fetchStrategyVMC({queryKey}) {
    let respone = await axios.get(`strategy/strategies/${queryKey[1]}/vmc/view`);
    return respone.data;
}

async function fetchStrategyThemes({queryKey}) {
    let respone = await axios.get(`strategy/strategies/${queryKey[1]}/themes/view-all`);
    return respone.data['themes'];
}

// GOAL
async function fetchGoal({queryKey}) {
    let respone = await axios.get(`strategy/goal/${queryKey[3]}/view`);
    return respone.data;
}

async function fetchUnitMeasures({queryKey}) {
    let respone = await axios.get(`strategy/unit-measures`);
    return respone.data['data'];
}

async function fetchIndicators({queryKey}) {
    let respone = await axios.get(`strategy/indicators`);
    return respone.data['data'];
}

async function fetchParameters({queryKey}) {
    let respone = await axios.get(`strategy/parameters-indicators`);
    return respone.data['data'];
}

async function fetchGoalHistory({queryKey}) {
    let respone = await axios.get(`strategy/goal/${queryKey[1]}/history`);
    return respone.data['history'];
}

// OBJECTIVE
async function fetchObjective({queryKey}) {
    let respone = await axios.get(`strategy/objective/${queryKey[3]}/view`);
    return respone.data;
}

async function fetchOptimizations({queryKey}) {
    let respone = await axios.get(`strategy/optimizations`);
    return respone.data['data'];
}

async function fetchObjectiveHistory({queryKey}) {
    let respone = await axios.get(`strategy/objective/${queryKey[1]}/history`);
    return respone.data['History'];
}

// INITIATIVE
async function fetchInitiative({queryKey}) {
    let respone = await axios.get(`strategy/initiative/${queryKey[3]}/view`);
    return respone.data;
}

async function fetchInitiativeHistory({queryKey}) {
    let respone = await axios.get(`strategy/initiative/${queryKey[1]}/history`);
    return respone.data['history'];
}

// TACTIC
async function fetchTactic({queryKey}) {
    let respone = await axios.get(`strategy/tactic/${queryKey[3]}/view`);
    return respone.data;
}

async function fetchTacticHistory({queryKey}) {
    let respone = await axios.get(`strategy/tactic/${queryKey[1]}/history`);
    return respone.data;
}

// METRIC
async function fetchMetric({queryKey}) {
    let respone = await axios.get(`strategy/metric/${queryKey[3]}/view`);
    return respone.data['data'];
}

async function fetchMetricHistory({queryKey}) {
    let respone = await axios.get(`strategy/metric/${queryKey[1]}/history`);
    return respone.data;
}


// mutation functions
// STRATEGY
async function addStrategy({data}) {
    let respone = await axios.post('strategy/strategies/', data);
    return respone.data;
}

async function updateStrategy({data}, id) {
    let respone = await axios.put(`strategy/strategies/${id}/update/`, data);
    return respone.data;
}

async function deleteStrategy({id}) {
    let respone = await axios.delete(`strategy/strategies/${id}/delete/`);
    return respone.data;
}

async function addStrategyVMC(id, {data}) {
    let respone = await axios.post(`strategy/strategies/${id}/vmc/`, data);
    return respone.data;
}

async function updateStrategyVMC(id, {data}) {
    let respone = await axios.put(`strategy/strategies/${id}/vmc/update/`, data);
    return respone.data;
}

async function updateStrategyCoreValue(id, {data}) {
    let respone = await axios.put(`strategy/strategies/core-value/${id}/update/`, data);
    return respone.data;
}

async function deleteStrategyCoreValue(id) {
    let respone = await axios.delete(`strategy/strategies/core-value/${id}/delete/`);
    return respone.data;
}

async function addStrategyThemes(id, {data}) {
    let respone = await axios.post(`strategy/strategies/${id}/themes/`, data);
    return respone.data;
}

async function updateStrategyTheme(id, {data}) {
    let respone = await axios.put(`strategy/themes/${id}/update/`, data);
    return respone.data;
}

async function deleteStrategyTheme(id) {
    let respone = await axios.delete(`strategy/themes/${id}/delete/`);
    return respone.data;
}

// GOAL
async function addGoal({data}) {
    let respone = await axios.post('strategy/goal/create/', data);
    return respone.data;
}

async function updateGoal(id, {data}) {
    let respone = await axios.put(`strategy/goal/${id}/update/`, data);
    return respone.data;
}

async function deleteGoal(id) {
    let respone = await axios.delete(`strategy/goal/${id}/delete/`);
    return respone.data;
}

async function addPeriodicPortion(goalId, {data}) {
    let respone = await axios.post(`strategy/goal/${goalId}/add-portion/`, data);
    return respone.data;
}

async function updatePeriodicPortion({id, data}) {
    let respone = await axios.put(`strategy/goal-portion/${id}/update/`, data);
    return respone.data;
}

async function deletePeriodicPortion({id}) {
    let respone = await axios.delete(`strategy/goal-portion/${id}/delete/`);
    return respone.data;
}

// OBJECTIVE
async function addObjective({data}) {
    let respone = await axios.post('strategy/objective/create/', data);
    return respone.data;
}

async function updateObjective(id, {data}) {
    let respone = await axios.put(`strategy/objective/${id}/update/`, data);
    return respone.data;
}

async function deleteObjective(id) {
    let respone = await axios.delete(`strategy/objective/${id}/delete/`);
    return respone.data;
}

async function addCurrentValue({data}) {
    let respone = await axios.post('strategy/add_current_value/', data);
    return respone.data;
}

async function updateCurrentValue({id, data}) {
    let respone = await axios.put(`strategy/current_value/${id}/update/`, data);
    return respone.data;
}

async function deleteCurrentValue({id}) {
    let respone = await axios.delete(`strategy/current_value/${id}/delete/`);
    return respone.data;
}

// INITIATIVE
async function addInitiative({data}) {
    let respone = await axios.post('strategy/initiative/create/', data);
    return respone.data;
}

async function updateInitiative(id, {data}) {
    let respone = await axios.put(`strategy/initiative/${id}/update/`, data);
    return respone.data;
}

async function deleteInitiative(id) {
    let respone = await axios.delete(`strategy/initiative/${id}/delete/`);
    return respone.data;
}

async function addBudgetSpend(initiativeId, {data}) {
    let respone = await axios.post(`strategy/initiative/${initiativeId}/add-budget/`, data);
    return respone.data;
}

async function updateBudgetSpend({id, data}) {
    let respone = await axios.put(`strategy/budget/${id}/update/`, data);
    return respone.data;
}

async function deleteBudgetSpend({id}) {
    let respone = await axios.delete(`strategy/budget/${id}/delete/`);
    return respone.data;
}

async function addMilestone(initiativeId, {data}) {
    let respone = await axios.post(`strategy/initiative/${initiativeId}/add-milestone/`, data);
    return respone.data;
}

async function updateMilestone({id, data}) {
    let respone = await axios.put(`strategy/initiative-milestone/${id}/edit/`, data);
    return respone.data;
}

async function updateMilestoneStatus({id, data}) {
    let respone = await axios.put(`strategy/initiative-milestone/${id}/update-status/`, data);
    return respone.data;
}

async function deleteMilestone({id}) {
    let respone = await axios.delete(`strategy/initiative-milestone/${id}/delete/`);
    return respone.data;
}

// TACTIC
async function addTactic(initiativeId, {data}) {
    let respone = await axios.post(`strategy/initiative/${initiativeId}/add-tactic/`, data);
    return respone.data;
}

async function updateTactic(id, {data}) {
    let respone = await axios.put(`strategy/tactic/${id}/update/`, data);
    return respone.data;
}

async function deleteTactic(id) {
    let respone = await axios.delete(`strategy/tactic/${id}/delete/`);
    return respone.data;
}

// METRIC
async function addMetric(tacticId, {data}) {
    let respone = await axios.post(`strategy/tactic/${tacticId}/add-metric/`, data);
    return respone.data;
}

async function updateMetric(id, {data}) {
    let respone = await axios.put(`strategy/metric/${id}/update/`, data);
    return respone.data;
}

async function deleteMetric(id) {
    let respone = await axios.delete(`strategy/metric/${id}/delete/`);
    return respone.data;
}

// PARAMETERS AND INDICATORS
async function addParametersAndIndicators({data}) {
    let respone = await axios.post(`strategy/parameter/add/`, data);
    return respone.data;
}


// query options and hooks
// STRATEGY
export function strategiesOptions(options) {
    return queryOptions({
        queryKey: ['strategies'],
        queryFn: fetchStrategies,
        ...options
    })
}

export function useStrategyName(id) {
    return useQuery(strategiesOptions({select: (strategies) => strategies.find(s => s.id == id).name}));
}

export function strategyOptions(id, options) {
    return queryOptions({
        queryKey: ['strategies', id],
        queryFn: fetchStrategy,
        ...options
    })
}

export function strategyItemsOptions(id, options) {
    return queryOptions({
        queryKey: ['strategies', id, 'items'],
        queryFn: fetchStrategyItems,
        ...options
    })
}

export function strategyHistoryOptions(id) {
    return queryOptions({
        queryKey: ['strategies', id, 'history'],
        queryFn: fetchStrategyHistory,
        staleTime: 0
    })
}

export function strategyVMCOptions(id, options) {
    return queryOptions({
        queryKey: ['strategies', id, 'vmc'],
        queryFn: fetchStrategyVMC,
        ...options
    })
}

export function strategyThemesOptions(id, options) {
    return queryOptions({
        queryKey: ['strategies', id, 'themes'],
        queryFn: fetchStrategyThemes,
        ...options
    })
}

export function analysisModelsOptions() {
    return queryOptions({
        queryKey: ['analysis-models'],
        queryFn: fetchAnalysisModels
    })
}

//GOAL
export function goalOptions(strategyId, goalId, options) {
    return queryOptions({
        queryKey: ['strategies', Number(strategyId), 'goals', goalId],
        queryFn: fetchGoal,
        ...options
    })
}

export function unitMeasuresOptions(options) {
    return queryOptions({
        queryKey: ['unit-measures'],
        queryFn: fetchUnitMeasures,
        ...options
    })
}

export function indicatorsOptions() {
    return queryOptions({
        queryKey: ['indicators'],
        queryFn: fetchIndicators,
    })
}

export function parametersOptions() {
    return queryOptions({
        queryKey: ['parameters'],
        queryFn: fetchParameters,
    })
}

export function goalHistoryOptions(id) {
    return queryOptions({
        queryKey: ['goals', id, 'history'],
        queryFn: fetchGoalHistory,
        staleTime: 0
    })
}

// OBJECTIVE
export function objectiveOptions(strategyId, objectiveId, options) {
    return queryOptions({
        queryKey: ['strategies', Number(strategyId), 'objectives', objectiveId],
        queryFn: fetchObjective,
        ...options
    })
}

export function optimizationsOptions(options) {
    return queryOptions({
        queryKey: ['optimizations'],
        queryFn: fetchOptimizations,
        ...options
    })
}

export function objectiveHistoryOptions(id) {
    return queryOptions({
        queryKey: ['objectives', id, 'history'],
        queryFn: fetchObjectiveHistory,
        staleTime: 0
    })
}

// INITIATIVE
export function initiativeOptions(strategyId, initiativeId, options) {
    return queryOptions({
        queryKey: ['strategies', Number(strategyId), 'initiatives', initiativeId],
        queryFn: fetchInitiative,
        ...options
    })
}

export function initiativeHistoryOptions(id) {
    return queryOptions({
        queryKey: ['initiatives', id, 'history'],
        queryFn: fetchInitiativeHistory,
        staleTime: 0
    })
}

// TACTIC
export function tacticOptions(strategyId, tacticId, options) {
    return queryOptions({
        queryKey: ['strategies', Number(strategyId), 'tactics', tacticId],
        queryFn: fetchTactic,
        ...options
    })
}

export function tacticHistoryOptions(id) {
    return queryOptions({
        queryKey: ['tactics', id, 'history'],
        queryFn: fetchTacticHistory,
        staleTime: 0
    })
}

// METRIC
export function metricOptions(strategyId, metricId, options) {
    return queryOptions({
        queryKey: ['strategies', Number(strategyId), 'metrics', metricId],
        queryFn: fetchMetric,
        ...options
    })
}

export function metricHistoryOptions(id) {
    return queryOptions({
        queryKey: ['metrics', id, 'history'],
        queryFn: fetchMetricHistory,
        staleTime: 0
    })
}


// mutation hooks
// STRATEGY
export function useAddStrategy(callbacks) {
    return useMutation({
        mutationFn: addStrategy,
        ...callbacks
    })
}

export function useUpdateStrategy(id, callbacks) {
    return useMutation({
        mutationFn: (vars) => updateStrategy(vars, id),
        ...callbacks
    })
}

export function useDeleteStrategy(callbacks) {
    return useMutation({
        mutationFn: deleteStrategy,
        ...callbacks
    })
}

export function useAddStrategyVMC(id, callbacks) {
    return useMutation({
        mutationFn: (vars) => addStrategyVMC(id, vars),
        ...callbacks
    })
}

export function useUpdateStrategyVMC(id, callbacks) {
    return useMutation({
        mutationFn: (vars) => updateStrategyVMC(id, vars),
        ...callbacks
    })
}

export function useUpdateStrategyCoreValue(id, callbacks) {
    return useMutation({
        mutationFn: (vars) => updateStrategyCoreValue(id, vars),
        ...callbacks
    })
}

export function useDeleteStrategyCoreValue(id, callbacks) {
    return useMutation({
        mutationFn: () => deleteStrategyCoreValue(id),
        ...callbacks
    })
}

export function useAddStrategyThemes(id, callbacks) {
    return useMutation({
        mutationFn: (vars) => addStrategyThemes(id, vars),
        ...callbacks
    })
}

export function useUpdateStrategyTheme(id, callbacks) {
    return useMutation({
        mutationFn: (vars) => updateStrategyTheme(id, vars),
        ...callbacks
    })
}

export function useDeleteStrategyTheme(id, callbacks) {
    return useMutation({
        mutationFn: () => deleteStrategyTheme(id),
        ...callbacks
    })
}

// GOAL
export function useAddGoal(callbacks) {
    return useMutation({
        mutationFn: addGoal,
        ...callbacks
    })
}

export function useUpdateGoal(id, callbacks) {
    return useMutation({
        mutationFn: (vars) => updateGoal(id, vars),
        ...callbacks
    })
}

export function useDeleteGoal(id, callbacks) {
    return useMutation({
        mutationFn: () => deleteGoal(id),
        ...callbacks
    })
}

export function useAddPeriodicPortion(goalId, callbacks) {
    return useMutation({
        mutationFn: (vars) => addPeriodicPortion(goalId, vars),
        ...callbacks
    })
}

export function useUpdatePeriodicPortion(callbacks) {
    return useMutation({
        mutationFn: updatePeriodicPortion,
        ...callbacks
    })
}

export function useDeletePeriodicPortion(callbacks) {
    return useMutation({
        mutationFn: deletePeriodicPortion,
        ...callbacks
    })
}

// OBJECTIVE
export function useAddObjective(callbacks) {
    return useMutation({
        mutationFn: addObjective,
        ...callbacks
    })
}

export function useUpdateObjective(id, callbacks) {
    return useMutation({
        mutationFn: (vars) => updateObjective(id, vars),
        ...callbacks
    })
}

export function useDeleteObjective(id, callbacks) {
    return useMutation({
        mutationFn: () => deleteObjective(id),
        ...callbacks
    })
}

export function useAddCurrentValue(callbacks) {
    return useMutation({
        mutationFn: addCurrentValue,
        ...callbacks
    })
}

export function useUpdateCurrentValue(callbacks) {
    return useMutation({
        mutationFn: updateCurrentValue,
        ...callbacks
    })
}

export function useDeleteCurrentValue(callbacks) {
    return useMutation({
        mutationFn: deleteCurrentValue,
        ...callbacks
    })
}

// INITIATIVE
export function useAddInitiative(callbacks) {
    return useMutation({
        mutationFn: addInitiative,
        ...callbacks
    })
}

export function useUpdateInitiative(id, callbacks) {
    return useMutation({
        mutationFn: (vars) => updateInitiative(id, vars),
        ...callbacks
    })
}

export function useDeleteInitiative(id, callbacks) {
    return useMutation({
        mutationFn: () => deleteInitiative(id),
        ...callbacks
    })
}

export function useAddBudgetSpend(initiativeId, callbacks) {
    return useMutation({
        mutationFn: (vars) => addBudgetSpend(initiativeId, vars),
        ...callbacks
    })
}

export function useUpdateBudgetSpend(callbacks) {
    return useMutation({
        mutationFn: updateBudgetSpend,
        ...callbacks
    })
}

export function useDeleteBudgetSpend(callbacks) {
    return useMutation({
        mutationFn: deleteBudgetSpend,
        ...callbacks
    })
}

export function useAddMilestone(initiativeId, callbacks) {
    return useMutation({
        mutationFn: (vars) => addMilestone(initiativeId, vars),
        ...callbacks
    })
}

export function useUpdateMilestone(callbacks) {
    return useMutation({
        mutationFn: updateMilestone,
        ...callbacks
    })
}

export function useUpdateMilestoneStatus(callbacks) {
    return useMutation({
        mutationFn: updateMilestoneStatus,
        ...callbacks
    })
}

export function useDeleteMilestone(callbacks) {
    return useMutation({
        mutationFn: deleteMilestone,
        ...callbacks
    })
}

// TACTIC
export function useAddTactic(initiativeId, callbacks) {
    return useMutation({
        mutationFn: (vars) => addTactic(initiativeId, vars),
        ...callbacks
    })
}

export function useUpdateTactic(id, callbacks) {
    return useMutation({
        mutationFn: (vars) => updateTactic(id, vars),
        ...callbacks
    })
}

export function useDeleteTactic(id, callbacks) {
    return useMutation({
        mutationFn: () => deleteTactic(id),
        ...callbacks
    })
}

// METRIC
export function useAddMetric(tacticId, callbacks) {
    return useMutation({
        mutationFn: (vars) => addMetric(tacticId, vars),
        ...callbacks
    })
}

export function useUpdateMetric(id, callbacks) {
    return useMutation({
        mutationFn: (vars) => updateMetric(id, vars),
        ...callbacks
    })
}

export function useDeleteMetric(id, callbacks) {
    return useMutation({
        mutationFn: () => deleteMetric(id),
        ...callbacks
    })
}

// PARAMETERS AND INDICATORS
export function useAddParametersAndIndicators(callbacks) {
    return useMutation({
        mutationFn: addParametersAndIndicators,
        ...callbacks
    })
}