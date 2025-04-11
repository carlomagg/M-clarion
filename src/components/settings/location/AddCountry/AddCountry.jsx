import { useEffect, useState, useRef } from 'react';
import { FormCancelButton, FormProceedButton, NewUserButton, WhiteButton } from '../../../partials/buttons/FormButtons/FormButtons';
import { Field } from '../../../partials/Elements/Elements';
import styles from './AddCountry.module.css';
import { countriesOptions, useAddCountry } from '../../../../queries/location-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';
import BackButton from '../../components/BackButton';
import SelectDropdown from '../../../partials/dropdowns/SelectDropdown/SelectDropdown';
import { FormLoadingIndicator } from '../../../partials/skeleton-loading-indicators/SettingsIndicator';
import Error from '../../../partials/Error/Error';

function AddCountry() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        country_name: '',
        country_code: ''
    });

    // For the searchable dropdown
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const dropdownRef = useRef(null);
    
    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Fetch countries
    const { isLoading, error, data: countries } = useQuery(countriesOptions());

    const {isPending: isAddingCountry, mutate} = useAddCountry({onSuccess, onError, onSettled});
    const dispatchMessage = useDispatchMessage();
    
    useEffect(() => {
        (isAddingCountry) && dispatchMessage('processing', 'Adding country')
    }, [isAddingCountry]);
    
    function onSuccess(data) {
        dispatchMessage('success', data.message)
        return queryClient.invalidateQueries({queryKey: ['countries']});
    }
    
    function onError(error) {
        dispatchMessage('failed', error.response.data.message)
    }
    
    function onSettled(data, error) {
        if (!error) navigate('/settings/location');
    }

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }
    
    function handleSubmit() {
        mutate({data: formData});
    }

    if (isLoading) return <FormLoadingIndicator />
    if (error) return <Error error={error} />

    // Format countries for the dropdown
    const countryOptions = countries ? countries.map(country => ({
        id: country.country_id,
        text: country.country_name
    })) : [];

    // Filter countries based on search term
    const filteredCountryOptions = countryOptions.filter(country => 
        country.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle country selection
    const handleSelectCountry = (country) => {
        setSelectedCountry(country);
        setSearchTerm(country.text);
        setIsDropdownOpen(false);
    };

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8 min-h-full'>
            <header className='flex gap-3'>
                <BackButton />
                <h3 className='font-semibold text-xl'>Manage Country</h3>
            </header>
            
            {/* Countries list with search */}
            <div className="flex flex-col gap-3">
                <h4 className="font-semibold text-lg">Countries</h4>
                <div className="relative" ref={dropdownRef}>
                    <input
                        type="text"
                        className="w-full p-3 border border-border-gray rounded-lg outline-none focus:border-text-pink"
                        placeholder="Search for a country"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(true);
                        }}
                        onClick={() => setIsDropdownOpen(true)}
                    />
                    {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 border border-border-gray rounded-lg max-h-60 overflow-y-auto bg-white shadow-lg">
                            {filteredCountryOptions.length > 0 ? (
                                filteredCountryOptions.map(country => (
                                    <div 
                                        key={country.id} 
                                        className={`p-3 hover:bg-gray-100 cursor-pointer border-b border-border-gray ${selectedCountry?.id === country.id ? 'bg-gray-200' : ''}`}
                                        onClick={() => handleSelectCountry(country)}
                                    >
                                        {country.text}
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-gray-500">No countries found</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className='flex flex-col gap-3'>
                <h4 className='font-semibold text-lg'>Add New Country</h4>
                <div className='flex gap-6'>
                    <Field label={'Country name'} name={'country_name'} value={formData['country_name']} onChange={handleChange} placeholder={'Enter country name'} />
                    <Field label={'Country code'} name={'country_code'} value={formData['country_code']} onChange={handleChange} placeholder={'Enter country code'} />
                </div>
            </div>
            
            <div className='flex gap-6 justify-center'>
                <WhiteButton text={'Cancel'} onClick={() => navigate(-1)} />
                <NewUserButton text={'Add country'} onClick={handleSubmit} disabled={isAddingCountry} isLoading={isAddingCountry} />
            </div>
        </div>
    );
}

export default AddCountry;