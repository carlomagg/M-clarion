import styles from './SelectPermissionGroupsModal.module.css';

import search from "../../../assets/icons/search.svg"
import SearchField from '../SearchField/SearchField';
import { useState } from 'react';
import { filterItems } from '../../../utils/helpers';

function SelectPermissionGroupsModal({setShowPermissionGroupsModal, setPermissions, permissionGroups, selectedGroups, setSelectedGroups}) {

    const [searchTerm, setSearchTerm] = useState('');

    function handleSelectGroup(id, isChecked) {
        let newSelectedGroups;
        if (isChecked) newSelectedGroups = [...selectedGroups, id];
        else newSelectedGroups = selectedGroups.filter(groupId => groupId != id)

        setSelectedGroups(newSelectedGroups);
    }
    
    function applyPermissionsInSelectedGroups(allPermissions, permissionsInSelectedGroups) {
        function selectPerms(allPerms, selectedPerms) {
            allPerms
            .filter(perm => selectedPerms.includes(perm.id))
            .forEach(perm => {
                perm.isSelected = true;
                if (perm.children) selectPerms(perm.children, selectedPerms);
            })
        }
        selectPerms(allPermissions, permissionsInSelectedGroups)
    }

    function applyPermissionGroups() {
        let permissionsInSelectedGroups = [];

        // extract permissions from selected permission groups
        permissionGroups
        .filter(permG => selectedGroups.includes(permG.permission_group_id))
        .forEach(permG => permissionsInSelectedGroups.push(...permG.permission_ids));

        setPermissions(draft => {
            applyPermissionsInSelectedGroups(draft, permissionsInSelectedGroups);
        });

        setShowPermissionGroupsModal(false);
    }

    const filteredGroups = filterItems(searchTerm, permissionGroups, ['group_name']);
    // const groupNames = filteredGroups.map(permGroup => permGroup.group_name);
    const selectPermissionGroupItems = filteredGroups
    .map(group => {
        return (
            <li key={group.permission_group_id}>
                <label className='flex gap-3 cursor-pointer w-fit select-none'>
                    <input type="checkbox" checked={selectedGroups.includes(group.permission_group_id)} id="" onChange={(e) => handleSelectGroup(group.permission_group_id, e.target.checked)} className='accent-red-300' />
                    <span>{group.group_name}</span>
                </label>
            </li>
        )
    })

    return (
        <div className='fixed top-0 left-0 z-20 w-full h-full bg-black/10 flex flex-col items-center justify-center'>
            <div className='bg-white p-6 rounded-lg border border-[#CCC] flex flex-col gap-6 w-full max-w-lg'>
                <h3 className='text-lg font-semibold'>Select permssion tags</h3>
                <SearchField placeholder={'Search user groups'} searchTerm={searchTerm} onChange={setSearchTerm} />
                <ul className='flex flex-col gap-5'>
                    { selectPermissionGroupItems }
                </ul>
                <div className='text-right'>
                    <button type="button" className='py-[14px] px-3 text-sm text-text-pink font-medium select-none' onClick={applyPermissionGroups}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SelectPermissionGroupsModal;