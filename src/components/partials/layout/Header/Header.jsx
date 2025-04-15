import './Header.css';
import { useContext } from 'react';

import { Settings } from 'lucide-react';
import SessionButton from './components/SessionButton';
import NotificationsCenter from './components/NotificationsCenter';
import Searchbar from './components/Searchbar';
import GlobalModalContext from '../../../../contexts/global-modal-context';

function Header() {

    const {showGlobalModal} = useContext(GlobalModalContext);

    return (
        <header className='bg-white px-8 py-4 sticky top-0 z-10'>
            <div className='flex gap-6 h-12 items-center'>
                <Searchbar />
                <div className='flex gap-2'>
                    <button type='button' onClick={() => showGlobalModal('settings')}>
                        <Settings color='#838280' />
                    </button>
                    <NotificationsCenter />
                    <SessionButton />
                </div>
            </div>
        </header>
    )
}


export default Header;