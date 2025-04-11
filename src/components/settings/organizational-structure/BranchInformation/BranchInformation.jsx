import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import SearchField from '../../../partials/SearchField/SearchField';
import styles from './BranchInformation.module.css';
import ActionsDropdown from '../../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import { useEffect, useState } from 'react';
import SelectDropdown from '../../../partials/dropdowns/SelectDropdown/SelectDropdown';
import { branchesOptions, branchOptions, subsidiariesOptions, subsidiaryOptions, useActivateBranch, useAddBranch, useDeleteBranch, useSuspendBranch, useUpdateBranch } from '../../../../queries/organization-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Field } from '../../../partials/Elements/Elements';
import { FormCancelButton, FormProceedButton, NewUserButton, WhiteButton } from '../../../partials/buttons/FormButtons/FormButtons';
import { filterItems } from '../../../../utils/helpers';
import AddOrganizationalItemButton from '../AddOrganizationalItemButton';
import { DetailsLoadingIndicator, FormLoadingIndicator, ListLoadingIndicator } from '../../../partials/skeleton-loading-indicators/SettingsIndicator';
import Error from '../../../partials/Error/Error';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import useConfirmedAction from '../../../../hooks/useConfirmedAction';

function BranchInformation() {
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

    const branchId = searchParams.get('branch');
    const action = searchParams.get('action');

    if (!branchId && !action ) {
        // default view (branch list)
        return <ListView onAddClicked={handleAddClicked} />
    } else if (action && action === 'add') {
        // add new branch view
        return <EditView />
    } else if (branchId && !action) {
        // branch detail view
        return <BranchView branchId={branchId} onEditClicked={handleEditClicked} />
    } else if (branchId && action === 'edit') {
        // edit branch view
        return <EditView branchId={branchId} />
    }
}

