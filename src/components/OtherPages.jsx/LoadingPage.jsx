import Lottie from "lottie-react";
import React, { useEffect, useState } from "react";

const LoadingPage = () => {
    const [loadingAnimation,setLoadingAnimation] =useState(null)
        useEffect(()=>{
          fetch('/LottieFiles/loadingAnimation.json')
          .then(res => res.json())
          .then(data => setLoadingAnimation(data))
        },[])
  return (
    <div className="flex flex-col items-center justify-center  text-center text-violet-900 px-4">
      {/* Placeholder for user image */}
      <div className="w-40 h-40 md:w-56 md:h-56 border-2 border-purple-500 rounded-full shadow-lg flex items-center justify-center">
        <Lottie className="bg-transparent" animationData={loadingAnimation}></Lottie>
      </div>
      
      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mt-6 animate-pulse">
        âœ¨ Loading ... ðŸ”®
      </h1>
      <p className="text-lg md:text-xl mt-4 max-w-lg">
        Getting Some Magic for You! ðŸª„âš¡
      </p>
      
      {/* Loading Animation */}
      <div className="mt-6 flex space-x-2">
        <div className="w-4 h-4 bg-white rounded-full animate-bounce"></div>
        <div className="w-4 h-4 bg-white rounded-full animate-bounce delay-150"></div>
        <div className="w-4 h-4 bg-white rounded-full animate-bounce delay-300"></div>
      </div>
    </div>
  );
};

export default LoadingPage;
