import styles from './AddActiveDirectoryReview.module.css';

function AddActiveDirectoryReview({ setCurrentStep }) {
    const validEmails = ['ib@gmal.com', 'osa@mitiget.com', 'ilot@we.vr', 'adsf@er.vb', 'dosiurtrn@wer.yt'];
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
                            <li key={email} className='space-x-4 py-2 border-b border-b-[#D0D0D0] last:border-none'>
                                <span>{i + 1}.</span>
                                <span>{email}</span>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </section>
    )
}

export default AddActiveDirectoryReview;