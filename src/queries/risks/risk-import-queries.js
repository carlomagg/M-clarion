import { useMutation } from "@tanstack/react-query";
import RiskService from "../../services/Risk.service";

// Import multiple risks - data should be in format with risks array
async function importMultipleRisks({ data }) {
    console.log("Risk query sending data:", data);
    const response = await RiskService.importMultipleRisks({ data });
    // No need to throw errors as they are now handled in the service layer
    // and returned with the standard response format
    return response;
}

// Mutation hook for importing multiple risks
export function useImportRisks(callbacks) {
    return useMutation({
        mutationFn: importMultipleRisks,
        ...callbacks
    });
} 