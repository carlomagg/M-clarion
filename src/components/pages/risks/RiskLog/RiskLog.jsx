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
import SelectDropdown from '../../../partials/dropdowns/SelectDropdown/SelectDropdown';
import { filterItems } from '../../../../utils/helpers';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import useUser from '../../../../hooks/useUser';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';

export default function RiskLog({approvalMode = false}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('');
    const [isStatusDropdownCollapsed, setIsStatusDropdownCollapsed] = useState(true);
    const dispatchMessage = useDispatchMessage();
    
    // Export to CSV function
    const exportToCSV = async () => {
        try {
            // Get all risks data
            const allRisks = risks || [];
            if (allRisks.length === 0) {
                dispatchMessage('failed', 'No risk data to export');
                return;
            }
            
            // Define headers based on the fields we want to include
            const headers = ['Risk ID', 'Title', 'Description', 'Category', 'Rating', 'Status', 'Owner'];
            
            // Map the data to match our headers
            const csvData = allRisks.map(risk => [
                risk.risk_id || '',
                risk.Title || '',
                risk.description || '',
                risk.category || '',
                risk.risk_rating || '',
                risk.status || '',
                risk.Owner || ''
            ]);
            
            // Prepend headers to data
            csvData.unshift(headers);
            
            // Convert to CSV format
            const csvContent = csvData.map(row => row.map(cell => {
                // Handle cells with commas, quotes, or newlines
                const cellStr = String(cell).replace(/"/g, '""');
                return `"${cellStr}"`;
            }).join(',')).join('\n');
            
            // Create a Blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'risk_log_export.csv');
            document.body.appendChild(link);
            
            // Trigger download
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            dispatchMessage('success', 'Risk data exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            dispatchMessage('failed', 'Failed to export risk data');
        }
    };

    const actions = [
        {text: 'Import', icon: importIcon, type: 'link', link: '/risks/import', permission: 'add_mulitple_users_file'},
        {text: 'Export', icon: exportIcon, type: 'action', onClick: exportToCSV, permission: 'add_multiple_users_emails'},
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
    
    // Handle status filter changes
    function handleStatusFilterChange(e) {
        setStatusFilter(e.target.value);
        setCurrentPage(1); // Reset to first page when filter changes
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

    // Get unique statuses from the risks data
    const uniqueStatuses = [...new Set(risks.map(risk => risk.status))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)); // Sort statuses alphabetically
    const statusOptions = uniqueStatuses.map(status => ({ id: status, text: status }));
    
    // First filter by search term
    const searchFiltered = filterItems(searchTerm, risks, ['Title', 'category', 'risk_id']);
    
    // Then apply status filter if one is selected (case-insensitive)
    const filteredRisks = statusFilter 
        ? searchFiltered.filter(risk => {
            // Handle null or undefined status
            if (!risk.status) return false;
            
            // Case-insensitive comparison
            return risk.status.toLowerCase() === statusFilter.toLowerCase();
        })
        : searchFiltered;

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
                {!approvalMode && <ActionsDropdown label={'Actions'} items={actions} />}
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
                            {/* Status Filter Dropdown for Approval Mode */}
                            {approvalMode && uniqueStatuses.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="w-48">
                                        <SelectDropdown
                                            items={[{id: '', text: 'All Statuses'}, ...statusOptions]}
                                            name="statusFilter"
                                            selected={statusFilter}
                                            onSelect={handleStatusFilterChange}
                                            placeholder="Filter by Status"
                                            isCollapsed={isStatusDropdownCollapsed}
                                            onToggleCollpase={setIsStatusDropdownCollapsed}
                                        />
                                    </div>
                                    {statusFilter && (
                                        <button
                                            onClick={() => setStatusFilter('')}
                                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                            title="Clear filter"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </header>
                    {approvalMode && 
                        <p className="text-sm text-gray-600 mb-2">
                            These risks have been assigned to you for approval. Click on a risk to view its details and approve or reject.
                            {statusFilter && ` (Filtered by status: ${statusFilter})`}
                        </p>
                    }
                    {paginatedRisks.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">
                                {approvalMode 
                                    ? (statusFilter 
                                       ? `No risks with status "${statusFilter}" are currently pending your approval.` 
                                       : "No risks are currently pending your approval.")
                                    : "No risks match your search criteria."}
                            </p>
                        </div>
                    ) : (
                        <RiskLogTable 
                            risks={paginatedRisks} 
                            approvalMode={approvalMode} 
                            activeFilter={statusFilter ? 'status' : null}
                        />
                    )}
                    
                    {/* Pagination Controls */}
                    {sortedRisks.length > itemsPerPage && (
                        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, sortedRisks.length)}</span> of{' '}
                                        <span className="font-medium">{sortedRisks.length}</span> results
                                        {statusFilter && <span className="ml-1 italic">(filtered by status: {statusFilter})</span>}
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ${currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                        >
                                            <span className="sr-only">Previous</span>
                                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                        {/* Page numbers */}
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                    page === currentPage
                                                        ? 'z-10 bg-pink-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600'
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ${currentPage === totalPages ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                        >
                                            <span className="sr-only">Next</span>
                                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}