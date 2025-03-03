require('dotenv').config();
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sourceContainerName = process.env.AZURE_STORAGE_CONTAINER_NAME_SOURCE;
const rawContainerName = process.env.AZURE_STORAGE_CONTAINER_NAME_RAW;
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
const blobServiceClient = new BlobServiceClient(`${process.env.AZURE_STORAGE_BLOB_URL}?${sasToken}`);

async function downloadImages() {
    try {
        const sourceContainerClient = blobServiceClient.getContainerClient(sourceContainerName);
        console.log(`📥 Descargando imágenes desde ${sourceContainerName} a ${rawContainerName}...`);

        for await (const blob of sourceContainerClient.listBlobsFlat()) {
            const blobName = blob.name;
            const blockBlobClient = sourceContainerClient.getBlockBlobClient(blobName);
            const downloadResponse = await blockBlobClient.download(0);
            
            const filePath = `./${blobName}`;
            const fileStream = fs.createWriteStream(filePath);
            await new Promise((resolve, reject) => {
                downloadResponse.readableStreamBody.pipe(fileStream)
                    .on('finish', resolve)
                    .on('error', reject);
            });

            console.log(`✅ Imagen descargada: ${blobName}`);
        }
    } catch (error) {
        console.error("❌ Error al descargar imágenes:", error);
    }
}

downloadImages();
