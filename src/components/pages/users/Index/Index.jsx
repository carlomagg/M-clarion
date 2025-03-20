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
    const allPermissions = permissionsQuery.data || { user: [], risk: [], core: [] };
    const admins = users.filter(user => user.is_admin === true);
    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Manage users'} />
            <PageHeader>
                <div className='flex gap-3 items-center'>
                    <LinkButton location={'add-new-user'} permission={'add_new_user'} text={'Add new user'} icon={plusIcon} />
                    <LinkButton location={'add-multiple-users?m=file'} permission={'add_mulitple_users_file'} text={'Add multiple users'} icon={plusIcon} />
                </div>
            </PageHeader>
            <div className=''> {/* main content container */}
                <div className='mt-4 flex flex-col gap-6'>
                    <section className='bg-white border border-[#CCCCCC] p-6 rounded-lg flex flex-col gap-6'>
                        <h3 className='text-[14px] font-normal'>Administrators</h3>
                        <ul className='flex flex-col gap-6'>
                            {
                                admins.map((admin, i) => {
                                    return (
                                        <li key={i} className='flex gap-4'>
                                            <UserAvatar firstName={admin.firstname} lastName={admin.lastname} email={admin.email} />
                                            <div className='flex flex-col gap-2 text-[#1D1B20]'>
                                                <div className='font-normal text-[12px] pt-1'>
                                                    {
                                                        admin.firstname ? 
                                                        <span>{admin.firstname}{' '}{admin.lastname}</span> :
                                                        admin.email
                                                    }
                                                </div>
                                                <div className='text-[12px]'>Last login: {admin.last_login || <span className='italic text-text-gray'>never</span>}</div>
                                            </div>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </section>
                    <UserAccounts {...{users, allUserGroups, allPermissions}} />
                </div>
            </div>
        </div>
    )
}

export default Index;