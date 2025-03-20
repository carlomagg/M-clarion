import { useState } from "react";
import { DoughnutChart } from "../Charts";
import { useQuery } from "@tanstack/react-query";
import { controlPerformanceOptions } from "../../../../../../queries/risks/dashboard";
import { Card } from "../Elements";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function ControlPerformanceCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(controlPerformanceOptions(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }

    const isEmpty = Object.keys(data.control_performance_distributions).length === 0;

    return (
        <Card title="Control Performance" selectedPeriod={period} onSelectPeriod={setPeriod} classes="p-4 w-full" options={[]}>
            {
                isEmpty ?
                <div className="italic text-text-gray text-sm">No data</div> :
                <DoughnutChart data={data.control_performance_distributions} bgUrl='./src/assets/icons/action-breakdown.svg' />
            }
        </Card>
    );
}