import { useQuery } from "@tanstack/react-query";
import { CustomCard } from "../Elements";
import { overdueRisksOptions } from "../../../../../../queries/risks/dashboard";
import { useState } from "react";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function OverdueRisksCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(overdueRisksOptions(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'px-6 pt-6 pb-4'} />;
    }
    if (error) {
        return <Error classes={'px-6 pt-6 pb-4'} />;
    }

    return <CustomCard title={'Overdue Risks'} data={{value: data.total_overdue_in_risk_register
    }} selectedPeriod={period} onSelectPeriod={setPeriod} />
}