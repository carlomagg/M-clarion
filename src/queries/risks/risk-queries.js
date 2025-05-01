import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

// query functions
async function fetchRiskLog() {
    const response = await axios.get(`risk/risk-log/`);
    return response.data;
}

async function fetchRiskIdentification({queryKey}) {
    const riskId = queryKey[1];
    console.log('Fetching risk identification with ID:', riskId);
    console.log('Using URL:', `risk/risks/${riskId}/view/`);
    
    try {
        const response = await axios.get(`risk/risks/${riskId}/view/`);
        console.log('Risk identification data received:', response.data);
        return response.data['Risk_details'];
    } catch (error) {
        console.error('Error fetching risk identification:', error);
        throw error;
    }
}

async function fetchRiskAnalysis({queryKey}) {
    const response = await axios.get(`risk/risk/${queryKey[1]}/analysis-view/`);
    return response.data['risk_analysis'];
}

async function fetchRiskTreatmentPlan({queryKey}) {
    const url = `risk/risk/${queryKey[1]}/treatment-view/`;
    console.log('Treatment plan URL:', url, 'Base URL:', axios.defaults.baseURL);
    try {
        const response = await axios.get(url);
        return response.data['control_details'];
    } catch (error) {
        console.error('Error fetching treatment plan:', error);
        if (error.response?.status === 404) {
            // Return empty data structure for 404s
            return {};
        }
        throw error;
    }
}

async function fetchTargetRiskRating({queryKey}) {
    const url = `risk/risk/${queryKey[1]}/target_and_status/`;
    console.log('Target risk URL:', url, 'Base URL:', axios.defaults.baseURL);
    try {
        const response = await axios.get(url);
        // Return the target risk rating or a default value if it doesn't exist
        return response.data['target_risk_rating'] || 0;
    } catch (error) {
        // For 404 errors or other API errors, return a default value
        console.error('Error fetching target risk rating:', error);
        return 0; // Default value when fetching fails
    }
}

// New function to fetch target risk rating by category ID
async function fetchTargetRiskRatingByCategory({queryKey}) {
    const categoryId = queryKey[1];
    if (!categoryId) return 0;
    
    // Try different possible API endpoints to get the target risk rating for this category
    try {
        // First try the direct risk target endpoint if it exists
        console.log('Trying direct risk category target endpoint');
        try {
            const directUrl = `risk/risk-category/${categoryId}/target-rating/`;
            console.log('Direct target risk URL:', directUrl);
            const directResponse = await axios.get(directUrl);
            console.log('Direct target risk response:', directResponse.data);
            
            if (directResponse.data && directResponse.data.target_risk_rating !== undefined) {
                console.log('Found target_risk_rating in direct response:', directResponse.data.target_risk_rating);
                return directResponse.data.target_risk_rating;
            }
        } catch (directError) {
            console.log('Direct endpoint not available, falling back to risk appetite endpoint');
        }
        
        // Fall back to the risk appetite endpoint
        const url = `risk/risk-appetites/by-category/${categoryId}/`;
        console.log('Target risk by category URL:', url);
        const response = await axios.get(url);
        console.log('Target risk by category response:', response.data);
        
        // Handle different possible response formats
        if (response.data) {
            // If the response has a data property that contains the risk appetite
            if (response.data.data) {
                const acceptable_level = response.data.data.acceptable_level;
                console.log('Found acceptable_level in data.data:', acceptable_level);
                
                // Return the acceptable level even if it's 0 (valid value)
                if (acceptable_level !== undefined && acceptable_level !== null) {
                    return acceptable_level;
                }
            } 
            
            // Alternative format: direct access to the response data
            if (response.data.acceptable_level !== undefined) {
                console.log('Found acceptable_level directly in data:', response.data.acceptable_level);
                return response.data.acceptable_level;
            }
            
            // If we have a target_risk_rating field
            if (response.data.target_risk_rating !== undefined) {
                console.log('Found target_risk_rating in data:', response.data.target_risk_rating);
                return response.data.target_risk_rating;
            }
        }
        
        console.log('No valid target risk rating found in response, using default value');
        return 0; // Default value if we couldn't find the value in any expected format
    } catch (error) {
        console.error('Error fetching target risk rating by category:', error);
        return 0; // Default value when fetching fails
    }
}

