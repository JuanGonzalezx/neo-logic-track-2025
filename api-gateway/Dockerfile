FROM node:20-alpine

# Crea directorio de trabajo
WORKDIR /app

# Copia archivos necesarios para instalar dependencias
COPY package*.json ./

RUN npm install

COPY . .

# Expone puerto (si aplica)
EXPOSE 4000

# Comando para iniciar tu app
CMD ["npm", "start"]
