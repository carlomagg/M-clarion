import { useMutation } from "@tanstack/react-query";
import axios from "axios";

async function fetchRiskDescriptionSuggestion(data) {
    const response = await axios.post('/ai/risk-description/', data);
    return response.data;
}

export default function useRiskDescriptionSuggestion(callbacks) {
    return useMutation({
        mutationFn: fetchRiskDescriptionSuggestion,
        ...callbacks
    });
}