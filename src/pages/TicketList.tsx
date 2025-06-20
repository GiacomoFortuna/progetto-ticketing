// Import dei moduli React e delle funzioni di servizio
import { useEffect, useState } from 'react';
import { createTicket, updateTicketStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TicketModal from './TicketModal';

// Definizione del tipo Ticket per tipizzare i dati dei ticket
type Ticket = {
  id: number;
  title: string;
  description: string;
  division: string;
  client: string;
  client_name?: string;
  infrastructure_name?: string;
  project_name?: string;
  project_id?: string;
  assigned_to?: string;
  status: string;
  created_at: string;
  created_by: string;
  working_hours?: number;
  attachment?: string;
};

function TicketList() {
  const { user, token } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDivision, setFilterDivision] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [infrastructures, setInfrastructures] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedInfrastructure, setSelectedInfrastructure] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    client: '',
    project_id: '',
    division: '',
    assigned_to: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Gestisce il cambiamento dei campi del form di creazione ticket
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setNewTicket({ ...newTicket, [e.target.name]: e.target.value });
  };

  // Recupera i ticket dal backend, applicando eventuali filtri
  const fetchTickets = async (search: string = '') => {
    let url = 'http://localhost:3001/api/tickets';
    const params: string[] = [];
    if (filterDivision) params.push(`division=${encodeURIComponent(filterDivision)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError('Errore nel recupero dei ticket');
        setTickets([]);
        setLoading(false);
        return [];
      }

      const data = await res.json();
      setTickets(data);
      setLoading(false);
      return data;
    } catch (err) {
      setError('Errore di rete');
      setTickets([]);
      setLoading(false);
      return [];
    }
  };

  // Modifica handleSubmit per usare FormData e supportare l'allegato
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', newTicket.title);
    formData.append('description', newTicket.description);
    formData.append('division', newTicket.division);
    // Usa client_id invece di client, passa stringa vuota come null
    formData.append('client_id', newTicket.client || '');
    formData.append('project_id', newTicket.project_id || '');
    if (newTicket.assigned_to) {
      formData.append('assigned_to', newTicket.assigned_to);
    }
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      const res = await fetch('http://localhost:3001/api/tickets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Errore nella creazione del ticket');
      }

      await res.json();
      setAttachment(null);
      setNewTicket({
        title: '',
        description: '',
        client: '',
        project_id: '',
        division: '',
        assigned_to: '',
      });
      setShowModal(false);
      await fetchTickets(searchTerm);
    } catch (err) {
      console.error(err);
      alert('Errore nel salvataggio ticket');
    }
  };

  // Funzione per scaricare il CSV dei ticket (solo per manager), applicando il filtro divisione
  const downloadCSV = async () => {
    const token = localStorage.getItem('token');
    let url = 'http://localhost:3001/api/tickets/export';

    if (filterDivision) {
      url += `?division=${encodeURIComponent(filterDivision)}`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `tickets_${filterDivision || 'tutti'}.csv`;
      link.click();
    } catch (err) {
      console.error('Errore nel download CSV:', err);
      alert('Errore nel download del CSV');
    }
  };

  useEffect(() => {
    fetchTickets(searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDivision, searchTerm]);

  useEffect(() => {
    fetch('http://localhost:3001/api/tickets/clients')
      .then((res) => res.json())
      .then(setClients)
      .catch(() => alert('Errore nel caricamento clienti'));
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    fetch(`http://localhost:3001/api/tickets/infrastructures?client_id=${selectedClient}`)
      .then((res) => res.json())
      .then(setInfrastructures)
      .catch(() => alert('Errore nel caricamento infrastrutture'));
  }, [selectedClient]);

  useEffect(() => {
    if (!selectedInfrastructure) return;
    fetch(`http://localhost:3001/api/tickets/projects?infrastructure_id=${selectedInfrastructure}`)
      .then((res) => res.json())
      .then(setProjects)
      .catch(() => alert('Errore nel caricamento progetti'));
  }, [selectedInfrastructure]);

  return (
    <div className="max-w-4xl mx-auto mt-20 p-4">
      {/* Header con titolo e pulsanti */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Ticket in gestione</h1>
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
      </div>

      {/* Barra di ricerca */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Cerca per titolo o descrizione..."
        className="border px-3 py-2 rounded w-full mb-4"
      />

      {/* Filtri: divisione (solo per manager) e stato, affiancati */}
      <div className="flex flex-col md:flex-row md:gap-4 mb-4">
        {user?.role === 'manager' && (
          <div className="w-full md:w-1/2">
            <label className="block mb-1 font-medium">Filtra per divisione:</label>
            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="">Tutte</option>
              <option value="cloud">Cloud</option>
              <option value="networking">Networking</option>
              <option value="it-care">IT-Care</option>
            </select>
          </div>
        )}

        <div className={`w-full ${user?.role === 'manager' ? 'md:w-1/2' : ''}`}>
          <label className="block mb-1 font-medium text-gray-700">Filtra per stato:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="all">Tutti</option>
            <option value="open">Aperti</option>
            <option value="in-progress">In lavorazione</option>
            <option value="paused">In pausa</option>
            <option value="closed">Chiusi</option>
          </select>
        </div>
      </div>

      {/* Modale per la creazione del ticket */}
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
              {/* Input titolo */}
              <input
                name="title"
                value={newTicket.title}
                onChange={handleChange}
                placeholder="Titolo"
                required
                className="w-full border p-2 rounded"
              />
              {/* Input descrizione */}
              <textarea
                name="description"
                value={newTicket.description}
                onChange={handleChange}
                placeholder="Descrizione"
                required
                className="w-full border p-2 rounded"
              />
              {/* Select cliente */}
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
              {/* Select infrastruttura */}
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
                  className="border p-2 rounded w-full mt-3"
                >
                  <option value="">Seleziona infrastruttura</option>
                  {infrastructures.map((i: any) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              )}
              {/* Select progetto */}
              {projects.length > 0 && (
                <select
                  required
                  value={newTicket.project_id}
                  onChange={(e) => setNewTicket({ ...newTicket, project_id: e.target.value })}
                  className="border p-2 rounded w-full mt-3"
                >
                  <option value="">Seleziona progetto</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
              {/* Select divisione */}
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
              {/* Select assegnato a */}
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
              {/* Input per allegato */}
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAttachment(file);
                }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" // <-- aggiungi qui le estensioni immagini
                className="w-full mb-3 p-2 border rounded"
              />
              {/* Pulsante per creare il ticket */}
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

      {/* Lista dei ticket */}
      {loading ? (
        <p>Caricamento...</p>
      ) : error ? (
        <p className="text-red-600">Errore: {error}</p>
      ) : (
        <div>
          <ul className="space-y-4">
            {tickets
              .filter((ticket) => filterStatus === 'all' || ticket.status === filterStatus)
              .map((ticket) => (
                <li
                  key={ticket.id}
                  className="bg-white p-4 rounded shadow hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-lg">{ticket.title}</h2>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full
                        ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : ''}
                        ${ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : ''}
                        ${ticket.status === 'closed' ? 'bg-gray-200 text-gray-700' : ''}
                        ${ticket.status === 'paused' ? 'bg-yellow-100 text-yellow-700' : ''}`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <p className="text-gray-700">{ticket.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                     Creato il: {new Date(ticket.created_at).toLocaleString()}
                 </p>
                  {/* ...other summary fields if needed... */}
                </li>
              ))}
          </ul>
          <TicketModal
            isOpen={!!selectedTicket}
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
-        </div>
      )}
    </div>
  );
}

export default TicketList;
// Questo componente definisce la pagina principale per la gestione dei ticket.
// Permette di visualizzare, filtrare, creare e cambiare lo stato dei ticket.
// I manager possono anche esportare i ticket in formato CSV.