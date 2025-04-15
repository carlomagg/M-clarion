import { queryOptions, useMutation } from "@tanstack/react-query";
import axios from "axios";

// query functions
async function fetchRiskCategories() {
    const response = await axios.get('risk/risk-categories/view-all/');
    return response.data['risk_categories'];
}

async function fetchRiskCategory({queryKey}) {
    const response = await axios.get(`risk/risk-categories/${queryKey[2]}/view/`);
    return response.data;
}


// query options
export function riskCategoriesOptions(options) {
    return queryOptions({
        queryKey: ['risks', 'categories'],
        queryFn: fetchRiskCategories,
        ...options
    })
}

export function riskCategoryOptions(id, options) {
    return queryOptions({
        queryKey: ['risks', 'categories', id],
        queryFn: fetchRiskCategory,
        ...options
    })
}


// mutation functions
async function addRiskCategory({data}) {
    const response = await axios.post('risk/risk-categories/', data);
    return response.data;
}

async function updateRiskCategory({id, data}) {
    const response = await axios.put(`risk/risk-categories/${id}/update/`, data);
    return response.data;
}

async function deleteRiskCategory({id}) {
    const response = await axios.delete(`risk/risk-categories/${id}/delete/`);
    return response.data;
}


// mutation hooks
export function useAddRiskCategory(callbacks) {
    return useMutation({
        mutationFn: addRiskCategory,
        ...callbacks
    });
}

export function useUpdateRiskCategory(callbacks) {
    return useMutation({
        mutationFn: updateRiskCategory,
        ...callbacks
    });
}

export function useDeleteRiskCategory(callbacks) {
    return useMutation({
        mutationFn: deleteRiskCategory,
        ...callbacks
    });
}