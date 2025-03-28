import { useQuery } from "@tanstack/react-query";
import OptionsDropdown from "../../../../../partials/dropdowns/OptionsDropdown/OptionsDropdown";
import { Dropdown, Widget } from "../Elements";
import { AreaChart } from "../Charts";
import { organizationalProgressChartOptions } from "../../../../../../queries/strategies/dashboard";
import { useContext, useState } from "react";
import { StrategyContext } from "../../StrategyDashboard";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function OrganizationalProgressChart() {
    const [period, setPeriod] = useState('Month');
    const { strategyId } = useContext(StrategyContext);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const targets = [10,20,30,40,50,60,70,80,90,100,110,120];
    const values = [20,33,55,50,53,47,68,70,85,101,117,133];

    // queries
    const {isLoading, error, data} = useQuery(organizationalProgressChartOptions(strategyId, 1, period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={400} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }

    console.log(data)

    return (
        <Widget classes={`flex flex-col gap-4 p-6`}>
            <div className="flex justify-between items-center self-stretch">
                <div className="flex gap-3 items-center">
                    <h4 className="font-medium text-sm whitespace-nowrap">Organisational Progress Chart(42%):</h4>
                    <Dropdown items={['All', 'Some', 'Few']} selected={'All'} onSelect={() => {}} hasBorder={true} />
                </div>
                <OptionsDropdown options={[{type: 'action', text: isCollapsed ? 'Expand' : 'Collapse', action: () => setIsCollapsed(!isCollapsed)}]} />
            </div>
            <hr className={`border border-[#CCC] self-stretch ${isCollapsed ? 'hidden' : ''}`} />
            {
                !isCollapsed &&
                <>
                    <AreaChart data={{targets, values}} />
                    <Dropdown items={['Day', 'Week', 'Month', 'Quarter', 'Year', 'Biannual']} selected={period} onSelect={setPeriod} />
                </>
            }
        </Widget>
    );
}