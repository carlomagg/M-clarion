import styles from './ManageRiskAppetite.module.css';

import { useState } from 'react';
import { InfoButton } from '../components/Buttons';
import SearchField from '../../../partials/SearchField/SearchField';
import AppetitesTable from './components/AppetitesTable';
import { useQuery } from '@tanstack/react-query';
import { riskAppetitesOptions } from '../../../../queries/risks/risk-appetites';
import BackButton from '../../components/BackButton';


function ManageRiskAppetite() {
    const [searchTerm, setSearchTerm] = useState('');

    // queries
    const {isLoading, error, data} = useQuery(riskAppetitesOptions());

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    const filteredAppetites = data.filter(c => new RegExp(searchTerm, 'i').test(c.category.name));

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8'>
            <header className='flex gap-3'>
                <BackButton />
                <h3 className='font-semibold text-xl'>Risk Appetite Management</h3>
            </header>
            <section className="flex flex-col gap-3">
                <div>
                    <p className='flex gap-3 font-medium'>
                        Risk Appetite By Categories
                        <InfoButton />
                    </p>
                    <p className='italic text-[#565656]'>Customize risk settings for specific categories.</p>
                </div>
                <SearchField placeholder={'Search categories'} searchTerm={searchTerm} onChange={setSearchTerm} />
                <AppetitesTable items={filteredAppetites} />
            </section>
        </div>
    );
}

export default ManageRiskAppetite;