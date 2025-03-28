import { useEffect, useState } from "react";
import OptionsDropdown from "../../../../partials/dropdowns/OptionsDropdown/OptionsDropdown";
import { createPortal } from "react-dom";
import Modal from "../../components/Modal";
import { range } from "../../../../../utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { riskLikelihoodMatrixOptions } from "../../../../../queries/risks/risk-likelihood-matrix";

export default function LikelihoodDefinitionsTable({matrixStandard, likelihoodDefinitions, onSetLikelihoodDefinitions}) {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const newSize = Number(matrixStandard);
        const oldSize = likelihoodDefinitions.length;
        if (newSize && (oldSize !== newSize)) {
            if (newSize < oldSize) {
                onSetLikelihoodDefinitions(likelihoodDefinitions.filter(e => e.score <= newSize));
            } else {
                const oldSet = new Set(range(1, oldSize));
                const newSet = new Set(range(1, newSize));
                const diff = Array.from(newSet.difference(oldSet));

                onSetLikelihoodDefinitions([
                    ...likelihoodDefinitions,
                    ...diff.map(score => ({score, description: '', criteria: ''}))
                ]);
                
            }
        }
    }, [matrixStandard]);

    // queries
    const {isLoading, error, data: likelihoodMatrix} = useQuery(riskLikelihoodMatrixOptions());

    useEffect(() => {
        if (likelihoodMatrix) {
            onSetLikelihoodDefinitions(likelihoodMatrix);
        }
    }, [likelihoodMatrix]);

    function createRecordOptions(record) {
        const options = [
            {text: 'View', type: 'action', action: () => setShowModal({context: {mode: 'view', id: record.id, score: record.score}})},
            {text: 'Edit', type: 'action', action: () => setShowModal({context: {mode: 'edit', id: record.id, score: record.score}})},
            {text: 'History', type: 'action', action: () => {}},
        ];
        return options;
    }

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    return (
        <div className="flex flex-col gap-3">
            {
                showModal &&
                createPortal(
                    <Modal
                        type={'likelihoodScore'}
                        context={showModal.context}
                        onRemove={() => setShowModal(false)} />,
                    document.body
                )
            }
            <h4 className='font-medium'>Likelihood Definition</h4>
            <div className='overflow-x-auto w-full'>
                <div className=' rounded-lg text-[#3B3B3B] text-sm'>
                    <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                        <span className='py-4 flex-[.5_0] text-center'>Score</span>
                        <span className='py-4 flex-[1.5_0]'>Description</span>
                        <span className='py-4 flex-[3_0]'>Criteria</span>
                        <span className='py-4 flex-[.5_0]'></span>
                    </header>
                    <ul className='flex flex-col'>
                        {
                            likelihoodDefinitions.map((item, i) => {
                                return (
                                    <li key={i}>
                                        <TableRecord record={item} options={createRecordOptions(item)} />
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>
    );
}

function TableRecord({record, options}) {
    return (
        <div className='px-4 flex items-center gap-4'>
            <span className='py-2 flex-[.5_0] text-center'>{record['score']}</span>
            <span className='py-2 flex-[1.5_0]'>{record['description']}</span>
            <span className={`py-2 flex-[3_0] ${!record['criteria'] ? 'italic' : ''}`}>{record['criteria'] || 'Click to Edit'}</span>
            <span className='py-2 flex-[.5_0]'>
                <OptionsDropdown options={options} />
            </span>
        </div>
    );
}