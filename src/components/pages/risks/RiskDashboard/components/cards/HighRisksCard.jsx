import { useQuery } from "@tanstack/react-query";
import { CustomCard } from "../Elements";
import { highRisksOptions } from "../../../../../../queries/risks/dashboard";
import { useState } from "react";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function HighRisksCard() {
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(highRisksOptions(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'px-6 pt-6 pb-4'} />;
    }
    if (error) {
        return <Error classes={'px-6 pt-6 pb-4'} />;
    }

    return <CustomCard title={'High Risks'} data={{value: data.high_risk_count}} selectedPeriod={period} onSelectPeriod={setPeriod} />
}