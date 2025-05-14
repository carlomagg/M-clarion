import styles from './RiskBoundarySetup.module.css';

import { useState, useEffect } from 'react';
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
    const [normalizedBoundaries, setNormalizedBoundaries] = useState([]);

    // queries
    const {isLoading, error, data: boundaries = []} = useQuery(riskBoundariesOptions());

    // Normalize boundary data
    useEffect(() => {
        if (boundaries && boundaries.length > 0) {
            console.log('Normalizing boundary data:', boundaries);
            
            const normalized = boundaries.map(boundary => ({
                id: boundary.id,
                description: boundary.description || '',
                lower_bound: boundary.lower_bound ?? boundary.lowerBound ?? boundary.lower ?? 0,
                higher_bound: boundary.higher_bound ?? boundary.higherBound ?? boundary.higher ?? 0,
                color: boundary.color ?? boundary.colour ?? 'black',
                other_applications: boundary.other_applications ?? boundary.otherApplications ?? 'partial'
            }));
            
            console.log('Normalized boundaries:', normalized);
            setNormalizedBoundaries(normalized);
        } else {
            setNormalizedBoundaries([]);
        }
    }, [boundaries]);

    if (isLoading) return <div>Loading risk boundaries...</div>
    if (error) return <div>Error loading risk boundaries: {error.message}</div>

    function checkOverlap(lowerBound, higherBound, id = null) {
        // ensure new range does not overlap with any existing range
        if (!normalizedBoundaries || normalizedBoundaries.length === 0) return false;
        
        const isOverlapping = normalizedBoundaries.some((boundary) => {
            if (boundary.id === id) return false;
            if (
                (lowerBound >= boundary.lower_bound && lowerBound <= boundary.higher_bound) ||
                (higherBound >= boundary.lower_bound && higherBound <= boundary.higher_bound)
            ) return true;
            return false;
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
                        <BoundaryLevelsTable items={normalizedBoundaries} checkOverlap={checkOverlap} />
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div>
                        <RiskHeatmapContext.Provider value={{levels: normalizedBoundaries, size: 4}}>
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