async function fetchRiskApprovers({queryKey}) {
    const response = await axios.get(`risk/risk/${queryKey[1]}/view-who-to-approve/`);
    return response.data['approvers'];
}

// Add this new function to fetch a risk's approval history
async function fetchRiskApprovalHistory({queryKey}) {
    const response = await axios.get(`risk/risk/${queryKey[1]}/approval-history/`);
    return response.data;
}

// Add this new function to remove an approver from a risk
async function removeRiskApprover(riskId, userId) {
    const response = await axios.delete(`risk/risk/${riskId}/user/${userId}/remove-who-to-approve/`);
    return response.data;
}

async function fetchRiskFollowUps({queryKey}) {
    try {
        console.log('Fetching risk follow-ups for risk ID:', queryKey[1]);
        const response = await axios.get(`risk/risks/${queryKey[1]}/rf-trackers/view-all/`);
        console.log('Follow-ups API response:', response.data);
        const followUps = response.data['Risk Followup Trackers'] || [];
        console.log('Extracted follow-ups:', followUps);
        return followUps;
    } catch (error) {
        console.error('Error fetching risk follow-ups:', error);
        throw error;
    }
}

// risk events
async function fetchRiskEvents({queryKey}) {
    const response = await axios.get(`risk/risk/${queryKey[1]}/view-all-events/`);
    return response.data;
}

async function fetchRiskEvent({queryKey}) {
    const response = await axios.get(`risk/risk_event/${queryKey[3]}/view/`);
    return response.data;
}

async function fetchIdentificationTools() {
    const response = await axios.get('risk/identification-tools/view-all/');
    return response.data['Identification Tools'];
}

async function fetchLinkedResources() {
    const response = await axios.get('risk/linked-resources/view-all/');
    return response.data['Linked resources'];
}

async function fetchRiskTriggers() {
    const response = await axios.get('risk/risk-triggers/view-all/');
    return response.data['Risk Triggers'];
}

async function fetchRiskCategories() {
    const response = await axios.get('risk/risk-categories/view-all/');
    return response.data['risk_categories'];
}

async function fetchRiskClasses() {
    const response = await axios.get('risk/risk-classes/view-all/');
    return response.data['risk_classes'];
}

async function fetchRiskAreas() {
    const response = await axios.get('risk/risk-areas/view-all/');
    return response.data['Risk Areas'];
}

async function fetchLikelihoodScores() {
    const response = await axios.get('risk/risk-likelihood-matrix/view-all/');
    return response.data['data'];
}

async function fetchImpactScores() {
    const response = await axios.get('risk/impact-scores-parameters/view-all/');
    return response.data;
}

async function fetchImpactFocuses() {
    const response = await axios.get('risk/impact-focuses/view-all/');
    return response.data['impact focuses'];
}

async function fetchRiskResponses() {
    const response = await axios.get('risk/risk-responses/view-all/');
    return response.data['Risk Responses'];
}

async function fetchControlFamilyTypes() {
    const response = await axios.get('risk/rcf-types/view-all/');
    return response.data['Control Type'];
}

async function fetchRiskRegisterStatuses() {
    const response = await axios.get('risk/risk-register-status/view-all/');
    return response.data;
}

async function fetchRiskApprovalsStatuses() {
    const response = await axios.get('risk/risk-approval-status/view-all/');
    return response.data;
}

// mutation functions
async function addRisk({data}) {
    const response = await axios.post('risk/risks/', data);
    return response.data;
}

async function saveNewRiskIdentificationToDraft({data}) {
    const response = await axios.put('risk/risk/draft/', data);
    return response.data;
}

async function saveExistingRiskIdentificationToDraft(id, {data}) {
    const response = await axios.put(`risk/risk/${id}/draft/`, data);
    return response.data;
}

async function updateRiskIdentification(id, {data}) {
    const response = await axios.put(`risk/risks/${id}/update/`, data);
    return response.data;
}

async function deleteRisk(id) {
    const response = await axios.delete(`risk/risks/${id}/delete/`);
    return response.data;
}

async function updateRiskAnalysis(id, {data}) {
    const response = await axios.put(`risk/risk/${id}/analysis-update/`, data);
    return response.data;
}

async function saveRiskAnalysisToDraft(id, {data}) {
    const response = await axios.put(`risk/risk/${id}/analysis-draft/`, data);
    return response.data;
}

