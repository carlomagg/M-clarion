import { useMutation } from "@tanstack/react-query";
import axios from "axios";

async function fetchRecommendedControlSuggestion(data) {
    const response = await axios.post('/ai/treatment-recommended-control/', data);
    return response.data;
}

export default function useRecommendedControlSuggestion(callbacks) {
    return useMutation({
        mutationFn: fetchRecommendedControlSuggestion,
        ...callbacks
    });
}