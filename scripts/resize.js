const fs = require('fs');
const sharp = require('sharp');

async function resizeImage(imagePath) {
    const outputFile = `resized-${imagePath}`;
    try {
        console.log(`📏 Redimensionando ${imagePath}...`);
        await sharp(imagePath).resize({ width: 800 }).toFile(outputFile);
        console.log(`✅ Imagen redimensionada: ${outputFile}`);
        return outputFile;
    } catch (error) {
        console.error("❌ Error al redimensionar la imagen:", error);
        return null;
    }
}

// Procesar imágenes en la carpeta actual
fs.readdir('.', async (err, files) => {
    if (err) return console.error('❌ Error al leer archivos:', err);
    
    const imageFiles = files.filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg'));
    for (const file of imageFiles) {
        await resizeImage(file);
    }
});
