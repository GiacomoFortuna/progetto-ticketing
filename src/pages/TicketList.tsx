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
  const [filterDivision, setFilterDivision] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = 'http://localhost:3001/api/tickets';
      const params: string[] = [];

      if (filterDivision) params.push(`division=${filterDivision}`);
      if (searchTerm) params.push(`search=${searchTerm}`);

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
      const res = await fetch(`http://localhost:3001/api/tickets/${id}/status`, {
        method: 'PATCH', // ← PATCH, non PUT
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
  }, [filterDivision, filterStatus, searchTerm]);

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

    // Define CSV headers
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

    // Map tickets to CSV rows
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

    // Build CSV string
    const csvContent =
      headers.join(',') + '\n' +
      rows.map(row => row.join(',')).join('\n');

    // Create blob and trigger download
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
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('title', newTicket.title);
      formData.append('description', newTicket.description);
      formData.append('division', newTicket.division);
      // Usa client_id invece di client per il backend
      formData.append('client_id', newTicket.client);
      formData.append('project_id', newTicket.project_id);
      if (newTicket.assigned_to) formData.append('assigned_to', newTicket.assigned_to);
      if (attachment) formData.append('attachment', attachment);

      const res = await fetch('http://localhost:3001/api/tickets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Errore nella creazione del ticket');

      // Aggiorna la lista ticket dopo la creazione
      await fetchTickets();
      setShowModal(false);
      setNewTicket({
        title: '',
        description: '',
        division: '',
        client: '',
        project_id: '',
        assigned_to: '',
      });
      setAttachment(null);
      setSelectedClient('');
      setSelectedInfrastructure('');
      setProjects([]);
      setInfrastructures([]);
    } catch (err) {
      console.error(err);
      alert('Errore nella creazione del ticket');
    }
  };

  // Carica i clienti una sola volta
  useEffect(() => {
    fetch('http://localhost:3001/api/tickets/clients')
      .then((res) => res.json())
      .then(setClients)
      .catch((err) => {
        console.error('Errore caricamento clienti:', err);
        alert('Errore nel caricamento clienti');
      });
  }, []);

  // Quando selezioni un cliente, carica le infrastrutture
  useEffect(() => {
    if (!selectedClient) return;
    fetch(`http://localhost:3001/api/tickets/infrastructures?client_id=${selectedClient}`)
      .then((res) => res.json())
      .then(setInfrastructures)
      .catch(() => alert('Errore nel caricamento infrastrutture'));
  }, [selectedClient]);

  // Quando selezioni un’infrastruttura, carica i progetti
  useEffect(() => {
    if (!selectedInfrastructure) return;
    fetch(`http://localhost:3001/api/tickets/projects?infrastructure_id=${selectedInfrastructure}`)
      .then((res) => res.json())
      .then(setProjects)
      .catch(() => alert('Errore nel caricamento progetti'));
  }, [selectedInfrastructure]);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6">Ticket in gestione</h1>

      {/* Filtri */}
      <div className="flex flex-wrap gap-4 mb-4">
        {user?.role === 'manager' && (
          <select
            value={filterDivision}
            onChange={(e) => setFilterDivision(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Tutte le divisioni</option>
            <option value="cloud">Cloud</option>
            <option value="networking">Networking</option>
            <option value="it-care">IT-Care</option>
          </select>
        )}

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">Tutti gli stati</option>
          <option value="open">Aperti</option>
          <option value="in-progress">In lavorazione</option>
          <option value="paused">In pausa</option>
          <option value="closed">Chiusi</option>
        </select>

        <input
          type="text"
          placeholder="Cerca titolo o descrizione..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full md:w-64"
        />

        {/* Pulsanti azione solo per utenti interni */}
        {user && user.role !== 'client_user' && user.role !== 'client_manager' && (
          <div className="flex items-center">
            {/* Pulsante per aprire la modale di creazione ticket */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Nuovo Ticket
            </button>
            {/* Pulsante per esportare i ticket in CSV, visibile solo ai manager */}
            {user?.role === 'manager' && (
              <button
                onClick={downloadCSV}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ml-2"
              >
                Esporta CSV
              </button>
            )}
          </div>
        )}
      </div>

      {/* Elenco ticket */}
      {loading ? (
        <p>Caricamento...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="space-y-4">
          {tickets
            .filter((t) => filterStatus === 'all' || t.status === filterStatus)
            .map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex justify-between">
                  <h2 className="font-bold">{ticket.title}</h2>
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                <p className="text-xs text-gray-400 mt-1">Creato il: {new Date(ticket.created_at).toLocaleString()}</p>
              </div>
            ))}
        </div>
      )}

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
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Crea nuovo ticket</h2>
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
                className="border p-2 rounded w-full"
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
                  className="border p-2 rounded w-full"
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
                  className="border p-2 rounded w-full"
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
                className="w-full border p-2 rounded"
              />

              {/* Descrizione */}
              <textarea
                name="description"
                value={newTicket.description}
                onChange={handleChange}
                placeholder="Descrizione"
                required
                className="w-full border p-2 rounded"
              />

              {/* DIVISIONE */}
              <select
                name="division"
                value={newTicket.division}
                onChange={async (e) => {
                  const division = e.target.value;
                  setNewTicket({ ...newTicket, division, assigned_to: '' });

                  // Carica utenti per divisione
                  if (division) {
                    try {
                      const res = await fetch(`http://localhost:3001/api/users/by-division?division=${division}`);
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
                className="w-full border p-2 rounded"
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
                className="w-full border p-2 rounded"
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
                className="w-full border p-2 rounded"
              />

              {/* SUBMIT */}
              <button
                type="submit"
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
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