import { useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { GaugeChart } from "../Charts";
import { Card } from "../Elements";
import { StrategyContext } from "../../StrategyDashboard";
import { currentTacticHealthOptions } from "../../../../../../queries/strategies/dashboard";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function CurrentTacticHealth() {
    const [period, setPeriod] = useState('Month');
    const { strategyId } = useContext(StrategyContext);

    // query
    const {isLoading, error, data} = useQuery(currentTacticHealthOptions(strategyId, period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }
    
    return (
        <Card title="Current Tactic Health" options={[]} classes="p-4 w-full" selectedPeriod={period} onSelectPeriod={setPeriod}>
            <GaugeChart value={data.tactics_health_percentage} />
        </Card>
    );
}