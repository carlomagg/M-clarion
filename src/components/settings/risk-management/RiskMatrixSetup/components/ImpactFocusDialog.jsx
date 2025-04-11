import { useEffect, useState } from "react";
import { FormCancelButton, FormProceedButton } from "../../../../partials/buttons/FormButtons/FormButtons";
import { Field } from "../../../../partials/Elements/Elements";
import { CloseButton } from "../../components/Buttons";
import { riskImpactFocusOptions, useAddRiskImpactFocus, useUpdateRiskImpactFocus } from "../../../../../queries/risks/risk-impact-focus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";

export default function ImpactFocusDialog({context, onRemoveModal}) {
    const [formData, setFormData] = useState({focus: ''});
    const {mode, id: focusId = null} = context;

   // queries
   const {isLoading, error, data: impactFocus} = useQuery(riskImpactFocusOptions(focusId, {enabled: !!focusId}))

   // populate formdata when in edit mode
   useEffect(() => {
       if (mode === 'edit' && impactFocus) {
           setFormData({
               focus: impactFocus.focus || '',
           });
       }
   }, [mode, impactFocus]);

   // mutations
   const {isPending: isAddingFocus, mutate: addFocus} = useAddRiskImpactFocus({onSuccess, onError, onSettled});
   const {isPending: isUpdatingFocus, mutate: updateFocus} = useUpdateRiskImpactFocus({onSuccess, onError, onSettled});

   const queryClient = useQueryClient();
   const dispatchMessage = useDispatchMessage();
   useEffect(() => {
       let text = isAddingFocus ? 'Adding new risk impact focus...' : 'Updating risk impact focus...';
       (isAddingFocus || isUpdatingFocus) && dispatchMessage('processing', text);
   }, [isAddingFocus, isUpdatingFocus]);

   async function onSuccess(data) {
       await queryClient.invalidateQueries({queryKey: ['risks', 'impact-focii']});
       await queryClient.invalidateQueries({queryKey: ['risks', 'impact-definitions']});
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
       mode === 'add' && addFocus({data: formData});
       mode === 'edit' && updateFocus({id: focusId, data: formData});
   }

   let content;

   if (isLoading) content = <div>Loading</div>
   else if (error) content = <div>error</div>
   else {
       content = (
        <>
            <Field {...{name: 'focus', label: 'Focus', placeholder: 'Enter Impact Focus', value: impactFocus, onChange: handleChange}} />
            <hr className="border border-red-[#CCC]" />
            <div className="flex gap-6">
                <FormCancelButton text={'Discard'} onClick={onRemoveModal} />
                <FormProceedButton text={'Save'} disabled={isAddingFocus || isUpdatingFocus} onClick={handleSave} />
            </div>
        </>
       );
   }

    return (
        <div className="bg-white border border-[#E2E2E2] rounded-2xl w-[500px] p-6">
            <div className="flex flex-col gap-6">
                <header className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">Impact Focus</h4>
                    <CloseButton onClose={onRemoveModal} />
                </header>
                {content}
            </div>
        </div>
    );
}