async function updateTreatmentPlan(id, {data}) {
    const response = await axios.put(`risk/risk/${id}/treatment-update/`, data);
    return response.data;
}

async function saveTreatmentPlanToDraft(id, {data}) {
    const response = await axios.put(`risk/risk/${id}/treatment-draft/`, data);
    return response.data;
}

async function updateWhoToApprove(id, {data}) {
    const response = await axios.post(`risk/risk/${id}/add-who-to-approve/`, data);
    return response.data;
}

async function updateRiskApprovalStatus(id, {data}) {
    const response = await axios.put(`risk/risk/${id}/approval/`, data);
    return response.data;
}

// risk follow up
async function addRiskFollowUp(id, {data}) {
    const response = await axios.post(`risk/risks/${id}/rf-trackers/`, data);
    return response.data;
}

async function updateRiskFollowUp({id, data}) {
    const response = await axios.put(`risk/rf-trackers/${id}/update/`, data);
    return response.data;
}

async function deleteRiskFollowUp({id}) {
    const response = await axios.delete(`risk/rf-trackers/${id}/delete/`);
    return response.data;
}

async function addFollowUpResponse({data}) {
    const response = await axios.post(`risk/risk-followup/update/`, data);
    return response.data;
}

// risk event
async function addRiskEvent(id, {data}) {
    const response = await axios.post(`risk/risk/${id}/add-risk-event/`, data);
    return response.data;
}

async function updateRiskEvent({id, data}) {
    const response = await axios.put(`risk/risk_event/${id}/update/`, data);
    return response.data;
}

async function deleteRiskEvent({id}) {
    const response = await axios.delete(`risk/risk_event/${id}/delete/`);
    return response.data;
}

async function addRootCause({eventId, data}) {
    const response = await axios.post(`risk/risk_event/${eventId}/root_cause/`, data);
    return response.data;
}

async function updateRootCause({id, data}) {
    const response = await axios.put(`risk/root_cause/${id}/update/`, data);
    return response.data;
}

async function deleteRootCause({id}) {
    const response = await axios.delete(`risk/root_cause/${id}/delete/`);
    return response.data;
}

async function addPreMitigation({eventId, data}) {
    const response = await axios.post(`risk/risk_event/${eventId}/pre_mitigation/`, data);
    return response.data;
}

async function updatePreMitigation({id, data}) {
    const response = await axios.put(`risk/pre_mitigation/${id}/update/`, data);
    return response.data;
}

async function deletePreMitigation({id}) {
    const response = await axios.delete(`risk/pre_mitigation/${id}/delete/`);
    return response.data;
}

async function addPostMitigation({eventId, data}) {
    const response = await axios.post(`risk/risk_event/${eventId}/post_mitigation/`, data);
    return response.data;
}

async function updatePostMitigation({id, data}) {
    const response = await axios.put(`risk/post_mitigation/${id}/update/`, data);
    return response.data;
}

async function deletePostMitigation({id}) {
    const response = await axios.delete(`risk/post_mitigation/${id}/delete/`);
    return response.data;
}

async function addConsequence({eventId, data}) {
    const response = await axios.post(`risk/risk_event/${eventId}/consequence/`, data);
    return response.data;
}

async function updateConsequence({id, data}) {
    const response = await axios.put(`risk/consequence/${id}/update/`, data);
    return response.data;
}

async function deleteConsequence({id}) {
    const response = await axios.delete(`risk/consequence/${id}/delete/`);
    return response.data;
}


//query hooks
export function useRiskName(id) {
    return useQuery(riskLogOptions({select: (risks) => risks.find(r => r.risk_id == id)?.Title}));
}

// query options
export function riskLogOptions(options) {
    return queryOptions({
        queryKey: ['risks'],
        queryFn: fetchRiskLog,
        ...options
    })
}

export function riskIdentificationOptions(riskId, options) {
    return queryOptions({
        queryKey: ['risks', riskId, 'identification'],
        queryFn: fetchRiskIdentification,
        ...options
    })
}

export function riskAnalysisOptions(riskId, options) {
    return queryOptions({
        queryKey: ['risks', riskId, 'analysis'],
        queryFn: fetchRiskAnalysis,
        ...options
    })
}

export function riskTreatmentPlanOptions(riskId, options) {
    return queryOptions({
        queryKey: ['risks', riskId, 'treatment-plans'],
        queryFn: fetchRiskTreatmentPlan,
        ...options
    })
}

