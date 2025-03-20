import styles from './ControlFamilyTypes.module.css';

import { useState } from 'react';
import { CreateNewItemButton, InfoButton } from '../components/Buttons';
import { createPortal } from 'react-dom';
import Modal from '../components/Modal';
import SearchField from '../../../partials/SearchField/SearchField';
import FamilyTypesTable from './components/ControlFamilyTypesTable';
import { useQuery } from '@tanstack/react-query';
import { riskControlFamilyTypesOptions } from '../../../../queries/risks/risk-control-family-types';
import BackButton from '../../components/BackButton';


function ControlFamilyTypes() {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // queries
    const {isLoading, error, data} = useQuery(riskControlFamilyTypesOptions());

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    const filteredFamilyTypes = data.filter(c => new RegExp(searchTerm, 'i').test(c.type));

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8'>
            {
                showModal &&
                createPortal(
                    <Modal 
                        type={'familyType'}
                        context={{mode: 'add'}}
                        onRemove={() => setShowModal(false)}
                    />,
                    document.body
                )
            }
            <header className='flex gap-3'>
                <BackButton />
                <h3 className='font-semibold text-xl'>Control Family Types</h3>
            </header>
            <section className="flex flex-col gap-3">
                <div className='flex justify-between items-center'>
                    <p className='flex gap-3 font-medium'>
                        Control Family Types
                        <InfoButton />
                    </p>
                    <CreateNewItemButton text='Create New Control Family Types' onClick={() => setShowModal(true)} />
                </div>
                <SearchField placeholder={'Search control family type'} searchTerm={searchTerm} onChange={setSearchTerm} />
                <FamilyTypesTable items={filteredFamilyTypes} />
            </section>
        </div>
    );
}

export default ControlFamilyTypes;