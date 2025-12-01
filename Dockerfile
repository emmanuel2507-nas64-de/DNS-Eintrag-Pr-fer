# Nutzen Sie ein stabiles, schlankes Node.js-Image
FROM node:20-alpine

# Installiere die DNS-Utilities (bind-tools, die 'dig' enthalten)
# Dies ist entscheidend, damit der 'dig'-Befehl im Container funktioniert
RUN apk update && \
    apk add bind-tools && \
    rm -rf /var/cache/apk/*

# Setze das Arbeitsverzeichnis
WORKDIR /app

# Kopiere und installiere die Node.js-Abhängigkeiten
COPY package*.json ./
RUN npm install

# Kopiere den Anwendungscode
COPY server.js .

# Der Container lauscht auf Port 3000
EXPOSE 3000

# Starte die Anwendung
CMD [ "node", "server.js" ]
