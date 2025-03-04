require('dotenv').config();
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const sourceContainerName = process.env.AZURE_STORAGE_CONTAINER_NAME_SOURCE;
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
const blobUrl = process.env.AZURE_STORAGE_BLOB_URL;

// Verificar que todas las variables estén definidas
if (!accountName || !sourceContainerName || !sasToken || !blobUrl) {
    console.error("❌ ERROR: Faltan variables de entorno. Verifica tu configuración.");
    console.error(`🔍 AZURE_STORAGE_ACCOUNT_NAME: ${accountName}`);
    console.error(`🔍 AZURE_STORAGE_CONTAINER_NAME_SOURCE: ${sourceContainerName}`);
    console.error(`🔍 AZURE_STORAGE_SAS_TOKEN: ${sasToken ? "OK" : "MISSING"}`);
    console.error(`🔍 AZURE_STORAGE_BLOB_URL: ${blobUrl}`);
    process.exit(1);
}

// Crear instancia de BlobServiceClient sin incluir el SAS token en la URL
const blobServiceClient = new BlobServiceClient(`${blobUrl}`, new Azure.StorageSharedKeyCredential(accountName, sasToken));

async function downloadLatestBlob() {
    try {
        console.log(`📥 Buscando la última imagen en el contenedor: ${sourceContainerName}`);

        const containerClient = blobServiceClient.getContainerClient(sourceContainerName);
        let latestBlob = null;
        let latestTime = 0;

        // Obtener el blob más reciente
        for await (const blob of containerClient.listBlobsFlat()) {
            if (blob.properties.createdOn && blob.properties.createdOn.getTime() > latestTime) {
                latestTime = blob.properties.createdOn.getTime();
                latestBlob = blob.name;
            }
        }

        if (!latestBlob) {
            console.log("❌ No se encontraron imágenes en el contenedor.");
            return;
        }

        console.log(`📥 Descargando imagen más reciente: ${latestBlob}...`);
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
