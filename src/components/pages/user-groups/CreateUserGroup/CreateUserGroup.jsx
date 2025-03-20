import styles from './CreateUserGroup.module.css';
import { useEffect, useState } from 'react';
import { useImmer } from 'use-immer';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import right_arrow from '../../../../assets/icons/small-right-arrow.svg';
import PageHeader from '../../../partials/PageHeader/PageHeader';
import AddUserGroupInfoForm from '../../../partials/forms/user-groups/AddUserGroupInfoForm/AddUserGroupInfoForm';
import CreateUserGroupReview from '../../../partials/forms/user-groups/CreateUserGroupReview/CreateUserGroupReview';
import AddPermissionsToUserGroupForm from '../../../partials/forms/user-groups/AddPermissionsToUserGroupForm/AddPermissionsToUserGroupForm';
import { extractSelectedPermissions, organizePermissions } from '../../../../utils/helpers';
import { permissionsOptions, useCreateUserGroup } from '../../../../queries/permissions-queries';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';
import { useNavigate } from 'react-router-dom';
import LoadingIndicatorOne from '../../../partials/skeleton-loading-indicators/LoadingIndicatorOne';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import Error from '../../../partials/Error/Error';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';

function CreateUserGroup() {

    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [stepsCompleted, setStepsCompleted] = useState(0);
    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useState({name: '', description: '', permission_ids: []});
    const [permissions, setPermissions] = useImmer([]);

    // permissions query. data needed in form
    const {isLoading, data, error} = useQuery(permissionsOptions());

    // mutation to add new user group
    const {mutate, isPending: isCreatingGroup} = useCreateUserGroup({onSuccess, onError, onSettled});
    // set global indicator message
    const dispatchMessage = useDispatchMessage()
    useEffect(() => {
        (isCreatingGroup) && dispatchMessage('processing', 'Creating user group');
    }, [isCreatingGroup]);
    function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['user-groups']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/user-groups');
    }

    // initialize permissions state
    useEffect(()=>{
        if (data) setPermissions(organizePermissions(data));
    }, [data]);

    async function validateFormOne() {
        const validationErrors = {};

        const required_fields = ['name', 'description'];

        // run validation checks
        required_fields.forEach(field => {
            if (!formData[field].trim()) validationErrors[field] = "This field is required";
        })

        if (Object.keys(validationErrors).length > 0) { // if there are validation errors, set validationErrors state and return
            setValidationErrors(validationErrors)
            return false;
        }

        return true;
    }

    async function handleNextClicked() {
        if (currentStep == 1) {
            if (await validateFormOne()) {
                if (stepsCompleted < 1) setStepsCompleted(1);
                console.log('next clicked')
                setCurrentStep(2);
            }

        } else if (currentStep == 2) {
            setCurrentStep(3)

            if (stepsCompleted < 2) setStepsCompleted(2);
        } else if (currentStep == 3) {
            // submit form
            const completeFormData = {
                ...formData,
                permission_ids: extractSelectedPermissions(permissions)
            }
            mutate({userGroup: completeFormData});
        }
    }

    const link_element = <img src={right_arrow} className="w-2 h-3" />;
    const active_header_style = 'bg-text-pink/15 text-text-pink';

    if (isLoading) {
        return <LoadingIndicatorOne />
    }

    if (error) {
        return <Error error={error} />
    }

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Create new user group'} />
            <PageHeader />
            <div className=''> {/* main content container */}
                <div className='mt-4 flex flex-col gap-6'>
                    <div className='bg-white rounded-lg flex flex-col gap-6 p-6'>
                        <div className='text-sm text-text-gray flex items-center justify-stretch gap-3'>
                            <div className={`${currentStep >= 1 && active_header_style} py-1 px-2 rounded grow flex flex-col items-center cursor-pointer`} onClick={() => setCurrentStep(1)}>
                                Add group info
                            </div>
                            { link_element }
                            <div className={`${currentStep >= 2 && active_header_style} py-1 px-2 rounded grow flex flex-col items-center cursor-pointer`} onClick={() => stepsCompleted >= 1 && setCurrentStep(2)}>
                                Add user permissions
                            </div>
                            { link_element }
                            <div className={`${currentStep >= 3 && active_header_style} py-1 px-2 rounded grow flex flex-col items-center cursor-pointer`} onClick={() => stepsCompleted >= 2 && setCurrentStep(3)}>
                                Finish
                            </div>
                        </div>
                        {currentStep == 1 && <AddUserGroupInfoForm {...{formData, setFormData, validationErrors, setValidationErrors}} />}
                        {currentStep == 2 && <AddPermissionsToUserGroupForm {...{permissions, setPermissions, mode: 'new', name: formData.name}} />}
                        {currentStep == 3 && <CreateUserGroupReview {...{formData, setCurrentStep, permissions}} />}
                    </div>
                    <div className='bg-green-100 flex gap-3'>
                        <FormProceedButton disabled={isCreatingGroup} onClick={(handleNextClicked)} text={currentStep == 3 ? (isCreatingGroup ? 'Creating group...' : 'Confirm'): 'Next'} />
                        <FormCancelButton onClick={() => navigate('/user-groups')} text={'Cancel'} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateUserGroup;