import styles from './PageHeader.module.css';

import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

function PageHeader({children}) {
    return (
        <div className='h-9 flex relative justify-between'>
            <Breadcrumbs />
            {children}
        </div>
    )
}

export default PageHeader;