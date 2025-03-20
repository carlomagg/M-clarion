import { useEffect, useState } from "react";
import { FormCancelButton, FormProceedButton } from "../../../../partials/buttons/FormButtons/FormButtons";
import { Field } from "../../../../partials/Elements/Elements";
import { CloseButton } from "../../components/Buttons";
import AddNewButton from "../../../../partials/buttons/AddNewButton/AddNewButton";
import { SelectionModal } from "../../../../partials/SelectionModal";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { SelectedItemsList } from "../../../../partials/SelectedItemsList";
import { riskCategoryOptions, useAddRiskCategory, useUpdateRiskCategory } from "../../../../../queries/risks/risk-categories";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";
import { riskClassesOptions } from "../../../../../queries/risks/risk-classes";

export default function RiskCategoryDialog({context, onRemoveModal}) {
    const [showClassesSelector, setShowClassesSelector] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        class_ids: ''
    });
    const {mode, id: categoryId = null} = context;

    // queries
    const [categoryQuery, riskClassesQuery] = useQueries({
        queries: [riskCategoryOptions(categoryId, {enabled: !!categoryId}), riskClassesOptions()]
    });

    // populate formdata when in edit mode
    useEffect(() => {
        const category = categoryQuery.data;
        if (mode === 'edit' && category) {
            setFormData({
                name: category.name,
                description: category.description,
                class_ids: category.classes.map(c => c.id)
            });
        }
    }, [mode, categoryQuery.data]);

    // mutations
    const {isPending: isAddingCategory, mutate: addCategory} = useAddRiskCategory({onSuccess, onError, onSettled});
    const {isPending: isUpdatingCategory, mutate: updateCategory} = useUpdateRiskCategory({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingCategory ? 'Adding Risk Category' : 'Updating Risk Category';
        (isAddingCategory || isUpdatingCategory) && dispatchMessage('processing', text);
    }, [isAddingCategory, isUpdatingCategory]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', 'categories']});
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
        mode === 'add' && addCategory({data: formData});
        mode === 'edit' && updateCategory({id: categoryId, data: formData});
    }

    let content;
    
    const isLoading = categoryQuery.isLoading || riskClassesQuery.isLoading;
    const error = categoryQuery.error || riskClassesQuery.error;
    
    if (isLoading) content = <div>Loading</div>
    else if (error) content = <div>error</div>
    else {
        const category = mode === 'view' && categoryQuery.data;
        const classes = riskClassesQuery.data.map(c => ({id: c.class_id, name: c.class_name}));
        const selectedClasses = classes.filter(c => formData.class_ids.includes(c.id));

        content =
            <>
                {
                    showClassesSelector &&
                    <SelectionModal 
                        items={classes}
                        selectedIds={formData.class_ids}
                        texts={{heading: 'Select Classes', placeholder: 'Search Classes'}}
                        onChange={(isChecked, classId) => {
                            if (isChecked) {
                                setFormData({...formData, class_ids: [...formData.class_ids, classId]});
                            } else {
                                setFormData({
                                    ...formData,
                                    class_ids: formData.class_ids.filter(id => id !== classId)
                                });
                            }
                        }}
                        onRemoveModal={() => setShowClassesSelector(false)} />
                }
                {
                    mode === 'edit' || mode === 'add' ?
                    <>
                        <div className="flex flex-col gap-3">
                            <Field {...{name: 'name', label: 'Category', placeholder: 'Enter name of category', value: formData.name, onChange: handleChange}} />
                            <Field {...{type: 'textbox', name: 'description', label: 'Description', placeholder: 'Enter description', value: formData.description, onChange: handleChange}} />
                            <hr className="border border-red-[#CCC]" />
                            <div className='flex flex-col gap-3 flex-1'>
                                <h4 className='font-medium'>Classes</h4>
                                <SelectedItemsList
                                    list={selectedClasses}
                                    editable={true}
                                    onRemove={c => {
                                        setFormData({
                                            ...formData,
                                            class_ids: formData.class_ids.filter(id => id !== c.id)
                                        });
                                    }}
                                />
                                <AddNewButton small={true} text={"Add Class"} onClick={() => setShowClassesSelector(true)} />
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <FormCancelButton text={'Discard'} onClick={onRemoveModal} />
                            <FormProceedButton disabled={isAddingCategory || isUpdatingCategory} text={'Save'} onClick={handleSave} />
                        </div>
                    </> :
                    <>
                        <div className="flex flex-col gap-3">
                            <span className="font-medium">Category name</span>
                            <p>{category.name}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="font-medium">Description</span>
                            <p>{category.description}</p>
                        </div>
                        <hr className="border border-red-[#CCC]" />
                        <div className="flex gap-4 flex-wrap">
                            {
                                category.classes.map(cl => {
                                    return <span key={cl.id} className="py-1 px-2 border border-[#5E5E5E] rounded-full text-sm font-medium">{cl.name}</span>
                                })
                            }
                        </div>
                    </>
                }
            </>
    }

    return (
        <div className="bg-white border border-[#E2E2E2] rounded-2xl w-[500px] p-6">
            <div className="flex flex-col gap-6">
                <header className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">Risk Category</h4>
                    <CloseButton onClose={onRemoveModal} />
                </header>
                {content}
            </div>
        </div>
    );
}