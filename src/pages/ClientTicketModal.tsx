import React from 'react'; // Importa React per creare il componente

// Definisce le proprietà accettate dalla modale
interface ClientTicketModalProps {
  isOpen: boolean; // Stato di apertura della modale
  onClose: () => void; // Funzione per chiudere la modale
  ticket: {
    id: number;
    title: string;
    description: string;
    status: string;
    project_name?: string;
    created_at: string;
    attachment?: string;
  };
}

// Funzione per restituire le classi di colore in base allo stato del ticket
const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-green-100 text-green-700';
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'paused':
      return 'bg-orange-100 text-orange-700';
    case 'closed':
      return 'bg-gray-200 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

// Componente principale della modale ticket cliente
const ClientTicketModal: React.FC<ClientTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL; // Ottiene la base URL dalle variabili d'ambiente

  // Se la modale non è aperta, non renderizza nulla
  if (!isOpen) return null;

  // Render della modale
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      {/* Contenitore principale della modale */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-[#429d46]/10">
        {/* Header della modale */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-[#429d46]">
          <h2 className="text-xl font-bold text-white truncate">
            {ticket.title} {/* Mostra il titolo del ticket */}
          </h2>
          <button
            onClick={onClose} // Chiude la modale al click
            className="text-white text-2xl font-bold hover:text-red-300 transition"
            aria-label="Chiudi"
          >
            &times; {/* Icona di chiusura */}
          </button>
        </div>

        {/* Corpo della modale */}
        <div className="p-6 space-y-6">
          {/* Stato del ticket */}
          <div>
            <span className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${getStatusColor(ticket.status)}`}>
              {ticket.status} {/* Mostra lo stato del ticket */}
            </span>
          </div>

          {/* Descrizione del ticket */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-gray-800 whitespace-pre-line">
              {ticket.description} {/* Mostra la descrizione */}
            </div>
          </div>

          {/* Info principali: progetto e data creazione */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progetto</label>
              <div className="text-gray-900">{ticket.project_name || <span className="text-gray-400">—</span>}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Creato il</label>
              <div className="text-gray-900">{new Date(ticket.created_at).toLocaleString()}</div>
            </div>
          </div>

          {/* Allegato del ticket */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allegato</label>
            {ticket.attachment ? (
              <a
                href={`${baseUrl}/api/tickets/files/${ticket.attachment}`} // Link per scaricare l'allegato
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-[#429d46] text-white rounded shadow hover:bg-[#357a36] transition"
              >
                Apri allegato {/* Testo del bottone allegato */}
              </a>
            ) : (
              <span className="text-gray-400">—</span> // Se non c'è allegato mostra trattino
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientTicketModal; // Esporta il componente ClientTicketModal
// Note: This component is used to display detailed information about a client's ticket.
// It includes the ticket title, status, description, project name, creation date, and an optional attachment.