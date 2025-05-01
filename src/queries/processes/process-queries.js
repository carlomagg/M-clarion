import { useMutation } from "@tanstack/react-query";
import ProcessService from "../../services/Process.service";

// Import multiple processes
async function importMultipleProcesses({ data }) {
    return await ProcessService.importMultipleProcesses(data);
}

// Mutation hook for importing multiple processes
export function useImportProcesses(callbacks) {
    return useMutation({
        mutationFn: importMultipleProcesses,
        ...callbacks
    });
} 