import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

// query functions
async function fetchRiskResponses() {
    const response = await axios.get('risk/risk-responses/view-all/');
    return response.data['Risk Responses'];
}

async function fetchRiskResponse({queryKey}) {
    const response = await axios.get(`risk/risk-responses/${queryKey[2]}/view/`);
    return response.data['Control Type'][0];
}


// query options
export function riskResponsesOptions() {
    return queryOptions({
        queryKey: ['risks', 'responses'],
        queryFn: fetchRiskResponses
    })
}

export function riskResponseOptions(id, options) {
    return queryOptions({
        queryKey: ['risks', 'responses', id],
        queryFn: fetchRiskResponse,
        ...options
    })
}


// mutation functions
async function addRiskResponse({data}) {
    const response = await axios.post('risk/risk-responses/', data);
    return response.data;
}

async function updateRiskResponse({id, data}) {
    const response = await axios.put(`risk/risk-responses/${id}/update/`, data);
    return response.data;
}

async function deleteRiskResponse({id}) {
    const response = await axios.delete(`risk/risk-responses/${id}/delete/`);
    return response.data;
}


// mutation hooks
export function useAddRiskResponse(callbacks) {
    return useMutation({
        mutationFn: addRiskResponse,
        ...callbacks
    });
}

export function useUpdateRiskResponse(callbacks) {
    return useMutation({
        mutationFn: updateRiskResponse,
        ...callbacks
    });
}

export function useDeleteRiskResponse(callbacks) {
    return useMutation({
        mutationFn: deleteRiskResponse,
        ...callbacks
    });
}