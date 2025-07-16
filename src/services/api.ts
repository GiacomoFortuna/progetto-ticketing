const API_URL = import.meta.env.VITE_API_BASE_URL; // Ottiene la base URL dalle variabili d'ambiente

function getToken() {
  return localStorage.getItem('token'); // Recupera il token JWT dal localStorage
}

export async function getTickets() {
  // Effettua una richiesta GET per recuperare tutti i ticket
  const res = await fetch(`${API_URL}/tickets`, {
    headers: {
      Authorization: `Bearer ${getToken()}`, // Invia il token JWT nell'header
    },
  });
  if (!res.ok) throw new Error('Errore nel recupero dei ticket'); // Gestisce errori HTTP
  return res.json(); // Restituisce i ticket come JSON
}

export async function createTicket(data: any) {
  // Determina se i dati sono un FormData (per upload file)
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  // Effettua una richiesta POST per creare un nuovo ticket
  const res = await fetch(`${API_URL}/tickets`, {
    method: 'POST', // Metodo POST
    headers: {
      ...(isFormData
        ? { Authorization: `Bearer ${getToken()}` } // Solo Authorization se FormData
        : {
            'Content-Type': 'application/json', // Se JSON, specifica il content-type
            Authorization: `Bearer ${getToken()}`,
          }),
    },
    body: isFormData ? data : JSON.stringify(data), // Invia il body come FormData o JSON
  });

  if (!res.ok) throw new Error('Errore nella creazione del ticket'); // Gestisce errori HTTP
  return res.json(); // Restituisce il ticket creato come JSON
}

export async function updateTicketStatus(
  id: number,
  status: string,
  tokenOverride?: string
): Promise<void> {
  try {
    // Effettua una richiesta PATCH per aggiornare lo stato di un ticket
    const response = await fetch(`${API_URL}/tickets/${id}/status`, {
      method: 'PATCH', // Metodo PATCH
      headers: {
        'Content-Type': 'application/json', // Indica che il body è in JSON
        Authorization: `Bearer ${tokenOverride || getToken()}`, // Usa tokenOverride se fornito, altrimenti quello locale
      },
      body: JSON.stringify({ status }), // Invia il nuovo stato nel body
    });

    if (!response.ok) {
      const errorData = await response.json(); // Parsea la risposta di errore
      console.error('Errore aggiornamento stato:', errorData); // Logga l'errore
      throw new Error(errorData.error || 'Errore aggiornamento stato'); // Lancia errore con messaggio
    }
  } catch (err) {
    console.error('Errore durante la richiesta PATCH:', err); // Logga eventuali errori
    throw err; // Rilancia l'errore
  }
}

export async function registerUser(userData: {
  username: string;
  password: string;
  division: string;
  role: string;
}) {
  // Effettua una richiesta POST per registrare un nuovo utente
  const res = await fetch(`${API_URL}/users/register`, {
    method: 'POST', // Metodo POST
    headers: {
      'Content-Type': 'application/json', // Indica che il body è in JSON
      Authorization: `Bearer ${getToken()}`, // Invia il token JWT nell'header
    },
    body: JSON.stringify(userData), // Invia i dati utente nel body
  });

  if (!res.ok) throw new Error('Errore nella registrazione utente'); // Gestisce errori HTTP
  return res.json(); // Restituisce la risposta come JSON
}
