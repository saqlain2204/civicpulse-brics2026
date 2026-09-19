import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
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

// AI API
export const analyzeText = (text, language = 'auto') => api.post('/ai/analyze', { text, language })
export const getRecommendations = () => api.get('/ai/recommendations')
export const chatWithAI = (question) => api.post('/ai/chat', { question })

export default api
