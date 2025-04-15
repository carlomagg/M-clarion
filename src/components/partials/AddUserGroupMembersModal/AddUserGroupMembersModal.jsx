import { useEffect, useState } from 'react';
import styles from './AddUserGroupMembersModal.module.css';

import search from "../../../assets/icons/search.svg"
import { useUpdateUserGroupMembers, useUserGroupMembers } from '../../../queries/permissions-queries';
import SearchField from '../SearchField/SearchField';
import { filterItems } from '../../../utils/helpers';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersOptions } from '../../../queries/users-queries';

function AddUserGroupMembersModal({groupMembers, groupId, updateMembers}) {

    const [selectedMembersIds, setSelectedMembersIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    // const queryClient = useQueryClient();
    
    // query for getting all members in userGroup
    const {isLoading, error, data: allUsers} = useQuery(usersOptions());

    // // mutation for updating usergroup members
    // const {mutate, isPending: isUpdatingMembers} = useUpdateUserGroupMembers({onSuccess, onError, onSettled});
    // async function onSuccess(data) {
    //     return queryClient.invalidateQueries({queryKey: ['user-groups']});
    // }
    // function onError(error) {
    //     alert('could not updata group permissions');
    //     console.log(error.response)
    // }
    // function onSettled(data, error) {
    //     if (!error) removeModal();
    // }
    
    useEffect(() => {
        const newSet = new Set(selectedMembersIds);
        groupMembers.forEach(gM => newSet.add(gM.user_id));
        setSelectedMembersIds(newSet);
    }, [groupMembers]);

    function handleSelectMember(userId, isChecked) {
        const newSet = new Set(selectedMembersIds);
        if (isChecked) {
            newSet.add(userId);
        } else newSet.delete(userId);

        setSelectedMembersIds(newSet);
    }

    function handleUpdateGroupMembers() {
        updateMembers({groupId, data: {user_ids: Array.from(selectedMembersIds)}});
    }

    if (isLoading) {
        return <div>Fetching members</div>
    }

    if (error) {
        return <div>An error occured</div>
    }

    const filteredUsers = filterItems(searchTerm, allUsers, ['firstname', 'lastname', 'email']);

    const selectMemberItem = filteredUsers
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

    return (
        <div className='fixed top-0 left-0 z-20 w-full h-full bg-black/10 flex flex-col items-center justify-center'>
            <div className='bg-white p-6 rounded-lg border border-[#CCC] flex flex-col gap-6 w-full max-w-lg'>
                <h3 className='text-lg font-semibold'>Add members</h3>
                <SearchField placeholder={'Search users'} searchTerm={searchTerm} onChange={setSearchTerm} />
                <ul className='flex flex-col gap-5 max-h-96 overflow-auto'>
                    { selectMemberItem }
                </ul>
                <div className='text-right'>
                    <button type="button" onClick={handleUpdateGroupMembers} className='py-[14px] px-3 text-sm text-text-pink font-medium select-none'>
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddUserGroupMembersModal;