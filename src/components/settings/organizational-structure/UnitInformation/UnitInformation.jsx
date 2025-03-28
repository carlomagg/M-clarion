import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import SearchField from '../../../partials/SearchField/SearchField';
import styles from './UnitInformation.module.css';
import ActionsDropdown from '../../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import { useEffect, useState } from 'react';
import SelectDropdown from '../../../partials/dropdowns/SelectDropdown/SelectDropdown';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { departmentOptions, departmentsOptions, unitOptions, unitsOptions, useActivateUnit, useAddUnit, useDeleteUnit, useSuspendUnit, useUpdateUnit } from '../../../../queries/organization-queries';
import { Field } from '../../../partials/Elements/Elements';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';
import { filterItems } from '../../../../utils/helpers';
import AddOrganizationalItemButton from '../AddOrganizationalItemButton';
import { DetailsLoadingIndicator, FormLoadingIndicator, ListLoadingIndicator } from '../../../partials/skeleton-loading-indicators/SettingsIndicator';
import Error from '../../../partials/Error/Error';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import useConfirmedAction from '../../../../hooks/useConfirmedAction';

function UnitInformation() {
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

    const unitId = searchParams.get('unit');
    const action = searchParams.get('action');

    if (!unitId && !action ) {
        // default view (unit list)
        return <ListView onAddClicked={handleAddClicked} />
    } else if (action && action === 'add') {
        // add new unit view
        return <EditView />
    } else if (unitId && !action) {
        // unit detail view
        return <UnitView unitId={unitId} onEditClicked={handleEditClicked} />
    } else if (unitId && action === 'edit') {
        // edit unit view
        return <EditView unitId={unitId} />
    }
}

