import React from 'react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    id: number;
    title: string;
    description: string;
    status: string;
    division: string;
    client_name?: string;
    infrastructure_name?: string;
    project_name?: string;
    assigned_to?: string;
    created_at: string;
    closed_at?: string;
    working_hours?: number;
    attachment?: string;
  };
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

const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, ticket }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-0 relative flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-green-50 to-green-100">
          <h2 className="text-2xl font-bold text-green-700 flex-1 truncate">{ticket.title}</h2>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-red-500 text-2xl font-bold transition"
            aria-label="Chiudi"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Stato e divisione */}
          <div className="flex flex-wrap gap-4 items-center">
            <span className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
            <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
              {ticket.division}
            </span>
            {ticket.assigned_to && (
              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm">
                Assegnato a: {ticket.assigned_to}
              </span>
            )}
          </div>

          {/* Descrizione */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Descrizione</label>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-gray-800 whitespace-pre-line">
              {ticket.description}
            </div>
          </div>

          {/* Info principali */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700">Cliente</label>
              <div className="text-gray-900">{ticket.client_name || <span className="text-gray-400">—</span>}</div>
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Infrastruttura</label>
              <div className="text-gray-900">{ticket.infrastructure_name || <span className="text-gray-400">—</span>}</div>
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Progetto</label>
              <div className="text-gray-900">{ticket.project_name || <span className="text-gray-400">—</span>}</div>
            </div>
            <div>
              <label className="block font-semibold text-gray-700">Creato il</label>
              <div className="text-gray-900">{new Date(ticket.created_at).toLocaleString()}</div>
            </div>
            {ticket.closed_at && (
              <div>
                <label className="block font-semibold text-gray-700">Chiuso il</label>
                <div className="text-gray-900">{new Date(ticket.closed_at).toLocaleString()}</div>
              </div>
            )}
            {ticket.working_hours !== undefined && (
              <div>
                <label className="block font-semibold text-gray-700">Ore lavorate</label>
                <div className="text-gray-900">{ticket.working_hours}</div>
              </div>
            )}
          </div>

          {/* Allegato */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Allegato</label>
            {ticket.attachment ? (
                <a
                href={`http://localhost:3001/api/tickets/files/${ticket.attachment}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
                >
                Apri allegato
                </a>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
