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
import ProcessBoundaryDialog from "../../process-management/ProcessBoundarySetup/components/ProcessBoundaryDialog";

export default function Modal({type, context, onRemove}) {
    let content;

    switch (type) {
        case 'riskCategory':
            content = <RiskCategoryDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'riskClass':
            content = <RiskClassDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'riskIndicator':
            content = <RiskIndicatorDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'riskAppetite':
            content = <RiskAppetiteDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'riskBoundary':
            content = <RiskBoundaryDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'processBoundary':
            content = <ProcessBoundaryDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'controlFamilyType':
            content = <FamilyTypeDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'controlEffectiveness':
            content = <ControlEffectivenessDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'riskResponse':
            content = <RiskResponseDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'impactFocus':
            content = <ImpactFocusDialog context={context} onRemoveModal={onRemove} />;
            break;
        case 'likelihoodScore':
            content = <LikelihoodScoreDialog context={context} onRemoveModal={onRemove} />;
            break;
        default:
            content = <div>Modal type not supported</div>
    }

    return (
        <div className='fixed overflow-auto top-0 left-0 z-40 w-screen h-screen bg-gray-500/50 grid place-items-center'>
            {content}
        </div>
    );
}