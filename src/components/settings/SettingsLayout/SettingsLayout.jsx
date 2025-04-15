import styles from './SettingsLayout.module.css';

import { SETTINGS_MENU } from '../../../menus';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import useUser from '../../../hooks/useUser';
import { useContext } from 'react';
import GlobalModalContext from '../../../contexts/global-modal-context';

const cancelIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={26} height={26}>
<line x1="8" y1="8" x2="16" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
<line x1="16" y1="8" x2="8" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
</svg>

function SettingsLayout() {
    return (
        <div className='fixed top-0 left-0 w-full h-full bg-[#050505]/25 flex items-center justify-center z-30'>
            <div className='w-full max-w-6xl h-[572px] flex flex-col'>
                <Header />
                <div className='flex grow overflow-auto'>
                    <Sidebar />
                    <div className='bg-[#F2F2F2] overflow-auto grow'>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Header() {
    const {hideGlobalModal} = useContext(GlobalModalContext);

    return (
        <div className='py-[10px] pl-8 pr-4 bg-black text-white text-lg font-semibold flex justify-between items-center'>
            <span>System Settings</span>
            <button type="button" onClick={hideGlobalModal}>
                {cancelIcon}
            </button>
        </div>
    );
}

function Sidebar() {
    const user = useUser();
    const location = useLocation();
    
    return (
        <nav className='min-w-64 shrink-0 bg-white overflow-auto'>
            <ul className='px-8 py-6 flex flex-col gap-6'>
                {SETTINGS_MENU.map(item => {
                    // Check if current path includes this menu item's path or if we're at settings root and this is the first item (Structure)
                    const isRoot = location.pathname === '/settings' || location.pathname === '/settings/';
                    const isFirstItem = item.link === 'organizational-structure';
                    const isCurrentPath = location.pathname.includes(`/settings/${item.link}`) || (isRoot && isFirstItem);
                    
                    return (
                        (!item.permission || user.hasPermission(item.permission)) &&
                        <li key={item.link} className='py-1 flex gap-3'>
                            <img src={item.icon} alt="" />
                            <NavLink 
                                to={item.link} 
                                className={isCurrentPath ? 'text-text-pink text-sm' : 'text-sm'}
                            >
                                {item.text}
                            </NavLink>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default SettingsLayout;