export function targetRiskRatingOptions(riskId, options) {
    return queryOptions({
        queryKey: ['risks', riskId, 'target-risk-rating'],
        queryFn: fetchTargetRiskRating,
        ...options
    })
}

// New function for target risk rating by category
export function targetRiskRatingByCategoryOptions(categoryId, options) {
    return queryOptions({
        queryKey: ['risks', categoryId, 'category-target-rating'],
        queryFn: fetchTargetRiskRatingByCategory,
        ...options
    })
}

export function riskApproversOptions(riskId, options) {
    return queryOptions({
        queryKey: ['risks', riskId, 'approvers'],
        queryFn: fetchRiskApprovers,
        ...options
    })
}

export function riskFollowUpsOptions(riskId, options) {
    return queryOptions({
        queryKey: ['risks', riskId, 'follow-ups'],
        queryFn: fetchRiskFollowUps,
        staleTime: 0,
        ...options
    })
}

// risk events
export function riskEventsOptions(riskId, options) {
    return queryOptions({
        queryKey: ['risks', riskId, 'events'],
        queryFn: fetchRiskEvents,
        ...options
    })
}

export function riskEventOptions(riskId, eventId, options) {
    return queryOptions({
        queryKey: ['risks', riskId, 'events', eventId],
        queryFn: fetchRiskEvent,
        ...options
    })
}

export function identificationToolsOptions(options) {
    return queryOptions({
        queryKey: ['identification-tools'],
        queryFn: fetchIdentificationTools,
        ...options
    })
}

export function linkedResourcesOptions(options) {
    return queryOptions({
        queryKey: ['linked-resources'],
        queryFn: fetchLinkedResources,
        ...options
    })
}

export function riskTriggersOptions(options) {
    return queryOptions({
        queryKey: ['risk-triggers'],
        queryFn: fetchRiskTriggers,
        ...options
    })
}

export function riskAreasOptions(options) {
    return queryOptions({
        queryKey: ['risk-areas'],
        queryFn: fetchRiskAreas,
        ...options
    })
}

export function likelihoodScoresOptions(options) {
    return queryOptions({
        queryKey: ['likelihood-scores'],
        queryFn: fetchLikelihoodScores,
        ...options
    })
}

export function impactScoresOptions(options) {
    return queryOptions({
        queryKey: ['impact-scores'],
        queryFn: fetchImpactScores,
        ...options
    })
}

export function impactFocusesOptions(options) {
    return queryOptions({
        queryKey: ['impact-focuses'],
        queryFn: fetchImpactFocuses,
        ...options
    })
}

export function riskRegisterStatusesOptions(options) {
    return queryOptions({
        queryKey: ['risk-register-statuses'],
        queryFn: fetchRiskRegisterStatuses,
        ...options
    })
}

export function riskApprovalStatusesOptions(options) {
    return queryOptions({
        queryKey: ['risk-approval-statuses'],
        queryFn: fetchRiskApprovalsStatuses,
        ...options
    })
}

export function risksPendingApprovalOptions(options) {
    return queryOptions({
        queryKey: ['risks', 'pending-approval'],
        queryFn: fetchRiskLog,
        select: (data) => {
            return data || [];
        },
        ...options
    })
}

// mutation hooks
export function useAddRisk(callbacks) {
    return useMutation({
        mutationFn: addRisk,
        ...callbacks
    });
}

export function useUpdateRiskIdentification(riskId, callbacks) {
    return useMutation({
        mutationFn: (variables) => updateRiskIdentification(riskId, variables),
        ...callbacks
    });
}

export function useDeleteRisk(callbacks) {
    return useMutation({
        mutationFn: (id) => deleteRisk(id),
        ...callbacks
    });
}

export function useSaveNewRiskIdentificationToDraft(callbacks) {
    return useMutation({
        mutationFn: saveNewRiskIdentificationToDraft,
        ...callbacks
    });
}

export function useSaveExistingRiskIdentificationToDraft(callbacks) {
    return useMutation({
        mutationFn: saveExistingRiskIdentificationToDraft,
        ...callbacks
    });
}

export function useUpdateRiskAnalysis(riskId, callbacks) {
    return useMutation({
        mutationFn: (vars) => updateRiskAnalysis(riskId, vars),
        ...callbacks
    });
}

