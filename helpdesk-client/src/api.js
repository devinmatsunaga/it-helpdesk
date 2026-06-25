import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5262/api",
});

export const login = (username, password) => api.post("/auth/login", {username, password}).then(r => r.data);

export const getTickets = (unassignedOnly = false) => api.get("/tickets", {params: {unassignedOnly} }).then(r => r.data);
export const getTicket = (id) => api.get(`/tickets/${id}`).then(r => r.data);
export const createTicket = (data) => api.post("/tickets",data).then(r => r.data);
export const UpdateTicket = (id,data) => api.put(`/tickets/${id}`,data).then(r => r.data);

export const getAgents = () => api.get("/users/agents").then(r => r.data);
export const assignTicket = (id, agentId) => api.put(`/tickets/${id}/assign`, { assignedAgentId: agentId }).then(r => r.data);
export const assignToMe = (id) => api.put(`/tickets/${id}/assign-to-me`).then(r => r.data);

export const getCategories = () => api.get("/categories").then(r => r.data);
export const getUsers = () => api.get("/users").then(r => r.data);
export const getAssets = () => api.get("/assets", {params: { pageSize: 100} }).then(r => r.data.items);

export const getComments = (ticketId) => api.get(`/tickets/${ticketId}/comments`).then(r => r.data);
export const addComment = (ticketId, data) => api.post(`/tickets/${ticketId}/comments`, data).then(r => r.data);
export const getMyTickets =() => api.get("/tickets/mine").then(r => r.data)

export const getDashboardSummary = () => api.get("/dashboard/summary").then (r => r.data);

export const getAssetsPaged = (params) => api.get("/assets", {params}).then(r => r.data);
export const getAsset = (id) => api.get(`/assets/${id}`).then(r => r.data);
export const getAssetTypes = () => api.get("/assets/types").then(r => r.data);
export const createAsset = (data) => api.post("/assets", data).then(r => r.data);
export const updateAsset = (id, data) => api.put(`/assets/${id}`, data).then(r => r.data);
export const deactivateAsset = (id) => api.post(`/assets/${id}/deactivate`).then(r => r.data);
export const reactivateAsset = (id) => api.post(`/assets/${id}/reactivate`).then(r => r.data);

export const getArticles = (search = "", categoryId = null) =>
  api.get("/articles", { params: { search, categoryId } }).then(r => r.data);
export const getArticle = (id) => api.get(`/articles/${id}`).then(r => r.data);
export const createArticle = (data) => api.post("/articles", data).then(r => r.data);
export const updateArticle = (id, data) => api.put(`/articles/${id}`, data).then(r => r.data);
export const deleteArticle = (id) => api.delete(`/articles/${id}`).then(r => r.data);
export const getArticleCategories = () => api.get("/articlecategories").then(r => r.data);

export const getArticleComments = (id) => api.get(`/articles/${id}/comments`).then(r => r.data);
export const addArticleComment = (id, body) => api.post(`/articles/${id}/comments`, { body }).then(r => r.data);
export const deleteArticleComment = (id, commentId) => api.delete(`/articles/${id}/comments/${commentId}`).then(r => r.data);

export const getReportSummary = (from, to) => api.get("/reports/summary", {params: {from, to} }).then(r => r.data)

export default api;

