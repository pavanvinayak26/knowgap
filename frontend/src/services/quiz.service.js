import axios from "axios";
import authHeader from "./auth-header";
import API_BASE_URL from "./api-base";

const API_URL = `${API_BASE_URL}/api/`;

const getSubjects = () => {
  return axios.get(API_URL + "subjects", { headers: authHeader() });
};

const getTopicsBySubject = (subjectId) => {
  return axios.get(API_URL + "topics/subject/" + subjectId, { headers: authHeader() });
};

const getQuestionsForTopic = (topicId) => {
  return axios.get(API_URL + "quiz/topic/" + topicId, { headers: authHeader() });
};

const submitAttempt = (topicId, answers) => {
  return axios.post(
    API_URL + "attempts/submit",
    { topicId, answers },
    { headers: authHeader() }
  );
};

const getHeatmap = () => {
  return axios.get(API_URL + "attempts/heatmap", { headers: authHeader() });
};

const getRecommendations = () => {
  return axios.get(API_URL + "attempts/recommendations", { headers: authHeader() });
};

const getInsights = () => {
  return axios.get(API_URL + "attempts/insights", { headers: authHeader() });
};

const getAttemptHistory = (limit = 8) => {
  return axios.get(API_URL + `attempts/history?limit=${limit}`, { headers: authHeader() });
};

const getAttemptReview = (attemptId) => {
  return axios.get(API_URL + `attempts/${attemptId}/review`, { headers: authHeader() });
};

const getWeakPractice = (limit = 8) => {
  return axios.get(API_URL + `attempts/practice/weak?limit=${limit}`, { headers: authHeader() });
};

const getLearnedSubjects = () => {
  return axios.get(API_URL + "attempts/learned/subjects", { headers: authHeader() });
};

const getRecallCheck = (subjectId, limit = 8) => {
  return axios.get(API_URL + `attempts/recall/subject/${subjectId}?limit=${limit}`, { headers: authHeader() });
};

const submitRecallAttempt = (payload) => {
  return axios.post(API_URL + "attempts/recall/submit", payload, { headers: authHeader() });
};

const getRecallHistory = (limit = 6) => {
  return axios.get(API_URL + `attempts/recall/history?limit=${limit}`, { headers: authHeader() });
};

const addSubject = (subject) => {
  return axios.post(API_URL + "subjects", subject, { headers: authHeader() });
};

const addTopic = (topic) => {
  return axios.post(API_URL + "topics", topic, { headers: authHeader() });
};

const addQuestion = (question) => {
  return axios.post(API_URL + "quiz/question", question, { headers: authHeader() });
};

const QuizService = {
  getSubjects,
  getTopicsBySubject,
  getQuestionsForTopic,
  submitAttempt,
  getHeatmap,
  getRecommendations,
  getInsights,
  getAttemptHistory,
  getAttemptReview,
  getWeakPractice,
  getLearnedSubjects,
  getRecallCheck,
  submitRecallAttempt,
  getRecallHistory,
  addSubject,
  addTopic,
  addQuestion
};

export default QuizService;
