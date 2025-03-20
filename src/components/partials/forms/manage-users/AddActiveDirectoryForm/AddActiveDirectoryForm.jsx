import styles from './AddActiveDirectoryForm.module.css';

function AddActiveDirectoryForm({formData, setFormData, validationErrors, setValidationErrors}) {

    function handleChange(event) {
        setValidationErrors({
            ...validationErrors,
            [event.target.name]: null
        })
        let new_value;

        if (event.target.type == 'checkbox') {
            new_value = !formData[event.target.name];
        } else new_value = event.target.value;

        let newFormData = {
            ...formData,
            [event.target.name]: new_value
        };

        setFormData(newFormData);
    }

    return (
        <form className='flex flex-col gap-6'>
            <div>
                <h3 className='text-xl font-semibold'>Add active directory</h3>
                <p>Give to access to your GRC to a new user by creating their user account</p>
            </div>
            <div className='border-y border-[#A1A1A1] py-5 flex flex-col gap-6'>
                <section className='space-y-2'>
                    <h4 className='font-semibold text-lg'>General details</h4>
                    <div className='flex flex-col gap-3'> {/* fields */}
                        <div className='flex flex-col gap-3'>
                            <label htmlFor="name" className='font-medium'>Name</label>
                            <input type="text" name="name" placeholder='Provide a unique name for this Active Directory (AD) connection' className='w-full rounded-lg border border-border-gray p-3 outline-text-pink ' />
                        </div>
                        <div className='flex flex-col gap-3'>
                            <label htmlFor="description" className='font-medium'>Description</label>
                            <input type="text" name="description" placeholder='Provide a brief description of what this AD integration will be used for' className='w-full rounded-lg border border-border-gray p-3 outline-text-pink ' />
                        </div>
                    </div>
                </section>
                <section className='space-y-2'>
                    <h4 className='font-semibold text-lg'>Connection details</h4>
                    <div className='flex gap-6'> {/* field */}
                        <div className='flex flex-col gap-3'>
                            <label htmlFor="domain_name" className='font-medium'>Domain name</label>
                            <input type="text" name="domain_name" placeholder='Enter domain name' className='w-full rounded-lg border border-border-gray p-3 outline-text-pink ' />
                        </div>
                        <div className='flex flex-col gap-3'>
                            <label htmlFor="domain_controller" className='font-medium'>Domain controller</label>
                            <input type="text" name="domain_controller" placeholder='Enter IP address' className='w-full rounded-lg border border-border-gray p-3 outline-text-pink ' />
                        </div>
                        <div className='flex flex-col gap-3'>
                            <label htmlFor="port" className='font-medium'>Port</label>
                            <input type="number" name="port" placeholder='Enter port number' className='w-full rounded-lg border border-border-gray p-3 outline-text-pink ' />
                        </div>
                    </div>
                </section>
                <section className='space-y-2'>
                    <h4 className='font-semibold text-lg'>Authentication</h4>
                    <div className='flex gap-6'> {/* field */}
                        <div className='flex flex-col gap-3 grow'>
                            <label htmlFor="username" className='font-medium'>Username</label>
                            <input type="text" name="username" placeholder='Enter username' className='w-full rounded-lg border border-border-gray p-3 outline-text-pink ' />
                        </div>
                        <div className='flex flex-col gap-3 grow'>
                            <label htmlFor="password" className='font-medium'>Password</label>
                            <input type="text" name="password" placeholder='Enter password' className='w-full rounded-lg border border-border-gray p-3 outline-text-pink ' />
                        </div>
                    </div>
                </section>
            </div>
            <button type="button" className='bg-black py-[14px] px-6 text-white font-bold tracking-wide rounded-lg line shadow-[0px_1px_3px_1px_#00000026,0px_1px_2px_0px_#0000004D] self-start'>
                Test connection
            </button>
        </form>
    )
}

export default AddActiveDirectoryForm;