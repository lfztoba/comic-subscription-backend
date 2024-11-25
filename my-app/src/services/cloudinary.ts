import { Cloudinary } from '@cloudinary/url-gen';

// Initialize Cloudinary
export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
  },
  url: {
    secure: true
  }
});

// Function to get optimized URL for an image
export const getOptimizedUrl = (publicId: string) => {
  return cloudinary
    .image(publicId)
    .quality('auto')
    .format('auto')
    .toURL();
};

// Function to upload an image to Cloudinary
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || '');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};
