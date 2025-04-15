import { Textbox } from '../../../Elements/Elements';
import styles from './AddEmailAddressesForm.module.css';

function AddEmailAddressesForm({emailAddressesString, setEmailAddressesString, validationErrors, setValidationErrors}) {

    function handleEmailChange(event) {
        setValidationErrors({
            ...validationErrors, 'email_addresses_string': null
        });
        setEmailAddressesString(event.target.value);
    }

    return (
        <form className='flex flex-col gap-6'>
            <div>
                <h3 className='text-xl font-semibold'>Add user details</h3>
                <p>Give to access to your GRC to a new user by creating their user accounts</p>
            </div>
            <div className='flex flex-col gap-3'>
                <label htmlFor="email_addresses_string" className='font-medium'>Email address</label>
                <p className='italic text-text-gray'>
                    Email addresses should be separated by a comma “,”  
                </p>
                <Textbox {...{name: 'email_addresses_string', error: validationErrors.email_addresses_string, value: emailAddressesString, onChange: handleEmailChange, placeholder: 'Paste email addresses', height: 224}} />
            </div>
        </form>
    );
}

export default AddEmailAddressesForm;