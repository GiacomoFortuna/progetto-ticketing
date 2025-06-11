const API_URL = 'http://localhost:3001/api';

// Recupera il token JWT dal localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Recupera tutti i ticket dal backend
export async function getTickets() {
  const res = await fetch(`${API_URL}/tickets`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  if (!res.ok) throw new Error('Errore nel recupero dei ticket');
  return res.json();
}

// Crea un nuovo ticket nel backend
export async function createTicket(data: any) {
  const res = await fetch(`${API_URL}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Errore nella creazione del ticket');
  return res.json();
}

// Aggiorna un ticket esistente nel backend
export async function updateTicketStatus(id: number, status: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/tickets/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Errore aggiornamento stato:', errorData);
      throw new Error(errorData.error || 'Errore aggiornamento stato');
    }
  } catch (err) {
    console.error('Errore durante la richiesta PATCH:', err);
    throw err;
  }
}

export async function registerUser(userData: {
  username: string;
  password: string;
  division: string;
  role: string;
}) {
  const res = await fetch('http://localhost:3001/api/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) throw new Error('Errore nella registrazione utente');
  return res.json();
}


