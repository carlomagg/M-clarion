import { useEffect, useRef, useState } from 'react';
import styles from './UserAccounts.module.css';

import optionsIcon from '../../../assets/icons/options.svg';
import checkIcon from '../../../assets/icons/encircled-check.svg';
import chevronIcon from '../../../assets/icons/chevron-down.svg';
import { NavLink, useNavigate } from 'react-router-dom';
import SearchField from '../SearchField/SearchField';
import { useActivateAccounts, useDeleteAccount, useSuspendAccounts } from '../../../queries/users-queries';
import { useQueryClient } from '@tanstack/react-query';
import { filterItems, toTimestamp } from '../../../utils/helpers';
import useUser from '../../../hooks/useUser';
import useDispatchMessage from '../../../hooks/useDispatchMessage';
import useConfirmedAction from '../../../hooks/useConfirmedAction';
import { PencilSquareIcon, PauseCircleIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import UserAvatar from '../UserAvatar/UserAvatar';

function UserAccounts({users, allUserGroups, allPermissions}) {

    const authenticatedUser = useUser();
    const menuRef = useRef(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [filterGroup, setFilterGroup] = useState('all');
    const [menuCollapsed, setMenuCollapsed] = useState(true);
    const [inSelectionMode, setInSelectionMode] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]); // ids of selected users
    const {confirmAction, confirmationDialog} = useConfirmedAction();

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        function removeMenu(e) {
            if (!menuRef.current.contains(e.target)) setMenuCollapsed(true);
        }

        // when menu is expanded, collpase it when a part of the window without it is clicked
        if (!menuCollapsed) document.addEventListener('click', removeMenu)
        return () => {
            document.removeEventListener('click', removeMenu);
        }
    }, [menuCollapsed]);

    // suspend, activate and delete accounts mutations. called either on single account or selected accounts
    const {mutate: suspendAccounts, isPending: isSuspendingAccounts} = useSuspendAccounts({onSuccess, onError, onSettled});
    const {mutate: activateAccounts, isPending: isActivatingAccounts} = useActivateAccounts({onSuccess, onError, onSettled});
    const {mutate: deleteAccount, isPending: isDeletingAccount} = useDeleteAccount({onSuccess, onError, onSettled});

    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = '';
        if (isSuspendingAccounts) {
            text = 'Suspending ';
        } else if (isActivatingAccounts) {
            text = 'Activating ';
        } else if (isDeletingAccount) {
            text = 'Deleting ';
        }

        text += selectedUsers.length > 1 ? 'accounts' : 'account';

        (isSuspendingAccounts || isActivatingAccounts || isDeletingAccount) && dispatchMessage('processing', text);
    }, [isSuspendingAccounts, isActivatingAccounts, isDeletingAccount]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['users']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('error', error.response.data.message);
    }
    function onSettled() {
        setInSelectionMode(false);
        setSelectedUsers([]);
        navigate('/users');
    }


    function handleFilterChange(filter) {
        setFilterGroup(filter);
    };

    function filterByGroup() {
        if (filterGroup === 'all') return users;
        if (filterGroup === 'recent') {
            // return users created within 24 hours
            const presentTime = new Date().getTime();
            return (users.filter(user => presentTime - toTimestamp(user.created_at) <= 60 * 60 * 24 * 1000));
        }
        else return users.filter(user => user.group_ids.includes(filterGroup));
    }

    function handleToggleSelect(userId, checked) {
        if (checked) setSelectedUsers([...selectedUsers, userId]);
        else setSelectedUsers(selectedUsers.filter(id => id != userId));
    }

    function handleSuspendAccounts(accounts) {
        suspendAccounts({user_ids: accounts});
    }

    function handleActivateAccounts(accounts) {
        activateAccounts({user_ids: accounts});
    }

    function handleDeleteAccount(userId) {
        confirmAction(() => deleteAccount({userId}));
    }

    users = users.map(user => ({...user, isSelected: false}));
    const filteredUsers = filterItems(searchTerm, filterByGroup(users), ['firstname', 'lastname', 'email']);

    const defaultMenu = (
        <ul className='border-[1.5px] border-[#B3B3B3] rounded-lg'>
            <li onClick={() => setInSelectionMode(true)} className='py-2 px-4 text-[12px] text-[#080808] font-normal cursor-pointer'>Select users</li>
            {
                authenticatedUser.hasPermission('user_groups') &&
                <li className='py-2 px-4 text-[12px] text-[#080808] font-normal cursor-pointer'>
                    <NavLink to={'/user-groups'}>Edit user groups</NavLink>
                </li>
            }
            {
                authenticatedUser.hasPermission('create_user_group') &&
                <li className='py-2 px-4 text-[12px] text-[#080808] font-normal cursor-pointer'>
                    <NavLink to={'/user-groups/create-new'}>Create new user group</NavLink>
                </li>
            }
        </ul>
    );

    const selectionMenu = (
        <ul className='border-[1.5px] border-[#B3B3B3] rounded-lg'>
            {
                authenticatedUser.hasPermission('suspend_account') &&
                <li
                onClick={() => {setMenuCollapsed(true); handleSuspendAccounts(users.filter(user => selectedUsers.includes(user.user_id)).map(user => user.user_id))}}
                className='py-2 px-4 text-[12px] text-[#080808] font-normal cursor-pointer'>
                    Suspend selection
                </li>
            }
            {
                authenticatedUser.hasPermission('activate_account') &&
                <li
                onClick={() => {setMenuCollapsed(true); handleActivateAccounts(users.filter(user => selectedUsers.includes(user.user_id)).map(user => user.user_id))}}
                className='py-2 px-4 text-[12px] text-[#080808] font-normal cursor-pointer'>
                    Activate selection
                </li>
            }
            <li onClick={() => {setSelectedUsers([]); setInSelectionMode(false)}} className='py-2 px-4 text-[12px] text-[#080808] font-normal cursor-pointer'>Cancel selection</li>
        </ul>
    );

    return (
        <section className='bg-white border border-[#CCCCCC] p-6 rounded-lg flex flex-col gap-6'>
            {confirmationDialog}
            <div className='flex flex-col gap-3'>
                <h3 className='text-[12px] font-normal'>User accounts {' '}<span className='font-normal'>({users.length})</span></h3>
                <SearchField placeholder={'Search users by first name, last name or email'} {...{searchTerm, onChange: setSearchTerm}} />
                <div className='flex relative'>
                    <ul className='grow flex items-stretch gap-6 overflow-auto no-scrollbar'>
                        <li onClick={() => handleFilterChange('all')} className={`px-1 whitespace-nowrap text-[12px] flex items-center cursor-pointer ${filterGroup === 'all' ? 'border-b-2 border-b-text-pink text-text-pink' : 'text-[#3B3B3B]'}`}>All users</li>
                        <li onClick={() => handleFilterChange('recent')} className={`px-1 whitespace-nowrap text-[12px] flex items-center cursor-pointer ${filterGroup === 'recent' ? 'border-b-2 border-b-text-pink text-text-pink' : 'text-[#3B3B3B]'}`}>Recently added</li>
                        {
                            allUserGroups.map(uG => {
                                return (
                                    <li key={uG.permission_group_id} onClick={() => handleFilterChange(uG.permission_group_id)} className={`px-1 whitespace-nowrap text-[12px] flex items-center cursor-pointer ${filterGroup === uG.permission_group_id ? 'border-b-2 border-b-text-pink text-text-pink' : 'text-[#3B3B3B]'}`}>{uG.group_name}</li>
                                )
                            })
                        }
                    </ul>
                    <span onClick={(e) => {e.stopPropagation(); setMenuCollapsed(!menuCollapsed)}}>
                        <img src={optionsIcon} alt="" />
                    </span>
                    {
                        !menuCollapsed &&
                        <div ref={menuRef} className='absolute top-full right-0 mt-4 bg-white'>
                            {inSelectionMode ? selectionMenu : defaultMenu}
                        </div>
                    }
                </div>
            </div>
            <ul className='flex flex-col gap-6'>
                {
                    filteredUsers.map(user => {
                        return (
                            <li key={user.user_id} className='flex flex-col'>
                                <UserAccountItem {...{inSelectionMode, user, allPermissions, selectedUsers, handleToggleSelect}} onSuspendAccount={handleSuspendAccounts} onActivateAccount={handleActivateAccounts} onDeleteAccount={handleDeleteAccount} />
                            </li>
                        );
                    })
                }
            </ul>
        </section>
    );
}

