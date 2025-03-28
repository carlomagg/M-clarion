import { useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { GaugeChart } from "../Charts";
import { Card } from "../Elements";
import { totalStrategyHealthOptions } from "../../../../../../queries/strategies/dashboard";
import { StrategyContext } from "../../StrategyDashboard";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function TotalStrategyHealth() {
    const [period, setPeriod] = useState('Month');
    const { strategyId } = useContext(StrategyContext);

    // query
    const {isLoading, error, data} = useQuery(totalStrategyHealthOptions(strategyId, period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }
    
    return (
        <Card title="Total Strategy Health" options={[]} classes="p-4 w-full" selectedPeriod={period} onSelectPeriod={setPeriod}>
            <GaugeChart value={data.strategy_health_percentage} />
        </Card>
    );
}