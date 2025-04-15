import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

// query functions
async function fetchAllRiskControlEffectiveness() {
    const response = await axios.get('risk/control-effectiveness/view-all/');
    return response.data['data'];
}

async function fetchRiskControlEffectiveness({queryKey}) {
    const response = await axios.get(`risk/control-effectiveness/${queryKey[2]}/view/`);
    return response.data['data'];
}


// query options
export function allRiskControlEffectivenessOptions() {
    return queryOptions({
        queryKey: ['risks', 'control-effectiveness'],
        queryFn: fetchAllRiskControlEffectiveness
    })
}

export function riskControlEffectivenessOptions(id, options) {
    return queryOptions({
        queryKey: ['risks', 'control-effectiveness', id],
        queryFn: fetchRiskControlEffectiveness,
        ...options
    })
}


// mutation functions
async function addRiskControlEffectiveness({data}) {
    const response = await axios.post('risk/control-effectiveness/add/', data);
    return response.data;
}

async function updateRiskControlEffectiveness({id, data}) {
    const response = await axios.put(`risk/control-effectiveness/${id}/update/`, data);
    return response.data;
}

async function deleteRiskControlEffectiveness({id}) {
    const response = await axios.delete(`risk/control-effectiveness/${id}/delete/`);
    return response.data;
}


// mutation hooks
export function useAddRiskControlEffectiveness(callbacks) {
    return useMutation({
        mutationFn: addRiskControlEffectiveness,
        ...callbacks
    });
}

export function useUpdateRiskControlEffectiveness(callbacks) {
    return useMutation({
        mutationFn: updateRiskControlEffectiveness,
        ...callbacks
    });
}

export function useDeleteRiskControlEffectiveness(callbacks) {
    return useMutation({
        mutationFn: deleteRiskControlEffectiveness,
        ...callbacks
    });
}