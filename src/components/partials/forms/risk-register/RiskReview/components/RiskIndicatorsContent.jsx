import { createPortal } from "react-dom";
import OptionsDropdown from "../../../../dropdowns/OptionsDropdown/OptionsDropdown";
import { CloseButton, StatusChip } from "./Elements";
import Modal from "./Modal";
import { useState } from "react";
import CurrentValuesTable from "./CurrentValueTable";

export default function RiskIndicatorsContent
({indicators}) {
    const [showModal, setShowModal] = useState(false);
    function createIndicatorOptions(indicator) {
        const options = [
            {text: 'View Details', type: 'action', action: () => setShowModal({mode: 'view', item: indicator})},
            {text: 'Update Current Value', type: 'action', action: () => setShowModal({mode: 'update-current-value', item: indicator})},
            {text: 'Delete', type: 'action', action: () => setShowModal({mode: 'view', item: indicator})},
        ];
        return options;
    }
    
    return (
        <div className='mt-3 overflow-auto p-6 flex flex-col gap-6 rounded-lg border border-[#CCC] text-[#3B3B3B] text-sm'>
            {
                showModal &&
                createPortal(
                    <Modal context={{type: 'riskIndicator', ...showModal}} onRemove={() => setShowModal(false)} />,
                    document.body
                )
            }
            <div className="w-[1024px]">
                <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                    <span className='py-4 flex-[.3_0]'>#</span>
                    <span className='py-4 flex-[2_0]'>Name</span>
                    <span className='py-4 flex-[1_0] text-center'>Category</span>
                    <span className='py-4 flex-[1_0] text-center'>Measure</span>
                    <span className='py-4 flex-[1_0] text-center'>Target</span>
                    <span className='py-4 flex-[1_0] text-center'>Threshold</span>
                    <span className='py-4 flex-[1_0] text-center'>Current Value</span>
                    <span className='py-4 flex-[1_0] text-center'>Flag</span>
                    <span className='flex-[0.3_1]'></span>
                </header>
                <ul className='flex flex-col'>
                    {
                        indicators.map((indicator, i) => {
                            return (
                                <li key={i} className='px-4 flex gap-4 items-center'>
                                    <span className='py-4 flex-[.3_0]'>{i+1}</span>
                                    <span className='py-4 flex-[2_0]'>{indicator.name}</span>
                                    <span className='py-4 flex-[1_0] text-center'>{indicator.category}</span>
                                    <span className='py-4 flex-[1_0] text-center'>{indicator.measure}</span>
                                    <span className='py-4 flex-[1_0] text-center'>{indicator.target}</span>
                                    <span className='py-4 flex-[1_0] text-center'>{indicator.threshold}</span>
                                    <span className='py-4 flex-[1_0] text-center'>{indicator.currentValues[0].current_value}</span>
                                    <span className='py-4 flex-[1_0] text-center'>
                                        <StatusChip text={indicator.flag} color={'#2F2F2F'} />
                                    </span>
                                    <span className='py-4 flex-[0.3_1] text-center'>
                                        <OptionsDropdown options={createIndicatorOptions(indicator)} />
                                    </span>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        </div>
    );
}

export function RiskIndicatorDialog({mode, item, onRemove}) {
    const [currentValues, setCurrentValues] = useState(item.currentValues);

    return (
        <div className="h-full overflow-y-auto">
            <form className="bg-white border border-[#E2E2E2] w-[800px] rounded-2xl p-6">
                <div className="flex flex-col gap-6">
                    <header className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg">Risk Indicator Tracker</h4>
                        <CloseButton onClose={onRemove} />
                    </header>
                    <div className="flex gap-6 flex-wrap">
                        <ColoredChip color={'#DD127A'} text={'ID: BQ1234'} />
                        <ColoredChip color={'#407BF0'} text={'Regulation Sensitive'} />
                        <ColoredChip color={'#407BF0'} text={'Last Updated: 32/04/2024'} />
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Indicator Name</span>
                        <p>{item.name}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Description</span>
                        <p>{item.description}</p>
                    </div>
                    <div className="flex gap-6 flex-wrap">
                        <Chip text={`Update Frequency: ${item.updateFrequency}`} />
                        <Chip text={`Report Frequency: ${item.reportFrequency}`} />
                        <Chip text={`Measure: ${item.measure}`} />
                        <Chip text={`Threshold: ${item.threshold}`} />
                        <Chip text={`Target: ${item.target}`} />
                    </div>
                    <CurrentValuesTable values={item.currentValues} type={'riskIndicator'} />
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Assigned Responsibility</span>
                        <p>{item.assignedResponsibility}</p>
                    </div>
                </div>
            </form>
        </div>
    );
}

function Chip({text}) {
    return (
        <span className="border border-[#5E5E5E] py-1 px-2 text-sm font-medium rounded-full">{text}</span>
    );
}

function ColoredChip({text, color}) {
    return (
        <span style={{color, backgroundColor: `${color}22`}} className="text-sm font-medium py-1 px-2 rounded-full">{text}</span>
    );
}