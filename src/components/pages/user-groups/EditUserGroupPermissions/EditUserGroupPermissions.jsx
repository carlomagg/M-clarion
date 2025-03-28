import styles from './EditUserGroupPermissions.module.css';
import { useImmer } from 'use-immer';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import { extractSelectedPermissions, organizePermissions } from '../../../../utils/helpers';
import { permissionsOptions, userGroupOptions, useUpdateUserGroupPermisisons } from '../../../../queries/permissions-queries';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FormCancelButton, FormProceedButton } from '../../../partials/buttons/FormButtons/FormButtons';
import LoadingIndicatorOne from '../../../partials/skeleton-loading-indicators/LoadingIndicatorOne';
import AddPermissionsToUserGroupForm from '../../../partials/forms/user-groups/AddPermissionsToUserGroupForm/AddPermissionsToUserGroupForm';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import Error from '../../../partials/Error/Error';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';

function EditUserGroupPermissions() {

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams, _] = useSearchParams();
    const [permissions, setPermissions] = useImmer([]);

    const groupId = searchParams.get('g');

    // permissions and userGroup queries
    const [permissionsQuery, userGroupQuery] = useQueries({
        queries: [permissionsOptions(), userGroupOptions(groupId)]
    });

    // mutations for updating userGroup permissions
    const {mutate, isPending: isUpdatingPermissions} = useUpdateUserGroupPermisisons({onSuccess, onError, onSettled});
    // set global indicator message
    const dispatchMessage = useDispatchMessage()
    useEffect(() => {
        (isUpdatingPermissions) && dispatchMessage('processing', 'Updating user group permissions');
    }, [isUpdatingPermissions]);
    async function onSuccess(data) {
        dispatchMessage('success', data.message);
        return queryClient.invalidateQueries({queryKey: ['user-groups']});
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }
    function onSettled(data, error) {
        if (!error) navigate('/user-groups');
    }

    useEffect(() => {
        let {data: allPermissions} = permissionsQuery;
        let {data: userGroup} = userGroupQuery;
        if (allPermissions && userGroup) {
            setPermissions(organizePermissions(allPermissions, userGroup.permission_ids));
        }
    },[permissionsQuery.data, userGroupQuery.data]);

     // submit form
     async function handleSubmit() {
        // prepare form data
        mutate({groupId, data: {permission_ids: extractSelectedPermissions(permissions)}});
    }

    const isLoading = permissionsQuery.isLoading || userGroupQuery.isLoading;
    const error = permissionsQuery.error || userGroupQuery.error;
    
    if (isLoading) {
        return <LoadingIndicatorOne />
    }

    if (error) {
        return <Error error={error} />
    }

    const userGroup = userGroupQuery.data;

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={`Edit user group permissions | ${userGroup.group_name}`} />
            <PageHeader />
            <div className=''> {/* main content container */}
                <div className='mt-4 flex flex-col gap-6'>
                    <div className='bg-white rounded-lg flex flex-col gap-6 p-6'>
                        <AddPermissionsToUserGroupForm {...{permissions, setPermissions, mode: 'edit', name: userGroup.group_name}} />
                    </div>
                    <div className='bg-green-100 flex gap-3'>
                        <FormProceedButton text={isUpdatingPermissions ? 'Saving changes...' : 'Save changes'} onClick={handleSubmit} disabled={isUpdatingPermissions} />
                        <FormCancelButton onClick={() => navigate('/user-groups')} text={'Cancel'} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditUserGroupPermissions;