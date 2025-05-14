import { useNavigate, useSearchParams } from "react-router-dom";
import Stepper from "../../../../partials/Stepper/Stepper";
import { AIOverviewButton } from "./AIOverview";

export default function RiskStepper({steps, currentStep, allowAIAssitance, showAIOverview, hideAIOverview}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const riskID = searchParams.get('id');
    const stepKeys = Object.keys(steps);
    const navigate = useNavigate();
    function handleShowStep(step) {
        hideAIOverview();
        navigate(`/risks/manage/${step}${riskID ? '?id='+riskID : ''}`);
    }
    return (
        <div className="flex gap-6 items-center">
            {
                allowAIAssitance &&
                <AIOverviewButton onClick={showAIOverview} />
            }
            <div className="w-full">
                <Stepper currentStep={currentStep} steps={stepKeys.map(step => ({name: steps[step], show: () => handleShowStep(step)} ))} />
            </div>
        </div>
    );
}