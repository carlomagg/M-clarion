import styles from './AddActiveDirectory.module.css';
import { useState } from 'react';
import { useImmer } from 'use-immer'

import right_arrow from '../../../../assets/icons/small-right-arrow.svg';
import PageHeader from '../../../partials/PageHeader/PageHeader';
import AddActiveDirectoryForm from '../../../partials/forms/manage-users/AddActiveDirectoryForm/AddActiveDirectoryForm';
import ActiveDirectoryMappingForm from '../../../partials/forms/manage-users/ActiveDirectoryMappingForm/ActiveDirectoryMappingForm';
import AddActiveDirectoryReview from '../../../partials/forms/manage-users/AddActiveDirectoryReview/AddActiveDirectoryReview';
import PageTitle from '../../../partials/PageTitle/PageTitle';

function AddActiveDirectory() {
    const [currentStep, setCurrentStep] = useState(1);
    const [stepsCompleted, setStepsCompleted] = useState(0);
    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useImmer({
        send_login_details: false,
        email_addresses_string: '',
        email_address_list: []
    });

    async function handleNextClicked() {
        if (currentStep == 1) {
            // if (validateFormOne()) {
            //     if (stepsCompleted < 1) setStepsCompleted(1);

            //     if (registrationMethod === 'email') {
            //         setFormData(draft => {
            //             draft.email_address_list = createListFromString(formData.email_addresses_string)
            //             .map(((email, i) => {
            //                 return {value: email, isSelected: false, isValid: validateEmail(email)}
            //             }));
            //         });
            //     } else if (registrationMethod === 'file') {
            //         // parse file and set currentStep to 2
            //         parseFile();
            //     }
            // }
            setCurrentStep(2);

        } else if (currentStep == 2) {
            setCurrentStep(3)

            if (stepsCompleted < 2) setStepsCompleted(2);
        } else if (currentStep == 3) {
            setCurrentStep(4)

            if (stepsCompleted < 3) setStepsCompleted(3);
        } else if (currentStep == 4) {
            // setCurrentStep(4)

            // if (stepsCompleted < 4) setStepsCompleted(3);
        }
    }

    const active_header_style = 'bg-text-pink/15 text-text-pink';
    const link_element = <img src={right_arrow} className="w-2 h-3" />;

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={`Add active directory`} />
            <PageHeader />
            <div className=''> {/* main content container */}
                <div className='mt-4 flex flex-col gap-6'>
                    <div className='bg-white rounded-lg flex flex-col gap-6 p-6'>
                        <div className='text-sm text-text-gray flex items-center justify-stretch gap-3'>
                            <div className={`${currentStep >= 1 && active_header_style} py-1 px-2 rounded grow flex flex-col items-center cursor-pointer`} onClick={() => setCurrentStep(1)}>
                                Add active directory
                            </div>
                            { link_element }
                            <div className={`${currentStep >= 2 && active_header_style} py-1 px-2 rounded grow flex flex-col items-center cursor-pointer`} onClick={() => stepsCompleted >= 1 && setCurrentStep(2)}>
                                Mapping
                            </div>
                            { link_element }
                            <div className={`${currentStep >= 3 && active_header_style} py-1 px-2 rounded grow flex flex-col items-center cursor-pointer`} onClick={() => stepsCompleted >= 1 && setCurrentStep(3)}>
                                Finish
                            </div>
                        </div>
                        {currentStep == 1 && <AddActiveDirectoryForm {...{formData, setFormData, validationErrors, setValidationErrors}} />}
                        {currentStep == 2 && <ActiveDirectoryMappingForm />}
                        {currentStep == 3 && <AddActiveDirectoryReview {...{setCurrentStep}} />}
                    </div>
                    <div className='bg-green-100 flex gap-3'>
                        <button type="button" className='py-3 px-24 rounded-lg bg-button-pink text-white font-bold flex flex-col items-center grow shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)] disabled:cursor-not-allowed' onClick={handleNextClicked}>
                            Next
                        </button>
                        <button type="button" className='py-3 px-24 rounded-lg bg-white font-bold flex flex-col items-center grow shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15),0px_1px_2px_0px_rgba(0,0,0,0.30)]'>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddActiveDirectory;