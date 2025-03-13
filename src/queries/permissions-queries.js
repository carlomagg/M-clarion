import { queryOptions, useMutation, useQueries, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { usersOptions } from "./users-queries";
import { useEffect, useState } from "react";

// query functions
async function fetchPermssions() {
    let response = await axios.get('clarion_users/permissions/');
    return response.data;
}

async function fetchUserGroups() {
    let response = await axios.get('clarion_users/user-groups/');
    return response.data['user_groups'];
}

async function fetchUserPermissionCount(userId) {
    let response = await axios.get(`clarion_users/users/${userId}/permissions/count/`);
    return response.data;
}


// mutation functions
async function addUserGroup({userGroup}) {
    let response = await axios.post('clarion_users/user-groups/', userGroup);
    return response.data;
}

async function updateUserGroupPermissions({groupId, data}) {
    let response = await axios.put(`clarion_users/user-group/${groupId}/permissions/`, data);
    return response.data;
}

async function updateUserGroupMembers({groupId, data}) {
    let response = await axios.put(`clarion_users/user-group/${groupId}/members/`, data);
    return response.data;
}

async function removeUserGroupMembers({groupId, data}) {
    let response = await axios.delete(`clarion_users/user-group/${groupId}/members/`, {data});
    return response.data;
}

async function deleteUserGroup({groupId}) {
    let response = await axios.delete(`clarion_users/user-group/${groupId}/delete/`);
    return response.data;
}


// query options
export function permissionsOptions() {
    return queryOptions({
        queryKey: ['permissions'],
        queryFn: fetchPermssions,
    })
}

export function permissionOptions(permId) {
    return queryOptions({
        ...permissionsOptions(),
        select: (permissions) => permissions.find(perm => perm.permission_id === permId)
    });
}

export function userGroupsOptions() {
    return queryOptions({
        queryKey: ['user-groups'],
        queryFn: fetchUserGroups,
    })
}

export function userGroupOptions(groupId) {
    return queryOptions({
        ...userGroupsOptions(),
        select: (data) => data.find(uG => uG.permission_group_id == groupId)
    });
}

export function permissionsCountOptions(userId) {
    return queryOptions({
        queryKey: ['permissions-count', userId],
        queryFn: () => fetchUserPermissionCount(userId)
    });
}

export function useUserGroupMembers(userGroupId) {
    const [usersQuery, userGroupQuery] = useQueries({
        queries: [usersOptions(), userGroupOptions(userGroupId)],
    });

    const isLoading = usersQuery.isLoading || userGroupQuery.isLoading;
    const error = usersQuery.error || usersQuery.error;
    let initialState;

    if (!isLoading && !error) {
        let data = usersQuery.data.filter(user => userGroupQuery.data.member_ids.includes(user.user_id));
        initialState = {isLoading, error, data};
    } else initialState = {isLoading, error, data: null};

    const [query, setQuery] = useState(initialState);

    useEffect(() => {
        if (usersQuery.data && userGroupQuery.data) {
            const userGroup = userGroupQuery.data;
            const userGroupMemberIds = userGroup?.member_ids || [];
    
            setQuery({isLoading: false, error: null, data: usersQuery.data.filter(user => userGroupMemberIds.includes(user.user_id))});
        }
    }, [usersQuery.data, userGroupQuery.data, userGroupId])

    return query;
}


// mutation hooks
export function useCreateUserGroup(callbacks) {
    return useMutation({
        mutationFn: addUserGroup,
        ...callbacks
    })
}

export function useUpdateUserGroupPermisisons(callbacks) {
    return useMutation({
        mutationFn: updateUserGroupPermissions,
        ...callbacks
    })
}

export function useUpdateUserGroupMembers(callbacks) {
    return useMutation({
        mutationFn: updateUserGroupMembers,
        ...callbacks
    })
}

export function useRemoveUserGroupMembers(callbacks) {
    return useMutation({
        mutationFn: removeUserGroupMembers,
        ...callbacks
    })
}

export function useDeleteUserGroup(callbacks) {
    return useMutation({
        mutationFn: deleteUserGroup,
        ...callbacks
    })
}