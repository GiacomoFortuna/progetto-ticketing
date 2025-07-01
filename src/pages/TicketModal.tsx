import React from 'react';

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

const TicketModal: React.FC<Props> = ({ isOpen, ticket, onClose, onStatusChange }) => {
  if (!isOpen || !ticket) return null;

  const canStart = ticket.status === 'open';
  const canPause = ticket.status === 'in-progress';
  const canClose = ticket.status === 'in-progress' || ticket.status === 'paused';
  const canResume = ticket.status === 'paused';

  const handleStatusChange = (newStatus: string) => {
    if (ticket) {
      onStatusChange(ticket.id, newStatus);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative">
        {/* Bottone di chiusura */}
        <button
          onClick={onClose}
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
              onClick={() => handleStatusChange('closed')}
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