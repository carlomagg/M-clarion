import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

// FACTORIES
async function fetch(type) {
    let response = await axios.get(`clarion_users/${type}/`);
    return response.data;
}
function typeOptions(type) {
    return queryOptions({
        queryKey: [type],
        queryFn: (fnContext) => fetch(type)
    });
}

async function addLocationItem(type, {data}) {
    let response = await axios.post(`clarion_users/add-${type}/`, data);
    return response.data;
}
function useAddLocationItem(type, callbacks) {
    return useMutation({
        mutationFn: (variables) => addLocationItem(type, variables),
        ...callbacks
    })
}

// QUERY OPTIONS
export const countriesOptions = () => typeOptions('countries');
export const statesOptions = () => typeOptions('states');
export const citiesOptions = () => typeOptions('cities');


// MUTATION HOOKS
export const useAddCountry = (callbacks = {}) => useAddLocationItem('country', callbacks);
export const useAddState = (callbacks = {}) => useAddLocationItem('state', callbacks);
export const useAddCity = (callbacks = {}) => useAddLocationItem('city', callbacks);