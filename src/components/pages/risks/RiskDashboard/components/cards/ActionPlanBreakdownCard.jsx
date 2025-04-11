import { useState } from "react";
import { Card } from "../Elements";
import { DoughnutChart } from "../Charts";
import { useQuery } from "@tanstack/react-query";
import { actionPlanBreakdownOptions } from "../../../../../../queries/risks/dashboard";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function ActionPlanBreakdownCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(actionPlanBreakdownOptions(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }

    const isEmpty = data.message;

    return (
        <Card title="Action Plan Breakdown" selectedPeriod={period} onSelectPeriod={setPeriod} classes="p-4 w-full" options={[]}>
            {
                isEmpty ?
                <div className="italic text-text-gray text-sm">{data.message}</div> :
                <DoughnutChart data={data.treatment_status_distribution} bgUrl='./src/assets/icons/action-breakdown.svg' />
            }
        </Card>
    );
}