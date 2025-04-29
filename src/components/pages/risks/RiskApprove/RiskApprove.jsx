import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskLog from '../RiskLog/RiskLog';
import useUser from '../../../../hooks/useUser';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import PageHeader from '../../../partials/PageHeader/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { riskLogOptions } from '../../../../queries/risks/risk-queries';
import RiskLogTable from '../RiskLog/components/LogTable';
import SearchField from '../../../partials/SearchField/SearchField';
import { filterItems } from '../../../../utils/helpers';

function RiskApprove() {
    const navigate = useNavigate();
    const user = useUser();
    const [searchTerm, setSearchTerm] = useState('');

    // Use the regular risk log query
    const { isLoading, error, data: allRisks } = useQuery(riskLogOptions({}));
    
    if (isLoading) {
        return <div className='p-10 pt-4 max-w-7xl flex-1 flex flex-col gap-6'>
            <PageTitle title={'Risk Approval'} />
            <PageHeader />
            <div className="flex justify-center py-8">
                <span>Loading risks...</span>
            </div>
        </div>;
    }
    
    if (error) {
        return <div className='p-10 pt-4 max-w-7xl flex-1 flex flex-col gap-6'>
            <PageTitle title={'Risk Approval'} />
            <PageHeader />
            <div className="text-red-500 py-4">
                Failed to load risks. Please try again.
            </div>
        </div>;
    }
    
    // For now, since we don't have a way to get pending approvals,
    // we'll just show all risks. In a real implementation, we'd filter based on
    // approval status and the current user's ID.
    const risksNeedingApproval = allRisks || [];
    
    // Filter by search term if provided
    const filteredRisks = filterItems(searchTerm, risksNeedingApproval, ['Title', 'category', 'risk_id']);
    
    return (
        <div className='p-10 pt-4 max-w-7xl flex-1 flex flex-col gap-6'>
            <PageTitle title={'Risk Approval'} />
            <PageHeader />
            <div className="mt-4 flex flex-col gap-6">
                <div className='bg-white p-6 flex flex-col gap-6 rounded-lg border border-[#CCC]'>
                    <header className='flex flex-col gap-3'>
                        <h3 className='font-semibold text-xl'>Risks Pending Approval <span className='font-normal'>({filteredRisks.length})</span></h3>
                        <div className='flex gap-[10px]'>
                            <div className='flex-1'>
                                <SearchField 
                                    searchTerm={searchTerm} 
                                    onChange={setSearchTerm} 
                                    placeholder={'Search Risk using ID, Title or Category'} 
                                />
                            </div>
                        </div>
                    </header>
                    
                    <p className="text-sm text-gray-600 mb-2">
                        Below are the risks that need your approval. Click on a risk to view its details and take action.
                    </p>
                    
                    {filteredRisks.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">No risks are currently pending your approval.</p>
                        </div>
                    ) : (
                        <RiskLogTable risks={filteredRisks} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default RiskApprove; 