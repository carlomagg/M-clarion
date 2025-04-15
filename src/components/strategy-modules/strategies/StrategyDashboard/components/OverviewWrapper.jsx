import { useQueries } from "@tanstack/react-query";
import { CustomCard } from "./Elements";
import { totalStrategyGoalsOptions, totalStrategyInitiativesOptions, totalStrategyMetricsOptions, totalStrategyObjectivesOptions, totalStrategyTacticsOptions } from "../../../../../queries/strategies/dashboard";
import LoadingIndicatorContainer from "../../../../partials/skeleton-loading-indicators/LoadingIndicatorContainer";
import Skeleton from "react-loading-skeleton";

export default function OverviewWrapper() {
    const [totalGoalsQuery, totalObjectivesQuery, totalInitiativesQuery, totalTacticsQuery, totalMetricsQuery] = useQueries({
        queries: [totalStrategyGoalsOptions(), totalStrategyObjectivesOptions(), totalStrategyInitiativesOptions(), totalStrategyTacticsOptions(), totalStrategyMetricsOptions()],
    });

    const isLoading = totalGoalsQuery.isLoading || totalObjectivesQuery.isLoading || totalInitiativesQuery.isLoading || totalTacticsQuery.isLoading || totalMetricsQuery.isLoading;
    const error = totalGoalsQuery.error || totalObjectivesQuery.error || totalInitiativesQuery.error || totalTacticsQuery.error || totalMetricsQuery.error;

    if (isLoading) {
        return (
            <LoadingIndicatorContainer>
                <div className="flex gap-3">
                    <div className="flex-1"><Skeleton style={{height: 96}} /></div>
                    <div className="flex-1"><Skeleton style={{height: 96}} /></div>
                    <div className="flex-1"><Skeleton style={{height: 96}} /></div>
                    <div className="flex-1"><Skeleton style={{height: 96}} /></div>
                    <div className="flex-1"><Skeleton style={{height: 96}} /></div>
                </div>
            </LoadingIndicatorContainer>
        );
    }
    if (error) {
        return <div className="italic text-text-gray text-sm">Error loading strategy overview. Please refresh page.</div>
    }

    return (
        <div className='flex gap-3'>
            <CustomCard title={'Total Goals'} data={{value: totalGoalsQuery.data, comment: 'On Track', statusColor: '#7BD148'}} />
            <CustomCard title={'Total Objectives'} data={{value: totalObjectivesQuery.data, comment: 'On Track', statusColor: '#7BD148'}} />
            <CustomCard title={'Total Initiatives'} data={{value: totalInitiativesQuery.data, comment: 'On Track', statusColor: '#7BD148'}} />
            <CustomCard title={'Total Tactics'} data={{value: totalTacticsQuery.data, comment: 'On Track', statusColor: '#7BD148'}} />
            <CustomCard title={'Total Metrics'} data={{value: totalMetricsQuery.data, comment: 'On Track', statusColor: '#7BD148'}} />
        </div>
    );
} 