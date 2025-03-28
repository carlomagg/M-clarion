import { useEffect, useRef, useState } from "react";
import { CloseButton, StatusChip } from "./Elements";
import OptionsDropdown from "../../../../dropdowns/OptionsDropdown/OptionsDropdown";
import { createPortal } from "react-dom";
import Modal from "./Modal";
import plusIcon from '../../../../../../assets/icons/plus.svg';
import AddNewButton from "../../../../buttons/AddNewButton/AddNewButton";
import { CKEField, Field } from "../../../../Elements/Elements";
import { SelectedItemsList } from "../../../../SelectedItemsList";
import SelectDropdown from "../../../../dropdowns/SelectDropdown/SelectDropdown";
import { FormCancelButton, FormProceedButton } from "../../../../buttons/FormButtons/FormButtons";
import { riskEventOptions, useAddConsequence, useAddPostMitigation, useAddPreMitigation, useAddRiskEvent, useAddRootCause, useDeleteConsequence, useDeletePostMitigation, useDeletePreMitigation, useDeleteRiskEvent, useDeleteRootCause, useRiskName, useUpdateConsequence, useUpdatePostMitigation, useUpdatePreMitigation, useUpdateRiskEvent, useUpdateRootCause } from "../../../../../../queries/risks/risk-queries";
import { useParams } from "react-router-dom";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { usersOptions } from "../../../../../../queries/users-queries";
import useDispatchMessage from "../../../../../../hooks/useDispatchMessage";

export default function RiskEventsContent({riskEvents}) {
    const [showModal, setShowModal] = useState(false);
    const {id: riskID} = useParams();

    // mutations
    const {isPending, mutate: deleteRiskEvent} = useDeleteRiskEvent({onSuccess, onError});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = 'Deleting Risk Event';
        (isPending) && dispatchMessage('processing', text);
    }, [isPending]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', riskID, 'events']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }

    function createEventOptions(event) {
        const options = [
            {text: 'View Details', type: 'action', action: () => setShowModal({context: {mode: 'view', eventId: event.risk_event_id}})},
            {text: 'Edit', type: 'action', action: () => setShowModal({context: {mode: 'edit', eventId: event.risk_event_id}})},
            {text: 'Delete', type: 'action', action: () => deleteRiskEvent({id: event.risk_event_id})},
        ];
        return options;
    }

    return (
        <div className='space-y-6'>
            {
                showModal &&
                createPortal(
                    <Modal type={'riskEvent'} context={showModal.context} onRemove={() => setShowModal(false)} />,
                    document.body
                )
            }
            <button type="button" onClick={() => setShowModal({context: {mode: 'add'}})} className="text-sm font-medium text-text-pink flex gap-3 items-center">
                <img src={plusIcon} alt="plus icon" />
                Add Risk Event
            </button>
            <RiskEventsTable events={riskEvents} createEventOptions={createEventOptions} />
        </div>
    );
}

function RiskEventsTable({events, createEventOptions}) {
    return (
        <div className='mt-3 overflow-auto p-6 flex flex-col gap-6 rounded-lg border border-[#CCC] text-[#3B3B3B] text-sm'>
            <div className="w-[1024px]">
                <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                    <span className='py-4 flex-[.5_0]'>#</span>
                    <span className='py-4 flex-[2_0]'>Source</span>
                    <span className='py-4 flex-[1_0] text-center'>Occurence Date</span>
                    <span className='py-4 flex-[1_0] text-center'>Date Identified</span>
                    <span className='py-4 flex-[1_0] text-center'>Status</span>
                    <span className='py-4 flex-[.5_0]'></span>
                </header>
                <ul className='flex flex-col'>
                    {
                        events.map((event, i) => {
                            return (
                                <RiskEventRecord key={event.risk_event_id} event={{...event, sn: i+1}} options={createEventOptions(event)} />
                            );
                        })
                    }
                </ul>
            </div>
        </div>
    );
}

