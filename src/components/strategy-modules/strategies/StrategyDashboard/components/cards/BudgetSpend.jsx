import { useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { CircularProgress, GaugeChart } from "../Charts";
import { Card } from "../Elements";
import { StrategyContext } from "../../StrategyDashboard";
import { componentBudgetSpendOptions } from "../../../../../../queries/strategies/dashboard";
import { formatAmount } from "../../../../../../utils/helpers";
import DashboardWidgetLoadingIndicator from "../../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "../Error";

export default function BudgetSpend({strategyComponent}) {
    const [period, setPeriod] = useState('Month');
    const { strategyId } = useContext(StrategyContext);

    // query
    const {isLoading, error, data: budget} = useQuery(componentBudgetSpendOptions(strategyId, strategyComponent.id, period.toLowerCase()));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }

    const {total_spent, total_remaining, total_budget} = budget;
    const budgetSpendPercentage = total_budget && Number((total_spent / total_budget) * 100).toFixed(2);
    
    return (
        <Card title={`Budget Spend: ${strategyComponent.name}`} classes="p-4 w-full" selectedPeriod={period} onSelectPeriod={setPeriod}>
            <div className="flex flex-col gap-3 items-center">
                <CircularProgress value={budgetSpendPercentage} />
                <div className="text-sm font-medium text-center">
                    <p>Spent: ${formatAmount(total_spent)}</p>
                    <p>Remain: ${formatAmount(total_remaining)}</p>
                    <p>Total Budget: ${formatAmount(total_budget)}</p>
                </div>
            </div>
        </Card>
    );
}