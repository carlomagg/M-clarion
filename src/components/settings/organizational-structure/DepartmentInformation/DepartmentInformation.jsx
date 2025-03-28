import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import SearchField from '../../../partials/SearchField/SearchField';
import styles from './DepartmentInformation.module.css';
import ActionsDropdown from '../../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import { useEffect, useState } from 'react';
import SelectDropdown from '../../../partials/dropdowns/SelectDropdown/SelectDropdown';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { departmentOptions, departmentsOptions, divisionOptions, divisionsOptions, subsidiaryOptions, subsidiariesOptions, useActivateDepartment, useAddDepartment, useDeleteDepartment, useSuspendDepartment, useUpdateDepartment } from '../../../../queries/organization-queries';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';
import { Field } from '../../../partials/Elements/Elements';
import { filterItems } from '../../../../utils/helpers';
import AddOrganizationalItemButton from '../AddOrganizationalItemButton';
import { DetailsLoadingIndicator, FormLoadingIndicator, ListLoadingIndicator } from '../../../partials/skeleton-loading-indicators/SettingsIndicator';
import Error from '../../../partials/Error/Error';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import useConfirmedAction from '../../../../hooks/useConfirmedAction';

function DepartmentInformation() {
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

    const departmentId = searchParams.get('department');
    const action = searchParams.get('action');

    if (!departmentId && !action ) {
        // default view (department list)
        return <ListView onAddClicked={handleAddClicked} />
    } else if (action && action === 'add') {
        // add new department view
        return <EditView />
    } else if (departmentId && !action) {
        // department detail view
        return <DepartmentView departmentId={departmentId} onEditClicked={handleEditClicked} />
    } else if (departmentId && action === 'edit') {
        // edit department view
        return <EditView departmentId={departmentId} />
    }
}

