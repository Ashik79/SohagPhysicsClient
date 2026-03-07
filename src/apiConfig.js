const isProd = import.meta.env.PROD;
export const API_URL = isProd
    ? 'https://spoffice-server-nine.vercel.app' // Production Vercel URL
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000'); // Local dev server

export default API_URL;
