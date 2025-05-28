// server/hashPassword.js
const bcrypt = require('bcrypt');

const password = 'Okciao10!'; // Cambia qui la password da criptare
const saltRounds = 10;

bcrypt.hash(password, saltRounds)
  .then(hash => {
    console.log(`Hash generato per la password "${password}":`);
    console.log(hash);
  })
  .catch(err => {
    console.error('Errore nella generazione dell\'hash:', err);
  });
// Per eseguire questo script, usa il comando: node server/hashPassword.js