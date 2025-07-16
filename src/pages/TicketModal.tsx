import React, { useEffect, useState } from 'react';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  project_name?: string;
  client_name?: string;
  created_at: string;
  started_at?: string;
  closed_at?: string;
  working_hours?: number;
  attachment?: string;
  assigned_to?: string;
  division?: string;
  notes?: string;
}

interface Props {
  isOpen: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onStatusChange: (id: number, newStatus: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-green-100 text-green-700';
    case 'in-progress':
      return 'bg-blue-100 text-blue-700';
    case 'paused':
      return 'bg-yellow-100 text-yellow-700';
    case 'closed':
      return 'bg-gray-200 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const TicketModal: React.FC<Props> = ({ isOpen, ticket: initialTicket, onClose, onStatusChange }) => {
  const [ticket, setTicket] = useState<Ticket | null>(initialTicket);
  const [divisionUsers, setDivisionUsers] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [noteInput, setNoteInput] = useState(''); // inserisci in alto

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    setTicket(initialTicket);
  }, [initialTicket]);

  useEffect(() => {
    // Recupera user dal localStorage (se non già fornito via props/context)
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (ticket?.division) {
      fetch(`${baseUrl}/api/users/by-division?division=${ticket.division}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => res.json())
        .then(setDivisionUsers)
        .catch(() => setDivisionUsers([]));
    }
  }, [ticket?.division]);

  const canStart = ticket?.status === 'open';
  const canPause = ticket?.status === 'in-progress';
  const canClose = ticket?.status === 'in-progress' || ticket?.status === 'paused';
  const canResume = ticket?.status === 'paused';

  const handleStatusChange = (newStatus: string) => {
    if (ticket) {
      onStatusChange(ticket.id, newStatus);
    }
  };

  // Funzione per assegnare il ticket (solo manager)
  const handleAssign = async (ticketId: number, username: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ assigned_to: username }),
      });

      if (!res.ok) throw new Error('Errore durante l\'assegnazione');

      const updatedTicket = await res.json();
      // Aggiorna localmente lo stato del ticket per visualizzare il nuovo assigned_to
      setTicket((prev) => prev ? { ...prev, assigned_to: updatedTicket.assigned_to } : null);
    } catch (err) {
      console.error(err);
      alert('Errore durante l\'assegnazione');
    }
  };

  // Funzione per aggiungere una nota
  const handleAddNote = async () => {
    if (!ticket || !noteInput.trim()) return; // Se non c'è ticket o la nota è vuota, esce

    try {
      // Effettua la richiesta PATCH per aggiungere una nota al ticket
      const res = await fetch(`${baseUrl}/api/tickets/${ticket.id}/notes`, {
        method: 'PATCH', // Metodo PATCH
        headers: {
          'Content-Type': 'application/json', // Indica che il body è in JSON
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Invia il token JWT
        },
        body: JSON.stringify({ new_note: noteInput }), // Invia la nuova nota nel body
      });

      if (!res.ok) throw new Error('Errore durante l\'aggiunta della nota'); // Se la risposta non è ok, lancia errore

      const updatedTicket = await res.json(); // Parsea la risposta JSON
      setTicket(updatedTicket); // Aggiorna lo stato del ticket con le note nuove
      setNoteInput(''); // Resetta il campo nota
    } catch (err) {
      console.error(err); // Logga eventuali errori
      alert('Errore durante l\'aggiunta della nota'); // Mostra errore all'utente
    }
  };

  // Funzione per chiudere definitivamente il ticket (con conferma)
  const handleCloseTicket = () => {
    const conferma = window.confirm('⚠️ Sei sicuro di voler chiudere definitivamente questo ticket?'); // Mostra conferma
    if (conferma && ticket) {
      handleStatusChange('closed'); // Se confermato, cambia lo stato a "closed"
    }
  };

  // Se la modale non è aperta o non c'è ticket, non renderizza nulla
  if (!isOpen || !ticket) return null;

  // Render della modale
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Bottone di chiusura */}
        <button
          onClick={onClose} // Chiude la modale al click
          className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-red-500"
        >
          &times;
        </button>

        {/* Titolo e stato */}
        <h2 className="text-2xl font-bold mb-4">{ticket.title}</h2>
        <div
          className={`inline-block px-3 py-1 rounded-full font-semibold text-sm mb-4 ${getStatusColor(ticket.status)}`}
        >
          {ticket.status}
        </div>

        {/* Dettagli ticket */}
        <div className="space-y-4">
          <div>
            <label className="font-semibold">Descrizione:</label>
            <p className="bg-gray-100 p-3 rounded whitespace-pre-line">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Cliente:</label>
              <p>{ticket.client_name || '—'}</p>
            </div>
            <div>
              <label className="font-semibold">Progetto:</label>
              <p>{ticket.project_name || '—'}</p>
            </div>
            <div>
              <label className="font-semibold">Assegnato a:</label>
              <p>{ticket.assigned_to || '—'}</p>
            </div>
            <div>
              <label className="font-semibold">Creato il:</label>
              <p>{formatDate(ticket.created_at)}</p>
            </div>
            <div>
              <label className="font-semibold">Iniziato:</label>
              <p>{formatDate(ticket.started_at)}</p>
            </div>
            <div>
              <label className="font-semibold">Chiuso il:</label>
              <p>{formatDate(ticket.closed_at)}</p>
            </div>
            <div>
              <label className="font-semibold">Ore lavorate:</label>
              <p>
                {ticket.working_hours != null && !isNaN(Number(ticket.working_hours))
                  ? `${ticket.working_hours}h`
                  : '—'}
              </p>
            </div>
          </div>

          {/* Allegato */}
          {ticket.attachment && (
            <div>
              <label className="font-semibold">Allegato:</label>
              <a
                href={`http://localhost:3001/api/tickets/files/${ticket.attachment}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline block mt-1"
              >
                Apri allegato
              </a>
            </div>
          )}
        </div>

        {/* Assegna a (manager o assegnatario attuale) */}
        {(user?.role === 'manager' || user?.username === ticket.assigned_to) && (
          <div className="mt-4">
            <label className="block font-semibold mb-1">Assegna a:</label>
            <select
              className="w-full border p-2 rounded"
              onChange={(e) => handleAssign(ticket.id, e.target.value)}
              value={ticket.assigned_to || ''}
            >
              <option value="" disabled>Seleziona utente</option>
              {divisionUsers
                .filter((u: any) => u.username !== ticket.assigned_to)
                .map((u: any) => (
                  <option key={u.username} value={u.username}>
                    {u.username}
                  </option>
              ))}
            </select>
          </div>
        )}

        {/* Note interne (solo aziendale) */}
        {user?.role !== 'client_user' && user?.role !== 'client_manager' && (
          <div className="mt-6">
            <label className="font-semibold block mb-1">Note interne:</label>
            <textarea
              value={ticket.notes || '—'}
              readOnly
              className="w-full p-2 border rounded bg-gray-50 text-sm whitespace-pre-line h-40"
            />

            <div className="mt-3">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Aggiungi una nuova nota..."
                className="w-full p-2 border rounded h-20"
              />
              <button
                onClick={handleAddNote}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Aggiungi nota
              </button>
            </div>
          </div>
        )}

        {/* Azioni sullo stato del ticket */}
        <div className="flex gap-2 mt-6 justify-end">
          {canStart && (
            <button
              onClick={() => handleStatusChange('in-progress')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Inizia
            </button>
          )}
          {canPause && (
            <button
              onClick={() => handleStatusChange('paused')}
              className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500"
            >
              Metti in pausa
            </button>
          )}
          {canClose && (
            <button
              onClick={handleCloseTicket}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Chiudi
            </button>
          )}
          {canResume && (
            <button
              onClick={() => handleStatusChange('in-progress')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Riprendi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
// Note: This component is used to display ticket details in a modal.
// It includes functionality to change the ticket status and view attachments.