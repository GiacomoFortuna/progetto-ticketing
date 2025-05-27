const API_URL = 'http://localhost:3001/api';

// Recupera tutti i ticket dal backend
export async function getTickets() {
  const res = await fetch(`${API_URL}/tickets`);
  if (!res.ok) throw new Error('Errore nel recupero dei ticket');
  return res.json();
}

// Crea un nuovo ticket nel backend
export async function createTicket(data: any) {
  const res = await fetch(`${API_URL}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Errore nella creazione del ticket');
  return res.json();
}
// Aggiorna un ticket esistente nel backend
export async function updateTicketStatus(id: number, status: string): Promise<void> {
  try {
    const response = await fetch(`http://localhost:3001/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
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


