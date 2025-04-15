import { useMutation } from "@tanstack/react-query";
import axios from "axios";

async function fetchContingencyPlanSuggestion(data) {
    const response = await axios.post('/ai/treatment-contigency-plan/', data);
    return response.data;
}

export default function useContingencyPlanSuggestion(callbacks) {
    return useMutation({
        mutationFn: fetchContingencyPlanSuggestion,
        ...callbacks
    });
}