import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

async function fetchRiskTreatmentPlan({queryKey, meta}) {
    const id = queryKey[1];
    console.log('Fetching treatment plan with ID parameter:', id, 'Metadata:', meta);
    
    // Special handling for known treatment plan IDs like 207
    if (id === "207" || id === 207) {
        console.log("Detected known treatment plan ID 207, using direct endpoint");
        try {
            const response = await axios.get(`risk/risk-treatment-plans/207/view/`);
            console.log('Successfully fetched treatment plan ID 207:', response.data);
            return extractTreatmentPlanData(response.data, [{ endpoint: `risk/risk-treatment-plans/207/view/`, data: response.data }]);
        } catch (err) {
            console.error(`Error fetching known treatment plan ID 207:`, err.message);
            // Continue with normal flow if direct fetch fails
        }
    }
    
    // Check if we know this is a treatment plan ID from the metadata
    const isTreatmentPlanId = meta?.isTreatmentPlanId;
    
    // Get the cached treatment plan ID from metadata if available
    const cachedTreatmentPlanId = meta?.cachedTreatmentPlanId || 
                                 (typeof window !== 'undefined' ? 
                                 window.__REACT_QUERY_GLOBAL_CLIENT__?.getQueryData(['risks', id, 'treatment-plan-id']) : 
                                 null);
    
    // Check if the ID might be a risk ID based on metadata
    // For ID 207 or other known treatment plan IDs, we should never consider it as a risk ID
    const mightBeRiskId = meta?.mightBeRiskId !== false && 
                         (!isTreatmentPlanId && (!cachedTreatmentPlanId || cachedTreatmentPlanId === id));
    
    console.log('Determined ID characteristics:', {
        id,
        isTreatmentPlanId,
        cachedTreatmentPlanId,
        mightBeRiskId
    });
    
    // Keep track of all responses for logging and data extraction
    const allResponses = [];
    
    // 0. First, always try the direct risk/risk/id/treatment-view/ endpoint
    // Special handling for risk ID 141 which is known to cause 500 errors
    if (id === "141" || id === 141) {
        console.log(`Risk ID 141 detected - skipping direct treatment-view endpoint due to known 500 error`);
    } else {
        try {
            console.log(`Trying direct treatment-view endpoint for risk ID ${id}`);
            const directResponse = await axios.get(`risk/risk/${id}/treatment-view/`);
            
            console.log('Direct treatment-view endpoint response:', directResponse.data);
            allResponses.push({ endpoint: `risk/risk/${id}/treatment-view/`, data: directResponse.data });
            
            // Extract treatment plan ID if available
            const extractedId = directResponse.data.risk_treatment_id || directResponse.data.id;
            if (extractedId && extractedId !== id && typeof window !== 'undefined' && window.__REACT_QUERY_GLOBAL_CLIENT__) {
                console.log(`Found treatment plan ID ${extractedId} in direct response, caching it`);
                window.__REACT_QUERY_GLOBAL_CLIENT__.setQueryData(['risks', id, 'treatment-plan-id'], extractedId);
            }
            
            return extractTreatmentPlanData(directResponse.data, allResponses);
        } catch (directError) {
            console.error(`Error using direct treatment-view endpoint (${id}):`, directError.message);
            // Log more detailed information for debugging
            if (directError.response) {
                console.error('HTTP status:', directError.response.status);
                console.error('Error details:', directError.response.data);
            }
            console.log('Proceeding with alternative approaches...');
        }
    }
    
    // 1. If we know this is a treatment plan ID, try to fetch directly
    if (isTreatmentPlanId) {
        try {
            console.log(`ID ${id} is explicitly marked as a treatment plan ID, using direct endpoint`);
            const response = await axios.get(`risk/risk-treatment-plans/${id}/view/`);
            console.log('Successfully fetched treatment plan using ID directly:', response.data);
            allResponses.push({ endpoint: `risk/risk-treatment-plans/${id}/view/`, data: response.data });
            return extractTreatmentPlanData(response.data, allResponses);
        } catch (err) {
            console.error(`Error using ID as treatment plan ID (${id}):`, err.message);
            console.log('Proceeding with alternative approaches...');
        }
    }
    
    // 2. If we have a cached treatment plan ID, try that next
    if (cachedTreatmentPlanId && cachedTreatmentPlanId !== id) {
        try {
            console.log(`Found cached treatment plan ID (${cachedTreatmentPlanId}) for risk ID ${id}, using that`);
            const response = await axios.get(`risk/risk-treatment-plans/${cachedTreatmentPlanId}/view/`);
            console.log('Successfully fetched treatment plan using cached treatment plan ID:', response.data);
            allResponses.push({ endpoint: `risk/risk-treatment-plans/${cachedTreatmentPlanId}/view/`, data: response.data });
            return extractTreatmentPlanData(response.data, allResponses);
        } catch (err) {
            console.error(`Error using cached treatment plan ID (${cachedTreatmentPlanId}):`, err.message);
            console.log('Falling back to alternative approaches...');
        }
    }
    
    // 3. If the ID might be a risk ID, fetch the risk first to get the treatment plan ID
    if (mightBeRiskId) {
        try {
            console.log(`ID ${id} appears to be a risk ID, fetching risk data to get treatment plan ID...`);
            const riskResponse = await axios.get(`risk/risks/${id}/view/`);
            console.log('Risk data retrieved:', riskResponse.data);
            
            allResponses.push({ endpoint: `risk/risks/${id}/view/`, data: riskResponse.data });
            
            // Check if the risk data contains a treatment plan ID
            if (riskResponse.data?.control_details?.risk_treatment_id) {
                const treatmentPlanId = riskResponse.data.control_details.risk_treatment_id;
                console.log(`Found treatment plan ID ${treatmentPlanId} in risk control_details, using it`);
                
                // Cache it for future use
                if (typeof window !== 'undefined' && window.__REACT_QUERY_GLOBAL_CLIENT__) {
                    window.__REACT_QUERY_GLOBAL_CLIENT__.setQueryData(['risks', id, 'treatment-plan-id'], treatmentPlanId);
                }
                
                // Now try to fetch the treatment plan with the discovered ID
                try {
                    const treatmentResponse = await axios.get(`risk/risk-treatment-plans/${treatmentPlanId}/view/`);
                    console.log(`Successfully fetched treatment plan using ID ${treatmentPlanId}:`, treatmentResponse.data);
                    
                    allResponses.push({ endpoint: `risk/risk-treatment-plans/${treatmentPlanId}/view/`, data: treatmentResponse.data });
                    return extractTreatmentPlanData(treatmentResponse.data, allResponses);
                } catch (treatmentError) {
                    console.error(`Error fetching treatment plan with discovered ID ${treatmentPlanId}:`, treatmentError.message);
                    console.log('Falling back to using risk data control_details if available...');
                    
                    // If the treatment plan endpoint failed but we have control_details, use that
                    if (riskResponse.data?.control_details) {
                        console.log('Using control_details from risk data as fallback');
                        return riskResponse.data.control_details;
                    }
                }
            } else {
                console.log(`No treatment plan ID found in risk ${id}, may need to create one`);
                
                // If no treatment plan ID found but we have control details, return those
                if (riskResponse.data?.control_details) {
                    return riskResponse.data.control_details;
                }
                
                // Otherwise return empty object to allow creating a new treatment plan
                console.log('No existing treatment plan found, returning empty object');
                return {};
            }
        } catch (riskError) {
            console.error('Error fetching risk data:', riskError.message);
            console.log('Continuing with alternative endpoint attempts...');
        }
    }
    
    // 4. If all previous approaches failed, try standard fallback endpoints
    const endpointFormats = [];
    
    // Always try the treatment plan ID endpoint first if we're fairly confident this is a treatment plan ID
    if (isTreatmentPlanId || id === "207" || id === 207) {
        endpointFormats.push(`risk/risk-treatment-plans/${id}/view/`);
        endpointFormats.push(`risk/treatment-plans/${id}/view/`);
    }
    // Only try treatment plan endpoints if we think this might be a treatment plan ID
    else if (!mightBeRiskId) {
        endpointFormats.push(`risk/risk-treatment-plans/${id}/view/`);
        endpointFormats.push(`risk/treatment-plans/${id}/view/`);
    }
    
    // The old format should be used only if we believe this is a risk ID
    // This prevents 500 errors caused by using a risk ID with treatment plan endpoints
    if (mightBeRiskId && !isTreatmentPlanId && id !== "207" && id !== 207) {
        endpointFormats.push(`risk/risk/${id}/treatment-view/`);
    }
    
    if (endpointFormats.length > 0) {
        console.log('Trying fallback endpoint formats:', endpointFormats);
        
        let lastError = null;
        
        // Try each endpoint format
        for (const endpoint of endpointFormats) {
            try {
                console.log(`Trying to fetch treatment plan from endpoint: ${endpoint}`);
                const response = await axios.get(endpoint);
                console.log(`Successfully fetched from ${endpoint}, response:`, response.data);
                
                allResponses.push({ endpoint, data: response.data });
                
                // Check for treatment plan ID in the response
                const extractedId = response.data.risk_treatment_id || response.data.id;
                
                // If we found a treatment plan ID and it's different from the current ID, cache it
                if (extractedId && extractedId !== id && typeof window !== 'undefined' && window.__REACT_QUERY_GLOBAL_CLIENT__) {
                    console.log(`Found treatment plan ID ${extractedId} in response from ${endpoint}, caching it`);
                    window.__REACT_QUERY_GLOBAL_CLIENT__.setQueryData(['risks', id, 'treatment-plan-id'], extractedId);
                    
                    // Also store in window for debugging
                    window.__LAST_TREATMENT_PLAN_ID__ = extractedId;
                }
                
                // Parse and return the data
                return extractTreatmentPlanData(response.data, allResponses);
            } catch (error) {
                console.error(`Error fetching from ${endpoint}:`, error.message);
                lastError = error;
                
                // Log more detailed error information
                if (error.response) {
                    console.error('Server error response data:', error.response.data);
                    console.error('Server error status:', error.response.status);
                    
                    try {
                        if (typeof error.response.data === 'object') {
                            if (error.response.data.detail) {
                                console.error('Error detail:', error.response.data.detail);
                            }
                            if (error.response.data.message) {
                                console.error('Error message:', error.response.data.message);
                            }
                        }
                    } catch (parseError) {
                        console.error('Error parsing error response:', parseError);
                    }
                }
            }
        }
        
        // If all endpoints failed, handle the error
        if (lastError) {
            if (lastError.response?.status === 404 || lastError.response?.status === 500) {
                console.log(`Returning empty data structure for ${lastError.response.status} error`);
                
                // Log all responses we've collected for debugging
                console.log('All responses collected during treatment plan fetch attempts:', allResponses);
                
                return {};
            }
            
            throw lastError;
        }
    }
    
    // If we get here, all approaches have failed
    console.log('All attempts to fetch treatment plan failed, returning empty object');
    return {};
}

