import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

// query functions
async function fetchRiskImpactDefinitions() {
    const response = await axios.get('risk/impact-focus-parameters/view-all/');
    return response.data;
}

async function fetchRiskImpactDefinition({queryKey}) {
    const response = await axios.get(`risk/impact-scores-parameters/view-all/`);
    return response.data['data'];
}


// query options
export function riskImpactDefinitionsOptions() {
    return queryOptions({
        queryKey: ['risks', 'impact-definitions'],
        queryFn: fetchRiskImpactDefinitions
    })
}

export function riskImpactDefinitionOptions(id, options) {
    return queryOptions({
        queryKey: ['risks', 'impact-definitions', id],
        queryFn: fetchRiskImpactDefinition,
        ...options
    })
}


// mutation functions
async function addRiskImpactDefinition({data}) {
    const response = await axios.post('risk/impact-definition/', data);
    return response.data;
}

async function updateRiskImpactDefinition({id, data}) {
    const response = await axios.put(`risk/impact-definition/impact_focus/${id}/update/`, data);
    return response.data;
}

// async function deleteRiskImpactDefinition({id}) {
//     const response = await axios.delete(`risk/impact-focuses/${id}/delete/`);
//     return response.data;
// }


// mutation hooks
export function useAddRiskImpactDefinition(callbacks) {
    return useMutation({
        mutationFn: addRiskImpactDefinition,
        ...callbacks
    });
}

export function useUpdateRiskImpactDefinition(callbacks) {
    return useMutation({
        mutationFn: updateRiskImpactDefinition,
        ...callbacks
    });
}

// export function useDeleteRiskImpactDefinition(callbacks) {
//     return useMutation({
//         mutationFn: deleteRiskImpactDefinition,
//         ...callbacks
//     });
// }