import styles from './UpdateStrategyThemes.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import { useQueryClient } from '@tanstack/react-query';
import { useAddStrategyThemes } from '../../../../queries/strategies/strategy-queries';
import { useEffect, useState } from 'react';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';
import LinkButton from '../../../partials/buttons/LinkButton/LinkButton';
import { Field, H3 } from '../../../partials/Elements/Elements';
import { useNavigate, useParams } from 'react-router-dom';
import AddNewButton from '../../../partials/buttons/AddNewButton/AddNewButton';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import importIcon from '../../../../assets/icons/import.svg';


function UpdateStrategyThemes() {

    const [validationErrors, setValidationErrors] = useState({});
    const {id: strategyId, mode} = useParams();
    const [formData, setFormData] = useState({
        themes: [
            {name: '', description: '', result: ''},
        ]
    });

    const queryClient = useQueryClient();
    const navigate = useNavigate();


    // add strategy themes mutation
    const {isPending: isAddingThemes, mutate: addThemes} = useAddStrategyThemes(strategyId, {onSuccess, onError, onSettled});

    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = 'Adding strategy Themes';
        (isAddingThemes) && dispatchMessage('processing', text);
    }, [isAddingThemes]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['strategies']});
        dispatchMessage('success', data.message);
        return null;
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // navigate to view mode if successful
        if (!error) navigate(`/strategies/${strategyId}/themes`);
    }

    function addTheme() {
        setFormData({
            themes: [...formData.themes, {name: '', description: '', result: ''}]
        });
    }

    function handleChange(e, index) {
        setFormData({
            themes: formData.themes.map((t, i) => {
                if (i !== index) return t;
                else return {...t, [e.target.name]: e.target.value};
            })
        })
    }

    function handleSubmit() {
        addThemes({data: formData});
    }

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Strategy Themes'} />
            <PageHeader>
                <LinkButton text={'Import'} icon={importIcon} />
            </PageHeader>
            <div className='flex flex-col gap-6'>
                <form className='border border-[#CCC] bg-white rounded-lg p-6 flex flex-col gap-6'>
                    <H3>Strategy Themes</H3>
                    <ul className='flex flex-col gap-6'>
                    {
                        formData.themes.map((t, i) => {
                            return (
                                <li key={i} className='flex gap-6'>
                                    <span className='self-start'>{i+1}.</span>
                                    <Theme theme={t} onChange={(e) => handleChange(e, i)} />
                                </li>
                            );
                        })
                    }
                    </ul>
                    <AddNewButton text={'Add theme'} onClick={addTheme} />
                </form>
                <div className='flex gap-6 px-6'>
                    <FormCancelButton text={'Discard'} colorBlack={true}  />
                    <FormProceedButton text={isAddingThemes ? 'Adding themes...' : 'Add'} onClick={handleSubmit} disabled={isAddingThemes}  />
                </div>
            </div>
        </div>
    )
}

function Theme({theme, onChange, error}) {
    return (
        <div className='flex-1 flex flex-col gap-6'>
            <Field {...{label: 'Name', name: 'name', value: theme.name, onChange, placeholder: 'Enter theme name', error}} />
            <Field {...{label: 'Description', name: 'description', value: theme.description, onChange,   placeholder: 'Enter theme description', error, type: 'textbox', height: 100}} />
            <Field {...{label: 'Result', name: 'result', value: theme.result, onChange,   placeholder: 'Enter theme result', error, type: 'textbox', height: 100}} />
        </div>
    );
}

export default UpdateStrategyThemes;