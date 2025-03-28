import { useEffect, useState } from 'react';
import styles from './ViewUserGroupMembersModal.module.css';

import search from "../../../assets/icons/search.svg"
import { useUserGroupMembers } from '../../../queries/permissions-queries';
import SearchField from '../SearchField/SearchField';
import { filterItems } from '../../../utils/helpers';

function ViewUserGroupMembersModal({userGroup}) {

    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // query for getting all members in userGroup
    const {isLoading, error, data: userGroupMembers} = useUserGroupMembers(userGroup.permission_group_id);
    
    useEffect(() => {
        if (userGroupMembers) setMembers(userGroupMembers);
    }, [userGroupMembers]);

    function handleSelectMember(id, isChecked) {
        setMembers(members.map((member, i) => {
            if (i == id) return {...member, isSelected: isChecked};
            else return member;
        }))
    }

    if (isLoading) {
        return <div>Fetching members</div>
    }

    if (error) {
        return <div>An error occured</div>
    }

    const filteredMembers = filterItems(searchTerm, members, ['firstname', 'lastname', 'email']);

    const selectMemberItem = filteredMembers
    .map((member, i) => {
        return (
            <li key={i} className='flex gap-3'>
                <input type="checkbox" name="" id="" checked={member.isSelected} onChange={(e) => handleSelectMember(i, e.target.checked)} />
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
                <h3 className='text-lg font-semibold'>{userGroup.group_name} members</h3>
                <SearchField placeholder={'Search group members'} searchTerm={searchTerm} onChange={setSearchTerm} />
                <ul className='flex flex-col gap-5'>
                    { selectMemberItem }
                </ul>
                <div className='text-right'>
                    <button type="button" className='py-[14px] px-3 text-sm text-text-pink font-medium select-none'>
                        Add members
                    </button>
                    <button type="button" className='py-[14px] px-3 text-sm text-[red] font-medium select-none'>
                        Remove members
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ViewUserGroupMembersModal;