function ListView({onAddClicked}) {
    // fetch unit list
    const [searchTerm, setSearchTerm] = useState('');
    const {isLoading, error, data: units} = useQuery(unitsOptions());

    if (isLoading) {
        return <ListLoadingIndicator />
    }

    if (error) {
        return <Error error={error} />
    }

    const filteredUnits = filterItems(searchTerm, units, ['name']);

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-4 min-h-full'>
            <div className='flex flex-col gap-3'>
                <h3 className='font-semibold'>Units <span className='text-text-pink'>({units.length})</span></h3>
                <SearchField {...{searchTerm, onChange: setSearchTerm}} placeholder={'Search units'} />
            </div>
            <div className='font-medium text-sm'>
                <div className='bg-[#D8D8D8] flex p-4 border-b-[0.5px] border-b-[#B7B7B7]/75'>
                    <span className='flex-[0_1_25rem]'>Name</span>
                    <span className='ml-5'>&bull; Status</span>
                </div>
                <ul>
                    {
                        filteredUnits.map(unit => {
                            return (
                                <li key={unit.name} >
                                    <NavLink to={`?unit=${unit.id}`} className='border-b-[0.5px] border-b-[#D0D0D0] py-6 px-4 flex'>
                                        <span className='flex-[0_1_25rem]'>{unit.name}</span>
                                        <span className={`${styles.capitalizeFirstLetter} py-[2px] w-24 rounded-full text-center ${unit.status == 'Active' ? 'bg-[#D8FCDA] text-[#1EC04E]' : 'bg-[#FFF4E5] text-[#F5A623]'}`}>{unit.status}</span>
                                    </NavLink>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
            <div className='flex justify-end'>
                <AddOrganizationalItemButton text={'Add unit'} onClick={onAddClicked} permission={'add_unit'} />
            </div>
        </div>
    );
}

function UnitView({unitId, onEditClicked}) {
    const {confirmAction, confirmationDialog} = useConfirmedAction();
    const actions = [
        {text: 'Edit', type: 'action', onClick: onEditClicked, permission: 'edit_unit'},
        {text: 'Delete', type: 'action', onClick: () => confirmAction(handleDeleteUnit), permission: 'delete_unit'},
    ];

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    
    // (mutations) delete and suspend unit
    const {isPending: isDeletingUnit, mutate: deleteUnit} = useDeleteUnit({onSuccess, onError, onSettled});
    const {isPending: isSuspendingUnit, mutate: suspendUnit} = useSuspendUnit({onSuccess, onError, onSettled});
    const {isPending: isActivatingUnit, mutate: activateUnit} = useActivateUnit({onSuccess, onError, onSettled});
    
    const isMutating = isDeletingUnit || isSuspendingUnit || isActivatingUnit;

    // (query) fetch unit information and parent department
    const {isLoading: unitLoading, error: unitError, data: unit} = useQuery(unitOptions(unitId, {enabled: !isMutating}));
    const {isLoading: departmentLoading, error: departmentError, data: parentDepartment} = useQuery(departmentOptions(unit?.dept, {enabled: !!unit && !isMutating}));

    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        if (isMutating) {
            let text = isDeletingUnit ? 'Deleting' : ( isSuspendingUnit ? 'Suspending' : 'Activating');
            text += ' unit';
            dispatchMessage('processing', text);
        }
    }, [isMutating]);
    function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['units']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/settings/organizational-structure/units')
    }

    function handleDeleteUnit() {
        deleteUnit({id: unitId})
    }
    function handleSuspendUnit() {
        suspendUnit({data: {unit_ids: [unitId]}})
    }
    function handleActivateUnit() {
        activateUnit({data: {unit_ids: [unitId]}})
    }

    const isLoading = unitLoading || departmentLoading;
    const error = unitError || departmentError;

    if (isLoading) {
        return <DetailsLoadingIndicator />
    }

    if (error) {
        return <Error error={error} />
    }

    if (unit.unit_status === 'Active')
        actions.splice(1, 0, {text: 'Suspend', type: 'action', onClick: handleSuspendUnit, permission: 'suspend_unit'})
    else if (unit.unit_status === 'suspended')
        actions.splice(1, 0, {text: 'Activate', type: 'action', onClick: handleActivateUnit, permission: 'activate_unit'})

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8 min-h-full'>
            {confirmationDialog}
            <div className='flex justify-between relative'>
                <h3 className='font-semibold text-xl'>Unit information</h3>
                <ActionsDropdown label={'Actions'} items={actions} />
            </div>
            <div className='flex flex-col gap-4'>
                <div className='flex gap-6'>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>Unit name</span>
                        <span>{unit.unit_name}</span>
                    </div>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>Unit code</span>
                        <span>{unit.unit_code}</span>
                    </div>
                </div>
                <div className=''>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>Parent department</span>
                        <span>{parentDepartment.dept_name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditView({unitId = null}) {
    const action = unitId ? 'edit' : 'add';

    const [formData, setFormData] = useState({
        unit_name: '',
        unit_code: '',
        dept_id: null,
    });

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // fetch departments.
    const {isLoading: departmentsIsLoading, error: departmentsError, data: departments} =  useQuery(departmentsOptions());

    // use unit query only when the unitId is present (i.e. in edit mode)
    const {isLoading: unitIsLoading, error: unitError, data: unit} =  useQuery(unitOptions(unitId, {enabled: !!unitId}));

    // mutation to add new unit
    const {isPending: isAddingUnit, mutate: addUnit} = useAddUnit({onSuccess, onError, onSettled});
    const {isPending: isUpdatingUnit, mutate: updateUnit} = useUpdateUnit({onSuccess, onError, onSettled});

    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingUnit ? 'Adding unit' : 'Updating unit information';
        (isAddingUnit || isUpdatingUnit) && dispatchMessage('processing', text);
    }, [isAddingUnit, isUpdatingUnit]);
    function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['units']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/settings/organizational-structure/units');
    }

    useEffect(()=> {
        if (unitId && unit) {
            setFormData({
                unit_name: unit.unit_name,
                unit_code: unit.unit_code,
                dept_id: unit.dept,
            })
        }
    }, [unitId, unit]);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    function handleSubmit() {
        if (action === 'add') {
            addUnit({data: formData})
        } else if (action === 'edit') {
            updateUnit({id: unitId, data: formData})
        }
    }

    const isLoading = departmentsIsLoading || (unitId && unitIsLoading);
    const error = departmentsError || (unitId && unitError);

    if (isLoading) {
        return <FormLoadingIndicator />
    }

    if (error) {
        return <Error error={error} />
    }

    const actionInProgress = isAddingUnit || isUpdatingUnit;

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8 min-h-full'>
            <div className=''>
                <h3 className='font-semibold text-xl'>Unit information</h3>
            </div>
            <div className='flex flex-col gap-4'>
                <div className='flex gap-6'>
                    <Field label={'Unit name'} name={'unit_name'} placeholder={'Enter unit name'} value={formData.unit_name} onChange={handleChange} />
                    <Field label={'Unit code'} name={'unit_code'} placeholder={'Enter unit code'} value={formData.unit_code} onChange={handleChange} />
                </div>
                <SelectDepartmentDropdown departments={departments} selected={formData.dept_id} onSelect={handleChange} />
            </div>
            <div className='flex gap-6'>
                <FormCancelButton colorBlack={true} text={'Discard'} />
                <FormProceedButton text={actionInProgress ? (action == 'add' ? 'Adding unit...' : 'Saving changes...') : (action == 'add' ? 'Add unit' :'Save changes')} onClick={handleSubmit} disabled={actionInProgress} />
            </div>
        </div>
    );
}

function SelectDepartmentDropdown({departments, selected = null, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const items = departments.map(department => ({id: department.id, text: department.name}));

    return <SelectDropdown items={items} name={'dept_id'} selected={selected} onSelect={onSelect} label={'Department'} placeholder={'Select department'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
}

export default UnitInformation;