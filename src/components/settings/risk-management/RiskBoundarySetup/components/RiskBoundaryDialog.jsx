import { useEffect, useState } from "react";
import { FormCancelButton, FormProceedButton } from "../../../../partials/buttons/FormButtons/FormButtons";
import { Field } from "../../../../partials/Elements/Elements";
import { CloseButton } from "../../components/Buttons";
import { ColorChip } from "./Elements";
import { riskBoundaryOptions, useAddRiskBoundary, useUpdateRiskBoundary } from "../../../../../queries/risks/risk-boundaries";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";

export default function RiskBoundaryDialog({context, onRemoveModal}) {
    const [isOverlapping, setIsOverLapping] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        lower_bound: '',
        higher_bound: '',
        color: '#000000'
    });

    const {mode, checkOverlap, id: boundaryId = null} = context;

    // queries
    const [boundaryQuery] = useQueries({
        queries: [riskBoundaryOptions(boundaryId, {enabled: !!boundaryId})]
    });

    // populate formdata when in edit mode
    useEffect(() => {
        const boundary = boundaryQuery.data;
        if (mode === 'edit' && boundary) {
            setFormData({
                description: boundary.description || '',
                lower_bound: boundary.lower_bound ?? '',
                higher_bound: boundary.higher_bound || '',
                color: boundary.colour || '#000000'
            });
        }
    }, [mode, boundaryQuery.data]);

    // mutations
    const {isPending: isAddingBoundary, mutate: addBoundary} = useAddRiskBoundary({onSuccess, onError, onSettled});
    const {isPending: isUpdatingBoundary, mutate: updateBoundary} = useUpdateRiskBoundary({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingBoundary ? 'Adding new risk boundary...' : 'Updating risk boundary...';
        (isAddingBoundary || isUpdatingBoundary) && dispatchMessage('processing', text);
    }, [isAddingBoundary, isUpdatingBoundary]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', 'boundaries']});
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
        setIsOverLapping(false);
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    function handleSave() {
        if (checkOverlap(Number(formData.lower_bound), Number(formData.higher_bound), boundaryId)) {
            setIsOverLapping(true);
            return;
        }
        mode === 'add' && addBoundary({data: formData});
        mode === 'edit' && updateBoundary({id: boundaryId, data: formData});
    }

    let content;
    
    const isLoading = boundaryQuery.isLoading;
    const error = boundaryQuery.error;

    if (isLoading) content = <div>Loading</div>
    else if (error) content = <div>error</div>
    else {
        const boundary = mode === 'view' && boundaryQuery.data;

        content = mode === 'edit' || mode === 'add' ?
            <>
                <div className="flex flex-col gap-3">
                    {
                        isOverlapping &&
                        <div className="text-sm text-red-500">Selected boundary overlaps with existing boundary.</div>
                    }
                    <Field {...{name: 'description', label: 'Description', placeholder: 'Enter name of boundary', value: formData.description, onChange: handleChange}} />
                    <div className="flex gap-6">
                        <Field {...{type: 'number', name: 'lower_bound', label: 'Lower Bound', value: formData.lower_bound, onChange: handleChange}} />
                        <Field {...{type: 'number', name: 'higher_bound', label: 'Higher Bound', value: formData.higher_bound, onChange: handleChange}} />
                        <Field {...{type: 'color', name: 'color', label: 'Color', value: formData.color, onChange: handleChange}} />
                    </div>
                </div>
                <hr className="border border-red-[#CCC]" />
                <div className="flex gap-6">
                    <FormCancelButton text={'Discard'} onClick={onRemoveModal} />
                    <FormProceedButton disabled={isAddingBoundary || isUpdatingBoundary} text={'Save'} onClick={handleSave} />
                </div>
            </> :
            <>
                <div className="flex flex-col gap-3">
                    <span className="font-medium">Descripition</span>
                    <p>{boundary.description}</p>
                </div>
                <div className="flex gap-6">
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Lower Bound</span>
                        <p>{boundary.lower_bound}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Higher Bound</span>
                        <p>{boundary.higher_bound}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Color</span>
                        <p className="flex gap-2 items-center">
                            <ColorChip color={boundary.colour} />
                            {boundary.colour}
                        </p>
                    </div>
                </div>
            </>
    }

    return (
        <div className="bg-white border border-[#E2E2E2] rounded-2xl w-[500px] p-6">
            <div className="flex flex-col gap-6">
                <header className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">Risk Boundary</h4>
                    <CloseButton onClose={onRemoveModal} />
                </header>
                {content}
            </div>
        </div>
    );
}