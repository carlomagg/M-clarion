import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

// total risks
async function fetchTotalRisks({queryKey}) {
    const response = await axios.get(`/risk/risks/total-risk/?interval=${queryKey[2]}`);
    return response.data;
}
export function totalRisksOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'all', period],
        queryFn: fetchTotalRisks
    });
}

// high risks
async function fetchHighRisks({queryKey}) {
    const response = await axios.get(`/risk/risks/high-risks/?interval=${queryKey[2]}`);
    return response.data;
}
export function highRisksOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'high', period],
        queryFn: fetchHighRisks
    });
}

// overdue risks
async function fetchOverdueRisks({queryKey}) {
    const response = await axios.get(`/risk/risks/total-risk/over-due/?interval=${queryKey[2]}`);
    return response.data;
}
export function overdueRisksOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'overdue', period],
        queryFn: fetchOverdueRisks
    });
}

// completed risks
async function fetchCompletedRisks({queryKey}) {
    const response = await axios.get(`/risk/risks/total-risk/complete/?interval=${queryKey[2]}`);
    return response.data;
}
export function completedRisksOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'completed', period],
        queryFn: fetchCompletedRisks
    });
}

// average risk severity
async function fetchAverageRiskSeverity({queryKey}) {
    const response = await axios.get(`/risk/risks/average-risk/?interval=${queryKey[2]}`);
    return response.data;
}
export function averageRiskSeverityOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'average-severity', period],
        queryFn: fetchAverageRiskSeverity
    });
}

// current risk score
async function fetchCurrentRiskScore({queryKey}) {
    const response = await axios.get(`/risk/risks/current-score/?interval=${queryKey[2]}`);
    return response.data;
}
export function currentRiskScoreOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'current-score', period],
        queryFn: fetchCurrentRiskScore
    });
}

// current risk status
async function fetchCurrentRiskStatus({queryKey}) {
    const response = await axios.get(`/risk/risks/current-status/?interval=${queryKey[2]}`);
    return response.data;
}
export function currentRiskStatusOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'current-status', period],
        queryFn: fetchCurrentRiskStatus
    });
}

// risk distribution by rating
async function fetchRiskDistributionByRating({queryKey}) {
    const response = await axios.get(`/risk/risks/risk-distributions/?interval=${queryKey[2]}`);
    return response.data;
}
export function riskDistributionByRatingOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'distribution-rating', period],
        queryFn: fetchRiskDistributionByRating
    });
}

// risk distribution by category
async function fetchRiskDistributionByCategory({queryKey}) {
    const response = await axios.get(`/risk/risks/risk-category-distributions/?interval=${queryKey[2]}`);
    return response.data;
}
export function riskDistributionByCategoryOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'distribution-category', period],
        queryFn: fetchRiskDistributionByCategory
    });
}

// action plan breakdown
async function fetchActionPlanBreakdown({queryKey}) {
    const response = await axios.get(`/risk/risks/risk-treatment-status-distributions/?interval=${queryKey[2]}`);
    return response.data;
}
export function actionPlanBreakdownOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'action-plan-breakdown', period],
        queryFn: fetchActionPlanBreakdown
    });
}

// control performance
async function fetchControlPerformance({queryKey}) {
    const response = await axios.get(`/risk/risks/control-performance/?interval=${queryKey[2]}`);
    return response.data;
}
export function controlPerformanceOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'control-performance', period],
        queryFn: fetchControlPerformance
    });
}

// net loss
async function fetchNetLoss({queryKey}) {
    const response = await axios.get(`/risk/risks/net-loss-risk-event/?interval=${queryKey[2]}`);
    return response.data;
}
export function netLossOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'net-loss', period],
        queryFn: fetchNetLoss
    });
}

// top ten risks
async function fetchTopTenRisks({queryKey}) {
    const response = await axios.get(`/risk/risks/top-ten-risks/?interval=${queryKey[2]}`);
    return response.data['top_ten_risks'];
}
export function topTenRisksOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'top-ten', period],
        queryFn: fetchTopTenRisks
    });
}

// loss event severity
async function fetchLossEventSeverity({queryKey}) {
    const response = await axios.get(`/risk/risks/loss-event-severity/?interval=${queryKey[2]}`);
    return response.data;
}
export function lossEventSeverityOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'loss-event-severity', period],
        queryFn: fetchLossEventSeverity
    });
}

// risk trend and cost
async function fetchRiskTrendAndCost({queryKey}) {
    const response = await axios.get(`/risk/risks/loss-event-severity/?interval=${queryKey[2]}`);
    return response.data;
}
export function riskTrendAndCostOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'risk-trend-and-cost', period],
        queryFn: fetchLossEventSeverity
    });
}

// inherent risk by period
async function fetchInherentRiskByPeriod({queryKey}) {
    const response = await axios.get(`/risk/risks/inherent-risk-period/?interval=${queryKey[2]}`);
    return response.data;
}
export function inherentRiskByPeriodOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'inherent-risk-by-period', period],
        queryFn: fetchInherentRiskByPeriod
    });
}

// residual risk by period
async function fetchResidualRiskByPeriod({queryKey}) {
    const response = await axios.get(`/risk/risks/residual-risk-period/?interval=${queryKey[2]}`);
    return response.data;
}
export function residualRiskByPeriodOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'residual-risk-by-period', period],
        queryFn: fetchResidualRiskByPeriod
    });
}

// top risks
async function fetchTopRisks({queryKey}) {
    const response = await axios.get(`/risk/risks/top-risks/?interval=${queryKey[2]}&top=${queryKey[3]}`);
    return response.data['top_risks'];
}
export function topRisksOptions(period, count) {
    return queryOptions({
        queryKey: ['risks', 'top', period, count],
        queryFn: fetchTopRisks
    });
}

// risks by category
async function fetchRisksByCategory({queryKey}) {
    const response = await axios.get(`/risk/risks/risk-category-graphs/?interval=${queryKey[2]}`);
    return response.data;
}
export function risksByCategory(period,) {
    return queryOptions({
        queryKey: ['risks', 'by-category', period],
        queryFn: fetchRisksByCategory
    });
}

// top loss events
async function fetchTopLossEvents({queryKey}) {
    const response = await axios.get(`/risk/risks/top-loss-events/?interval=${queryKey[2]}&top=${queryKey[3]}`);
    return response.data;
}
export function topLossEventsOptions(period, count) {
    return queryOptions({
        queryKey: ['risks', 'top-loss-events', period, count],
        queryFn: fetchTopLossEvents
    });
}

// control rate by period
async function fetchControlRateByPeriod({queryKey}) {
    const response = await axios.get(`/risk/risks/control-rate-period/?interval=${queryKey[2]}`);
    return response.data;
}
export function controlRateByPeriodOptions(period) {
    return queryOptions({
        queryKey: ['risks', 'contro-rate-by-period', period],
        queryFn: fetchControlRateByPeriod
    });
}