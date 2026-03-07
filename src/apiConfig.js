const isProd = import.meta.env.PROD;
export const API_URL = isProd
    ? 'https://spoffice-server.vercel.app' // You can update this later with your actual Vercel URL
    : `${import.meta.env.VITE_API_URL}`;

export default API_URL;
