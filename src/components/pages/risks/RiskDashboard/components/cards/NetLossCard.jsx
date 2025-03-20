import { useState } from "react";
import { Card } from "../Elements";
import { useQuery } from "@tanstack/react-query";
import { netLossOptions } from "../../../../../../queries/risks/dashboard";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function NetLossCard() {
    //  data={{value: '$3,345,565', comment: '3.4% Up From Last Year'}} status='red'
    const [period, setPeriod] = useState('Month');

    // query
    const {isLoading, error, data} = useQuery(netLossOptions(period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }

    return (
        <Card title={'Net Loss of Loss Event'} selectedPeriod={period} onSelectPeriod={setPeriod} classes="p-4 w-full">
            <div className="flex gap-3">
                <span className="font-bold">${data.total_cost}</span>
                {/* <Chip color={status} text={data.comment} /> */}
            </div>
        </Card>
    );
}