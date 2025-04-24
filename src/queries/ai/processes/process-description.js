import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { get } from "lockr";
import { ACCESS_TOKEN_NAME } from "../../../utils/consts";

async function fetchProcessDescription(data) {
    const token = get(ACCESS_TOKEN_NAME);
    
    try {
        console.log("Calling process-description API with data:", data);
        const response = await axios.post('ai/process-description/', data, {
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : undefined
            },
            timeout: 60000 // 60 seconds timeout - AI might take longer
        });
        console.log("Process description API response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Process description API error:", error);
        if (error.response && error.response.status === 404) {
            console.error("API endpoint not found. Please check the URL and make sure the endpoint is implemented on the server.");
        }
        throw error;
    }
}

export default function useProcessDescription(callbacks) {
    return useMutation({
        mutationFn: fetchProcessDescription,
        ...callbacks
    });
} 