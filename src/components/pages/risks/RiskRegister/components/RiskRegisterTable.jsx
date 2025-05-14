import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OptionsDropdown from "../../../../partials/dropdowns/OptionsDropdown/OptionsDropdown";
import Chip from "../../components/Chip";
import { useDeleteRisk } from "../../../../../queries/risks/risk-queries";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";
import { useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";

export default function RiskRegisterTable({ risks }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [riskToDelete, setRiskToDelete] = useState(null);
    const navigate = useNavigate();
    const dispatchMessage = useDispatchMessage();
    const queryClient = useQueryClient();
    
    // Debug the first risk item to see its structure
    console.log('First risk item structure:', risks && risks.length > 0 ? risks[0] : 'No risks available');
    
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
        return [
            {text: 'View details', type: 'link', link: `/risks/${item['risk_id']}`},
            {text: 'Edit risk', type: 'link', link: `/risks/${item['risk_id']}/update?section=identification`},
            {
                text: 'Delete Risk',
                type: 'action',
                action: () => handleDeleteRisk(item['risk_id'])
            }
        ];
    }

    // Function to map likelihood scores to descriptive text
    function getLikelihoodText(score) {
        if (!score) return '-';
        const likelihoodMap = {
            1: 'Very Low',
            2: 'Low',
            3: 'Medium',
            4: 'High',
            5: 'Very High'
        };
        return likelihoodMap[score] || score;
    }

    // Function to determine risk priority level based on risk rating
    function getRiskPriorityLevel(rating) {
        if (!rating) return '-';
        
        if (rating >= 15) return 'Critical';
        if (rating >= 10) return 'High';
        if (rating >= 5) return 'Medium';
        return 'Low';
    }

    // Function to get residual risk rating from different possible field names
    function getResidualRiskRating(item) {
        if (item.residual_risk_rating !== undefined && item.residual_risk_rating !== null) {
            return item.residual_risk_rating;
        }
        if (item.residualRiskRating !== undefined && item.residualRiskRating !== null) {
            return item.residualRiskRating;
        }
        if (item.residual_risk_score !== undefined && item.residual_risk_score !== null) {
            return item.residual_risk_score;
        }
        // Calculate it if we have both residual likelihood and impact scores
        if (item.residual_risk_likelihood_score !== undefined && 
            item.residual_risk_impact_score !== undefined && 
            item.residual_risk_likelihood_score !== null && 
            item.residual_risk_impact_score !== null) {
            return item.residual_risk_likelihood_score * item.residual_risk_impact_score;
        }
        return '-';
    }
    
    return (
        <>
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
            <div className='w-full'>
                <div className='rounded-lg text-[#3B3B3B] text-sm'>
                    <header className='px-4 border-b border-b-[#B7B7B7] flex gap-2'>
                        <span className='py-4 flex-[0.8_0] text-center'>Risk ID</span>
                        <span className='py-4 flex-[3.5_0]'>Title</span>
                        <span className='py-4 flex-[1.2_0] text-center'>Category</span>
                        <span className='py-4 flex-[0.8_0] text-center'>Rating</span>
                        <span className='py-4 flex-[1.2_0] text-center'>Priority Level</span>
                        <span className='py-4 flex-[1.0_0] text-center'>Status</span>
                        <span className='py-4 flex-[1.5_0] text-center'>Owner</span>
                        <span className='py-4 flex-[0.5_0]'></span>
                    </header>
                    <ul className='flex flex-col'>
                        {
                            risks.map((item, i) => (
                                <li key={i} className='px-4 flex items-center gap-2 border-b border-gray-100 hover:bg-gray-50'>
                                    <span className='py-3 flex-[0.8_0] text-center'>
                                        <Chip text={item.risk_id} color={'#DD127A'} type="risk_id" />
                                    </span>
                                    <span className='py-3 flex-[3.5_0] truncate' title={item.Title}>{item.Title || '-'}</span>
                                    <span className='py-3 flex-[1.2_0] text-center'>{item.category || '-'}</span>
                                    <span className='py-3 flex-[0.8_0] text-center'>
                                        <Chip text={item.risk_rating} color={'#A97B03'} type="rating" />
                                    </span>
                                    <span className='py-3 flex-[1.2_0] text-center'>
                                        <Chip 
                                            text={getRiskPriorityLevel(item.risk_rating)} 
                                            color={item.risk_rating >= 15 ? '#FF0000' : 
                                                  item.risk_rating >= 10 ? '#FFA500' : 
                                                  item.risk_rating >= 5 ? '#FFFF00' : '#00FF00'} 
                                            type="priority" 
                                        />
                                    </span>
                                    <span className='py-3 flex-[1.0_0] text-center'>
                                        <Chip text={item.status} color={'#1EC04E'} type="status" />
                                    </span>
                                    <span className='py-3 flex-[1.5_0] text-center'>{item.Owner || '-'}</span>
                                    <span className='py-3 flex-[0.5_0]'>
                                        <OptionsDropdown options={createItemOptions(item)} />
                                    </span>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
        </>
    );
} 