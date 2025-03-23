import { useLoaderData } from "react-router-dom";

const LoaderWrapper = ({ children }) => {
    const data = useLoaderData();

    if (!data) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="flex space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
            </div>
        );
    }

    return children(data);
};

export default LoaderWrapper;
