import axios from "axios";
import React, { useState, useEffect } from "react";
import { BASE_API_URL } from '../utils/consts';

const useModelComponent = (id) => {
  const [modelComponents, setModelComponents] = useState();

  const getComponents = async () => {
    try {
      const tools = await axios.get(
        `${BASE_API_URL}/strategy/model/${id}/components/`
      );
      // console.log(tools.data.components);
      setModelComponents(tools.data.components);
    } catch (error) {}
  };
  useEffect(() => {
    if (id !== undefined) {
      getComponents();
    }
  }, [id]);
  return {
    modelComponents,
  };
};

export default useModelComponent;
