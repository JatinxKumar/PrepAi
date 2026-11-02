// Centralized API configuration for PrepAI
// This file provides a single source of truth for API base URLs

// Production API base URL - points to Render backend with /api prefix
const PRODUCTION_API_URL = "https://prepai-backend-fbmb.onrender.com/api";

// Development API base URL - uses Vite proxy to local backend
const DEVELOPMENT_API_URL = "/api";

// Determine which API URL to use based on environment
const API_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? PRODUCTION_API_URL : DEVELOPMENT_API_URL);

export { API_URL, PRODUCTION_API_URL, DEVELOPMENT_API_URL };