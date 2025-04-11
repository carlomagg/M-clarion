import { useState } from "react";
import { Dropdown, PaginationBar, PeriodsDropdown, Widget } from "../Elements";
import OptionsDropdown from "../../../../../partials/dropdowns/OptionsDropdown/OptionsDropdown";
import Table from "../../../components/Table";
import { topRisksOptions } from "../../../../../../queries/risks/dashboard";
import { useQuery } from "@tanstack/react-query";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function TopRisksCard() {
    const [currentPage, setCurrentPage] = useState(1);
    const [period, setPeriod] = useState('Year');
    const [count, setCount] = useState('10');
    const [isCollapsed, setIsCollapsed] = useState(false);

    function createRecordOptions(record) {
        return [];
    }

    // query
    const {isLoading, error, data: risks} = useQuery(topRisksOptions(period.toLowerCase(), count));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-6'} height={400} />;
    }
    if (error) {
        return <Error classes={'p-6'} />
    }

    return (
        <Widget classes={`flex flex-col gap-4 p-6`}>
            <div className="flex justify-between items-center self-stretch">
                <div className="flex gap-3 items-center">
                    <h4 className="font-medium text-sm whitespace-nowrap">Top Risks:</h4>
                    <Dropdown items={['5', '10', '20']} selected={count} onSelect={setCount} hasBorder={true} />
                </div>
                <OptionsDropdown options={[{type: 'action', text: isCollapsed ? 'Expand' :'Collapse', action: () => setIsCollapsed(!isCollapsed)}]} />
            </div>
            <hr className={`border border-[#CCC] self-stretch ${isCollapsed ? 'hidden' : ''}`} />
            {
                !isCollapsed &&
                <>
                    <Table type={'risk'} items={risks} hasSN={true} createRecordOptions={createRecordOptions} />
                    <div className="flex justify-between items-center">
                        <PeriodsDropdown selected={period} onSelect={setPeriod} />
                        <PaginationBar presentPage={currentPage} onSetPage={setCurrentPage} />
                    </div>
                </>
            }
        </Widget>
    );
}