import axios from "axios";
import { ACCESS_TOKEN_NAME, BASE_API_URL } from "../utils/consts";
import { get } from "lockr";

class ProcessService {
  addProcessForm = async (contentData) => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.post(
        `${BASE_API_URL}/process/process-definitions/`,

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

  addProcessdraft = async (contentData) => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.post(
        `${BASE_API_URL}/process/process-definitions/draft/`,

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
        `${BASE_API_URL}/process/process-definitions/draft/view-all/`,

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
        `${BASE_API_URL}/process/process-types/view-all/`,

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
        `${BASE_API_URL}/process/process-definitions/view-all`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("processLog", result.data);
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  addProcessAssignment = async (contentData) => {
    const token = get(ACCESS_TOKEN_NAME);
    const data = {
      content: contentData,
    };

    try {
      const result = await axios.post(
        `${BASE_API_URL}/process/process-assignment/`,

        data,
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

  getBusinessUnit = async () => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.get(
        `${BASE_API_URL}/clarion_users/units/view-all/`,

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
        `${BASE_API_URL}/risk/risk-boundaries/view-all/`,

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
        `${BASE_API_URL}/process/process-versions/view-all/`,

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
      const result = await axios.post(
        `${BASE_API_URL}/process/process-assignments/1/process-tasks/`,

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

  getProcessStatus = async () => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.get(
        `${BASE_API_URL}/process/process-status/view-all/`,

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
}

export default new ProcessService();
