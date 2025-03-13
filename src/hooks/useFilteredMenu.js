import { useMemo } from 'react';
import useUser from './useUser';

function useFilteredMenu(menuItems) {
    const user = useUser();

    return useMemo(() => {
        if (!user) return [];

        function filterMenuItem(item) {
            // Check if user has required permission and license
            const hasPermission = !item.permission || user.hasPermission(item.permission);
            const hasLicense = !item.module || user.hasLicense(item.module);
            
            // If no permission or license, exclude the item
            if (!hasPermission || !hasLicense) return null;

            // If item has submenu, filter it recursively
            if (item.sub_menu) {
                const filteredSubMenu = item.sub_menu
                    .map(filterMenuItem)
                    .filter(Boolean);
                
                // If no submenu items remain after filtering, exclude the parent item
                if (filteredSubMenu.length === 0) return null;
                
                return {
                    ...item,
                    sub_menu: filteredSubMenu,
                    // Add license type info for UI customization
                    licenseType: item.module ? user.getLicenseType(item.module) : null
                };
            }

            return {
                ...item,
                // Add license type info for UI customization
                licenseType: item.module ? user.getLicenseType(item.module) : null
            };
        }

        return menuItems.map(filterMenuItem).filter(Boolean);
    }, [menuItems, user]);
}

export default useFilteredMenu; 