import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

// query functions
async function fetchRiskBoundaries() {
    const response = await axios.get('risk/risk-boundaries/view-all/');
    return response.data['data'];
}

async function fetchRiskBoundary({queryKey}) {
    const response = await axios.get(`risk/risk-boundaries/${queryKey[2]}/view/`);
    return response.data['data'];
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
    const response = await axios.post('risk/risk-boundaries/', data);
    return response.data;
}

async function updateRiskBoundary({id, data}) {
    const response = await axios.put(`risk/risk-boundaries/${id}/update/`, data);
    return response.data;
}

async function deleteRiskBoundary({id}) {
    const response = await axios.delete(`risk/risk-boundaries/${id}/delete/`);
    return response.data;
}


// mutation hooks
export function useAddRiskBoundary(callbacks) {
    return useMutation({
        mutationFn: addRiskBoundary,
        ...callbacks
    });
}

export function useUpdateRiskBoundary(callbacks) {
    return useMutation({
        mutationFn: updateRiskBoundary,
        ...callbacks
    });
}

export function useDeleteRiskBoundary(callbacks) {
    return useMutation({
        mutationFn: deleteRiskBoundary,
        ...callbacks
    });
}