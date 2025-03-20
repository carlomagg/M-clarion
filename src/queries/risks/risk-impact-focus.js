import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

// query functions
async function fetchRiskImpactFocii() {
    const response = await axios.get('risk/impact-focuses/view-all/');
    return response.data['impact focuses'];
}

async function fetchRiskImpactFocus({queryKey}) {
    const response = await axios.get(`risk/impact-focuses/${queryKey[2]}/view/`);
    return response.data['data'];
}


// query options
export function riskImpactFociiOptions() {
    return queryOptions({
        queryKey: ['risks', 'impact-focii'],
        queryFn: fetchRiskImpactFocii
    })
}

export function riskImpactFocusOptions(id, options) {
    return queryOptions({
        queryKey: ['risks', 'impact-focii', id],
        queryFn: fetchRiskImpactFocus,
        ...options
    })
}


// mutation functions
async function addRiskImpactFocus({data}) {
    const response = await axios.post('risk/impact-focuses/', data);
    return response.data;
}

async function updateRiskImpactFocus({id, data}) {
    const response = await axios.put(`risk/impact-focuses/${id}/update/`, data);
    return response.data;
}

async function deleteRiskImpactFocus({id}) {
    const response = await axios.delete(`risk/impact-focuses/${id}/delete/`);
    return response.data;
}


// mutation hooks
export function useAddRiskImpactFocus(callbacks) {
    return useMutation({
        mutationFn: addRiskImpactFocus,
        ...callbacks
    });
}

export function useUpdateRiskImpactFocus(callbacks) {
    return useMutation({
        mutationFn: updateRiskImpactFocus,
        ...callbacks
    });
}

export function useDeleteRiskImpactFocus(callbacks) {
    return useMutation({
        mutationFn: deleteRiskImpactFocus,
        ...callbacks
    });
}