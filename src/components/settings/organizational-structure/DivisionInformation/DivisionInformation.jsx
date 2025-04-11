import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import SearchField from '../../../partials/SearchField/SearchField';
import styles from './DivisionInformation.module.css';
import ActionsDropdown from '../../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import { useEffect, useState } from 'react';
import SelectDropdown from '../../../partials/dropdowns/SelectDropdown/SelectDropdown';
import { divisionOptions, divisionsOptions, subsidiariesOptions, subsidiaryOptions, useActivateDivision, useAddDivision, useDeleteDivision, useSuspendDivision, useUpdateDivision } from '../../../../queries/organization-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FormCancelButton, FormProceedButton, NewUserButton, WhiteButton } from '../../../partials/buttons/FormButtons/FormButtons';
import { Field } from '../../../partials/Elements/Elements';
import { filterItems } from '../../../../utils/helpers';
import AddOrganizationalItemButton from '../AddOrganizationalItemButton';
import { DetailsLoadingIndicator, FormLoadingIndicator, ListLoadingIndicator } from '../../../partials/skeleton-loading-indicators/SettingsIndicator';
import Error from '../../../partials/Error/Error';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import useConfirmedAction from '../../../../hooks/useConfirmedAction';

function DivisionInformation() {
    const [searchParams, setSearchParams] = useSearchParams();

    function handleEditClicked() {
        setSearchParams((prev) => {
            prev.set('action', 'edit');
            return prev;
        });
    }

    function handleAddClicked() {
        setSearchParams((prev) => {
            prev.set('action', 'add');
            return prev;
        });
    }

    const divisionId = searchParams.get('division');
    const action = searchParams.get('action');

    if (!divisionId && !action ) {
        // default view (division list)
        return <ListView onAddClicked={handleAddClicked} />
    } else if (action && action === 'add') {
        // add new division view
        return <EditView />
    } else if (divisionId && !action) {
        // division detail view
        return <DivisionView divisionId={divisionId} onEditClicked={handleEditClicked} />
    } else if (divisionId && action === 'edit') {
        // edit division view
        return <EditView divisionId={divisionId} />
    }
}

