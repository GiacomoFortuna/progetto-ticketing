const API_URL = import.meta.env.VITE_API_BASE_URL;

function getToken() {
  return localStorage.getItem('token');
}

export async function getTickets() {
  const res = await fetch(`${API_URL}/tickets`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (!res.ok) throw new Error('Errore nel recupero dei ticket');
  return res.json();
}

export async function createTicket(data: any) {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const res = await fetch(`${API_URL}/tickets`, {
    method: 'POST',
    headers: {
      ...(isFormData
        ? { Authorization: `Bearer ${getToken()}` }
        : {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          }),
    },
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Errore nella creazione del ticket');
  return res.json();
}

export async function updateTicketStatus(id: number, status: string, tokenOverride?: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/tickets/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOverride || getToken()}`,
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
  const res = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) throw new Error('Errore nella registrazione utente');
  return res.json();
}
