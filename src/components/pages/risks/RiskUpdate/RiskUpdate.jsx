import styles from './RiskUpdate.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import { useParams, useSearchParams } from 'react-router-dom';
import RiskIdentificationForm from '../../../partials/forms/risk-register/RiskIdentificationForm/RiskIdentificationForm';
import RiskAnalysisForm from '../../../partials/forms/risk-register/RiskAnalysisForm/RiskAnalysisForm';
import TreatmentPlan from '../../../partials/forms/risk-register/TreatmentPlan/TreatmentPlan';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';

function RiskUpdate() {
    const { id } = useParams(); // Extract risk ID from URL params
    const [searchParams, _] = useSearchParams();
    const section = searchParams.get('section');
    const [riskName, setRiskName] = useState('');
    const [riskCategory, setRiskCategory] = useState('');
    const [riskClass, setRiskClass] = useState('');
    const dispatchMessage = useDispatchMessage();
    const queryClient = useQueryClient();

    // Log the ID to ensure it's correctly extracted
    console.log('RiskUpdate - ID from params:', id);
    console.log('RiskUpdate - Section:', section);

    // Ensure React Query prefetches the risk data
    useEffect(() => {
        // If there's an issue with data loading, try to invalidate the query
        // to force a refetch
        if (id) {
            console.log('Invalidating risk queries for ID:', id);
            queryClient.invalidateQueries({queryKey: ['risks', id]});
        }
    }, [id, queryClient]);

    // Create no-op function for toggleAIAssistance since it's required by RiskIdentificationForm
    const handleToggleAIAssistance = () => {};

    let content;
    switch (section) {
        case 'identification':
            content = <RiskIdentificationForm 
                        mode="update"
                        toggleAIAssistance={handleToggleAIAssistance}
                        setRiskName={setRiskName}
                        setRiskCategory={setRiskCategory}
                        setRiskClass={setRiskClass} 
                      />;
            break;
        case 'analysis':
            content = <RiskAnalysisForm mode="update" />;
            break;
        case 'treatment-plan':
            content = <TreatmentPlan mode="update" riskName={riskName} />;
            break;
        default:
            content = <div>No valid section selected</div>
            break;
    }

    const sectionTitles = {
        'identification': 'Update Risk Details',
        'analysis': 'Update Risk Analysis',
        'treatment-plan': 'Update Treatment Plan',
    };

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={sectionTitles[section] || 'Risk Update'} />
            <PageHeader />
            <div className='mt-4'> {/* main content container */}
                <section className=''>
                    {content}
                </section>
            </div>
        </div>
    )
}

export default RiskUpdate;