import axios from 'axios';
import { useMutation, queryOptions } from '@tanstack/react-query';

// Common base URL for process boundary endpoints
const BASE_URL = '/process/process-boundaries';

// Fetch all process boundaries
async function fetchProcessBoundaries() {
    try {
        // Try the main endpoint
        try {
            const response = await axios.get(`${BASE_URL}/view-all/`);
            console.log('Successful fetch from view-all endpoint:', response.data);
            return response.data;
        } catch (mainErr) {
            console.warn('Error with main endpoint, trying fallback:', mainErr.message);
            
            // Try alternate endpoint patterns if main fails
            try {
                const fallbackResponse = await axios.get(BASE_URL);
                console.log('Successful fetch from fallback endpoint:', fallbackResponse.data);
                return fallbackResponse.data;
            } catch (fallbackErr) {
                console.error('Fallback endpoint also failed:', fallbackErr.message);
                throw mainErr; // Throw the original error
            }
        }
    } catch (error) {
        console.error("Error fetching process boundaries:", error);
        throw error;
    }
}

// Fetch a single process boundary
async function fetchProcessBoundary(boundaryQuery) {
    const [_, __, id] = boundaryQuery.queryKey;
    
    if (!id) {
        console.error("No boundary ID provided");
        throw new Error("No boundary ID provided");
    }
    
    console.log(`Fetching process boundary with ID: ${id}`);
    
    try {
        // Try the main endpoint with the standard view format
        try {
            console.log(`Trying main endpoint: ${BASE_URL}/${id}/view/`);
            const response = await axios.get(`${BASE_URL}/${id}/view/`);
            console.log("Successful fetch from main endpoint:", response.data);
            return response.data;
        } catch (mainErr) {
            console.warn(`Error with main endpoint for ID ${id}:`, mainErr.message);
            
            // Try alternate endpoint pattern if main fails
            try {
                console.log(`Trying fallback endpoint: ${BASE_URL}/${id}`);
                const fallbackResponse = await axios.get(`${BASE_URL}/${id}`);
                console.log("Successful fetch from fallback endpoint:", fallbackResponse.data);
                return fallbackResponse.data;
            } catch (fallbackErr) {
                console.error(`Fallback endpoint also failed for ID ${id}:`, fallbackErr.message);
                throw mainErr; // Throw the original error
            }
        }
    } catch (error) {
        console.error(`Error fetching process boundary ${id}:`, error);
        throw error;
    }
}

// Add a new process boundary
async function addProcessBoundary({data}) {
    try {
        const response = await axios.post(BASE_URL, data);
        return response.data;
    } catch (error) {
        console.error("Error adding process boundary:", error);
        throw error;
    }
}

// Update a process boundary
async function updateProcessBoundary({id, data}) {
    try {
        // Try the main endpoint
        try {
            const response = await axios.put(`${BASE_URL}/${id}/update/`, data);
            return response.data;
        } catch (mainErr) {
            // Try alternate endpoint pattern if main fails
            const fallbackResponse = await axios.put(`${BASE_URL}/${id}`, data);
            return fallbackResponse.data;
        }
    } catch (error) {
        console.error(`Error updating process boundary ${id}:`, error);
        throw error;
    }
}

// Delete a process boundary
async function deleteProcessBoundary(id) {
    try {
        // Try the main endpoint
        try {
            const response = await axios.delete(`${BASE_URL}/${id}/delete/`);
            return response.data;
        } catch (mainErr) {
            // Try alternate endpoint pattern if main fails
            const fallbackResponse = await axios.delete(`${BASE_URL}/${id}`);
            return fallbackResponse.data;
        }
    } catch (error) {
        console.error(`Error deleting process boundary ${id}:`, error);
        throw error;
    }
}

// Query options
export function processBoundariesOptions(options) {
    return queryOptions({
        queryKey: ['process', 'boundaries'],
        queryFn: fetchProcessBoundaries,
        ...options
    });
}

export function processBoundaryOptions(id, options) {
    return queryOptions({
        queryKey: ['process', 'boundaries', id],
        queryFn: fetchProcessBoundary,
        ...options
    });
}

// Mutations
export function useAddProcessBoundary(callbacks) {
    return useMutation({
        mutationFn: addProcessBoundary,
        ...callbacks
    });
}

export function useUpdateProcessBoundary(callbacks) {
    return useMutation({
        mutationFn: updateProcessBoundary,
        ...callbacks
    });
}

export function useDeleteProcessBoundary(callbacks) {
    return useMutation({
        mutationFn: deleteProcessBoundary,
        ...callbacks
    });
} 