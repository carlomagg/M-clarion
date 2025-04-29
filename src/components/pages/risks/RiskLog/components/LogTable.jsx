import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/Table";
import { createPortal } from "react-dom";
import Modal from "./Modal";
import { useDeleteRisk } from "../../../../../queries/risks/risk-queries";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";
import { useQueryClient } from "@tanstack/react-query";

export default function RiskLogTable({risks}) {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [riskToDelete, setRiskToDelete] = useState(null);
    const navigate = useNavigate();
    const dispatchMessage = useDispatchMessage();
    const queryClient = useQueryClient();
    
    // Set up delete risk mutation
    const { isPending: isDeleting, mutate: deleteRisk } = useDeleteRisk({
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({queryKey: ['risks']});
            dispatchMessage('success', 'Risk deleted successfully');
        },
        onError: (error) => {
            dispatchMessage('failed', error.response?.data?.message || 'Failed to delete risk');
        }
    });
    
    function handleDeleteRisk(riskId) {
        setRiskToDelete(riskId);
        setShowDeleteConfirm(true);
    }
    
    function handleDeleteConfirm() {
        deleteRisk(riskToDelete);
        setShowDeleteConfirm(false);
        setRiskToDelete(null);
    }
    
    function createItemOptions(item) {
        const options = [
            {text: 'View details', type: 'link', link: `/risks/${item['risk_id']}`},
            {text: 'Edit risk', type: 'link', link: `/risks/${item['risk_id']}/update?section=identification`},
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
                text: 'Delete Risk',
                type: 'action',
                action: () => handleDeleteRisk(item['risk_id'])
            }
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
            {
                showDeleteConfirm &&
                createPortal(
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg max-w-md w-full">
                            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
                            <p className="mb-6">Are you sure you want to delete this risk? This action cannot be undone.</p>
                            <div className="flex justify-end gap-4">
                                <button 
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="px-4 py-2 bg-red-600 text-white rounded-md"
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }
            <Table type={'risk'} items={risks} hasSN={false} createRecordOptions={createItemOptions} />
        </>
    );
}