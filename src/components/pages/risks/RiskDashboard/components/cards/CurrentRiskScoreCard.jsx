import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { currentRiskScoreOptions } from "../../../../../../queries/risks/dashboard";
import { GaugeChart } from "../Charts";
import { Card, Dropdown } from "../Elements";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function CurrentRiskScoreCard() {
    const [period, setPeriod] = useState('Month');
    const [riskFilter, setRiskFilter] = useState('All Risks');

    // query
    const {isLoading, error, data} = useQuery(currentRiskScoreOptions(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }
    
    return (
        <Card title="Current Risk Score" classes="p-4 w-full" selectedPeriod={period} onSelectPeriod={setPeriod}>
            <div className="flex flex-col">
                <GaugeChart value={data.total_current_risk_score} />
                <div className="self-center">
                    <Dropdown items={['All Risks', 'Some Risks', 'Few Risks']} selected={riskFilter} onSelect={setRiskFilter} hasBorder={true} />
                </div>
            </div>
        </Card>
    );
}