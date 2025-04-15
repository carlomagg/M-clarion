import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

// query functions
async function fetchRiskControlFamilyTypes() {
    const response = await axios.get('risk/rcf-types/view-all/');
    return response.data['Control Type'];
}

async function fetchRiskControlFamilyType({queryKey}) {
    const response = await axios.get(`risk/rcf-types/${queryKey[2]}/view/`);
    return response.data['Control Type'][0];
}


// query options
export function riskControlFamilyTypesOptions() {
    return queryOptions({
        queryKey: ['risks', 'control-family-types'],
        queryFn: fetchRiskControlFamilyTypes
    })
}

export function riskControlFamilyTypeOptions(id, options) {
    return queryOptions({
        queryKey: ['risks', 'control-family-types', id],
        queryFn: fetchRiskControlFamilyType,
        ...options
    })
}


// mutation functions
async function addRiskControlFamilyType({data}) {
    const response = await axios.post('risk/rcf-types/', data);
    return response.data;
}

async function updateRiskControlFamilyType({id, data}) {
    const response = await axios.put(`risk/rcf-types/${id}/update/`, data);
    return response.data;
}

async function deleteRiskControlFamilyType({id}) {
    const response = await axios.delete(`risk/rcf-types/${id}/delete/`);
    return response.data;
}


// mutation hooks
export function useAddRiskControlFamilyType(callbacks) {
    return useMutation({
        mutationFn: addRiskControlFamilyType,
        ...callbacks
    });
}

export function useUpdateRiskControlFamilyType(callbacks) {
    return useMutation({
        mutationFn: updateRiskControlFamilyType,
        ...callbacks
    });
}

export function useDeleteRiskControlFamilyType(callbacks) {
    return useMutation({
        mutationFn: deleteRiskControlFamilyType,
        ...callbacks
    });
}