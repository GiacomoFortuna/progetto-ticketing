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
  const { clientUser, logout } = useClientAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false); // 👈 aggiunto

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/clientAuth/client-tickets/${clientUser?.client_id}`);
        if (!res.ok) throw new Error('Errore nel recupero dei ticket');
        const data = await res.json();
        setTickets(data);
      } catch (err) {
        console.error('Errore nel recupero dei ticket:', err);
      }
    };

    if (clientUser?.client_id) {
      fetchTickets();
    }
  }, [clientUser]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Benvenuto, {clientUser?.name}
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Info azienda */}
      <p className="mb-4 text-gray-600">
        Azienda: <strong>{clientUser?.company_name}</strong>
      </p>

      {/* Bottone nuovo ticket */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setNewTicketModalOpen(true)} // 👈 attiva modale nuovo ticket
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nuovo Ticket
        </button>
      </div>

      {/* Elenco ticket */}
      <h2 className="text-xl font-semibold mb-2">I tuoi ticket</h2>

      {tickets.length === 0 ? (
        <p className="text-gray-500">Nessun ticket presente.</p>
      ) : (
        <div className="bg-white shadow rounded p-4 space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border-b pb-2 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setSelectedTicket(ticket);
                setModalOpen(true);
              }}
            >
              <h3 className="font-semibold">{ticket.title}</h3>
              <p className="text-sm text-gray-600">
                Stato: <strong>{ticket.status}</strong> | Progetto: <strong>{ticket.project_name}</strong> | Data: {new Date(ticket.created_at).toLocaleDateString()}
              </p>
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

export default ClientDashboard;
// This code defines a ClientDashboard component that displays a welcome message, company information, and a list of tickets for the logged-in client user.
// It includes a button to create a new ticket and opens a modal for viewing ticket details.
// The component uses React hooks for state management and side effects, and it fetches tickets from an API endpoint based on the client's ID.
// The modal for viewing ticket details is conditionally rendered based on the selected ticket state.