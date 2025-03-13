import styles from './RiskLog.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import SearchField from '../../../partials/SearchField/SearchField';
import { useState } from 'react';
import SortButton from './components/SortButton';
import FilterButton from './components/FilterButton';
import RiskLogTable from './components/LogTable';
import { useQuery } from '@tanstack/react-query';
import { riskLogOptions } from '../../../../queries/risks/risk-queries';
import importIcon from '../../../../assets/icons/import.svg';
import exportIcon from '../../../../assets/icons/export.svg';
import ActionsDropdown from '../../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import { filterItems } from '../../../../utils/helpers';

function RiskLog() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState(null);
    const actions = [
        {text: 'Import', icon: importIcon, type: 'action', action: () => {}, permission: 'add_mulitple_users_file'},
        {text: 'Export', icon: exportIcon, type: 'action', action: () => {}, permission: 'add_multiple_users_emails'},
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
    }

    // risk log query
    const {isLoading, error, data: risks} = useQuery(riskLogOptions({}));

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

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Risk Log'} />
            <PageHeader>
                <ActionsDropdown label={'Actions'} items={actions} />
            </PageHeader>
            <div className=''> {/* main content container */}
                <div className='bg-white p-6 flex flex-col gap-6 rounded-lg border border-[#CCC]'>
                    <header className='flex flex-col gap-3'>
                        <h3 className='font-semibold text-xl'>Risk Register <span className='font-normal'>({risks.length})</span></h3>
                        <div className='flex gap-[10px]'>
                            <div className='flex-1'>
                                <SearchField searchTerm={searchTerm} onChange={setSearchTerm} placeholder={'Search Risk using ID, Title or Category'} />
                            </div>
                            <SortButton text={'Date Created'} onClick={() => handleSortByClicked('date')} isActive={sortBy?.field === 'date'} sortOrder={sortBy?.field === 'date' ? sortBy.order : null} />
                            <SortButton text={'Rating'} onClick={() => handleSortByClicked('rating')} isActive={sortBy?.field === 'rating'} sortOrder={sortBy?.field === 'rating' ? sortBy.order : null} />
                            <SortButton text={'Status'} onClick={() => handleSortByClicked('status')} isActive={sortBy?.field === 'status'} sortOrder={sortBy?.field === 'status' ? sortBy.order : null} />
                            {/* <FilterButton /> */}
                        </div>
                    </header>
                    <RiskLogTable risks={sortedRisks} />
                </div>
            </div>
        </div>
    )
}

export default RiskLog;