function ListView({onAddClicked}) {
    // fetch division list
    const [searchTerm, setSearchTerm] = useState('');
    const {isLoading, error, data: divisions} = useQuery(divisionsOptions());

    if (isLoading) {
        return <ListLoadingIndicator />
    }

    if (error) {
        return <Error error={error} />
    }

    const filteredDivisions = filterItems(searchTerm, divisions, ['name']);

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-4 min-h-full'>
            <div className='flex justify-between items-center'>
                <div className='font-medium'>Divisions <span className='text-text-pink'>({divisions.length})</span></div>
                <AddOrganizationalItemButton text={'Add division'} onClick={onAddClicked} permission={'add_division'} />
            </div>
            <div>
                <SearchField {...{searchTerm, onChange: setSearchTerm}} placeholder={'Search divisions'} />
            </div>
            <div className='font-medium text-sm'>
                <div className='bg-[#D8D8D8] flex p-4 border-b-[0.5px] border-b-[#B7B7B7]/75'>
                    <span className='flex-[0_1_25rem]'>Name</span>
                    <span className='ml-5'>&bull; Status</span>
                </div>
                <ul>
                    {
                        filteredDivisions.map(division => {
                            return (
                                <li key={division.id} >
                                    <NavLink to={`?division=${(division.id)}`} className='border-b-[0.5px] border-b-[#D0D0D0] py-6 px-4 flex'>
                                        <span className='flex-[0_1_25rem]'>{division.name}</span>
                                        <span className={`${styles.capitalizeFirstLetter} py-[2px] w-24 rounded-full text-center ${division.status == 'Active' ? 'bg-[#D8FCDA] text-[#1EC04E]' : 'bg-[#FFF4E5] text-[#F5A623]'}`}>{division.status}</span>
                                    </NavLink>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        </div>
    );
}

function DivisionView({divisionId, onEditClicked}) {
    const {confirmAction, confirmationDialog} = useConfirmedAction();
    const actions = [
        {text: 'Edit', type: 'action', onClick: onEditClicked, permission: 'edit_division'},
        {text: 'Delete', type: 'action', onClick: () => confirmAction(handleDeleteDivision), permission: 'delete_division'},
    ];

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    
    // (mutations) delete and suspend division
    const {isPending: isDeletingDivision, mutate: deleteDivision} = useDeleteDivision({onSuccess, onError, onSettled});
    const {isPending: isSuspendingDivision, mutate: suspendDivision} = useSuspendDivision({onSuccess, onError, onSettled});
    const {isPending: isActivatingDivision, mutate: activateDivision} = useActivateDivision({onSuccess, onError, onSettled});
    
    const isMutating = isDeletingDivision || isSuspendingDivision || isActivatingDivision;

    // (query) fetch division information and parent subsidiary
    const {isLoading: divisionLoading, error: divisionError, data: division} = useQuery(divisionOptions(divisionId, {enabled: !isMutating}));
    const {isLoading: subsidiaryLoading, error: subsidiaryError, data: parentSubsidiary} = useQuery(subsidiaryOptions(division?.sub_coy, {enabled: !!division && !isMutating}));

    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        if (isMutating) {
            let text = isDeletingDivision ? 'Deleting' : ( isSuspendingDivision ? 'Suspending' : 'Activating');
            text += ' division';
            dispatchMessage('processing', text);
        }
    }, [isMutating]);
    function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['divisions']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/settings/organizational-structure/divisions')
    }

    function handleDeleteDivision() {
        deleteDivision({id: divisionId})
    }
    function handleSuspendDivision() {
        suspendDivision({data: {division_ids: [divisionId]}})
    }
    function handleActivateDivision() {
        activateDivision({data: {division_ids: [divisionId]}})
    }

    const isLoading = divisionLoading || subsidiaryLoading;
    const error = divisionError || subsidiaryError;

    if (isLoading) {
        return <DetailsLoadingIndicator />
    }

    if (error) {
        return <Error error={error} />
    }

    console.log('Full division object:', division);
    const status = division.coy_div_status || division.status;
    console.log('Division status:', status);
    
    if (status === 'Active' || status === 'active' || status === 'activated')
        actions.splice(1, 0, {text: 'Suspend', type: 'action', onClick: handleSuspendDivision, permission: 'suspend_division'})
    else if (status === 'suspended' || status === 'Suspended')
        actions.splice(1, 0, {text: 'Activate', type: 'action', onClick: handleActivateDivision, permission: 'activate_division'})

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8 min-h-full max-h-[calc(100vh-200px)] overflow-y-scroll [&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-gray-400'>
            {confirmationDialog}
            <div className='flex justify-between relative'>
                <h3 className='font-semibold text-xl'>Division information</h3>
                <ActionsDropdown label={'Actions'} items={actions} />
            </div>
            <div className='flex flex-col gap-4'>
                <div className='flex gap-6'>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>Division name</span>
                        <span>{division.coy_div_name}</span>
                    </div>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>Division code</span>
                        <span>{division.coy_div_code}</span>
                    </div>
                </div>
                <div className=''>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>Parent subsidiary</span>
                        <span>{parentSubsidiary.sub_coy_name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditView({divisionId = null}) {

    const action = divisionId ? 'edit' : 'add';

    const [formData, setFormData] = useState({
        division_name: '',
        division_code: '',
        subsidiary_id: null,
    });

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // fetch subsidiaries.
    const {isLoading: subsidiariesIsLoading, error: subsidiariesError, data: subsidiaries} =  useQuery(subsidiariesOptions());

    // use division query only when the divisionId is present (i.e. in edit mode)
    const {isLoading: divisionIsLoading, error: divisionError, data: division} =  useQuery(divisionOptions(divisionId, {enabled: !!divisionId}));

    // mutation to add new division
    const {isPending: isAddingDivision, mutate: addDivision} = useAddDivision({onSuccess, onError, onSettled});
    const {isPending: isUpdatingDivision, mutate: updateDivision} = useUpdateDivision({onSuccess, onError, onSettled});
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingDivision ? 'Adding division' : 'Updating division information';
        (isAddingDivision || isUpdatingDivision) && dispatchMessage('processing', text);
    }, [isAddingDivision, isUpdatingDivision]);
    function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['divisions']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/settings/organizational-structure/divisions');
    }

    useEffect(()=> {
        if (divisionId && division) {
            setFormData({
                division_name: division.coy_div_name,
                division_code: division.coy_div_code,
                subsidiary_id: division.sub_coy,
            })
        }
    }, [divisionId, division]);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    function handleSubmit() {
        if (action === 'add') {
            addDivision({data: formData})
        } else if (action === 'edit') {
            updateDivision({id: divisionId, data: formData})
        }
    }

    const isLoading = subsidiariesIsLoading || (divisionId && divisionIsLoading);
    const error = subsidiariesError || (divisionId && divisionError);

    if (isLoading) {
        return <FormLoadingIndicator />
    }

    if (error) {
        return <Error error={error} />
    }

    const actionInProgress = isAddingDivision || isUpdatingDivision;

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8 min-h-full max-h-[calc(100vh-200px)] overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-gray-400'>
            <div className=''>
                <h3 className='font-semibold text-xl'>Division information</h3>
            </div>
            <div className='flex flex-col gap-4'>
                <div className='flex gap-6'>
                    <Field label={'Divison name'} name={'division_name'} value={formData.division_name} placeholder='Enter division name' onChange={handleChange} />
                    <Field label={'Division code'} name={'division_code'} value={formData.division_code} placeholder='Enter division code' onChange={handleChange} />
                </div>
                <div>
                    <SelectSubsidiaryDropdown subsidiaries={subsidiaries} selected={formData.subsidiary_id} onSelect={handleChange} />
                </div>
            </div>
            <div className='flex gap-6 justify-center'>
                <WhiteButton text={'Cancel'} onClick={() => navigate(-1)} />
                {action == 'add' ? (
                    <NewUserButton
                        text={'Add division'}
                        onClick={handleSubmit}
                        disabled={actionInProgress}
                        isLoading={actionInProgress}
                    />
                ) : (
                    <FormProceedButton 
                        text={'Save changes'} 
                        onClick={handleSubmit} 
                        disabled={actionInProgress} 
                    />
                )}
            </div>
        </div>
    );
}

function SelectSubsidiaryDropdown({subsidiaries, selected = null, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const items = subsidiaries.map(subsidiary => ({id: subsidiary.id, text: subsidiary.name}));

    return <SelectDropdown items={items} name={'subsidiary_id'} selected={selected} onSelect={onSelect} label={'Subsidiary'} placeholder={'Select subsidiary'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
}

export default DivisionInformation;