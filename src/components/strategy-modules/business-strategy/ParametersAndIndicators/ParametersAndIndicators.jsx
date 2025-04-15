import { useContext, useEffect, useState } from 'react';
import styles from './ParametersAndIndicators.module.css';
import { StrategyDrawerContext } from '../../../../pages/strategies/Index/Index';
import { Field, H3 } from '../../../Elements/Elements';
import { FormCancelButton, FormProceedButton } from '../../../buttons/FormButtons/FormButtons';
import { useQueryClient } from '@tanstack/react-query';
import { useAddParametersAndIndicators } from '../../../../../queries/strategies/strategy-queries';
import useDispatchMessage from '../../../../../hooks/useDispatchMessage';
import AddNewButton from '../../../buttons/AddNewButton/AddNewButton';
import OptionsDropdown from '../../../dropdowns/OptionsDropdown/OptionsDropdown';
import useConfirmedAction from '../../../../../hooks/useConfirmedAction';

function ParametersAndIndicators() {
    const {bag, changeDrawerContext} = useContext(StrategyDrawerContext);

    // add parameter and indicators mutations
    const {isPending: isAdding, mutate} = useAddParametersAndIndicators({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage()
    useEffect(() => {
        let text = 'Adding parameter and indicators';
        (isAdding) && dispatchMessage('processing', text);
    }, [isAdding]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['parameters']});
        await queryClient.invalidateQueries({queryKey: ['indicators']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message[0]);
    }
    function onSettled(data, error) {
        // return back to metric form if successful
        if (!error) changeDrawerContext({type: 'metric', mode: bag.metricMode, bag: bag.metricBag});
    }

    return (
        <div className='flex flex-col gap-6 h-full overflow-auto'>
            <ParametersAndIndicatorsForm onSave={mutate} isSaving={isAdding} /> 
        </div>
    );
}

function ParametersAndIndicatorsForm({onSave, isSaving}) {
    const {bag, changeDrawerContext} = useContext(StrategyDrawerContext);
    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useState({
        parameter_id: bag.parameter?.id || '',
        parameter: bag.parameter?.name || '',
        parameter_description: bag.parameter?.description || '',
        indicators: bag.parameter ? bag.parameter.indicators.map(i => ({indicator_name: i.name, indicator_description: i.description || ''})) : []
    });

    function handleChange(e) {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    }

    function handleSubmit() {
        onSave({data: formData});
    }

    function handleAddIndicator() {
        setFormData({...formData, indicators: [...formData.indicators, {indicator_name: '', indicator_description: ''}]});
    }

    function handleIndicatorChange(e, index) {
        setFormData({
            ...formData,
            indicators: formData.indicators.map((indicator, i) => {
                if (index === i) return {...indicator, [e.target.name]: e.target.value};
                else return indicator;
            })
        })
    }

    function handleRemoveIndicator(index) {
        setFormData({...formData, indicators: formData.indicators.filter((indicator, i) => i !== index)});
    }

    return (
        <form className='flex flex-col gap-2 justify-between'>
            <div className='flex flex-col p-6 gap-6'>
                <H3>Parameters and Indicators</H3>
                <Field {...{label: 'Parameter', name: 'parameter', placeholder: 'Enter parameter name', value: formData.parameter, onChange: handleChange,  error: validationErrors['parameter']}} />
                <Field {...{type: 'textbox', label: 'Description', name: 'parameter_description', value: formData.parameter_description, onChange: handleChange, placeholder: 'Enter description', error: validationErrors['parameter_description'], height: '100'}} />
                <IndicatorsTable indicators={formData.indicators} onAddIndicator={handleAddIndicator} onIndicatorChange={handleIndicatorChange} onDeleteIndicator={handleRemoveIndicator} />
            </div>
            <div className='flex gap-6 px-6'>
                <FormCancelButton text={'Discard'} colorBlack={true} onClick={() => changeDrawerContext({type: 'metric', mode: bag.metricMode, bag: bag.metricBag})} />
                <FormProceedButton text={isSaving ? 'Saving changes...' : 'Save changes'} disabled={isSaving} onClick={handleSubmit} />
            </div>
        </form>
    );
}

function IndicatorsTable({indicators, onIndicatorChange, onAddIndicator, onDeleteIndicator}) {
    const {confirmAction, confirmationDialog} = useConfirmedAction();
    function itemOptions(index) {
        let options = [
            {text: 'Edit', type: 'action', action: () => console.log('edit clicked')},
            {text: 'Delete', type: 'action', action: () => confirmAction(() => onDeleteIndicator(index))}
        ];
        return options;
    }
    
    return (
        <div>
            {confirmationDialog}
            <h4 className='font-medium'>Indicators</h4>
            <div className='mt-3 p-6 flex flex-col gap-6 rounded-lg border border-[#CCC] text-[#3B3B3B] text-sm'>
                <div>
                    <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                        <span className='py-4 flex-1 text-center'>Indicator</span>
                        <span className='py-4 flex-1 text-center'>Description</span>
                        <span className='py-4 flex-[.3_0] text-center'></span>
                    </header>
                    <ul className='flex flex-col'>
                        {
                            indicators.map((indicator, i) => {
                                return (
                                    <li key={i} className='px-4 flex items-center gap-4'>
                                        <span className='px-1 flex-1 text-center'>
                                            <input type="text" name='indicator_name' value={indicator.indicator_name} onChange={(e) => onIndicatorChange(e, i)} className='p-2 outline-none rounded-lg border border-border-gray w-full' />
                                        </span>
                                        <span className='py-4 flex-1 text-center'>
                                            <textarea rows={2} name='indicator_description' value={indicator.indicator_description} onChange={(e) => onIndicatorChange(e, i)} className='resize-none p-2 outline-none rounded-lg border border-border-gray w-full' />
                                        </span>
                                        <span className='py-4 flex-[.3_0] text-center'>
                                            <OptionsDropdown options={itemOptions(i)} />
                                        </span>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
                <AddNewButton small={true} text={'Add new'} onClick={onAddIndicator} />
            </div>
        </div>
    );
}

export default ParametersAndIndicators;