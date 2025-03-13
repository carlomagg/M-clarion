import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

// total goals
async function fetchTotalGoals({queryKey}) {
    const response = await axios.get('/strategy/goals/total-goals/');
    return response.data['total_goals'];
}

export function totalStrategyGoalsOptions(options = {}) {
    return queryOptions({
        queryKey: ['strategies', 'total-goals'],
        queryFn: fetchTotalGoals,
        ...options
    })
}

// total objectives
async function fetchTotalObjectives({queryKey}) {
    const response = await axios.get('/strategy/objectives/total-objectives/');
    return response.data['total objectives'];
}

export function totalStrategyObjectivesOptions(options = {}) {
    return queryOptions({
        queryKey: ['strategies', 'total-objectives'],
        queryFn: fetchTotalObjectives,
        ...options
    })
}

// total initiatives
async function fetchTotalInitiatives({queryKey}) {
    const response = await axios.get('/strategy/initiatives/total-initiatives/');
    return response.data['total initiatives'];
}

export function totalStrategyInitiativesOptions(options = {}) {
    return queryOptions({
        queryKey: ['strategies', 'total-initiatives'],
        queryFn: fetchTotalInitiatives,
        ...options
    })
}

// total tactics
async function fetchTotalTactics({queryKey}) {
    const response = await axios.get('/strategy/tactics/total-tactics/');
    return response.data['total tactics'];
}

export function totalStrategyTacticsOptions(options = {}) {
    return queryOptions({
        queryKey: ['strategies', 'total-tactics'],
        queryFn: fetchTotalTactics,
        ...options
    })
}

// total metrics
async function fetchTotalMetrics({queryKey}) {
    const response = await axios.get('/strategy/metrics/total-metrics/');
    return response.data['total metrics'];
}

export function totalStrategyMetricsOptions(options = {}) {
    return queryOptions({
        queryKey: ['strategies', 'total-metrics'],
        queryFn: fetchTotalMetrics,
        ...options
    })
}

// total strategy health
async function fetchTotalStrategyHealth({queryKey}) {
    const response = await axios.get(`/strategy/strategies/${queryKey[1]}/total-strategy-health/?interval=${queryKey[3]}`);
    return response.data;
}

export function totalStrategyHealthOptions(strategyId, interval, options = {}) {
    return queryOptions({
        queryKey: ['strategies', strategyId, 'total-health', interval],
        queryFn: fetchTotalStrategyHealth,
        ...options
    })
}

// current objective health
async function fetchCurrentObjectiveHealth({queryKey}) {
    const response = await axios.get(`/strategy/strategies/${queryKey[1]}/current-objective-health/?interval=${queryKey[3]}`);
    return response.data;
}

export function currentObjectiveHealthOptions(strategyId, interval, options = {}) {
    return queryOptions({
        queryKey: ['strategies', strategyId, 'objective-health', interval],
        queryFn: fetchCurrentObjectiveHealth,
        ...options
    })
}

// current initiative health
async function fetchCurrentInitiativeHealth({queryKey}) {
    const response = await axios.get(`/strategy/strategies/${queryKey[1]}/current-initiative-health/?interval=${queryKey[3]}`);
    return response.data;
}

export function currentInitiativeHealthOptions(strategyId, interval, options = {}) {
    return queryOptions({
        queryKey: ['strategies', strategyId, 'initiative-health', interval],
        queryFn: fetchCurrentInitiativeHealth,
        ...options
    })
}

// current tactic health
async function fetchCurrentTacticHealth({queryKey}) {
    const response = await axios.get(`/strategy/strategies/${queryKey[1]}/current-tactic-health/?interval=${queryKey[3]}`);
    return response.data;
}

export function currentTacticHealthOptions(strategyId, interval, options = {}) {
    return queryOptions({
        queryKey: ['strategies', strategyId, 'tactic-health', interval],
        queryFn: fetchCurrentTacticHealth,
        ...options
    })
}

// current metric health
async function fetchCurrentMetricHealth({queryKey}) {
    const response = await axios.get(`/strategy/strategies/${queryKey[1]}/current-metric-health/?interval=${queryKey[3]}`);
    return response.data;
}

export function currentMetricHealthOptions(strategyId, interval, options = {}) {
    return queryOptions({
        queryKey: ['strategies', strategyId, 'metric-health', interval],
        queryFn: fetchCurrentMetricHealth,
        ...options
    })
}

// initiative table
async function fetchInitiativeTable({queryKey}) {
    const response = await axios.get(`/strategy/strategies/${queryKey[1]}/initiative-table/?interval=${queryKey[3]}`);
    return response.data['data'];
}

export function initiativeTableOptions(strategyId, interval, options = {}) {
    return queryOptions({
        queryKey: ['strategies', strategyId, 'initiative-table', interval],
        queryFn: fetchInitiativeTable,
        ...options
    })
}

// initiative gantt chart
async function fetchInitiativeGanttChart({queryKey}) {
    const response = await axios.get(`/strategy/strategies/${queryKey[1]}/initiative-horizontal-bar/?interval=${queryKey[3]}`);
    return response.data;
}

export function initiativeGanttChartOptions(strategyId, interval, options = {}) {
    return queryOptions({
        queryKey: ['strategies', strategyId, 'initiative-gantt-chart', interval],
        queryFn: fetchInitiativeGanttChart,
        ...options
    })
}

// componet goal chart
async function fetchComponentGoalsChart({queryKey}) {
    const response = await axios.get(`/strategy/strategies/${queryKey[1]}/component-goal-graph/?component_id=${queryKey[3]}&interval=${queryKey[5]}`);
    return response.data['data'];
}

export function componentGoalsChartOptions(strategyId, componentId, interval, options = {}) {
    return queryOptions({
        queryKey: ['strategies', strategyId, 'component', componentId, 'goal-chart', interval],
        queryFn: fetchComponentGoalsChart,
        ...options
    })
}

// componet budget spend
async function fetchComponentBudgetSpend({queryKey}) {
    const response = await axios.get(`/strategy/strategies/${queryKey[1]}/budget-spend/?component_id=${queryKey[3]}&interval=${queryKey[5]}`);
    return response.data;
}

export function componentBudgetSpendOptions(strategyId, componentId, interval, options = {}) {
    return queryOptions({
        queryKey: ['strategies', strategyId, 'component', componentId, 'budget-spend', interval],
        queryFn: fetchComponentBudgetSpend,
        ...options
    })
}

// organizational progress chart
async function fetchOrganizationalProgressChart({queryKey}) {
    const response = await axios.get(`/strategy/strategies/${queryKey[1]}/organizational-progress-chart/?theme_id=${queryKey[3]}&interval=${queryKey[5]}`);
    return response.data;
}

export function organizationalProgressChartOptions(strategyId, componentId, interval, options = {}) {
    return queryOptions({
        queryKey: ['strategies', strategyId, 'component', componentId, 'progress-chart', interval],
        queryFn: fetchOrganizationalProgressChart,
        ...options
    })
}