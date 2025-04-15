import styles from './ProfileLayout.module.css';

import { Outlet } from 'react-router-dom';
import { useContext } from 'react';
import GlobalModalContext from '../../../contexts/global-modal-context';

const cancelIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={26} height={26}>
<line x1="8" y1="8" x2="16" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
<line x1="16" y1="8" x2="8" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
</svg>

function ProfileLayout() {
    return (
        <div className='fixed top-0 left-0 w-full h-full bg-[#050505]/25 flex items-center justify-center z-30'>
            <div className='w-full max-w-6xl h-[572px] flex flex-col'>
                <Header />
                <div className='flex grow overflow-auto'>
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
            <span>My Profile</span>
            <button type="button" onClick={hideGlobalModal}>
                {cancelIcon}
            </button>
        </div>
    );
}

export default ProfileLayout;