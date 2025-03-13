import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

// query functions
async function fetchRiskAppetites() {
    const response = await axios.get('risk/risk-appetites/view-all/');
    return response.data['data'];
}

async function fetchRiskAppetite({queryKey}) {
    const response = await axios.get(`risk/risk-appetites/${queryKey[2]}/view/`);
    return response.data['data'];
}

async function fetchReportingFrequencies() {
    const response = await axios.get(`risk/reporting-freq/view-all/`);
    return response.data['Data Sources'];
}


// query options
export function riskAppetitesOptions() {
    return queryOptions({
        queryKey: ['risks', 'appetites'],
        queryFn: fetchRiskAppetites
    })
}

export function riskAppetiteOptions(id, options) {
    return queryOptions({
        queryKey: ['risks', 'appetites', id],
        queryFn: fetchRiskAppetite,
        ...options
    })
}

export function reportingFrequenciesOptions(options) {
    return queryOptions({
        queryKey: ['risks', 'reporting-frequencies'],
        queryFn: fetchReportingFrequencies,
        ...options
    })
}


// mutation functions
async function addRiskAppetite({data}) {
    const response = await axios.post('risk/risk-appetites/', data);
    return response.data;
}

async function updateRiskAppetite({id, data}) {
    const response = await axios.put(`risk/risk-appetites/${id}/update/`, data);
    return response.data;
}

async function deleteRiskAppetite({id}) {
    const response = await axios.delete(`risk/risk-appetites/${id}/delete/`);
    return response.data;
}


// mutation hooks
export function useAddRiskAppetite(callbacks) {
    return useMutation({
        mutationFn: addRiskAppetite,
        ...callbacks
    });
}

export function useUpdateRiskAppetite(callbacks) {
    return useMutation({
        mutationFn: updateRiskAppetite,
        ...callbacks
    });
}

export function useDeleteRiskAppetite(callbacks) {
    return useMutation({
        mutationFn: deleteRiskAppetite,
        ...callbacks
    });
}