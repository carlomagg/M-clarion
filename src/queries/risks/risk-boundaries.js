import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

// Try multiple endpoints with fallback
async function tryEndpoints(endpoints, method, data = null, headers = {}) {
    if (!endpoints || endpoints.length === 0) {
        console.error('No endpoints provided to tryEndpoints');
        throw new Error('No endpoints provided');
    }
    
    console.log(`tryEndpoints called with method: ${method}, endpoints:`, endpoints);
    
    let lastError = null;
    let attempts = 0;
    
    for (const endpoint of endpoints) {
        attempts++;
        
        // Create an AbortController for this request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        try {
            console.log(`[Attempt ${attempts}/${endpoints.length}] Trying ${method} request to: ${endpoint}`);
            
            let response;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...headers
                },
                signal: controller.signal,
                timeout: 5000, // 5 second timeout
            };
            
            if (method === 'get') {
                response = await axios.get(endpoint, config);
            } else if (method === 'post') {
                response = await axios.post(endpoint, data ? JSON.stringify(data) : undefined, config);
            } else if (method === 'put') {
                response = await axios.put(endpoint, data ? JSON.stringify(data) : undefined, config);
            } else if (method === 'delete') {
                response = await axios.delete(endpoint, config);
            }
            
            // Clear the timeout as request completed successfully
            clearTimeout(timeoutId);
            
            console.log(`Success with ${method} ${endpoint}`, {
                status: response.status,
                statusText: response.statusText,
                hasData: !!response.data
            });
            
            return response;
        } catch (error) {
            // Clear the timeout as request has completed (with error)
            clearTimeout(timeoutId);
            
            // Check if this was a timeout or abort error
            if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
                console.warn(`Request timed out for ${method} ${endpoint}`);
            } else {
                console.warn(`Failed with ${method} ${endpoint}:`, error.message);
                console.warn('Error details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    headers: error.response?.headers
                });
            }
            
            lastError = error;
        }
    }
    
    console.error(`All ${endpoints.length} endpoints failed for ${method} request`);
    throw lastError || new Error('All endpoints failed');
}

// query functions
async function fetchRiskBoundaries() {
    try {
        // Try multiple possible endpoints, starting with the known working one
        const endpoints = [
            'risk/risk-boundaries/view-all/',
            'risk/risk-boundaries/list/',
            'risk/risk-boundaries'
        ];
        
        const response = await tryEndpoints(endpoints, 'get');
        console.log('Response status:', response.status);
        console.log('Fetched risk boundaries raw response:', response.data);
        
        // Handle different response formats
        let data;
        if (response.data.data) {
            data = response.data.data;
        } else if (Array.isArray(response.data)) {
            data = response.data;
        } else if (response.data.results) {
            data = response.data.results;
        } else {
            data = [];
        }
        
        console.log('Processed risk boundaries data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching risk boundaries:', error);
        console.error('Error details:', error.response?.data || error.message);
        throw error;
    }
}

