import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

async function fetchRiskQueue() {
    const response = await axios.get('risk/my-queue');
    return response.data['data'];
}

export default function riskQueueOptions(options = {}) {
    return queryOptions({
        queryKey: ['risks', 'queue'],
        queryFn: fetchRiskQueue,
        ...options
    });
}