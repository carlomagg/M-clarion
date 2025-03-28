import { useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAddCurrentValue, useDeleteCurrentValue, useUpdateCurrentValue } from "../../../../../queries/strategies/strategy-queries";
import { FormCancelButton, FormProceedButton } from "../../../buttons/FormButtons/FormButtons";
import OptionsDropdown from "../../../dropdowns/OptionsDropdown/OptionsDropdown";
import { convertToNumber, formatAmount } from "../../../../../utils/helpers";
import { StrategyDrawerContext } from "../../../../pages/strategies/Index/Index";
import AddNewButton from "../../../buttons/AddNewButton/AddNewButton";

export default function CurrentValuesTable({values, type}) {
    const drawerContext = useContext(StrategyDrawerContext);
    const [newValue, setNewValue] = useState(null);
    const [focusedCV, setFocusedCV] = useState(null);
    const {id: strategyId} = useParams();

    const {objectiveId = null, tacticId = null, metricId = null} = drawerContext ? drawerContext.bag : {};
    const riskID = type === 'riskIndicator' && strategyId;

    const parentId = type === 'objective' ? objectiveId : (type === 'tactic' ? tacticId : (type === 'metric' ?metricId : (type === 'riskIndicator' && riskID)));

    // current value mutations
    const {isPending: isAddingCurrentValue, mutate: addCurrentValue} = useAddCurrentValue({onSuccess, onError, onSettled});
    const {isPending: isUpdatingCurrentValue, mutate: updateCurrentValue} = useUpdateCurrentValue({onSuccess, onError, onSettled});
    const {isPending: isDeletingCurrentValue, mutate: deleteCurrentValue} = useDeleteCurrentValue({onSuccess, onError, onSettled});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage()
    useEffect(() => {
        let text = isAddingCurrentValue ? 'Adding current value' : (isUpdatingCurrentValue ? 'Updating current value' : 'Deleting current value');
        (isAddingCurrentValue || isUpdatingCurrentValue || isDeletingCurrentValue) && dispatchMessage('processing', text);
    }, [isAddingCurrentValue, isUpdatingCurrentValue, isDeletingCurrentValue]);

    async function onSuccess(data) {
        if (type === 'riskIndicator') {
            await queryClient.invalidateQueries({queryKey: ['risks', riskID]});
        } else {
            await queryClient.invalidateQueries({queryKey: ['strategies', Number(strategyId), type+'s', Number(parentId)]});
        }
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // empty and remove input field
        if (!error) {
            setNewValue(null);
            setFocusedCV(null);
        }
    }

    useEffect(() => {
        if (focusedCV !== null) {
            const value = values.find((v, i) => i === focusedCV);
            setNewValue(value ? formatAmount(value.current_value) : '');
        }
    }, [focusedCV]);

    function itemOptions(id, index) {
        let options = [
            {text: 'Edit', type: 'action', action: () => setFocusedCV(index)},
            {text: 'Delete', type: 'action', action: () => deleteCurrentValue({id})}
        ];
        return options;
    }

    const newFieldAdded = newValue !== null && focusedCV === null;
    
    return (
        <div>
            <h4 className='font-medium'>Current Values</h4>
            <div className='mt-3 p-6 flex flex-col gap-6 rounded-lg border border-[#CCC] text-[#3B3B3B] text-sm'>
                <div>
                    <header className='px-4 border-b border-b-[#B7B7B7] flex'>
                        <span className='py-4 flex-1 text-center'>Current Value</span>
                        <span className='py-4 flex-1 text-center'>Timestamp</span>
                        <span className='py-4 flex-1 text-center'>User</span>
                        <span className='flex-[0.4_1] text-center'></span>
                    </header>
                    <ul className='flex flex-col'>
                        {
                            values.map((value, index) => {
                                return index === focusedCV ? 
                                (
                                    <li key={index} className='px-4 flex gap-6 items-center'>
                                        <span className='px-1 flex-1 text-center'>
                                            <input type="text" name='current_value' value={newValue || ''} onChange={(e) => setNewValue(formatAmount(e.target.value))} className='p-2 outline-none rounded-lg border border-border-gray w-full' />
                                        </span>
                                        <div className='py-4 flex-1 flex gap-4 text-center'>
                                            <FormCancelButton text={'Discard'} colorBlack={true} onClick={() => {setFocusedCV(null); setNewValue(null);}} />
                                            <FormProceedButton text={isUpdatingCurrentValue ? 'Saving' : 'Save'} disabled={isUpdatingCurrentValue} onClick={() => updateCurrentValue({id: value.id, data: {current_value: convertToNumber(newValue), [`${type}_id`]: parentId}})} />
                                        </div>
                                    </li>
                                ) :
                                (
                                    <li key={index} className='px-4 flex items-center'>
                                        <span className='px-1 flex-1 text-center'>{formatAmount(value.current_value)}</span>
                                        <span className='py-4 flex-1 text-center'>{value.time_stamp}</span>
                                        <span className='py-4 flex-1 text-center'>{value.user}</span>
                                        <span className='py-4 flex-[0.4_1] text-center'>
                                            <OptionsDropdown options={itemOptions(value.id, index)} />
                                        </span>
                                    </li>
                                );
                            })
                        }
                        {
                            newFieldAdded &&
                            <li className='px-4 flex gap-6 items-center'>
                                <span className='px-1 flex-1 text-center'>
                                    <input type="text" name='current_value' value={newValue} onChange={(e) => setNewValue(formatAmount(e.target.value))} className='p-2 outline-none rounded-lg border border-border-gray w-full' />
                                </span>
                                <div className='py-4 flex-1 flex gap-4 text-center'>
                                    <FormCancelButton text={'Discard'} colorBlack={true} onClick={() => setNewValue(null)} />
                                    <FormProceedButton text={isAddingCurrentValue ? 'Adding' : 'Add'} disabled={isAddingCurrentValue} onClick={() => addCurrentValue({data: {current_value: convertToNumber(newValue), [`${type}_id`]: parentId}})} />
                                </div>
                            </li>
                        }
                    </ul>
                </div>
                {
                    !newFieldAdded &&
                    <AddNewButton small={true} text={'Add new'} onClick={() => setNewValue('')} />
                }
            </div>
        </div>
    );
}