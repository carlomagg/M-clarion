import { useEffect, useState } from "react";
import { FormCancelButton, FormProceedButton } from "../../../../partials/buttons/FormButtons/FormButtons";
import { Field } from "../../../../partials/Elements/Elements";
import { CloseButton } from "../../components/Buttons";
import { useAddRiskResponse, useUpdateRiskResponse } from "../../../../../queries/risks/risk-responses";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";
import { riskControlEffectivenessOptions, useAddRiskControlEffectiveness, useUpdateRiskControlEffectiveness } from "../../../../../queries/risks/risk-control-effectiveness";

export default function ControlEffectivenessDialog({context, onRemoveModal}) {
    const [formData, setFormData] = useState({
        control_status: '',
        description: '',
        indicator: '',
    });

    const {mode, id: controlId = null} = context;

    // queries
    const {isLoading, error, data: control} = useQuery(riskControlEffectivenessOptions(controlId, {enabled: !!controlId}));

    // populate formdata when in edit mode
    useEffect(() => {
        if (mode === 'edit' && control) {
            setFormData({
                control_status: control.control_status || '',
                description: control.description || '',
                indicator: control.indicator || ''
            });
        }
    }, [mode, control]);

    // mutations
    const {isPending: isAddingControl, mutate: addControl} = useAddRiskControlEffectiveness({onSuccess, onError, onSettled});
    const {isPending: isUpdatingControl, mutate: updateControl} = useUpdateRiskControlEffectiveness({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingControl ? 'Adding new risk control effectiveness...' : 'Updating risk control effectiveness...';
        (isAddingControl || isUpdatingControl) && dispatchMessage('processing', text);
    }, [isAddingControl, isUpdatingControl]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', 'control-effectiveness']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) {
            onRemoveModal();
        }
    }

    function handleChange(e) {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    function handleSave() {
        mode === 'add' && addControl({data: formData});
        mode === 'edit' && updateControl({id: controlId, data: formData});
    }

    let content;

    if (isLoading) content = <div>Loading</div>
    else if (error) content = <div>error</div>
    else {
        console.log(control)

        content =  mode === 'edit' || mode === 'add' ?
            <>
                <div className="flex flex-col gap-3">
                    <Field {...{name: 'control_status', label: 'Status', placeholder: 'Enter status', value: formData.control_status, onChange: handleChange}} />
                    <Field {...{type: 'textbox', name: 'description', label: 'Description', placeholder: 'Enter description', value: formData.description, onChange: handleChange, height: 100}} />
                    <Field {...{type: 'textbox', name: 'indicator', label: 'Indicator', placeholder: 'Enter indicator', value: formData.indicator, onChange: handleChange, height: 100}} />
                </div>
                <hr className="border border-red-[#CCC]" />
                <div className="flex gap-6">
                    <FormCancelButton text={'Discard'} onClick={onRemoveModal} />
                    <FormProceedButton text={'Save'} disabled={isAddingControl || isUpdatingControl} onClick={handleSave} />
                </div>
            </> :
            <>
                <div className="flex flex-col gap-3">
                    <span className="font-medium">Status</span>
                    <p>{control.control_status}</p>
                </div>
                <div className="flex flex-col gap-3">
                    <span className="font-medium">Description</span>
                    <p>{control.description}</p>
                </div>
                <div className="flex flex-col gap-3">
                    <span className="font-medium">Indicator</span>
                    <p>{control.indicator}</p>
                </div>
            </>
    }

    return (
        <div className="bg-white border border-[#E2E2E2] rounded-2xl w-[500px] p-6">
            <div className="flex flex-col gap-6">
                <header className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">Control Effectiveness</h4>
                    <CloseButton onClose={onRemoveModal} />
                </header>
                {content}
            </div>
        </div>
    );
}