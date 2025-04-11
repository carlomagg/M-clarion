import { useQuery } from "@tanstack/react-query";
import { completedRisksOptions } from "../../../../../../queries/risks/dashboard";
import { useState } from "react";
import { CustomCard } from "../Elements";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function CompletedRisksCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(completedRisksOptions(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'px-6 pt-6 pb-4'} />;
    }
    if (error) {
        return <Error classes={'px-6 pt-6 pb-4'} />;
    }

    return <CustomCard title={'Completed'} data={{value: data.total_complete_in_risk_register}} selectedPeriod={period} onSelectPeriod={setPeriod} />
}