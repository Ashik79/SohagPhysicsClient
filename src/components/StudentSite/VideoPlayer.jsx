import { useState } from "react";
import { useLocation } from "react-router-dom";

const getYouTubeVideoId = (url) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
  
  const VideoPlayer = () => {
    
   const location =useLocation()
    const [fileUrl,setFileUrl] =useState(location?.state?.url ||"")
    const videoId = getYouTubeVideoId(fileUrl);
    if (!videoId) {
      return <p className="text-red-500">Invalid Video link</p>;
    }
  
    return (
      <div className="video-container w-full h-60 md:h-72 lg:h-96 flex flex-col">
        {videoId ? (
          <iframe
           className="flex-grow w-full"
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autohide=1&playsinline=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video Player"
          />
        ) : (
          <p>Invalid YouTube URL</p>
        )}
      </div>
    );
  };
  
  export default VideoPlayer;
  