import styles from './UpdateStrategyVMC.module.css';


import PageHeader from '../../../partials/PageHeader/PageHeader';
import LinkButton from '../../../partials/buttons/LinkButton/LinkButton';
import { Field, H3 } from '../../../partials/Elements/Elements';
import { useEffect, useState } from 'react';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { strategyVMCOptions, useAddStrategyVMC, useUpdateStrategyVMC } from '../../../../queries/strategies/strategy-queries';
import AddNewButton from '../../../partials/buttons/AddNewButton/AddNewButton';
import { useNavigate, useParams } from 'react-router-dom';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import importIcon from '../../../../assets/icons/import.svg';


function UpdateStrategyVMC() {
    const [validationErrors, setValidationErrors] = useState({});
    const {id: strategyId, mode} = useParams();
    const [formData, setFormData] = useState({
        vision_statement: '',
        mission_statement: '',
        core_values: [
            {
                name: '',
                description: ''
            }
        ]
    });

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // fetch all strategies and components
    const {isLoading, error, data: vmc} = useQuery(strategyVMCOptions(strategyId, {enabled: mode === 'edit'}));

    useEffect(() => {
        if (vmc) {
            setFormData(vmc)
        }
    }, [vmc])

    // add and edit strategy VMC mutation
    const {isPending: isAddingVMC, mutate: addVMC} = useAddStrategyVMC(strategyId, {onSuccess, onError, onSettled});
    const {isPending: isUpdatingVMC, mutate: updateVMC} = useUpdateStrategyVMC(strategyId, {onSuccess, onError, onSettled});

    const dispatchMessage = useDispatchMessage()
    useEffect(() => {
        let text = isAddingVMC ? 'Adding strategy VMC' : 'Updating strategy VMC';
        (isAddingVMC || isUpdatingVMC) && dispatchMessage('processing', text);
    }, [isAddingVMC, isUpdatingVMC]);

    function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['strategies']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        // navigate to view mode if successful
        if (!error) navigate(`/strategies/${strategyId}/vmc`);
    }

    function addCoreValue() {
        setFormData({
            ...formData,
            core_values: [
                ...formData.core_values,
                {
                    name: '',
                    description: ''
                }
            ]
        })
    }

    function handleChange(e, cvIndex = false) {
        let newFormData = {};
        if (cvIndex === false) {
            newFormData = {
                ...formData,
                [e.target.name]: e.target.value
            };
        } else {
            newFormData = {
                ...formData,
                core_values: formData.core_values.map((cv, i) => {
                    if (i !== cvIndex) return cv;
                    else {
                        return {...cv, [e.target.name]: e.target.value}
                    }
                })
            };
        }
        setFormData(newFormData)
    }

    function handleSubmit() {
        mode === 'add' ? addVMC({data: formData}) : updateVMC({data: formData});
    }

    if (mode === 'edit' && isLoading) return <div>loading</div>
    if (mode === 'edit' && error) return <div>error occured</div>

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Strategy VMC'} />
            <PageHeader>
                <LinkButton text={'Import'} icon={importIcon} />
            </PageHeader>
            <div className='mt-4 flex flex-col gap-6'> {/* main content container */}
                <div className='p-6 flex flex-col gap-6 bg-white rounded-lg border border-[#CCC]'>
                    <H3>Strategy VMC</H3>

                    <Field {...{label: 'Vison Statement', name: 'vision_statement', value: formData.vision_statement, onChange: handleChange, placeholder: 'Enter vision statement', error: validationErrors['vision_statement']}} />

                    <Field {...{label: 'Mission Statement', name: 'mission_statement', value: formData.mission_statement, onChange: handleChange, placeholder: 'Enter mission statement', error: validationErrors['mission_statement']}} />

                    
                </div>

                <div className='p-6 flex flex-col gap-6 bg-white rounded-lg border border-[#CCC]'>
                    <H3>Core Values</H3>

                    <ul className='flex flex-col gap-6'>
                        {
                            formData.core_values.map((cv, i) => {
                                return (
                                    <li key={i} className='flex gap-6'>
                                        <span className='self-start'>{i+1}.</span>
                                        <CoreValue coreValue={cv} onChange={(e) => handleChange(e, i)} />
                                    </li>
                                );
                            })
                        }
                    </ul>
                    <AddNewButton text={'Add core value'} onClick={addCoreValue} />
                </div>

                <div className='flex gap-6 px-6'>
                    <FormCancelButton text={'Discard'} colorBlack={true}  />
                    <FormProceedButton text={isAddingVMC || isUpdatingVMC ? 'Updating' : 'Update'} disabled={isAddingVMC || isUpdatingVMC} onClick={handleSubmit} />
                </div>
            </div>
        </div>
    )
}

function CoreValue({coreValue, onChange, error}) {
    return (
        <div className='flex-1 flex flex-col gap-6'>
            <Field {...{label: 'Core Value Name', name: 'name', value: coreValue.name, onChange, placeholder: 'Enter core value name', error}} />
            <Field {...{label: 'Core Value Description', name: 'description', value: coreValue.description, onChange,   placeholder: 'Enter core value description', error, type: 'textbox', height: 100}} />
        </div>
    );
}

export default UpdateStrategyVMC;