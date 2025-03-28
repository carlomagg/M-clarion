import { useEffect, useState } from "react";
import { FormCancelButton, FormProceedButton } from "../../../../partials/buttons/FormButtons/FormButtons";
import { Field } from "../../../../partials/Elements/Elements";
import { CloseButton } from "../../components/Buttons";
import { riskResponseOptions, useAddRiskResponse, useUpdateRiskResponse } from "../../../../../queries/risks/risk-responses";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";

export default function RiskResponseDialog({context, onRemoveModal}) {
    const [formData, setFormData] = useState({
        name: '',
        note: '',
    });

    const {mode, id: responseId = null} = context;

    // queries
    const {isLoading, error, data: response} = useQuery(riskResponseOptions(responseId, {enabled: !!responseId}));

    // populate formdata when in edit mode
    useEffect(() => {
        if (mode === 'edit' && response) {
            setFormData({
                name: response.name || '',
                note: response.description || '',
            });
        }
    }, [mode, response]);

    // mutations
    const {isPending: isAddingResponse, mutate: addResponse} = useAddRiskResponse({onSuccess, onError, onSettled});
    const {isPending: isUpdatingResponse, mutate: updateResponse} = useUpdateRiskResponse({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingResponse ? 'Adding Risk Response' : 'Updating Risk Response';
        (isAddingResponse || isUpdatingResponse) && dispatchMessage('processing', text);
    }, [isAddingResponse, isUpdatingResponse]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', 'responses']});
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
        mode === 'add' && addResponse({data: formData});
        mode === 'edit' && updateResponse({id: responseId, data: formData});
    }

    let content;

    if (isLoading) content = <div>Loading</div>
    else if (error) content = <div>error</div>
    else {
        console.log(response)

        content =  mode === 'edit' || mode === 'add' ?
            <>
                <div className="flex flex-col gap-3">
                    <Field {...{name: 'name', label: 'Risk Response', placeholder: 'Enter risk response', value: formData.name, onChange: handleChange}} />
                    <Field {...{type: 'textbox', name: 'note', label: 'Description', placeholder: 'Enter description', value: formData.note, onChange: handleChange}} />
                </div>
                <hr className="border border-red-[#CCC]" />
                <div className="flex gap-6">
                    <FormCancelButton text={'Discard'} onClick={onRemoveModal} />
                    <FormProceedButton text={'Save'} disabled={isAddingResponse || isUpdatingResponse} onClick={handleSave} />
                </div>
            </> :
            <>
                <div className="flex flex-col gap-3">
                    <span className="font-medium">Risk Response</span>
                    <p>{response.name}</p>
                </div>
                <div className="flex flex-col gap-3">
                    <span className="font-medium">Description</span>
                    <p>{response.description}</p>
                </div>
            </>
    }

    return (
        <div className="bg-white border border-[#E2E2E2] rounded-2xl w-[500px] p-6">
            <div className="flex flex-col gap-6">
                <header className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">Risk Response</h4>
                    <CloseButton onClose={onRemoveModal} />
                </header>
                {content}
            </div>
        </div>
    );
}