export function useSaveRiskAnalysisToDraft(riskId, callbacks) {
    return useMutation({
        mutationFn: (vars) => saveRiskAnalysisToDraft(riskId, vars),
        ...callbacks
    });
}

export function useUpdateTreatmentPlan(riskId, callbacks) {
    return useMutation({
        mutationFn: (vars) => updateTreatmentPlan(riskId, vars),
        ...callbacks
    });
}

export function useSaveTreatmentPlanToDraft(riskId, callbacks) {
    return useMutation({
        mutationFn: (vars) => saveTreatmentPlanToDraft(riskId, vars),
        ...callbacks
    });
}

export function useUpdateWhoToApprove(riskId, callbacks) {
    return useMutation({
        mutationFn: (vars) => updateWhoToApprove(riskId, vars),
        ...callbacks
    });
}

export function useUpdateRiskApprovalStatus(riskId, callbacks) {
    return useMutation({
        mutationFn: (vars) => updateRiskApprovalStatus(riskId, vars),
        ...callbacks
    });
}

// Risk Follow Up
export function useAddRiskFollowUp(riskId, callbacks) {
    return useMutation({
        mutationFn: (vars) => addRiskFollowUp(riskId, vars),
        ...callbacks
    });
}

export function useUpdateRiskFollowUp(callbacks) {
    return useMutation({
        mutationFn: updateRiskFollowUp,
        ...callbacks
    });
}

export function useDeleteRiskFollowUp(callbacks) {
    return useMutation({
        mutationFn: deleteRiskFollowUp,
        ...callbacks
    });
}

export function useAddFollowUpResponse(callbacks) {
    return useMutation({
        mutationFn: addFollowUpResponse,
        ...callbacks
    });
}

// Risk Event
export function useAddRiskEvent(riskId, callbacks) {
    return useMutation({
        mutationFn: (vars) => addRiskEvent(riskId, vars),
        ...callbacks
    });
}

export function useUpdateRiskEvent(callbacks) {
    return useMutation({
        mutationFn: updateRiskEvent,
        ...callbacks
    });
}

export function useDeleteRiskEvent(callbacks) {
    return useMutation({
        mutationFn: deleteRiskEvent,
        ...callbacks
    });
}

export function useAddRootCause(callbacks) {
    return useMutation({
        mutationFn: addRootCause,
        ...callbacks
    });
}

export function useUpdateRootCause(callbacks) {
    return useMutation({
        mutationFn: updateRootCause,
        ...callbacks
    });
}

export function useDeleteRootCause(callbacks) {
    return useMutation({
        mutationFn: deleteRootCause,
        ...callbacks
    });
}

export function useAddPreMitigation(callbacks) {
    return useMutation({
        mutationFn: addPreMitigation,
        ...callbacks
    });
}

export function useUpdatePreMitigation(callbacks) {
    return useMutation({
        mutationFn: updatePreMitigation,
        ...callbacks
    });
}

export function useDeletePreMitigation(callbacks) {
    return useMutation({
        mutationFn: deletePreMitigation,
        ...callbacks
    });
}

export function useAddPostMitigation(callbacks) {
    return useMutation({
        mutationFn: addPostMitigation,
        ...callbacks
    });
}

export function useUpdatePostMitigation(callbacks) {
    return useMutation({
        mutationFn: updatePostMitigation,
        ...callbacks
    });
}

export function useDeletePostMitigation(callbacks) {
    return useMutation({
        mutationFn: deletePostMitigation,
        ...callbacks
    });
}

export function useAddConsequence(callbacks) {
    return useMutation({
        mutationFn: addConsequence,
        ...callbacks
    });
}

export function useUpdateConsequence(callbacks) {
    return useMutation({
        mutationFn: updateConsequence,
        ...callbacks
    });
}

export function useDeleteConsequence(callbacks) {
    return useMutation({
        mutationFn: deleteConsequence,
        ...callbacks
    });
}

// Add these new exported functions after other export functions
export function riskApprovalHistoryOptions(riskId, options) {
    return {
        queryKey: ['risk-approval-history', riskId],
        queryFn: fetchRiskApprovalHistory,
        ...options
    };
}

export function useRemoveRiskApprover(callbacks) {
    return useMutation({
        mutationFn: ({riskId, userId}) => removeRiskApprover(riskId, userId),
        ...callbacks
    });
}

