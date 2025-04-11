import styles from './TemplateName.module.css';

import PageHeader from '../../partials/PageHeader/PageHeader';
import PageTitle from '../../partials/PageTitle/PageTitle';

function TemplateName() {
    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'TemplateName'} />
            <PageHeader />
            <div className=''> {/* main content container */}
                <div className='mt-4'>
                </div>
            </div>
        </div>
    )
}

export default TemplateName;