import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/Table";
import { createPortal } from "react-dom";
import Modal from "./Modal";

export default function RiskLogTable({risks}) {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    
    function createItemOptions(item) {
        const options = [
            {text: 'View details', type: 'link', link: `/risks/${item['risk_id']}`},
            { 
                text: 'Follow up',
                type: 'action',
                action: () => setShowModal({ type: 'followUp', context: { riskId: item['risk_id'], mode: 'add', setContext: (context) => setShowModal({ type: 'followUp', context }) } }) 
            },
            {
                text: 'Risk Indicators',
                type: 'action',
                action: () => setShowModal({ type: 'riskIndicator', context: { riskId: item['risk_id'], mode: 'add', setContext: (context) => setShowModal({ type: 'followUp', context }) } })
            },
            {
                text: 'Assign Process',
                type: 'action',
                action: () => {
                    // Navigate to the process selector with metadata about risk
                    navigate('/process-management/assign', { 
                        state: { 
                            fromRiskLog: true,
                            riskId: item['risk_id'],
                            riskTitle: item['Title'] || ''
                        } 
                    });
                }
            },
        ];

        return options;
    }
    
    return (
        <>
            {
                showModal &&
                createPortal(
                    <Modal type={showModal.type} context={showModal.context} onRemove={() => setShowModal(false)} />,
                    document.body
                )
            }
            <Table type={'risk'} items={risks} hasSN={false} createRecordOptions={createItemOptions} />
        </>
    );
}