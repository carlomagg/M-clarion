import { useState } from 'react';
import PageHeader from '../../../partials/PageHeader/PageHeader';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import SearchField from '../../../partials/SearchField/SearchField';
import RiskRegisterTable from './components/RiskRegisterTable';
import { useQuery } from '@tanstack/react-query';
import { riskLogOptions } from '../../../../queries/risks/risk-queries';
import SortButton from '../RiskLog/components/SortButton';
import FilterButton from '../RiskLog/components/FilterButton';
import exportIcon from '../../../../assets/icons/export.svg';
import ActionsDropdown from '../../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import SelectDropdown from '../../../partials/dropdowns/SelectDropdown/SelectDropdown';
import { filterItems } from '../../../../utils/helpers';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';

export default function RiskRegisterPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isCategoryDropdownCollapsed, setIsCategoryDropdownCollapsed] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [isStatusDropdownCollapsed, setIsStatusDropdownCollapsed] = useState(true);
    const [priorityFilter, setPriorityFilter] = useState('');
    const [isPriorityDropdownCollapsed, setIsPriorityDropdownCollapsed] = useState(true);
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
            const headers = [
                'Risk ID', 
                'Title', 
                'Description', 
                'Category', 
                'Rating',
                'Priority Level',
                'Status', 
                'Owner'
            ];
            
            // Map the data to match our headers
            const csvData = allRisks.map(risk => {
                const priorityLevel = getPriorityLevel(risk.risk_rating);
                
                return [
                    risk.risk_id || '',
                    risk.Title || '',
                    risk.description || '',
                    risk.category || '',
                    risk.risk_rating || '',
                    priorityLevel || '',
                    risk.status || '',
                    risk.Owner || ''
                ];
            });
            
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
            link.setAttribute('download', 'risk_register_export.csv');
            document.body.appendChild(link);
            
            // Trigger download
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            dispatchMessage('success', 'Risk register data exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            dispatchMessage('failed', 'Failed to export risk register data');
        }
    };

    const actions = [
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
                const statusComparison = String(a.status || '').localeCompare(b.status || '');
                return order === 'asc' ? statusComparison : -statusComparison;
                
            case 'category':
                const categoryComparison = String(a.category || '').localeCompare(b.category || '');
                return order === 'asc' ? categoryComparison : -categoryComparison;
                
            case 'priority':
                const aPriority = getPriorityValue(a.risk_rating);
                const bPriority = getPriorityValue(b.risk_rating);
                return order === 'asc' ? aPriority - bPriority : bPriority - aPriority;
                
            default:
                return 0;
        }
    }

    function handleSortByClicked(field) {
        const order = sortBy ?
        (sortBy.field === field ? (sortBy.order + 1) % 2 : 0) :
        0;

        setSortBy({field, order});
        setCurrentPage(1); // Reset to first page when sorting changes
    }

    function handlePageChange(newPage) {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    }
    
    // Handle category filter changes
    function handleCategoryFilterChange(e) {
        setCategoryFilter(e.target.value);
        setCurrentPage(1); // Reset to first page when filter changes
    }
    
    // Handle status filter changes
    function handleStatusFilterChange(e) {
        setStatusFilter(e.target.value);
        setCurrentPage(1); // Reset to first page when filter changes
    }
    
    // Handle priority filter changes
    function handlePriorityFilterChange(e) {
        setPriorityFilter(e.target.value);
        setCurrentPage(1); // Reset to first page when filter changes
    }
    
    // Function to map priority level text to numerical value for sorting
    function getPriorityValue(rating) {
        if (!rating) return 0;
        if (rating >= 15) return 4; // Critical
        if (rating >= 10) return 3; // High
        if (rating >= 5) return 2;  // Medium
        return 1; // Low
    }
    
    // Function to get priority level text
    function getPriorityLevel(rating) {
        if (!rating) return '-';
        if (rating >= 15) return 'Critical';
        if (rating >= 10) return 'High';
        if (rating >= 5) return 'Medium';
        return 'Low';
    }

    // Query risk data
    const {isLoading, error, data: risks} = useQuery(riskLogOptions({}));

    if (isLoading) {
        return <div>Loading</div>
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

    // Get unique categories from the risks data
    const uniqueCategories = [...new Set(risks.map(risk => risk.category))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)); // Sort categories alphabetically
    const categoryOptions = uniqueCategories.map(category => ({ id: category, text: category }));
    
    // Get unique statuses from the risks data
    const uniqueStatuses = [...new Set(risks.map(risk => risk.status))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)); // Sort statuses alphabetically
    const statusOptions = uniqueStatuses.map(status => ({ id: status, text: status }));
    
    // Define priority options
    const priorityOptions = [
        { id: 'Critical', text: 'Critical' },
        { id: 'High', text: 'High' },
        { id: 'Medium', text: 'Medium' },
        { id: 'Low', text: 'Low' }
    ];
    
    // First filter by search term
    const searchFiltered = filterItems(searchTerm, risks, ['Title', 'category', 'risk_id', 'Owner']);
    
    // Then apply category filter if one is selected
    const categoryFiltered = categoryFilter 
        ? searchFiltered.filter(risk => risk.category?.toLowerCase() === categoryFilter.toLowerCase())
        : searchFiltered;
    
    // Then apply status filter if one is selected
    const statusFiltered = statusFilter 
        ? categoryFiltered.filter(risk => risk.status?.toLowerCase() === statusFilter.toLowerCase())
        : categoryFiltered;
    
    // Then apply priority filter if one is selected
    const priorityFiltered = priorityFilter 
        ? statusFiltered.filter(risk => {
            const priorityLevel = getPriorityLevel(risk.risk_rating);
            return priorityLevel.toLowerCase() === priorityFilter.toLowerCase();
        })
        : statusFiltered;

    // Apply sorting
    const sortedRisks = sortBy
        ? priorityFiltered.sort(sortFunction)
        : priorityFiltered;

    // Pagination logic
    const totalPages = Math.ceil(sortedRisks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRisks = sortedRisks.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Risk Register'} />
            <PageHeader>
                <ActionsDropdown label={'Actions'} items={actions} />
            </PageHeader>
            <div> {/* main content container */}
                <div className='bg-white p-6 flex flex-col gap-6 rounded-lg border border-[#CCC]'>
                    <header className='flex flex-col gap-3'>
                        <h3 className='font-semibold text-xl'>Risk Register <span className='font-normal'>({risks.length})</span></h3>
                        <div className='flex flex-wrap gap-3'>
                            <div className='flex-1 min-w-[200px]'>
                                <SearchField 
                                    searchTerm={searchTerm} 
                                    onChange={(value) => {
                                        setSearchTerm(value);
                                        setCurrentPage(1); // Reset to first page when search changes
                                    }} 
                                    placeholder={'Search by ID, Title, Category, or Owner'} 
                                />
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {/* Category filter */}
                                <div className="w-40">
                                    <SelectDropdown
                                        items={[{id: '', text: 'All Categories'}, ...categoryOptions]}
                                        name="categoryFilter"
                                        selected={categoryFilter}
                                        onSelect={handleCategoryFilterChange}
                                        placeholder="Filter by Category"
                                        isCollapsed={isCategoryDropdownCollapsed}
                                        onToggleCollpase={setIsCategoryDropdownCollapsed}
                                    />
                                </div>
                                
                                {/* Status filter */}
                                <div className="w-40">
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
                                
                                {/* Priority filter */}
                                <div className="w-40">
                                    <SelectDropdown
                                        items={[{id: '', text: 'All Priorities'}, ...priorityOptions]}
                                        name="priorityFilter"
                                        selected={priorityFilter}
                                        onSelect={handlePriorityFilterChange}
                                        placeholder="Filter by Priority"
                                        isCollapsed={isPriorityDropdownCollapsed}
                                        onToggleCollpase={setIsPriorityDropdownCollapsed}
                                    />
                                </div>
                                
                                {/* Clear filters button - shown only if any filter is active */}
                                {(categoryFilter || statusFilter || priorityFilter) && (
                                    <button
                                        onClick={() => {
                                            setCategoryFilter('');
                                            setStatusFilter('');
                                            setPriorityFilter('');
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                                        title="Clear all filters"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* Sorting options */}
                        <div className='flex flex-wrap gap-2'>
                            <SortButton text={'Risk ID'} onClick={() => handleSortByClicked('date')} isActive={sortBy?.field === 'date'} sortOrder={sortBy?.field === 'date' ? sortBy.order : null} />
                            <SortButton text={'Category'} onClick={() => handleSortByClicked('category')} isActive={sortBy?.field === 'category'} sortOrder={sortBy?.field === 'category' ? sortBy.order : null} />
                            <SortButton text={'Risk Rating'} onClick={() => handleSortByClicked('rating')} isActive={sortBy?.field === 'rating'} sortOrder={sortBy?.field === 'rating' ? sortBy.order : null} />
                            <SortButton text={'Priority Level'} onClick={() => handleSortByClicked('priority')} isActive={sortBy?.field === 'priority'} sortOrder={sortBy?.field === 'priority' ? sortBy.order : null} />
                            <SortButton text={'Status'} onClick={() => handleSortByClicked('status')} isActive={sortBy?.field === 'status'} sortOrder={sortBy?.field === 'status' ? sortBy.order : null} />
                        </div>
                    </header>
                    
                    <div className="mt-2">
                        {/* Active filters display */}
                        {(categoryFilter || statusFilter || priorityFilter) && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {categoryFilter && (
                                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                                        Category: {categoryFilter}
                                        <button 
                                            onClick={() => setCategoryFilter('')}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                )}
                                {statusFilter && (
                                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded flex items-center">
                                        Status: {statusFilter}
                                        <button 
                                            onClick={() => setStatusFilter('')}
                                            className="ml-1 text-green-600 hover:text-green-800"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                )}
                                {priorityFilter && (
                                    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center">
                                        Priority: {priorityFilter}
                                        <button 
                                            onClick={() => setPriorityFilter('')}
                                            className="ml-1 text-yellow-600 hover:text-yellow-800"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                        
                        {paginatedRisks.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">
                                    No risks match your search criteria.
                                </p>
                            </div>
                        ) : (
                            <RiskRegisterTable risks={paginatedRisks} />
                        )}
                    </div>
                    
                    {/* Pagination Controls */}
                    {sortedRisks.length > itemsPerPage && (
                        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                            <div className="flex items-center">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                                    <span className="font-medium">
                                        {Math.min(startIndex + itemsPerPage, sortedRisks.length)}
                                    </span>{" "}
                                    of <span className="font-medium">{sortedRisks.length}</span> results
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                                        currentPage === 1
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                    } text-sm font-medium`}
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                                
                                {/* Page number buttons */}
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        // If 5 or fewer pages, show all
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        // If on pages 1-3, show 1-5
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        // If on last 3 pages, show last 5
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        // Otherwise show current page and 2 before/after
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                                                currentPage === pageNum
                                                    ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                                        currentPage === totalPages
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                    } text-sm font-medium`}
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 