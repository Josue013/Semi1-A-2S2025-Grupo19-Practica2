const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.STORAGE_CONNECTION_STRING
);

const CONTAINER_NAME = 'practica2imagenes';

const uploadToBlob = async (folderName, buffer, originalName) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    
    // Generar nombre único para el archivo
    const fileExtension = originalName.split('.').pop();
    const blobName = `${folderName}/${uuidv4()}.${fileExtension}`;
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Detectar tipo de contenido
    const contentType = getContentType(fileExtension);
    
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading to blob:', error);
    throw new Error('Failed to upload file');
  }
};

const getContentType = (extension) => {
  const contentTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };
  
  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
};

module.exports = {
  uploadToBlob,
  CONTAINER_NAME
};