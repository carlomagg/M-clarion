import { Outlet, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';
import Index from '../Index/Index';

function Layout() {
    const location = useLocation();

    function checkIfInIndexView() {
        const regRes = /^\/settings(\/location\/)?(?<path>\w+)?/.exec(location.pathname);
        if (!regRes.groups.path) return true;
        else return false;
    }

    const inIndexView = checkIfInIndexView();

    return (
        <div className='px-8 py-6 h-full overflow-auto'>
            {inIndexView ? (
                <Outlet />
            ) : (
                <div className='h-full flex gap-1'>
                    <div className='h-full grow w-auto'>
                        <Outlet />
                    </div>
                    <Index inIndexView={false} />
                </div>
            )}
        </div>
    );
}

export default Layout;