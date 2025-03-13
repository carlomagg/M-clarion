import { useEffect, useState } from 'react';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';
import { Field } from '../../../partials/Elements/Elements';
import styles from './AddCity.module.css';
import SelectDropdown from '../../../partials/dropdowns/SelectDropdown/SelectDropdown';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { statesOptions, useAddCity } from '../../../../queries/location-queries';
import { FormLoadingIndicator } from '../../../partials/skeleton-loading-indicators/SettingsIndicator';
import Error from '../../../partials/Error/Error';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import BackButton from '../../components/BackButton';

function AddCity() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        state_id: '',
        city_name: ''
    });

    const [statesDropdownCollapsed, setStatesDropdownCollapse] = useState(true);

    // fetch states
    const {isLoading, error, data: returnedStates} = useQuery(statesOptions());

    const {isPending: isAddingCity, mutate} = useAddCity({onSuccess, onError, onSettled});
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        (isAddingCity) && dispatchMessage('processing', 'Adding city')
    }, [isAddingCity]);
    function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['states']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/settings/location');
    }

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }
    
    function handleSubmit() {
        mutate({data: formData});
    }

    if (isLoading) return <FormLoadingIndicator />
    if (error) return <Error error={error} />

    const states = returnedStates.map(state => ({id: state.state_id, text: state.state_name}))

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8'>
            <header className='flex gap-3'>
                <BackButton />
                <h3 className='font-semibold text-xl'>Add City</h3>
            </header>
            <div className='flex gap-6'>
                <SelectDropdown label={'State'} name={'state_id'} items={states} placeholder={'Select state'} isCollapsed={statesDropdownCollapsed} selected={formData.state_id} onToggleCollpase={setStatesDropdownCollapse} onSelect={handleChange} />
            </div>
            <div className='flex gap-6'>
                <Field label={'City name'} name={'city_name'} value={formData['city_name']} onChange={handleChange} placeholder={'Enter city name'} />
            </div>
            <div className='flex gap-6'>
                <FormCancelButton text={'Discard'} colorBlack={true} />
                <FormProceedButton text={isAddingCity ? 'Adding city...' : 'Add city'} onClick={handleSubmit} disabled={isAddingCity} />
            </div>
        </div>
    );
}

export default AddCity;