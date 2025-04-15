import { useEffect, useState } from 'react';
import { FormCancelButton, FormCustomButton, FormProceedButton } from '../../../buttons/FormButtons/FormButtons';
import { CKEField, Field } from '../../../Elements/Elements';
import styles from './RiskIdentificationForm.module.css';
import SelectDropdown from '../../../dropdowns/SelectDropdown/SelectDropdown';
import AddNewButton from '../../../buttons/AddNewButton/AddNewButton';
import { SelectionModal } from '../../../SelectionModal';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { identificationToolsOptions, linkedResourcesOptions, riskAreasOptions, riskIdentificationOptions, riskTriggersOptions, useAddRisk, useSaveExistingRiskIdentificationToDraft, useSaveNewRiskIdentificationToDraft, useUpdateRiskIdentification } from '../../../../../queries/risks/risk-queries';
import { SelectedItemsList } from '../../../SelectedItemsList';
import { usersOptions } from '../../../../../queries/users-queries';
import useDispatchMessage from '../../../../../hooks/useDispatchMessage';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { riskCategoriesOptions } from '../../../../../queries/risks/risk-categories';
import { riskClassesOptions } from '../../../../../queries/risks/risk-classes';
import AISuggestionBox from '../../../AISuggestion/AISuggestion';
import CKEAIField from '../../../CKEAIField';
import useRiskDescriptionSuggestion from '../../../../../queries/ai/risks/risk-description';
import useRiskTagsSuggestion from '../../../../../queries/ai/risks/risk-tags';

