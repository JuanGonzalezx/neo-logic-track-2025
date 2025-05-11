const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de datos para Colombia...');

  // Crear departamentos
  const departamentos = [
    { id: '1', nombre: 'Amazonas', pais: 'Colombia' },
    { id: '2', nombre: 'Antioquia', pais: 'Colombia' },
    { id: '3', nombre: 'Arauca', pais: 'Colombia' },
    { id: '4', nombre: 'Atlántico', pais: 'Colombia' },
    { id: '5', nombre: 'Bolívar', pais: 'Colombia' },
    { id: '6', nombre: 'Boyacá', pais: 'Colombia' },
    { id: '7', nombre: 'Caldas', pais: 'Colombia' },
    { id: '8', nombre: 'Caquetá', pais: 'Colombia' },
    { id: '9', nombre: 'Casanare', pais: 'Colombia' },
    { id: '10', nombre: 'Cauca', pais: 'Colombia' },
    { id: '11', nombre: 'Cesar', pais: 'Colombia' },
    { id: '12', nombre: 'Chocó', pais: 'Colombia' },
    { id: '13', nombre: 'Córdoba', pais: 'Colombia' },
    { id: '14', nombre: 'Cundinamarca', pais: 'Colombia' },
    { id: '15', nombre: 'Guainía', pais: 'Colombia' },
    { id: '16', nombre: 'Guaviare', pais: 'Colombia' },
    { id: '17', nombre: 'Huila', pais: 'Colombia' },
    { id: '18', nombre: 'La Guajira', pais: 'Colombia' },
    { id: '19', nombre: 'Magdalena', pais: 'Colombia' },
    { id: '20', nombre: 'Meta', pais: 'Colombia' },
    { id: '21', nombre: 'Nariño', pais: 'Colombia' },
    { id: '22', nombre: 'Norte de Santander', pais: 'Colombia' },
    { id: '23', nombre: 'Putumayo', pais: 'Colombia' },
    { id: '24', nombre: 'Quindío', pais: 'Colombia' },
    { id: '25', nombre: 'Risaralda', pais: 'Colombia' },
    { id: '26', nombre: 'San Andrés y Providencia', pais: 'Colombia' },
    { id: '27', nombre: 'Santander', pais: 'Colombia' },
    { id: '28', nombre: 'Sucre', pais: 'Colombia' },
    { id: '29', nombre: 'Tolima', pais: 'Colombia' },
    { id: '30', nombre: 'Valle del Cauca', pais: 'Colombia' },
    { id: '31', nombre: 'Vaupés', pais: 'Colombia' },
    { id: '32', nombre: 'Vichada', pais: 'Colombia' },
    { id: '33', nombre: 'Bogotá D.C.', pais: 'Colombia' },
  ];

  for (const departamento of departamentos) {
    await prisma.departamento.upsert({
      where: { id: departamento.id },
      update: departamento,
      create: departamento,
    });
  }
  console.log(`Se han insertado ${departamentos.length} departamentos.`);

  // Crear ciudades
  const ciudades = [
    // Amazonas
    { nombre: 'Leticia', departamentoId: '1', codigo_postal: '910001' },
    { nombre: 'Puerto Nariño', departamentoId: '1', codigo_postal: '910002' },
    
    // Antioquia
    { nombre: 'Medellín', departamentoId: '2', codigo_postal: '050001' },
    { nombre: 'Bello', departamentoId: '2', codigo_postal: '051050' },
    { nombre: 'Envigado', departamentoId: '2', codigo_postal: '055420' },
    { nombre: 'Itagüí', departamentoId: '2', codigo_postal: '055410' },
    { nombre: 'Rionegro', departamentoId: '2', codigo_postal: '054040' },
    
    // Arauca
    { nombre: 'Arauca', departamentoId: '3', codigo_postal: '810001' },
    { nombre: 'Saravena', departamentoId: '3', codigo_postal: '810500' },
    
    // Atlántico
    { nombre: 'Barranquilla', departamentoId: '4', codigo_postal: '080001' },
    { nombre: 'Soledad', departamentoId: '4', codigo_postal: '083001' },
    { nombre: 'Malambo', departamentoId: '4', codigo_postal: '083020' },
    
    // Bolívar
    { nombre: 'Cartagena', departamentoId: '5', codigo_postal: '130001' },
    { nombre: 'Magangué', departamentoId: '5', codigo_postal: '133001' },
    
    // Boyacá
    { nombre: 'Tunja', departamentoId: '6', codigo_postal: '150001' },
    { nombre: 'Duitama', departamentoId: '6', codigo_postal: '150460' },
    { nombre: 'Sogamoso', departamentoId: '6', codigo_postal: '152210' },
    
    // Caldas
    { nombre: 'Manizales', departamentoId: '7', codigo_postal: '170001' },
    
    // Caquetá
    { nombre: 'Florencia', departamentoId: '8', codigo_postal: '180001' },
    
    // Casanare
    { nombre: 'Yopal', departamentoId: '9', codigo_postal: '850001' },
    
    // Cauca
    { nombre: 'Popayán', departamentoId: '10', codigo_postal: '190001' },
    
    // Cesar
    { nombre: 'Valledupar', departamentoId: '11', codigo_postal: '200001' },
    
    // Chocó
    { nombre: 'Quibdó', departamentoId: '12', codigo_postal: '270001' },
    
    // Córdoba
    { nombre: 'Montería', departamentoId: '13', codigo_postal: '230001' },
    
    // Cundinamarca
    { nombre: 'Zipaquirá', departamentoId: '14', codigo_postal: '250251' },
    { nombre: 'Facatativá', departamentoId: '14', codigo_postal: '253051' },
    { nombre: 'Chía', departamentoId: '14', codigo_postal: '250001' },
    { nombre: 'Mosquera', departamentoId: '14', codigo_postal: '250040' },
    { nombre: 'Soacha', departamentoId: '14', codigo_postal: '250050' },
    
    // Guainía
    { nombre: 'Inírida', departamentoId: '15', codigo_postal: '940001' },
    
    // Guaviare
    { nombre: 'San José del Guaviare', departamentoId: '16', codigo_postal: '950001' },
    
    // Huila
    { nombre: 'Neiva', departamentoId: '17', codigo_postal: '410001' },
    { nombre: 'Pitalito', departamentoId: '17', codigo_postal: '417030' },
    
    // La Guajira
    { nombre: 'Riohacha', departamentoId: '18', codigo_postal: '440001' },
    { nombre: 'Maicao', departamentoId: '18', codigo_postal: '440001' },
    
    // Magdalena
    { nombre: 'Santa Marta', departamentoId: '19', codigo_postal: '470001' },
    { nombre: 'Ciénaga', departamentoId: '19', codigo_postal: '478001' },
    
    // Meta
    { nombre: 'Villavicencio', departamentoId: '20', codigo_postal: '500001' },
    { nombre: 'Acacías', departamentoId: '20', codigo_postal: '507001' },
    
    // Nariño
    { nombre: 'Pasto', departamentoId: '21', codigo_postal: '520001' },
    { nombre: 'Ipiales', departamentoId: '21', codigo_postal: '524001' },
    
    // Norte de Santander
    { nombre: 'Cúcuta', departamentoId: '22', codigo_postal: '540001' },
    { nombre: 'Ocaña', departamentoId: '22', codigo_postal: '546551' },
    
    // Putumayo
    { nombre: 'Mocoa', departamentoId: '23', codigo_postal: '860001' },
    
    // Quindío
    { nombre: 'Armenia', departamentoId: '24', codigo_postal: '630001' },
    { nombre: 'Calarcá', departamentoId: '24', codigo_postal: '632001' },
    
    // Risaralda
    { nombre: 'Pereira', departamentoId: '25', codigo_postal: '660001' },
    { nombre: 'Dosquebradas', departamentoId: '25', codigo_postal: '661001' },
    
    // San Andrés y Providencia
    { nombre: 'San Andrés', departamentoId: '26', codigo_postal: '880001' },
    { nombre: 'Providencia', departamentoId: '26', codigo_postal: '880003' },
    
    // Santander
    { nombre: 'Bucaramanga', departamentoId: '27', codigo_postal: '680001' },
    { nombre: 'Floridablanca', departamentoId: '27', codigo_postal: '681001' },
    { nombre: 'Girón', departamentoId: '27', codigo_postal: '687001' },
    
    // Sucre
    { nombre: 'Sincelejo', departamentoId: '28', codigo_postal: '700001' },
    
    // Tolima
    { nombre: 'Ibagué', departamentoId: '29', codigo_postal: '730001' },
    { nombre: 'Espinal', departamentoId: '29', codigo_postal: '733520' },
    
    // Valle del Cauca
    { nombre: 'Cali', departamentoId: '30', codigo_postal: '760001' },
    { nombre: 'Buenaventura', departamentoId: '30', codigo_postal: '764501' },
    { nombre: 'Palmira', departamentoId: '30', codigo_postal: '763533' },
    { nombre: 'Tuluá', departamentoId: '30', codigo_postal: '763101' },
    
    // Vaupés
    { nombre: 'Mitú', departamentoId: '31', codigo_postal: '970001' },
    
    // Vichada
    { nombre: 'Puerto Carreño', departamentoId: '32', codigo_postal: '990001' },
    
    // Bogotá D.C.
    { nombre: 'Bogotá', departamentoId: '33', codigo_postal: '110111' },
  ];

  for (const ciudad of ciudades) {
    await prisma.ciudad.upsert({
      where: { 
        id: `${ciudad.nombre}-${ciudad.departamentoId}`.replace(/\s+/g, '-').toLowerCase() 
      },
      update: ciudad,
      create: {
        id: `${ciudad.nombre}-${ciudad.departamentoId}`.replace(/\s+/g, '-').toLowerCase(),
        ...ciudad
      },
    });
  }
  console.log(`Se han insertado ${ciudades.length} ciudades.`);

  console.log('¡Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });