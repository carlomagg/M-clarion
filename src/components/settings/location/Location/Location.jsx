import { useSearchParams } from 'react-router-dom';
import styles from './Location.module.css';
import { useLocation, useUpdateLocation } from '../../../../queries/location-queries';
import ActionsDropdown from '../../../partials/dropdowns/ActionsDropdown/ActionsDropdown';
import { useImmer } from 'use-immer';
import { Field } from '../../../partials/Elements/Elements';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';

function Location() {
    const [searchParams, setSearchParams] = useSearchParams();
    // const {isLoading, data: location, error} = useLocation();
    const location = {
        country: {
            country_name: 'Nigeria',
            country_code: 'NG'
        },
        state: {
            state_name: 'Kwara',
            state_code: 'KW'
        },
        city: {
            city_name: 'Ilorin',
            city_code: 'IL'
        }
    }

    function handleEditClicked() {
        setSearchParams((prev) => {
            prev.set('action', 'edit');
            return prev;
        });
    }

    console.log(location)

    // if (isLoading) {
    //     return <div>Fetching location</div>
    // }

    // if (error) {
    //     return <div>An error occured: {error}</div>
    // }

    const inEditMode = searchParams.has('action') && searchParams.get('action') === 'edit';

    const content = inEditMode ? <EditView location={location} /> : <DefaultView location={location} onEditClicked={handleEditClicked} />;

    return (
        <div className='px-8 py-6 h-full overflow-auto flex flex-col gap-6'>
            {content}
        </div>
    );
}

function DefaultView({onEditClicked, location}) {
    const actions = [
        {text: 'Edit', type: 'action', onClick: onEditClicked},
    ];

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8'>
            <div className='flex justify-between relative'>
                <h3 className='font-semibold text-xl'>Location information</h3>
                <ActionsDropdown label={'Actions'} items={actions} />
            </div>
            <div className='flex flex-col gap-4'>
                <h4 className='font-semibold text-lg'>Country</h4>
                <div className='flex gap-6'>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>Country name</span>
                        <span>{location['country']['country_name']}</span>
                    </div>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>Country code</span>
                        <span>{location['country']['country_code']}</span>
                    </div>
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <h4 className='font-semibold text-lg'>State</h4>
                <div className='flex gap-6'>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>State name</span>
                        <span>{location['state']['state_name']}</span>
                    </div>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>State code</span>
                        <span>{location['state']['state_code']}</span>
                    </div>
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <h4 className='font-semibold text-lg'>City</h4>
                <div className='flex gap-6'>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>City name</span>
                        <span>{location['city']['city_name']}</span>
                    </div>
                    <div className='flex flex-col gap-3 flex-1'>
                        <span className='font-semibold'>City code</span>
                        <span>{location['city']['city_code']}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditView({companyInfo}) {

    const [formData, setFormData] = useImmer({
        country: {name: '', code: ''},
        state: {name: '', code: ''},
        city: {name: '', code: ''}
    });

    const {isPending: isUpdatingLocation, mutate} = useUpdateLocation({});

    function handleInputChange(e, field) {
        setFormData(draft => {
            draft[field][e.target.name] = e.target.value;
        })
    }
    
    function handleSubmit() {
        // console.log(formData); return;
        mutate(formData);
    }

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8'>
            <div className=''>
                <h3 className='font-semibold text-xl'>Locatoin information</h3>
            </div>
            <div className='flex flex-col gap-4'>
                <h4 className='font-semibold text-lg'>Country</h4>
                <div className='flex gap-6'>
                    <Field label={'Country name'} name={'name'} value={formData['country']['name']} onChange={(e) => handleInputChange(e, 'country')} placeholder={'Enter country name'} />
                    <Field label={'Country code'} name={'code'} value={formData['country']['code']} onChange={(e) => handleInputChange(e, 'country')} placeholder={'Enter country code'} />
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <h4 className='font-semibold text-lg'>State</h4>
                <div className='flex gap-6'>
                    <Field label={'State name'} name={'name'} value={formData['state']['name']} onChange={(e) => handleInputChange(e, 'state')} placeholder={'Enter state name'} />
                    <Field label={'State code'} name={'code'} value={formData['state']['code']} onChange={(e) => handleInputChange(e, 'state')} placeholder={'Enter state code'} />
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <h4 className='font-semibold text-lg'>City</h4>
                <div className='flex gap-6'>
                    <Field label={'City name'} name={'name'} value={formData['city']['name']} onChange={(e) => handleInputChange(e, 'city')} placeholder={'Enter city name'} />
                    <Field label={'City code'} name={'code'} value={formData['city']['code']} onChange={(e) => handleInputChange(e, 'city')} placeholder={'Enter city code'} />
                </div>
            </div>
            <div className='flex gap-6'>
                <FormCancelButton text={'Discard'} colorBlack={true} />
                <FormProceedButton text={isUpdatingLocation ? 'Saving changes...' : 'Save changes'} onClick={handleSubmit} disabled={isUpdatingLocation} />
            </div>
        </div>
    );
}

export default Location;