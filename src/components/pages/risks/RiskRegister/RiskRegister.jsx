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
import { useState, useEffect } from 'react';
import AIOverview from './components/AIOverview';

function ManageRisk() {
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
    
    // Store the risk ID in state to ensure it persists across step changes
    const [currentRiskId, setCurrentRiskId] = useState(() => {
        // Initialize from session storage if available
        return sessionStorage.getItem('current_risk_id') || '';
    });

    // Save risk ID to session storage whenever it changes
    useEffect(() => {
        if (currentRiskId) {
            sessionStorage.setItem('current_risk_id', currentRiskId);
        }
    }, [currentRiskId]);

    const currentStep = steps[step.trim().toLowerCase()];
    let currentForm;

    function handleToggleAIAssistance(e) {
        setAllowAIAssistance(e.target.checked);
    }

    // Handler to update the current risk ID
    const handleRiskIdChange = (id) => {
        if (id && id !== currentRiskId) {
            console.log('Updating current risk ID:', id);
            setCurrentRiskId(id);
            
            // Log what's in session storage for debugging
            console.log('Session storage contents for this risk ID:');
            console.log('- Identification:', sessionStorage.getItem(`risk_identification_${id}`));
            console.log('- Analysis:', sessionStorage.getItem(`risk_analysis_${id}`));
            console.log('- Treatment plan:', sessionStorage.getItem(`risk_treatment_${id}`));
            console.log('- Review:', sessionStorage.getItem(`risk_review_${id}`));
        }
    };

    switch (currentStep) {
        case 'Risk Identification':
            currentForm = <RiskIdentificationForm 
                toggleAIAssistance={handleToggleAIAssistance} 
                {...{setRiskName, setRiskCategory, setRiskClass}}
                onRiskIdChange={handleRiskIdChange}
            />;
            break;
        case 'Risk Analysis':
            currentForm = <RiskAnalysisForm 
                currentRiskId={currentRiskId}
                onRiskIdChange={handleRiskIdChange}
            />;
            break;
        case 'Treatment Plan':
            currentForm = <TreatmentPlan 
                riskName={riskName}
                currentRiskId={currentRiskId}
                onRiskIdChange={handleRiskIdChange}
            />;
            break;
        case 'Review':
            currentForm = <RiskReview 
                mode={'form'}
                currentRiskId={currentRiskId}
                onRiskIdChange={handleRiskIdChange}
            />;
            break;
    }

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Enrol Risk'} />
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

export default ManageRisk;