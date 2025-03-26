import React, { useState } from "react";
import { useLocation } from "react-router-dom";

const PDFViewer = () => {
  const location =useLocation()
  const [fileUrl,setFileUrl] =useState(location?.state?.url ||"")
  const extractFileId = (url) => {
    const regex = /(?:\/d\/)(.*?)(?:\/|$)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const fileId = extractFileId(fileUrl);
  if (!fileId) {
    return <p className="text-red-500">Invalid Google Drive link</p>;
  }

  const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;

  return (
    <div className="relative w-full h-screen flex flex-col">
      {/* Google Drive PDF iframe */}
      <iframe
        src={previewUrl}
         className="flex-grow w-full"
        frameBorder="0"
        title="PDF Viewer"
      ></iframe>

      {/* Transparent overlay to hide the "Open in Drive" button */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-white ">
        <img className="w-16 h-16" src="/logo.png"></img>
      </div>
    </div>
  );
};

export default PDFViewer;
