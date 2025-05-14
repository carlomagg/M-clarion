import { Outlet } from 'react-router-dom';

function Layout() {
    return (
        <div className='px-8 py-6 h-full overflow-auto'>
            <Outlet />
        </div>
    );
}

export default Layout; 