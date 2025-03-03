require('dotenv').config();
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sourceContainerName = process.env.AZURE_STORAGE_CONTAINER_NAME_SOURCE;
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
const blobServiceClient = new BlobServiceClient(`${process.env.AZURE_STORAGE_BLOB_URL}?${sasToken}`);

async function downloadLatestBlob() {
    try {
        console.log("📥 Buscando la última imagen en", sourceContainerName);

        const containerClient = blobServiceClient.getContainerClient(sourceContainerName);
        let blobs = containerClient.listBlobsFlat();
        let latestBlob = null;

        for await (const blob of blobs) {
            latestBlob = blob.name;
        }

        if (!latestBlob) {
            console.log("❌ No se encontraron imágenes en el contenedor.");
            return;
        }

        console.log(`📥 Descargando imagen: ${latestBlob}...`);
        const blockBlobClient = containerClient.getBlobClient(latestBlob);
        const downloadResponse = await blockBlobClient.download();

        const filePath = `./${latestBlob}`;
        const fileStream = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
            downloadResponse.readableStreamBody.pipe(fileStream);
            downloadResponse.readableStreamBody.on('end', resolve);
            downloadResponse.readableStreamBody.on('error', reject);
        });

        console.log(`✅ Imagen descargada y guardada como ${filePath}`);
    } catch (error) {
        console.error("❌ Error al descargar la imagen:", error.message);
    }
}

downloadLatestBlob();
