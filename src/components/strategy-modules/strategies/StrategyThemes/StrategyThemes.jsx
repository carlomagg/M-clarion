
import { Field, H3 } from '../../../partials/Elements/Elements';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import LinkButton from '../../../partials/buttons/LinkButton/LinkButton';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { strategyThemesOptions, useDeleteStrategyTheme, useUpdateStrategyTheme } from '../../../../queries/strategies/strategy-queries';
import OptionsDropdown from '../../../partials/dropdowns/OptionsDropdown/OptionsDropdown';
import { useEffect, useState } from 'react';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';
import importIcon from '../../../../assets/icons/import.svg';
import plusIcon from '../../../../assets/icons/plus.svg';
import useConfirmedAction from '../../../../hooks/useConfirmedAction';


function StrategyThemes() {
    const {id: strategyId} = useParams();
    const navigate = useNavigate();

    // fetch strategy themes
    const {isLoading, error, data: themes} = useQuery(strategyThemesOptions(strategyId));

    if (isLoading) return <div>loading</div>
    if (error) return <div>error occured</div>
    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Strategy Themes'} />
            <PageHeader>
                <div className='flex gap-3 items-center'>
                    <LinkButton text={'Import'} icon={importIcon} />
                    <LinkButton text={'Add More Themes'} icon={plusIcon} onClick={() => navigate('add')} />
                </div>
            </PageHeader>
            <div className='mt-4 flex flex-col gap-6'> {/* main content container */} 
                {
                    themes && themes.length > 0 ?
                    <div className='p-6 flex flex-col gap-6 bg-white rounded-lg border border-[#CCC]'>
                        <H3>Strategy Themes</H3>

                        <ul className='flex flex-col gap-6'>
                            {
                                themes.map((t, i) => {
                                    return (
                                        <li key={i}>
                                            <ThemeItem strategyId={strategyId} theme={t} index={i} />
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </div> :
                    <div className='h-96 grid place-items-center'>
                        <div className='flex flex-col gap-6 items-center'>
                            <span>Themes have not been added to this strategy</span>
                            <Link to={'add'} className='w-96 bg-button-pink py-4 text-center font-bold text-lg text-white rounded-lg'>Add Strategy Themes</Link>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

function ThemeItem({strategyId, theme, index}) {
    const queryClient = useQueryClient();
    const [inEditMode, setInEditMode] = useState(false);
    const [formData, setFormData] = useState({strategy_id: strategyId, theme});
    const {confirmAction, confirmationDialog} = useConfirmedAction();

    // delete and edit theme mutations
    const {isPending: isDeletingTheme, mutate: deleteTheme} = useDeleteStrategyTheme(theme.id, {onSuccess, onError});
    const {isPending: isUpdatingTheme, mutate: updateTheme} = useUpdateStrategyTheme(theme.id, {onSuccess, onError, onSettled: (data, error) => !error && setInEditMode(false)});

    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isDeletingTheme ? 'Deleting strategy theme' : 'Updating strategy theme';
        (isDeletingTheme || isUpdatingTheme) && dispatchMessage('processing', text);
    }, [isDeletingTheme, isUpdatingTheme]);

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
            theme: {...formData.theme, [e.target.name]: e.target.value}
        });
    }

    const actions = [
        {text: 'Edit', type: 'action', action: () => setInEditMode(true)},
        {text: 'Delete', type: 'action', action: () => confirmAction(deleteTheme)},
    ];

    const viewMode = (
        <div className='flex gap-6 relative'>
            {confirmationDialog}
            <OptionsDropdown options={actions} classes='absolute top-0 right-0 m-1'  />
            <span className='self-start'>{index+1}.</span>
            <div className='flex flex-col gap-6'>
                <div className='space-y-3'>
                    <h4 className='font-medium'>Theme</h4>
                    <p>{theme.name}</p>
                </div>
                <div className='space-y-3'>
                    <h4 className='font-medium'>Description</h4>
                    <p>{theme.description}</p>
                </div>
                <div className='space-y-3'>
                    <h4 className='font-medium'>Result</h4>
                    <p>{theme.result}</p>
                </div>
            </div>
        </div>
    );

    const editMode = (
        <form className='flex gap-6'>
            <span className='self-start'>{index+1}.</span>
            <div className='flex-1 flex flex-col gap-6'>
                <Field {...{label: 'Name', name: 'name', value: formData.theme.name, onChange: handleChange, placeholder: 'Enter theme name'}} />
                <Field {...{label: 'Description', name: 'description', value: formData.theme.description, onChange: handleChange,   placeholder: 'Enter theme description', type: 'textbox', height: 100}} />
                <Field {...{label: 'Result', name: 'result', value: formData.theme.result, onChange: handleChange,   placeholder: 'Enter theme result', type: 'textbox', height: 100}} />
                <div className='flex gap-6 px-6'>
                    <FormCancelButton text={'Discard'} onClick={() => setInEditMode(false)} colorBlack={true}  />
                    <FormProceedButton text={isUpdatingTheme ? 'Updating...' : 'Update'} disabled={isUpdatingTheme} onClick={() => updateTheme({data: formData})} />
                </div>
            </div>
        </form>
    )

    return inEditMode ? editMode : viewMode;
}

export default StrategyThemes;