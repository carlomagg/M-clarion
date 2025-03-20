import styles from './RiskRegister.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import RiskIdentificationForm from '../../../partials/forms/risk-register/RiskIdentificationForm/RiskIdentificationForm';
import RiskAnalysisForm from '../../../partials/forms/risk-register/RiskAnalysisForm/RiskAnalysisForm';
import TreatmentPlan from '../../../partials/forms/risk-register/TreatmentPlan/TreatmentPlan';
import RiskReview from '../../../partials/forms/risk-register/RiskReview/RiskReview';
import { useParams } from 'react-router-dom';
import RiskQueue from './components/RiskQueue';
import RiskStepper from './components/RiskStepper';
import { useState } from 'react';
import AIOverview from './components/AIOverview';

function RiskRegister() {
    const [allowAIAssistance, setAllowAIAssistance] = useState(false);
    const [isAIOverviewVisible, setIsAIOverviewVisible] = useState(false);
    const {step = 'identification'} = useParams();
    const steps = {
        'identification': 'Risk Identification',
        'analysis': 'Risk Analysis',
        'treatment-plan': 'Treatment Plan',
        'review': 'Review'
    };

    const [riskName, setRiskName] = useState('');
    const [riskCategory, setRiskCategory] = useState('');
    const [riskClass, setRiskClass] = useState('');

    const currentStep = steps[step.trim().toLowerCase()];
    let currentForm;

    function handleToggleAIAssistance(e) {
        setAllowAIAssistance(e.target.checked);
    }

    switch (currentStep) {
        case 'Risk Identification':
            currentForm = <RiskIdentificationForm  toggleAIAssistance={handleToggleAIAssistance} {...{setRiskName, setRiskCategory, setRiskClass}} />;
            break;
        case 'Risk Analysis':
            currentForm = <RiskAnalysisForm />;
            break;
        case 'Treatment Plan':
            currentForm = <TreatmentPlan riskName={riskName} />;
            break;
        case 'Review':
            currentForm = <RiskReview mode={'form'} />;
            break;
    }

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Register New Risk'} />
            <PageHeader />
            <div className='mt-4 flex flex-col gap-6'> {/* main content container */}
                <RiskStepper {...{steps, currentStep}} allowAIAssitance={allowAIAssistance} showAIOverview={() => {setIsAIOverviewVisible(true)}} hideAIOverview={() => {setIsAIOverviewVisible(false)}} />
                {
                    isAIOverviewVisible ?
                    <AIOverview {...{riskName, riskCategory, riskClass}} /> :
                    <>
                    <section className=''>
                        {currentForm}
                    </section>
                    <RiskQueue />
                    </>
                }
            </div>
        </div>
    )
}

export default RiskRegister;