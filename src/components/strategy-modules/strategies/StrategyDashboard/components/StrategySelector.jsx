import { useQuery } from "@tanstack/react-query";
import { StrategyDropdown } from "../../Index/Index";
import { strategiesOptions } from "../../../../../queries/strategies/strategy-queries";
import { Widget } from "./Elements";
import LoadingIndicatorContainer from "../../../../partials/skeleton-loading-indicators/LoadingIndicatorContainer";
import Skeleton from "react-loading-skeleton";

export default function StrategySelector({selectedStrategy, onSetStrategy}) {
    // fetch all strategies
    const {isLoading, error, data: strategies} = useQuery(strategiesOptions());

    if (isLoading) {
        return (
            <LoadingIndicatorContainer>
                <Skeleton style={{width: 200, height: 48}} />
            </LoadingIndicatorContainer>
        );
    }
    if (error) {
        return <div className="italic text-text-gray text-sm">Couldn't load strategies. Please refresh page.</div>
    }

    return (
        <Widget classes="w-fit">
            <StrategyDropdown strategies={strategies} selectedStrategy={selectedStrategy} setSelectedStrategy={onSetStrategy} shouldNavigate={false} />
        </Widget>
    );
}