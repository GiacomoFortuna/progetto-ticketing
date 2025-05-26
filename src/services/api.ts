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
export async function updateTicketStatus(id: number, status: string) {
  const res = await fetch(`http://localhost:3001/api/tickets/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error('Errore aggiornamento stato');
  return res.json();
}


