import React, { useState } from 'react';

const ImageUpload = ({ onUpload }) => {
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!image) return alert("Please select an image to upload.");

        const formData = new FormData();
        formData.append("image", image);

        setUploading(true);

        try {
            const response = await fetch(
                `https://api.imgbb.com/1/upload?key=887f7e7ef6edcddafe9df270d7ddc6b1`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const result = await response.json();

            if (result.success) {
                const uploadedUrl = result.data.url; // The uploaded image URL
                setImageUrl(uploadedUrl);
                

                // Call the parent callback with the uploaded URL
                if (onUpload) {
                    onUpload(uploadedUrl);
                }
            } else {
                alert("Image upload failed.");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("An error occurred while uploading the image.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className='flex justify-between items-center gap-2 w-full'>
            <div className='flex flex-col gap-2 w-3/4'>
                <input className='text-blue-700 font-semibold' type="file" onChange={handleImageChange} accept="image/*" />
                <button className='border-2 h-8 text-sm font-semibold  w-full mx-auto my-2 rounded-lg border-sky-700 bg-sky-200' onClick={handleUpload} disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload Image"}
                </button>
            </div>

            {imageUrl && (
                <div className='w-1/4'>
                    
                    <img className='rounded-2xl' src={imageUrl} alt="Uploaded" width="100" />
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
