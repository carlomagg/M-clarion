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
    const isActive = isChild ?
        pathname.startsWith(resolvedPath) :
        (item.link === '/' ? pathname === '/' : pathname.startsWith(item.link));

    const childIsActive = item.sub_menu && item.sub_menu.some(child => {
        if (isLink) return pathname.startsWith(`${resolvedPath}/${child.link}`);
        else return pathname.startsWith(child.link)
    });

    useEffect(() => {
        isActive || childIsActive ? setIsCollapsed(false) : setIsCollapsed(true);
    }, [isActive, childIsActive]);

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
                        <NavLink to={resolvedPath} onClick={() => setIsCollapsed(!isCollapsed)} className={`${coloredText ? 'hover:text-text-pink text-text-pink' : 'hover:text-text-pink'}`}>
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

