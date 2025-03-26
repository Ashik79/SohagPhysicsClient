const getYouTubeVideoId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  
  const VideoPlayer = ({videoUrl}) => {
    
  
    const videoId = getYouTubeVideoId(videoUrl);
  
    return (
      <div className="video-container w-full h-screen flex flex-col">
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
  