const https = require('https'); // Importa il modulo https per effettuare richieste HTTP sicure
const querystring = require('querystring'); // Importa il modulo querystring per formattare i dati POST

// Funzione per inviare una notifica Telegram quando viene creato un ticket cloud
const sendTelegramNotification = async (ticket) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN; // Recupera il token del bot Telegram dalle variabili d'ambiente
  const chatId = process.env.TELEGRAM_CLOUD_CHAT_ID; // Recupera l'ID della chat Telegram dalle variabili d'ambiente

  // Determina il testo relativo all'assegnatario del ticket
  const assegnatoA = ticket.assigned_to?.trim()
    ? `👨‍🔧 *Assegnato a:* ${ticket.assigned_to}` // Se assegnato a qualcuno, mostra il nome
    : `👥 *Assegnato a:* tutta la divisione`; // Altrimenti indica che è assegnato a tutta la divisione

  // Determina il testo relativo al cliente
  const clientLabel = ticket.client_name || `ID cliente: ${ticket.client_id || 'n/a'}`; // Usa il nome cliente se disponibile, altrimenti l'ID

  // Costruisce il messaggio da inviare su Telegram
  const message = `🆔 *Ticket:* tck${ticket.id}\n` + // Identificativo del ticket
    `📩 *Nuovo ticket - CLOUD*\n\n` +
    `🏢 *Cliente:* ${clientLabel}\n` +
    `📝 *Titolo:* ${ticket.title}\n` +
    `📄 *Descrizione:* ${ticket.description}\n` +
    `👤 *Creato da:* ${ticket.created_by || 'n/a'}\n` +
    `${assegnatoA}\n` +
    `🕒 *Creato il:* ${new Date().toLocaleString('it-IT')}`; // Data di creazione formattata

  // Prepara i dati POST per la richiesta Telegram
  const postData = querystring.stringify({
    chat_id: chatId, // ID della chat Telegram
    text: message, // Testo del messaggio
    parse_mode: 'Markdown' // Usa Markdown per la formattazione
  });

  // Opzioni per la richiesta HTTPS a Telegram
  const options = {
    hostname: 'api.telegram.org', // Host Telegram
    port: 443, // Porta HTTPS
    path: `/bot${botToken}/sendMessage`, // Endpoint API Telegram per inviare messaggi
    method: 'POST', // Metodo POST
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // Tipo di contenuto
      'Content-Length': Buffer.byteLength(postData) // Lunghezza del body
    }
  };

  // Crea la richiesta HTTPS
  const req = https.request(options, (res) => {
    if (res.statusCode !== 200) {
      // Se la risposta non è 200, logga errore
      console.error(`Telegram error: Status ${res.statusCode}`);
    }
  });

  // Gestisce eventuali errori di rete
  req.on('error', (e) => {
    console.error(`Errore invio Telegram: ${e.message}`);
  });

  req.write(postData); // Scrive i dati POST nella richiesta
  req.end(); // Termina la richiesta
};

module.exports = { sendTelegramNotification }; // Esporta la funzione per l'uso in altri file
// Questo modulo gestisce l'invio di notifiche a Telegram
// quando viene creato un nuovo ticket.