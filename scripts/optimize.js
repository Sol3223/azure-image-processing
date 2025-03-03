const fs = require('fs');
const sharp = require('sharp');

async function optimizeImage(imagePath) {
    const outputFile = `optimized-${imagePath}`;
    try {
        console.log(`🎛 Optimizando ${imagePath}...`);
        await sharp(imagePath)
            .jpeg({ quality: 80 })
            .toFile(outputFile);
        console.log(`✅ Imagen optimizada: ${outputFile}`);
        return outputFile;
    } catch (error) {
        console.error("❌ Error al optimizar la imagen:", error);
        return null;
    }
}

// Procesar imágenes en la carpeta actual
fs.readdir('.', async (err, files) => {
    if (err) return console.error('❌ Error al leer archivos:', err);
    
    const resizedImages = files.filter(file => file.startsWith('resized-'));
    for (const file of resizedImages) {
        await optimizeImage(file);
    }
});
