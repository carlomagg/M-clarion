import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { riskLogOptions } from '../../../../queries/risks/risk-queries';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import PageHeader from '../../../partials/PageHeader/PageHeader';
import { FollowUpDialog } from '../../../partials/forms/risk-register/RiskReview/components/FollowUpContent';
import FollowUpContext from '../../../partials/forms/risk-register/RiskReview/contexts/follow-up';
import SearchField from '../../../partials/SearchField/SearchField';
import { filterItems } from '../../../../utils/helpers';
import useUser from '../../../../hooks/useUser';
import OptionsDropdown from '../../../partials/dropdowns/OptionsDropdown/OptionsDropdown';

function RiskFollowUp() {
    const user = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRisk, setSelectedRisk] = useState(null);
    
    // Add pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    
    // Fetch risks for selection
    const { isLoading, error, data: risks } = useQuery(riskLogOptions({}));
    
    // Filter risks based on search term
    const filteredRisks = risks ? filterItems(searchTerm, risks, ['Title', 'category', 'risk_id']) : [];
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredRisks.length / pageSize);
    const paginatedRisks = filteredRisks.slice(
        (currentPage - 1) * pageSize, 
        currentPage * pageSize
    );
    
    // Handle page changes
    const handlePageChange = (newPage) => {
        // Make sure we stay within valid page range
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            
            // Reset selected risk when changing pages
            setSelectedRisk(null);
        }
    };
    
    // Handle page size changes
    const handlePageSizeChange = (event) => {
        const newSize = parseInt(event.target.value);
        setPageSize(newSize);
        setCurrentPage(1); // Reset to first page
        setSelectedRisk(null); // Reset selected risk
    };
    
    // Reset pagination when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);
    
    // Create options for the 3-dot menu
    const createRiskOptions = (riskId) => {
        return [
            {
                text: 'Manage Follow-up', 
                type: 'action', 
                action: () => setSelectedRisk(riskId)
            }
        ];
    };
    
    // Context for the FollowUpDialog
    const followUpContext = {
        mode: 'add',
        riskId: selectedRisk,
        setContext: (context) => {}
    };

    if (isLoading) {
        return (
            <div className='p-10 pt-4 max-w-7xl flex-1 flex flex-col gap-6'>
                <PageTitle title={'Risk Follow Up'} />
                <PageHeader />
                <div className="flex justify-center py-8">
                    <span>Loading risks...</span>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className='p-10 pt-4 max-w-7xl flex-1 flex flex-col gap-6'>
                <PageTitle title={'Risk Follow Up'} />
                <PageHeader />
                <div className="text-red-500 py-4">
                    Failed to load risks. Please try again.
                </div>
            </div>
        );
    }

    return (
        <div className='p-10 pt-4 max-w-7xl flex-1 flex flex-col gap-6'>
            <PageTitle title={'Risk Follow Up'} />
            <PageHeader />
            
            <div className='bg-white p-6 flex flex-col gap-6 rounded-lg border border-[#CCC]'>
                <header>
                    <h3 className='font-semibold text-xl mb-4'>Risk Follow Up Management</h3>
                    <div className='flex gap-4 items-end'>
                        <div className='w-full max-w-md'>
                            <SearchField 
                                searchTerm={searchTerm} 
                                onChange={setSearchTerm} 
                                placeholder={'Search Risk using ID, Title or Category'} 
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="pageSize" className="text-sm text-gray-600">Items per page:</label>
                            <select 
                                id="pageSize" 
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                className="border px-2 py-1 rounded text-sm"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                </header>
                
                <div className="flex flex-col">
                    {selectedRisk ? (
                        <div className="mt-6">
                            <FollowUpContext.Provider value={followUpContext}>
                                <FollowUpDialog onRemove={() => setSelectedRisk(null)} />
                            </FollowUpContext.Provider>
                        </div>
                    ) : (
                        <div className="mt-6">
                            {/* Risk Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Risk ID
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedRisks.length > 0 ? (
                                            paginatedRisks.map(risk => (
                                                <tr key={risk.risk_id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {risk.risk_id}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 max-w-sm truncate">
                                                        {risk.Title}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                        {risk.category}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                        {risk.status}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                                                        <OptionsDropdown options={createRiskOptions(risk.risk_id)} />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                                                    No risks found matching your search criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination UI */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                    <div className="text-sm text-gray-600">
                                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredRisks.length)} of {filteredRisks.length} risks
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(1)}
                                            disabled={currentPage === 1}
                                            className="px-2 py-1 text-sm border rounded disabled:opacity-50 border-pink-300 text-pink-600 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                        >
                                            &#171; First
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-2 py-1 text-sm border rounded disabled:opacity-50 border-pink-300 text-pink-600 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                        >
                                            &#8249; Prev
                                        </button>
                                        <span className="px-3 py-1 text-sm bg-pink-100 text-pink-800 rounded">
                                            {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-2 py-1 text-sm border rounded disabled:opacity-50 border-pink-300 text-pink-600 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                        >
                                            Next &#8250;
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="px-2 py-1 text-sm border rounded disabled:opacity-50 border-pink-300 text-pink-600 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                        >
                                            Last &#187;
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RiskFollowUp; 