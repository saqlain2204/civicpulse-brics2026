import axios from 'axios'

// In production, VITE_API_BASE_URL = https://civicpulse-api.onrender.com
// In local dev, Vite proxies /api → localhost:8000
const BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api'

const api = axios.create({
  baseURL: BASE,
  timeout: 30000,
})

// Feedback API
export const submitFeedback = (data) => api.post('/feedback/submit', data)
export const submitVoiceFeedback = (formData) => api.post('/feedback/voice', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const listFeedback = (params) => api.get('/feedback/list', { params })
export const getProjects = () => api.get('/feedback/projects')

// Analytics API
export const getDashboardStats = () => api.get('/analytics/dashboard')
export const getHotspots = (params) => api.get('/analytics/hotspots', { params })
export const getCategoryBreakdown = (country) => api.get('/analytics/categories', { params: { country } })
export const getCountryComparison = () => api.get('/analytics/countries')
export const getTimeline = () => api.get('/analytics/timeline')
export const getNationalData = (country) => api.get('/analytics/national-data', { params: { country } })
export const getSdgAlignment = () => api.get('/analytics/sdg-alignment')
export const getPriorityMatrix = (country) => api.get('/analytics/priority-matrix', { params: { country } })

// AI API
export const analyzeText = (text, language = 'auto') => api.post('/ai/analyze', { text, language })
export const getRecommendations = (country) => api.get('/ai/recommendations', { params: { country } })
export const chatWithAI = (question) => api.post('/ai/chat', { question })

export default api
