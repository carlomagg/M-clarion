import { useEffect, useState } from "react";
import { FormCancelButton, FormProceedButton } from "../../../../partials/buttons/FormButtons/FormButtons";
import { Field } from "../../../../partials/Elements/Elements";
import { CloseButton } from "../../components/Buttons";
import SelectDropdown from "../../../../partials/dropdowns/SelectDropdown/SelectDropdown";
import { riskClassOptions, useAddRiskClass, useUpdateRiskClass } from "../../../../../queries/risks/risk-classes";
import { riskCategoriesOptions } from "../../../../../queries/risks/risk-categories";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";

export default function RiskClassDialog({context, onRemoveModal}) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
    });
    const {mode, id: classId = null} = context;

    // queries
    const [classQuery, riskCategoriesQuery] = useQueries({
        queries: [riskClassOptions(classId, {enabled: !!classId}), riskCategoriesOptions()]
    });

    // populate formdata when in edit mode
    useEffect(() => {
        const classDetails = classQuery.data;
        if (mode === 'edit' && classDetails) {
            setFormData({
                name: classDetails.class_name,
                description: classDetails.description,
                category_id: classDetails.category_id
            });
        }
    }, [mode, classQuery.data]);

    // mutations
    const {isPending: isAddingClass, mutate: addClass} = useAddRiskClass({onSuccess, onError, onSettled});
    const {isPending: isUpdatingClass, mutate: updateClass} = useUpdateRiskClass({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingClass ? 'Adding new risk class...' : 'Updating risk class...';
        (isAddingClass || isUpdatingClass) && dispatchMessage('processing', text);
    }, [isAddingClass, isUpdatingClass]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', 'classes']});
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
        mode === 'add' && addClass({data: formData});
        mode === 'edit' && updateClass({id: classId, data: formData});
    }

    let content;
    
    const isLoading = classQuery.isLoading || riskCategoriesQuery.isLoading;
    const error = classQuery.error || riskCategoriesQuery.error;

    if (isLoading) content = <div>Loading</div>
    else if (error) content = <div>error</div>
    else {
        const riskClass = mode === 'view' && classQuery.data;
        const categories = riskCategoriesQuery.data.map(c => ({id: c.id, text: c.name}));

        content = mode === 'edit' || mode === 'add' ?
            <>
                <div className="flex flex-col gap-3">
                    <Field {...{name: 'name', label: 'Class Name', placeholder: 'Enter name of class', value: formData.name, onChange: handleChange}} />
                    <Field {...{type: 'textbox', name: 'description', label: 'Description', placeholder: 'Enter description', value: formData.description, onChange: handleChange}} />
                    <CategoriesDropdown categories={categories} selected={formData.category_id} onSelect={handleChange} />
                </div>
                <hr className="border border-red-[#CCC]" />
                <div className="flex gap-6">
                    <FormCancelButton text={'Discard'} onClick={onRemoveModal} />
                    <FormProceedButton disabled={isAddingClass || isUpdatingClass} text={'Save'} onClick={handleSave} />
                </div>
            </> :
            <>
                <div className="flex flex-col gap-3">
                    <span className="font-medium mb-2 block">Class Name</span>
                    <p>{riskClass.class_name}</p>
                </div>
                <div className="flex flex-col gap-3">
                    <span className="font-medium mb-2 block">Description</span>
                    <p>{riskClass.description}</p>
                </div>
                <div className="flex flex-col gap-3">
                    <span className="font-medium mb-2 block">Category</span>
                    <p>{riskClass.category_name}</p>
                </div>
            </>
    }

    return (
        <div className="bg-white border border-[#E2E2E2] rounded-2xl w-[500px] p-6">
            <div className="flex flex-col gap-6">
                <header className="flex justify-between items-center">
                    <h4 className="text-lg text-gray-600">Risk Class</h4>
                    <CloseButton onClose={onRemoveModal} />
                </header>
                {content}
            </div>
        </div>
    );
}

function CategoriesDropdown({categories, selected, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <SelectDropdown name={'category_id'} selected={selected} items={categories} placeholder={'Risk Category'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} onSelect={onSelect} />
    );
}