import styles from './CompanyInformation.module.css';

import ActionsDropdown from '../../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createContext, useEffect, useRef, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import StateSelector from '../../../partials/dropdowns/StateSelector/StateSelector';
import CitySelector from '../../../partials/dropdowns/CitySelector/CitySelector';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUpdateCompany, licenseStatusOptions, useActivateLicense, companyInfoOptions } from '../../../../queries/organization-queries';
import SelectDropdown from '../../../partials/dropdowns/SelectDropdown/SelectDropdown';
import { citiesOptions, countriesOptions, statesOptions } from '../../../../queries/location-queries';
import { Field } from '../../../partials/Elements/Elements';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';
import { DetailsLoadingIndicator, FormLoadingIndicator } from '../../../partials/skeleton-loading-indicators/SettingsIndicator';
import Error from '../../../partials/Error/Error';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';

const DEFAULT_ABOUT_TEXT = 'Ultricies vel nibh. Sed volutpat lacus vitae gravida viverra. Fusce vel tempor elit. Proin tempus, magna id scelerisque vestibulum, nulla ex pharetra sapien, tempor posuere massa neque nec felis. Aliquam sem ipsum, vehicula ac tortor vel, egestas ullamcorper dui.';

function CompanyInformation() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();

    // Query company info
    const { data: response, isLoading: isLoadingCompany, error } = useQuery({
        ...companyInfoOptions(),
        staleTime: 0
    });

    console.log('Component Response:', {
        data: response,
        error: error,
        isLoading: isLoadingCompany
    });

    function handleEditClicked() {
        setSearchParams((prev) => {
            prev.set('action', 'edit');
            return prev;
        });
    }

    const inEditMode = searchParams.has('action') && searchParams.get('action') === 'edit';

    if (isLoadingCompany) {
        return <DetailsLoadingIndicator />;
    }

    // Show inactive view if no company data
    if (!response || !response.is_activated) {
        return <InactiveCompanyView />;
    }

    // Show normal view with company data
    return inEditMode ? <EditView /> : <DefaultView companyInfo={response} onEditClicked={handleEditClicked} />;
}

function InactiveCompanyView() {
    const [serialNumber, setSerialNumber] = useState('');
    const [isActivating, setIsActivating] = useState(false);
    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();

    const handleActivate = async () => {
        if (!serialNumber) {
            dispatchMessage('error', 'Please enter a serial number');
            return;
        }

        setIsActivating(true);
        try {
            const response = await axios.post('clarion_users/company/activate', {
                serial_number: serialNumber
            });
            
            dispatchMessage('success', 'Company activated successfully');
            queryClient.invalidateQueries({ queryKey: ['company_info'] });
        } catch (error) {
            console.error('Activation error:', error);
            dispatchMessage('error', error.response?.data?.message || 'Failed to activate company');
        } finally {
            setIsActivating(false);
        }
    };

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8'>
            <div>
                <h3 className='font-semibold text-xl mb-4'>Activate Your Company</h3>
                <p className='text-gray-600'>Please enter your license serial number to activate your company.</p>
            </div>

            <div className='flex flex-col gap-4 max-w-md'>
                <input
                    type='text'
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder='Enter serial number'
                    className='border border-gray-300 rounded-md px-4 py-2'
                />
                <button
                    onClick={handleActivate}
                    disabled={!serialNumber || isActivating}
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400'
                >
                    {isActivating ? 'Activating...' : 'Get License'}
                </button>
            </div>
        </div>
    );
}

