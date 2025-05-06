import axios from "axios";
import { get } from "lockr";
import { ACCESS_TOKEN_NAME } from "../utils/consts";

class RiskService {
  // Using relative URLs without leading slashes since baseURL is already configured in axios

  importMultipleRisks = async (risksData) => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      console.log("Importing multiple risks:", risksData);
      
      // Ensure the data is in the correct format with risks array
      const payload = risksData.data;
      
      // Validate the payload has the correct structure
      if (!payload.risks || !Array.isArray(payload.risks)) {
        console.error("Invalid payload format. Missing risks array.");
        return {
          status: "failed",
          created_risks: [],
          errors: [
            {
              message: "Invalid payload format. Missing risks array.",
              code: 400
            }
          ]
        };
      }

      console.log("Making API call to risk/risks/multi/ with payload:", JSON.stringify(payload));
      
      // Make the API call with the proper payload
      const result = await axios.post(
        "risk/risks/multi/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", result);
      console.log("API Response data:", result.data);
      console.log("API Response type:", typeof result.data);
      console.log("API Response has status:", result.data?.status !== undefined);
      
      // If the API returns a different structure, transform it to match our expected response format
      const responseData = result.data;
      
      // Always force the status to completed if we have a valid response
      if (result.status >= 200 && result.status < 300) {
        console.log("HTTP status indicates success, forcing status to completed");
        
        // If the API doesn't return a proper status field but the HTTP status is successful
        return {
          status: "completed",
          created_risks: Array.isArray(responseData) 
            ? responseData.map(risk => ({
                risk_id: risk.id || risk.risk_id,
                risk_title: risk.name || risk.title
              }))
            : responseData.created_risks || responseData.risks || [],
          errors: []
        };
      }
      
      // If the API already has a proper status format
      if (responseData.status) {
        console.log("API returned a status field:", responseData.status);
        return responseData;
      }
      
      // Return the response data directly if it's already in the expected format
      return {
        status: "completed", 
        created_risks: responseData || [],
        errors: []
      };
    } catch (error) {
      console.error("Error in importMultipleRisks:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Request payload that failed:", JSON.stringify(risksData.data));
      }
      
      // Return a standardized error response matching the expected structure
      return {
        status: "failed",
        created_risks: [],
        errors: [
          {
            message: error.response?.data?.message || error.message || "Unknown error during import",
            code: error.response?.status || 500
          }
        ]
      };
    }
  };

  // Additional methods for risk management can be added here
}

export default new RiskService(); 