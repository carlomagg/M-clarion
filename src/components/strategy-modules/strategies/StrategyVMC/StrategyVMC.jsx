import styles from './StrategyVMC.module.css';
import PageHeader from '../../../partials/PageHeader/PageHeader';
import LinkButton from '../../../partials/buttons/LinkButton/LinkButton';
import { Field, H3 } from '../../../partials/Elements/Elements';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { strategyVMCOptions, useDeleteStrategyCoreValue, useUpdateStrategyCoreValue } from '../../../../queries/strategies/strategy-queries';
import { Link, useNavigate, useParams } from 'react-router-dom';
import OptionsDropdown from '../../../partials/dropdowns/OptionsDropdown/OptionsDropdown';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import { useEffect, useState } from 'react';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';
import importIcon from '../../../../assets/icons/import.svg';
import exportIcon from '../../../../assets/icons/export.svg';
import plusIcon from '../../../../assets/icons/plus.svg';
import useConfirmedAction from '../../../../hooks/useConfirmedAction';

function StrategyVMC() {
    const {id: strategyId} = useParams();
    const navigate = useNavigate();

    // fetch strategy vmc
    const {isLoading, error, data: vmc} = useQuery(strategyVMCOptions(strategyId));

    if (isLoading) return <div>loading</div>
    if (error && error.response.status !== 404) return <div>error occured</div>

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Strategy VMC'} />
            <PageHeader>
                <div className='flex gap-3 items-center'>
                    <LinkButton text={'Import'} icon={importIcon} />
                    <LinkButton text={'Export'} icon={exportIcon} />
                    {!error && <LinkButton text={'Edit'} icon={plusIcon} onClick={() => navigate('edit')} />}
                </div>
            </PageHeader>
            <div className='mt-4 flex flex-col gap-6'> {/* main content container */}
                {
                    error && error.response.status === 404 ?
                    <div className='h-96 grid place-items-center'>
                        <div className='flex flex-col gap-6 items-center'>
                            <span>VMC has not been created for this strategy</span>
                            <Link to={'add'} className='w-96 bg-button-pink py-4 text-center font-bold text-lg text-white rounded-lg'>Create VMC</Link>
                        </div>
                    </div> :
                    <>
                        <div className='p-6 flex flex-col gap-6 bg-white rounded-lg border border-[#CCC]'>
                            <H3>Strategy VMC</H3>

                            <div className='space-y-3'>
                                <h4 className='font-medium'>Vision Statement</h4>
                                <p>{vmc.vision_statement}</p>
                            </div>

                            <div className='space-y-3'>
                                <h4 className='font-medium'>Mission Statement</h4>
                                <p>{vmc.mission_statement}</p>
                            </div>
                            
                        </div>

                        <div className='p-6 flex flex-col gap-6 bg-white rounded-lg border border-[#CCC]'>
                            <H3>Core Values</H3>

                            {
                                vmc.core_values.length > 0 ?
                                <ul className='flex flex-col gap-6'>
                                    {
                                        vmc.core_values.map((cv, i) => {
                                            return (
                                                <li key={i}>
                                                    <CoreValueItem coreValue={cv} index={i} />
                                                </li>
                                            );
                                        })
                                    }
                                </ul> :
                                <div>No core values for this VMC. Edit VMC to add</div>

                            }
                        </div>
                    </>
                }
            </div>
        </div>
    )
}

function CoreValueItem({coreValue, index}) {
    const queryClient = useQueryClient();
    const [inEditMode, setInEditMode] = useState(false);
    const [formData, setFormData] = useState(coreValue);
    const {confirmAction, confirmationDialog} = useConfirmedAction();

    // delete and edit core value mutations
    const {isPending: isDeletingCoreValue, mutate: deleteCoreValue} = useDeleteStrategyCoreValue(coreValue.id, {onSuccess, onError});
    const {isPending: isUpdatingCoreValue, mutate: updateCoreValue} = useUpdateStrategyCoreValue(coreValue.id, {onSuccess, onError, onSettled: (data, error) => !error && setInEditMode(false)});

    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isDeletingCoreValue ? 'Deleting VMC core value' : 'Updating VMC core value';
        (isDeletingCoreValue || isUpdatingCoreValue) && dispatchMessage('processing', text);
    }, [isDeletingCoreValue, isUpdatingCoreValue]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['strategies']});
        dispatchMessage('success', data.message);
        return null;
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const actions = [
        {text: 'Edit', type: 'action', action: () => setInEditMode(true)},
        {text: 'Delete', type: 'action', action: () => confirmAction(deleteCoreValue)},
    ];

    const viewMode = (
        <div className='flex gap-6 relative'>
            {confirmationDialog}
            <OptionsDropdown options={actions} classes={'absolute top-0 right-0 m-1'} />
            <span className='self-start'>{index+1}.</span>
            <div className='flex flex-col gap-6'>
                <div className='space-y-3'>
                    <h4 className='font-medium'>Core value</h4>
                    <p>{coreValue.name}</p>
                </div>
                <div className='space-y-3'>
                    <h4 className='font-medium'>Core value description</h4>
                    <p>{coreValue.description}</p>
                </div>
            </div>
        </div>
    );

    const editMode = (
        <form className='flex gap-6'>
            <span className='self-start'>{index+1}.</span>
            <div className='flex-1 flex flex-col gap-6'>
                <Field {...{label: 'Core Value Name', name: 'name', value: formData.name, onChange: handleChange, placeholder: 'Enter core value name'}} />
                <Field {...{label: 'Core Value Description', name: 'description', value: formData.description, onChange: handleChange,   placeholder: 'Enter core value description', type: 'textbox', height: 100}} />
                <div className='flex gap-6 px-6'>
                    <FormCancelButton text={'Discard'} colorBlack={true} onClick={() => setInEditMode(false)} />
                    <FormProceedButton text={isUpdatingCoreValue ? 'Updating...' : 'Update'} onClick={() => updateCoreValue({data: formData})} />
                </div>
            </div>
        </form>
    )
    return inEditMode ? editMode : viewMode;
}

export default StrategyVMC;