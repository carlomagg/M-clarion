import styles from './ManageRiskIndicators.module.css';

import { useState } from 'react';
import { CreateNewItemButton, InfoButton } from '../components/Buttons';
import { createPortal } from 'react-dom';
import Modal from '../components/Modal';
import SearchField from '../../../partials/SearchField/SearchField';
import RiskIndicatorsTable from './components/IndicatorsTable';
import { useQuery } from '@tanstack/react-query';
import { riskIndicatorsOptions } from '../../../../queries/risks/risk-indicators';
import BackButton from '../../components/BackButton';


function ManageRiskIndicators() {
    const [showModal, setShowModal] = useState(false);
    const [filterTerm, setFilterTerm] = useState('');

    // queries
    const {isLoading, error, data: riskIndicators} = useQuery(riskIndicatorsOptions());

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    const filteredRiskIndicators = riskIndicators.filter(i => new RegExp(`${filterTerm}`, 'i').test(i.indicator_name));

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8'>
            {
                showModal &&
                createPortal(
                    <Modal
                        type={'riskIndicator'}
                        context={{mode: 'add'}}
                        onRemove={() => setShowModal(false)}
                    />,
                    document.body
                )
            }
            <header className='flex gap-3'>
                <BackButton />
                <h3 className='font-semibold text-xl'>Risk Indicators</h3>
            </header>
            <section className="flex flex-col gap-3">
                <div className=''>
                    <CreateNewItemButton text='Create New Risk Indicator' classes='float-end' onClick={() => setShowModal(true)} />
                    <div>
                        <p className='flex gap-3 font-medium'>
                            Risk Indicators
                            <InfoButton />
                        </p>
                        <p className='italic text-[#565656]'>Description of the function of indicators</p>
                    </div>
                </div>
                <SearchField searchTerm={filterTerm} onChange={setFilterTerm} placeholder={'Search indicators'} />
                <RiskIndicatorsTable items={filteredRiskIndicators} />
            </section>
        </div>
    );
}

export default ManageRiskIndicators;