function ListView({onAddClicked}) {

     // fetch department list
     const [searchTerm, setSearchTerm] = useState('');
     const {isLoading, error, data: departments} = useQuery(departmentsOptions());

     if (isLoading) {
         return <ListLoadingIndicator />
     }
 
     if (error) {
         return <Error error={error} />
     }

     const filteredDepartments = filterItems(searchTerm, departments, ['name']);

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-4 min-h-full'>
            <div className='flex flex-col gap-3'>
                <h3 className='font-semibold'>Departments <span className='text-text-pink'>({departments.length})</span></h3>
                <SearchField {...{searchTerm, onChange: setSearchTerm}} placeholder={'Search departments'} />
            </div>
            <div className='font-medium text-sm'>
                <div className='bg-[#D8D8D8] flex p-4 border-b-[0.5px] border-b-[#B7B7B7]/75'>
                    <span className='flex-[0_1_25rem]'>Name</span>
                    <span className='ml-5'>&bull; Status</span>
                </div>
                <ul>
                    {
                        filteredDepartments.map(department => {
                            return (
                                <li key={department.name} >
                                    <NavLink to={`?department=${department.id}`} className='border-b-[0.5px] border-b-[#D0D0D0] py-6 px-4 flex'>
                                        <span className='flex-[0_1_25rem]'>{department.name}</span>
                                        <span className={`${styles['capitalizeFirstLetter']} py-[2px] w-24 rounded-full text-center ${department.status == 'Active' ? 'bg-[#D8FCDA] text-[#1EC04E]' : 'bg-[#FFF4E5] text-[#F5A623]'}`}>{department.status}</span>
                                    </NavLink>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
            <div className='flex justify-end'>
                <AddOrganizationalItemButton text={'Add department'} onClick={onAddClicked} permission={'add_department'} />
            </div>
        </div>
    );
}

function DepartmentView({departmentId, onEditClicked}) {
    const {confirmAction, confirmationDialog} = useConfirmedAction();
    const actions = [
        {text: 'Edit', type: 'action', onClick: onEditClicked, permission: 'edit_department'},
        {text: 'Delete', type: 'action', onClick: () => confirmAction(handleDeleteDepartment), permission: 'delete_department'},
    ];

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    
    // (mutations) delete and suspend department
    const {isPending: isDeletingDepartment, mutate: deleteDepartment} = useDeleteDepartment({onSuccess, onError, onSettled});
    const {isPending: isSuspendingDepartment, mutate: suspendDepartment} = useSuspendDepartment({onSuccess, onError, onSettled});
    const {isPending: isActivatingDepartment, mutate: activateDepartment} = useActivateDepartment({onSuccess, onError, onSettled});
    
    const isMutating = isDeletingDepartment || isSuspendingDepartment || isActivatingDepartment;

    // (query) fetch department information and parent division
    const {isLoading: departmentLoading, error: departmentError, data: department} = useQuery(departmentOptions(departmentId, {enabled: !isMutating}));
    const {isLoading: divisionLoading, error: divisionError, data: parentDivision} = useQuery(divisionOptions(department?.coy_div, {enabled: !!department && !isMutating}));

    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        if (isMutating) {
            let text = isDeletingDepartment ? 'Deleting' : ( isSuspendingDepartment ? 'Suspending' : 'Activating');
            text += ' department';
            dispatchMessage('processing', text);
        }
    }, [isMutating]);
    function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['departments']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/settings/organizational-structure/departments')
    }

    function handleDeleteDepartment() {
        deleteDepartment({id: departmentId})
    }
    function handleSuspendDepartment() {
        suspendDepartment({data: {dept_ids: [departmentId]}})
    }
    function handleActivateDepartment() {
        activateDepartment({data: {dept_ids: [departmentId]}})
    }

    const isLoading = departmentLoading || divisionLoading;
    const error = departmentError || divisionError;

    if (isLoading) {
        return <DetailsLoadingIndicator />
    }

    if (error) {
        return <Error error={error} />
    }

    if (department.dept_status === 'Active')
        actions.splice(1, 0, {text: 'Suspend', type: 'action', onClick: handleSuspendDepartment, permission: 'suspend_department'})
    else if (department.dept_status === 'suspended')
        actions.splice(1, 0, {text: 'Activate', type: 'action', onClick: handleActivateDepartment, permission: 'activate_department'})

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8 min-h-full'>
            {confirmationDialog}
            <div className='flex justify-between relative'>
                <h3 className='font-semibold text-xl'>Department information</h3>
                <ActionsDropdown label={'Actions'} items={actions} />
            </div>
            <div className='flex flex-col gap-4'>
                <div className='flex gap-6'>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>Department name</span>
                        <span>{department.dept_name}</span>
                    </div>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>Department code</span>
                        <span>{department.dept_code}</span>
                    </div>
                </div>
                <div className=''>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>Division</span>
                        <span>{parentDivision.coy_div_name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditView({departmentId = null}) {

    const action = departmentId ? 'edit' : 'add';

    const [formData, setFormData] = useState({
        dept_name: '',
        dept_code: '',
        subsidiary_id: null,
        division_id: null,
    });

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // fetch divisions and subsidiaries
    const {isLoading: divisionsIsLoading, error: divisionsError, data: divisions} = useQuery(divisionsOptions());
    const {isLoading: subsidiariesIsLoading, error: subsidiariesError, data: subsidiaries} = useQuery(subsidiariesOptions());

    // use department query only when the departmentId is present (i.e. in edit mode)
    const {isLoading: departmentIsLoading, error: departmentError, data: department} =  useQuery(departmentOptions(departmentId, {enabled: !!departmentId}));

    // mutation to add new department
    const {isPending: isAddingDepartment, mutate: addDepartment} = useAddDepartment({onSuccess, onError, onSettled});
    const {isPending: isUpdatingDepartment, mutate: updateDepartment} = useUpdateDepartment({onSuccess, onError, onSettled});
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingDepartment ? 'Adding department' : 'Updating department information';
        (isAddingDepartment || isUpdatingDepartment) && dispatchMessage('processing', text);
    }, [isAddingDepartment, isUpdatingDepartment]);

    function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['departments']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/settings/organizational-structure/departments');
    }

    useEffect(()=> {
        if (departmentId && department) {
            setFormData({
                dept_name: department.dept_name,
                dept_code: department.dept_code,
                subsidiary_id: department.subsidiary_id,
                division_id: department.division_id,
            })
        }
    }, [departmentId, department]);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
        })
    }

    function handleSubmit() {
        if (action === 'add') {
            addDepartment({data: formData})
        } else if (action === 'edit') {
            updateDepartment({id: departmentId, data: formData})
        }
    }

    const isLoading = divisionsIsLoading || subsidiariesIsLoading || (departmentId && departmentIsLoading);
    const error = divisionsError || subsidiariesError || (departmentId && departmentError);

    if (isLoading) {
        return <FormLoadingIndicator />
    }

    if (error) {
        return <Error error={error} />
    }

    const actionInProgress = isAddingDepartment || isUpdatingDepartment;

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8 min-h-full'>
            <div className=''>
                <h3 className='font-semibold text-xl'>Department information</h3>
            </div>
            <div className='flex flex-col gap-4'>
                <div className='flex gap-6'>
                    <Field label={'Department name'} name={'dept_name'} value={formData.dept_name} placeholder='Enter department name' onChange={handleChange} />
                    <Field label={'Department code'} name={'dept_code'} value={formData.dept_code} placeholder='Enter department code' onChange={handleChange} />
                </div>
                <div>
                    <label className='flex gap-2 items-center'>
                        <input type="checkbox" name="add_to_parent_company" onChange={handleChange} id="" />
                        <span>Add department under parent company</span>
                    </label>
                </div>
                <div>
                    <SelectDivisionDropdown divisions={divisions} selected={formData.division_id} onSelect={handleChange} />
                </div>
                <div>
                    <SelectSubsidiaryDropdown subsidiaries={subsidiaries} selected={formData.subsidiary_id} onSelect={handleChange} />
                </div>
            </div>
            <div className='flex gap-6'>
                <FormCancelButton colorBlack={true} text={'Discard'} />
                <FormProceedButton text={actionInProgress ? (action == 'add' ? 'Adding department...' : 'Saving changes...') : (action == 'add' ? 'Add department' :'Save changes')} onClick={handleSubmit} disabled={actionInProgress} />
            </div>
        </div>
    );
}

function SelectDivisionDropdown({divisions, selected = null, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const items = divisions.map(division => ({id: division.id, text: division.name}));

    return <SelectDropdown items={items} name={'division_id'} selected={selected} onSelect={onSelect} label={'Parent Division'} placeholder={'Select division'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
}

function SelectSubsidiaryDropdown({subsidiaries, selected = null, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const items = subsidiaries.map(subsidiary => ({id: subsidiary.id, text: subsidiary.name}));

    return <SelectDropdown items={items} name={'subsidiary_id'} selected={selected} onSelect={onSelect} label={'Parent Subsidiary'} placeholder={'Select subsidiary'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
}

export default DepartmentInformation;