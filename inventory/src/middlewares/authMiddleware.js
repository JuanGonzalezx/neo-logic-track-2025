const checkPermission = (url, methodExpected) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
  
      if (!user || user.status !== "ACTIVE") {
        return res.status(401).json({ message: "Unauthorized user" });
      }
  
      const role = await prisma.role.findUnique({
        where: { id: user.roleId },
      });
  
      if (!role) {
        return res.status(403).json({ message: "Role not found" });
      }
  
      const permissions = await prisma.permission.findMany({
        where: {
          id: { in: role.permissionIds },
        },
      });

      const hasPermission = permissions.some(
        (perm) => perm.url === url && perm.method === methodExpected
      );
      console.log(decoded)
      console.log(hasPermission)
      if (!hasPermission) {
        return res.status(403).json({ message: "No tienes permiso para acceder a esta ruta" });
      }

      req.user = decoded; // Guardar usuario
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token inválido" });
    }
  };
};

module.exports = {checkPermission};