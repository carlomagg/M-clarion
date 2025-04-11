import { useQuery } from "@tanstack/react-query";
import { averageRiskSeverityOptions } from "../../../../../../queries/risks/dashboard";
import { useState } from "react";
import { CustomCard } from "../Elements";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function AverageRiskSeverityCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(averageRiskSeverityOptions(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'px-6 pt-6 pb-4'} />;
    }
    if (error) {
        return <Error classes={'px-6 pt-6 pb-4'} />;
    }

    return <CustomCard title={'Average Risk Severity'} data={{value: Number(data.average_in_risk_register).toFixed(2)}} selectedPeriod={period} onSelectPeriod={setPeriod} />
}