function RiskIdentificationForm({mode, toggleAIAssistance, setRiskName, setRiskCategory, setRiskClass}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const params = useParams();
    const riskID = mode === 'update' ? params.id : searchParams.get('id');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        class_id: '',
        date: '',
        description: '',
        tags: '',
        identification_tool_ids: [],
        owner_id: '',
        note: '',
        link_area_id: '',
        risk_trigger_ids: [],
        linked_resources_ids: []
    });
    const [showModal, setShowModal] = useState(null);

    // queries
    const [riskIdentificationQuery, identificationToolsQuery, linkedResourcesQuery, riskTriggersQuery, riskCategoriesQuery, riskClassesQuery, riskAreasQuery, usersQuery] = useQueries({
        queries: [riskIdentificationOptions(riskID, {enabled: !!riskID}), identificationToolsOptions(), linkedResourcesOptions(), riskTriggersOptions(), riskCategoriesOptions(), riskClassesOptions(), riskAreasOptions(), usersOptions()]
    })

    const selectedCategory = riskCategoriesQuery.data?.find(cat => cat.id === formData.category_id)?.name || '';
    const selectedClass = riskClassesQuery.data?.find(c => c.class_id === formData.class_id)?.class_name || '';

    // sync risk name, category and class states declared in containing component
    useEffect(() => {
        setRiskName(formData.name);
    }, [formData.name]);
    useEffect(() => {
        setRiskCategory(selectedCategory);
    }, [selectedCategory]);
    useEffect(() => {
        setRiskClass(selectedClass);
    }, [selectedClass]);

    // update form data with risk ID details if it exists
    useEffect(() => {
        if (riskIdentificationQuery.data) {
            const details = riskIdentificationQuery.data;
            const dateParts = String(details.date_identified).split('-');
            const formattedDateString = dateParts ? dateParts[2]+'-'+dateParts[1]+'-'+dateParts[0] : null;
            setFormData({
                name: details.risk_name || '',
                category_id: details.Category?.id || '',
                class_id: details.Class?.id || '',
                date: formattedDateString || '',
                description: details.description || '',
                tags: details.risk_tags || '',
                identification_tool_ids: details.identification_tool.map(i => i.id),
                owner_id: details.risk_owner?.id || '',
                note: details.risk_note || '',
                link_area_id: details.risk_area?.id || '',
                risk_trigger_ids: details.risk_triggers.map(t => t.id),
                linked_resources_ids: details.linked_resources.map(l => l.id)
            });
        }
    }, [riskIdentificationQuery.data])

    // mutations
    const {isPending: isAddingRisk, mutate: addRisk} = useAddRisk({onSuccess, onError, onSettled});
    const {isPending: isUpdatingRisk, mutate: updateRisk} = useUpdateRiskIdentification(riskID, {onSuccess, onError, onSettled});
    const {isPending: isSavingNewToDraft, mutate: saveNewRiskToDraft} = useSaveNewRiskIdentificationToDraft({onDraftSuccess, onError});
    const {isPending: isSavingExistingToDraft, mutate: saveExistingRiskToDraft} = useSaveExistingRiskIdentificationToDraft(riskID, {onSuccess: onDraftSuccess, onError});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingRisk ? 'Adding new risk...' : (isUpdatingRisk ? 'Updating risk...' : ((isSavingNewToDraft || isSavingExistingToDraft) && 'Saving risk to draft...'));
        (isAddingRisk || isUpdatingRisk || isSavingNewToDraft || isSavingExistingToDraft) && dispatchMessage('processing', text);
    }, [isAddingRisk, isUpdatingRisk, isSavingNewToDraft, isSavingExistingToDraft]);

    async function onSuccess(data) {
        if (mode === 'update') await queryClient.invalidateQueries({queryKey: ['risks', riskID, 'identification']});
        else await queryClient.invalidateQueries({queryKey: ['risks']});
        dispatchMessage('success', data.message);
    }
    async function onDraftSuccess(data) {
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // set newly created risk id and proceed to next step if successful
        if (!error && !riskID) {
            // will only navigate to next step if risk was just added and didn't exist before
            const riskID = data.data[0].risk_id;
            navigate(`/risks/register/analysis?id=${riskID}`);
        }
    }

    function handleChange(e) {
        setFormData({
            ...formData, [e.target.name]: e.target.value
        })
    }

    function handleNextClicked() {
        (!!riskID ? updateRisk : addRisk)({data: formData});
    }

    function handleSaveToDraft() {
        (!!riskID ? saveExistingRiskToDraft : saveNewRiskToDraft)({data: formData});
    }

    const isLoading = (riskID && riskIdentificationQuery.isLoading) || identificationToolsQuery.isLoading || linkedResourcesQuery.isLoading || riskTriggersQuery.isLoading || riskCategoriesQuery.isLoading || riskClassesQuery.isLoading || riskAreasQuery.isLoading || usersQuery.isLoading;

    const error = identificationToolsQuery.error || linkedResourcesQuery.error || riskTriggersQuery.error || riskCategoriesQuery.error || riskClassesQuery.error || riskAreasQuery.error || usersQuery.error;

    const riskIdentificationError = riskID && riskIdentificationQuery.error;

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (error || (riskIdentificationError && riskIdentificationError.response.status !== 404)) {
        // error exists and it is not a 'risk not found' error
        return <div>error</div>
    }

    const identificationTools = identificationToolsQuery.data;
    const linkedResources = linkedResourcesQuery.data;
    const riskTriggers = riskTriggersQuery.data;
    const riskCategories = riskCategoriesQuery.data.map(cat => ({id: cat.id, text: cat.name}));
    const riskClasses = riskClassesQuery.data.map(cla => ({id: cla.class_id, text: cla.class_name}));
    const riskAreas = riskAreasQuery.data.map(area => ({id: area.id, text: area.name}));
    const users = usersQuery.data.map(u => ({id: u.user_id, text: (!u.firstname || !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`}));

    const selectedIdentificationTools = identificationTools.filter(tool => formData.identification_tool_ids.includes(tool.id));

    const selectedLinkedResources = linkedResources.filter(resource => formData.linked_resources_ids.includes(resource.id)) || []; 

    const selectedRiskTriggers = riskTriggers.filter(trigger => formData.risk_trigger_ids.includes(trigger.id)) || []; 

    // const selectedCategory = riskCategoriesQuery.data?.find(cat => cat.id === formData.category_id)?.category || '';
    // const selectedClass = riskClassesQuery.data?.find(c => c.class_id === formData.class_id)?.class_name || '';

    return (
        <form className='bg-white rounded-lg border border-[#CCC] p-6 flex flex-col gap-6'>
            {
                showModal && <SelectionModal
                    items={showModal['type'] === 'tools' ? identificationTools : (showModal['type'] === 'resources' ? linkedResources : (showModal['type'] === 'triggers' ? riskTriggers : []))}
                    texts={showModal.texts}
                    selectedIds={showModal['type'] === 'tools' ? formData.identification_tool_ids : (showModal['type'] === 'resources' ? formData.linked_resources_ids : (showModal['type'] === 'triggers' ? formData.risk_trigger_ids : []))}
                    onChange={(isChecked, itemId) => {
                        const type = showModal['type'];
                        const fieldNames = {
                            'tools': 'identification_tool_ids',
                            'resources': 'linked_resources_ids',
                            'triggers': 'risk_trigger_ids'
                        };

                        if (isChecked) {
                            setFormData({...formData, [fieldNames[type]]: [...formData[fieldNames[type]], itemId]});
                        } else {
                            setFormData({...formData, [fieldNames[type]]: formData[fieldNames[type]].filter(id => id !== itemId)});
                        }
                    }}
                    onRemoveModal={() => setShowModal(null)} />
            }
            <div className='flex flex-col gap-9'>
                <div>
                    {/* <h3 className='text-lg font-semibold text-[#727272]'>Risk ID:</h3> */}
                    <div className='mt-3 flex flex-col gap-6'>
                        <Field {...{name: 'name', label: 'Name', placeholder: 'Enter risk name', value: formData.name, onChange: handleChange}} />
                        <div className='flex gap-6'>
                            <RiskCategoryDropdown categories={riskCategories} selected={formData.category_id} onChange={handleChange} />
                            <RiskClassDropdown classes={riskClasses} selected={formData.class_id} onChange={handleChange} />
                            <Field {...{type: 'date', label: 'Date Identified', name: 'date', value: formData.date, onChange: handleChange}} />
                        </div>
                        <label className='flex gap-2 items-center'>
                            <input type="checkbox" onChange={toggleAIAssistance} />
                            <span>Allow AI Assistance</span>
                        </label>
                        <RiskDescriptionField value={formData.description} onChange={handleChange} {...{riskName: formData.name, selectedCategory, selectedClass}} />
                        <TagsField value={formData.tags} onChange={handleChange} {...{riskName: formData.name, selectedCategory, selectedClass}} />
                        <div className='flex flex-col gap-3'>
                            <h4 className='font-medium'>Identification Tools</h4>
                            <SelectedItemsList 
                                list={selectedIdentificationTools}
                                editable={true}
                                onRemove={(tool) => setFormData({...formData, identification_tool_ids: formData.identification_tool_ids.filter(id => id !== tool.id)})} />
                            <div className=''>
                                <AddNewButton small={true} text={"Add Identification Tool"} onClick={() => setShowModal({type: 'tools', texts: {heading: 'Select Identification Tools', placeholder: 'Search Tools'}})} />
                            </div>
                        </div>
                        <div className='w-1/2'>
                            <OwnerDropdown owners={users} selected={formData.owner_id} onChange={handleChange} />
                        </div>
                        <CKEField {...{name: 'note', label: 'Note', value: formData.note, onChange: handleChange}} />
                    </div>
                </div>
                <div className='flex flex-col gap-6'>
                    <h3 className='text-lg font-medium'>Linked Areas</h3>
                    <div className='w-1/2'>
                        <AreaDropdown areas={riskAreas} selected={formData.link_area_id} onChange={handleChange} />
                    </div>
                    <div className='flex gap-6'>
                        <div className='flex flex-col gap-3 flex-1'>
                            <h4 className='font-medium'>Linked Resources</h4>
                            <SelectedItemsList 
                                list={selectedLinkedResources}
                                editable={true}
                                onRemove={(resource) => setFormData({...formData, linked_resources_ids: formData.linked_resources_ids.filter(id => id !== resource.id)})} />
                            <div className=''>
                                <AddNewButton small={true} text={"Add Linked Resources"} onClick={() => setShowModal({type: 'resources', texts: {heading: 'Select Linked Resources', placeholder: 'Search Resources'}})} />
                            </div>
                        </div>
                        <div className='flex flex-col gap-3 flex-1'>
                            <h4 className='font-medium'>Risk Triggers</h4>
                            <SelectedItemsList 
                                list={selectedRiskTriggers}
                                editable={true}
                                onRemove={(trigger) => setFormData({...formData, risk_trigger_ids: formData.risk_trigger_ids.filter(id => id !== trigger.id)})} />
                            <div className=''>
                                <AddNewButton small={true} text={"Add Risk Triggers"} onClick={() => setShowModal({type: 'triggers', texts: {heading: 'Select Risk Triggers', placeholder: 'Search Risk Triggers'}})} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex gap-3'>
                <FormCancelButton text={'Discard'} />
                <FormCustomButton disabled={isSavingNewToDraft || isSavingExistingToDraft} text={(isSavingNewToDraft || isSavingExistingToDraft) ? 'Saving To Draft' : 'Save To Draft'} onClick={handleSaveToDraft} />
                <FormProceedButton disabled={isAddingRisk || isUpdatingRisk} text={riskID ? (isUpdatingRisk ? 'Saving...' : 'Save') : (isAddingRisk ? 'Adding...' : 'Next')} onClick={handleNextClicked} />
            </div>
        </form>
    )
}

function RiskDescriptionField({value, onChange, riskName, selectedCategory, selectedClass}) {
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [aiError, setAiError] = useState(null);
    const [promptSuggestion, setPromptSuggestion] = useState('');

    const {isPending, mutate} = useRiskDescriptionSuggestion({
        onSuccess: (data) => {setAiSuggestion(data)},
        onError: (error) => setAiError(error.response.data.error),
    });

    useEffect(() => {
        setAiSuggestion(null);
        setAiError(null);
    }, [riskName, selectedCategory, selectedClass]);

    function fetchRiskDescriptionSuggestion() {
        if (riskName === '' || selectedCategory === '' || selectedClass === '') {
            setAiError('The risk name, category and class must be specified.');
            return;
        }
        mutate({risk: riskName, category: selectedCategory, risk_class: selectedClass, suggestion: promptSuggestion});
    }

    return (
        <CKEAIField {...{name: 'description', label: 'Description', value, onChange, error: null}}>
            <AISuggestionBox style={{position: 'absolute', bottom: '1rem', right: '1rem'}} onFetch={fetchRiskDescriptionSuggestion} isFetching={isPending} error={aiError} content={aiSuggestion} suggestion={promptSuggestion} onSuggestionChange={(e) => setPromptSuggestion(e.target.value)} />
        </CKEAIField>
    );
}

function TagsField({value, onChange, riskName, selectedCategory, selectedClass}) {
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [aiError, setAiError] = useState(null);
    const [promptSuggestion, setPromptSuggestion] = useState('');

    const {isPending, mutate} = useRiskTagsSuggestion({
        onSuccess: (data) => {setAiSuggestion(data)},
        onError: (error) => setAiError(error.response.data.error),
    });

    useEffect(() => {
        setAiSuggestion(null);
        setAiError(null);
    }, [riskName, selectedCategory, selectedClass]);

    function fetchRiskTagsSuggestion() {
        if (riskName === '' || selectedCategory === '' || selectedClass === '') {
            setAiError('The risk name, category and class must be specified.');
            return;
        }
        mutate({risk: riskName, category: selectedCategory, risk_class: selectedClass, suggestion: promptSuggestion});
    }

    return (
        <div className='relative w-1/2'>
            <Field {...{name: 'tags', label: 'Tags', placeholder: 'Enter risk tags separated by commas (,)', value, onChange }} />
            <AISuggestionBox style={{position: 'absolute', right: '1rem', top: '55%'}} {...{onFetch: fetchRiskTagsSuggestion, isFetching: isPending, error: aiError, content: aiSuggestion, suggestion: promptSuggestion, onSuggestionChange: (e) => setPromptSuggestion(e.target.value)}} />
        </div>
    );
}

function RiskCategoryDropdown({categories, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Category'} placeholder={'Select risk category'} items={categories} name={'category_id'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

function RiskClassDropdown({classes, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Class'} placeholder={'Select risk class'} items={classes} name={'class_id'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

function OwnerDropdown({owners, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [filterTerm, setFilterTerm] = useState('');

    const filteredOwners = owners.filter(o => new RegExp(filterTerm, 'i').test(o.text));

    return (
        <SelectDropdown label={'Owner'} placeholder={'Select owner'} items={filteredOwners} name={'owner_id'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} filterable={true} filterTerm={filterTerm} setFilterTerm={setFilterTerm} />
    );
}

function AreaDropdown({areas, selected, onChange}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <SelectDropdown label={'Area'} placeholder={'Select primary linked process'} items={areas} name={'link_area_id'} selected={selected} onSelect={onChange} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
    );
}

export default RiskIdentificationForm;