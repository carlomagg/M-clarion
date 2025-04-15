import { useEffect, useRef, useState } from 'react';
import styles from './UserAccounts.module.css';
import { useQuery } from '@tanstack/react-query';
import { userCountOptions, onlineUsersOptions } from '../../../queries/users-queries';
import { NavLink, useNavigate } from 'react-router-dom';
import SearchField from '../SearchField/SearchField';
import { useActivateAccounts, useDeleteAccount, useSuspendAccounts, useForceLogoutUser } from '../../../queries/users-queries';
import { useQueryClient } from '@tanstack/react-query';
import { filterItems, toTimestamp } from '../../../utils/helpers';
import useUser from '../../../hooks/useUser';
import useDispatchMessage from '../../../hooks/useDispatchMessage';
import useConfirmedAction from '../../../hooks/useConfirmedAction';
import { 
    PencilSquareIcon, 
    PauseCircleIcon, 
    PlayCircleIcon, 
    UsersIcon, 
    CheckCircleIcon, 
    XCircleIcon, 
    ShieldCheckIcon, 
    ClockIcon,
    ArrowRightOnRectangleIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import UserAvatar from '../UserAvatar/UserAvatar';
import LoadingIndicatorTwo from '../skeleton-loading-indicators/LoadingIndicatorTwo';
import Error from '../Error/Error';

function UserAccounts({users, allUserGroups, allPermissions}) {
    const authenticatedUser = useUser();
    const menuRef = useRef(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [filterGroup, setFilterGroup] = useState('all');
    const [menuCollapsed, setMenuCollapsed] = useState(true);
    const [inSelectionMode, setInSelectionMode] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const {confirmAction, confirmationDialog} = useConfirmedAction();
    const [searchTerm, setSearchTerm] = useState('');
    const [onlineUsersCollapsed, setOnlineUsersCollapsed] = useState(false);
    const [userListCollapsed, setUserListCollapsed] = useState(false);
    const [administratorsCollapsed, setAdministratorsCollapsed] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Add early return if not authenticated
    if (!authenticatedUser) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-600">Please log in to access user management.</p>
            </div>
        );
    }

    // Fetch user counts and online users
    const { data: userCount, isLoading: countLoading, error: countError } = useQuery(userCountOptions());
    const { data: onlineUsers, isLoading: onlineLoading, error: onlineError } = useQuery(onlineUsersOptions({
        refetchInterval: 10000 // Refetch every 10 seconds
    }));

    // Debug logging for online users
    useEffect(() => {
        console.log('Online users in component:', onlineUsers);
        if (onlineUsers?.data) {
            console.log('Number of online users:', onlineUsers.data.length);
            onlineUsers.data.forEach(user => {
                console.log('Processing online user:', {
                    name: `${user.firstname} ${user.lastname}`,
                    email: user.email,
                    last_login: user.last_login
                });
            });
        }
    }, [onlineUsers]);

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
    const {mutate: forceLogout, isPending: isForcingLogout} = useForceLogoutUser({onSuccess, onError, onSettled});

    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = '';
        if (isSuspendingAccounts) {
            text = 'Suspending ';
        } else if (isActivatingAccounts) {
            text = 'Activating ';
        } else if (isDeletingAccount) {
            text = 'Deleting ';
        } else if (isForcingLogout) {
            text = 'Forcing logout for ';
        }

        text += selectedUsers.length > 1 ? 'accounts' : 'account';

        (isSuspendingAccounts || isActivatingAccounts || isDeletingAccount || isForcingLogout) && dispatchMessage('processing', text);
    }, [isSuspendingAccounts, isActivatingAccounts, isDeletingAccount, isForcingLogout]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['users']});
        await queryClient.invalidateQueries({queryKey: ['onlineUsers']});
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
            // return users created within the last month (30 days)
            const presentTime = new Date().getTime();
            return (users.filter(user => presentTime - toTimestamp(user.created_at) <= 30 * 24 * 60 * 60 * 1000));
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

    function handleForceLogout(userId) {
        console.log('Forcing logout for user ID:', userId);
        forceLogout({ user_id: userId });
    }

    // Format the date properly
    function formatLastActive(dateString) {
        try {
            // Log the input for debugging
            console.log('Input dateString:', dateString);

            // Only return "Never logged in" if dateString is null, undefined, or empty string
            if (!dateString || dateString === '') {
                console.log('No date string provided:', dateString);
                return 'Never logged in';
            }

            const date = new Date(dateString);
            
            // Check if the date is valid
            if (isNaN(date.getTime())) {
                console.log('Invalid date:', dateString);
                return dateString; // Return the original string if we can't parse it
            }

            // Calculate time difference
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            const diffInHours = Math.floor(diffInMinutes / 60);
            const diffInDays = Math.floor(diffInHours / 24);

            // Format the date and time
            const formattedDateTime = date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            // Return relative time with exact date/time
            if (diffInMinutes < 1) {
                return `Just now (${formattedDateTime})`;
            } else if (diffInMinutes < 60) {
                return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago (${formattedDateTime})`;
            } else if (diffInHours < 24) {
                return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago (${formattedDateTime})`;
            } else if (diffInDays < 7) {
                return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago (${formattedDateTime})`;
            }

            // For older dates, just show the formatted date/time
            return formattedDateTime;
        } catch (error) {
            console.error('Error formatting date:', error, 'for dateString:', dateString);
            return dateString; // Return the original string instead of "Never logged in"
        }
    }

    // Function to check if a user is online (active in last 5 minutes)
    function isUserOnline(user) {
        if (!user?.last_login) {
            console.log(`User ${user?.email || 'unknown'} has no last_login`);
            return false;
        }
        const lastLogin = new Date(user.last_login);
        if (isNaN(lastLogin.getTime())) {
            console.log(`Invalid last_login date for user ${user?.email || 'unknown'}:`, user.last_login);
            return false;
        }
        const now = new Date();
        const minutesSinceLastLogin = Math.round((now - lastLogin) / (1000 * 60));
        console.log(`User ${user.email || 'unknown'} last login ${minutesSinceLastLogin} minutes ago`);
        
        // Always return true for future dates (like 2025)
        if (lastLogin > now) {
            console.log(`User ${user.email} has future login date, considering them online`);
            return true;
        }
        return minutesSinceLastLogin <= 5;
    }

    users = users.map(user => ({...user, isSelected: false}));
    const filteredUsers = filterItems(searchTerm, filterByGroup(), ['firstname', 'lastname', 'email']);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    function handlePageChange(newPage) {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    }

    const selectionMenu = (
        <ul className='border-[1.5px] border-[#B3B3B3] rounded-lg'>
            {authenticatedUser?.hasPermission('suspend_account') && (
                <li
                onClick={() => {
                    if (selectedUsers.length === 0) return; // Don't execute if no users are selected
                    setMenuCollapsed(true); 
                    handleSuspendAccounts(users.filter(user => selectedUsers.includes(user.user_id)).map(user => user.user_id));
                }}
                className={`py-2 px-4 text-[12px] ${
                    selectedUsers.length === 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-[#080808] cursor-pointer'
                } font-normal`}>
                    Suspend selection
                </li>
            )}
            {authenticatedUser?.hasPermission('activate_account') && (
                <li
                onClick={() => {
                    if (selectedUsers.length === 0) return; // Don't execute if no users are selected
                    setMenuCollapsed(true);
                    handleActivateAccounts(users.filter(user => selectedUsers.includes(user.user_id)).map(user => user.user_id));
                }}
                className={`py-2 px-4 text-[12px] ${
                    selectedUsers.length === 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-[#080808] cursor-pointer'
                } font-normal`}>
                    Activate selection
                </li>
            )}
            <li onClick={() => {setSelectedUsers([]); setInSelectionMode(false); setMenuCollapsed(true)}} className='py-2 px-4 text-[12px] text-[#080808] font-normal cursor-pointer'>Cancel selection</li>
        </ul>
    );

    return (
        <div className="space-y-6">
            {/* User Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Total Users Card */}
                <div className="bg-pink-50 p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-pink-700">Total Users</p>
                            <p className="text-2xl font-bold text-pink-900 mt-1">{userCount?.total_users || 0}</p>
                        </div>
                        <div className="bg-pink-100 p-3 rounded-full">
                            <UsersIcon className="w-6 h-6 text-pink-600" />
                        </div>
                    </div>
                </div>

                {/* Active Users Card */}
                <div className="bg-pink-100 p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-pink-800">Active Users</p>
                            <p className="text-2xl font-bold text-pink-900 mt-1">
                                {userCount?.user_counts?.active || userCount?.user_counts?.Active || 0}
                            </p>
                        </div>
                        <div className="bg-pink-200 p-3 rounded-full">
                            <CheckCircleIcon className="w-6 h-6 text-pink-700" />
                        </div>
                    </div>
                </div>

                {/* Suspended Users Card */}
                <div className="bg-pink-200 p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-pink-800">Suspended Users</p>
                            <p className="text-2xl font-bold text-pink-900 mt-1">
                                {userCount?.user_counts?.suspended || userCount?.user_counts?.Suspended || 0}
                            </p>
                        </div>
                        <div className="bg-pink-300 p-3 rounded-full">
                            <XCircleIcon className="w-6 h-6 text-pink-700" />
                        </div>
                    </div>
                </div>

                {/* Administrators Card */}
                <div className="bg-pink-300 p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-pink-800">Administrators</p>
                            <p className="text-2xl font-bold text-pink-900 mt-1">
                                {users?.filter(user => user.is_admin).length || 0}
                            </p>
                        </div>
                        <div className="bg-pink-400 p-3 rounded-full">
                            <ShieldCheckIcon className="w-6 h-6 text-pink-700" />
                        </div>
                    </div>
                </div>

                {/* Online Users Card */}
                <div className="bg-pink-400 p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-pink-800">Online Users</p>
                            <p className="text-2xl font-bold text-pink-950 mt-1">
                                {onlineUsers?.data?.length || 0}
                            </p>
                        </div>
                        <div className="bg-pink-500 p-3 rounded-full">
                            <ClockIcon className="w-6 h-6 text-pink-700" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Online Users Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Users Currently Online</h3>
                        <button 
                            onClick={() => setOnlineUsersCollapsed(!onlineUsersCollapsed)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg
                                className={`w-5 h-5 transform transition-transform ${onlineUsersCollapsed ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
                {!onlineUsersCollapsed && (
                    <div className="p-6">
                        {onlineLoading ? (
                            <LoadingIndicatorTwo />
                        ) : onlineError ? (
                            <Error error={onlineError} />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Force Logout</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {!onlineUsers?.data ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                    {onlineLoading ? 'Loading online users...' : 'No online users found'}
                                                </td>
                                            </tr>
                                        ) : onlineUsers.data.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                                    No online users found
                                                </td>
                                            </tr>
                                        ) : (
                                            onlineUsers.data.map((user) => (
                                                <tr key={user.email} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <UserAvatar firstName={user.firstname} lastName={user.lastname} email={user.email} size="sm" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {user.firstname} {user.lastname}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatLastActive(user.last_login)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <button
                                                            onClick={() => handleForceLogout(user.user_id)}
                                                            className="p-2 text-[#E91E63] hover:bg-pink-50 rounded-full transition-colors"
                                                            title="Force logout"
                                                        >
                                                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* User Management Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">List of Users</h3>
                        <div className="flex items-center gap-4">
                            <SearchField 
                                placeholder="Search users by name or email" 
                                searchTerm={searchTerm}
                                onChange={setSearchTerm}
                                className="w-64"
                            />
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => {
                                        setInSelectionMode(true);  // Automatically enter selection mode
                                        setMenuCollapsed(!menuCollapsed);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                                {!menuCollapsed && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                                        {selectionMenu}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => setUserListCollapsed(!userListCollapsed)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg
                                    className={`w-5 h-5 transform transition-transform ${userListCollapsed ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {!userListCollapsed && (
                    <>
                        {/* Filter Tabs */}
                        <div className="px-6 border-b border-gray-100">
                            <div className="flex space-x-8">
                                <button
                                    onClick={() => handleFilterChange('all')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        filterGroup === 'all'
                                            ? 'border-[#E91E63] text-[#E91E63]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    All Users
                                </button>
                                <button
                                    onClick={() => handleFilterChange('recent')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        filterGroup === 'recent'
                                            ? 'border-[#E91E63] text-[#E91E63]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Recently Added
                                </button>
                                {allUserGroups.map((group) => (
                                    <button
                                        key={group.permission_group_id}
                                        onClick={() => handleFilterChange(group.permission_group_id)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            filterGroup === group.permission_group_id
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {group.group_name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* User List */}
                        <div className="divide-y divide-gray-200">
                            {inSelectionMode && selectedUsers.length === 0 && (
                                <div className="p-4 bg-pink-50 text-pink-700 text-sm border-b border-pink-100">
                                    Please select one or more users to enable action buttons
                                </div>
                            )}
                            {paginatedUsers.map((user) => (
                                <UserAccountItem
                                    key={user.user_id}
                                    user={user}
                                    allPermissions={allPermissions}
                                    inSelectionMode={inSelectionMode}
                                    selectedUsers={selectedUsers}
                                    handleToggleSelect={handleToggleSelect}
                                    onSuspendAccount={handleSuspendAccounts}
                                    onActivateAccount={handleActivateAccounts}
                                    onDeleteAccount={handleDeleteAccount}
                                    formatLastActive={formatLastActive}
                                />
                            ))}

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                                <div className="flex justify-between w-full">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</span> of{' '}
                                        <span className="font-medium">{filteredUsers.length}</span> results
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-700">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center px-3 py-2 rounded-md ${
                                                currentPage === 1
                                                    ? 'bg-pink-100 text-pink-300 cursor-not-allowed'
                                                    : 'bg-[#E91E63] text-white hover:bg-pink-700'
                                            } transition-colors duration-200`}
                                        >
                                            <ChevronLeftIcon className="w-5 h-5 mr-2" />
                                            <span>Previous</span>
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`relative inline-flex items-center px-3 py-2 rounded-md ${
                                                currentPage === totalPages
                                                    ? 'bg-pink-100 text-pink-300 cursor-not-allowed'
                                                    : 'bg-[#E91E63] text-white hover:bg-pink-700'
                                            } transition-colors duration-200`}
                                        >
                                            <span className="mr-2">Next</span>
                                            <ChevronRightIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Administrators Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Administrators</h3>
                        <button 
                            onClick={() => setAdministratorsCollapsed(!administratorsCollapsed)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg
                                className={`w-5 h-5 transform transition-transform ${administratorsCollapsed ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
                {!administratorsCollapsed && (
                    <div className="p-6">
                        <div className="space-y-6">
                            {users?.filter(user => user.is_admin).map((admin) => (
                                <div key={admin.user_id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <UserAvatar firstName={admin.firstname} lastName={admin.lastname} email={admin.email} size="sm" />
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-gray-900">
                                                {admin.firstname ? `${admin.firstname} ${admin.lastname}` : admin.email}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Last login: {formatLastActive(admin.last_login)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                            {admin.is_super_user ? 'Super User' : 'Administrator'}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            admin.is_suspended
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {admin.is_suspended ? 'Suspended' : 'Active'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Render the confirmation dialog */}
            {confirmationDialog}
        </div>
    );
}

function UserAccountItem({
    user, 
    allPermissions, 
    inSelectionMode, 
    selectedUsers, 
    handleToggleSelect, 
    onSuspendAccount, 
    onActivateAccount, 
    onDeleteAccount,
    formatLastActive
}) {
    const authenticatedUser = useUser();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Add null check for authenticatedUser
    if (!authenticatedUser) return null;

    function handleEditUser() {
        navigate(`/users/add-new-user?u=${user.user_id}`);
    }

    return (
        <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                    {inSelectionMode && (
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            checked={selectedUsers.includes(user.user_id)}
                            onChange={(e) => handleToggleSelect(user.user_id, e.target.checked)}
                        />
                    )}
                    <UserAvatar firstName={user.firstname} lastName={user.lastname} email={user.email} size="sm" />
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {user.firstname ? `${user.firstname} ${user.lastname}` : user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                            Last login: {formatLastActive(user.last_login)}
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex justify-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.is_suspended
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                    }`}>
                        {user.is_suspended ? 'Suspended' : 'Active'}
                    </span>
                </div>

                <div className="flex items-center space-x-4 flex-1 justify-end">
                    {!inSelectionMode && (
                        <>
                            {authenticatedUser?.hasPermission('edit_user') && (
                                <button
                                    onClick={handleEditUser}
                                    className="p-2 text-[#E91E63] hover:bg-pink-50 rounded-full transition-colors"
                                    title="Edit user"
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </button>
                            )}
                            {authenticatedUser?.hasPermission('suspend_account') && !user.is_suspended && (
                                <button
                                    onClick={() => onSuspendAccount([user.user_id])}
                                    className="p-2 text-[#E91E63] hover:bg-pink-50 rounded-full transition-colors"
                                    title="Suspend account"
                                >
                                    <PauseCircleIcon className="w-5 h-5" />
                                </button>
                            )}
                            {authenticatedUser?.hasPermission('activate_account') && user.is_suspended && (
                                <button
                                    onClick={() => onActivateAccount([user.user_id])}
                                    className="p-2 text-[#E91E63] hover:bg-pink-50 rounded-full transition-colors"
                                    title="Activate account"
                                >
                                    <PlayCircleIcon className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg
                                    className={`w-5 h-5 transform transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {!isCollapsed && (
                <div className="mt-4 pl-12 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-medium text-gray-500">Email</div>
                            <div className="mt-1 text-sm text-gray-900">{user.email}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500">User ID</div>
                            <div className="mt-1 text-sm text-gray-900">{user.user_id}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500">Permissions</div>
                            <div className="mt-1 text-sm text-gray-900">
                                {user.permission_ids?.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {(Array.isArray(allPermissions) ? allPermissions : [])
                                            .filter(p => {
                                                const permId = p.permission_id || p.id;
                                                // Handle both object and number permission IDs
                                                return user.permission_ids?.some(pid => 
                                                    (typeof pid === 'object' ? pid.id : pid) === permId
                                                );
                                            })
                                            .map(p => (
                                                <span
                                                    key={p.permission_id || p.id}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                                >
                                                    {p.name} {p.type !== 'user' && `(${p.type})`}
                                                </span>
                                            ))}
                                    </div>
                                ) : (
                                    'None'
                                )}
                            </div>
                        </div>
                    </div>

                    {authenticatedUser?.hasPermission('delete_account') && (
                        <div className="pt-2">
                            <button
                                onClick={() => onDeleteAccount(user.user_id)}
                                className="text-sm text-red-600 hover:text-red-800 hover:underline"
                            >
                                Delete account
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default UserAccounts;
