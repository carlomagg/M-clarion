import { useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { GaugeChart } from "../Charts";
import { Card } from "../Elements";
import { StrategyContext } from "../../StrategyDashboard";
import { currentInitiativeHealthOptions } from "../../../../../../queries/strategies/dashboard";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function CurrentInitiativeHealth() {
    const [period, setPeriod] = useState('Month');
    const { strategyId } = useContext(StrategyContext);

    // query
    const {isLoading, error, data} = useQuery(currentInitiativeHealthOptions(strategyId, period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }
    
    return (
        <Card title="Current Initiative Health" options={[]} classes="p-4 w-full" selectedPeriod={period} onSelectPeriod={setPeriod}>
            <GaugeChart value={data.initiative_health_percentage} />
        </Card>
    );
}