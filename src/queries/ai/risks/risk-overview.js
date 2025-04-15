import { useMutation } from "@tanstack/react-query";
import axios from "axios";

async function fetchRiskOverview(data) {
    const response = await axios.post('/ai/risk-review/', data);
    return response.data;
}

export default function useRiskOverview(callbacks) {
    return useMutation({
        mutationFn: fetchRiskOverview,
        ...callbacks
    });
}