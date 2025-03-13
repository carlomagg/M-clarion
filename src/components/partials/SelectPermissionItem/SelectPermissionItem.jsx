import React from 'react';
import './SelectPermissionItem.css';

function SelectPermissionItem({ permission, setPermissions, ancestors = [], parentIsSelected }) {
    const { id, name, description, children, isSelected } = permission;

    function togglePermission(isChecked) {
        // Call the parent handler to check if we can toggle
        if (typeof parentIsSelected === 'function' && !parentIsSelected(permission, isChecked)) {
            return;
        }

        setPermissions(draft => {
            let target = draft;
            ancestors.forEach(ancestor => {
                target = target.find(item => item.id === ancestor).children;
            });
            target.find(item => item.id === id).isSelected = isChecked;
        });

        // Toggle all children if any
        if (children) {
            setPermissions(draft => {
                function toggleChildren(items) {
                    items.forEach(item => {
                        item.isSelected = isChecked;
                        if (item.children) toggleChildren(item.children);
                    });
                }
                let target = draft;
                ancestors.forEach(ancestor => {
                    target = target.find(item => item.id === ancestor).children;
                });
                toggleChildren(target.find(item => item.id === id).children);
            });
        }
    }

    const childItems = children?.map(child => (
        <SelectPermissionItem
            key={child.id}
            permission={child}
            setPermissions={setPermissions}
            ancestors={[...ancestors, id]}
            parentIsSelected={togglePermission}
        />
    ));

    return (
        <div className={`permission-item ${children ? 'has-children' : ''}`}>
            <div className="item-content">
                <label className='flex gap-2 items-center select-none'>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => togglePermission(e.target.checked)}
                    />
                    <div className='grow'>
                        <p className='text-[12px] font-normal'>{name}</p>
                        <p className='text-[12px] text-text-gray'>{description}</p>
                    </div>
                </label>
            </div>
            {children && <div className="children">{childItems}</div>}
        </div>
    );
}

export default SelectPermissionItem;