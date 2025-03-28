import styles from './AddUserGroupInfoForm.module.css';

function AddUserGroupInfoForm({formData, setFormData, validationErrors, setValidationErrors}) {

    function handleChange(event) {
        const {name, value} = event.target;
        setValidationErrors({
            ...validationErrors,
            [name]: null
        })

        setFormData({
            ...formData,
            [name]: value
        });
    }

    return (
        <form className='flex flex-col gap-6'>
            <div>
                <h3 className='text-xl font-semibold'>Create new group</h3>
                {/* <p>Give to access to your GRC to a new user by creating their user account</p> */}
            </div>
            <div className='flex flex-col gap-3'>
                <label htmlFor="name" className='font-medium'>Group name</label>
                <div className='flex flex-col gap-2'>
                    <input id='name' type="text" name='name' value={formData.name} onChange={handleChange} placeholder='Enter user group name' className='placeholder:text-placeholder-gray border border-border-gray rounded-lg p-3 outline-text-pink' />
                    {validationErrors.name && <div className='text-sm text-red-500'>{validationErrors.name}</div>}
                </div>
            </div>
            <div className='flex flex-col gap-3'>
                <label htmlFor="description" className='font-medium'>Group description</label>
                <div className='flex flex-col gap-2'>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} className='placeholder:text-placeholder-gray border border-border-gray rounded-lg p-3 outline-text-pink h-28 resize-none' placeholder='Enter brief description'></textarea>
                    {validationErrors.description && <div className='text-sm text-red-500'>{validationErrors.description}</div>}
                </div>
            </div>
        </form>
    )
}

export default AddUserGroupInfoForm;