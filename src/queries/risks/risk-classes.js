import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

// query functions
async function fetchRiskClasses() {
    const response = await axios.get('risk/risk-classes/view-all/');
    return response.data['risk_classes'];
}

async function fetchRiskClass({queryKey}) {
    const response = await axios.get(`risk/risk-classes/${queryKey[2]}/view/`);
    return response.data;
}


// query options
export function riskClassesOptions() {
    return queryOptions({
        queryKey: ['risks', 'classes'],
        queryFn: fetchRiskClasses
    })
}

export function riskClassOptions(id, options) {
    return queryOptions({
        queryKey: ['risks', 'classes', id],
        queryFn: fetchRiskClass,
        ...options
    })
}


// mutation functions
async function addRiskClass({data}) {
    const response = await axios.post('risk/risk-classes/', data);
    return response.data;
}

async function updateRiskClass({id, data}) {
    const response = await axios.put(`risk/risk-classes/${id}/update/`, data);
    return response.data;
}

async function deleteRiskClass({id}) {
    const response = await axios.delete(`risk/risk-classes/${id}/delete/`);
    return response.data;
}


// mutation hooks
export function useAddRiskClass(callbacks) {
    return useMutation({
        mutationFn: addRiskClass,
        ...callbacks
    });
}

export function useUpdateRiskClass(callbacks) {
    return useMutation({
        mutationFn: updateRiskClass,
        ...callbacks
    });
}

export function useDeleteRiskClass(callbacks) {
    return useMutation({
        mutationFn: deleteRiskClass,
        ...callbacks
    });
}