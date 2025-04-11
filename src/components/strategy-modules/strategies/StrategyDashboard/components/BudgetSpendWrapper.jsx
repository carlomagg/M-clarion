import { useContext } from "react";
import { StrategyContext } from "../StrategyDashboard";
import { useQuery } from "@tanstack/react-query";
import { strategyItemsOptions } from "../../../../../queries/strategies/strategy-queries";
import BudgetSpend from "./cards/BudgetSpend";
import DashboardWidgetLoadingIndicator from "../../../../partials/skeleton-loading-indicators/DashboardWidgetIndicator";
import { Error } from "./Error";

export default function BudgetSpendWrapper() {
    const {strategyId} = useContext(StrategyContext);

    const {isLoading, error, data} = useQuery(strategyItemsOptions(strategyId));

    if (isLoading) {
        return <DashboardWidgetLoadingIndicator classes={'p-4'} height={200} />;
    }
    if (error) {
        return <Error classes={'p-4'} />
    }
    
    const strategyComponents = data['data']['components'].map(c => ({id: c.id, name: c.name}));

    return strategyComponents.map(component => <BudgetSpend key={component.id} strategyComponent={component} />)
}