async function fetchRiskBoundary(context) {
    const [, , id] = context.queryKey;
    if (!id) {
        console.error('No boundary ID provided for fetchRiskBoundary');
        throw new Error('No boundary ID provided');
    }
    
    console.log(`fetchRiskBoundary called with ID: ${id}`);
    
    try {
        // Try multiple possible endpoints
        const endpoints = [
            `risk/risk-boundaries/view/${id}/`,
            `risk/risk-boundaries/view-by-id/${id}/`,
            `risk/risk-boundaries/view-all/?id=${id}`
        ];
        
        console.log(`Attempting to fetch risk boundary with ID ${id} using endpoints:`, endpoints);
        
        const response = await tryEndpoints(endpoints, 'get');
        console.log(`Response status for boundary ${id}:`, response.status);
        console.log(`Fetched risk boundary ${id} raw response:`, response.data);
        
        if (!response.data) {
            console.error(`Empty response data for boundary ID ${id}`);
            throw new Error('Empty response from server');
        }
        
        // Handle different response formats
        let data;
        
        // Deep search for boundary data in the response
        const findBoundaryData = (obj) => {
            // Direct match if object has expected properties
            if (obj && typeof obj === 'object' && 
                (obj.description !== undefined || 
                 obj.lower_bound !== undefined || 
                 obj.lowerBound !== undefined ||
                 obj.higher_bound !== undefined ||
                 obj.higherBound !== undefined)) {
                return obj;
            }
            
            // Search nested objects
            if (obj && typeof obj === 'object') {
                for (const key in obj) {
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        const result = findBoundaryData(obj[key]);
                        if (result) return result;
                    }
                }
            }
            
            return null;
        };
        
        // Try to extract data intelligently
        data = findBoundaryData(response.data);
        
        // If we couldn't find data, fallback to standard extraction methods
        if (!data) {
            console.warn(`Could not find boundary data using deep search for ID ${id}, falling back to standard extraction`);
            
            // Check for all possible data structures
            if (response.data && typeof response.data === 'object') {
                // If data is directly in the root
                if (response.data.description !== undefined) {
                    data = response.data;
                } 
                // If data is in a data property
                else if (response.data.data && typeof response.data.data === 'object') {
                    data = response.data.data;
                } 
                // If data is in a result property
                else if (response.data.result && typeof response.data.result === 'object') {
                    data = response.data.result;
                }
                // Fallback to the whole response
                else {
                    data = response.data;
                }
            } else {
                // Fallback to the whole response
                data = response.data;
            }
        }
        
        // Check if we still don't have usable data
        if (!data || typeof data !== 'object') {
            console.error(`Failed to extract boundary data for ID ${id}`, { responseData: response.data });
            throw new Error('Could not extract boundary data from response');
        }
        
        // Log the raw data we found
        console.log(`Raw boundary data found for ID ${id}:`, data);
        
        // Normalize the data format
        const normalizedData = {
            id: data.id || id,
            description: data.description || '',
            lower_bound: data.lower_bound ?? data.lowerBound ?? data.lower ?? 0,
            higher_bound: data.higher_bound ?? data.higherBound ?? data.higher ?? 0,
            color: data.color ?? data.colour ?? 'black',
            other_applications: data.other_applications ?? data.otherApplications ?? 'partial'
        };
        
        console.log(`Processed and normalized risk boundary ${id} data:`, normalizedData);
        return normalizedData;
    } catch (error) {
        console.error(`Error fetching risk boundary ${id}:`, error);
        console.error('Error details:', error.response?.data || error.message);
        throw error;
    }
}

// query options
export function riskBoundariesOptions(options) {
    return queryOptions({
        queryKey: ['risks', 'boundaries'],
        queryFn: fetchRiskBoundaries,
        ...options
    })
}

export function riskBoundaryOptions(id, options) {
    return queryOptions({
        queryKey: ['risks', 'boundaries', id],
        queryFn: fetchRiskBoundary,
        ...options
    })
}

// mutation functions
async function addRiskBoundary({data}) {
    try {
        // Format data according to the sample payload
        const sanitizedData = {
            description: data.description,
            lower_bound: parseInt(data.lower_bound),
            higher_bound: parseInt(data.higher_bound),
            color: data.color || data.colour, 
            colour: data.colour || data.color, // Add both spellings to improve compatibility
            other_applications: data.other_applications || 'partial'
        };
        
        console.log('Adding risk boundary with data:', sanitizedData);
        
        // Try multiple possible endpoints
        const endpoints = [
            'risk/risk-boundaries/',
            'risk/risk-boundaries/create/',
            'risk/risk-boundaries/add/',
            'risk/risk-boundaries'
        ];
        
        const response = await tryEndpoints(endpoints, 'post', sanitizedData);
        console.log('Add risk boundary response status:', response.status);
        console.log('Add risk boundary raw response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding risk boundary:', error);
        console.error('Error details:', error.response?.data || error.message);
        console.error('Request payload that failed:', JSON.stringify(data));
        
        if (error.message && error.message.includes('Network Error')) {
            console.error('This might be a CORS issue. Check server configuration.');
        }
        
        throw error;
    }
}

