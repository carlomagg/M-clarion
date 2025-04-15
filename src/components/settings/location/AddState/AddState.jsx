import { useEffect, useState } from 'react';
import { FormCancelButton, FormProceedButton, NewUserButton, WhiteButton } from '../../../partials/buttons/FormButtons/FormButtons';
import { Field } from '../../../partials/Elements/Elements';
import styles from './AddState.module.css';
import SelectDropdown from '../../../partials/dropdowns/SelectDropdown/SelectDropdown';
import { countriesOptions } from '../../../../queries/location-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAddState } from '../../../../queries/location-queries';
import { FormLoadingIndicator } from '../../../partials/skeleton-loading-indicators/SettingsIndicator';
import Error from '../../../partials/Error/Error';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import BackButton from '../../components/BackButton';

function AddState() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        country_id: '',
        state_name: ''
    });

    const [countriesDropdownCollapsed, setCountriesDropdownCollapse] = useState(true);

    // fetch countries
    const {isLoading, error, data: returnedCountries} = useQuery(countriesOptions());

    const {isPending: isAddingState, mutate} = useAddState({onSuccess, onError, onSettled});
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        (isAddingState) && dispatchMessage('processing', 'Adding state')
    }, [isAddingState]);
    function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['countries']});
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

    const countries = returnedCountries.map(country => ({id: country.country_id, text: country.country_name}))

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8 min-h-full'>
            <header className='flex gap-3'>
                <BackButton />
                <h3 className='font-semibold text-xl'>Add State</h3>
            </header>
            <SelectDropdown label={'Country'} name={'country_id'} selected={formData.country_id} items={countries} placeholder={'Select country'} isCollapsed={countriesDropdownCollapsed} onToggleCollpase={setCountriesDropdownCollapse} onSelect={handleChange} />
            <div className='flex gap-6'>
                <Field label={'State name'} name={'state_name'} value={formData['state_name']} onChange={handleChange} placeholder={'Enter state name'} />
            </div>
            <div className='flex gap-6 justify-center'>
                <WhiteButton text={'Cancel'} onClick={() => navigate(-1)} />
                <NewUserButton text={'Add state'} onClick={handleSubmit} disabled={isAddingState} isLoading={isAddingState} />
            </div>
        </div>
    );
}

export default AddState;