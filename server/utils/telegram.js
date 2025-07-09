const https = require('https');
const querystring = require('querystring');

const sendTelegramNotification = async (ticket) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CLOUD_CHAT_ID;

  const assegnatoA = ticket.assigned_to?.trim()
    ? `👨‍🔧 *Assegnato a:* ${ticket.assigned_to}`
    : `👥 *Assegnato a:* tutta la divisione`;

  const clientLabel = ticket.client_name || `ID cliente: ${ticket.client_id || 'n/a'}`;

  const message = `📩 *Nuovo ticket - CLOUD*\n\n` +
    `🏢 *Cliente:* ${clientLabel}\n` +
    `📝 *Titolo:* ${ticket.title}\n` +
    `📄 *Descrizione:* ${ticket.description}\n` +
    `👤 *Creato da:* ${ticket.created_by || 'n/a'}\n` +
    `${assegnatoA}\n` +
    `🕒 *Creato il:* ${new Date().toLocaleString('it-IT')}`;

  const postData = querystring.stringify({
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown'
  });

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${botToken}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Telegram error: Status ${res.statusCode}`);
    }
  });

  req.on('error', (e) => {
    console.error(`Errore invio Telegram: ${e.message}`);
  });

  req.write(postData);
  req.end();
};

module.exports = { sendTelegramNotification };
// Questo modulo gestisce l'invio di notifiche a Telegram
// quando viene creato un nuovo ticket.