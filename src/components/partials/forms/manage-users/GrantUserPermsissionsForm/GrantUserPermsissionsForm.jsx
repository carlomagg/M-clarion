import { useEffect, useState } from 'react';
import './GrantUserPermsissionsForm.css';
import chevron_down from '../../../../../assets/icons/chevron-down.svg';
import SelectPermissionItem from '../../../SelectPermissionItem/SelectPermissionItem';
import SelectPermissionGroupsModal from '../../../SelectPermissionGroupsModal/SelectPermissionGroupsModal';
import { Chip } from '../../../Elements/Elements';
import { useQuery } from '@tanstack/react-query';
import { permissionsCountOptions } from '../../../../../queries/permissions-queries';

function GrantUserPermsissionsForm({ type, permissions, setPermissions, permissionGroups, selectedGroups, setSelectedGroups, setFormData = null, formData = null, firstName = null }) {
    const [showPermissionTagsModal, setShowPermissionGroupsModal] = useState(false);

    // Fetch permission count from API
    const { data: permissionCount } = useQuery(
        permissionsCountOptions(formData?.user_details?.id)
    );

    const availablePermissions = permissionCount ? 
        permissionCount.max_permissions - permissionCount.used_permissions : 
        10; // Default value until API responds

    function toggleAdminRights(checked) {
        setFormData(draft => {
            draft['user_permissions']['set_as_admin'] = checked;
        });
    }

    function toggleSelectAll(isChecked) {
        function toggleAll(perms) {
            perms.forEach(perm => {
                if (isChecked && availablePermissions <= 0) return;
                perm.isSelected = isChecked;
                if (perm.children) {
                    toggleAll(perm.children)
                }
            });
        }
        setPermissions(draft => {
            toggleAll(draft)
        });
    }

    function handlePermissionToggle(permission, isSelected) {
        if (isSelected && getSelectedPermissionCount() >= availablePermissions) {
            alert('No more permissions available. Please upgrade your license to add more permissions.');
            return false;
        }
        return true;
    }

    function getSelectedPermissionCount() {
        let count = 0;
        function countSelected(perms) {
            perms.forEach(perm => {
                if (perm.isSelected) count++;
                if (perm.children) countSelected(perm.children);
            });
        }
        countSelected(permissions);
        return count;
    }

    function removeGroupFromSelected(id) {
        setSelectedGroups(selectedGroups.filter(groupId => groupId !== id))
    }

    const permission_items = permissions.map(permission => <SelectPermissionItem key={permission.id} parentIsSelected={null} {...{permission, setPermissions, handlePermissionToggle}} ancestors={[]} />);

    const selectedGroupsChips = selectedGroups.map(groupId => {
        let group = permissionGroups.find(pG => pG.permission_group_id === groupId);
        return <Chip key={groupId} text={group['group_name']} onRemove={() => removeGroupFromSelected(groupId)} />
    })

    return (
        <form className='flex flex-col gap-6'>
            {showPermissionTagsModal && <SelectPermissionGroupsModal {...{setShowPermissionGroupsModal, permissionGroups, setPermissions, selectedGroups, setSelectedGroups}} />}
            <div>
                <h3 className='text-[12px] font-normal'>
                    Grant{' '}
                    {
                        type == 'multiple' ?
                        <span>{formData.emails.length}{' '}{formData.emails.length == 1 ? 'user' : 'users'}</span> :
                        (
                            type == 'single' ?
                            <span>{formData.user_details.first_name}</span> :
                            <span>{firstName}</span>
                        )
                    }
                    {' '}permissions
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                    Available Permissions: <span className="font-normal">{availablePermissions - getSelectedPermissionCount()}</span>
                </div>
            </div>
            {
                type == 'single' &&
                <div className='flex flex-col gap-4'>
                    <h4 className='text-[12px] font-normal'>
                        Administrative rights
                    </h4>
                    <label className='flex gap-2 items-center select-none'>
                        <input type="checkbox" name="" id="" onChange={(e) => toggleAdminRights(e.target.checked)} />
                        <span className='text-[12px]'>Set user as admin</span>
                    </label>
                </div>
            }
            <div className='flex flex-col gap-4'> {/* select access tags */}
                <h4 className='text-[12px] font-normal'>
                    Select permission groups
                </h4>
                <div className='flex flex-col gap-2'>
                    <div className='border-b-2 border-border-gray p-4 flex cursor-pointer' onClick={
                        () => setShowPermissionGroupsModal(true)
                        }>
                        <div className='grow'>
                            {
                                selectedGroups.length === 0 ?
                                <span className='text-[10px]'>No tags have been selected</span> :
                                <div className='flex gap-3'>
                                    {selectedGroupsChips}
                                </div>
                            }
                        </div>
                        <img src={chevron_down} alt="icon" />
                    </div>
                    <p className='italic text-[12px] text-text-gray'>
                        Select groups to assign relevant access permissions.
                    </p>
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <h4 className='text-[12px] font-normal'>
                    All system permissions
                </h4>
                <div className='bg-[#DEDEDE] rounded-t-lg py-5 px-4 flex'>
                    <label className='grow flex items-center gap-2 cursor-pointer'>
                        <input type="checkbox" name="select_all_permissions" onChange={(e) => toggleSelectAll(e.target.checked)} />
                        <span className='text-[12px] text-[#1A1A1A]'>Select all permissions</span>
                    </label>
                    {/* <div className='pr-5 flex gap-2 cursor-pointer items-center'>
                        <span className='text-sm text-[#1A1A1A]'>Expand all</span>
                        <img src={chevron_down} alt="icon" />
                    </div> */}
                </div>
                <div>
                    <ul>
                        {permission_items}
                    </ul>
                </div>
            </div>
        </form>
    )
}

export default GrantUserPermsissionsForm;