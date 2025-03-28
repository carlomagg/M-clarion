import axios from 'axios';
import { BASE_API_URL } from '../utils/consts';

// Remove trailing slash from BASE_API_URL if it exists
const apiUrl = BASE_API_URL.endsWith('/') ? BASE_API_URL.slice(0, -1) : BASE_API_URL;

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${apiUrl}/clarion_users/login/`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${apiUrl}/clarion_users/verify-otp/`, {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'OTP verification failed');
  }
};
