export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const api = {
    get: (endpoint) => fetch(`${API_BASE_URL}${endpoint}`),
    // Add other methods as needed
};
