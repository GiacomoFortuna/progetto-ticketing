import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TicketModal from './TicketModal';

type Ticket = {
  id: number;
  title: string;
  description: string;
  division: string;
  client_name?: string;
  project_name?: string;
  project_id?: string;
  assigned_to?: string;
  status: string;
  created_at: string;
  started_at?: string;
  closed_at?: string;
  working_hours?: number;
  attachment?: string;
};

const TicketList = () => {
  const { user, token } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  // const [filterDivision, setFilterDivision] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<string>('assigned');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // default: più recente prima

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${baseUrl}/api/tickets`;
      const params: string[] = [];

      if (searchTerm) params.push(`search=${searchTerm}`);

      if (viewMode === 'assigned') {
        params.push(`assigned_to=${user?.username}`);
      } else if (viewMode === 'created') {
        params.push(`created_by=${user?.username}`);
      } else if (
        viewMode === 'cloud' ||
        viewMode === 'networking' ||
        viewMode === 'it-care'
      ) {
        params.push(`division=${viewMode}`);
      }

      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Errore nel recupero dei ticket');

      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
      setError('Errore durante il recupero dei ticket');
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/tickets/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Errore durante l\'aggiornamento dello stato');

      await fetchTickets();
      setTickets((prevTickets) => {
        const updatedTicket = prevTickets.find((t) => t.id === id);
        if (updatedTicket) setSelectedTicket(updatedTicket);
        return prevTickets;
      });
    } catch (err) {
      console.error(err);
      alert('Errore nel cambio stato');
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, searchTerm, viewMode]);

  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    division: '',
    client: '',
    project_id: '',
    assigned_to: '',
  });
  const [clients, setClients] = useState<any[]>([]);
  const [infrastructures, setInfrastructures] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedInfrastructure, setSelectedInfrastructure] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);

  function downloadCSV(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();

    if (tickets.length === 0) {
      alert('Nessun ticket da esportare.');
      return;
    }

    const headers = [
      'ID',
      'Titolo',
      'Descrizione',
      'Divisione',
      'Cliente',
      'Progetto',
      'Assegnato a',
      'Stato',
      'Creato il',
      'Iniziato il',
      'Chiuso il',
      'Ore lavorate'
    ];

    const rows = tickets.map(ticket => [
      ticket.id,
      `"${ticket.title.replace(/"/g, '""')}"`,
      `"${ticket.description.replace(/"/g, '""')}"`,
      ticket.division,
      ticket.client_name || '',
      ticket.project_name || '',
      ticket.assigned_to || '',
      ticket.status,
      ticket.created_at,
      ticket.started_at || '',
      ticket.closed_at || '',
      ticket.working_hours != null ? ticket.working_hours : ''
    ]);

    const csvContent =
      headers.join(',') + '\n' +
      rows.map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tickets.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTicket((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Previene il comportamento di default del form

    try {
      const formData = new FormData(); // Crea un oggetto FormData per inviare dati multipart
      formData.append('title', newTicket.title); // Aggiunge il titolo del ticket
      formData.append('description', newTicket.description); // Aggiunge la descrizione
      formData.append('division', newTicket.division); // Aggiunge la divisione
      formData.append('client_id', newTicket.client); // Aggiunge l'id cliente
      formData.append('project_id', newTicket.project_id); // Aggiunge l'id progetto
      if (newTicket.assigned_to) formData.append('assigned_to', newTicket.assigned_to); // Se presente, aggiunge l'assegnatario
      if (attachment) formData.append('attachment', attachment); // Se presente, aggiunge il file allegato

      const res = await fetch(`${baseUrl}/api/tickets`, {
        method: 'POST', // Metodo POST per creare il ticket
        headers: {
          Authorization: `Bearer ${token}`, // Invia il token JWT per autenticazione
        },
        body: formData, // Invia i dati del form
      });

      if (!res.ok) throw new Error('Errore nella creazione del ticket'); // Se la risposta non è ok, lancia errore

      await fetchTickets(); // Aggiorna la lista dei ticket dopo la creazione
      setShowModal(false); // Chiude la modale di creazione ticket
      setNewTicket({
        title: '', // Resetta il titolo
        description: '', // Resetta la descrizione
        division: '', // Resetta la divisione
        client: '', // Resetta il cliente
        project_id: '', // Resetta il progetto
        assigned_to: '', // Resetta l'assegnatario
      });
      setAttachment(null); // Resetta l'allegato
      setSelectedClient(''); // Resetta il cliente selezionato
      setSelectedInfrastructure(''); // Resetta l'infrastruttura selezionata
      setProjects([]); // Resetta la lista progetti
      setInfrastructures([]); // Resetta la lista infrastrutture
    } catch (err) {
      console.error(err); // Logga eventuali errori
      alert('Errore nella creazione del ticket'); // Mostra errore all'utente
    }
  };

  useEffect(() => {
    fetch(`${baseUrl}/api/tickets/clients`)
      .then((res) => res.json())
      .then(setClients)
      .catch((err) => {
        console.error('Errore caricamento clienti:', err);
        alert('Errore nel caricamento clienti');
      });
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    fetch(`${baseUrl}/api/tickets/infrastructures?client_id=${selectedClient}`)
      .then((res) => res.json())
      .then(setInfrastructures)
      .catch(() => alert('Errore nel caricamento infrastrutture'));
  }, [selectedClient]);

  useEffect(() => {
    if (!selectedInfrastructure) return;
    fetch(`${baseUrl}/api/tickets/projects?infrastructure_id=${selectedInfrastructure}`)
      .then((res) => res.json())
      .then(setProjects)
      .catch(() => alert('Errore nel caricamento progetti'));
  }, [selectedInfrastructure]);

  return (
    <div className="max-w-7xl mx-auto mt-10 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-extrabold text-[#429d46] flex items-center gap-2">
          <svg className="inline-block" width="32" height="32" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#429d46" fillOpacity="0.15"/>
            <path d="M8 12l2 2 4-4" stroke="#429d46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ticket in gestione
        </h1>
        <div className="flex flex-wrap gap-2">
          {user && user.role !== 'client_user' && user.role !== 'client_manager' && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#429d46] text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-[#357a36] transition"
            >
              + Nuovo Ticket
            </button>
          )}
          {user?.role === 'manager' && (
            <button
              onClick={downloadCSV}
              className="bg-lime-400 text-[#429d46] px-5 py-2 rounded-lg font-semibold shadow hover:bg-lime-500 transition"
            >
              Esporta CSV
            </button>
          )}
        </div>
      </div>

      {/* Filtri */}
      <div className="flex flex-wrap gap-4 mb-6 items-center bg-white rounded-xl shadow px-4 py-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
        >
          <option value="all">Tutti gli stati</option>
          <option value="open">Aperti</option>
          <option value="in-progress">In lavorazione</option>
          <option value="paused">In pausa</option>
          <option value="closed">Chiusi</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="border p-2 rounded focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
        >
          <option value="desc">Più recente prima</option>
          <option value="asc">Meno recente prima</option>
        </select>

        <input
          type="text"
          placeholder="Cerca titolo o descrizione..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full md:w-64 focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
        />

        {user && (
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="border p-2 rounded focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition ml-auto"
          >
            <option value="assigned">👤 Assegnati a me</option>
            <option value="created">✍️ Creati da me</option>
            {/* Utente base: solo la propria divisione */}
            {user?.role !== 'manager' && (
              <option value={user.division}>Divisione: {user.division}</option>
            )}
            {/* Manager: può selezionare tutte le divisioni */}
            {user?.role === 'manager' && (
              <>
                <option value="cloud">☁️ Cloud</option>
                <option value="networking">🌐 Networking</option>
                <option value="it-care">💻 IT-Care</option>
              </>
            )}
          </select>
        )}
      </div>

      {/* Elenco ticket */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-xl">
            <svg className="animate-spin h-8 w-8 text-[#429d46]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#429d46" strokeWidth="4"></circle>
              <path className="opacity-75" fill="#429d46" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 rounded p-4 mb-4">{error}</div>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tickets
              .filter((t) => {
                if (filterStatus === 'all') {
                  return t.status !== 'closed'; // esclude chiusi se non richiesto
                }
                return t.status === filterStatus;
              })
              .sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
              })
              .map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all border border-transparent hover:border-[#429d46]/30 group"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg text-[#429d46] group-hover:underline">
                      {'#TCK-' + ticket.id} — {ticket.title}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">{ticket.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>Cliente: <span className="font-semibold text-gray-700">{ticket.client_name || '—'}</span></span>
                    <span>Progetto: <span className="font-semibold text-gray-700">{ticket.project_name || '—'}</span></span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Creato il: {new Date(ticket.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modale dettaglio */}
      {selectedTicket && (
        <TicketModal
          isOpen={!!selectedTicket}
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onStatusChange={updateTicketStatus}
        />
      )}

      {/* Modale creazione ticket */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-xl relative">
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-black text-2xl"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#429d46]">Crea nuovo ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* CLIENTE */}
              <select
                required
                value={selectedClient}
                onChange={(e) => {
                  setSelectedClient(e.target.value);
                  setSelectedInfrastructure('');
                  setProjects([]);
                  setNewTicket({
                    ...newTicket,
                    client: e.target.value,
                    project_id: '',
                  });
                }}
                className="border p-2 rounded w-full focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
              >
                <option value="">Seleziona cliente</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* INFRASTRUTTURA */}
              {infrastructures.length > 0 && (
                <select
                  required
                  value={selectedInfrastructure}
                  onChange={(e) => {
                    setSelectedInfrastructure(e.target.value);
                    setNewTicket({
                      ...newTicket,
                      project_id: '',
                    });
                  }}
                  className="border p-2 rounded w-full focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
                >
                  <option value="">Seleziona infrastruttura</option>
                  {infrastructures.map((i: any) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              )}

              {/* PROGETTO */}
              {projects.length > 0 && (
                <select
                  required
                  value={newTicket.project_id}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, project_id: e.target.value })
                  }
                  className="border p-2 rounded w-full focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
                >
                  <option value="">Seleziona progetto</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}

              {/* Titolo */}
              <input
                name="title"
                value={newTicket.title}
                onChange={handleChange}
                placeholder="Titolo"
                required
                className="w-full border p-2 rounded focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
              />

              {/* Descrizione */}
              <textarea
                name="description"
                value={newTicket.description}
                onChange={handleChange}
                placeholder="Descrizione"
                required
                className="w-full border p-2 rounded focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
              />

              {/* DIVISIONE */}
              <select
                name="division"
                value={newTicket.division}
                onChange={async (e) => {
                  const division = e.target.value;
                  setNewTicket({ ...newTicket, division, assigned_to: '' });

                  if (division) {
                    try {
                      const res = await fetch(`${baseUrl}/api/users/by-division?division=${division}`);
                      const data = await res.json();
                      setAvailableUsers(data);
                    } catch (err) {
                      console.error('Errore caricamento utenti:', err);
                      setAvailableUsers([]);
                    }
                  } else {
                    setAvailableUsers([]);
                  }
                }}
                required
                className="w-full border p-2 rounded focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
              >
                <option value="">Seleziona Divisione</option>
                <option value="cloud">Cloud</option>
                <option value="networking">Networking</option>
                <option value="it-care">IT-Care</option>
              </select>

              {/* ASSEGNATO A */}
              <select
                name="assigned_to"
                value={newTicket.assigned_to}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
              >
                <option value="">Assegna a tutta la divisione</option>
                {availableUsers.map((u) => (
                  <option key={u.username} value={u.username}>
                    {u.username}
                  </option>
                ))}
              </select>

              {/* FILE */}
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAttachment(file);
                }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
              />

              {/* SUBMIT */}
              <button
                type="submit"
                className="bg-[#429d46] text-white py-2 px-6 rounded-lg font-semibold shadow hover:bg-[#357a36] transition w-full"
              >
                Crea Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Funzione per colorare gli stati
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

export default TicketList;
// Note: This component is used to display a list of tickets with filtering options.
// It includes functionality to view ticket details in a modal and change ticket status.