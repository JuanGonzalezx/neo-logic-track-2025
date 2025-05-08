const fs = require('fs');
const readline = require('readline');

// Rutas
const inputFilePath = 'uploads/archivo.csv';
const outputFilePath = 'uploads/archivo_formateado.csv';

// Streams
const rl = readline.createInterface({
    input: fs.createReadStream(inputFilePath),
    crlfDelay: Infinity,
});
const outputStream = fs.createWriteStream(outputFilePath);

// Escribir encabezado CSV
outputStream.write('departamento,municipio\n');

rl.on('line', (line) => {
    const cleanedLine = line.trim();
    if (!cleanedLine) return;

    const parts = cleanedLine.split(',');

    // Validar que haya suficientes columnas
    if (parts.length < 5) {
        console.warn('Línea ignorada por formato inesperado:', cleanedLine);
        return;
    }

    const departamento = parts[2].trim();
    const municipio = parts[4].trim();

    outputStream.write(`${departamento},${municipio}\n`);
});

rl.on('close', () => {
    outputStream.end();
    console.log('Archivo CSV generado en', outputFilePath);
});
