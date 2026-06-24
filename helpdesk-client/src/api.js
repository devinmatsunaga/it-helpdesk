import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5262/api",
});

export const login = (username, password) => api.post("/auth/login", {username, password}).then(r => r.data);

export const getTickets = () => api.get("/tickets").then(r => r.data);
export const getTicket = (id) => api.get(`/tickets/${id}`).then(r => r.data);
export const createTicket = (data) => api.post("/tickets",data).then(r => r.data);
export const UpdateTicket = (id,data) => api.put(`/tickets/${id}`,data).then(r => r.data);

export const getCategories = () => api.get("/categories").then(r => r.data);
export const getUsers = () => api.get("/users").then(r => r.data);
export const getAssets =() => api.get("/assets").then(r => r.data);

export const getComments = (ticketId) => api.get(`/tickets/${ticketId}/comments`).then(r => r.data);
export const addComment = (ticketId, data) => api.post(`/tickets/${ticketId}/comments`, data).then(r => r.data);

export default api;

