import axios from "axios";
import { get } from "lockr";
import { ACCESS_TOKEN_NAME, BASE_API_URL } from "../utils/consts";

class AnalysisService {
  addModelContent = async (strategyId, componentId, contentData) => {
    const token = get(ACCESS_TOKEN_NAME);
    const data = {
      content: contentData,
    };
    try {
      const result = await axios.post(
        `${BASE_API_URL}/strategy/strategy/${strategyId}/componenet/${componentId}/add-contents/`,

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
  getAnalysisView = async (strategyId) => {
    const token = get(ACCESS_TOKEN_NAME);
    try {
      const result = await axios.get(
        `${BASE_API_URL}/strategy/risk/${strategyId}/analysis-items/`,
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

  addAiSuggestion = async (contentData) => {
    const token = get(ACCESS_TOKEN_NAME);

    try {
      const result = await axios.post(
        `${BASE_API_URL}/ai/strategic-analysis/`,

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
}

export default new AnalysisService();
