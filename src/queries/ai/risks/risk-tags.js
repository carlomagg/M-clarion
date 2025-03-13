import { useMutation } from "@tanstack/react-query";
import axios from "axios";

async function fetchRiskTagsSuggestion(data) {
    const response = await axios.post('/ai/risk-tags/', data);
    return response.data;
}

export default function useRiskTagsSuggestion(callbacks) {
    return useMutation({
        mutationFn: fetchRiskTagsSuggestion,
        ...callbacks
    });
}