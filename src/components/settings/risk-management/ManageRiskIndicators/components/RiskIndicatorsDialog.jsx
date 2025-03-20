import { useEffect, useState } from "react";
import { FormCancelButton, FormProceedButton } from "../../../../partials/buttons/FormButtons/FormButtons";
import { Field } from "../../../../partials/Elements/Elements";
import { CloseButton } from "../../components/Buttons";
import SelectDropdown from "../../../../partials/dropdowns/SelectDropdown/SelectDropdown";
import { riskLogOptions } from "../../../../../queries/risks/risk-queries";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";
import { optimizationsOptions, unitMeasuresOptions } from "../../../../../queries/strategies/strategy-queries";
import { dataSourcesOptions, riskIndicatorOptions, riskIndicatorTypesOptions, useAddRiskIndicator, useUpdateRiskIndicator } from "../../../../../queries/risks/risk-indicators";

export default function RiskIndicatorDialog({context, onRemoveModal}) {
    const [formData, setFormData] = useState({
        indicator_name: '',
        description: '',
        regulatory_relevance: '',
        risk_id: '',
        unit_measure_id: '',
        type_id: '',
        optimization_id: '',
        data_source_id: '',
    });

    const {mode, id: indicatorId = null} = context;

    const formMode = mode === 'edit' || mode === 'add';
    // queries
    const [riskIndicatorQuery, risksQuery, unitMeasuresQuery, indicatorTypesQuery, optimizationsQuery, dataSourcesQuery] = useQueries({queries: [riskIndicatorOptions(indicatorId, {enabled: !!indicatorId}), riskLogOptions({enabled: formMode}), unitMeasuresOptions({enabled: formMode}), riskIndicatorTypesOptions({enabled: formMode}), optimizationsOptions({enabled: formMode}), dataSourcesOptions({enabled: formMode})]});

    // populate formdata when in edit mode
    useEffect(() => {
        const indicator = riskIndicatorQuery.data;
        if (mode === 'edit' && indicator) {
            setFormData({
                indicator_name: indicator.indicator?.name || '',
                description: indicator.description || '',
                regulatory_relevance: indicator.regulatory_relevance || '',
                risk_id: indicator.risk?.id || '',
                unit_measure_id: indicator.measure?.id || '',
                type_id: indicator.type?.id || '',
                optimization_id: indicator.optimization?.id || '',
                data_source_id: indicator.data_source?.id || '',
            });
        }
    }, [mode, riskIndicatorQuery.data]);

    // mutations
    const {isPending: isAddingRiskIndicator, mutate: addRiskIndicator} = useAddRiskIndicator({onSuccess, onError, onSettled});
    const {isPending: isUpdatingRiskIndicator, mutate: updateRiskIndicator} = useUpdateRiskIndicator({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingRiskIndicator ? 'Adding Risk Indicator' : 'Updating Risk Indicator';
        (isAddingRiskIndicator || isUpdatingRiskIndicator) && dispatchMessage('processing', text);
    }, [isAddingRiskIndicator, isUpdatingRiskIndicator]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', 'indicators']});
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
        mode === 'add' && addRiskIndicator({data: formData});
        mode === 'edit' && updateRiskIndicator({id: indicatorId, data: formData});
    }

    const isLoading = riskIndicatorQuery.isLoading || risksQuery.isLoading || unitMeasuresQuery.isLoading || indicatorTypesQuery.isLoading || optimizationsQuery.isLoading || dataSourcesQuery.isLoading;
    const error = riskIndicatorQuery.error || risksQuery.error || unitMeasuresQuery.error || indicatorTypesQuery.error || optimizationsQuery.error || dataSourcesQuery.error;

    let content;

    if (isLoading) content = <div>Loading</div>
    else if (error) content = <div>error</div>
    else {
        const riskIndicator = mode === 'view' && riskIndicatorQuery.data;
        const risks = mode !== 'view' && risksQuery.data.map(r => ({id: r.risk_id, text: r['Title']}));
        const unitMeasures = mode !== 'view' && unitMeasuresQuery.data.map(i => ({id: i.id, text: i.name}));
        const indicatorTypes = mode !== 'view' && indicatorTypesQuery.data.map(i => ({id: i.type_id, text: i.type_name}));
        const optimizations = mode !== 'view' && optimizationsQuery.data.map(i => ({id: i.id, text: i.name}));
        const dataSources = mode !== 'view' && dataSourcesQuery.data.map(i => ({id: i.id, text: i.name}));

        content = <>
            {
                mode !== 'add' &&
                <div className="flex gap-6 flex-wrap">
                    <Chip text={'Posted By: User Name'} />
                    <Chip text={'Posted date: 32/04/2024'} />
                    <Chip text={'Last Updated: 32/04/2024'} />
                </div>
            }
            {
                mode === 'edit' || mode === 'add' ?
                <form className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <Field {...{name: 'indicator_name', label: 'Indicator Name', placeholder: 'Enter name of indicator', value: formData.indicator_name, onChange: handleChange}} />
                        <Field {...{type: 'textbox', name: 'description', label: 'Description', placeholder: 'Enter description', value: formData.description, onChange: handleChange}} />
                        <Field {...{type: 'textbox', name: 'regulatory_relevance', label: 'Regulatory Relevance', placeholder: 'Enter regulatory relevance', value: formData.regulatory_relevance, onChange: handleChange}} />
                        <div className="flex gap-6">
                            <RisksDropdown risks={risks} selected={formData.risk_id} onSelect={handleChange} />
                            <MeasuresDropdown measures={unitMeasures} selected={formData.unit_measure_id} onSelect={handleChange} />
                        </div>
                        <div className="flex gap-6">
                            <TypesDropdown types={indicatorTypes} selected={formData.type_id} onSelect={handleChange} />
                            <OptimizationsDropdown optimizations={optimizations} selected={formData.optimization_id} onSelect={handleChange} />
                        </div>
                        <SourcesDropdown sources={dataSources} selected={formData.data_source_id} onSelect={handleChange} />
                    </div>
                    <hr className="border border-red-[#CCC]" />
                    <div className="flex gap-6">
                        <FormCancelButton text={'Discard'} onClick={onRemoveModal} />
                        <FormProceedButton text={'Save'} disabled={isAddingRiskIndicator || isUpdatingRiskIndicator} onClick={handleSave} />
                    </div>
                </form> :
                <>
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Indicator Name</span>
                        <p>{riskIndicator.indicator.name}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Description</span>
                        <p>{riskIndicator.description}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Regulatory Relevance</span>
                        <p>{riskIndicator.regulatory_relevance}</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="font-medium">Risk</span>
                            <p>{riskIndicator.risk.name}</p>
                        </div>
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="font-medium">Measure</span>
                            <p>{riskIndicator.measure.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="font-medium">Type</span>
                            <p>{riskIndicator.type.name}</p>
                        </div>
                        <div className="flex flex-col gap-3 flex-1">
                            <span className="font-medium">Optimization</span>
                            <p>{riskIndicator.optimization.name}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="font-medium">Data Source</span>
                        <p>{riskIndicator.data_source.name}</p>
                    </div>
                </>
            }
        </>
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="bg-white border border-[#E2E2E2] rounded-2xl w-[800px] p-6">
                <div className="flex flex-col gap-6">
                    <header className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg">Risk Indicator</h4>
                        <CloseButton onClose={onRemoveModal} />
                    </header>
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

function RisksDropdown({risks, selected, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <SelectDropdown name={'risk_id'} label={'Risk'} selected={selected} items={risks} placeholder={'Select Risk'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} onSelect={onSelect} />
    );
}

function MeasuresDropdown({measures, selected, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <SelectDropdown name={'unit_measure_id'} label={'Measure'} selected={selected} items={measures} placeholder={'Select Measure'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} onSelect={onSelect} />
    );
}

function TypesDropdown({types, selected, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <SelectDropdown name={'type_id'} label={'Type'} selected={selected} items={types} placeholder={'Select Type'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} onSelect={onSelect} />
    );
}

function OptimizationsDropdown({optimizations, selected, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <SelectDropdown name={'optimization_id'} label={'Optimization'} selected={selected} items={optimizations} placeholder={'Select Optimization'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} onSelect={onSelect} />
    );
}

function SourcesDropdown({sources, selected, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <SelectDropdown name={'data_source_id'} label={'Source'} selected={selected} items={sources} placeholder={'Select Source'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} onSelect={onSelect} />
    );
}