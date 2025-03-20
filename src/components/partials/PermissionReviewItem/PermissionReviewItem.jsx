import styles from './PermissionReviewItem.module.css';

import allowedIcon from '../../../assets/icons/encircled-check.svg'
import notAllowedIcon from '../../../assets/icons/invalid.svg'
import { useQuery } from '@tanstack/react-query';
import { permissionOptions } from '../../../queries/permissions-queries';

function PermissionReviewItem({permission, allowed}) {

    // fetch permission data
    const {isLoading, data: permData, error} = useQuery(permissionOptions(permission.id));

    if (isLoading) return <div>Loading</div>
    if (error) return <div>Error</div>

    let content;

    if (!permission.children) {
        content = (
            <li className='flex gap-2 items-center'>
                <img src={allowed ? allowedIcon : notAllowedIcon} alt="" />
                <span className={styles['capitalizeFirstLetter']}>{String(permData.name).replace(/_/g, ' ')}</span>
            </li>
        )
    } else {
        content = (
            <li className='flex flex-col gap-2'>
                <div className='flex gap-2 items-center'>
                    <img src={allowed ? allowedIcon : notAllowedIcon} alt="" />
                    <span className={styles['capitalizeFirstLetter']} >{String(permData.name).replace(/_/g, ' ')}</span>
                </div>
                <ul className='px-6 flex flex-col gap-2'> {/* children permssions */}
                    {permission.children.filter(perm => allowed ? perm.isSelected : !perm.isSelected).map(child_permission => {
                        return (
                            <PermissionReviewItem key={child_permission.id} permission={child_permission} allowed={child_permission.isSelected} />
                        )
                    })}
                </ul>
            </li>
        )
    }

    return content;
}

export default PermissionReviewItem;