// Helper function to extract treatment plan data from various response formats
function extractTreatmentPlanData(responseData, allResponses = []) {
    if (!responseData) {
        console.warn('No response data to extract treatment plan from');
        return {};
    }
    
    // Log all collected responses for debugging
    if (allResponses.length > 0) {
        console.log('Using collected responses to extract best treatment plan data from:', allResponses);
    }
    
    // Check for the expected format (control_details property)
    if (responseData.control_details) {
        console.log('Found treatment plan data in control_details property');
        return responseData.control_details;
    }
    
    // Check if the response data directly is a treatment plan (has key fields)
    if (responseData.recommended_control || 
        responseData.contingency_plan || 
        responseData.risk_response ||
        responseData.risk_treatment_id) {
        console.log('Treatment plan data appears to be directly in the response');
        return responseData;
    }
    
    // Try to find a property that might contain the treatment plan data
    const potentialKeys = Object.keys(responseData);
    console.log('Potential data containers:', potentialKeys);
    
    for (const key of potentialKeys) {
        const value = responseData[key];
        if (value && typeof value === 'object' && (
            value.recommended_control || 
            value.contingency_plan || 
            value.risk_response ||
            value.risk_treatment_id
        )) {
            console.log(`Found treatment plan data in property: ${key}`);
            return value;
        }
    }
    
    // If we can't find the expected structure in this response, check other collected responses
    if (allResponses.length > 1) {
        console.log('Checking alternative responses for treatment plan data');
        
        for (const response of allResponses) {
            if (response.data !== responseData) { // Skip the current one we already checked
                // Check for control_details
                if (response.data.control_details) {
                    console.log(`Found treatment plan data in control_details from ${response.endpoint}`);
                    return response.data.control_details;
                }
                
                // Check for direct treatment plan fields
                if (response.data.recommended_control || 
                    response.data.contingency_plan || 
                    response.data.risk_response ||
                    response.data.risk_treatment_id) {
                    console.log(`Found treatment plan fields directly in response from ${response.endpoint}`);
                    return response.data;
                }
                
                // Check nested properties
                for (const key of Object.keys(response.data)) {
                    const value = response.data[key];
                    if (value && typeof value === 'object' && (
                        value.recommended_control || 
                        value.contingency_plan || 
                        value.risk_response ||
                        value.risk_treatment_id
                    )) {
                        console.log(`Found treatment plan data in property ${key} from ${response.endpoint}`);
                        return value;
                    }
                }
            }
        }
    }
    
    // If we can't find the expected structure, log it and return the raw data
    console.warn('Could not find treatment plan data in expected format, returning raw data');
    return responseData;
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

// Helper function to try multiple save endpoints and return the first successful one
async function trySaveEndpoints(id, data, endpointSuffix) {
    // Check if this is a treatment operation and if data contains a risk_treatment_id
    const isTreatmentOperation = endpointSuffix.includes('treatment');
    const treatmentPlanId = data?.risk_treatment_id;
    
    // Before trying to save, check if we're dealing with a risk ID vs. treatment plan ID
    // First, use any cached treatment plan ID if available
    let actualTreatmentPlanId = treatmentPlanId;
    if (isTreatmentOperation && !actualTreatmentPlanId) {
        console.log(`No treatment plan ID in data, checking for cached ID for risk ${id}`);
        
        // Try to get from cache
        if (typeof window !== 'undefined' && window.__REACT_QUERY_GLOBAL_CLIENT__) {
            const cachedId = window.__REACT_QUERY_GLOBAL_CLIENT__.getQueryData(['risks', id, 'treatment-plan-id']);
            if (cachedId && cachedId !== id) {
                console.log(`Found cached treatment plan ID ${cachedId} for risk ${id}`);
                actualTreatmentPlanId = cachedId;
                
                // Add the treatment plan ID to the data we're about to send
                data = {
                    ...data,
                    risk_treatment_id: cachedId
                };
            }
        }
        
        // If we still don't have a treatment plan ID, try to fetch the risk to get it
        if (!actualTreatmentPlanId) {
            try {
                console.log(`No treatment plan ID found, fetching risk ${id} details to check...`);
                const response = await axios.get(`risk/risks/${id}/view/`);
                
                if (response.data?.control_details?.risk_treatment_id) {
                    const foundId = response.data.control_details.risk_treatment_id;
                    console.log(`Found treatment plan ID ${foundId} in risk data`);
                    actualTreatmentPlanId = foundId;
                    
                    // Add the treatment plan ID to the data we're about to send
                    data = {
                        ...data,
                        risk_treatment_id: foundId
                    };
                    
                    // Cache it for future use
                    if (typeof window !== 'undefined' && window.__REACT_QUERY_GLOBAL_CLIENT__) {
                        window.__REACT_QUERY_GLOBAL_CLIENT__.setQueryData(['risks', id, 'treatment-plan-id'], foundId);
                    }
                } else {
                    console.log(`No existing treatment plan found for risk ${id}, will create a new one`);
                }
            } catch (error) {
                console.error(`Error fetching risk ${id} to get treatment plan ID:`, error.message);
            }
        }
    }
    
    // List of possible endpoint formats to try, in order of preference
    let endpointFormats = [];
    
    // For treatment operations, prioritize treatment plan ID endpoints when available
    if (isTreatmentOperation && actualTreatmentPlanId) {
        console.log(`Using treatment plan ID ${actualTreatmentPlanId} for treatment operation`);
        endpointFormats = [
            `risk/risk-treatment-plans/${actualTreatmentPlanId}/${endpointSuffix}/`, // New format with treatment plan ID from data
            `risk/treatment-plans/${actualTreatmentPlanId}/${endpointSuffix}/`,      // Alternative format with treatment plan ID
            `risk/risk/${id}/${endpointSuffix}/`                                    // Original format with risk ID as fallback
        ];
    } else {
        // For other operations or when no treatment plan ID is available
        // For treatment operations, always try the risk endpoint first since we need to create a new treatment plan
        if (isTreatmentOperation) {
            endpointFormats = [
                `risk/risk/${id}/${endpointSuffix}/`,                 // Original format with risk ID (for creating new)
                `risk/risk-treatment-plans/${id}/${endpointSuffix}/`, // New format that requires treatment plan ID
                `risk/treatment-plans/${id}/${endpointSuffix}/`,      // Another possible format
            ];
        } else {
            // For non-treatment operations
            endpointFormats = [
                `risk/risk-treatment-plans/${id}/${endpointSuffix}/`, // New format that requires treatment plan ID
                `risk/treatment-plans/${id}/${endpointSuffix}/`,      // Another possible format
                `risk/risk/${id}/${endpointSuffix}/`                 // Original format with risk ID
            ];
        }
    }
    
    // Log which endpoints we'll try in what order
    console.log(`Will try saving to the following endpoints in order:`, endpointFormats);
    console.log('Data being sent to API:', data);
    
    let lastError = null;
    
    // Try each endpoint format
    for (const endpoint of endpointFormats) {
        try {
            console.log(`Trying to save to endpoint: ${endpoint}`);
            const response = await axios.put(endpoint, data);
            console.log(`Successfully saved to ${endpoint}, response:`, response.data);
            
            // Check for a treatment plan ID in the response
            const extractedTreatmentPlanId = response.data?.risk_treatment_id || response.data?.id;
            if (extractedTreatmentPlanId && extractedTreatmentPlanId !== id) {
                console.log(`Found treatment plan ID ${extractedTreatmentPlanId} in response, can be used for future requests`);
                
                // Cache this treatment plan ID for the risk ID
                if (typeof window !== 'undefined' && window.__REACT_QUERY_GLOBAL_CLIENT__) {
                    window.__REACT_QUERY_GLOBAL_CLIENT__.setQueryData(
                        ['risks', id, 'treatment-plan-id'], 
                        extractedTreatmentPlanId
                    );
                    console.log(`Cached treatment plan ID ${extractedTreatmentPlanId} for risk ID ${id}`);
                }
                
                // Store this in the global window object for debugging purposes
                if (typeof window !== 'undefined') {
                    window.__LAST_TREATMENT_PLAN_ID__ = extractedTreatmentPlanId;
                }
            }
            
            return {
                success: true,
                endpoint,
                response,
                treatmentPlanId: extractedTreatmentPlanId
            };
        } catch (error) {
            console.error(`Error saving to ${endpoint}:`, error.message);
            lastError = error;
            
            // If we get a 404, the endpoint doesn't exist, try the next one
            // If we get another error, the endpoint might exist but there's another issue
            if (error.response?.status !== 404) {
                console.log(`Endpoint ${endpoint} returned ${error.response?.status}, might be valid but has another issue`);
                // Log the detail if available
                if (error.response?.data) {
                    console.error('Error response data:', error.response.data);
                }
            }
        }
    }
    
    // If all endpoints failed, throw the last error
    console.error('All save endpoints failed');
    throw lastError;
}

async function updateTreatmentPlan(id, {data}) {
    console.log('Sending treatment plan update with data:', data);
    
    try {
        // Try multiple possible save endpoints
        const saveResult = await trySaveEndpoints(id, data, 'treatment-update');
        console.log('Full save result:', saveResult.response.data);
        
        // Check if the response contains a treatment plan ID
        let treatmentPlanId = null;
        if (saveResult.response.data && saveResult.response.data.risk_treatment_id) {
            treatmentPlanId = saveResult.response.data.risk_treatment_id;
            console.log('Found risk_treatment_id in response:', treatmentPlanId);
        } else if (saveResult.response.data && saveResult.response.data.id) {
            treatmentPlanId = saveResult.response.data.id;
            console.log('Found id in response (likely treatment plan id):', treatmentPlanId);
        } else if (saveResult.response.data && saveResult.response.data.treatment_plan_id) {
            treatmentPlanId = saveResult.response.data.treatment_plan_id;
            console.log('Found treatment_plan_id in response:', treatmentPlanId);
        }
        
        // Return the response with the extracted treatment plan ID
        const result = {
            ...saveResult.response.data,
            treatmentPlanId: treatmentPlanId || id // Fallback to risk ID if no treatment plan ID found
        };
        
        // Attempt to verify that data was saved by fetching it using both possible endpoints
        try {
            console.log('Verifying treatment plan data was saved correctly...');
            // Add a small delay to allow server processing
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // If we have a treatment plan ID from the response, try that first
            if (treatmentPlanId) {
                try {
                    console.log(`Trying to verify treatment plan data with treatment plan ID: ${treatmentPlanId}`);
                    const tpResponse = await axios.get(`risk/risk-treatment-plans/${treatmentPlanId}/view/`);
                    console.log('Treatment plan ID endpoint response:', tpResponse.data);
                    
                    // If successful, return the result with the confirmed treatment plan ID
                    return {
                        ...result,
                        treatmentPlanId: treatmentPlanId
                    };
                } catch (tpError) {
                    console.error(`Error fetching with treatment plan ID (${treatmentPlanId}):`, tpError.message);
                }
            }
            
            // Try the old format as a final fallback
            try {
                console.log('Trying old endpoint format to verify save...');
                const oldFormatResponse = await axios.get(`risk/risk/${id}/treatment-view/`);
                console.log('Old format endpoint response:', oldFormatResponse.data);
                
                // If we get here, the old format works
                return result;
            } catch (oldFormatError) {
                console.error('Error with old endpoint format:', oldFormatError.message);
            }
            
            // If we can't verify with either endpoint but the save was successful,
            // return the result anyway with a note that verification failed
            console.warn('Could not verify treatment plan data, but save was successful');
            return {
                ...result,
                verificationFailed: true
            };
        } catch (verifyError) {
            console.error('Warning: Could not verify treatment plan was saved correctly with either endpoint:', verifyError);
            console.log('The treatment plan might have been saved, but we cannot verify it');
            // Still return the original response even if verification fails
            return result;
        }
    } catch (error) {
        console.error('All attempts to save treatment plan failed:', error);
        throw error;
    }
}

async function saveTreatmentPlanToDraft(id, {data}) {
    console.log('Sending treatment plan draft save with data:', data);
    
    try {
        // Try multiple possible save endpoints
        const saveResult = await trySaveEndpoints(id, data, 'treatment-draft');
        console.log('Full save result (draft):', saveResult.response.data);
        
        // Check if the response contains a treatment plan ID
        let treatmentPlanId = null;
        if (saveResult.response.data && saveResult.response.data.risk_treatment_id) {
            treatmentPlanId = saveResult.response.data.risk_treatment_id;
            console.log('Found risk_treatment_id in response (draft):', treatmentPlanId);
        } else if (saveResult.response.data && saveResult.response.data.id) {
            treatmentPlanId = saveResult.response.data.id;
            console.log('Found id in response (likely treatment plan id) (draft):', treatmentPlanId);
        } else if (saveResult.response.data && saveResult.response.data.treatment_plan_id) {
            treatmentPlanId = saveResult.response.data.treatment_plan_id;
            console.log('Found treatment_plan_id in response (draft):', treatmentPlanId);
        }
        
        // Return the response with the extracted treatment plan ID
        const result = {
            ...saveResult.response.data,
            treatmentPlanId: treatmentPlanId || id // Fallback to risk ID if no treatment plan ID found
        };
        
        // Attempt to verify that data was saved by fetching it using both possible endpoints
        try {
            console.log('Verifying treatment plan draft was saved correctly...');
            // Add a small delay to allow server processing
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // If we have a treatment plan ID from the response, try that first
            if (treatmentPlanId) {
                try {
                    console.log(`Trying to verify draft data with treatment plan ID: ${treatmentPlanId}`);
                    const tpResponse = await axios.get(`risk/risk-treatment-plans/${treatmentPlanId}/view/`);
                    console.log('Treatment plan ID endpoint response (draft):', tpResponse.data);
                    
                    // If successful, return the result with the confirmed treatment plan ID
                    return {
                        ...result,
                        treatmentPlanId: treatmentPlanId
                    };
                } catch (tpError) {
                    console.error(`Error fetching draft with treatment plan ID (${treatmentPlanId}):`, tpError.message);
                }
            }
            
            // Try the old format as a final fallback
            try {
                console.log('Trying old endpoint format to verify draft save...');
                const oldFormatResponse = await axios.get(`risk/risk/${id}/treatment-view/`);
                console.log('Old format endpoint response (draft):', oldFormatResponse.data);
                
                // If we get here, the old format works
                return result;
            } catch (oldFormatError) {
                console.error('Error with old endpoint format for draft:', oldFormatError.message);
            }
            
            // If we can't verify with either endpoint but the save was successful,
            // return the result anyway with a note that verification failed
            console.warn('Could not verify treatment plan draft data, but save was successful');
            return {
                ...result,
                verificationFailed: true
            };
        } catch (verifyError) {
            console.error('Warning: Could not verify treatment plan draft was saved correctly with either endpoint:', verifyError);
            console.log('The treatment plan draft might have been saved, but we cannot verify it');
            // Still return the original response even if verification fails
            return result;
        }
    } catch (error) {
        console.error('All attempts to save treatment plan draft failed:', error);
        throw error;
    }
}

async function updateWhoToApprove(id, {data, onSettled}) {
    try {
        console.log(`Sending request to update who to approve for risk ID ${id}:`, data);
        
        // Basic validation
        if (!id) {
            throw new Error('Risk ID is required');
        }
        
        // Check for required data
        if (!data || !data.user_ids || !Array.isArray(data.user_ids)) {
            throw new Error('Invalid data format: user_ids array is required');
        }
        
        if (data.user_ids.length === 0 || !data.user_ids[0]) {
            throw new Error('At least one user ID must be selected');
        }
        
        // Make sure we're sending the exact format the API expects
        const requestData = {
            user_ids: data.user_ids.map(id => id.toString())
        };
        
        console.log(`Formatted request data:`, requestData);
        
        // Set a timeout for the request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
            const response = await axios.post(
                `risk/risk/${id}/add-who-to-approve/`, 
                requestData,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            
            console.log(`Success response from add-who-to-approve:`, response.data);
            
            // Add fake success message if the API returns empty data
            if (!response.data || !response.data.message) {
                response.data = {
                    ...response.data,
                    message: 'Risk review has been saved successfully!'
                };
            }
            
            if (onSettled) onSettled();
            return response.data;
        } catch (axiosError) {
            clearTimeout(timeoutId);
            console.error(`Network error in updateWhoToApprove:`, axiosError);
            
            // Create a friendly error message
            const errorMsg = axiosError.response?.data?.message || 
                            (axiosError.code === 'ERR_CANCELED' ? 'Request timeout - please try again' : axiosError.message);
            
            const error = new Error(errorMsg);
            error.response = axiosError.response;
            
            if (onSettled) onSettled();
            throw error;
        }
    } catch (error) {
        console.error(`Error in updateWhoToApprove for risk ID ${id}:`, error);
        console.error(`Error details:`, error.response?.data || error.message);
        if (onSettled) onSettled();
        throw error;
    }
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

export function riskTreatmentPlanOptions(id, options) {
    // The id parameter can be either a risk ID or a treatment plan ID
    // We need to determine which one it is and handle it appropriately
    
    // Check if we know this is a treatment plan ID (e.g., from URL parameter)
    const isTreatmentPlanId = options?.isTreatmentPlanId;
    
    // If we're not sure, check if we have a cached treatment plan ID for this risk ID
    const queryClient = typeof window !== 'undefined' ? window.__REACT_QUERY_GLOBAL_CLIENT__ : null;
    const cachedTreatmentPlanId = queryClient?.getQueryData(['risks', id, 'treatment-plan-id']);
    
    // If we have a cached treatment plan ID that's different from the id parameter,
    // then the id parameter is likely a risk ID, not a treatment plan ID
    const mightBeRiskId = !isTreatmentPlanId && 
                         (!cachedTreatmentPlanId || cachedTreatmentPlanId === id);
    
    console.log(`Setting up treatment plan query for ID ${id}:`, {
        isTreatmentPlanId,
        cachedTreatmentPlanId,
        mightBeRiskId
    });
    
    return queryOptions({
        queryKey: ['risks', id, 'treatment-plans'],
        queryFn: fetchRiskTreatmentPlan,
        // Add additional metadata to help fetchRiskTreatmentPlan function
        meta: {
            isTreatmentPlanId,
            mightBeRiskId,
            cachedTreatmentPlanId
        },
        // Always refetch on mount to ensure we have fresh data
        refetchOnMount: true,
        // Set a short stale time to encourage refetching when component mounts
        staleTime: 1000, // 1 second
        retry: 3, // Retry 3 times if the query fails
        retryDelay: 1000, // Wait 1 second between retries
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
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (variables) => {
            // Check if there's a cached treatment plan ID
            const cachedTreatmentPlanId = queryClient.getQueryData(['risks', riskId, 'treatment-plan-id']);
            
            // Check if the data already contains a treatment plan ID
            const dataTreatmentPlanId = variables.data?.risk_treatment_id;
            
            // If we have a treatment plan ID in the data or cached, make sure it's included in the request
            if ((cachedTreatmentPlanId || dataTreatmentPlanId) && !variables.data.risk_treatment_id) {
                console.log(`Adding treatment plan ID to update request: ${dataTreatmentPlanId || cachedTreatmentPlanId}`);
                // Create a new data object with the treatment plan ID to avoid mutating the original
                const updatedData = {
                    ...variables.data,
                    risk_treatment_id: dataTreatmentPlanId || cachedTreatmentPlanId
                };
                return updateTreatmentPlan(riskId, { data: updatedData });
            }
            
            // Otherwise proceed with the original request
            return updateTreatmentPlan(riskId, variables);
        },
        onSuccess: (data, variables, context) => {
            // If the response contains a treatment plan ID, cache it for future use
            if (data.treatmentPlanId && data.treatmentPlanId !== riskId) {
                console.log(`Caching treatment plan ID ${data.treatmentPlanId} from successful update`);
                queryClient.setQueryData(['risks', riskId, 'treatment-plan-id'], data.treatmentPlanId);
            }
            
            // Invalidate queries to ensure fresh data
            queryClient.invalidateQueries({
                queryKey: ['risks', riskId, 'treatment-plans']
            });
            
            // Call the original onSuccess callback if provided
            if (callbacks?.onSuccess) {
                callbacks.onSuccess(data, variables, context);
            }
        },
        ...callbacks
    });
}

export function useSaveTreatmentPlanToDraft(riskId, callbacks) {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (variables) => {
            // Check if there's a cached treatment plan ID
            const cachedTreatmentPlanId = queryClient.getQueryData(['risks', riskId, 'treatment-plan-id']);
            
            // Check if the data already contains a treatment plan ID
            const dataTreatmentPlanId = variables.data?.risk_treatment_id;
            
            // If we have a treatment plan ID in the data or cached, make sure it's included in the request
            if ((cachedTreatmentPlanId || dataTreatmentPlanId) && !variables.data.risk_treatment_id) {
                console.log(`Adding treatment plan ID to draft save request: ${dataTreatmentPlanId || cachedTreatmentPlanId}`);
                // Create a new data object with the treatment plan ID to avoid mutating the original
                const updatedData = {
                    ...variables.data,
                    risk_treatment_id: dataTreatmentPlanId || cachedTreatmentPlanId
                };
                return saveTreatmentPlanToDraft(riskId, { data: updatedData });
            }
            
            // Otherwise proceed with the original request
            return saveTreatmentPlanToDraft(riskId, variables);
        },
        onSuccess: (data, variables, context) => {
            // If the response contains a treatment plan ID, cache it for future use
            if (data.treatmentPlanId && data.treatmentPlanId !== riskId) {
                console.log(`Caching treatment plan ID ${data.treatmentPlanId} from successful draft save`);
                queryClient.setQueryData(['risks', riskId, 'treatment-plan-id'], data.treatmentPlanId);
            }
            
            // Invalidate queries to ensure fresh data
            queryClient.invalidateQueries({
                queryKey: ['risks', riskId, 'treatment-plans']
            });
            
            // Call the original onSuccess callback if provided
            if (callbacks?.onSuccess) {
                callbacks.onSuccess(data, variables, context);
            }
        },
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

