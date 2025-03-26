import React, { useState } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import PDFViewer from './PdfViewer';

const PdfUploader = () => {
  const getYouTubeVideoId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  const videoUrl = getYouTubeVideoId("https://www.youtube.com/watch?v=wMoasIDQxa4")

  return (
    <div className="video-container">
     <VideoPlayer videoUrl={"https://www.youtube.com/watch?v=wMoasIDQxa4"}></VideoPlayer>
     <PDFViewer fileUrl={"https://drive.google.com/file/d/1WALIgQaqAcAH6AsV-ThXbxsfS00nSpUe/view?usp=sharing"}></PDFViewer>
    </div>
  );
};

export default PdfUploader;
