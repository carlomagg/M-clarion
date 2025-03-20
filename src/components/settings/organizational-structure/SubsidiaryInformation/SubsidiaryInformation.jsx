import { NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import SearchField from '../../../partials/SearchField/SearchField';
import styles from './SubsidiaryInformation.module.css';
import ActionsDropdown from '../../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import { FileUploader } from 'react-drag-drop-files';
import { useEffect, useRef, useState } from 'react';
import SelectDropdown from '../../../partials/dropdowns/SelectDropdown/SelectDropdown';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { companiesOptions, companyOptions, industriesOptions, subsidiariesOptions, subsidiaryOptions, useActivateSubsidiary, useAddSubsidiary, useDeleteSubsidiary, useSuspendSubsidiary, useUpdateSubsidiary } from '../../../../queries/organization-queries';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';
import { Field } from '../../../partials/Elements/Elements';
import { filterItems } from '../../../../utils/helpers';
import AddOrganizationalItemButton from '../AddOrganizationalItemButton';
import { DetailsLoadingIndicator, FormLoadingIndicator, ListLoadingIndicator } from '../../../partials/skeleton-loading-indicators/SettingsIndicator';
import Error from '../../../partials/Error/Error';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import useConfirmedAction from '../../../../hooks/useConfirmedAction';
import { BASE_API_URL } from '../../../../utils/consts';

function SubsidiaryInformation() {
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

    const subsidiaryId = searchParams.get('subsidiary');
    const action = searchParams.get('action');

    if (!subsidiaryId && !action ) {
        // default view (subsidiary list)
        return <ListView onAddClicked={handleAddClicked} />
    } else if (action && action === 'add') {
        // add new subsidiary view
        return <EditView />
    } else if (subsidiaryId && !action) {
        // subsidiary detail view
        return <SubsidiaryView subsidiaryId={subsidiaryId} onEditClicked={handleEditClicked} />
    } else if (subsidiaryId && action === 'edit') {
        // edit subsidiary view
        return <EditView subsidiaryId={subsidiaryId} />
    }
}

function ListView({onAddClicked}) {
    const [searchTerm, setSearchTerm] = useState('');
    const {isLoading, error, data: subsidiaries} = useQuery(subsidiariesOptions());

    if (isLoading) {
        return <ListLoadingIndicator />
    }

    if (error) {
        return <Error error={error} />
    }

    const filteredSubsidiaries = filterItems(searchTerm, subsidiaries, ['name']);

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-4 min-h-full'>
            <div className='flex flex-col gap-3'>
                <div className='font-medium'>Subsidiaries <span className='text-text-pink'>({subsidiaries.length})</span></div>
                <SearchField {...{searchTerm, onChange: setSearchTerm}} placeholder={'Search subsidiaries'} />
            </div>
            <div className='font-medium text-sm'>
                <div className='bg-[#D8D8D8] flex p-4 border-b-[0.5px] border-b-[#B7B7B7]/75'>
                    <span className='flex-[0_1_25rem]'>Name</span>
                    <span className='ml-5'>&bull; Status</span>
                </div>
                <ul>
                    {
                        filteredSubsidiaries.map(subsidiary => {
                            return (
                                <li key={subsidiary.name} >
                                    <NavLink to={`?subsidiary=${(subsidiary.id)}`} className='border-b-[0.5px] border-b-[#D0D0D0] py-6 px-4 flex'>
                                        <span className='flex-[0_1_25rem]'>{subsidiary.name}</span>
                                        <span className={`${styles.capitalizeFirstLetter} py-[2px] w-24 rounded-full text-center ${subsidiary.status == 'Active' ? 'bg-[#D8FCDA] text-[#1EC04E]' : 'bg-[#FFF4E5] text-[#F5A623]'}`}>{subsidiary.status}</span>
                                    </NavLink>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
            <div className='flex justify-end'>
                <AddOrganizationalItemButton text={'Add subsidiary'} onClick={onAddClicked} permission={'add_subsidiary'} />
            </div>
        </div>
    );
}

function SubsidiaryView({subsidiaryId, onEditClicked}) {
    const {confirmAction, confirmationDialog} = useConfirmedAction();
    const actions = [
        {text: 'Edit', type: 'action', onClick: onEditClicked, permission: 'edit_subsidiary'},
        {text: 'Delete', type: 'action', onClick: () => confirmAction(handleDeleteSubsidiary), permission: 'delete_subsidiary'},
    ];

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    
    // (mutations) delete and suspend subsidiary
    const {isPending: isDeletingSubsidiary, mutate: deleteSubsidiary} = useDeleteSubsidiary({onSuccess, onError, onSettled});
    const {isPending: isSuspendingSubsidiary, mutate: suspendSubsidiary} = useSuspendSubsidiary({onSuccess, onError, onSettled});
    const {isPending: isActivatingSubsidiary, mutate: activateSubsidiary} = useActivateSubsidiary({onSuccess, onError, onSettled});
    
    const isMutating = isDeletingSubsidiary || isSuspendingSubsidiary || isActivatingSubsidiary;

    // (query) fetch subsidiary information and parent company
    const {isLoading: subsidiaryLoading, error: subsidiaryError, data: subsidiary} = useQuery(subsidiaryOptions(subsidiaryId, {enabled: !isMutating}));
    const {isLoading: companyLoading, error: companyError, data: parentCompany} = useQuery(companyOptions(subsidiary?.coy_serial_no, {enabled: !!subsidiary && !isMutating}));

    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        if (isMutating) {
            let text = isDeletingSubsidiary ? 'Deleting' : ( isSuspendingSubsidiary ? 'Suspending' : 'Activating');
            text += ' subsidiary';
            dispatchMessage('processing', text);
        }
    }, [isMutating]);
    function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['subsidiaries']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/settings/organizational-structure/subsidiaries')
    }

    function handleDeleteSubsidiary() {
        deleteSubsidiary({id: subsidiaryId})
    }
    function handleSuspendSubsidiary() {
        suspendSubsidiary({data: {subsidiary_ids: [subsidiaryId]}})
    }
    function handleActivateSubsidiary() {
        activateSubsidiary({data: {subsidiary_ids: [subsidiaryId]}})
    }

    const isLoading = subsidiaryLoading || companyLoading;
    const error = subsidiaryError || companyError;

    if (isLoading) {
        return <DetailsLoadingIndicator />
    }

    if (error) {
        return <Error error={error} />
    }

    if (subsidiary.sub_coy_status === 'Active')
        actions.splice(1, 0, {text: 'Suspend', type: 'action', onClick: handleSuspendSubsidiary, permission: 'suspend_subsidiary'})
    else if (subsidiary.sub_coy_status === 'suspended')
        actions.splice(1, 0, {text: 'Activate', type: 'action', onClick: handleActivateSubsidiary, permission: 'suspend_subsidiary'})

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8 min-h-full'>
            {confirmationDialog}
            <div className='flex justify-between relative'>
                <h3 className='font-semibold text-xl'>Subsidiary information</h3>
                <ActionsDropdown label={'Actions'} items={actions} />
            </div>
            <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-3 flex-1'>
                    <span className='font-semibold'>Subsidiary name</span>
                    <span>{subsidiary.sub_coy_name}</span>
                </div>
                <div className='flex flex-col gap-3 flex-1'>
                    <span className='font-semibold'>Parent company</span>
                    <span>{parentCompany.company_name}</span>
                </div>
                <div className='flex flex-col gap-3 flex-1'>
                    <span className='font-semibold'>Subsidiary logo</span>
                    {
                        subsidiary.sub_coy_logo ?
                        <div>
                            <img src={`${BASE_API_URL}clarion_users${subsidiary.sub_coy_logo}`} alt={subsidiary.sub_coy_name+' Logo'} />
                        </div> :
                        <span className='text-text-gray text-sm italics'>No logo uploaded</span>
                    }
                </div>
            </div>
        </div>
    );
}

