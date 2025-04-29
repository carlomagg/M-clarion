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
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteRisk } from '../../../../queries/risks/risk-queries';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import { useQueryClient } from '@tanstack/react-query';

function RiskReview() {
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatchMessage = useDispatchMessage();
    const queryClient = useQueryClient();
    
    // Set up delete risk mutation
    const { isPending: isDeleting, mutate: deleteRisk } = useDeleteRisk({
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({queryKey: ['risks']});
            dispatchMessage('success', 'Risk deleted successfully');
            navigate('/risks');
        },
        onError: (error) => {
            dispatchMessage('failed', error.response?.data?.message || 'Failed to delete risk');
        }
    });
    
    // Handle delete confirmation
    const handleDeleteConfirm = () => {
        deleteRisk(id);
        setShowDeleteConfirm(false);
    };
    
    const actions = [
        {text: 'Import', icon: importIcon, type: 'link', link: 'add-multiple-users?m=file', permission: 'add_mulitple_users_file'},
        {text: 'Export', icon: exportIcon, type: 'link', link: 'add-multiple-users?m=email', permission: 'add_multiple_users_emails'},
        {text: 'Edit', icon: null, type: 'link', link: `/risks/${id}/update?section=identification`, permission: 'edit_risk'},
        {text: 'Delete', icon: deleteIcon, type: 'action', action: () => setShowDeleteConfirm(true), permission: 'delete_risk'}
    ];

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Risk Details'} />
            <PageHeader>
                <div className='flex gap-3'>
                    <ActionsDropdown label={'Actions'} items={actions} />
                    <button onClick={() => setIsPanelVisible(!isPanelVisible)} className={styles.panelToggleButton}>
                        <img src={panelToggleIcon} alt="" className='w-6 h-6' />
                    </button>
                </div>
            </PageHeader>
            <div className='mt-4'> {/* main content container */}
                <section>
                    <Review mode={'standalone'} />
                </section>
            </div>
            
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
                        <p className="mb-6">Are you sure you want to delete this risk? This action cannot be undone.</p>
                        <div className="flex justify-end gap-4">
                            <button 
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-red-600 text-white rounded-md"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
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