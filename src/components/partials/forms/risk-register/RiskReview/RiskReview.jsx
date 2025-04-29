import { useEffect, useRef, useState } from 'react';
import { FormCancelButton, FormCustomButton, FormProceedButton } from '../../../buttons/FormButtons/FormButtons';
import styles from './RiskReview.module.css';
import plusIcon from '../../../../../assets/icons/plus.svg';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { impactScoresOptions, likelihoodScoresOptions, riskAnalysisOptions, riskApprovalStatusesOptions, riskApproversOptions, riskEventsOptions, riskFollowUpsOptions, riskIdentificationOptions, riskRegisterStatusesOptions, riskTreatmentPlanOptions, useUpdateWhoToApprove } from '../../../../../queries/risks/risk-queries';
import { usersOptions } from '../../../../../queries/users-queries';
import useDispatchMessage from '../../../../../hooks/useDispatchMessage';
import { Section } from './components/Elements';
import DetailsContent from './components/DetailsContent';
import AnalysisContent from './components/AnalysisContent';
import ControlDetailsContent from './components/ControlDetailsContent';
import RiskEventsContent from './components/RiskEventContent';
import RiskIndicatorsTable from './components/RiskIndicatorsContent';
import FollowUpHistoryContent from './components/FollowUpContent';
import ApprovalContent from './components/ApprovalContent';
import WhoToApproveContent from './components/WhoToApproveContent';
import useUser from '../../../../../hooks/useUser';

