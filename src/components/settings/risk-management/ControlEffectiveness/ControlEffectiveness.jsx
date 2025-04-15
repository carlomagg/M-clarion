import styles from './ControlEffectiveness.module.css';

import { useState } from 'react';
import { CreateNewItemButton } from '../components/Buttons';
import { createPortal } from 'react-dom';
import Modal from '../components/Modal';
import { useQuery } from '@tanstack/react-query';
import { allRiskControlEffectivenessOptions } from '../../../../queries/risks/risk-control-effectiveness';
import ControlEffectivenessTable from './components/ControlEffectivenessTable';
import BackButton from '../../components/BackButton';


function ControlEffectiveness() {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // queries
    const {isLoading, error, data: controls} = useQuery(allRiskControlEffectivenessOptions());

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    console.log(controls)
    // const filteredControls = data.filter(r => new RegExp(searchTerm, 'i').test(r.description));

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8'>
            {
                showModal &&
                createPortal(
                    <Modal
                        type={'controlEffectiveness'}
                        context={{mode: 'add'}}
                        onRemove={() => setShowModal(false)}
                    />,
                    document.body
                )
            }
            <header className='flex gap-3'>
                <BackButton />
                <h3 className='font-semibold text-xl'>Control Effectiveness</h3>
            </header>
            <section className="flex flex-col gap-3">
                <div className='flex justify-between items-center'>
                    <p className='font-medium'>Control Effectiveness Score</p>
                    <CreateNewItemButton text='Add Control Effectiveness' onClick={() => setShowModal(true)} />
                </div>
                {/* <SearchField placeholder={'Search responses'} searchTerm={searchTerm} onChange={setSearchTerm} /> */}
                <ControlEffectivenessTable items={controls} />
            </section>
        </div>
    );
}

export default ControlEffectiveness;