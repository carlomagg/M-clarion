import { useQuery } from "@tanstack/react-query";
import SearchField from "../../../../partials/SearchField/SearchField";
import riskQueueOptions from "../../../../../queries/risks/risk-queue";
import Table from "../../components/Table";
import { useState } from "react";

// Import or define the range function
const range = (start, end) => Array.from({ length: end - start }, (_, i) => start + i);

// Simple dropdown component implementation
function Dropdown({items, selected, onSelect, hasBorder = false}) {
    const [isExpanded, setIsExpanded] = useState(false);

    function handleSelect(item) {
        onSelect(item);
        setIsExpanded(false);
    }

    return (
        <div className="relative">
            <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className={`flex gap-3 items-center text-sm font-medium cursor-pointer ${hasBorder ? 'border-[.5px] border-[#CFCFCF] py-1 px-3 rounded' : ''}`}
            >
                {selected}
                <span className={`${isExpanded ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {
                isExpanded &&
                <div className="absolute bg-white z-20 top-full left-0 border border-[#CCC] rounded-md">
                    <ul className="">
                        {
                            items.map(item => {
                                return <li key={item} onClick={() => handleSelect(item)} className="cursor-pointer text-sm py-2 px-4 hover:bg-zinc-200">{item}</li>
                            })
                        }
                    </ul>
                </div>
            }
        </div>
    );
}

// PaginationButton component
function PaginationButton({page, presentPage, onSetPage}) {
    const isActive = presentPage === page;
    return (
        <button 
            type="button" 
            onClick={() => !isActive && onSetPage(page)} 
            className={`border-[.5px] text-sm rounded-full min-w-[30px] self-stretch ${isActive ? 'bg-[#DD127A1F] border-[#DD127A]' : 'border-[#CFCFCF]'}`}
        >
            {page}
        </button>
    );
}

// PaginationBar component
function PaginationBar({presentPage, onSetPage, totalPages}) {
    return (
        <div className="flex gap-3 items-center">
            <button 
                type="button" 
                onClick={() => onSetPage(Math.max(presentPage - 1, 1))} 
                disabled={presentPage === 1}
                className="border-[.5px] border-[#CFCFCF] text-sm rounded py-1 px-3 whitespace-nowrap disabled:opacity-50"
            >
                Previous Page
            </button>

            {
                totalPages > 3 ?
                <>
                    <PaginationButton page={1} presentPage={presentPage} onSetPage={onSetPage} />
                    {presentPage - 1 > 1 && <span className="cursor-pointer">...</span>}

                    <PaginationButton 
                    page={
                        presentPage !== 1 && presentPage !== totalPages ?
                        presentPage :
                        (
                            presentPage === 1 ?
                            presentPage + 1 :
                            presentPage - 1
                        )
                    }
                    presentPage={presentPage} onSetPage={onSetPage} />

                    {totalPages - presentPage > 1 && <span className="cursor-pointer">...</span>}
                    <PaginationButton page={totalPages} presentPage={presentPage} onSetPage={onSetPage} />
                </> :
                range(0, totalPages).map(i => <PaginationButton key={i} page={i+1} presentPage={presentPage} onSetPage={onSetPage} />)
            }

            <button 
                type="button" 
                onClick={() => onSetPage(Math.min(presentPage + 1, totalPages))} 
                disabled={presentPage === totalPages}
                className="border-[.5px] border-[#CFCFCF] text-sm rounded py-1 px-3 whitespace-nowrap disabled:opacity-50"
            >
                Next Page
            </button>
        </div>
    );
}

export default function RiskQueue({}) {
    const [filterTerm, setFilterTerm] = useState('');
    // Add pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // queries
    const {isLoading, error, data: risks} = useQuery(riskQueueOptions());

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    const filteredRisks = risks.filter(risk => new RegExp(filterTerm, 'i').test(risk['Title']));
    
    // Pagination logic
    const totalPages = Math.ceil(filteredRisks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRisks = filteredRisks.slice(startIndex, startIndex + itemsPerPage);
    
    // Reset to first page when filter changes
    if (filterTerm && currentPage !== 1) {
        setCurrentPage(1);
    }
    
    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    // Handle items per page change
    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    return (
        <section className='bg-white rounded-lg border border-[#CCC] p-6'>
            <div className='flex flex-col gap-6'>
                <h2 className='text-xl font-medium'>My Queue</h2>
                <div className='flex justify-between items-center'>
                    <SearchField placeholder="Search by ID or risk name" searchTerm={filterTerm} onChange={setFilterTerm} />
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Items per page:</span>
                        <Dropdown 
                            items={['5', '10', '15', '20', '50']} 
                            selected={itemsPerPage.toString()} 
                            onSelect={handleItemsPerPageChange} 
                            hasBorder={true}
                        />
                    </div>
                </div>
                <Table type={'risk'} items={paginatedRisks} hasSN={false} createRecordOptions={null} />
                
                {/* Pagination UI */}
                {filteredRisks.length > 0 && (
                    <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRisks.length)} of {filteredRisks.length} risks
                        </div>
                        {totalPages > 1 && (
                            <PaginationBar 
                                presentPage={currentPage} 
                                onSetPage={handlePageChange} 
                                totalPages={totalPages} 
                            />
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}