import { useEffect, useRef, useState } from 'react';
import styles from './RiskReview.module.css';

import importIcon from '../../../../assets/icons/import.svg';
import exportIcon from '../../../../assets/icons/export.svg';
import deleteIcon from '../../../../assets/icons/delete.svg';
import panelToggleIcon from '../../../../assets/icons/panel-toggle.svg';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import PageHeader from '../../../partials/PageHeader/PageHeader';
import ActionsDropdown from '../../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import LinkButton from '../../../partials/buttons/LinkButton/LinkButton';
import Review from '../../../partials/forms/risk-register/RiskReview/RiskReview';
import { createPortal } from 'react-dom';

function RiskReview() {
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const actions = [
        {text: 'Import', icon: importIcon, type: 'link', link: 'add-multiple-users?m=file', permission: 'add_mulitple_users_file'},
        {text: 'Export', icon: exportIcon, type: 'link', link: 'add-multiple-users?m=email', permission: 'add_multiple_users_emails'},
        {text: 'Delete', icon: deleteIcon, type: 'link', link: 'add-active-directory', permission: 'add_active_directory'}
    ];

    return (
        <div className={`p-10 pt-4 max-w-7xl flex-1 flex flex-col gap-6 ${isPanelVisible && 'mr-96'}`}>
            {isPanelVisible && <SidePanel onHideSidePanel={() => setIsPanelVisible(false)} />}
            <PageTitle title={'Page title'} />
            <PageHeader>
                <div className='flex gap-4'>
                    <ActionsDropdown label={'Actions'} items={actions} />
                    {
                        !isPanelVisible &&
                        <LinkButton onClick={() => setIsPanelVisible(!isPanelVisible)} permission={'add_new_user'} icon={panelToggleIcon} text={'Open Side Panel'} />
                    }
                </div>
            </PageHeader>
            <div className=''> {/* main content container */}
                <div className='mt-4 flex flex-col gap-6'>
                    <Review mode={'standalone'} />
                </div>
            </div>
        </div>
    )
}

function SidePanel({onHideSidePanel}) {
    const [height, setHeight] = useState('');
    const [top, setTop] = useState('');
    const notificationBarHeight = 0;
    const headerHeight = 77;
    const contentArea = document.querySelector('.layout-content-area');
    const modalRef = useRef(null);
    const panelRef = useRef(null);

    useEffect(() => {
        function adjustHeight() {
            let top;
        
            if (contentArea.scrollTop <= 0) top = notificationBarHeight + headerHeight;
            else if (contentArea.scrollTop >= headerHeight) top = notificationBarHeight;
            else top = (notificationBarHeight + headerHeight) - contentArea.scrollTop;
        
            let height = window.innerHeight - top;
            setTop(top);
            setHeight(height);
        }

        adjustHeight();

        contentArea.addEventListener('scroll', adjustHeight);

        () => contentArea.removeEventListener('scroll', adjustHeight);
    }, []);

    const activityLog = [
        {user: 'Ibrahim', timestamp: '12/2/2024', change: 'Some chage'},
        {user: 'Osawese', timestamp: '12/2/2024', change: 'Some chage'},
        {user: 'Ibrahim', timestamp: '12/2/2024', change: 'Some chage'},
    ]

    return top && height && createPortal(
        <div ref={modalRef} style={{top: top+'px', height: height+'px'}} className='fixed z-10 right-4 bg-black/45'>
            <div ref={panelRef} className={`bg-white h-full overflow-auto w-96 flex flex-col gap-3`}>
                <LinkButton onClick={onHideSidePanel} permission={'add_new_user'} icon={panelToggleIcon} text={'Close Side Panel'} classes='self-start mt-4 mx-4' bgColor='#E6E6E6' />
                <hr className='bg-[#C2C2C2]'/>
                <div className='px-6 py-4 flex flex-col gap-6'>
                    <div className='space-y-3 font-medium'>
                        <p>Last Assessed:</p>
                        <p>June 26, 2024, 1:35pm</p>
                    </div>
                    <div className='space-y-3 font-medium'>
                        <p>Assessed By:</p>
                        <p>Jennifer</p>
                    </div>
                </div>
                <hr className='bg-[#C2C2C2]'/>
                <div className='px-6 py-4 flex flex-col gap-6'>
                    <div className='flex justify-between items-center'>
                        <h3 className='font-medium text-lg'>Activity Log</h3>
                        <button type="button" className='text-xs'>Expand</button>
                    </div>
                    <ActivityLog log={activityLog} />
                </div>
            </div>
        </div>,
        document.body
    );
}

export function ActivityLog({log}) {
    
    return (
        <div className='mt-3 overflow-auto p-6 flex flex-col gap-6 rounded-lg border border-[#CCC] text-[#3B3B3B] text-sm'>
            <div className="w-[500px]">
                <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                    <span className='py-4 flex-[.3_0]'>#</span>
                    <span className='py-4 flex-[2_0]'>User</span>
                    <span className='py-4 flex-[1_0]'>Timestamp</span>
                    <span className='py-4 flex-[1_0]'>Change</span>
                </header>
                <ul className='flex flex-col'>
                    {
                        log.map((record, i) => {
                            return (
                                <li key={i} className='px-4 flex gap-4 items-center'>
                                    <span className='py-4 flex-[.3_0]'>{i+1}</span>
                                    <span className='py-4 flex-[2_0]'>
                                        {record.user}
                                    </span>
                                    <span className='py-4 flex-[1_0]'>
                                        {record.timestamp}
                                    </span>
                                    <span className='py-4 flex-[1_0]'>
                                        {record.change}
                                    </span>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        </div>
    );
}

export default RiskReview;