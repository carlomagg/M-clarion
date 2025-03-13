import styles from './RiskResponses.module.css';

import { useState } from 'react';
import { CreateNewItemButton, InfoButton } from '../components/Buttons';
import { createPortal } from 'react-dom';
import Modal from '../components/Modal';
import SearchField from '../../../partials/SearchField/SearchField';
import RiskResponsesTable from './components/ResponsesTable';
import { useQuery } from '@tanstack/react-query';
import { riskResponsesOptions } from '../../../../queries/risks/risk-responses';
import BackButton from '../../components/BackButton';


function RiskResponses() {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // queries
    const {isLoading, error, data} = useQuery(riskResponsesOptions());

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    console.log(data)
    const filteredResponses = data.filter(r => new RegExp(searchTerm, 'i').test(r.name));

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8'>
            {
                showModal &&
                createPortal(
                    <Modal
                        type={'riskResponse'}
                        context={{mode: 'add'}}
                        onRemove={() => setShowModal(false)}
                    />,
                    document.body
                )
            }
            <header className='flex gap-3'>
                <BackButton />
                <h3 className='font-semibold text-xl'>Risk Responses</h3>
            </header>
            <section className="flex flex-col gap-3">
                <div className='flex justify-between items-center'>
                    <p className='flex gap-3 font-medium'>
                        Risk Responses
                        <InfoButton />
                    </p>
                    <CreateNewItemButton text='Create New Risk Response' onClick={() => setShowModal(true)} />
                </div>
                <SearchField placeholder={'Search responses'} searchTerm={searchTerm} onChange={setSearchTerm} />
                <RiskResponsesTable items={filteredResponses} />
            </section>
        </div>
    );
}

export default RiskResponses;