import styles from './EditUserPermissions.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import { useEffect, useState } from 'react';

import { useQueries, useQueryClient } from '@tanstack/react-query';
import { permissionsOptions, userGroupsOptions } from '../../../../queries/permissions-queries';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userOptions, useUpdaterUserPermissions } from '../../../../queries/users-queries';
import { extractSelectedPermissions, organizePermissions } from '../../../../utils/helpers';
import { useImmer } from 'use-immer';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';
import GrantUserPermsissionsForm from '../../../partials/forms/manage-users/GrantUserPermsissionsForm/GrantUserPermsissionsForm';
import LoadingIndicatorOne from '../../../partials/skeleton-loading-indicators/LoadingIndicatorOne';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import Error from '../../../partials/Error/Error';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';

function EditUserPermissions() {

    const [searchParams, _] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [permissions, setPermissions] = useImmer([]);

    const id = searchParams.get('u');

    // permissions, userGroups(permissionGroups) and user queries, data needed in from
    const [
        permissionsQuery,
        userGroupsQuery,
        userQuery,
    ] = useQueries({
        queries: [permissionsOptions(), userGroupsOptions(), userOptions(id, queryClient)]
    });

    // mutation for updating user permissions
    const {mutate, isPending: isUpdatingPermissions} = useUpdaterUserPermissions({onSuccess, onError, onSettled});
    const dispatchMessage = useDispatchMessage()
    useEffect(() => {
        let text = 'Updating user permissions';
        (isUpdatingPermissions) && dispatchMessage('processing', text);
    }, [isUpdatingPermissions]);
    async function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['users']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/users');
    }

    // initialize permissions state
    useEffect(() => {
        let permissions = permissionsQuery.data;
        let user = userQuery.data;

        if (user) {
            setSelectedGroups(user.group_ids)
        }
        if (permissions && user) {
            setPermissions(organizePermissions(permissions, user.permission_ids));
        }
    },[permissionsQuery.data, userQuery.data]);

    // submit form
    async function handleSubmit() {
        // prepare form data
        let formData = {
            group_ids: selectedGroups,
            permission_ids: extractSelectedPermissions(permissions)
        }
        mutate({userId: id, formData})
    }

    const isLoading = permissionsQuery.isLoading || userGroupsQuery.isLoading || userQuery.isLoading;
    const error = permissionsQuery.error || userGroupsQuery.error || userQuery.error;

    if (isLoading) return <LoadingIndicatorOne />
    if (error) return <Error error={error} />

    const permissionGroups = userGroupsQuery.data;
    const user = userQuery.data;

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={`Edit user permissions | ${user.firstname ? user.firstname+' '+user.lastname : user.email}`} />
            <PageHeader />
            <div className=''> {/* main content container */}
                <div className='mt-4 flex flex-col gap-6'>
                    <div className='bg-white rounded-lg flex flex-col gap-6 p-6'>
                        <div className='text-sm text-text-gray flex items-center justify-stretch gap-3'>
                            <div className='bg-text-pink/15 text-text-pink py-1 px-2 rounded grow flex flex-col items-center cursor-pointer'>
                                User permissions
                            </div>
                        </div>
                        <GrantUserPermsissionsForm {...{permissions, setPermissions, permissionGroups, firstName: user.firstname, selectedGroups, setSelectedGroups}} type='existing' />
                    </div>
                    <div className='bg-green-100 flex gap-3'>
                        <FormProceedButton text={isUpdatingPermissions ? 'Saving...' : 'Save'} disabled={isUpdatingPermissions} onClick={handleSubmit} />
                        <FormCancelButton text={'Cancel'} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditUserPermissions;