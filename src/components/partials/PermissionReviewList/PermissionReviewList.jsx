import { useState } from 'react';
import styles from './PermissionReviewList.module.css';

import chevron_down from '../../../assets/icons/chevron-down.svg'
import PermissionReviewItem from '../PermissionReviewItem/PermissionReviewItem';


function PermissionReviewList({permissions, allowed}) {

    const [isCollapsed, setIsCollapsed] = useState(false);

    let permissionItems
    if (allowed) {
        permissionItems = permissions.filter(perm => perm.isSelected).map(permission => <PermissionReviewItem key={permission.id} permission={permission} allowed={true} />)
    } else {
        permissionItems = permissions.filter(perm => !perm.isSelected).map(permission => <PermissionReviewItem key={permission.id} permission={permission} allowed={false} />)
    }


    return (
        <>
            <div className='bg-[#DEDEDE] rounded-t-lg py-5 px-4 flex'>
                <span className='font-semibold grow'>{allowed ? 'Allowed permissions' : 'Not allowed'}</span>
                <div className='pr-5 flex gap-2 cursor-pointer items-center' onClick={() => setIsCollapsed(!isCollapsed)}>
                    <span className='text-sm text-text-pink'>{isCollapsed ? 'Expand' : 'Collapse'}</span>
                    <img src={chevron_down} className={isCollapsed ? '' : 'rotate-180'} alt="icon" />
                </div>
            </div>
            <div className={`${isCollapsed ? 'max-h-0' : 'max-h-none'} overflow-hidden `}>
                <ul className='px-6 flex flex-col gap-4'>
                    {permissionItems}
                </ul>
            </div>
        </>
    );
}

export default PermissionReviewList;