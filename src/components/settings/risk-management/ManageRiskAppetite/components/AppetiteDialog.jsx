import { useEffect, useState } from "react";
import { FormCancelButton, FormProceedButton } from "../../../../partials/buttons/FormButtons/FormButtons";
import { CKEField, Field } from "../../../../partials/Elements/Elements";
import { CloseButton } from "../../components/Buttons";
import SelectDropdown from "../../../../partials/dropdowns/SelectDropdown/SelectDropdown";
import { reportingFrequenciesOptions, riskAppetiteOptions, useAddRiskAppetite, useUpdateRiskAppetite } from "../../../../../queries/risks/risk-appetites";
import { usersOptions } from "../../../../../queries/users-queries";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";
import { riskCategoriesOptions } from "../../../../../queries/risks/risk-categories";
import { riskBoundariesOptions } from "../../../../../queries/risks/risk-boundaries";

export default function RiskAppetiteDialog({context, onRemoveModal}) {
    const [isFormPopulated, setIsFormPopulated] = useState(false);
    const [formData, setFormData] = useState({
        category_id: '',
        appetite_statement: '',
        risk_boundary_id: '',
        acceptable_level: '',
        acceptable_frequency_id: '',
        trigger: '',
        trigger_frequency_id: '',
        applicable_year:'',
        reporting_frequency_id:'',
        owner_id: '',
        control_measures:'',
        mitigation_plan:'',
        note: '',
        evidence:'',
        approved_by:'',
        date_approved:'',
    });
    const {mode, id: appetiteId = null} = context;

    const formMode = mode === 'edit' || mode === 'add';

    // queries
    const [riskAppetiteQuery, riskCategoriesQuery, riskBoundariesQuery, frequenciesQuery, usersQuery] = useQueries({
        queries: [riskAppetiteOptions(appetiteId), riskCategoriesOptions({enabled: formMode}), riskBoundariesOptions({enabled: formMode}), reportingFrequenciesOptions({enabled: formMode}), usersOptions({enabled: formMode})]
    });

    // populate formdata when in edit mode
    useEffect(() => {
        const appetite = riskAppetiteQuery.data;
        if (mode === 'edit' && appetite) {
            const dateApprovedParts = appetite.date_approved?.split('-') || '';
            setFormData({
                category_id: appetite.category?.id || '',
                appetite_statement: appetite.risk_appetite_statement || '',
                risk_boundary_id: appetite.boundary?.id || '',
                acceptable_level: appetite.acceptable_level || '',
                acceptable_frequency_id: appetite.acceptable_frequency?.id || '',
                trigger: appetite.trigger || '',
                trigger_frequency_id: appetite.trigger_frequency?.id || '',
                applicable_year: appetite.applicable_year || '',
                reporting_frequency_id: appetite.reporting_frequency?.id || '',
                owner_id: appetite.owner?.id || '',
                control_measures: appetite.control_measures || '',
                mitigation_plan: appetite.mitigation_plan || '',
                note: appetite.risk_appetite_note || '',
                evidence:'',
                approved_by: appetite.approved_by?.id || '',
                date_approved: dateApprovedParts ? `${dateApprovedParts[2]}-${dateApprovedParts[1]}-${dateApprovedParts[0]}` : '',
            });
            setIsFormPopulated(true);
        }
    }, [mode, riskAppetiteQuery.data]);

    // mutations
    const {isPending: isAddingAppetite, mutate: addAppetite} = useAddRiskAppetite({onSuccess, onError, onSettled});
    const {isPending: isUpdatingAppetite, mutate: updateAppetite} = useUpdateRiskAppetite({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingAppetite ? 'Adding Risk Appetite' : 'Updating Risk Appetite';
        (isAddingAppetite || isUpdatingAppetite) && dispatchMessage('processing', text);
    }, [isAddingAppetite, isUpdatingAppetite]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', 'appetites']});
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
        mode === 'add' && addAppetite({data: formData});
        mode === 'edit' && updateAppetite({id: appetiteId, data: formData});
    }

    let content;
    
    const isLoading = riskAppetiteQuery.isLoading || riskCategoriesQuery.isLoading || riskBoundariesQuery.isLoading || frequenciesQuery.isLoading || usersQuery.isLoading || (mode === 'edit' && !isFormPopulated);
    const error = riskAppetiteQuery.error || riskCategoriesQuery.error || riskBoundariesQuery.error || frequenciesQuery.error || usersQuery.error;
    
    if (isLoading) content = <div>Loading</div>
    else if (error) content = <div>error</div>
    else {
        const appetite = mode === 'view' && riskAppetiteQuery.data;
        const categories = mode !== 'view' && riskCategoriesQuery.data.map(c => ({id: c.id, text: c.category}));
        const boundaries = mode !== 'view' && riskBoundariesQuery.data;
        const frequencies = mode !== 'view' && frequenciesQuery.data.map(f => ({id: f.id, text: f.name}));
        const users = mode !== 'view' && usersQuery.data.map(u => ({id: u.user_id, text: (!u.firstname || !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`}));

        content = (mode === 'edit' && isFormPopulated) || mode === 'add' ?
            <>
                <div className="flex flex-col gap-3">
                    <CategoriesDropdown categories={categories} selected={formData.category_id} onSelect={handleChange} />
                    <CKEField {...{name: 'appetite_statement', value: formData.appetite_statement, onChange: handleChange, label: 'Risk Appetite Statement'}} />
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex flex-col gap-6">
                        <p className="font-medium">Risk Boundary</p>
                        <div className="flex gap-1">
                            {
                                boundaries.map(boundary => {
                                    return <BoundaryButton key={boundary.id} boundary={boundary} isSelected={formData.risk_boundary_id === boundary.id} onSelect={handleChange} />
                                })
                            }
                        </div>
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex gap-6">
                        <Field {...{type: 'number', name: 'acceptable_level', label: 'Acceptable Level', value: formData.acceptable_level, onChange: handleChange}} />
                        <FrequenciesDropdown name={'acceptable_frequency_id'} label={'Acceptable Frequency'} frequencies={frequencies} selected={formData.acceptable_frequency_id} onSelect={handleChange} />
                    </div>
                    <div className="flex gap-6">
                        <Field {...{type: 'number', name: 'trigger', label: 'Trigger', value: formData.trigger, onChange: handleChange}} />
                        <FrequenciesDropdown name={'trigger_frequency_id'} label={'Trigger Frequency'} frequencies={frequencies} selected={formData.trigger_frequency_id} onSelect={handleChange} />
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex gap-6">
                        <Field {...{type: 'number', name: 'applicableYear', label: 'Applicable Year', value: formData.applicable_year, onChange: handleChange}} />
                        <FrequenciesDropdown name={'reporting_frequency_id'} label={'Reporting Frequency'} frequencies={frequencies} selected={formData.reporting_frequency_id} onSelect={handleChange} />
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="w-1/2">
                        <OwnersDropdown users={users} selected={formData.owner} onSelect={handleChange} />
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <CKEField {...{name: 'control_measures', value: formData.control_measures, onChange: handleChange, label: 'Control Measures'}} />
                    <hr className="border border-red-[#CCC]" />
                    <CKEField {...{name: 'mitigation_plan', value: formData.mitigation_plan, onChange: handleChange, label: 'Mitigation Plan'}} />
                    <hr className="border border-red-[#CCC]" />
                    <CKEField {...{name: 'note', value: formData.note, onChange: handleChange, label: 'Note'}} />
                    <hr className="border border-red-[#CCC]" />
                    <hr className="border border-red-[#CCC]" />
                    <Field {...{name: 'evidence', label: 'Evidence', value: formData.evidence, onChange: handleChange}} />
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex gap-6">
                        <OwnersDropdown users={users} selected={formData.owner_id} onSelect={handleChange} />
                        <Field {...{type: 'date', name: 'date_approved', label: 'Date Approved', value: formData.date_approved, onChange: handleChange}} />
                    </div>
                </div>
                <hr className="border border-red-[#CCC]" />
                <div className="flex gap-6">
                    <FormCancelButton text={'Discard'} onClick={onRemoveModal} />
                    <FormProceedButton disabled={isAddingAppetite || isUpdatingAppetite} text={'Save'} onClick={handleSave} />
                </div>
            </> :
            <>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Category Name</span>
                        <p>{appetite.category.name}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Risk Appetite Statement</span>
                        <p>{appetite.risk_appetite_statement}</p>
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Risk Boundary</span>
                        <div className="w-1/3 flex">
                            <BoundaryButton boundary={appetite.boundary} isSelected={true} />
                        </div>
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex gap-6">
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="font-medium">Acceptable Level</span>
                            <p>{appetite.acceptable_level}</p>
                        </div>
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="font-medium">Acceptable Frequency</span>
                            <p>{appetite.acceptable_frequency.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="font-medium">Trigger</span>
                            <p>{appetite.trigger}</p>
                        </div>
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="font-medium">Trigger Frequency</span>
                            <p>{appetite.trigger_frequency.name}</p>
                        </div>
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex gap-6">
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="font-medium">Applicable Year</span>
                            <p>{appetite.applicable_year}</p>
                        </div>
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="font-medium">Reporting Frequency</span>
                            <p>{appetite.reporting_frequency.name}</p>
                        </div>
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Owner</span>
                        <p>{appetite.owner.name}</p>
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Control Measures</span>
                        <p>{appetite.control_measures}</p>
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Mitigation Plan</span>
                        <p>{appetite.mitigation_plan}</p>
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Note</span>
                        <p>{appetite.risk_appetite_note}</p>
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Evidence</span>
                        <p>{appetite.evidence}</p>
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex gap-6">
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="font-medium">Approved By</span>
                            <p>{appetite.approved_by.name}</p>
                        </div>
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="font-medium">Date Approved</span>
                            <p>{appetite.date_approved}</p>
                        </div>
                    </div>
                </div>
            </>
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="bg-white border border-[#E2E2E2] rounded-2xl w-[800px] p-6">
                <div className="flex flex-col gap-6">
                    <header className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg">Risk Appetite By Categories</h4>
                        <CloseButton onClose={onRemoveModal} />
                    </header>
                    <div className="flex gap-6 flex-wrap">
                        <Chip text={'Posted By: User Name'} />
                        <Chip text={'Posted date: 32/04/2024'} />
                        <Chip text={'Last Updated: 32/04/2024'} />
                    </div>
                    {content}
                </div>
            </div>
        </div>
    );
}

function Chip({text}) {
    return (
        <span className="text-[#407BF0] bg-[#407BF0]/20 text-sm font-medium py-1 px-2 rounded-full">{text}</span>
    );
}

function CategoriesDropdown({categories, selected, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <SelectDropdown name={'category_id'} selected={selected} items={categories} placeholder={'Category Name'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} onSelect={onSelect} />
    );
}

function OwnersDropdown({users, selected, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <SelectDropdown name={'owner_id'} label={'Owner'} selected={selected} items={users} placeholder={'Select Owner'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} onSelect={onSelect} />
    );
}

function FrequenciesDropdown({name, label, frequencies, selected, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <SelectDropdown name={name} selected={selected} items={frequencies} label={label} placeholder={'Select Frequency'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} onSelect={onSelect} />
    );
}

function BoundaryButton({boundary, isSelected, onSelect}) {
    return (
        <button onClick={() => onSelect({target: {name: 'risk_boundary_id', value: boundary.id}})} type="button" className={`max-w-52 flex-1 h-16 grid place-items-center text-lg ${isSelected ? 'bg-text-pink text-white' : 'bg-[#D9D9D9] text-black'}`}>{boundary.description}</button>
    );
}