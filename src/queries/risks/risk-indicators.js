import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

// query functions
async function fetchIndicators() {
    const response = await axios.get('risk/risk-indicator/view-all/');
    return response.data;
}

async function fetchIndicator({queryKey}) {
    const response = await axios.get(`risk/risk-indicator/${queryKey[2]}/view/`);
    return response.data;
}

async function fetchIndicatorTypes() {
    const response = await axios.get('risk/risk-indicator-types/view-all/');
    return response.data['data'];
}

async function fetchDataSources() {
    const response = await axios.get('risk/data-sources/view-all/');
    return response.data['Data Sources'];
}


// query options
export function riskIndicatorsOptions() {
    return queryOptions({
        queryKey: ['risks', 'indicators'],
        queryFn: fetchIndicators
    })
}

export function riskIndicatorOptions(id, options) {
    return queryOptions({
        queryKey: ['risks', 'indicators', id],
        queryFn: fetchIndicator,
        ...options
    })
}

export function riskIndicatorTypesOptions(options) {
    return queryOptions({
        queryKey: ['risks', 'indicators', 'types'],
        queryFn: fetchIndicatorTypes,
        ...options
    })
}

export function dataSourcesOptions(options) {
    return queryOptions({
        queryKey: ['risks', 'data-sources'],
        queryFn: fetchDataSources,
        ...options
    })
}

// mutation functions
async function addRiskIndicator({data}) {
    const response = await axios.post('risk/risk-indicator/', data);
    return response.data;
}

async function updateRiskIndicator({id, data}) {
    const response = await axios.put(`risk/risk-indicator/${id}/update/`, data);
    return response.data;
}

async function deleteRiskIndicator({id}) {
    const response = await axios.delete(`risk/risk-indicator/${id}/delete/`);
    return response.data;
}

// mutation hooks
export function useAddRiskIndicator(callbacks) {
    return useMutation({
        mutationFn: addRiskIndicator,
        ...callbacks
    })
}

export function useUpdateRiskIndicator(callbacks) {
    return useMutation({
        mutationFn: updateRiskIndicator,
        ...callbacks
    })
}

export function useDeleteRiskIndicator(callbacks) {
    return useMutation({
        mutationFn: deleteRiskIndicator,
        ...callbacks
    })
}