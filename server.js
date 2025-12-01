const express = require('express');
const { exec } = require('child_process');
const cors = require('cors'); // Wichtig für die Kommunikation mit dem Frontend
const app = express();
const PORT = 3000;

// Erlaubt Anfragen von jedem Frontend (für CORS-Debugging)
app.use(cors()); 
app.use(express.json()); 

/**
 * REST-Endpunkt zur Durchführung der DNS-Abfrage.
 * Erwartet: domain, recordType, serverIP.
 */
app.post('/api/dns-lookup', (req, res) => {
    const { domain, recordType, serverIP } = req.body;

    // --- ⚠️ Sicherheitsprüfung: Verhindert Command Injection ⚠️ ---
    // Erlaubt nur alphanumerische Zeichen, Punkte, Doppelpunkte und Bindestriche
    if (!/^[a-zA-Z0-9.\-:]+$/.test(serverIP) || !/^[a-zA-Z0-9.\-]+$/.test(domain) || !/^[A-Z0-9]+$/.test(recordType)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Ungültige Eingabewerte (Server, Domain oder Record-Typ). Sicherheitsverletzung erkannt.' 
        });
    }

    // Erstellt den Kommandozeilenbefehl
    // +short wurde entfernt, um die vollständige und detaillierte Ausgabe (für Ghost-Kompatibilität) zu erhalten.
    const command = `dig @${serverIP} ${domain} ${recordType}`;

    console.log(`Executing: ${command}`);

    // Führt den Befehl im Betriebssystem (im Docker-Container) aus
    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
        if (error || stderr) {
            // Fehler bei der Ausführung oder DNS-Fehler (z.B. Timeout, NXDOMAIN)
            return res.status(200).json({ // Return 200, da die API erreichbar war
                success: false, 
                error: stdout || stderr || error.message || 'DNS-Abfragefehler.' 
            });
        }
        
        // Erfolgreiche Antwort
        res.status(200).json({ 
            success: true, 
            result: stdout.trim() 
        });
    });
});

app.listen(PORT, () => {
    console.log(`DNS Checker Backend läuft auf http://localhost:${PORT}`);
    console.log(`Bereit für Abfragen an /api/dns-lookup`);
});

app.listen(PORT, () => {
    console.log(`DNS Checker Backend läuft auf http://localhost:${PORT}`);
    console.log(`Bereit für Abfragen an /api/dns-lookup`);
});
