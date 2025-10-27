import React, { useState, useEffect } from 'react';

const SmartImageUpload = ({ onImageUploaded, initialImage = null }) => {
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState(initialImage || '');
    const [previewUrl, setPreviewUrl] = useState(initialImage || '');

    useEffect(() => {
        if (initialImage) {
            setImageUrl(initialImage);
            setPreviewUrl(initialImage);
        }
    }, [initialImage]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);

        setImage(file);

        // Auto-upload
        const formData = new FormData();
        formData.append("image", file);

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
                const uploadedUrl = result.data.url;
                setImageUrl(uploadedUrl);
                
                // Call the parent callback with the uploaded URL
                if (onImageUploaded) {
                    onImageUploaded(uploadedUrl);
                }
            } else {
                alert("Image upload failed.");
                setPreviewUrl(initialImage || '');
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("An error occurred while uploading the image.");
            setPreviewUrl(initialImage || '');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImageUrl('');
        setPreviewUrl('');
        if (onImageUploaded) {
            onImageUploaded('');
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-4">
                {/* Upload Button */}
                <label className="cursor-pointer">
                    <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                    />
                    <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-blue-700 font-medium">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>{uploading ? "Uploading..." : "Choose Image"}</span>
                    </div>
                </label>

                {/* Preview */}
                {previewUrl && (
                    <div className="relative group">
                        <img
                            src={previewUrl}
                            alt="Product preview"
                            className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        {uploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                            </div>
                        )}
                        {!uploading && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove image"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Upload Status */}
            {uploading && (
                <p className="text-sm text-blue-600 flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading image...
                </p>
            )}
            {!uploading && imageUrl && (
                <p className="text-sm text-green-600 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Image uploaded successfully
                </p>
            )}
        </div>
    );
};

export default SmartImageUpload;
