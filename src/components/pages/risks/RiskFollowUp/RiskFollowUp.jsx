import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { riskLogOptions } from '../../../../queries/risks/risk-queries';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import PageHeader from '../../../partials/PageHeader/PageHeader';
import { FollowUpDialog } from '../../../partials/forms/risk-register/RiskReview/components/FollowUpContent';
import FollowUpContext from '../../../partials/forms/risk-register/RiskReview/contexts/follow-up';
import SearchField from '../../../partials/SearchField/SearchField';
import { filterItems } from '../../../../utils/helpers';
import useUser from '../../../../hooks/useUser';

function RiskFollowUp() {
    const user = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRisk, setSelectedRisk] = useState(null);
    
    // Fetch risks for selection
    const { isLoading, error, data: risks } = useQuery(riskLogOptions({}));
    
    // Filter risks based on search term
    const filteredRisks = risks ? filterItems(searchTerm, risks, ['Title', 'category', 'risk_id']) : [];
    
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
                    <div className='w-full max-w-md'>
                        <SearchField 
                            searchTerm={searchTerm} 
                            onChange={setSearchTerm} 
                            placeholder={'Search Risk using ID, Title or Category'} 
                        />
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
                            <h4 className="font-medium mb-4">Select a risk to manage follow-ups:</h4>
                            <div className="grid gap-4">
                                {filteredRisks.length > 0 ? (
                                    filteredRisks.map(risk => (
                                        <div 
                                            key={risk.risk_id}
                                            className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                                            onClick={() => setSelectedRisk(risk.risk_id)}
                                        >
                                            <div className="flex justify-between">
                                                <span className="font-medium">{risk.Title}</span>
                                                <span className="text-sm text-gray-500">ID: {risk.risk_id}</span>
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                <span>Category: {risk.category}</span>
                                                <span className="ml-4">Status: {risk.status}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No risks found matching your search criteria.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RiskFollowUp; 