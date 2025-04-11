import { useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { GaugeChart } from "../Charts";
import { Card } from "../Elements";
import { StrategyContext } from "../../StrategyDashboard";
import { currentMetricHealthOptions } from "../../../../../../queries/strategies/dashboard";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function CurrentMetricHealth() {
    const [period, setPeriod] = useState('Month');
    const { strategyId } = useContext(StrategyContext);

    // query
    const {isLoading, error, data} = useQuery(currentMetricHealthOptions(strategyId, period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }
    
    return (
        <Card title="Current Metric Health" options={[]} classes="p-4 w-full" selectedPeriod={period} onSelectPeriod={setPeriod}>
            <GaugeChart value={data.metric_health_percentage} />
        </Card>
    );
}