import { useQuery } from "@tanstack/react-query";
import OptionsDropdown from "../../../../../partials/dropdowns/OptionsDropdown/OptionsDropdown";
import { Dropdown, PeriodsDropdown, Widget } from "../Elements";
import { CircularProgress } from "../Charts";
import { useContext, useState } from "react";
import { StrategyContext } from "../../StrategyDashboard";
import { initiativeTableOptions } from "../../../../../../queries/strategies/dashboard";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function InitiativesTable() {
    const [period, setPeriod] = useState('Month');
    const { strategyId } = useContext(StrategyContext);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // queries
    const {isLoading, error, data: initiatives} = useQuery(initiativeTableOptions(strategyId, period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={400} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }
   
    function createRecordOptions(record) {
        return [];
    }

    return (
        <Widget classes={`flex flex-col gap-4 p-6`}>
            <div className="flex justify-between items-center self-stretch">
                <div className="flex gap-3 items-center">
                    <h4 className="font-medium text-sm whitespace-nowrap">Initiatives:</h4>
                    <Dropdown items={['Running', 'Some', 'Few']} selected={'Running'} onSelect={() => {}} hasBorder={true} />
                </div>
                <OptionsDropdown options={[{type: 'action', text: isCollapsed ? 'Expand' : 'Collapse', action: () => setIsCollapsed(!isCollapsed)}]} />
            </div>
            <hr className={`border border-[#CCC] self-stretch ${isCollapsed ? 'hidden' : ''}`} />
            {
                !isCollapsed &&
                <>
                    <div className='overflow-x-auto w-full'>
                        <div className='min-w-[1024px] rounded-lg text-[#3B3B3B] text-sm'>
                            <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                                <span className='py-4 flex-[2_0]'>Initiative Title</span>
                                <span className='py-4 flex-[1_0] text-center'>Budget Spend</span>
                                <span className='py-4 flex-[1_0] text-center'>Start Date</span>
                                <span className='py-4 flex-[1_0] text-center'>End Date</span>
                                <span className='py-4 flex-[1_0] text-center'>Progress</span>
                                <span className='py-4 flex-[1_0] text-center'>Owner</span>
                                <span className='py-4 flex-[.3_0]'></span>
                            </header>
                            <ul className='flex flex-col'>
                                {
                                    initiatives.map((initiative, i) => {
                                        return (
                                            <li key={i}>
                                                <TableRecord record={initiative} options={createRecordOptions(initiative)} />
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                    <PeriodsDropdown selected={period} onSelect={setPeriod} />
                </>
            }
        </Widget>
    );
}


function TableRecord({record, options}) {
    return (
        <div className='px-4 flex items-center gap-4'>
            <span className='py-2 flex-[2_0]'>{record.initiative_title}</span>
            <span className='py-2 flex-[1_0] flex justify-center'>
                <CircularProgress value={record.budget_spent} small={true} />
            </span>
            <span className='py-2 flex-[1_0] text-center'>{record.start_date}</span>
            <span className='py-2 flex-[1_0] text-center'>{record.end_date}</span>
            <span className='py-2 flex-[1_0] flex justify-center'>
                <CircularProgress value={record.progress} small={true} />
            </span>
            <span className='py-2 flex-[1_0] text-center'>{record.owner}</span>
            <span className='py-2 flex-[.3_0]'>
                <OptionsDropdown options={options} />
            </span>
        </div>
    );
}