const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function normalizarTexto(texto) {
    texto = texto
        .toLowerCase()
        .replace(/\s+/g, " ") // Quita espacios múltiples
        .trim();
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}


exports.uploadCSV = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se ha enviado ningún archivo." });
    }

    const log = {
        creadas: [],
        existentes: [],
        fallidas: [],
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const logPath = path.join(__dirname, `../logs/upload-log-${timestamp}.txt`);
    fs.mkdirSync(path.dirname(logPath), { recursive: true });

    try {
        const fileStream = fs.createReadStream(req.file.path);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });

        let isFirstLine = true;

        for await (const line of rl) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            if (isFirstLine) {
                isFirstLine = false;
                continue; // Saltar encabezado CSV
            }

            const [rawDept, rawCity] = trimmedLine.split(",");
            if (!rawDept || !rawCity) {
                log.fallidas.push(`❌ Línea inválida: "${trimmedLine}"`);
                continue;
            }

            const departamento = normalizarTexto(rawDept);
            const municipio = normalizarTexto(rawCity);

            try {
                // Buscar o crear Departamento
                let dept = await prisma.departamento.findUnique({
                    where: { nombre: departamento },
                });

                if (!dept) {
                    dept = await prisma.departamento.create({
                        data: { nombre: departamento },
                    });
                }

                // Buscar ciudad en ese departamento
                let city = await prisma.ciudad.findFirst({
                    where: {
                        nombre: municipio,
                        departamentoId: dept.id,
                    },
                });

                if (!city) {
                    await prisma.ciudad.create({
                        data: {
                            nombre: municipio,
                            departamentoId: dept.id,
                        },
                    });
                    log.creadas.push(`✅ ${municipio} (Departamento: ${departamento})`);
                } else {
                    log.existentes.push(`⚠️ ${municipio} ya existe en ${departamento}`);
                }
            } catch (err) {
                log.fallidas.push(`❌ Error procesando línea "${trimmedLine}": ${err.message}`);
            }
        }

        // Escribir archivo de log
        const resumen = [
            `=== RESUMEN DE CARGA - ${new Date().toLocaleString()} ===\n`,
            `✅ Ciudades creadas (${log.creadas.length}):`,
            ...log.creadas,
            `\n⚠️ Ciudades ya existentes (${log.existentes.length}):`,
            ...log.existentes,
            `\n❌ Líneas fallidas (${log.fallidas.length}):`,
            ...log.fallidas,
        ].join("\n");

        fs.writeFileSync(logPath, resumen, "utf-8");
        
        
        // Leer el contenido del log generado
        const logContenido = fs.readFileSync(logPath, "utf-8");

        // Eliminar archivo temporal subido
        fs.unlinkSync(req.file.path);

        const todasLasCiudades = await prisma.ciudad.findMany({
            include: { departamento: true }
        });
        
        const ciudadRespuesta = todasLasCiudades.map(ciudad => ({
            id: ciudad.id,
            nombre: normalizarTexto(ciudad.nombre),
            departamento: normalizarTexto(ciudad.departamento.nombre),
        }));
        
        res.json({
            message: "Archivo procesado correctamente.",
            resumen: {
                creadas: log.creadas.length,
                existentes: log.existentes.length,
                fallidas: log.fallidas.length,
                logPath: `logs/upload-log-${timestamp}.txt`,
            },
            ciudades: ciudadRespuesta,
            logContenido
        });
    } catch (error) {
        console.error("Error procesando el archivo CSV:", error);
        res.status(500).json({ error: "Error al procesar el archivo." });
    }

};

exports.getAllCities = async (req, res) => {
    try {
        const ciudades = await prisma.ciudad.findMany({
            include: {
                departamento: true
            },
        });

        // Opcional: formatear la respuesta
        const response = ciudades.map(ciudad => ({
            id: ciudad.id,
            nombre: ciudad.nombre,
            departamento: ciudad.departamento.nombre,
        }));

        res.json(response);
    } catch (error) {
        console.error("Error al obtener las ciudades:", error);
        res.status(500).json({ error: "No se pudo obtener la lista de ciudades." });
    }
};
