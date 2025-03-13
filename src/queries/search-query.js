import axios from "axios";

// universal search query
async function fetchSearchResults({queryKey}) {
    const response = await axios.get('clarion_users/search/?q=' + queryKey[1]);
    return response.data;
}

export function searchOptions(query, options = {}) {
    return {
        queryKey: ['search', query],
        queryFn: fetchSearchResults,
        ...options
    };
}