import { useMutation } from "@tanstack/react-query";
import axios from "axios";

async function fetchResourceRequirementSuggestion(data) {
    const response = await axios.post('/ai/treatment-resource/', data);
    return response.data;
}

export default function useResourceRequirementSuggestion(callbacks) {
    return useMutation({
        mutationFn: fetchResourceRequirementSuggestion,
        ...callbacks
    });
}