function RiskEventRecord({event, options}) {
    const sourceElementRef = useRef(null);
    useEffect(() => {
        if (event) {
            sourceElementRef.current.innerHTML = event.source;
        }
    }, [event]);

    return (
        <li className='px-4 flex gap-4 items-center'>
            <span className='py-4 flex-[.5_0]'>{event.sn}</span>
            <span className='py-4 flex-[2_0]' ref={sourceElementRef}></span>
            <span className='py-4 flex-[1_0] text-center'>{event.occurence_date}</span>
            <span className='py-4 flex-[1_0] text-center'>{event.date_identified}</span>
            <span className='py-4 flex-[1_0] text-center'>
                <StatusChip text={event.status} color={'#FF5F4A'} />
            </span>
            <span className='py-4 flex-[.5_0]'>
                <OptionsDropdown options={options} />
            </span>
        </li>
    );
}

export function RiskEventDialog({context, onRemove}) {
    const {id: riskID} = useParams();
    const {mode, eventId = null} = context;
    const [inEditMode, setInEditMode] = useState(mode === 'edit' || mode === 'add' || false);
    const [formData, setFormData] = useState({
        common_causes: [],
        pre_event: [],
        post_event: [],
        consequences: [],
        date_identified: '',
        occurence_date: '',
        resolution_date: '',
        source: '',
        lesson_learned: '',
        regulatory_requirement: '',
        stake_holders: [],
        total_cost: ''
    });
    const [selectedStakeholders, setSelectedStakeholders] = useState([]);

    const sourceElementRef = useRef(null);
    const lessonLearnedElementRef = useRef(null);
    const regulatoryRequirementElementRef = useRef(null);

    // queries
    const [riskEventQuery, usersQuery] = useQueries({
        queries: [riskEventOptions(riskID, eventId, {enabled: !!eventId}), usersOptions()]
    });

    useEffect(() => {
        const event = riskEventQuery.data;
        if (mode !== 'add' && event) {
            console.log('did you even get here')
            const dateIdentifiedParts = event.date_identified?.split('-').map(s => s.trim()) || '';
            const occurenceDateParts = event.re_occurence_date?.split('-').map(s => s.trim()) || '';
            const resolutionDateParts = event.re_resolution_date?.split('-').map(s => s.trim()) || '';
            setFormData({
                common_causes: event.root_causes.map(c => c.cause),
                pre_event: event.pre_mitigation.map(m => m.pre_mitigation),
                post_event: event.post_mitigation.map(m => m.post_mitigation),
                consequences: event.consequences.map(c => c.consequence),
                date_identified: dateIdentifiedParts ? `${dateIdentifiedParts[2]}-${dateIdentifiedParts[1]}-${dateIdentifiedParts[0]}` : '',
                occurence_date: occurenceDateParts ? `${occurenceDateParts[2]}-${occurenceDateParts[1]}-${occurenceDateParts[0]}` : '',
                resolution_date: resolutionDateParts ? `${resolutionDateParts[2]}-${resolutionDateParts[1]}-${resolutionDateParts[0]}` : '',
                source: event.re_source || '',
                lesson_learned: event.lesson_learned || '',
                regulatory_requirement: event.report_requirement || '',
                stake_holders: event.stakeholders.map(s => s.user_id),
                total_cost: event.re_total_cost || ''
            })
            setSelectedStakeholders(event.stakeholders.map(s => ({id: s.user_id, name: s.name})));

            // set innerHTML for source, lesson and requirement
            if (sourceElementRef.current) sourceElementRef.current.innerHTML = event.re_source;
            if (lessonLearnedElementRef.current) lessonLearnedElementRef.current.innerHTML = event.lesson_learned;
            if (regulatoryRequirementElementRef.current) regulatoryRequirementElementRef.current.innerHTML = event.report_requirement;
        }
    }, [mode, riskEventQuery.data]);

    // mutations
    const {isPending: isAddingRiskEvent, mutate: addRiskEvent} = useAddRiskEvent(riskID, {onSuccess, onError, onSettled});
    const {isPending: isUpdatingRiskEvent, mutate: updateRiskEvent} = useUpdateRiskEvent({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingRiskEvent ? 'Adding Risk Event' : 'Updating Risk Event';
        (isAddingRiskEvent || isUpdatingRiskEvent) && dispatchMessage('processing', text);
    }, [isAddingRiskEvent, isUpdatingRiskEvent]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', riskID, 'events']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // set newly created risk id and proceed to next step if successful
        if (!error) {
            mode === 'add' && onRemove();
            // mode === 'edit' && removeModal();
        }
    }

    useEffect(() => {
        setFormData((prevFormData) => ({...prevFormData, stake_holders: selectedStakeholders.map(u => u.id)}));
    }, [selectedStakeholders]);

    function handleChange(e) {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    function handleSelectStakeholder(user) {
        if (selectedStakeholders.some(u => u.id === user.id)) return;
        setSelectedStakeholders([...selectedStakeholders, user]);
    }

    function handleRemoveStakeholder(user) {
        setSelectedStakeholders(selectedStakeholders.filter(u => u.id !== user.id));
    }

    function handleSaveClicked() {
        if (mode === 'add') addRiskEvent({data: formData});
        else if (mode === 'edit' || mode === 'view') updateRiskEvent({id: eventId, data: formData});
    }

    const isLoading = riskEventQuery.isLoading || usersQuery.isLoading;
    const error = riskEventQuery.error || usersQuery.error;

    let content = '';
    if (isLoading) content = <div>Loading</div>
    else if (error) content = <div>error</div>
    else {
        const users = usersQuery.data.map(u => ({id: u.user_id, text: (!u.firstname || !u.lastname) ? u.email : `${u.firstname} ${u.lastname}`}));

        const riskEvent = riskEventQuery.data;

        const selectedUsersList = <SelectedItemsList list={selectedStakeholders} editable={true} onRemove={handleRemoveStakeholder} />

        content = <>
            <section className="flex flex-col gap-4">
                <h4 className="font-semibold border-b border-b-[#CCCCCC] pb-2">Bow Tie Diagram</h4>
                <BowTieDiagram formData={formData} setFormData={setFormData} mode={mode} riskEvent={riskEvent} />
            </section>
            <section className="flex flex-col gap-4">
                <h4 className="font-semibold border-b border-b-[#CCCCCC] pb-2 flex justify-between">
                    Event Details
                    {
                        !inEditMode &&
                        <button type="button" onClick={() => setInEditMode(true)} className="text-sm font-medium text-text-pink flex gap-3 items-center">
                            <img src={plusIcon} alt="plus icon" />
                            Edit
                        </button>
                    }
                </h4>
                {
                    inEditMode ?
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between">
                            <div className="flex gap-3 items-center">
                                <span className="font-medium">Date Identified:</span>
                                <Field {...{type: 'date', name: 'date_identified', value: formData.date_identified, onChange: handleChange}} />
                            </div>
                            <div className="flex gap-3 items-center">
                                <span className="font-medium">Occurence Date:</span>
                                <Field {...{type: 'date', name: 'occurence_date', value: formData.occurence_date, onChange: handleChange}} />
                            </div>
                            <div className="flex gap-3 items-center">
                                <span className="font-medium">Resolution Date:</span>
                                <Field {...{type: 'date', name: 'resolution_date', value: formData.resolution_date, onChange: handleChange}} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <CKEField {...{name: 'source', label: 'Source', value: formData.source, onChange: handleChange}} />
                            <CKEField {...{name: 'lesson_learned', label: 'Lesson Learned', value: formData.lesson_learned, onChange: handleChange}} />
                            <CKEField {...{name: 'regulatory_requirement', label: 'Regulatory Requirement', value: formData.regulatory_requirement, onChange: handleChange}} />
                            <StakeholdersDropdown users={users} onSelect={handleSelectStakeholder} selectedList={selectedUsersList} />
                        </div>
                        <div className="flex gap-3 items-center w-1/3">
                            <span className="font-medium">Total Cost:</span>
                            <Field {...{name: 'total_cost', placeholder: 'Enter total cost in number', value: formData.total_cost, onChange: handleChange}} />
                        </div>
                        <div className='flex gap-3'>
                            <FormCancelButton text={'Discard'} onClick={onRemove} />
                            <FormProceedButton text={'Save'} onClick={handleSaveClicked} />
                        </div>
                    </div> :
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between">
                            <div className="flex gap-3 items-center">
                                <span className="font-medium">Date Identified:</span>
                                <span>{riskEvent.date_identified}</span>
                            </div>
                            <div className="flex gap-3 items-center">
                                <span className="font-medium">Occurence Date:</span>
                                <span>{riskEvent.re_occurence_date}</span>
                            </div>
                            <div className="flex gap-3 items-center">
                                <span className="font-medium">Resolution Date:</span>
                                <span>{riskEvent.re_resolution_date}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex gap-3 items-center">
                                <span className="font-medium">Source</span>
                                <p ref={sourceElementRef}></p>
                            </div>
                            <div className="flex gap-3 items-center">
                                <span className="font-medium">Lesson Learned</span>
                                <p ref={lessonLearnedElementRef}></p>
                            </div>
                            <div className="flex gap-3 items-center">
                                <span className="font-medium">Regulatory Requirement</span>
                                <p ref={regulatoryRequirementElementRef}></p>
                            </div>
                            <SelectedItemsList list={selectedStakeholders} editable={false} />
                        </div>
                        <div className="flex gap-3 items-center w-1/3">
                            <span className="font-medium">Total Cost:</span>
                            <span>{riskEvent.re_total_cost}</span>
                        </div>
                    </div>
                }
            </section>
        </>
    }

    return (
        <div className="h-full p-3 w-full overflow-y-auto">
            <form className="bg-white border border-[#E2E2E2] rounded-2xl p-6 min-h-96">
                <div className="flex flex-col gap-6">
                    <header className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg">Risk Event</h4>
                        <CloseButton onClose={onRemove} />
                    </header>
                    {content}
                </div>
            </form>
        </div>
    );
}

function BowTieDiagram({formData, setFormData, mode, riskEvent}) {
    console.log(formData)
    const {id: riskID} = useParams();
    const fieldNames = {
        'causes': 'common_causes',
        'preEvent': 'pre_event',
        'postEvent': 'post_event',
        'consequences': 'consequences'
    };

    // risk name query
    const {isLoading, error, data: riskEventName} = useRiskName(riskID);

    function handleChange(type, index, e) {
        setFormData({
            ...formData,
            [fieldNames[type]]: formData[fieldNames[type]].map((value, i) => {
                if (index === i) return e.target.value;
                else return value
            })
        });
    }

    function handleAddNew(type) {
        setFormData({
            ...formData,
            [fieldNames[type]]: [...formData[fieldNames[type]], '']
        });
    }

    function handleDeleteItem(type, index) {
        setFormData({
            ...formData,
            [fieldNames[type]]: formData[fieldNames[type]].filter((value, i) => i !== index)
        });
    }

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    return (
        <div className="flex gap-3 justify-between items-center">
            <RootCausesSection eventId={riskEvent?.risk_event_id} rootCauses={mode === 'view' ? riskEvent.root_causes : formData.common_causes} mode={mode} onAddNew={handleAddNew} onRemove={handleDeleteItem} onChange={handleChange} />

            <PreMitigationsSection eventId={riskEvent?.risk_event_id} preMitigations={mode === 'view' ? riskEvent.pre_mitigation : formData.pre_event} mode={mode} onAddNew={handleAddNew} onRemove={handleDeleteItem} onChange={handleChange} />

            <div className="flex flex-col gap-3">
                <span className="font-medium">Risk Event</span>
                <div className="bg-[#F9F9F9] border border-border-gray rounded-lg p-4">{riskEventName}</div>
            </div>

            <PostMitigationsSection eventId={riskEvent?.risk_event_id} postMitigations={mode === 'view' ? riskEvent.post_mitigation : formData.post_event} mode={mode} onAddNew={handleAddNew} onRemove={handleDeleteItem} onChange={handleChange} />

            <ConsequencesSection eventId={riskEvent?.risk_event_id} consequences={mode === 'view' ? riskEvent.consequences : formData.consequences} mode={mode} onAddNew={handleAddNew} onRemove={handleDeleteItem} onChange={handleChange} />
        </div>
    );
}

function RootCausesSection({eventId, rootCauses, mode, onAddNew, onChange, onRemove}) {
    console.log(rootCauses)
    const [focusedItem, setFocusedItem] = useState(null);
    const [newItem, setNewItem] = useState(null);
    const {id: riskID} = useParams();

    // mutations
    const {isPending: isAddingRootCause, mutate: addRootCause} = useAddRootCause({onSuccess, onError, onSettled});
    const {isPending: isUpdatingRootCause, mutate: updateRootCause} = useUpdateRootCause({onSuccess, onError, onSettled});
    const {isPending: isDeletingRootCause, mutate: deleteRootCause} = useDeleteRootCause({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingRootCause ? 'Adding Common Cause' : (isUpdatingRootCause ? 'Updating Common Cause' : 'Deleting Common Cause');
        (isAddingRootCause || isUpdatingRootCause || isDeletingRootCause) && dispatchMessage('processing', text);
    }, [isAddingRootCause, isUpdatingRootCause, isDeletingRootCause]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', riskID, 'events']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // set newly created risk id and proceed to next step if successful
        if (!error) {
            setFocusedItem(null);
            setNewItem(null);
        }
    }

    return <BowTieSection
        type={'causes'}
        mode={mode}
        items={rootCauses}
        mutations={{
            add: () => addRootCause({eventId, data: {'root_cause': newItem}}),
            update: (id) => updateRootCause({id, data: {'root_cause': focusedItem.value}}),
            delete: (id) => deleteRootCause({id})
        }}
        sectionInfo={{
            heading: 'Common Causes',
            placeholder: 'Enter common cause',
            singleItemName: 'cause',
        }}
        onItemChange={onChange}
        onAddNewItem={onAddNew}
        onRemoveItem={onRemove}
        focusedItem={focusedItem}
        setFocusedItem={setFocusedItem}
        newItem={newItem}
        setNewItem={setNewItem}
        />
}

function PreMitigationsSection({eventId, preMitigations, mode, onAddNew, onChange, onRemove}) {
    const [focusedItem, setFocusedItem] = useState(null);
    const [newItem, setNewItem] = useState(null);
    const {id: riskID} = useParams();

    // mutations
    const {isPending: isAddingPreMitigation, mutate: addPreMitigation} = useAddPreMitigation({onSuccess, onError, onSettled});
    const {isPending: isUpdatingPreMitigation, mutate: updatePreMitigation} = useUpdatePreMitigation({onSuccess, onError, onSettled});
    const {isPending: isDeletingPreMitigation, mutate: deletePreMitigation} = useDeletePreMitigation({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingPreMitigation ? 'Adding Pre Event Mitigation' : (isUpdatingPreMitigation ? 'Updating Pre Event Mitigation' : 'Deleting Pre Event Mitigation');
        (isAddingPreMitigation || isUpdatingPreMitigation || isDeletingPreMitigation) && dispatchMessage('processing', text);
    }, [isAddingPreMitigation, isUpdatingPreMitigation, isDeletingPreMitigation]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', riskID, 'events']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // set newly created risk id and proceed to next step if successful
        if (!error) {
            setFocusedItem(null);
            setNewItem(null);
        }
    }

    return <BowTieSection
        type={'preEvent'}
        mode={mode}
        items={preMitigations}
        mutations={{
            add: () => addPreMitigation({eventId, data: {'pre_mitigation': newItem}}),
            update: (id) => updatePostMitigation({id, data: {'pre_mitigation': focusedItem.value}}),
            delete: (id) => deletePreMitigation({id})
        }}
        sectionInfo={{
            heading: 'Pre-Event Mitigations',
            placeholder: 'Enter pre-event mitigation',
            singleItemName: 'pre_mitigation'
        }}
        onItemChange={onChange}
        onAddNewItem={onAddNew}
        onRemoveItem={onRemove}
        focusedItem={focusedItem}
        setFocusedItem={setFocusedItem}
        newItem={newItem}
        setNewItem={setNewItem}
        />
}

function PostMitigationsSection({eventId, postMitigations, mode, onAddNew, onChange, onRemove}) {
    const [focusedItem, setFocusedItem] = useState(null);
    const [newItem, setNewItem] = useState(null);
    const {id: riskID} = useParams();

    // mutations
    const {isPending: isAddingPostMitigation, mutate: addPostMitigation} = useAddPostMitigation({onSuccess, onError, onSettled});
    const {isPending: isUpdatingPostMitigation, mutate: updatePostMitigation} = useUpdatePostMitigation({onSuccess, onError, onSettled});
    const {isPending: isDeletingPostMitigation, mutate: deletePostMitigation} = useDeletePostMitigation({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingPostMitigation ? 'Adding Post Event Mitigation' : (isUpdatingPostMitigation ? 'Updating Post Event Mitigation' : 'Deleting Post Event Mitigation');
        (isAddingPostMitigation || isUpdatingPostMitigation || isDeletingPostMitigation) && dispatchMessage('processing', text);
    }, [isAddingPostMitigation, isUpdatingPostMitigation, isDeletingPostMitigation]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', riskID, 'events']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // set newly created risk id and proceed to next step if successful
        if (!error) {
            setFocusedItem(null);
            setNewItem(null);
        }
    }

    return <BowTieSection
        type={'postEvent'}
        mode={mode}
        items={postMitigations}
        mutations={{
            add: () => addPostMitigation({eventId, data: {'post_mitigation': newItem}}),
            update: (id) => updatePostMitigation({id, data: {'post_mitigation': focusedItem.value}}),
            delete: (id) => deletePostMitigation({id})
        }}
        sectionInfo={{
            heading: 'Post-Event Mitigations',
            placeholder: 'Enter post-event mitigation',
            singleItemName: 'post_mitigation'
        }}
        onItemChange={onChange}
        onAddNewItem={onAddNew}
        onRemoveItem={onRemove}
        focusedItem={focusedItem}
        setFocusedItem={setFocusedItem}
        newItem={newItem}
        setNewItem={setNewItem}
        />
}

function ConsequencesSection({eventId, consequences, mode, onAddNew, onChange, onRemove}) {
    const [focusedItem, setFocusedItem] = useState(null);
    const [newItem, setNewItem] = useState(null);
    const {id: riskID} = useParams();

    // mutations
    const {isPending: isAddingConsequence, mutate: addConsequence} = useAddConsequence({onSuccess, onError, onSettled});
    const {isPending: isUpdatingConsequence, mutate: updateConsequence} = useUpdateConsequence({onSuccess, onError, onSettled});
    const {isPending: isDeletingConsequence, mutate: deleteConsequence} = useDeleteConsequence({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingConsequence ? 'Adding Consequence' : (isUpdatingConsequence ? 'Updating Consequence' : 'Deleting Consequence');
        (isAddingConsequence || isUpdatingConsequence || isDeletingConsequence) && dispatchMessage('processing', text);
    }, [isAddingConsequence, isUpdatingConsequence, isDeletingConsequence]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', riskID, 'events']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // set newly created risk id and proceed to next step if successful
        if (!error) {
            setFocusedItem(null);
            setNewItem(null);
        }
    }

    return <BowTieSection
        type={'consequences'}
        mode={mode}
        items={consequences}
        mutations={{
            add: () => addConsequence({eventId, data: {'consequences': newItem}}),
            update: (id) => updateConsequence({id, data: {'consequences': focusedItem.value}}),
            delete: (id) => deleteConsequence({id})
        }}
        sectionInfo={{
            heading: 'Consequences',
            placeholder: 'Enter consequence',
            singleItemName: 'consequence'
        }}
        onItemChange={onChange}
        onAddNewItem={onAddNew}
        onRemoveItem={onRemove}
        focusedItem={focusedItem}
        setFocusedItem={setFocusedItem}
        newItem={newItem}
        setNewItem={setNewItem}
        />
}

function BowTieSection({type, mode, items, mutations, sectionInfo, onItemChange, onAddNewItem, onRemoveItem, focusedItem, setFocusedItem, newItem, setNewItem}) {
    function handleAddNew() {
        if (mode !== 'view') onAddNewItem(type);
        if (mode === 'view') {
            setNewItem('');
            setFocusedItem(null);
        }
    }

    function createItemOptions(item, index) {
        const options = [
            {text: 'Edit', type: 'action', action: () => {setFocusedItem({index, value: item[sectionInfo.singleItemName]}); setNewItem(null)}},
            {text: 'Delete', type: 'action', action: () => {
                if (mode !== 'view') onRemoveItem(type, index);
                else mutations.delete(item.id);
            }}
        ];
        return options;
    }

    return (
        <div className="bg-[#909090] rounded-lg p-4 flex-1 flex flex-col gap-3">
            <h4 className="font-medium">{sectionInfo.heading}</h4>
            <div>
                {
                    items.map((item, i) => {
                        return (
                            <div key={i} className="relative">
                                {
                                    focusedItem?.index === i ?
                                    <>
                                        <Field {...{type: 'textbox', placeholder: sectionInfo.placeholder, value: focusedItem.value, onChange: (e) => setFocusedItem({...focusedItem, value: e.target.value})}} />
                                        <OptionsDropdown classes="absolute top-3 right-0" options={createItemOptions(item, i)} />
                                        <div className='flex gap-3 mt-2'>
                                            <FormCancelButton text={'Discard'} onClick={() => setFocusedItem(null)} />
                                            <FormProceedButton text={'Save'} onClick={() => mutations.update(item.id)} />
                                        </div>
                                    </> :
                                    <>
                                        <Field {...{type: 'textbox', placeholder: sectionInfo.placeholder, value: mode === 'view' ? (item[sectionInfo.singleItemName] || '') : item, onChange: (e) => onItemChange(type, i, e), disabled: mode === 'view' || mode === 'edit'}} />
                                        <OptionsDropdown classes="absolute top-3 right-0" options={createItemOptions(item, i)} />
                                    </>
                                }
                            </div>
                        );
                    })
                }
                {
                    newItem !== null &&
                    <div className="relative">
                        <Field {...{type: 'textbox', placeholder: sectionInfo.placeholder, value: newItem, onChange: (e) => setNewItem(e.target.value)}} />
                        <div className='flex gap-3 mt-2'>
                            <FormCancelButton text={'Discard'} onClick={() => setNewItem(null)} />
                            <FormProceedButton text={'Save'} onClick={() => mutations.add()} />
                        </div>
                    </div>
                }
            </div>
            {
                newItem === null &&
                <AddNewButton small={true} text={'Add New'} onClick={handleAddNew} />
            }
        </div>
    );
}

function StakeholdersDropdown({users, onSelect, selectedList}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [filterTerm, setFilterTerm] = useState('');

    const filteredUsers = users.filter(o => new RegExp(filterTerm, 'i').test(o.text));

    return (
        <SelectDropdown label={'Stakeholders'} customAction={onSelect} contentAfterLabel={selectedList} placeholder={'Select Stakeholders'} items={filteredUsers} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} filterable={true} filterTerm={filterTerm} setFilterTerm={setFilterTerm} />
    );
}