function RiskReview({mode}) {

    const [searchParams, setSearchParams] = useSearchParams();
    const params = useParams();
    const riskID = mode === 'standalone' ? params.id : searchParams.get('id');
    const navigate = useNavigate();
    const [selectedApproverId, setSelectedApproverId] = useState('');
    const [canApproveRisk, setCanApproveRisk] = useState(false);
    const presentUser = useUser();

    // queries
    const [likelihoodScoresQuery, impactScoresQuery, riskIdentificationQuery, riskAnalysisQuery, treatmentPlanQuery, riskApproversQuery, usersQuery, approvalStatusesQuery, followUpsQuery, riskEventsQuery] = useQueries({
        queries: [likelihoodScoresOptions(), impactScoresOptions(), riskIdentificationOptions(riskID), riskAnalysisOptions(riskID), riskTreatmentPlanOptions(riskID), riskApproversOptions(riskID), usersOptions(), riskApprovalStatusesOptions(), riskFollowUpsOptions(riskID, {enabled: mode === 'standalone'}), riskEventsOptions(riskID, {enabled: mode === 'standalone'})]
    });

    useEffect(() => {
        const approvers = riskApproversQuery.data;
        if (approvers) {
            setSelectedApproverId(approvers.length > 0 ? approvers[0].user_id : '');
        }

        if (mode === 'standalone' && approvers) {
            setCanApproveRisk(approvers.map(a => a.user_id).includes(presentUser.id));
        }
    }, [riskApproversQuery.data, mode]);

    // mutations
    const {isPending, mutate: updateWhoToApprove} = useUpdateWhoToApprove(riskID, {onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = 'Updating Who To Approve';
        (isPending) && dispatchMessage('processing', text);
    }, [isPending]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // set newly created risk id and proceed to next step if successful
        if (!error && mode === 'form') {
            // Add a short delay before navigation to allow success message to display
            setTimeout(() => {
                // Navigate to the risk tracking page after successful completion of the risk register process
                navigate(`/risks/track/${riskID}`);
            }, 1500); // 1.5 second delay
        }
    }

    function handleEditClicked(section) {
        if (mode === 'form') {
            navigate(`/risks/register/${section}?id=${riskID}`);
        } else if (mode === 'standalone') {
            navigate(`update?section=${section}`);
        }
    }

    function handleSaveClicked() {
        updateWhoToApprove({data: {user_ids: [selectedApproverId]}});
    }

    const indicators = [
        {
            name: 'Floor 12 personel', category: 'Financial', measure: 'Time', target: 12, threshold: 8, currentValues: [{current_value: 4, time_stamp: '12/2/2024, 9:45am', user: 'User'}, {current_value: 4, time_stamp: '12/2/2024, 9:45am', user: 'User'}, {current_value: 4, time_stamp: '12/2/2024, 9:45am', user: 'User'}], flag: 'Medium',
            description: 'Ultricies vel nibh. Sed volutpat lacus vitae gravida viverra. Fusce vel tempor elit. Proin tempus, magna id scelerisque vestibulum, nulla ex pharetra sapien, tempor posuere massa neque nec felis.', updateFrequency: 'Weekly', reportFrequency: 'Weekly', assignedResponsibility: 'Ibrahim'
        },
        {
            name: 'IT systems are unavailale', category: 'Operational', measure: 'Number', target: 12, threshold: 8, currentValues: [{current_value: 4, time_stamp: '12/2/2024, 9:45am', user: 'User'}, {current_value: 4, time_stamp: '12/2/2024, 9:45am', user: 'User'}, {current_value: 4, time_stamp: '12/2/2024, 9:45am', user: 'User'}], flag: 'Medium',
            description: 'Ultricies vel nibh. Sed volutpat lacus vitae gravida viverra. Fusce vel tempor elit. Proin tempus, magna id scelerisque vestibulum, nulla ex pharetra sapien, tempor posuere massa neque nec felis.', updateFrequency: 'Weekly', reportFrequency: 'Weekly', assignedResponsibility: 'Ibrahim'
        },
    ];

    const isLoading = likelihoodScoresQuery.isLoading || impactScoresQuery.isLoading || riskIdentificationQuery.isLoading || riskAnalysisQuery.isLoading || treatmentPlanQuery.isLoading || usersQuery.isLoading || riskApproversQuery.isLoading || approvalStatusesQuery.isLoading || followUpsQuery.isLoading || riskEventsQuery.isLoading;

    const error = likelihoodScoresQuery.error || impactScoresQuery.error || riskIdentificationQuery.error || riskAnalysisQuery.error || treatmentPlanQuery.error || usersQuery.error || riskApproversQuery.error || approvalStatusesQuery.error || followUpsQuery.error || riskEventsQuery.error;

    if (!riskID) return <div>No risk selected</div>
    
    if (isLoading) {
        return <div>Loading...</div>
    }
    
    if (error) {
        return <div>error</div>
    }


    const likelihoodScores = likelihoodScoresQuery.data;
    const impactScores = impactScoresQuery.data;
    const riskIndentification = riskIdentificationQuery.data;
    const riskAnalysis = riskAnalysisQuery.data;
    const treatmentPlan = treatmentPlanQuery.data;
    const approvalStatuses = approvalStatusesQuery.data;
    const followUps = followUpsQuery.data;
    const riskEvents = riskEventsQuery.data;
    const users = usersQuery.data.map(u => ({id: u.user_id, text: (!u.firstname || !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`}));

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-6'>
                <Section heading="Risk Details" button={{onClick: () => handleEditClicked("identification"), jsx: 'Edit'}}>
                    <DetailsContent details={riskIndentification} />
                </Section>
                <Section heading="Risk Analysis" button={{onClick: () => handleEditClicked("analysis"), jsx: 'Edit'}}>
                    <AnalysisContent riskAnalysis={riskAnalysis} likelihoodScores={likelihoodScores} impactScores={impactScores} />
                </Section>
                <Section heading="Control Details" button={{onClick: () => handleEditClicked("treatment-plan"), jsx: 'Edit'}}>
                    <ControlDetailsContent treatmentPlan={treatmentPlan} />
                </Section>
                {
                    mode === 'form' &&
                    <Section heading="Who To Approve">
                        <WhoToApproveContent users={users} selectedId={selectedApproverId} onSelectUser={setSelectedApproverId} />
                    </Section>
                }
                {
                    // the following content are only shown when the review is in view mode and not the fourth step of risk registration step
                    mode === 'standalone' &&
                    <>
                        <Section heading="Risk Events">
                            <RiskEventsContent riskEvents={riskEvents} />
                        </Section>
                        <Section heading="Risk Indicators">
                            <RiskIndicatorsTable indicators={indicators} />
                        </Section>
                        <Section heading="Follow Up History" >
                            <FollowUpHistoryContent followUps={followUps} />
                        </Section>
                        <Section heading="Approval">
                            <ApprovalContent canApproveRisk={canApproveRisk} currentStatus={treatmentPlan.status} approvalStatuses={approvalStatuses} users={users} />
                        </Section>
                    </>
                }
            </div>
            {
                mode === 'form' &&
                <div className='flex gap-3'>
                    <FormCancelButton text={'Discard'} />
                    <FormCustomButton text={'Previous'} onClick={() => navigate(-1)} />
                    {/* <FormCustomButton text={'Save To Draft'} /> */}
                    <FormProceedButton text={'Save'} onClick={handleSaveClicked} />
                </div>
            }
            {
                mode === 'standalone' &&
                <div className='flex w-1/3'>
                    <FormCancelButton text={'Back'} />
                </div>
            }
        </div>
    )
}

export default RiskReview;