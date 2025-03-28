import styles from './Index.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import checkIcon from '../../../../assets/icons/encircled-check.svg';
import plusIcon from '../../../../assets/icons/plus.svg';
import chevronIcon from '../../../../assets/icons/chevron-down.svg';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import LinkButton from '../../../partials/buttons/LinkButton/LinkButton';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { permissionsOptions, useDeleteUserGroup, userGroupsOptions } from '../../../../queries/permissions-queries';
import SearchField from '../../../partials/SearchField/SearchField';
import { filterItems } from '../../../../utils/helpers';
import useUser from '../../../../hooks/useUser';
import LoadingIndicatorTwo from '../../../partials/skeleton-loading-indicators/LoadingIndicatorTwo';
import Error from '../../../partials/Error/Error';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import useConfirmedAction from '../../../../hooks/useConfirmedAction';

function Index() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {confirmAction, confirmationDialog} = useConfirmedAction();

    const [searchTerm, setSearchTerm] = useState('');

    // userGroups query
    const [userGroupsQuery, permissionsQuery] = useQueries({
        queries: [userGroupsOptions(), permissionsOptions()]
    });

    // delete userGroup mutation
    const {mutate: deleteUserGroup, isPending: isDeletingUserGroup} = useDeleteUserGroup({onSuccess, onError, onSettled});
    // set global indicator message
    const dispatchMessage = useDispatchMessage()
    useEffect(() => {
        (isDeletingUserGroup) && dispatchMessage('processing', 'Deleting user group');
    }, [isDeletingUserGroup]);
    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['user-groups']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/user-groups');
    }

    function handleDeleteUserGroup(groupId) {
        confirmAction(() => deleteUserGroup({groupId}));
    }

    const isLoading = userGroupsQuery.isLoading || permissionsQuery.isLoading;
    const error = userGroupsQuery.error || permissionsQuery.error;

    if (isLoading) {
        return <LoadingIndicatorTwo />
    }
    
    if (error) {
        return <Error error={error} />
    }

    const filteredUserGroups = filterItems(searchTerm, userGroupsQuery.data, ['group_name']);
    const allPermissions = permissionsQuery.data;

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'User groups'} />
            <PageHeader>
                <div className='flex gap-3 items-center'>
                    <LinkButton location={'create-new'} permission={'create_user_group'} text={'Create new user group'} icon={plusIcon} />
                </div>
            </PageHeader>
            <div className=''> {/* main content container */}
                {confirmationDialog}
                <div className='mt-4 flex flex-col gap-6 rounded-lg bg-white border border-[#CCC] p-6'>
                    <div>
                        <h3 className='text-xl font-semibold'>Current user groups</h3>
                        <p>These tags control which files and resources the employee can use.</p>
                    </div>
                    <SearchField placeholder={'Search user groups'} searchTerm={searchTerm} onChange={setSearchTerm} />
                    <ul className='flex flex-col gap-6'>
                        {
                            filteredUserGroups.map((userGroup, i) => {
                                return (
                                    <li key={userGroup.permission_group_id} className='flex flex-col'>
                                        <UserGroupItem userGroup={userGroup} allPermissions={allPermissions} onDeleteUserGroup={handleDeleteUserGroup} />
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>
    )
}

function UserGroupItem({userGroup, allPermissions, onDeleteUserGroup}) {
    const user = useUser();
    const [isCollapsed, setIsCollapsed] = useState(true);

    const permissions = userGroup.permission_ids.map(permId => allPermissions.find(perm => perm.permission_id === permId)['name']);

    return (
        <>
            <div className='flex gap-4 items-center'>
                <span>&bull;</span>
                <div className='flex flex-col gap-2 text-[#1D1B20]'>
                    <div className='font-medium text-lg pt-1'>
                        {userGroup.group_name}{' '}({userGroup.member_ids.length})
                    </div>
                    <span>Created: {userGroup.created_at}</span>
                </div>
                <div className='ml-auto' onClick={() => setIsCollapsed(!isCollapsed)}>
                    <img src={chevronIcon} alt="" />
                </div>
            </div>
            <div className={`space-y-4 px-6 overflow-hidden transition-all ease-linear ${isCollapsed ? 'max-h-0': 'max-h-96'}`}>
                <div className='mt-4 space-y-4'>
                    <div className='font-medium'>Permissions</div>
                    <ul className='space-y-4 max-h-64 overflow-auto'>
                        {
                            permissions.map(perm => {
                                return (
                                    <li key={perm} className='flex gap-2'>
                                        <img src={checkIcon} alt="" />
                                        <span className={`text-[15px] ${styles.capitalizeFirstLetter}`}>{perm.replace(/_/g, ' ')}</span>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
                <ul className='flex gap-6'>
                    {
                        user.hasPermission('view_group_members') &&
                        <li className='text-text-pink font-medium text-[15px]'>
                            <NavLink to={'members?g='+userGroup.permission_group_id}>View members</NavLink>
                        </li>
                    }
                    {
                        user.hasPermission('edit_group_permissions') &&
                        <li className='text-text-pink font-medium text-[15px]'>
                            <NavLink to={'edit-permissions?g='+userGroup.permission_group_id}>Edit permissions</NavLink>
                        </li>
                    }
                    {
                        user.hasPermission('delete_user_group') &&
                        <li className='text-[red] font-medium text-[15px]'>
                            <button type="button" onClick={() => onDeleteUserGroup(userGroup.permission_group_id)}>Delete user group</button>
                        </li>
                    }
                </ul>
            </div>
        </>
    );
}

export default Index;