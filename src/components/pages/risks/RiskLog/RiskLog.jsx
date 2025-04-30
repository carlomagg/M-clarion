import styles from './RiskLog.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import SearchField from '../../../partials/SearchField/SearchField';
import { useState } from 'react';
import SortButton from './components/SortButton';
import FilterButton from './components/FilterButton';
import RiskLogTable from './components/LogTable';
import { useQuery } from '@tanstack/react-query';
import { riskLogOptions, risksPendingApprovalOptions } from '../../../../queries/risks/risk-queries';
import importIcon from '../../../../assets/icons/import.svg';
import exportIcon from '../../../../assets/icons/export.svg';
import ActionsDropdown from '../../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import { filterItems } from '../../../../utils/helpers';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import useUser from '../../../../hooks/useUser';

function RiskLog({ approvalMode = false }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const user = useUser();
    const itemsPerPage = 10;

    const actions = [
        {text: 'Import', icon: importIcon, type: 'action', onClick: () => {}, permission: 'add_mulitple_users_file'},
        {text: 'Export', icon: exportIcon, type: 'action', onClick: () => {}, permission: 'add_multiple_users_emails'},
    ];

    const sortOrders = ['asc', 'desc'];

    function sortFunction(a, b) {
        const order = sortOrders[sortBy.order];

        switch (sortBy.field) {
            case 'date':
                return order === 'asc' ? a.risk_id - b.risk_id : b.risk_id - a.risk_id;
                
            case 'rating':
                return order === 'asc' ? a.risk_rating - b.risk_rating : b.risk_rating - a.risk_rating;
                
            case 'status':
                const comparison = String(a.status).localeCompare(b.status);
                return order === 'asc' ? comparison : -comparison;
        
            default:
                return 0;
        }
    }

    function handleSortByClicked(field) {
        const order = sortBy ?
        (sortBy.field === field ? (sortBy.order + 1) % 2 : 0) :
        field === 'date' ? 1 : 0;

        setSortBy({field, order});
        setCurrentPage(1); // Reset to first page when sorting changes
    }

    function handlePageChange(newPage) {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    }

    // Choose which query to use based on approvalMode
    const queryOptions = approvalMode ? risksPendingApprovalOptions() : riskLogOptions({});
    const {isLoading, error, data: risks} = useQuery(queryOptions);

    if (isLoading) {
        return <div>Loading</div>
    }

    if (error) {
        return <div>error</div>
    }

    const filteredRisks = filterItems(searchTerm, risks, ['Title', 'category', 'risk_id']);

    const sortedRisks = sortBy ?
    filteredRisks.sort(sortFunction) :
    filteredRisks;

    // Pagination logic
    const totalPages = Math.ceil(sortedRisks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRisks = sortedRisks.slice(startIndex, startIndex + itemsPerPage);

    const pageTitle = approvalMode ? 'Risk Approval' : 'Risk Log';
    const tableTitle = approvalMode ? 'Risks Pending Approval' : 'Manage Risk';

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={pageTitle} />
            <PageHeader>
                <ActionsDropdown label={'Actions'} items={actions} />
            </PageHeader>
            <div className=''> {/* main content container */}
                <div className='bg-white p-6 flex flex-col gap-6 rounded-lg border border-[#CCC]'>
                    <header className='flex flex-col gap-3'>
                        <h3 className='font-semibold text-xl'>{tableTitle} <span className='font-normal'>({risks.length})</span></h3>
                        <div className='flex gap-[10px]'>
                            <div className='flex-1'>
                                <SearchField searchTerm={searchTerm} onChange={(value) => {
                                    setSearchTerm(value);
                                    setCurrentPage(1); // Reset to first page when search changes
                                }} placeholder={'Search Risk using ID, Title or Category'} />
                            </div>
                            <SortButton text={'Date Created'} onClick={() => handleSortByClicked('date')} isActive={sortBy?.field === 'date'} sortOrder={sortBy?.field === 'date' ? sortBy.order : null} />
                            <SortButton text={'Rating'} onClick={() => handleSortByClicked('rating')} isActive={sortBy?.field === 'rating'} sortOrder={sortBy?.field === 'rating' ? sortBy.order : null} />
                            <SortButton text={'Status'} onClick={() => handleSortByClicked('status')} isActive={sortBy?.field === 'status'} sortOrder={sortBy?.field === 'status' ? sortBy.order : null} />
                            {/* <FilterButton /> */}
                        </div>
                    </header>
                    {approvalMode && 
                        <p className="text-sm text-gray-600 mb-2">
                            These risks have been assigned to you for approval. Click on a risk to view its details and approve or reject.
                        </p>
                    }
                    {paginatedRisks.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">
                                {approvalMode 
                                    ? "No risks are currently pending your approval." 
                                    : "No risks match your search criteria."}
                            </p>
                        </div>
                    ) : (
                        <RiskLogTable risks={paginatedRisks} />
                    )}
                    
                    {/* Pagination Controls */}
                    {sortedRisks.length > itemsPerPage && (
                        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                            <div className="flex justify-between w-full">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, sortedRisks.length)}</span> of{' '}
                                    <span className="font-medium">{sortedRisks.length}</span> results
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`relative inline-flex items-center px-3 py-2 rounded-md ${
                                            currentPage === 1
                                                ? 'bg-pink-100 text-pink-300 cursor-not-allowed'
                                                : 'bg-[#E91E63] text-white hover:bg-pink-700'
                                        } transition-colors duration-200`}
                                    >
                                        <ChevronLeftIcon className="w-5 h-5 mr-2" />
                                        <span>Previous</span>
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`relative inline-flex items-center px-3 py-2 rounded-md ${
                                            currentPage === totalPages
                                                ? 'bg-pink-100 text-pink-300 cursor-not-allowed'
                                                : 'bg-[#E91E63] text-white hover:bg-pink-700'
                                        } transition-colors duration-200`}
                                    >
                                        <span className="mr-2">Next</span>
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RiskLog;