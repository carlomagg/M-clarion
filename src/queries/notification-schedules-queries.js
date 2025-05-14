import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

// Fetch notification schedules
export async function fetchNotificationSchedules() {
    try {
        console.log('Fetching notification schedules...');
        const response = await axios.get('/clarion_users/notification-schedules/view-all/');
        console.log('Notification schedules response:', response.data);
        return response.data;
    } catch (error) {
        console.error('fetchNotificationSchedules error:', error.message || error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        }
        throw error;
    }
}

// Fetch a single notification schedule
export async function fetchNotificationSchedule(id) {
    try {
        console.log(`Fetching notification schedule with ID ${id}...`);
        const response = await axios.get(`/clarion_users/notification-schedules/${id}/view/`);
        console.log('Notification schedule response:', response.data);
        return response.data;
    } catch (error) {
        console.error('fetchNotificationSchedule error:', error.message || error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        }
        throw error;
    }
}

// Create a notification schedule
export async function createNotificationSchedule(data) {
    try {
        console.log('Creating notification schedule with data:', data);
        const response = await axios.post('/clarion_users/notification-schedules/', data);
        console.log('Create notification schedule response:', response.data);
        return response.data;
    } catch (error) {
        console.error('createNotificationSchedule error:', error.message || error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        }
        throw error;
    }
}

// Update a notification schedule
export async function updateNotificationSchedule({ id, data }) {
    try {
        console.log(`Updating notification schedule with ID ${id} with data:`, data);
        const response = await axios.put(`/clarion_users/notification-schedules/${id}/update/`, data);
        console.log('Update notification schedule response:', response.data);
        return response.data;
    } catch (error) {
        console.error('updateNotificationSchedule error:', error.message || error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        }
        throw error;
    }
}

// Delete a notification schedule
export async function deleteNotificationSchedule(id) {
    try {
        console.log(`Deleting notification schedule with ID ${id}...`);
        const response = await axios.delete(`/clarion_users/notification-schedules/${id}/delete/`);
        console.log('Delete notification schedule response:', response.data);
        return response.data;
    } catch (error) {
        console.error('deleteNotificationSchedule error:', error.message || error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        }
        throw error;
    }
}

// Query options
export function notificationSchedulesOptions(options = {}) {
    return queryOptions({
        queryKey: ['notificationSchedules'],
        queryFn: fetchNotificationSchedules,
        ...options
    });
}

export function notificationScheduleOptions(id, options = {}) {
    return queryOptions({
        queryKey: ['notificationSchedule', id],
        queryFn: () => fetchNotificationSchedule(id),
        ...options
    });
}

// Mutations
export function useCreateNotificationSchedule(callbacks = {}) {
    return useMutation({
        mutationFn: createNotificationSchedule,
        ...callbacks
    });
}

export function useUpdateNotificationSchedule(callbacks = {}) {
    return useMutation({
        mutationFn: updateNotificationSchedule,
        ...callbacks
    });
}

export function useDeleteNotificationSchedule(callbacks = {}) {
    return useMutation({
        mutationFn: deleteNotificationSchedule,
        ...callbacks
    });
} 