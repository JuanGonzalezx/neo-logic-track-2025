const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Habilita logging
});

async function testConnection() {
    try {
        await prisma.$connect();
        console.log('✅ Conexión exitosa a PostgreSQL con Prisma');

        // Verifica tablas
        const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
        console.log('📊 Tablas existentes:', result);

        return true;
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

module.exports = { prisma, testConnection };