// Add debug info to help diagnose issues
function logDebugInfo(stage, data) {
    console.log(`[DEBUG ${stage}]`, data);
    
    if (typeof data === 'object' && data !== null) {
        console.log('  Object keys:', Object.keys(data));
        
        // Check for common properties
        if ('id' in data) console.log('  Has ID:', data.id);
        if ('description' in data) console.log('  Has description:', data.description);
        if ('lower_bound' in data) console.log('  Has lower_bound:', data.lower_bound);
        if ('higher_bound' in data) console.log('  Has higher_bound:', data.higher_bound);
        if ('color' in data) console.log('  Has color:', data.color);
        if ('colour' in data) console.log('  Has colour:', data.colour);
    }
}

async function updateRiskBoundary({id, data}) {
    try {
        // Format data according to the sample payload - include both color and colour
        const sanitizedData = {
            description: data.description,
            lower_bound: parseInt(data.lower_bound),
            higher_bound: parseInt(data.higher_bound),
            color: data.color || data.colour,
            colour: data.colour || data.color, // Include both spellings for maximum compatibility
            other_applications: data.other_applications || 'partial'
        };
        
        logDebugInfo('Before Update', {id, data: sanitizedData});
        
        console.log('Updating risk boundary with data:', sanitizedData);
        
        // Try multiple possible endpoints
        const endpoints = [
            `risk/risk-boundaries/${id}/update/`,
            `risk/risk-boundaries/update/${id}/`,
            `risk/risk-boundaries/${id}/`,
            `risk/risk-boundaries/${id}`
        ];
        
        // This approach with multiple data variations is already well implemented
        // Leave the rest as is
        const dataVariations = [
            // Original format
            sanitizedData,
            
            // With colour instead of color
            {...sanitizedData, colour: sanitizedData.color, color: undefined},
            
            // With camelCase fields
            {
                description: sanitizedData.description,
                lowerBound: sanitizedData.lower_bound,
                higherBound: sanitizedData.higher_bound,
                color: sanitizedData.color,
                colour: sanitizedData.colour,
                otherApplications: sanitizedData.other_applications
            },
            
            // With both color and colour fields
            {
                ...sanitizedData,
                colour: sanitizedData.color
            }
        ];
        
        let response = null;
        let lastError = null;
        
        // Try each endpoint with each data variation
        for (const endpoint of endpoints) {
            for (const dataVariation of dataVariations) {
                try {
                    console.log(`Trying PUT to ${endpoint} with data:`, dataVariation);
                    response = await axios.put(endpoint, JSON.stringify(dataVariation), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });
                    
                    console.log(`Success with PUT ${endpoint}`);
                    break;
                } catch (err) {
                    console.warn(`Failed with PUT ${endpoint}:`, err.message);
                    lastError = err;
                }
            }
            
            if (response) break;
        }
        
        if (!response) {
            throw lastError || new Error('All update attempts failed');
        }
        
        console.log('Update risk boundary response status:', response.status);
        console.log('Update risk boundary raw response:', response.data);
        logDebugInfo('After Update', response.data);
        
        return response.data;
    } catch (error) {
        console.error(`Error updating risk boundary ${id}:`, error);
        console.error('Error details:', error.response?.data || error.message);
        console.error('Request payload that failed:', JSON.stringify(data));
        
        if (error.message && error.message.includes('Network Error')) {
            console.error('This might be a CORS issue. Check server configuration.');
        }
        
        throw error;
    }
}

async function deleteRiskBoundary({id}) {
    try {
        // This endpoint is working, keeping it as is
        const url = `risk/risk-boundaries/${id}/delete/`;
        console.log(`Deleting risk boundary with URL: ${url}`);
        
        const response = await axios.delete(url);
        console.log('Delete risk boundary response status:', response.status);
        console.log('Delete risk boundary raw response:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Error deleting risk boundary ${id}:`, error);
        console.error('Error details:', error.response?.data || error.message);
        throw error;
    }
}

// mutation hooks
export function useAddRiskBoundary(options) {
    return useMutation({
        mutationFn: addRiskBoundary,
        ...options
    })
}

export function useUpdateRiskBoundary(options) {
    return useMutation({
        mutationFn: updateRiskBoundary,
        ...options
    })
}

export function useDeleteRiskBoundary(options) {
    return useMutation({
        mutationFn: deleteRiskBoundary,
        ...options
    })
}