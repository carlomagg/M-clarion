import { useEffect, useState } from "react";
import { FormCancelButton, FormProceedButton } from "../../../../partials/buttons/FormButtons/FormButtons";
import { Field } from "../../../../partials/Elements/Elements";
import { CloseButton } from "../../components/Buttons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { riskControlFamilyTypeOptions, useAddRiskControlFamilyType, useUpdateRiskControlFamilyType } from "../../../../../queries/risks/risk-control-family-types";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";

export default function FamilyTypeDialog({context, onRemoveModal}) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const {mode, id: familyTypeId = null} = context;

    // queries
    const {isLoading, error, data: familyType} = useQuery(riskControlFamilyTypeOptions(familyTypeId, {enabled: !!familyTypeId}));

    // populate formdata when in edit mode
    useEffect(() => {
        if (mode === 'edit' && familyType) {
            setFormData({
                name: familyType.type,
                description: familyType.description,
            });
        }
    }, [mode, familyType]);

    // mutations
    const {isPending: isAddingFamilyType, mutate: addFamilyType} = useAddRiskControlFamilyType({onSuccess, onError, onSettled});
    const {isPending: isUpdatingFamilyType, mutate: updateFamilyType} = useUpdateRiskControlFamilyType({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingFamilyType ? 'Adding Risk Control Family Type' : 'Updating Risk Control Family Type';
        (isAddingFamilyType || isUpdatingFamilyType) && dispatchMessage('processing', text);
    }, [isAddingFamilyType, isUpdatingFamilyType]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', 'control-family-types']});
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
        mode === 'add' && addFamilyType({data: formData});
        mode === 'edit' && updateFamilyType({id: familyTypeId, data: formData});
    }

    let content;

    if (isLoading) content = <div>Loading</div>
    else if (error) content = <div>error</div>
    else {
        content = mode === 'edit' || mode === 'add' ?
            <>
                <div className="flex flex-col gap-3">
                    <Field {...{name: 'name', label: 'Control Family Type', placeholder: 'Enter name of control family type', value: formData.name, onChange: handleChange}} />
                    <Field {...{type: 'textbox', name: 'description', label: 'Description', placeholder: 'Enter description', value: formData.description, onChange: handleChange}} />
                </div>
                <hr className="border border-red-[#CCC]" />
                <div className="flex gap-6">
                    <FormCancelButton text={'Discard'} onClick={onRemoveModal} />
                    <FormProceedButton text={'Save'} disabled={isAddingFamilyType || isUpdatingFamilyType} onClick={handleSave} />
                </div>
            </> :
            <>
                <div className="flex flex-col gap-3">
                    <span className="font-medium">Control Family Type</span>
                    <p>{familyType.type}</p>
                </div>
                <div className="flex flex-col gap-3">
                    <span className="font-medium">Description</span>
                    <p>{familyType.description}</p>
                </div>
            </>
    }

    return (
        <div className="bg-white border border-[#E2E2E2] rounded-2xl w-[500px] p-6">
            <div className="flex flex-col gap-6">
                <header className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">Control Family Type</h4>
                    <CloseButton onClose={onRemoveModal} />
                </header>
                {content}
            </div>
        </div>
    );
}