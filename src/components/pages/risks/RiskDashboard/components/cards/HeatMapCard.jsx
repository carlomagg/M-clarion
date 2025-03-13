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

    const boundaries = riskBoundariesQuery.data;
    const matrixSize = riskMatrixSizeQuery.data;

    return (
        <Widget classes={`flex flex-col gap-4 p-6`}>
            <div className="flex justify-between items-center self-stretch">
                <div className="flex gap-3 items-center">
                    <h4 className="font-medium text-sm whitespace-nowrap">Heat Map(56):</h4>
                    {/* <Dropdown items={['All', 'Some', 'Few']} selected={'All'} onSelect={() => {}} hasBorder={true} /> */}
                </div>
                <div className="flex gap-3 items-center">
                    <OptionsDropdown options={[{type: 'action', text: isCollapsed ? 'Expand' :'Collapse', action: () => setIsCollapsed(!isCollapsed)}]} />
                </div>
            </div>
            <hr className={`border border-[#CCC] self-stretch ${isCollapsed ? 'hidden' : ''}`} />
            {
                !isCollapsed &&
                <>
                    <div>
                        <RiskHeatmapContext.Provider value={{levels: boundaries, size: matrixSize}}>
                            <RiskEvaluationHeatMap selected={selected}/>
                        </RiskHeatmapContext.Provider>
                    </div>
                </>
            }
        </Widget>
    );
}