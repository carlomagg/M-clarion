import ControlEffectivenessDialog from "../ControlEffectiveness/components/ControlEffectivenessDialog";
import FamilyTypeDialog from "../ControlFamilyTypes/components/ControlFamilyTypeDialog";
import RiskAppetiteDialog from "../ManageRiskAppetite/components/AppetiteDialog";
import RiskCategoryDialog from "../ManageRiskClassification/components/RiskCategoryDialog";
import RiskClassDialog from "../ManageRiskClassification/components/RiskClassDialog";
import RiskIndicatorDialog from "../ManageRiskIndicators/components/RiskIndicatorsDialog";
import RiskBoundaryDialog from "../RiskBoundarySetup/components/RiskBoundaryDialog";
import ImpactFocusDialog from "../RiskMatrixSetup/components/ImpactFocusDialog";
import LikelihoodScoreDialog from "../RiskMatrixSetup/components/LikelihoodScoreDialog";
import RiskResponseDialog from "../RiskResponses/components/ResponseDialog";

export default function Modal({type, context, onRemove}) {
    let dialog;

    switch (type) {
        case 'likelihoodScore':
            dialog = <LikelihoodScoreDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'impactFocus':
            dialog = <ImpactFocusDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'riskBoundary':
            dialog = <RiskBoundaryDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'riskCategory':
            dialog = <RiskCategoryDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'riskClass':
            dialog = <RiskClassDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'riskAppetite':
            dialog = <RiskAppetiteDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'familyType':
            dialog = <FamilyTypeDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'riskResponse':
            dialog = <RiskResponseDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'riskIndicator':
            dialog = <RiskIndicatorDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'controlEffectiveness':
            dialog = <ControlEffectivenessDialog context={context} onRemoveModal={onRemove} />;
            break;
    }

    return (
        <div className="fixed top-0 left-0 py-6 w-full h-full bg-black/30 z-50 grid place-items-center">
            {dialog}
        </div>
    );
}