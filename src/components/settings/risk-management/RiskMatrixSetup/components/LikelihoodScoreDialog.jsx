import { useEffect, useState } from "react";
import { FormCancelButton, FormProceedButton } from "../../../../partials/buttons/FormButtons/FormButtons";
import { Field } from "../../../../partials/Elements/Elements";
import { CloseButton } from "../../components/Buttons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { riskLikelihoodDefinitionOptions, useAddRiskLikelihoodDefinition, useUpdateRiskLikelihoodDefinition } from "../../../../../queries/risks/risk-likelihood-matrix";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";

export default function LikelihoodScoreDialog({context, onRemoveModal}) {
    const {mode, id: likelihoodId = null, score: likelihoodScore} = context;
    const [formData, setFormData] = useState({
        likelihood_score: likelihoodScore,
        description: '',
        criteria: ''
    });

    // queries
    const {isLoading, error, data: likelihoodDefinition} = useQuery(riskLikelihoodDefinitionOptions(likelihoodId, {enabled: !!likelihoodId}))

    // populate formdata when in edit mode
    useEffect(() => {
        if (mode === 'edit' && likelihoodDefinition) {
            setFormData({
                likelihood_score: likelihoodDefinition.score || '',
                description: likelihoodDefinition.description || '',
                criteria: likelihoodDefinition.criteria || ''
            });
        }
    }, [mode, likelihoodDefinition]);

    // mutations
    const {isPending: isAddingDefinition, mutate: addDefinition} = useAddRiskLikelihoodDefinition({onSuccess, onError, onSettled});
    const {isPending: isUpdatingDefinition, mutate: updateDefinition} = useUpdateRiskLikelihoodDefinition({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingDefinition ? 'Adding Risk Likelihood Definition' : 'Updating Risk Likelihood Definition';
        (isAddingDefinition || isUpdatingDefinition) && dispatchMessage('processing', text);
    }, [isAddingDefinition, isUpdatingDefinition]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', 'likelihood-definitions']});
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
        mode === 'add' && addDefinition({data: formData});
        mode === 'edit' && updateDefinition({id: likelihoodId, data: formData});
    }

    let content;

    if (isLoading) content = <div>Loading</div>
    else if (error) content = <div>error</div>
    else {
        content = mode === 'edit' ?
        <>
            <div className="flex flex-col gap-3">
                <Field {...{name: 'description', label: 'Description', placeholder: 'Enter description', value: formData.description, onChange: handleChange}} />
                <Field {...{type: 'textbox', name: 'criteria', label: 'Criteria', placeholder: 'Enter criteria', value: formData.criteria, onChange: handleChange}} />
            </div>
            <hr className="border border-red-[#CCC]" />
            <div className="flex gap-6">
                <FormCancelButton text={'Discard'} onClick={onRemoveModal} />
                <FormProceedButton text={'Save'} disabled={isAddingDefinition || isUpdatingDefinition} onClick={handleSave} />
            </div>
        </> :
        <>
            <div className="flex flex-col gap-3">
                <span className="font-medium">Descripition</span>
                <p>{likelihoodDefinition.description}</p>
            </div>
            <div className="flex flex-col gap-3">
                <span className="font-medium">Criteria</span>
                <p>{likelihoodDefinition.criteria}</p>
            </div>
        </>
    }

    return (
        <div className="bg-white border border-[#E2E2E2] rounded-2xl w-[500px] p-6">
            <div className="flex flex-col gap-6">
                <header className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">Likelihood Score: {likelihoodScore}</h4>
                    <CloseButton onClose={onRemoveModal} />
                </header>
                {content}
            </div>
        </div>
    );
}