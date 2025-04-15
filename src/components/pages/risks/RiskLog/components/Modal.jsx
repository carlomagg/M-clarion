import { FollowUpDialog } from "../../../../partials/forms/risk-register/RiskReview/components/FollowUpContent";
import FollowUpContext from "../../../../partials/forms/risk-register/RiskReview/contexts/follow-up";
import RiskIndicatorDialog from "../../../../settings/risk-management/ManageRiskIndicators/components/RiskIndicatorsDialog";

export default function Modal({type, context, onRemove}) {
    let dialog;

    switch (type) {
        case 'followUp':
            dialog = <FollowUpContext.Provider value={context}>
                <FollowUpDialog onRemove={onRemove} />
            </FollowUpContext.Provider>;
            break;
        case 'riskIndicator':
            dialog = <RiskIndicatorDialog context={context} onRemoveModal={onRemove} />;
            break;
    }

    return (
        <div className="fixed top-0 left-0 p-6 w-full h-full bg-black/30 z-50 grid place-items-center">
            {dialog}
        </div>
    );
}