import { Outlet, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';
import Index from '../Index/Index';


function Layout() {
    const location = useLocation();

    function checkIfInIndexView() {
        const regRes = /^\/settings(\/organizational-structure\/)?(?<path>\w+)?/.exec(location.pathname);
        if (!regRes.groups.path) return true;
        else return false;
    }

    const inIndexView = checkIfInIndexView();

    return (
        <div className='px-8 py-6 h-full overflow-auto'>
            <div className={`${!inIndexView && 'h-full flex gap-1'}`}>
                <div className={`overflow-y-auto no-scrollbar ${inIndexView ? 'w-0 overflow-x-hidden' : 'h-full grow w-auto'}`}>
                    <Outlet />
                </div>
                <Index inIndexView={inIndexView} />
            </div>
        </div>
    );
}

export default Layout;