function ListView({onAddClicked}) {
    // fetch branch list
    const [searchTerm, setSearchTerm] = useState('');
    const {isLoading, error, data: branches} = useQuery(branchesOptions());
    
    if (isLoading) {
        return <ListLoadingIndicator />
    }
    
    if (error) {
        return <Error error={error} />
    }

    const filteredBranches = filterItems(searchTerm, branches, ['name']);

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-4 min-h-full'>
            <div className='flex justify-between items-center'>
                <div className='font-medium'>Branches <span className='text-text-pink'>({branches.length})</span></div>
                <AddOrganizationalItemButton text={'Add branch'} onClick={onAddClicked} permission={'add_branch'} />
            </div>
            <div>
                <SearchField {...{searchTerm, onChange: setSearchTerm}} placeholder={'Search branches'} />
            </div>
            <div className='font-medium text-sm'>
                <div className='bg-[#D8D8D8] flex p-4 border-b-[0.5px] border-b-[#B7B7B7]/75'>
                    <span className='flex-[0_1_25rem]'>Name</span>
                    <span className='ml-5'>&bull; Status</span>
                </div>
                <ul>
                    {
                        filteredBranches.map(branch => {
                            return (
                                <li key={branch.name} >
                                    <NavLink to={`?branch=${branch.id}`} className='border-b-[0.5px] border-b-[#D0D0D0] py-6 px-4 flex'>
                                        <span className='flex-[0_1_25rem]'>{branch.name}</span>
                                        <span className={`${styles['capitalizeFirstLetter']} py-[2px] w-24 rounded-full text-center ${branch.status == 'Active' ? 'bg-[#D8FCDA] text-[#1EC04E]' : 'bg-[#FFF4E5] text-[#F5A623]'}`}>{branch.status}</span>
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

function BranchView({branchId, onEditClicked}) { 
    const {confirmAction, confirmationDialog} = useConfirmedAction();
    const actions = [
        {text: 'Edit', type: 'action', onClick: onEditClicked, permission: 'edit_branch'},
        {text: 'Delete', type: 'action', onClick: () => confirmAction(handleDeleteBranch), permission: 'delete_branch'},
    ];

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    
    // (mutations) delete and suspend branch
    const {isPending: isDeletingBranch, mutate: deleteBranch} = useDeleteBranch({onSuccess, onError, onSettled});
    const {isPending: isSuspendingBranch, mutate: suspendBranch} = useSuspendBranch({onSuccess, onError, onSettled});
    const {isPending: isActivatingBranch, mutate: activateBranch} = useActivateBranch({onSuccess, onError, onSettled});
    
    const isMutating = isDeletingBranch || isSuspendingBranch || isActivatingBranch;

    // (query) fetch branch information and parent subsidiary
    const {isLoading: branchLoading, error: branchError, data: branch} = useQuery(branchOptions(branchId, {enabled: !isMutating}));
    const {isLoading: subsidiaryLoading, error: subsidiaryError, data: parentSubsidiary} = useQuery(subsidiaryOptions(branch?.sub_coy, {enabled: !!branch && !isMutating}));

    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        if (isMutating) {
            let text = isDeletingBranch ? 'Deleting' : ( isSuspendingBranch ? 'Suspending' : 'Activating');
            text += ' branch';
            dispatchMessage('processing', text);
        }
    }, [isMutating]);

    function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['branches']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/settings/organizational-structure/branches')
    }

    function handleDeleteBranch() {
        deleteBranch({id: branchId})
    }
    function handleSuspendBranch() {
        suspendBranch({data: {branch_ids: [branchId]}})
    }
    function handleActivateBranch() {
        activateBranch({data: {branch_ids: [branchId]}})
    }

    const isLoading = branchLoading || subsidiaryLoading;
    const error = branchError || subsidiaryError;

    if (isLoading) {
        return <DetailsLoadingIndicator />
    }

    if (error) {
        return <Error error={error} />
    }

    if (branch.coy_branch_status === 'Active')
        actions.splice(1, 0, {text: 'Suspend', type: 'action', onClick: handleSuspendBranch, permission: 'suspend_branch'})
    else if (branch.coy_branch_status === 'suspended')
        actions.splice(1, 0, {text: 'Activate', type: 'action', onClick: handleActivateBranch, permission: 'activate_branch'})

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8 min-h-full max-h-[calc(100vh-200px)] overflow-y-scroll [&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-gray-400'>
            {confirmationDialog}
            <div className='flex justify-between relative'>
                <h3 className='font-semibold text-xl'>Branch information</h3>
                <ActionsDropdown label={'Actions'} items={actions} />
            </div>
            <div className='flex flex-col gap-4'>
                <h4 className='font-semibold text-lg'>Identification</h4>
                <div className='flex gap-6'>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>Branch name</span>
                        <span>{branch.coy_branch_name}</span>
                    </div>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>Branch code</span>
                        <span>{branch.coy_branch_code}</span>
                    </div>
                </div>
                <div className=''>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>Subsidiary</span>
                        <span>{parentSubsidiary.sub_coy_name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditView({branchId = null}) {

    const action = branchId ? 'edit' : 'add';

    const [formData, setFormData] = useState({
        branch_name: '',
        branch_code: '',
        subsidiary_id: null,
    });

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // fetch subsidiaries.
    const {isLoading: subsidiariesIsLoading, error: subsidiariesError, data: subsidiaries} =  useQuery(subsidiariesOptions());

    // use branch query only when the branchId is present (i.e. in edit mode)
    const {isLoading: branchIsLoading, error: branchError, data: branch} =  useQuery(branchOptions(branchId, {enabled: !!branchId}));

    // mutation to add new branch
    const {isPending: isAddingBranch, mutate: addBranch} = useAddBranch({onSuccess, onError, onSettled});
    const {isPending: isUpdatingBranch, mutate: updateBranch} = useUpdateBranch({onSuccess, onError, onSettled});
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingBranch ? 'Adding branch' : 'Updating branch information';
        (isAddingBranch || isUpdatingBranch) && dispatchMessage('processing', text);
    }, [isAddingBranch, isUpdatingBranch]);

    function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['branches']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/settings/organizational-structure/branches');
    }

    useEffect(()=> {
        if (branchId && branch) {
            setFormData({
                branch_name: branch.coy_branch_name,
                branch_code: branch.coy_branch_code,
                subsidiary_id: branch.sub_coy,
            })
        }
    }, [branchId, branch]);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    function handleSubmit() {
        if (action === 'add') {
            addBranch({data: formData})
        } else if (action === 'edit') {
            updateBranch({id: branchId, data: formData})
        }
    }

    const isLoading = subsidiariesIsLoading || (branchId && branchIsLoading);
    const error = subsidiariesError || (branchId && branchError);

    if (isLoading) {
        return <FormLoadingIndicator />
    }

    if (error) {
        return <Error error={error} />
    }

    const actionInProgress = isAddingBranch || isUpdatingBranch;

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8 min-h-full max-h-[calc(100vh-200px)] overflow-y-scroll [&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-gray-400'>
            <div className=''>
                <h3 className='font-semibold text-xl'>Branch information</h3>
            </div>
            <div className='flex flex-col gap-4'>
                <div className='flex gap-6'>
                    <Field label={'Branch name'} name={'branch_name'} value={formData.branch_name} placeholder='Enter branch name' onChange={handleChange} />
                    <Field label={'Branch code'} name={'branch_code'} value={formData.branch_code} placeholder='Enter branch code' onChange={handleChange} />
                </div>
                <div>
                    <SelectSubsidiaryDropdown subsidiaries={subsidiaries} selected={formData.subsidiary_id} onSelect={handleChange} />
                </div>
            </div>
            <div className='flex gap-6 justify-center'>
                <WhiteButton text={'Cancel'} onClick={() => navigate(-1)} />
                {action == 'add' ? (
                    <NewUserButton
                        text={'Add branch'}
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

export default BranchInformation;