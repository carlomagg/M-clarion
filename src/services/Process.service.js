import axios from "axios";
import { ACCESS_TOKEN_NAME } from "../utils/consts";
import { get } from "lockr";

class ProcessService {
  // Using relative URLs without leading slashes since baseURL is already configured in axios

  addProcessForm = async (contentData) => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      // Log the exact request being made
      console.log("Sending to process-definitions endpoint:", contentData);
      
      // Direct request without any additional processing
      const result = await axios.post(
        "process/process-definitions/",
        contentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error("Error in addProcessForm:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Request payload that failed:", JSON.stringify(contentData));
      }
      throw error;
    }
  };

  addProcessdraft = async (contentData) => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.post(
        "process/process-definitions/draft/",
        contentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getProcessDraft = async () => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.get(
        "process/process-definitions/draft/view-all/",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getProcessType = async () => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.get(
        "process/process-types/view-all/",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getProcessLog = async () => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.get(
        "process/process-definitions/view-all/",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return result.data;
    } catch (error) {
      console.error("Error fetching process log:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
      }
      // Return empty data structure to prevent UI errors
      return {
        Processes: []
      };
    }
  };

  addProcessAssignment = async (contentData) => {
    const token = get(ACCESS_TOKEN_NAME);
    const { process_id, ...payload } = contentData;
    try {
      const result = await axios.post(
        `process/process-definitions/${process_id}/process-assignments/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error("Error in process assignment:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  };

  updateProcessAssignment = async (assignmentId, contentData) => {
    const token = get(ACCESS_TOKEN_NAME);
    try {
      const result = await axios.put(
        `process/process-assignments/${assignmentId}/update/`,
        contentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error("Error updating process assignment:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  };

  getProcessAssignments = async (processId) => {
    const token = get(ACCESS_TOKEN_NAME);
    try {
      const result = await axios.get(
        `process/process-definitions/${processId}/process-assignments/view-all/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error("Error fetching process assignments:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  };

  getProcessAssignment = async (assignmentId) => {
    const token = get(ACCESS_TOKEN_NAME);
    try {
      const result = await axios.get(
        `process/process-assignments/${assignmentId}/view/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error("Error fetching process assignment:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  };

  getBusinessUnit = async () => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.get(
        "clarion_users/units/view-all/",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getPriorityLevel = async () => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.get(
        "risk/risk-boundaries/view-all/",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getProcessVersion = async () => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.get(
        "process/process-versions/view-all/",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  addProcessTask = async (contentData) => {
    const token = get(ACCESS_TOKEN_NAME);
    try {
      // Transform the form data to match the working format
      const payload = {
        owner: 1,
        name: contentData.name || "MONDAY NAFFffg",
        description: contentData.description || "Note for Flowchart 3favour",
        tat: contentData.tat ? `${contentData.tat} HOURS` : "2 HOURS",
        tags: "car yam egg",
        control_measure: contentData.control_measure || "Get a measure",
        status: 1,
        note: contentData.note || "12sd",
        assignment: 6,
        start_date: contentData.start_date + " 05:59:11.803",
        end_date: contentData.end_date + " 05:59:11.803"
      };

      // Log the exact payload being sent
      console.log('Form data received:', contentData);
      console.log('Adding process task with payload:', JSON.stringify(payload, null, 2));

      const result = await axios.post(
        "process/process-assignments/1/process-tasks/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Process task creation successful:', result.data);
      return result.data;
    } catch (error) {
      console.error("Error in adding process task:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Request payload that failed:", JSON.stringify(contentData, null, 2));
      }
      throw error;
    }
  };

  getProcessStatus = async () => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.get(
        "process/process-status/view-all/",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  deleteProcess = async (processId) => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.delete(
        `process/process-definitions/${processId}/delete`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error("Error deleting process:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      throw error;
    }
  };

  getProcessById = async (processId) => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.get(
        `process/process-definitions/${processId}/view/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return result.data;
    } catch (error) {
      console.error("Error fetching process:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      throw error;
    }
  };

  editProcess = async (processId, contentData) => {
    const token = get(ACCESS_TOKEN_NAME);
    
    // Remove empty string values and only include non-empty fields
    const payload = Object.entries({
      name: contentData.name,
      type: parseInt(contentData.type),
      tags: contentData.tags,
      description: contentData.description,
      note: contentData.note,
      number: contentData.number,
      version: parseInt(contentData.version),
      status: parseInt(contentData.status)
    }).reduce((acc, [key, value]) => {
      // Only include non-empty values and non-zero numbers
      if (value !== "" && value !== null && value !== undefined && value !== 0) {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Log the request details for debugging
    console.log('Request URL:', `process/process-definitions/${processId}/update/`);
    console.log('Request Payload:', JSON.stringify(payload, null, 2));
    console.log('Request Headers:', {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    });

    try {
      const result = await axios.put(
        `process/process-definitions/${processId}/update/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error("Error editing process:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        console.error("Request payload that failed:", JSON.stringify(payload, null, 2));
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    }
  };

  getUsers = async () => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.get(
        "clarion_users/all-users/",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Full error response:", error.response);
      }
      throw error;
    }
  };

  updateProcessTask = async (taskId, contentData) => {
    const token = get(ACCESS_TOKEN_NAME);
    try {
      const result = await axios.put(
        `process/process-tasks/${taskId}/update/`,
        contentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error("Error updating process task:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  };

  getProcessTask = async (taskId) => {
    const token = get(ACCESS_TOKEN_NAME);
    try {
      const result = await axios.get(
        `process/process-tasks/${taskId}/view/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return result.data;
    } catch (error) {
      console.error("Error fetching process task:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  };
}

export default new ProcessService();
