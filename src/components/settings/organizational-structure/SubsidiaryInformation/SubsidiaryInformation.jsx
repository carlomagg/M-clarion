import { NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import SearchField from '../../../partials/SearchField/SearchField';
import styles from './SubsidiaryInformation.module.css';
import ActionsDropdown from '../../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import { FileUploader } from 'react-drag-drop-files';
import { useEffect, useRef, useState } from 'react';
import SelectDropdown from '../../../partials/dropdowns/SelectDropdown/SelectDropdown';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { companiesOptions, companyOptions, industriesOptions, subsidiariesOptions, subsidiaryOptions, useActivateSubsidiary, useAddSubsidiary, useDeleteSubsidiary, useSuspendSubsidiary, useUpdateSubsidiary } from '../../../../queries/organization-queries';
import { FormCancelButton, FormProceedButton, NewUserButton, WhiteButton } from '../../../partials/buttons/FormButtons/FormButtons';
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
            <div className='flex justify-between items-center'>
                <div className='font-medium'>Subsidiaries <span className='text-text-pink'>({subsidiaries.length})</span></div>
                <AddOrganizationalItemButton text={'Add subsidiary'} onClick={onAddClicked} permission={'add_subsidiary'} />
            </div>
            <div>
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
        dispatchMessage('success', data.message || 'Subsidiary saved successfully', 5000);
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

    console.log('Full subsidiary object:', subsidiary);
    const status = subsidiary.sub_coy_status || subsidiary.status;
    console.log('Subsidiary status:', status);
    
    if (status === 'Active' || status === 'active' || status === 'activated')
        actions.splice(1, 0, {text: 'Suspend', type: 'action', onClick: handleSuspendSubsidiary, permission: 'suspend_subsidiary'})
    else if (status === 'suspended' || status === 'Suspended')
        actions.splice(1, 0, {text: 'Activate', type: 'action', onClick: handleActivateSubsidiary, permission: 'activate_subsidiary'})

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8 min-h-full max-h-[calc(100vh-200px)] overflow-y-scroll [&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-gray-400'>
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
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const dispatchMessage = useDispatchMessage();
    const logoPreview = useRef(null);

    const [formData, setFormData] = useState({
        subsidiary_name: '',
        company_serial_no: null,
        subsidiary_logo: null,
        industry_id: null,
        about: ''
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [logoDimensions, setLogoDimensions] = useState([]);

    // fetch companies and industries
    const [companiesQuery, industriesQuery] = useQueries({
        queries: [
            companiesOptions({ enabled: true }),
            industriesOptions()
        ]
    });
    
    // use subsidiary query only when the subsidiaryId is present (i.e. in edit mode)
    const {isLoading: subsidiaryIsLoading, error: subsidiaryError, data: subsidiary} = useQuery(subsidiaryOptions(subsidiaryId, {enabled: !!subsidiaryId}));

    // mutation to add/edit subsidiary
    const {isPending: isAddingSubsidiary, mutate: addSubsidiary} = useAddSubsidiary({onSuccess, onError, onSettled});
    const {isPending: isUpdatingSubsidiary, mutate: updateSubsidiary} = useUpdateSubsidiary({onSuccess, onError, onSettled});

    function onSuccess(data) {
        console.log('Subsidiary add/edit success:', data);
        dispatchMessage('success', data.message || 'Subsidiary saved successfully', 5000);
        return queryClient.invalidateQueries({queryKey: ['subsidiaries']});
    }

    function onError(error) {
        console.error('Subsidiary add/edit error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        dispatchMessage('failed', error.response?.data?.message || 'An error occurred while saving the subsidiary');
    }

    function onSettled(data, error) {
        console.log('Subsidiary add/edit settled:', { data, error });
        if (!error) navigate('/settings/organizational-structure/subsidiaries');
    }

    function handleChange(e) {
        const { name, value } = e.target;
        console.log('Form field changed:', { name, value });
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    function handleFileChange(file) {
        console.log('File selected:', file);
        setFormData(prev => ({
            ...prev,
            subsidiary_logo: file
        }));
    }

    function validateForm() {
        const errors = {};
        if (!formData.subsidiary_name.trim()) {
            errors.subsidiary_name = 'Subsidiary name is required';
        }
        if (!formData.company_serial_no) {
            errors.company_serial_no = 'Company is required';
        }
        if (!formData.industry_id) {
            errors.industry_id = 'Industry is required';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }

    function handleSubmit() {
        if (!validateForm()) {
            return;
        }

        console.log('Submitting form data:', formData);

        const formDataToSubmit = new FormData();
        Object.keys(formData).forEach(key => {
            // Always include company_serial_no, for other fields skip if null
            if (key === 'company_serial_no' || formData[key] !== null) {
                // For company_serial_no, send it as company_serial_no
                if (key === 'company_serial_no') {
                    formDataToSubmit.append('company_serial_no', formData[key]);
                } else if (key === 'subsidiary_logo' && formData[key]) {
                    // For logo, append the file directly
                    formDataToSubmit.append('subsidiary_logo', formData[key]);
                } else {
                    formDataToSubmit.append(key, formData[key]);
                }
            }
        });

        // Log the FormData contents
        for (let pair of formDataToSubmit.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        if (action === 'add') {
            console.log('Adding subsidiary...');
            addSubsidiary({ data: formDataToSubmit });
        } else {
            console.log('Updating subsidiary...');
            updateSubsidiary({ id: subsidiaryId, data: formDataToSubmit });
        }
    }

    // Effects
    useEffect(() => {
        let text = isAddingSubsidiary ? 'Adding subsidiary' : 'Updating subsidiary information';
        (isAddingSubsidiary || isUpdatingSubsidiary) && dispatchMessage('processing', text);
    }, [isAddingSubsidiary, isUpdatingSubsidiary, dispatchMessage]);

    useEffect(() => {
        if (subsidiaryId && subsidiary) {
            setFormData({
                subsidiary_name: subsidiary.sub_coy_name,
                company_serial_no: subsidiary.coy_serial_no,
                subsidiary_logo: null,
                industry_id: subsidiary.industry_id,
                about: subsidiary.about || ''
            });
        }
    }, [subsidiaryId, subsidiary]);

    useEffect(() => {
        if (formData.subsidiary_logo) {
            const objectURL = URL.createObjectURL(formData.subsidiary_logo);
            const image = logoPreview.current;
            
            // Set image source immediately
            image.src = objectURL;
            
            image.onload = function() {
                setLogoDimensions([image.naturalWidth, image.naturalHeight]);
            };
            
            image.onerror = function() {
                console.error('Failed to load logo image');
                setLogoDimensions([0, 0]);
            };

            // Clean up the object URL when the component unmounts or when the logo changes
            return () => {
                URL.revokeObjectURL(objectURL);
            };
        }
    }, [formData.subsidiary_logo]);

    useEffect(() => {
        if (action === 'edit' && subsidiary && subsidiary.sub_coy_logo) {
            const image = logoPreview.current;
            const logoUrl = `${BASE_API_URL}clarion_users${subsidiary.sub_coy_logo}`;
            
            // Set image source immediately
            image.src = logoUrl;
            
            image.onload = function() {
                setLogoDimensions([image.naturalWidth, image.naturalHeight]);
            };
            
            image.onerror = function() {
                console.error('Failed to load existing logo image');
                setLogoDimensions([0, 0]);
            };
        }
    }, [subsidiary, action]);

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

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8 min-h-full max-h-[calc(100vh-200px)] overflow-y-scroll [&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-gray-400'>
            <div className=''>
                <h3 className='font-semibold text-xl'>Subsidiary information</h3>
            </div>
            <div className='flex flex-col gap-4'>
                <Field 
                    label={'Subsidiary name'} 
                    name={'subsidiary_name'} 
                    value={formData.subsidiary_name} 
                    placeholder={'Enter subsidiary name'} 
                    onChange={handleChange}
                    error={validationErrors.subsidiary_name}
                />
                <div>
                    <SelectCompanyDropdown 
                        companies={companies} 
                        selected={formData.company_serial_no} 
                        onSelect={handleChange}
                        error={validationErrors.company_serial_no}
                    />
                </div>
                <div className='flex flex-col gap-3'>
                    <label htmlFor='subsidiary_logo' className='font-medium'>Logo</label>
                    <FileUploader 
                        types={fileTypes} 
                        handleChange={handleFileChange}
                        name="subsidiary_logo"
                        id="subsidiary_logo"
                        maxSize={5}
                        onSizeError={() => {
                            dispatchMessage('failed', 'File size should be less than 5MB');
                        }}
                        label="Upload image"
                        multiple={false}
                        dropMessageStyle={{ display: 'none' }}
                    >
                        <div className={`h-28 p-4 cursor-pointer border border-dashed border-border-gray rounded-lg ${!fileSelected && 'flex items-center justify-center'}`}>
                            {
                                fileSelected ?
                                (
                                    <div className='h-full overflow-hidden flex gap-2'>
                                        <div className='flex-1 border border-border-gray rounded-lg overflow-hidden'>
                                            <img 
                                                className='object-contain w-full h-full' 
                                                ref={logoPreview} 
                                                alt="Subsidiary logo" 
                                            />
                                        </div>
                                        <div className='flex-1 flex flex-col gap-2 text-text-gray text-sm'>
                                            {formData.subsidiary_logo && <div>Size: {(formData.subsidiary_logo.size / 1000).toFixed(2)} KB</div>}
                                            <div>Width: {logoDimensions[0]} px</div>
                                            <div>Height: {logoDimensions[1]} px</div>
                                        </div>
                                    </div>
                                )
                                :
                                <div className='flex flex-col items-center gap-2'>
                                    <div className='rounded-lg border border-text-pink font-medium shadow-sm py-2 px-4 bg-white hover:bg-gray-50'>
                                        Upload image
                                    </div>
                                    <span className='text-text-gray text-sm'>Or drop image file to upload</span>
                                </div>
                            }
                        </div>
                    </FileUploader>
                </div>
                <div>
                    <SelectIndustryDropdown 
                        industries={industries} 
                        selected={formData.industry_id} 
                        onSelect={handleChange}
                        error={validationErrors.industry_id}
                    />
                </div>
                <div>
                    <Field 
                        type='textbox' 
                        label={'About the subsidiary'} 
                        name={'about'} 
                        value={formData.about} 
                        placeholder={'Enter description'} 
                        onChange={handleChange} 
                    />
                </div>
            </div>
            <div className='flex gap-6 justify-center'>
                <WhiteButton text={'Cancel'} onClick={() => navigate(-1)} />
                {action == 'add' ? (
                    <NewUserButton 
                        text={'Add subsidiary'} 
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

function SelectCompanyDropdown({companies, selected = null, onSelect, error}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Transform companies data into the required format for SelectDropdown
    const items = companies?.map(company => ({
        id: company.registration_number,  // Use registration_number instead of csn
        text: company.company_name
    })) || [];

    return (
        <SelectDropdown 
            items={items} 
            name={'company_serial_no'} 
            selected={selected} 
            onSelect={onSelect} 
            label={'Company'} 
            placeholder={'Select Company'} 
            isCollapsed={isCollapsed} 
            onToggleCollpase={setIsCollapsed} 
            error={error}
        />
    );
}

function SelectIndustryDropdown({industries, selected = null, onSelect, error}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [filterTerm, setFilterTerm] = useState('');
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!industries) return;
        
        const newItems = industries
            .map(i => ({id: i.industry_id, text: i.industry}))
            .filter(i => String(i.text).toLowerCase().includes(filterTerm.toLowerCase()));
        setItems(newItems);
    }, [filterTerm, industries]);

    return (
        <SelectDropdown 
            items={items} 
            filterable={true} 
            filterTerm={filterTerm} 
            setFilterTerm={setFilterTerm} 
            name={'industry_id'} 
            selected={selected} 
            onSelect={onSelect} 
            label={'Industry'} 
            placeholder={'Select Industry'} 
            isCollapsed={isCollapsed} 
            onToggleCollpase={setIsCollapsed} 
            error={error} 
        />
    );
}

export default SubsidiaryInformation;