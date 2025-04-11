import { useState } from "react";
import { Card } from "../Elements";
import { DoughnutChart } from "../Charts";
import { useQuery } from "@tanstack/react-query";
import { riskDistributionByRatingOptions } from "../../../../../../queries/risks/dashboard";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function RiskDistributionByRatingCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(riskDistributionByRatingOptions(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }

    return (
        <Card title="Risk Distribution By Rating" selectedPeriod={period} onSelectPeriod={setPeriod} classes="p-4 w-full" options={[]}>
            <div className="">
                <DoughnutChart data={data.risk_distributions} bgUrl='./src/assets/icons/risk-rating-chart.svg' />
            </div>
        </Card>
    );
}