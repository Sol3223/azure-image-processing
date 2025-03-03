require('dotenv').config();
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const optimizedContainerName = process.env.AZURE_STORAGE_CONTAINER_NAME_OPTIMIZED;
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
const blobServiceClient = new BlobServiceClient(`${process.env.AZURE_STORAGE_BLOB_URL}?${sasToken}`);

async function uploadToAzure(imagePath) {
    try {
        const blobName = imagePath.replace('optimized-', ''); // Limpiar nombre
        console.log(`🚀 Subiendo "${blobName}" a ${optimizedContainerName}...`);

        const containerClient = blobServiceClient.getContainerClient(optimizedContainerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const fileBuffer = fs.readFileSync(imagePath);

        await blockBlobClient.upload(fileBuffer, fileBuffer.length);
        console.log(`✅ Imagen "${blobName}" subida correctamente.`);
    } catch (error) {
        console.error("❌ Error al subir la imagen:", error);
    }
}

// Detectar y subir imágenes optimizadas
fs.readdir('.', async (err, files) => {
    if (err) return console.error('❌ Error al leer archivos:', err);
    
    const optimizedImages = files.filter(file => file.startsWith('optimized-'));
    for (const file of optimizedImages) {
        await uploadToAzure(file);
    }
});
