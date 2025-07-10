import { useEffect, useState } from 'react';
import { useClientAuth } from '../context/ClientAuthContext';
import ClientTicketModal from './ClientTicketModal';
import NewClientTicketModal from './NewClientTicketModal';

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  project_name?: string;
  created_at: string;
  attachment?: string;
};

const ClientDashboard = () => {
  const { clientUser } = useClientAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);

  useEffect(() => {
    if (!clientUser) return;

    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('client_token');
        if (!token) throw new Error('Token non trovato');

        const res = await fetch(
          `http://localhost:3001/api/clientAuth/client-tickets/${clientUser.client_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error('Errore nel recupero dei ticket');
        const data = await res.json();
        setTickets(data);
      } catch (err) {
        console.error('Errore nel recupero dei ticket:', err);
      }
    };

    fetchTickets();
  }, [clientUser]);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#429d46]">
          🎫 Area Cliente
        </h1>
        <button
          onClick={() => setNewTicketModalOpen(true)}
          className="bg-[#429d46] text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-[#357a36] transition"
        >
          + Nuovo Ticket
        </button>
      </div>

      {/* Info utente */}
      <div className="bg-white shadow-md rounded-xl p-4 mb-8 border border-[#429d46]/10">
        <p className="text-gray-600">
          Benvenuto <span className="font-semibold">{clientUser?.name}</span>
        </p>
        <p className="text-gray-600">
          Azienda: <span className="font-semibold">{clientUser?.company_name}</span>
        </p>
      </div>

      {/* Lista Ticket */}
      <h2 className="text-xl font-semibold text-[#429d46] mb-4">I tuoi ticket</h2>

      {tickets.length === 0 ? (
        <div className="text-gray-500 italic">Nessun ticket presente.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white border border-[#429d46]/10 rounded-2xl shadow hover:shadow-lg p-5 cursor-pointer transition-all hover:scale-[1.01]"
              onClick={() => {
                setSelectedTicket(ticket);
                setModalOpen(true);
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-[#429d46]">
                  {'#TCK-' + ticket.id} — {ticket.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2 line-clamp-2">{ticket.description}</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Progetto: <span className="font-semibold text-gray-700">{ticket.project_name || '—'}</span></p>
                <p>Data creazione: {new Date(ticket.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale visualizzazione ticket */}
      {selectedTicket && (
        <ClientTicketModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          ticket={selectedTicket}
        />
      )}

      {/* Modale nuovo ticket */}
      {newTicketModalOpen && (
        <NewClientTicketModal
          isOpen={newTicketModalOpen}
          onClose={() => setNewTicketModalOpen(false)}
          clientId={clientUser?.client_id!}
          onTicketCreated={(newTicket) => {
            setTickets((prev) => [newTicket, ...prev]);
            setNewTicketModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Colori status coerenti con quelli aziendali
function getStatusColor(status: string) {
  switch (status) {
    case 'open':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800';
    case 'closed':
      return 'bg-gray-200 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export default ClientDashboard;
// Note: This component is the client dashboard where users can view and manage their tickets.
// It includes functionality to create new tickets and view details of existing ones.