import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

// query functions
async function fetchRiskLikelihoodMatrix() {
    const response = await axios.get('risk/risk-likelihood-matrix/view-all/');
    return response.data['data'];
}

async function fetchRiskLikelihoodDefinition({queryKey}) {
    const response = await axios.get(`risk/risk-likelihood-matrix/${queryKey[2]}/view/`);
    return response.data['data'];
}

async function fetchRiskMatrixStandards() {
    const response = await axios.get(`risk/matrix-standards/`);
    return response.data;
}


// query options
export function riskLikelihoodMatrixOptions(options) {
    return queryOptions({
        queryKey: ['risks', 'likelihood-matrix'],
        queryFn: fetchRiskLikelihoodMatrix,
        ...options
    })
}

export function riskLikelihoodDefinitionOptions(id, options) {
    return queryOptions({
        queryKey: ['risks', 'likelihood-definitions', id],
        queryFn: fetchRiskLikelihoodDefinition,
        ...options
    })
}

export function riskMatrixSizeOptions(options) {
    return riskLikelihoodMatrixOptions({
        select: (data) => data.length
    });
}

export function riskMatrixStandardsOptions(options) {
    return queryOptions({
        queryKey: ['risks', 'matrix-standards'],
        queryFn: fetchRiskMatrixStandards,
        ...options
    })
}


// mutation functions
async function addRiskLikelihoodDefinition({data}) {
    const response = await axios.post('risk/risk-likelihood-matrix/', data);
    return response.data;
}

async function updateRiskLikelihoodDefinition({id, data}) {
    const response = await axios.put(`risk/risk-likelihood-matrix/${id}/update/`, data);
    return response.data;
}

async function deleteRiskLikelihoodDefinition({id}) {
    const response = await axios.delete(`risk/risk-likelihood-matrix/${id}/delete/`);
    return response.data;
}


// mutation hooks
export function useAddRiskLikelihoodDefinition(callbacks) {
    return useMutation({
        mutationFn: addRiskLikelihoodDefinition,
        ...callbacks
    });
}

export function useUpdateRiskLikelihoodDefinition(callbacks) {
    return useMutation({
        mutationFn: updateRiskLikelihoodDefinition,
        ...callbacks
    });
}

export function useDeleteRiskLikelihoodDefinition(callbacks) {
    return useMutation({
        mutationFn: deleteRiskLikelihoodDefinition,
        ...callbacks
    });
}