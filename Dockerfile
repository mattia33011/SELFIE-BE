# Usa l'immagine ufficiale di Node.js come base
FROM node:20

# Crea una directory per la tua applicazione
WORKDIR /usr/src/app

# Copia i file package.json e package-lock.json per installare le dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il codice sorgente dell'applicazione
COPY . .

# Esegui lo script di build che crea i file nella cartella /dist
RUN npm run build

# Espone la porta su cui l'applicazione girerà
EXPOSE 3000

# Comando per avviare l'applicazione, assumendo che index.js sia dentro la cartella /dist
CMD ["node", "dist/index.js"]
