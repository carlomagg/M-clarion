import { useEffect, useState } from 'react';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';
import { Field } from '../../../partials/Elements/Elements';
import styles from './AddCountry.module.css';
import { useAddCountry } from '../../../../queries/location-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import BackButton from '../../components/BackButton';

function AddCountry() {

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        country_name: '',
        country_code: ''
    });

    const {isPending: isAddingCountry, mutate} = useAddCountry({onSuccess, onError, onSettled});
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        (isAddingCountry) && dispatchMessage('processing', 'Adding country')
    }, [isAddingCountry]);
    function onSuccess(data) {
        dispatchMessage('success', data.message)
        return queryClient.invalidateQueries({queryKey: ['countries']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message)
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

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8'>
            <header className='flex gap-3'>
                <BackButton />
                <h3 className='font-semibold text-xl'>Add Country</h3>
            </header>
            <div className='flex gap-6'>
                <Field label={'Country name'} name={'country_name'} value={formData['country_name']} onChange={handleChange} placeholder={'Enter country name'} />
                <Field label={'Country code'} name={'country_code'} value={formData['country_code']} onChange={handleChange} placeholder={'Enter country code'} />
            </div>
            <div className='flex gap-6'>
                <FormCancelButton text={'Discard'} colorBlack={true} />
                <FormProceedButton text={isAddingCountry ? 'Adding countries...' : 'Add country'} onClick={handleSubmit} disabled={isAddingCountry} />
            </div>
        </div>
    );
}

export default AddCountry;