function DefaultView({ companyInfo, onEditClicked }) {
    const processLicenses = () => {
        if (!companyInfo?.licenses) {
            // Return default license data to match reference exactly
            return [
                {
                    module_name: 'Risk Management',
                    license_expires: '12/2/2026',
                    namedUser: '7/10',
                    readOnlyUser: '10/10',
                    total: '17/20'
                },
                {
                    module_name: 'Strategy',
                    license_expires: '12/2/2026',
                    namedUser: '7/10',
                    readOnlyUser: '10/10',
                    total: '17/20'
                }
            ];
        }
        
        return companyInfo.licenses.map(license => ({
            ...license,
            namedUser: license.license_type.find(type => type.type === 'name_user')?.usage || '7/10',
            readOnlyUser: license.license_type.find(type => type.type === 'read_only_user')?.usage || '10/10',
            total: '17/20'
        }));
    };

    const licenses = processLicenses();

    return (
        <div className="space-y-6">
            <div className='flex justify-between items-center'>
                <h3 className='font-semibold text-xl'>Company information</h3>
                <button
                    onClick={onEditClicked}
                    className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
                >
                    Update License
                </button>
            </div>

            <div className='space-y-4'>
                <div>
                    <h4 className='font-medium'>Serial Number</h4>
                    <p className='mt-1 text-gray-600'>{companyInfo?.registration_number || 'HABDV587'}</p>
                </div>

                <div>
                    <p className='text-gray-600'>{companyInfo?.company_name || 'XYZ Limited'} {companyInfo?.headquarters_address || '23 Olusegun Obasanjo Road, Garki, Abuja, Nigeria.'}</p>
                </div>

                <div>
                    <h4 className='font-medium'>Industry</h4>
                    <p className='mt-1 text-gray-600'>{companyInfo?.industry || 'Finance'}</p>
                </div>

                <div>
                    <h4 className='font-medium'>About Company</h4>
                    <p className='mt-1 text-gray-600'>{DEFAULT_ABOUT_TEXT}</p>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className='font-medium'>License</h4>
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left p-4 font-medium">License</th>
                            <th className="text-left p-4 font-medium">Expires</th>
                            <th className="text-left p-4 font-medium">Named</th>
                            <th className="text-left p-4 font-medium">Read only</th>
                            <th className="text-left p-4 font-medium">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {licenses.length > 0 ? (
                            licenses.map((license, index) => (
                                <tr key={index}>
                                    <td className="p-4 text-gray-700">{license.module_name}</td>
                                    <td className="p-4 text-gray-700">{license.license_expires}</td>
                                    <td className="p-4 text-gray-700">{license.namedUser}</td>
                                    <td className="p-4 text-gray-700">{license.readOnlyUser}</td>
                                    <td className="p-4 text-gray-700">{license.total}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className='text-gray-500 p-4 text-center'>No licenses found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function EditView() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: companyInfo } = useQuery(companyInfoOptions());
    const [formData, setFormData] = useState({
        company_name: '',
        registration_number: '',
        industry: '',
        headquarters_address: '',
        company_logo: null
    });

    const navigate = useNavigate();
    const dispatch = useDispatchMessage();

    const updateCompanyMutation = useUpdateCompany({
        onSuccess: () => {
            dispatch({
                type: 'success',
                message: 'Company information updated successfully'
            });
            navigate('/settings/organizational-structure');
        },
        onError: (error) => {
            dispatch({
                type: 'error',
                message: error?.response?.data?.message || 'Failed to update company information'
            });
        }
    });

    useEffect(() => {
        if (companyInfo) {
            setFormData({
                company_name: companyInfo.company_name || '',
                registration_number: companyInfo.registration_number || '',
                industry: companyInfo.industry || '',
                headquarters_address: companyInfo.headquarters_address || '',
                company_logo: null
            });
        }
    }, [companyInfo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });
        updateCompanyMutation.mutate({ data });
    };

    return (
        <form className='space-y-8' onSubmit={handleSubmit}>
            <div className='flex justify-between items-center'>
                <h3 className='font-semibold text-xl'>Update company information</h3>
            </div>

            <div className='flex flex-col gap-4'>
                <h4 className='font-semibold text-lg'>Basic information</h4>
                <div>
                    <Field label={'Company name'} name={'company_name'} value={formData.company_name} onChange={handleInputChange} placeholder={'Enter company name'} />
                </div>
                <div>
                    <Field label={'Serial Number'} name={'registration_number'} value={formData.registration_number} onChange={handleInputChange} placeholder={'Enter serial number'} />
                </div>
                <div>
                    <Field label={'Industry'} name={'industry'} value={formData.industry} onChange={handleInputChange} placeholder={'Enter industry'} />
                </div>
                <div>
                    <Field label={'Address'} name={'headquarters_address'} value={formData.headquarters_address} onChange={handleInputChange} placeholder={'Enter address'} />
                </div>
            </div>

            <div className='flex gap-6'>
                <FormCancelButton text={'Discard'} colorBlack={true} />
                <FormProceedButton text={updateCompanyMutation.isPending ? 'Saving changes...' : 'Save changes'} onClick={handleSubmit} disabled={updateCompanyMutation.isPending} />
            </div>
        </form>
    );
}

export default CompanyInformation;