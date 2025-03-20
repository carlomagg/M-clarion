import React from 'react';
import { NavLink } from 'react-router-dom';
import { SIDEBAR_MENU } from '../../../menus';
import useFilteredMenu from '../../../hooks/useFilteredMenu';

function Sidebar() {
    const filteredMenu = useFilteredMenu(SIDEBAR_MENU);

    const renderMenuItem = (item) => {
        const isReadOnly = item.licenseType === 'read_only';
        
        return (
            <li key={item.text} className="mb-2">
                <NavLink
                    to={item.link}
                    className={({ isActive }) => `
                        flex items-center p-2 rounded-lg
                        ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}
                        ${isReadOnly ? 'italic' : ''}
                    `}
                >
                    {item.icon && <img src={item.icon} alt="" className="w-5 h-5 mr-2" />}
                    <span>{item.text}</span>
                    {isReadOnly && (
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                            Read Only
                        </span>
                    )}
                </NavLink>
                
                {item.sub_menu && (
                    <ul className="ml-6 mt-2 space-y-2">
                        {item.sub_menu.map(renderMenuItem)}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <aside className="w-64 h-full bg-white border-r border-gray-200">
            <nav className="p-4">
                <ul>
                    {filteredMenu.map(renderMenuItem)}
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar; 