function UserAccountItem({user, allPermissions, inSelectionMode, selectedUsers, handleToggleSelect, onSuspendAccount, onActivateAccount, onDeleteAccount}) {
    const authenticatedUser = useUser();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(true);

    function handleEditUser() {
        navigate(`/users/add-new-user?u=${user.user_id}`);
    }

    return (
        <div className='flex flex-col gap-2'>
            <div className='flex gap-4 items-center'>
                {
                    inSelectionMode &&
                    <input type='checkbox' className='w-4 h-4' checked={selectedUsers.includes(user.user_id)} onChange={(e) => handleToggleSelect(user.user_id, e.target.checked)} />
                }
                <UserAvatar firstName={user.firstname} lastName={user.lastname} email={user.email} size="sm" />
                <div className='flex flex-col gap-2 text-[#1D1B20] grow'>
                    <div className='font-normal text-[12px] pt-1'>
                        {
                            user.firstname ? 
                            <span>{user.firstname}{' '}{user.lastname}</span> :
                            user.email
                        }
                    </div>
                    <div className='text-[12px]'>Last login: {user.last_login || <span className='italic text-text-gray'>never</span>}</div>
                </div>
                {
                    !inSelectionMode &&
                    <div className='flex items-center gap-2'>
                        {
                            authenticatedUser.hasPermission('edit_user') &&
                            <button onClick={handleEditUser} className='p-1 hover:bg-gray-100 rounded'>
                                <PencilSquareIcon className='w-5 h-5 text-[#E91E63]' />
                            </button>
                        }
                        {
                            authenticatedUser.hasPermission('suspend_account') && !user.is_suspended &&
                            <button onClick={() => onSuspendAccount([user.user_id])} className='p-1 hover:bg-gray-100 rounded'>
                                <PauseCircleIcon className='w-5 h-5 text-[#E91E63]' />
                            </button>
                        }
                        {
                            authenticatedUser.hasPermission('activate_account') && user.is_suspended &&
                            <button onClick={() => onActivateAccount([user.user_id])} className='p-1 hover:bg-gray-100 rounded'>
                                <PlayCircleIcon className='w-5 h-5 text-[#E91E63]' />
                            </button>
                        }
                        <button onClick={() => setIsCollapsed(!isCollapsed)} className='p-1'>
                            <img src={chevronIcon} alt="" className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                        </button>
                    </div>
                }
            </div>
            {
                !isCollapsed &&
                <div className='flex flex-col gap-2 pl-12'>
                    <div className='text-[12px]'>
                        <span className='text-[#666666]'>Email: </span>
                        <span>{user.email}</span>
                    </div>
                    <div className='text-[12px]'>
                        <span className='text-[#666666]'>User ID: </span>
                        <span>{user.user_id}</span>
                    </div>
                    <div className='text-[12px]'>
                        <span className='text-[#666666]'>Status: </span>
                        <span className={user.is_suspended ? 'text-red-500' : 'text-green-500'}>
                            {user.is_suspended ? 'Suspended' : 'Active'}
                        </span>
                    </div>
                    <div className='text-[12px]'>
                        <span className='text-[#666666]'>Permissions: </span>
                        <span>
                            {user.permission_ids?.length > 0 ? (
                                (allPermissions?.user || [])
                                    .concat(allPermissions?.risk || [])
                                    .concat(allPermissions?.core || [])
                                    .filter(p => user.permission_ids.includes(p.permission_id))
                                    .map(p => p.name)
                                    .join(', ') || 'Loading...'
                            ) : 'None'}
                        </span>
                    </div>
                    {
                        authenticatedUser.hasPermission('delete_account') &&
                        <button onClick={() => onDeleteAccount(user.user_id)} className='text-[12px] text-red-500 hover:underline text-left'>Delete account</button>
                    }
                </div>
            }
        </div>
    );
}

export default UserAccounts;
