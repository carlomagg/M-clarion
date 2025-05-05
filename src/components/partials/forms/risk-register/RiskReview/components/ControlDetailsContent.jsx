import { useEffect, useRef, useState, useLayoutEffect } from "react";
import ActionPlanTable from "../../components/ActionPlanTable";
import { StatusChip } from "./Elements";
import { useParams, useSearchParams } from 'react-router-dom';
import processService from "../../../../../../services/Process.service";
import useDispatchMessage from "../../../../../../hooks/useDispatchMessage";
import { useForm } from "react-hook-form";
import { Box, Link, Stack, Typography, Button } from '@mui/material';
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";

// Set to false for production environment
const SHOW_DEBUG_INFO = false;

export default function ControlDetailsContent({treatmentPlan}) {
    const controlElementRef = useRef(null);
    const contingencyElementRef = useRef(null);
    const rrElementRef = useRef(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [contentError, setContentError] = useState(null);
    const [isFixing, setIsFixing] = useState(false);
    const dispatchMessage = useDispatchMessage();
    const { t } = useTranslation();
    const { control, handleSubmit, setValue, getValues } = useForm();
    const { id } = useParams();
    const queryClient = useQueryClient();
    
    // Get the current risk ID to handle special cases
    const params = useParams();
    const [searchParams] = useSearchParams();
    const riskID = params.id || searchParams.get('id');
    
    // More generalized approach for potential problematic risks
    const [hasLoadingIssue, setHasLoadingIssue] = useState(false);
    const [diagInfo, setDiagInfo] = useState({});
    const [isRisk142, setIsRisk142] = useState(false);

    useEffect(() => {
        try {
            // Log detailed diagnostic information about the treatment plan
            console.log('[DIAG] Treatment plan received:', treatmentPlan);
            console.log('[DIAG] Treatment plan type:', typeof treatmentPlan);
            console.log('[DIAG] Treatment plan is null:', treatmentPlan === null);
            console.log('[DIAG] Treatment plan is empty object:', treatmentPlan && Object.keys(treatmentPlan).length === 0);
            
            // Collect diagnostic info for display
            setDiagInfo({
                type: typeof treatmentPlan,
                isNull: treatmentPlan === null,
                isEmpty: treatmentPlan && Object.keys(treatmentPlan).length === 0,
                hasInfo: Boolean(treatmentPlan?.info),
                infoMessage: treatmentPlan?.info || 'No info field',
                hasMessage: Boolean(treatmentPlan?.message),
                message: treatmentPlan?.message || 'No message field',
                hasRiskId: Boolean(treatmentPlan?.riskId),
                riskId: treatmentPlan?.riskId || 'Not provided',
                originalResponse: treatmentPlan?.originalResponse !== undefined ? 
                    (treatmentPlan.originalResponse === null ? 'null' : JSON.stringify(treatmentPlan.originalResponse)) : 
                    'Not captured'
            });
            
            if (treatmentPlan) {
                if (SHOW_DEBUG_INFO) {
                    console.log("ControlDetailsContent - received treatment plan data:", treatmentPlan);
                    
                    // Check if this is a generated fallback treatment plan
                    if (treatmentPlan.info && treatmentPlan.info.includes('Generated')) {
                        console.log(`Using generated fallback data for risk ID: ${riskID}`);
                        setHasLoadingIssue(true);
                    }
                    
                    // Check if the API returned null or empty object
                    if (treatmentPlan.info && treatmentPlan.info.includes('API returned null') ||
                        treatmentPlan.info && treatmentPlan.info.includes('API returned empty object')) {
                        console.log('API returned null or empty treatment plan data');
                        setHasLoadingIssue(true);
                    }
                }
                
                setDataLoaded(true);
                setContentError(null);
                
                if (controlElementRef.current) {
                    controlElementRef.current.innerHTML = treatmentPlan.recommended_control || '';
                }
                if (contingencyElementRef.current) {
                    contingencyElementRef.current.innerHTML = treatmentPlan.contingency_plan || '';
                }
                if (rrElementRef.current) {
                    rrElementRef.current.innerHTML = treatmentPlan.resource_required || '';
                }
            }
        } catch (error) {
            console.error("Error rendering treatment plan content:", error);
            setContentError(error.message);
            setDataLoaded(false);
            setHasLoadingIssue(true);
        }
    }, [treatmentPlan, riskID]);

    // Check if this is risk ID 142 which has known issues
    useEffect(() => {
        if (riskID === "142" || riskID === 142) {
            console.log("[DIAGNOSTIC] Risk ID 142 detected in ControlDetailsContent component");
            setIsRisk142(true);
        }
    }, [riskID]);

    // Function to create default treatment plan for risk 142
    const handleFixTreatmentPlan = async () => {
        if (riskID === "142" || riskID === 142) {
            setIsFixing(true);
            dispatchMessage('processing', 'Creating treatment plan for risk 142 using Postman-verified method...');
            
            try {
                // Use our new Postman-style method that we know works with the API
                const fixedTreatmentPlan = await processService.createTreatmentPlanPostmanStyle(riskID);
                console.log('[DIAGNOSTIC] Treatment plan created using Postman-style method:', fixedTreatmentPlan);
                
                // Check if we received a complete treatment plan
                if (fixedTreatmentPlan && 
                    (fixedTreatmentPlan.recommended_control || 
                     fixedTreatmentPlan.contingency_plan || 
                     fixedTreatmentPlan.resource_required)) {
                
                    dispatchMessage('success', fixedTreatmentPlan.message || 'Treatment plan has been created successfully using Postman-verified method');
                    
                    // Update the treatment plan in the parent component through React Query
                    if (window.__REACT_QUERY_GLOBAL_CLIENT__) {
                        window.__REACT_QUERY_GLOBAL_CLIENT__.setQueryData(['risks', riskID, 'treatment-plans'], fixedTreatmentPlan);
                        console.log('[DIAGNOSTIC] Updated treatment plan data in React Query cache');
                    }
                    
                    // Short delay before reloading to allow React Query to update
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    // If we received just a success message without treatment plan data
                    dispatchMessage('success', 'Treatment plan created, but manual refresh needed');
                    // Force reload the page to show the new treatment plan
                    window.location.reload();
                }
            } catch (error) {
                console.error('[DIAGNOSTIC] Error fixing treatment plan with Postman method:', error);
                
                // Fallback to previous default method if Postman-style fails
                try {
                    dispatchMessage('processing', 'First method failed. Trying alternative method...');
                    const backupPlan = await processService.createDefaultTreatmentPlan(riskID);
                    
                    if (backupPlan) {
                        dispatchMessage('success', 'Treatment plan created using fallback method. Reloading...');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }
                } catch (backupError) {
                    console.error('[DIAGNOSTIC] Both fix methods failed:', backupError);
                    dispatchMessage('failed', 'Failed to create treatment plan. Please try again or contact support.');
                } finally {
                    setIsFixing(false);
                }
            }
        }
    };

    useLayoutEffect(() => {
        if (treatmentPlan?.id) {
            setValue("mitigate_response", treatmentPlan?.risk_response?.name || "");
            setValue("control_family", treatmentPlan?.control_family_type?.name || "");
            setValue("status", treatmentPlan?.status?.status || "");
            setValue("recommended_control", treatmentPlan?.recommended_control || "");
            setValue("contingent_plan", treatmentPlan?.contingency_plan || "");
            setValue("resource_requirement", treatmentPlan?.resource_required || "");
            setValue("startDate", treatmentPlan?.start_date || "");
            setValue("deadline", treatmentPlan?.deadline || "");
        }
    }, [treatmentPlan, setValue]);

    // Show diagnostic info if treatment plan is null, empty, or has info field indicating API issues
    if (treatmentPlan === null || 
        (treatmentPlan && Object.keys(treatmentPlan).length === 0) ||
        (treatmentPlan?.info && treatmentPlan.info.includes('API returned'))) {
        
        return (
            <div className="p-4 bg-amber-50 rounded border border-amber-200">
                <div className="flex flex-col items-center justify-center py-4">
                    <svg className="w-10 h-10 text-amber-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h4 className="text-lg font-medium text-amber-700">API Response Issue</h4>
                    <p className="text-amber-600 text-center text-sm mt-1">
                        The server returned {treatmentPlan === null ? 'null' : 'an empty response'} for the treatment plan.
                    </p>
                    <p className="text-gray-600 text-center mt-2">
                        This is likely a server-side issue with risk ID {riskID}.
                    </p>
                    
                    {(riskID === "142" || riskID === 142) && (
                        <div className="mt-4">
                            <button 
                                className={`px-4 py-2 rounded text-white ${isFixing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                                onClick={handleFixTreatmentPlan}
                                disabled={isFixing}
                            >
                                {isFixing ? 'Fixing Treatment Plan...' : 'Fix Treatment Plan for Risk 142'}
                            </button>
                        </div>
                    )}
                    
                    {SHOW_DEBUG_INFO && (
                        <div className="mt-4 p-3 bg-white border border-gray-300 rounded w-full text-xs">
                            <h5 className="font-bold mb-2">Diagnostic Information:</h5>
                            <ul className="space-y-1">
                                <li><strong>Risk ID:</strong> {riskID}</li>
                                <li><strong>Data Type:</strong> {diagInfo.type}</li>
                                <li><strong>Is Null:</strong> {diagInfo.isNull ? 'Yes' : 'No'}</li>
                                <li><strong>Is Empty Object:</strong> {diagInfo.isEmpty ? 'Yes' : 'No'}</li>
                                <li><strong>Has Info Field:</strong> {diagInfo.hasInfo ? 'Yes' : 'No'}</li>
                                <li><strong>Info Message:</strong> {diagInfo.infoMessage}</li>
                                <li><strong>Has Message Field:</strong> {diagInfo.hasMessage ? 'Yes' : 'No'}</li>
                                <li><strong>Message:</strong> {diagInfo.message}</li>
                                <li><strong>Original API Response:</strong> {diagInfo.originalResponse}</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // If we have a content error, display it
    if (contentError) {
        return (
            <div className="p-4 bg-red-50 rounded border border-red-200">
                <div className="flex flex-col items-center justify-center py-4">
                    <svg className="w-10 h-10 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h4 className="text-lg font-medium text-red-700">Error Loading Treatment Plan</h4>
                    <p className="text-red-600 text-center text-sm mt-1">{contentError}</p>
                    <p className="text-gray-600 text-center mt-2">Please try refreshing the page or contact support if this persists.</p>
                </div>
            </div>
        );
    }

    // If treatment plan is null/undefined or empty object, display a message
    if (!treatmentPlan || Object.keys(treatmentPlan).length === 0) {
        return (
            <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <div className="flex flex-col items-center justify-center py-6">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h4 className="text-lg font-medium text-gray-700">Treatment Plan Unavailable</h4>
                    <p className="text-gray-500 text-center mt-2">Could not load treatment plan data. Please use the refresh button or try editing.</p>
                    {hasLoadingIssue && (
                        <p className="text-blue-600 text-center text-sm mt-3">
                            This risk (ID: {riskID}) may require special handling. Try editing the treatment plan directly.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Check if treatment plan is missing critical fields
    const isMissingCriticalFields = 
        (!treatmentPlan.risk_response || !treatmentPlan.risk_response.name) &&
        (!treatmentPlan.control_family_type || !treatmentPlan.control_family_type.name);

    // For problematic risk IDs, use a more lenient approach to displaying data
    const forceDisplayIncomplete = hasLoadingIssue && (
        treatmentPlan.recommended_control || 
        treatmentPlan.contingency_plan || 
        treatmentPlan.resource_required
    );

    if (isMissingCriticalFields && !forceDisplayIncomplete) {
        if (SHOW_DEBUG_INFO) {
            console.warn("Treatment plan is missing critical fields:", treatmentPlan);
        }
        
        return (
            <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <div className="flex flex-col items-center justify-center py-6">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <h4 className="text-lg font-medium text-gray-700">Incomplete Treatment Plan</h4>
                    <p className="text-gray-500 text-center mt-2">Additional information needed for the treatment plan.</p>
                    {hasLoadingIssue && (
                        <p className="text-blue-600 text-center text-sm mt-3">
                            This risk (ID: {riskID}) may require special handling. Try editing the treatment plan directly.
                        </p>
                    )}
                </div>
                
                {SHOW_DEBUG_INFO && (
                    <div className="text-xs bg-white p-2 rounded border border-gray-200 mt-4">
                        <strong>Available Data:</strong>
                        <ul className="ml-4 list-disc">
                            {treatmentPlan.recommended_control && <li>Recommended Control</li>}
                            {treatmentPlan.contingency_plan && <li>Contingency Plan</li>}
                            {treatmentPlan.resource_required && <li>Resource Requirement</li>}
                            {treatmentPlan.start_date && <li>Start Date: {treatmentPlan.start_date}</li>}
                            {treatmentPlan.deadline && <li>Deadline: {treatmentPlan.deadline}</li>}
                            {treatmentPlan.status && <li>Status: {typeof treatmentPlan.status === 'object' ? treatmentPlan.status.status || 'Present' : treatmentPlan.status}</li>}
                            {treatmentPlan.action_plan && treatmentPlan.action_plan.length > 0 && <li>Action Plan ({treatmentPlan.action_plan.length} items)</li>}
                            {treatmentPlan.risk_treatment_id && <li>Treatment Plan ID: {treatmentPlan.risk_treatment_id}</li>}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    // Extract data safely with fallbacks - enhanced with more checks
    const riskResponseName = treatmentPlan.risk_response?.name || 
                            (typeof treatmentPlan.risk_response === 'string' ? treatmentPlan.risk_response : 'Not specified');
    
    const controlFamilyTypeName = treatmentPlan.control_family_type?.name || 
                                 treatmentPlan.control_family_type?.type || 
                                 (typeof treatmentPlan.control_family_type === 'string' ? treatmentPlan.control_family_type : 'Not specified');
    
    // Format dates if needed
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Not specified';
        
        // First check if it's already in a nice format
        if (/\d{2}\/\d{2}\/\d{4}/.test(dateStr)) return dateStr;
        
        // Handle ISO format
        try {
            if (dateStr.includes('-')) {
                const [year, month, day] = dateStr.split('-');
                return `${day}/${month}/${year}`;
            }
            return dateStr;
        } catch (e) {
            return dateStr;
        }
    };
    
    const startDate = formatDate(treatmentPlan.start_date);
    const deadline = formatDate(treatmentPlan.deadline);
    
    // Handle various status field formats
    let statusText = 'Not specified';
    if (treatmentPlan.status) {
        if (typeof treatmentPlan.status === 'object') {
            statusText = treatmentPlan.status.status || treatmentPlan.status.name || 'Present';
        } else if (typeof treatmentPlan.status === 'string') {
            statusText = treatmentPlan.status;
        } else if (typeof treatmentPlan.status === 'number') {
            statusText = `Status ID: ${treatmentPlan.status}`;
        }
    }
    
    // Make sure action plans is an array even if it's not in the data
    const actionPlans = Array.isArray(treatmentPlan.action_plan) ? treatmentPlan.action_plan : [];

    // Display a loading state if we're still waiting for refs to be populated
    if (!dataLoaded) {
        return (
            <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center justify-center py-4">
                    <svg className="animate-spin h-5 w-5 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading treatment plan data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-9'>
            {hasLoadingIssue && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                This risk (ID: {riskID}) may have incomplete data due to server issues. Some information might be missing.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div className='flex flex-col gap-6'>
                {!forceDisplayIncomplete && (
                    <>
                        <div className='space-y-3'>
                            <h4 className="font-semibold">Risk Response</h4>
                            <p>{riskResponseName}</p>
                        </div>
                        <div className='space-y-3'>
                            <h4 className="font-semibold">Control Family Type</h4>
                            <p>{controlFamilyTypeName}</p>
                        </div>
                    </>
                )}
                <div className='space-y-3'>
                    <h4 className="font-semibold">Recommended Control</h4>
                    <div ref={controlElementRef}>{!treatmentPlan.recommended_control && 'Not specified'}</div>
                </div>
                <div className='space-y-3'>
                    <h4 className="font-semibold">Contingency Plan</h4>
                    <div ref={contingencyElementRef}>{!treatmentPlan.contingency_plan && 'Not specified'}</div>
                </div>
                <div className='space-y-3'>
                    <h4 className="font-semibold">Resource Requirement</h4>
                    <div ref={rrElementRef}>{!treatmentPlan.resource_required && 'Not specified'}</div>
                </div>
                {!forceDisplayIncomplete && (
                    <>
                        <div className='space-y-3'>
                            <h4 className="font-semibold">Timeline</h4>
                            <div className='flex justify-between flex-wrap gap-4'>
                                <div className='space-x-3'>
                                    <span>Start Date:</span>
                                    <span>{startDate}</span>
                                </div>
                                <div className='space-x-3'>
                                    <span>Due Date:</span>
                                    <span>{deadline}</span>
                                </div>
                                <div className='space-x-3'>
                                    <span>Status:</span>
                                    <StatusChip color={'#2F2F2F'} text={statusText} />
                                </div>
                            </div>
                        </div>
                        {actionPlans.length > 0 ? (
                            <ActionPlanTable plans={actionPlans} editable={false} />
                        ) : (
                            <div className="p-3 bg-gray-50 rounded text-sm">No action plans defined</div>
                        )}
                    </>
                )}
                
                {/* Show treatment plan ID for debugging if available */}
                {SHOW_DEBUG_INFO && treatmentPlan.risk_treatment_id && (
                    <div className="text-xs text-gray-500 mt-4">
                        Treatment Plan ID: {treatmentPlan.risk_treatment_id}
                    </div>
                )}
            </div>
            <Box className="mt-4">
                {isRisk142 && (
                    <Box className="col-12 mb-4">
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleFixTreatmentPlan}
                                className="p-2"
                            >
                                Fix Treatment Plan for Risk ID 142
                            </Button>
                        </Stack>
                        <Typography variant="body2" color="textSecondary" align="center" className="mt-2">
                            This button creates a valid treatment plan for Risk ID 142 using a format verified to work with the API.
                        </Typography>
                    </Box>
                )}
            </Box>
        </div>
    );
}