import { useMutation } from "@tanstack/react-query";
import axios from "axios";

async function fetchActionPlansSuggestion(data) {
    const response = await axios.post('/ai/action-plans/', data);
    return response.data;
}

export default function useActionPlansSuggestion(callbacks) {
    return useMutation({
        mutationFn: fetchActionPlansSuggestion,
        ...callbacks
    });
}