import { useMutation } from "@tanstack/react-query";
import ProcessService from "../../services/Process.service";

// Import multiple processes - data should be in format with created_processes array
async function importMultipleProcesses({ data }) {
    console.log("Process query sending data:", data);
    const response = await ProcessService.importMultipleProcesses({ data });
    // No need to throw errors as they are now handled in the service layer
    // and returned with the standard response format
    return response;
}

// Mutation hook for importing multiple processes
export function useImportProcesses(callbacks) {
    return useMutation({
        mutationFn: importMultipleProcesses,
        ...callbacks
    });
} 