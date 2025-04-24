import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { get } from "lockr";
import { ACCESS_TOKEN_NAME } from "../../../utils/consts";

async function fetchProcessTags(data) {
    const token = get(ACCESS_TOKEN_NAME);
    
    try {
        console.log("Calling process-tags API with data:", data);
        const response = await axios.post('ai/process-tags/', data, {
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : undefined
            },
            timeout: 60000 // 60 seconds timeout - AI might take longer
        });
        console.log("Process tags API response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Process tags API error:", error);
        if (error.response && error.response.status === 404) {
            console.error("API endpoint not found. Please check the URL and make sure the endpoint is implemented on the server.");
        }
        throw error;
    }
}

export default function useProcessTags(callbacks) {
    return useMutation({
        mutationFn: fetchProcessTags,
        ...callbacks
    });
} 