import { useState } from "react";
import { Card } from "../Elements";
import { DoughnutChart } from "../Charts";
import { useQuery } from "@tanstack/react-query";
import { currentRiskStatusOptions } from "../../../../../../queries/risks/dashboard";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function CurrentRiskStatusCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(currentRiskStatusOptions(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }

    return (
        <Card title="Current Risk Status" selectedPeriod={period} onSelectPeriod={setPeriod} classes="p-4 w-full" options={[]}>
            <div className="flex gap-3 self-start">
                <DoughnutChart data={data.status_percentage} bgUrl={'./src/assets/icons/risk-status-chart.svg'} />
            </div>
        </Card>
    );
}