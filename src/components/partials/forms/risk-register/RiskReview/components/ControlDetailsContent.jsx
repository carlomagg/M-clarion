import { useEffect, useRef } from "react";
import ActionPlanTable from "../../components/ActionPlanTable";
import { StatusChip } from "./Elements";

export default function ControlDetailsContent({treatmentPlan}) {
    const controlElementRef = useRef(null);
    const contingencyElementRef = useRef(null);
    const rrElementRef = useRef(null);
    
    useEffect(() => {
        if (treatmentPlan) {
            controlElementRef.current.innerHTML = treatmentPlan.recommended_control;
            contingencyElementRef.current.innerHTML = treatmentPlan.contingency_plan;
            rrElementRef.current.innerHTML = treatmentPlan.resource_required;
        }
    }, [treatmentPlan]);

    return (
        <div className='flex flex-col gap-9'>
            <div className='flex flex-col gap-6'>
                <div className='space-y-3'>
                    <h4 className="font-semibold">Risk Response</h4>
                    <p>{treatmentPlan.risk_response.name}</p>
                </div>
                <div className='space-y-3'>
                    <h4 className="font-semibold">Control Family Type</h4>
                    <p>{treatmentPlan.control_family_type.name}</p>
                </div>
                <div className='space-y-3'>
                    <h4 className="font-semibold">Recommended Control</h4>
                    <div ref={controlElementRef}></div>
                </div>
                <div className='space-y-3'>
                    <h4 className="font-semibold">Contingecy Plan</h4>
                    <div ref={contingencyElementRef}></div>
                </div>
                <div className='space-y-3'>
                    <h4 className="font-semibold">Resoure Requirement</h4>
                    <div ref={rrElementRef}></div>
                </div>
                <div className='space-y-3'>
                    <h4 className="font-semibold">Timeline</h4>
                    <div className='flex justify-between'>
                        <div className='space-x-3'>
                            <span>Start Date:</span>
                            <span>{treatmentPlan.start_date}</span>
                        </div>
                        <div className='space-x-3'>
                            <span>Due Date:</span>
                            <span>{treatmentPlan.deadline}</span>
                        </div>
                        <div className='space-x-3'>
                            <span>Status:</span>
                            <StatusChip color={'#2F2F2F'} text={treatmentPlan.status?.status} />
                        </div>
                    </div>
                </div>
                <ActionPlanTable plans={treatmentPlan.action_plan} editable={false} />
            </div>
        </div>
    );
}