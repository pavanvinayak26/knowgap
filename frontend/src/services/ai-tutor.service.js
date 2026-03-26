import axios from "axios";
import API_BASE_URL from "./api-base";
import authHeader from "./auth-header";

const API_URL = `${API_BASE_URL}/api/ai/`;

const buildPlan = (payload) => {
  return axios.post(API_URL + "plan", payload, { headers: authHeader() });
};

const chat = (payload) => {
  return axios.post(API_URL + "chat", payload, { headers: authHeader() });
};

const AiTutorService = {
  buildPlan,
  chat
};

export default AiTutorService;
