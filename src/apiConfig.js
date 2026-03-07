const isProd = import.meta.env.PROD;

export const API_URL = isProd
    ? 'https://spoffice-server-nine.vercel.app' // Vercel Production
    : 'http://localhost:5000'; // Local Backend

console.log(`[API Config] Mode: ${isProd ? 'Production' : 'Development'}, URL: ${API_URL}`);

export default API_URL;
