import styles from './RiskBoundarySetup.module.css';

import { useState } from 'react';
import { CreateNewItemButton, InfoButton } from '../components/Buttons';
import BoundaryLevelsTable from './components/BoundaryLevelsTable';
import RiskEvaluationHeatMap, { RiskHeatmapContext } from '../../../partials/forms/risk-register/components/RiskEvaluationHeatMap';
import Modal from '../components/Modal';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { riskBoundariesOptions } from '../../../../queries/risks/risk-boundaries';
import BackButton from '../../components/BackButton';

function RiskBoundarySetup() {
    const [showModal, setShowModal] = useState(false);

    // queries
    const {isLoading, error, data: boundaries} = useQuery(riskBoundariesOptions());

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    function checkOverlap(lowerBound, higherBound, id = null) {
        // ensure new range does not overlap with any existing range
        const isOverlapping = boundaries.some((boundary) => {
            if (boundary.id === id) return false;
            if (
                (lowerBound >= boundary.lower_bound && lowerBound <= boundary.higher_bound) ||
                (higherBound >= boundary.lower_bound && higherBound <= boundary.higher_bound)
            ) return true;
        });
        return isOverlapping;
    }

    return (
        <div className='flex flex-col gap-6'>
            {
                showModal &&
                createPortal(
                    <Modal
                        type={'riskBoundary'}
                        context={showModal.context}
                        onRemove={() => setShowModal(false)}
                    />,
                    document.body
                )
            }
            <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8'>
                <header className='flex gap-3'>
                    <BackButton />
                    <h3 className='font-semibold text-xl'>Risk Boundary Setup</h3>
                </header>
                <section className="flex flex-col gap-8">
                    <div className='flex flex-col gap-3'>
                        <div className=''>
                            <CreateNewItemButton text='Create New Boundary' classes='float-end' onClick={() => setShowModal({context: {mode: 'add', checkOverlap}})} />
                            <div>
                                <p className='flex gap-3 font-medium'>
                                    Risk Boundary Levels
                                    <InfoButton />
                                </p>
                                <p className='italic text-[#565656]'>Description of the function of indicators</p>
                            </div>
                        </div>
                        <BoundaryLevelsTable items={boundaries} checkOverlap={checkOverlap} />
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div>
                        <RiskHeatmapContext.Provider value={{levels: boundaries, size: 4}}>
                            <RiskEvaluationHeatMap selected={[]} title='Preview' />
                        </RiskHeatmapContext.Provider>
                    </div>
                </section>
            </div>
            <BackButton type='large' />
        </div>
    );
}

export default RiskBoundarySetup;