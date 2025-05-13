// src/utils/errorHandler.js
function handleServiceError(error, res, next) {
    console.error('[Service Error]:', error.message); // Log el error
    // Errores de Prisma comunes
    if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ message: `Conflicto de datos: ${error.meta?.target?.join(', ') || 'un campo único'} ya existe.` });
    }
    if (error.code === 'P2025') { // Record to update/delete does not exist
        return res.status(404).json({ message: 'Recurso no encontrado para la operación.' });
    }

    // Errores personalizados o de lógica de negocio
    // Puedes añadir más `instanceof CustomError` o checks de `error.message`
    if (error.message.includes('no encontrado') || error.message.toLowerCase().includes('not found')) {
        return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('requerido') || error.message.includes('inválido') || error.message.includes('Faltan campos') || error.message.includes('Campos incompletos')) {
        return res.status(400).json({ message: error.message });
    }
    if (error.message.includes('ya existe') || error.message.includes('asociad')) { // "tiene X asociadas"
        return res.status(409).json({ message: error.message });
    }
    if (error.message.includes('Failed to create gerente')) { // Error del servicio de usuarios
        return res.status(502).json({ message: error.message }); // Bad Gateway
    }

    // Error por defecto
    next(error); // Pasa al middleware de error global de Express
}

module.exports = { handleServiceError };