function EditView({subsidiaryId = null}) {

    const action = subsidiaryId ? 'edit' : 'add';

    const [formData, setFormData] = useState({
        subsidiary_name: '',
        company_serial_no: null,
        subsidiary_logo: null,
        industry_id: null,
        about: ''
    });

    const queryClient = useQueryClient();
    const navigate = useNavigate();
 
    // fetch companies.
    const [companiesQuery, industriesQuery] =  useQueries({queries: [companiesOptions(), industriesOptions()]});
    
    // use subsidiary query only when the subsidiaryId is present (i.e. in edit mode)
    const {isLoading: subsidiaryIsLoading, error: subsidiaryError, data: subsidiary} =  useQuery(subsidiaryOptions(subsidiaryId, {enabled: !!subsidiaryId}));

    // mutation to add/edit subsidiary
    const {isPending: isAddingSubsidiary, mutate: addSubsidiary} = useAddSubsidiary({onSuccess, onError, onSettled});
    const {isPending: isUpdatingSubsidiary, mutate: updateSubsidiary} = useUpdateSubsidiary({onSuccess, onError, onSettled});
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = isAddingSubsidiary ? 'Adding subsidiary' : 'Updating subsidiary information';
        (isAddingSubsidiary || isUpdatingSubsidiary) && dispatchMessage('processing', text);
    }, [isAddingSubsidiary, isUpdatingSubsidiary]);

    function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['subsidiaries']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/settings/organizational-structure/subsidiaries');
    }
    
    useEffect(()=> {
        if (subsidiaryId && subsidiary) {
            setFormData({
                subsidiary_name: subsidiary.sub_coy_name,
                company_serial_no: subsidiary.coy_serial_no,
                subsidiary_logo: null,
            })
        }
    }, [subsidiaryId, subsidiary]);
    
    // handle logo preview
    const [logoDimensions, setLogoDimensions] = useState([]);
    const logoPreview = useRef(null);
    useEffect(() => {
        if (formData.subsidiary_logo) {
            const objectURL = URL.createObjectURL(formData.subsidiary_logo);
            const image = logoPreview.current;
            setTimeout(() => {
                image.src = objectURL;
            }, 500);
    
            image.onload = function() {
                URL.revokeObjectURL(objectURL);
                setLogoDimensions([image.naturalWidth, image.naturalHeight])
            }
        }
    }, [formData.subsidiary_logo]);

    useEffect(() => {
        if (action === 'edit' && subsidiary && subsidiary.sub_coy_logo) {
            setTimeout(() => {
                const image = logoPreview.current;
                image.src = `${BASE_API_URL}clarion_users${subsidiary.sub_coy_logo}`;
                image.onload = function() {
                    setLogoDimensions([image.naturalWidth, image.naturalHeight])
                }
            }, 500);
    
        }
    }, [subsidiary])

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    function handleFileChange(file) {
        setFormData({
            ...formData,
            subsidiary_logo: file
        });
    }

    function handleSubmit() {
        action == 'add' ? addSubsidiary({data: formData}) : updateSubsidiary({id: subsidiaryId, data: formData})
    }

    const isLoading = companiesQuery.isLoading || industriesQuery.isLoading || (subsidiaryId && subsidiaryIsLoading);
    const error = companiesQuery.error || industriesQuery.error || (subsidiaryId && subsidiaryError);
    
    
    if (isLoading) {
        return <FormLoadingIndicator />
    }
    
    if (error) {
        return <Error error={error} />
    }

    const companies = companiesQuery.data;
    const industries = industriesQuery.data;
    const actionInProgress = isAddingSubsidiary || isUpdatingSubsidiary;

    const fileTypes = ['PNG', 'SVG'];
    const fileSelected = formData.subsidiary_logo !== null || (action === 'edit' && subsidiary.sub_coy_logo !== null);

    const [logoWidth, logoHeight] = logoDimensions;

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8 min-h-full'>
            <div className=''>
                <h3 className='font-semibold text-xl'>Subsidiary information</h3>
            </div>
            <div className='flex flex-col gap-4'>
                <Field label={'Subsidiary name'} name={'subsidiary_name'} value={formData.subsidiary_name} placeholder={'Enter subsidiary name'} onChange={handleChange} />
                <div>
                    <SelectCompanyDropdown companies={companies} selected={formData.company_serial_no} onSelect={handleChange} />
                </div>
                <div className='flex flex-col gap-3'>
                    <label htmlFor='country_of_incorporation' className='font-medium'>Logo</label>
                    <FileUploader types={fileTypes} handleChange={handleFileChange}>
                        <div className={`h-28 p-4 cursor-pointer border border-dashed border-border-gray rounded-lg ${!fileSelected && 'flex items-center justify-center'}`}>
                            {
                                fileSelected ?
                                (
                                    <div className='h-full overflow-hidden flex gap-2'>
                                        <div className='flex-1 border border-border-gray'>
                                            <img className='object-contain' ref={logoPreview} src="" alt="" />
                                        </div>
                                        <div className='flex-1 flex flex-col gap-2 text-text-gray text-sm'>
                                            {formData.subsidiary_logo && <div>Size: {formData.subsidiary_logo.size / 1000} KB</div>}
                                            <div>Width: {logoWidth} px</div>
                                            <div>Height: {logoHeight} px</div>
                                        </div>
                                    </div>
                                )
                                :
                                (
                                    <div className='flex flex-col items-center gap-[10px]'>
                                        <span className='rounded-lg border border-text-pink font-bold shadow-[0px_1px_3px_1px_#00000026,0px_1px_2px_0px_#0000004D] py-2 px-4'>
                                            Upload image
                                        </span>
                                        <span className='text-[#757575]'>Or drop image file to upload</span>
                                    </div>
                                )
                            }
                        </div>
                    </FileUploader>
                </div>
                <div>
                    <SelectIndustryDropdown industries={industries} selected={formData.industry_id} onSelect={handleChange} />
                </div>
                <div>
                    <Field type='textbox' label={'About the subsidiary'} name={'about'} value={formData.about} placeholder={'Enter description'} onChange={handleChange} />
                </div>
            </div>
            <div className='flex gap-6'>
                <FormCancelButton colorBlack={true} text={'Discard'} />
                <FormProceedButton text={actionInProgress ? (action == 'add' ? 'Adding subsidiary...' : 'Saving changes...') : (action == 'add' ? 'Add subsidiary' :'Save changes')} onClick={handleSubmit} disabled={actionInProgress} />
            </div>
        </div>
    );
}

function SelectCompanyDropdown({companies, selected = null, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const items = companies.map(company => ({id: company['company_serial_number'], text: company.name}));

    return <SelectDropdown items={items} name={'company_serial_no'} selected={selected} onSelect={onSelect} label={'Company'} placeholder={'Select Company'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
}

function SelectIndustryDropdown({industries, selected = null, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [filterTerm, setFilterTerm] = useState('');
    const [items, setItems] = useState([]);

    useEffect(() => {
        const newItems = industries.map(i => ({id: i.industry_id, text: i.industry})).filter(i => String(i.text).toLowerCase().includes(filterTerm.toLowerCase()));
        setItems(newItems)
    }, [filterTerm]);

    return <SelectDropdown items={items} filterable={true} filterTerm={filterTerm} setFilterTerm={setFilterTerm} name={'industry_id'} selected={selected} onSelect={onSelect} label={'Industry'} placeholder={'Select Industry'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
}

export default SubsidiaryInformation;