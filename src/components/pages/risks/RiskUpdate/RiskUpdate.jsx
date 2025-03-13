import styles from './RiskUpdate.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import { useParams, useSearchParams } from 'react-router-dom';
import RiskIdentificationForm from '../../../partials/forms/risk-register/RiskIdentificationForm/RiskIdentificationForm';
import RiskAnalysisForm from '../../../partials/forms/risk-register/RiskAnalysisForm/RiskAnalysisForm';
import TreatmentPlan from '../../../partials/forms/risk-register/TreatmentPlan/TreatmentPlan';

function RiskUpdate() {
    const [searchParams, _] = useSearchParams();
    const section = searchParams.get('section');

    let content;
    switch (section) {
        case 'identification':
            content = <RiskIdentificationForm mode={'update'} />;
            break;
        case 'analysis':
            content = <RiskAnalysisForm mode={'update'} />;
            break;
        case 'treatment-plan':
            content = <TreatmentPlan mode={'update'} />;
            break;
        default:
            content = <div>No valid section selected</div>
            break;
    }

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Risk Update'} />
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