import styles from './UserGroupMembers.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import { useRemoveUserGroupMembers, userGroupOptions, useUpdateUserGroupMembers, useUserGroupMembers } from '../../../../queries/permissions-queries';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersOptions } from '../../../../queries/users-queries';
import { filterItems } from '../../../../utils/helpers';
import { useEffect, useState } from 'react';
import LinkButton from '../../../partials/buttons/LinkButton/LinkButton';
import SearchField from '../../../partials/SearchField/SearchField';
import AddUserGroupMembersModal from '../../../partials/AddUserGroupMembersModal/AddUserGroupMembersModal';
import useUser from '../../../../hooks/useUser';
import LoadingIndicatorOne from '../../../partials/skeleton-loading-indicators/LoadingIndicatorOne';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import Error from '../../../partials/Error/Error';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';

function UserGroupMembers() {
    const user = useUser();
    const queryClient = useQueryClient();
    const [searchParams, _] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMembersIds, setSelectedMembersIds] = useState(new Set());
    const [showAddMembersForm, setShowAddMembersForm] = useState(false);

    const groupId = searchParams.get('g');

    // members and userGroup queries
    const {isLoading: usersQueryIsLoading, error: usersQueryError, data: users} = useQuery(usersOptions());
    const {isLoading: userGroupIsLoading, error: userGroupError, data: userGroup} = useQuery(userGroupOptions(groupId));
    const {isLoading: membersIsLoading, error: membersError, data: groupMembers} = useUserGroupMembers(groupId);

    // mutations for updating and deleting userGroup members
    const {mutate: updateMembers, isPending: isUpdatingMembers} = useUpdateUserGroupMembers({onSuccess, onError, onSettled: onUpdateSettled});
    const {mutate: removeMembers, isPending: isRemovingMembers} = useRemoveUserGroupMembers({onSuccess, onError});
    const dispatchMessage = useDispatchMessage()
    useEffect(() => {
        (isUpdatingMembers || isRemovingMembers) && dispatchMessage('processing', isUpdatingMembers ? 'Updating group members' : 'Removing members');
    }, [isUpdatingMembers, isRemovingMembers]);
    async function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['user-groups']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onUpdateSettled(data, error) {
        if (!error) setShowAddMembersForm(false);
    }

    function handleSelectMember(userId, isChecked) {
        const newSet = new Set(selectedMembersIds);
        if (isChecked) {
            newSet.add(userId);
        } else newSet.delete(userId);

        setSelectedMembersIds(newSet);
    }
    
    async function handleRemoveMembers() {
        removeMembers({groupId, data: {user_ids: Array.from(selectedMembersIds)}});
    }

    const isLoading = membersIsLoading || usersQueryIsLoading || userGroupIsLoading;
    const error = usersQueryError || membersError || userGroupError;
    
    if (isLoading) {
        return <LoadingIndicatorOne />
    }

    if (error) {
        return <Error error={error} />
    }

    const filteredMembers = filterItems(searchTerm, groupMembers, ['firstname', 'lastname', 'email']);

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={`User group members | ${userGroup.group_name}`} />
            <PageHeader>
                <div>
                    <LinkButton location={'/create-user-group'} text={'Create new user group'} />
                </div> 
            </PageHeader>
            <div className=''> {/* main content container */}
                {
                    showAddMembersForm &&
                    <AddUserGroupMembersModal updateMembers={updateMembers} groupMembers={groupMembers} groupId={groupId} />
                }
                <div className='mt-4 flex flex-col gap-6 rounded-lg bg-white border border-[#CCC] p-6'>
                    <div>
                        <h3 className='text-xl font-semibold'>{userGroup.group_name} members <span className='text-text-pink'>({userGroup.member_ids.length})</span></h3>
                    </div>
                    <SearchField placeholder={'Search user group'} searchTerm={searchTerm} onChange={setSearchTerm} />
                    <ul className='flex flex-col gap-6'>
                        {
                            filteredMembers
                            .map((member) => {
                                return (
                                    <li key={member.user_id} className='flex gap-3'>
                                        <input type="checkbox" name="" id="" checked={selectedMembersIds.has(member.user_id)} onChange={(e) => handleSelectMember(member.user_id, e.target.checked)} />
                                        <div className='flex flex-col gap-2'>
                                            <div className='font-medium'>
                                                {
                                                    member.firstname ?
                                                    <span>{member.firstname}{' '}{member.lastname}</span> :
                                                    member.email
                                                }
                                            </div>
                                            <span className='text-xs'>Added: {member.created_at}</span>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                    <div className='text-right'>
                        {
                            user.hasPermission('update_group_members') &&
                            <button type="button" onClick={() => setShowAddMembersForm(true)} className='py-[14px] px-3 text-sm text-text-pink font-medium select-none'>
                                Update members
                            </button>
                        }
                        {
                            user.hasPermission('update_group_members') &&
                            <button type="button" onClick={handleRemoveMembers} className='py-[14px] px-3 text-sm text-[red] font-medium select-none'>
                                Remove members
                            </button>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserGroupMembers;