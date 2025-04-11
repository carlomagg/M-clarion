import logo from "../../../../assets/mclarion-logo.jpg"
import './Sidebar.css'
import { SIDEBAR_MENU } from '../../../../menus'
import { useEffect, useState } from "react";

import xyz from "../../../../assets/icons/xyz-logo.svg"
import { NavLink, useLocation } from "react-router-dom";
import useUser from "../../../../hooks/useUser";
import { BASE_API_URL } from "../../../../utils/consts";



function Sidebar() {
    const user = useUser()

    if (!user) {
        return null; // Or a loading state if you prefer
    }

    return (
        <div className='space-y-4 overflow-auto px-6 py-4 h-full no-scrollbar border-r border-[#E5E5E5]'>
            <div> {/* logo */}
                <img src={logo} alt='' className='' height={28} width={122} />
            </div>

            <div className=''> {/* user info */}
                <div className='flex gap-3 items-center'>
                    {user.companyLogo && (
                        <img src={`${BASE_API_URL}clarion_users${user.companyLogo}`} alt={`${user.companyName}'s logo`} className='object-contain' width={48} />
                    )}
                    <span className="text-sm">{user.companyName}</span>
                </div>
                <div className='text-sm mt-4'>
                    {user.firstName} {user.lastName}
                </div>
            </div>

            <hr className="border-[#B0B0B0]" />

            <ul className='text-[15px] space-y-4'> {/* navigation */}
                {SIDEBAR_MENU.map((item, i) => (
                    <li key={item.text}>
                        <LinkItem item={item} />
                    </li>
                ))}
            </ul>
        </div>
    )
}

function LinkItem({ item, classes = '', parentPath = '' }) {
    const user = useUser();
    const [isCollapsed, setIsCollapsed] = useState(true);

    if (item.permission && !user.hasPermission(item.permission)) return null;

    const resolvedPath = parentPath ? `${parentPath}/${item.link}` : (item.link || '');

    // if has children, expand the item if one of its children is active else collapse it
    const { pathname } = useLocation();

    const isLink = !!item.link;
    const isChild = !!parentPath;
    
    // Remove query parameters from current path for comparison
    const normalizedPathname = pathname.split('?')[0];
    
    // Remove query parameters from menu item path
    const normalizedItemLink = item.link ? item.link.split('?')[0] : '';
    
    // Check if this menu item is active - more strict matching to avoid false positives
    const isActive = isChild ?
        normalizedPathname === resolvedPath.split('?')[0] :
        (item.link === '/' ? 
            normalizedPathname === '/' : 
            (item.exact ? 
                normalizedPathname === normalizedItemLink : 
                normalizedPathname.startsWith(normalizedItemLink) && 
                // Make sure this isn't just a partial match with a common prefix
                (normalizedItemLink !== '' && 
                 (normalizedPathname === normalizedItemLink || 
                  normalizedPathname.startsWith(normalizedItemLink + '/')))
            )
        );

    // Check if any child is active - more precise check
    const childIsActive = item.sub_menu && item.sub_menu.some(child => {
        const childLink = child.link ? child.link.split('?')[0] : '';
        const childFullPath = isLink ? 
            `${resolvedPath.split('?')[0]}/${childLink}` : 
            childLink;
            
        // Check if pathname exactly matches or is a direct child of this menu item
        return normalizedPathname === childFullPath || 
               (childFullPath !== '' && normalizedPathname.startsWith(childFullPath + '/'));
    });

    // Only update collapse state when pathname changes, not on every render
    useEffect(() => {
        if (isActive || childIsActive) {
            setIsCollapsed(false);
        }
        // Don't auto-collapse when navigating away - let user control this
        // Only open menus where the active page is found
    }, [pathname]);

    const coloredText = isChild && isActive || (isActive && !childIsActive) || false;

    return (
        <div className={`flex flex-col ${classes}`}>
            <div className='flex gap-x-4 items-center'>
                {
                    item.icon ?
                        <img src={item.icon} alt='' className='' /> :
                        <span className='text-text-pink'>&bull;</span>
                }
                {
                    item.link ?
                        <NavLink to={resolvedPath} className={`${coloredText ? 'hover:text-text-pink text-text-pink' : 'hover:text-text-pink'}`}>
                            {item.text}
                        </NavLink> :
                        <button type="button" onClick={() => setIsCollapsed(!isCollapsed)} className={`${coloredText ? 'hover:text-text-pink text-text-pink' : 'hover:text-text-pink'}`}>
                            {item.text}
                        </button>
                }
            </div>
            {
                item.sub_menu && (
                    <ul className={`list-inside pl-4 space-y-1 overflow-hidden transition-[max-height] ease-linear duration-150 ${isCollapsed ? 'max-h-0' : 'max-h-52'}`}>
                        {item.sub_menu.map((child, i) => (
                            <li key={child.text}>
                                <LinkItem classes='first:mt-2' item={child} parentPath={resolvedPath} />
                            </li>
                        ))}
                    </ul>
                )
            }
        </div>
    );
}

export default Sidebar

