import FollowUpContext from "../contexts/follow-up";
import { FollowUpDialog } from "./FollowUpContent";
import { RiskEventDialog } from "./RiskEventContent";
import { RiskIndicatorDialog } from "./RiskIndicatorsContent";

export default function Modal({type, context, onRemove}) {
    let dialog;

    switch (type) {
        case 'followUp':
            dialog = <FollowUpContext.Provider value={context}>
                <FollowUpDialog onRemove={onRemove} />
            </FollowUpContext.Provider>;
            break;
        case 'riskEvent':
            dialog =<RiskEventDialog context={context} onRemove={onRemove} />;
            break;
        case 'riskIndicator':
            dialog = <RiskIndicatorDialog mode={context.mode} item={context.item} onSave={context.onSave} onRemove={onRemove} />;
            break;
    }

    return (
        <div className="fixed top-0 left-0 p-6 w-full h-full bg-black/30 z-50 grid place-items-center">
            {dialog}
        </div>
    );
}