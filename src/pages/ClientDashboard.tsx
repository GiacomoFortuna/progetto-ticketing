// Importa gli hook di React e i componenti necessari
import { useEffect, useState } from 'react';
import { useClientAuth } from '../context/ClientAuthContext';
import ClientTicketModal from './ClientTicketModal';
import NewClientTicketModal from './NewClientTicketModal';

// Definisce il tipo Ticket per tipizzare i dati dei ticket
type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  project_name?: string;
  created_at: string;
  attachment?: string;
};

// Ottiene la base URL dalle variabili d'ambiente Vite
const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Componente principale della dashboard cliente
const ClientDashboard = () => {
  // Recupera l'utente client autenticato dal context
  const { clientUser } = useClientAuth();

  // Stato per la lista dei ticket
  const [tickets, setTickets] = useState<Ticket[]>([]);
  // Stato per il ticket selezionato (per la modale dettaglio)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  // Stato per mostrare/nascondere la modale dettaglio ticket
  const [modalOpen, setModalOpen] = useState(false);
  // Stato per mostrare/nascondere la modale di creazione ticket
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);

  // Effetto per caricare i ticket del cliente al mount o quando cambia clientUser
  useEffect(() => {
    // Se non c'è utente autenticato, non fa nulla
    if (!clientUser) return;

    // Funzione asincrona per recuperare i ticket dal backend
    const fetchTickets = async () => {
      try {
        // Recupera il token dal localStorage
        const token = localStorage.getItem('client_token');
        if (!token) throw new Error('Token non trovato');

        // Effettua la richiesta GET ai ticket del cliente
        const res = await fetch(
          `${baseUrl}/api/clientAuth/client-tickets/${clientUser.client_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Se la risposta non è ok, lancia errore
        if (!res.ok) throw new Error('Errore nel recupero dei ticket');
        // Parsea la risposta JSON
        const data = await res.json();
        // Aggiorna lo stato con i ticket ricevuti
        setTickets(data);
      } catch (err) {
        // Logga eventuali errori
        console.error('Errore nel recupero dei ticket:', err);
      }
    };

    // Chiama la funzione di fetch
    fetchTickets();
  }, [clientUser]);

  // Render della dashboard
  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      {/* Header con titolo e bottone per nuovo ticket */}
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

      {/* Info utente cliente */}
      <div className="bg-white shadow-md rounded-xl p-4 mb-8 border border-[#429d46]/10">
        <p className="text-gray-600">
          Benvenuto <span className="font-semibold">{clientUser?.name}</span>
        </p>
        <p className="text-gray-600">
          Azienda: <span className="font-semibold">{clientUser?.company_name}</span>
        </p>
      </div>

      {/* Lista dei ticket */}
      <h2 className="text-xl font-semibold text-[#429d46] mb-4">I tuoi ticket</h2>

      {/* Se non ci sono ticket, mostra messaggio */}
      {tickets.length === 0 ? (
        <div className="text-gray-500 italic">Nessun ticket presente.</div>
      ) : (
        // Altrimenti mostra la griglia dei ticket
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

// Funzione per colorare lo stato dei ticket (usata per badge colorati)
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
// Note: Questo componente è la dashboard cliente dove gli utenti possono vedere e gestire i propri ticket.
// Include la funzionalità per creare nuovi ticket e visualizzare i dettagli di quelli esistenti.