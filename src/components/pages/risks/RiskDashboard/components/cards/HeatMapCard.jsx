import { useQueries, useQuery } from "@tanstack/react-query";
import OptionsDropdown from "../../../../../partials/dropdowns/OptionsDropdown/OptionsDropdown";
import RiskEvaluationHeatMap, { RiskHeatmapContext } from "../../../../../partials/forms/risk-register/components/RiskEvaluationHeatMap";
import { riskBoundariesOptions } from "../../../../../../queries/risks/risk-boundaries";
import { Dropdown, Widget } from "../Elements";
import { riskMatrixSizeOptions } from "../../../../../../queries/risks/risk-likelihood-matrix";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";
import { useState } from "react";

export default function HeatMapCard() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const selected = [
        {likelihood: 3, impact: 1},
        {likelihood: 5, impact: 4},
        {likelihood: 3, impact: 4},
        {likelihood: 2, impact: 2},
        {likelihood: 1, impact: 5},
        {likelihood: 1, impact: 2},
        {likelihood: 3, impact: 5},
        {likelihood: 4, impact: 3},
        {likelihood: 5, impact: 2},
        {likelihood: 4, impact: 2},
    ];

    // queries
    const [riskBoundariesQuery, riskMatrixSizeQuery] = useQueries({
        queries: [riskBoundariesOptions(), riskMatrixSizeOptions()]
    });

    const isLoading = riskBoundariesQuery.isLoading || riskMatrixSizeQuery.isLoading;
    const error = riskBoundariesQuery.error || riskMatrixSizeQuery.error;

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-6'} height={400} />;
    }
    if (error) {
        return <Error classes={'p-6'} />
    }

    // Ensure data exists and default to empty array if not
    const boundaries = riskBoundariesQuery.data || [];
    const matrixSize = riskMatrixSizeQuery.data || 5; // Default to 5x5 matrix if no size specified

    return (
        <Widget
            title={'Risk Heat Map'}
            className={'flex-1 py-3 '}
            rightContent={
                <div className='flex gap-4 items-center'>
                    <OptionsDropdown
                        className={'p-1 hover:bg-[#EFEFEF] rounded-full mr-2'}
                        options={[
                            { text: 'Edit', type: 'action', action: () => { } },
                        ]}
                    />
                </div>
            }
        >
            <RiskHeatmapContext.Provider value={{ levels: boundaries, size: matrixSize }}>
                <RiskEvaluationHeatMap selected={selected} />
            </RiskHeatmapContext.Provider>
        </Widget>
    );
}