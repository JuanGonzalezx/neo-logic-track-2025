const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar tokens JWT
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Acceso denegado: Token no proporcionado.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUserPayload) => {
        if (err) {
            console.error("Error de verificación de JWT:", err.message);
            return res.status(403).json({ message: 'Acceso denegado: Token inválido o expirado.' });
        }
        req.user = decodedUserPayload;
        next(); 
    });
};

module.exports = authenticateToken;
