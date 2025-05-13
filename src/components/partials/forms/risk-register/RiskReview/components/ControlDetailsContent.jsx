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
import { SelectedItemsList } from '../../../../SelectedItemsList';

// Set to false for production environment
const SHOW_DEBUG_INFO = false;

export default function ControlDetailsContent({treatmentPlan}) {
    // Keep these refs for backward compatibility but we won't use them
    const controlElementRef = useRef(null);
    const contingencyElementRef = useRef(null);
    const rrElementRef = useRef(null);
    const [dataLoaded, setDataLoaded] = useState(true);
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
    
    // Track loading and risk states
    const [hasLoadingIssue, setHasLoadingIssue] = useState(false);
    const [isRisk142, setIsRisk142] = useState(false);
    const [diagInfo, setDiagInfo] = useState({});
    
    // Add comprehensive logging for debugging
    useEffect(() => {
        console.log('ControlDetailsContent - Treatment Plan data:', treatmentPlan);
        if (treatmentPlan) {
            console.log('Risk Response:', treatmentPlan.risk_response);
            console.log('Control Family Type:', treatmentPlan.control_family_type);
            console.log('Control Description:', treatmentPlan.control_description?.substring(0, 50) + '...');
            console.log('Controls List:', treatmentPlan.controls);
            console.log('Risk Owner:', treatmentPlan.risk_owner);
            console.log('Resources Required:', treatmentPlan.resources_required);
        } else {
            console.warn('Treatment Plan data is undefined or null');
        }
    }, [treatmentPlan]);
    
    // Create a function to get the actual treatment plan data from the nested structure
    const getActualTreatmentPlanData = () => {
        // First, check if the passed treatment plan has control_details structure
        if (treatmentPlan && treatmentPlan.control_details) {
            console.log("Found control_details structure in treatment plan data");
            return treatmentPlan.control_details;
        }
        
        // Check if this is sessionStorage format (has different field names)
        if (treatmentPlan && 
            (treatmentPlan.recommended_control !== undefined || 
             treatmentPlan.contingency_plan !== undefined || 
             treatmentPlan.response_id !== undefined)) {
             
            console.log("Found sessionStorage format data");
            
            // Map from sessionStorage format to API format
            const mappedData = {
                recommended_control: treatmentPlan.recommended_control,
                contingency_plan: treatmentPlan.contingency_plan || treatmentPlan.contigency_plan,
                resource_required: treatmentPlan.resources_requirement || treatmentPlan.resource_required,
                start_date: treatmentPlan.start_date,
                deadline: treatmentPlan.deadline,
                action_plan: treatmentPlan.action_plan || [],
                risk_treatment_id: treatmentPlan.risk_treatment_id,
                risk_response: {
                    id: treatmentPlan.response_id,
                    name: "Response ID: " + treatmentPlan.response_id
                },
                control_family_type: {
                    id: treatmentPlan.control_family_type_id,
                    name: "Control Family Type ID: " + treatmentPlan.control_family_type_id
                },
                status: {
                    id: treatmentPlan.status,
                    status: "Status ID: " + treatmentPlan.status
                }
            };
            
            return mappedData;
        }
        
        // If no control_details, return the treatment plan directly
        return treatmentPlan || {};
    };
    
    // Get our actual data source
    const getActualTreatmentPlan = getActualTreatmentPlanData();
    
    useEffect(() => {
        try {
            // Set data as loaded
            setDataLoaded(true);
            setContentError(null);
            
            // Check if risk ID is 142 for special handling
            if (riskID === "142" || riskID === 142) {
                setIsRisk142(true);
            }
        } catch (error) {
            console.error("Error in useEffect:", error);
            setContentError(error.message);
            setHasLoadingIssue(true);
        }
    }, [treatmentPlan, riskID]);

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
        // Get data from our function
        const data = getActualTreatmentPlanData();
        
        if (data?.id) {
            setValue("mitigate_response", data?.risk_response?.name || "");
            setValue("control_family", data?.control_family_type?.name || "");
            setValue("status", data?.status?.status || "");
            setValue("recommended_control", data?.recommended_control || "");
            setValue("contingent_plan", data?.contingency_plan || "");
            setValue("resource_requirement", data?.resource_required || "");
            setValue("startDate", data?.start_date || "");
            setValue("deadline", data?.deadline || "");
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
    const checkIsMissingCriticalFields = () => {
        const data = getActualTreatmentPlanData();
        return (!data.risk_response || !data.risk_response.name) &&
               (!data.control_family_type || !data.control_family_type.name);
    };
    
    // For problematic risk IDs, use a more lenient approach to displaying data
    const checkForceDisplayIncomplete = () => {
        // Don't check hasLoadingIssue anymore - always return false
        return false;
    };
    
    const isMissingCriticalFields = checkIsMissingCriticalFields();
    const forceDisplayIncomplete = checkForceDisplayIncomplete();

    if (isMissingCriticalFields && !forceDisplayIncomplete) {
        if (SHOW_DEBUG_INFO) {
            console.warn("Treatment plan is missing critical fields:", getActualTreatmentPlanData());
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
                            {treatmentPlan?.control_details && <li><strong>Has control_details structure!</strong></li>}
                            {getActualTreatmentPlanData().recommended_control && <li>Recommended Control</li>}
                            {getActualTreatmentPlanData().contingency_plan && <li>Contingency Plan: {getActualTreatmentPlanData().contingency_plan}</li>}
                            {getActualTreatmentPlanData().resource_required && <li>Resource Requirement</li>}
                            {getActualTreatmentPlanData().start_date && <li>Start Date: {getActualTreatmentPlanData().start_date}</li>}
                            {getActualTreatmentPlanData().deadline && <li>Deadline: {getActualTreatmentPlanData().deadline}</li>}
                            {getActualTreatmentPlanData().status && <li>Status: {typeof getActualTreatmentPlanData().status === 'object' ? getActualTreatmentPlanData().status.status || 'Present' : getActualTreatmentPlanData().status}</li>}
                            {getActualTreatmentPlanData().action_plan && getActualTreatmentPlanData().action_plan.length > 0 && <li>Action Plan ({getActualTreatmentPlanData().action_plan.length} items)</li>}
                            {getActualTreatmentPlanData().risk_treatment_id && <li>Treatment Plan ID: {getActualTreatmentPlanData().risk_treatment_id}</li>}
                        </ul>
                        
                        {treatmentPlan?.control_details && (
                            <div className="mt-2">
                                <strong>Direct control_details fields:</strong>
                                <ul className="ml-4 list-disc">
                                    {treatmentPlan.control_details.recommended_control && <li>Recommended Control</li>}
                                    {treatmentPlan.control_details.contingency_plan && <li>Contingency Plan: {treatmentPlan.control_details.contingency_plan}</li>}
                                    {treatmentPlan.control_details.resource_required && <li>Resource Requirement</li>}
                                    {treatmentPlan.control_details.start_date && <li>Start Date: {treatmentPlan.control_details.start_date}</li>}
                                    {treatmentPlan.control_details.deadline && <li>Deadline: {treatmentPlan.control_details.deadline}</li>}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Format dates if needed
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Not defined';
        
        // First check if it's already in a nice format with slashes
        if (/\d{2}\/\d{2}\/\d{4}/.test(dateStr)) return dateStr;
        
        // Check if it's in format with dashes (DD-MM-YYYY)
        if (/\d{2}-\d{2}-\d{4}/.test(dateStr)) return dateStr;
        
        // Handle ISO format
        try {
            if (dateStr.includes('-')) {
                const parts = dateStr.split('-');
                // If first part is 4 digits, it's likely YYYY-MM-DD
                if (parts[0].length === 4) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
                // Otherwise it might already be DD-MM-YYYY
                return dateStr;
            }
            return dateStr;
        } catch (e) {
            console.error('Error formatting date:', e);
            return dateStr;
        }
    };

    // The most stable approach - directly access data each time in the render logic
    return (
        <div className='flex flex-col gap-9'>            
            <div className='flex flex-col gap-6'>
                <div className='space-y-3'>
                    <h4 className="font-semibold">Risk Response</h4>
                    <p>{getActualTreatmentPlanData().risk_response?.name || 'Not defined'}</p>
                </div>
                <div className='space-y-3'>
                    <h4 className="font-semibold">Control Family Type</h4>
                    <p>{getActualTreatmentPlanData().control_family_type?.name || 'Not defined'}</p>
                </div>
                
                {/* Recommended Control */}
                <div className='space-y-3'>
                    <h4 className="font-semibold">Recommended Control</h4>
                    {getActualTreatmentPlanData().recommended_control ? (
                        <div dangerouslySetInnerHTML={{ __html: getActualTreatmentPlanData().recommended_control }} />
                    ) : (
                        <div>No control defined</div>
                    )}
                </div>
                
                {/* Contingency Plan */}
                <div className='space-y-3'>
                    <h4 className="font-semibold">Contingency Plan</h4>
                    {getActualTreatmentPlanData().contingency_plan ? (
                        <div dangerouslySetInnerHTML={{ __html: getActualTreatmentPlanData().contingency_plan }} />
                    ) : (
                        <div>No contingency plan defined</div>
                    )}
                </div>
                
                {/* Resource Requirement */}
                <div className='space-y-3'>
                    <h4 className="font-semibold">Resource Requirement</h4>
                    {getActualTreatmentPlanData().resource_required ? (
                        <div dangerouslySetInnerHTML={{ __html: getActualTreatmentPlanData().resource_required }} />
                    ) : (
                        <div>No resource requirements defined</div>
                    )}
                </div>
                
                {/* Timeline */}
                <div className='space-y-3'>
                    <h4 className="font-semibold">Timeline</h4>
                    <div className='flex justify-between flex-wrap gap-4'>
                        <div className='space-x-3'>
                            <span>Start Date:</span>
                            {getActualTreatmentPlanData().start_date ? (
                                <span>{formatDate(getActualTreatmentPlanData().start_date)}</span>
                            ) : (
                                <span>Not defined</span>
                            )}
                        </div>
                        <div className='space-x-3'>
                            <span>Due Date:</span>
                            {getActualTreatmentPlanData().deadline ? (
                                <span>{formatDate(getActualTreatmentPlanData().deadline)}</span>
                            ) : (
                                <span>Not defined</span>
                            )}
                        </div>
                        <div className='space-x-3'>
                            <span>Status:</span>
                            <StatusChip color={'#2F2F2F'} text={getActualTreatmentPlanData().status?.status || 'Not defined'} />
                        </div>
                    </div>
                </div>
                
                {getActualTreatmentPlanData().action_plan && getActualTreatmentPlanData().action_plan.length > 0 ? (
                    <ActionPlanTable plans={getActualTreatmentPlanData().action_plan} editable={false} />
                ) : (
                    <div className="p-3 bg-gray-50 rounded text-sm">No action plans defined</div>
                )}
            </div>
            
            {/* Risk 142 special handling */}
            {isRisk142 && (
                <Box className="mt-4">
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
        </div>
    );
}