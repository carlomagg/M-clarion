import { useQuery } from "@tanstack/react-query";
import OptionsDropdown from "../../../../../partials/dropdowns/OptionsDropdown/OptionsDropdown";
import { Card, Chip, PeriodsDropdown, Widget } from "../Elements";
import { AreaChart } from "../Charts";
import chevronDownIcon from '../../../../../../assets/icons/chevron-down.svg';
import { useContext, useState } from "react";
import { StrategyContext } from "../../StrategyDashboard";
import { componentGoalsChartOptions } from "../../../../../../queries/strategies/dashboard";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function ComponentProgressChart({strategyComponent}) {

    const [period, setPeriod] = useState('Month');
    const { strategyId } = useContext(StrategyContext);

    // queries
    const {isLoading, error, data: componentGoals} = useQuery(componentGoalsChartOptions(strategyId, strategyComponent.id, period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={400} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }

    console.log(componentGoals)

    return (
        <Card title={`Component: ${strategyComponent.name}`} classes="gap-4 p-6" filterableByPeriod={true} selectedPeriod={period} onSelectPeriod={setPeriod} options={[]}>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-6">
                {
                    componentGoals.map((goal, i) => <li key={i}><ItemSection goal={goal} /></li>)
                }
            </ul>
        </Card>
    );
}

function ItemSection({goal}) {
    const [showObjectives, setShowObjectives] = useState(false);

    // const {targets, values} = goal;
    const targets = [10,20,30,40,50,60,70,80,90,100,110,120];
    const values = [20,33,55,50,53,47,68,70,85,101,117,133];

    return (
        <div className="border border-[#CCC] rounded-lg p-4 flex flex-col gap-3 self-start">
            <header className="flex justify-between items-center border-b border-b-[#CCC]">
                <h4 className="text-sm font-medium">{goal.title}</h4>
                <OptionsDropdown options={[]} />
            </header>
            <div className="h-96">
                <AreaChart data={{targets, values}} fillContainer={true} />
            </div>
            <div className="space-y-3">
                <p className="flex gap-3 items-center">
                    <span className="font-bold">{goal.completion_rate}% completion</span>
                    {/* <Chip text={item.progress.statusText} color={item.progress.statusColor} /> */}
                    <Chip text={'At Risk'} color={'#e23456'} />
                </p>
                {/* <p className="font-medium text-sm">Current Value: ${goal.currentValue}</p> */}
                <p className="font-medium text-sm">Due date: {goal.due}</p>
                <p className="font-medium text-sm">Owner: {goal.owner}</p>
            </div>
            <hr className="border-b border-b-[#CCC]" />
            <div className="text-sm font-medium flex flex-col gap-3">
                <button onClick={() => setShowObjectives(!showObjectives)} type="button" className="flex justify-between items-center w-full">
                    Objectives
                    <img src={chevronDownIcon} alt="chevron down icon" className={`${showObjectives ? 'rotate-180' : ''}`} />
                </button>
                {
                    showObjectives &&
                    <ul className="flex flex-col gap-3 list-disc">
                        {
                            goal.objectives.map((objective, i) => {
                                return (
                                    <li className="flex gap-2 items-center" key={i}>
                                        {objective.title}: ({objective.completion_rate}% complete)
                                        {/* <Chip text={objective.progress.statusText} color={objective.progress.statusColor} /> */}
                                    </li>
                                );
                            })
                        }
                    </ul>
                }
            </div>
        </div>
    );
}