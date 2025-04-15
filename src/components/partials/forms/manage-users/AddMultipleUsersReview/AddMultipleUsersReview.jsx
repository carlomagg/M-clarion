import styles from './AddMultipleUsersReview.module.css';

import PermissionReviewList from '../../../PermissionReviewList/PermissionReviewList';

function AddMultipleUsersReview({ formData, setCurrentStep, permissions }) {
    const validEmails = formData.emails.filter(email => email.isValid);

    return (
        <section className='flex flex-col gap-6'>
            <div>
                <h3 className='text-xl font-semibold'>Final review</h3>
                <p>Quick look at everything before you save this new user</p>
            </div>
            <div className='flex flex-col gap-4'> {/* basic info */}
                <div className='flex items-center pr-24'>
                    <h4 className='text-lg font-semibold grow'>Email addresses</h4>
                    <span className='text-sm text-text-pink cursor-pointer' onClick={()=>setCurrentStep(2)}>Edit</span>
                </div>
                <ul className='flex flex-col gap-4'>
                    {validEmails.map((email, i) => {
                        return (
                            <li key={email.value} className='space-x-4'>
                                <span>{i + 1}.</span>
                                <span>{email.value}</span>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div className='flex flex-col gap-4'> {/* permssions */}
                <div className='flex items-center pr-24'>
                    <h4 className='text-lg font-semibold grow'>Permissions</h4>
                    <span className='text-sm text-text-pink cursor-pointer' onClick={()=>setCurrentStep(3)}>Edit</span>
                </div>
                <div className='flex flex-col gap-3'>
                    <PermissionReviewList permissions={permissions} allowed={true} />
                </div>
                <div className='flex flex-col gap-3'>
                    <PermissionReviewList permissions={permissions} allowed={false} />
                </div>
            </div>
        </section>
    )
}

export default AddMultipleUsersReview;