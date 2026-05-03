import axios from "axios";

// In development the CRA dev-server proxies /api/* → localhost:8080/api/*
// (see "proxy" in package.json). This means mobile devices only need port 3000
// — the computer's dev-server forwards the API calls on their behalf.
// In production set REACT_APP_API_BASE_URL to the deployed API origin.
const baseURL = process.env.REACT_APP_API_BASE_URL || "https://api.terraclime.com/api";

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { apiClient, baseURL };