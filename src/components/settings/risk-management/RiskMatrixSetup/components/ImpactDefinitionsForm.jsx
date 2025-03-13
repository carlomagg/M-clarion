import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Modal from "../../components/Modal";
import { InfoButton } from "../../components/Buttons";
import AddNewButton from "../../../../partials/buttons/AddNewButton/AddNewButton";
import SelectDropdown from "../../../../partials/dropdowns/SelectDropdown/SelectDropdown";
import { Field } from "../../../../partials/Elements/Elements";
import { FormCancelButton, FormProceedButton } from "../../../../partials/buttons/FormButtons/FormButtons";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { riskImpactFociiOptions } from "../../../../../queries/risks/risk-impact-focus";
import { riskImpactDefinitionsOptions, useAddRiskImpactDefinition, useUpdateRiskImpactDefinition } from "../../../../../queries/risks/risk-impact-definitions";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";
import { ImpactDefinitionsSection } from "./ImpactDefinitionsSection";

export default function ImpactDefinitionsForm({likelihoodDefinitions}) {
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState({
        impact_focus_id: '',
        impacts: likelihoodDefinitions.map(likelihood => ({score: likelihood.score, description: likelihood.description, criteria: ''}))
    });
    const [mode, setMode] = useState('add');

    // queries
    const [impactFociiQuery, impactDefinitionsQuery] = useQueries({
        queries: [riskImpactFociiOptions(), riskImpactDefinitionsOptions()]
    });

    // populate formdata when in edit mode
    useEffect(() => {
        const focusId = data.impact_focus_id;
        const definitions = impactDefinitionsQuery.data;
        if (focusId && definitions) {
            const matrix = definitions.find(d => d.impact_focus.id === focusId)?.impact_matrix;
            setData({
                impact_focus_id: focusId,
                impacts: matrix && matrix.length > 0 ?
                    matrix :
                    likelihoodDefinitions.map(likelihood => ({score: likelihood.score, description: likelihood.description, criteria: ''}))
            });
        }
    }, [data.impact_focus_id, impactDefinitionsQuery.data]);

    // mutations
    const {isPending: isAddingDefinition, mutate: addDefinition} = useAddRiskImpactDefinition({onSuccess, onError, onSettled});
    const {isPending: isUpdatingDefinition, mutate: updateDefinition} = useUpdateRiskImpactDefinition({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingDefinition ? 'Adding Risk Impact Definition' : 'Updating Risk Impact Definition';
        (isAddingDefinition || isUpdatingDefinition) && dispatchMessage('processing', text);
    }, [isAddingDefinition, isUpdatingDefinition]);

    async function onSuccess(data) {
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
        setData({...data, [e.target.name]: e.target.value});
    }
    function handleImpactChange(e, score) {
        setData({
            ...data,
            impacts: data.impacts.map(impact => {
                if (impact.score === score) {
                    return {...impact, criteria: e.target.value};
                } else return impact;
            })
        });
    }

    function handleSave() {
        mode === 'add' && addDefinition({data: {...data, impacts: data.impacts.map(impact => ({impact_score: impact.score, criteria: impact.criteria}))}});
        mode === 'edit' && updateDefinition({id: data.impact_focus_id, data: {...data, impacts: data.impacts.map(impact => ({impact_score: impact.score, criteria: impact.criteria}))}});
    }

    function changeFocusedImpact(impactDefinition) {
        setData({
            impact_focus_id: impactDefinition.impact_focus?.id || '',
            impacts: impactDefinition.impact_matrix.length > 0 ?
                impactDefinition.impact_matrix :
                likelihoodDefinitions.map(likelihood => ({score: likelihood.score, description: likelihood.description, criteria: ''}))
        });
    }

    const isLoading = impactFociiQuery.isLoading || impactDefinitionsQuery.isLoading;
    const error = impactFociiQuery.error || impactDefinitionsQuery.error;

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    const focuses = impactFociiQuery.data.map(f => ({id: f.id, text: f.focus}));
    const impactDefinitions = impactDefinitionsQuery.data;

    // console.log(impactDefinition)

    return (
        <div className="flex flex-col gap-8">
            {
                showModal &&
                createPortal(
                    <Modal
                        type={'impactFocus'}
                        context={{mode: 'add'}}
                        onRemove={() => setShowModal(false)}
                    />,
                    document.body
                )
            }
            <div className="flex flex-col gap-8">
                <div className='flex gap-3 font-medium'>
                    Impact Focus
                    <InfoButton />
                </div>
                <div className="flex gap-3 w-1/2">
                    <ImpactFocusesDropdown focuses={focuses} selected={data.impact_focus_id} onSelect={(e) => {setMode('add'); handleChange(e)}} />
                    <AddNewButton smallest={true} onClick={() => setShowModal(true)} />
                </div>
                <div className='overflow-x-auto w-full'>
                    <div className='rounded-lg text-[#3B3B3B] text-sm'>
                        <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                            <span className='py-4 flex-[.5_0] text-center'>Score</span>
                            <span className='py-4 flex-[1.5_0]'>Description</span>
                            <span className='py-4 flex-[3_0]'>Criteria</span>
                        </header>
                        <ul className='flex flex-col'>
                            {
                                data.impacts.map((impact, i) => {
                                    return (
                                        <li key={i}>
                                            <div className='px-4 flex items-center gap-4'>
                                                <span className='py-2 flex-[.5_0] text-center'>{impact['score']}</span>
                                                <span className='py-2 flex-[1.5_0]'>{impact['description']}</span>
                                                <span className='py-2 flex-[3_0]'>
                                                    <Field {...{name: 'criteria', value: data.impacts[i].criteria, onChange: (e) => handleImpactChange(e, impact.score),  placeholder: 'Enter impact criteria'}} />
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </div>
                </div>
                <div className="flex gap-6">
                    <FormCancelButton text={'Discard'} onClick={() => {}} />
                    <FormProceedButton text={'Save'} onClick={handleSave} />
                </div>
            </div>
            <hr className="border border-red-[#CCC]" />
            <ImpactDefinitionsSection impactDefinitions={impactDefinitions} onSetFocusedImpact={changeFocusedImpact} onSetMode={setMode} />
        </div>
    );
}

function ImpactFocusesDropdown({focuses, selected, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <SelectDropdown name={'impact_focus_id'} selected={selected} items={focuses} placeholder={'Select Impact Focus'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} onSelect={onSelect} />
    );
}