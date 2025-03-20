import styles from './ReviewEmailAddressesForm.module.css';

import valid from '../../../../../assets/icons/valid.svg';
import invalid from '../../../../../assets/icons/invalid.svg';
import plus from '../../../../../assets/icons/rounded-plus.svg';

import { Tooltip } from 'react-tooltip';
import { validateEmail } from '../../../../../utils/helpers';

function ReviewEmailAddressesForm({ formData, setFormData, emailListEmpty }) {

    function handleInputChange(index, value) {
        setFormData(draft => {
            let email = draft.emails[index];
            email.value = value;
            email.isValid = validateEmail(value)
        })
    }

    function handleEmailSelect(index) {
        setFormData(draft => {
            let email = draft.emails[index];
            email.isSelected = !email.isSelected;
        });
    };

    function handleAddNewField() {
        setFormData(draft => {
            draft.emails.push({value: '', isValid: false, isSelected: false});
        })
    }

    function handleSelectAll(event) {
        setFormData(draft => {
            draft.emails.forEach(email => email.isSelected = event.target.checked);
        });
    };

    function handleRemoveEmails() {
        setFormData(draft => {
            draft.emails = draft.emails.filter(email => !email.isSelected);
        });
    };

    const emails = formData.emails;
    const anySelected = emails.some(email => email.isSelected);
    const allSelected = emails.length > 0 && emails.every(email => email.isSelected);

    return (
        <form className='flex flex-col gap-6'>
            <div>
                <h3 className='text-xl font-semibold'>Review emails</h3>
                <p>Give to access to your GRC to a new user by creating their user accounts</p>
            </div>
            <div className='flex items-center gap-3'>
                <span>#</span>
                <label className='space-x-3 cursor-pointer select-none'>
                    <input type="checkbox" name="check_all" checked={allSelected} onChange={handleSelectAll} className='cursor-pointer' />
                    <span className='font-semibold text-lg'>List of all email addresses</span>
                </label>
                <div className='ml-auto flex items-center gap-4'>
                    <span className='font-semibold'>Total: {formData.emails.length}</span>
                    {anySelected && <span className='font-semibold text-[#F00] cursor-pointer' onClick={handleRemoveEmails}>Remove</span>}
                </div>
            </div>
            <ul className='flex flex-col gap-4'>
                {emails.map((email, i) => {
                    return (
                        <li key={i} className='border-b border-b-[#D3D3D3] flex items-center gap-2 py-3'>
                            <span>{i + 1}.</span>
                            <input type="checkbox" checked={email.isSelected} onChange={() => handleEmailSelect(i)} />
                            <div className='grow rounded-lg border border-border-gray overflow-hidden relative'>
                                <input type="text" value={email.value} onChange={(e) => handleInputChange(i, e.target.value)} className='w-full p-3 pr-9 outline-none' />
                                <div className='absolute top-[calc(50%_-_9px)] right-3 cursor-pointer'>
                                    <span data-tooltip-id='email-status' data-tooltip-content={email.isValid ? 'Valid' : 'Invalid'}>
                                        <img src={email.isValid ? valid : invalid} alt="" className='' />
                                    </span>
                                    <Tooltip id='email-status' />
                                </div>
                            </div>
                        </li>
                    );
                })}
                {emailListEmpty && <div className='text-sm text-red-500'>Add new email(s) or go back to the previous step</div>}
            </ul>
            <div className='flex items-center justify-center'>
                <div className='flex flex-col items-center cursor-pointer' onClick={handleAddNewField}>
                    <img src={plus}  />
                    <span className='text-lg font-bold'>Add new field</span>
                </div>
            </div>
        </form>
    );
}

export default ReviewEmailAddressesForm;