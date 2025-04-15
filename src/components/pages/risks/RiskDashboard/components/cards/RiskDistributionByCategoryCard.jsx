import { useState } from "react";
import { Card } from "../Elements";
import { DoughnutChart } from "../Charts";
import { useQuery } from "@tanstack/react-query";
import { riskDistributionByCategoryOptions } from "../../../../../../queries/risks/dashboard";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function RiskDistributionByCategoryCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(riskDistributionByCategoryOptions(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }

    const isEmpty = data.message;

    return (
        <Card title="Risk Distribution By Category" selectedPeriod={period} onSelectPeriod={setPeriod} classes="p-4 w-full" options={[]}>
            {
                isEmpty ?
                <div className="italic text-text-gray text-sm">{data.message}</div> :
                <DoughnutChart data={data.category_distributions} bgUrl='./src/assets/icons/risk-category-chart.svg' />
            }
        </Card>
    );
}