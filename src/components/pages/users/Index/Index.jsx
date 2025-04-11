import styles from './Index.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import UserAvatar from '../../../partials/UserAvatar/UserAvatar';
import UserAccounts from '../../../partials/UserAccounts/UserAccounts';
import LinkButton from '../../../partials/buttons/LinkButton/LinkButton';
import plusIcon from '../../../../assets/icons/plus.svg';
import { useQueries, useQuery } from '@tanstack/react-query';
import { usersOptions } from '../../../../queries/users-queries';
import { permissionsOptions, userGroupsOptions } from '../../../../queries/permissions-queries';
import ActionsDropdown from '../../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import LoadingIndicatorTwo from '../../../partials/skeleton-loading-indicators/LoadingIndicatorTwo';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import Error from '../../../partials/Error/Error';

function Index() {
    const links = [
        {text: 'Upload file', type: 'link', link: 'add-multiple-users?m=file', permission: 'add_mulitple_users_file'},
        {text: 'Add multiple emails', type: 'link', link: 'add-multiple-users?m=email', permission: 'add_multiple_users_emails'},
        {text: 'Add active directory', type: 'link', link: 'add-active-directory', permission: 'add_active_directory'}
    ];
    const [usersQuery, userGroupsQuery, permissionsQuery] = useQueries({
        queries: [usersOptions(), userGroupsOptions(), permissionsOptions()]
    })

    const isLoading = usersQuery.isLoading || userGroupsQuery.isLoading || permissionsQuery.isLoading;
    const error = usersQuery.error || userGroupsQuery.error;
    
    if (isLoading) {
        return <LoadingIndicatorTwo />
    }
    
    if (error) {
        return <Error error={error} />
    }
    
    const users = usersQuery.data;
    const allUserGroups = userGroupsQuery.data;
    const permissionsData = permissionsQuery.data || { user: [], risk: [], core: [] };
    
    // Transform permission IDs to handle both object and number formats
    const transformedUsers = users.map(user => ({
        ...user,
        permission_ids: user.permission_ids?.map(pid => 
            typeof pid === 'object' ? pid : { id: pid, name: '' }
        )
    }));

    const allPermissions = [
        ...(permissionsData.user || []).map(p => ({
            id: p.permission_id,
            permission_id: p.permission_id,
            name: p.name,
            description: p.description,
            type: 'user'
        })),
        ...(permissionsData.risk || []).map(p => ({
            id: p.permission_id,
            permission_id: p.permission_id,
            name: p.name,
            description: p.description,
            type: 'risk'
        })),
        ...(permissionsData.core || []).map(p => ({
            id: p.permission_id,
            permission_id: p.permission_id,
            name: p.name,
            description: p.description,
            type: 'core'
        }))
    ];
    const admins = transformedUsers.filter(user => user.is_admin === true);
    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'User Dashboard'} />
            <PageHeader>
                <div className='flex gap-3 items-center'>
                    <LinkButton location={'add-new-user'} permission={'add_new_user'} text={'Add new user'} icon={plusIcon} />
                    <LinkButton location={'add-multiple-users?m=file'} permission={'add_mulitple_users_file'} text={'Add multiple users'} icon={plusIcon} />
                </div>
            </PageHeader>
            <div className=''> {/* main content container */}
                <div className='mt-4 flex flex-col gap-6'>
                    <UserAccounts users={transformedUsers} allUserGroups={allUserGroups} allPermissions={allPermissions} />
                </div>
            </div>
        </div>
    )
}

export default Index;