import { useEffect, useState } from 'react';
import { createTicket, updateTicketStatus } from '../services/api';

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
};

const user = (() => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
})();

function TicketList() {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setNewTicket({ ...newTicket, [e.target.name]: e.target.value });
  };

  const fetchTickets = async (search: string = '') => {
    const token = localStorage.getItem('token');
    let url = 'http://localhost:3001/api/tickets';
    const params: string[] = [];
    if (filterDivision) params.push(`division=${encodeURIComponent(filterDivision)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket(newTicket);
      await fetchTickets(searchTerm);
      setNewTicket({
        title: '',
        description: '',
        client: '',
        project_id: '',
        division: '',
        assigned_to: '',
      });
      setShowModal(false);
    } catch (err) {
      alert('Errore nel salvataggio ticket');
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Ticket in gestione</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Nuovo Ticket
        </button>
      </div>

      {/* SEARCH BAR */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Cerca per titolo o descrizione..."
        className="border px-3 py-2 rounded w-full mb-4"
      />

      {/* FILTRI: Divisione (solo manager) e Stato, uno di fianco all'altro */}
      <div className="flex flex-col md:flex-row md:gap-4 mb-4">
 {(user?.role === 'manager' || user?.role === 'admin') && (
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
              <input
                name="title"
                value={newTicket.title}
                onChange={handleChange}
                placeholder="Titolo"
                required
                className="w-full border p-2 rounded"
              />
              <textarea
                name="description"
                value={newTicket.description}
                onChange={handleChange}
                placeholder="Descrizione"
                required
                className="w-full border p-2 rounded"
              />

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
                  className="border p-2 rounded w-full mt-3"
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
                  onChange={(e) => setNewTicket({ ...newTicket, project_id: e.target.value })}
                  className="border p-2 rounded w-full mt-3"
                >
                  <option value="">Seleziona progetto</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}

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

      {/* LISTA */}
      {loading ? (
        <p>Caricamento...</p>
      ) : error ? (
        <p className="text-red-600">Errore: {error}</p>
      ) : (
        <ul className="space-y-4">
          {tickets
            .filter((ticket) => filterStatus === 'all' || ticket.status === filterStatus)
            .map((ticket) => (
              <li key={ticket.id} className="bg-white p-4 rounded shadow">
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
                <p className="text-sm text-gray-500">
                  Divisione: {ticket.division}
                </p>
                <p className="text-sm text-gray-500">
                  Creato da: {ticket.created_by}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Cliente: {ticket.client_name} – Infrastruttura: {ticket.infrastructure_name} – Progetto: {ticket.project_name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Assegnato a:{' '}
                  {ticket.assigned_to
                    ? ticket.assigned_to
                    : `Divisione ${ticket.division}`}
                </p>

                {ticket.status === 'closed' && ticket.working_hours !== null && (
                  <p className="text-sm text-gray-500 mt-1">
                    Tempo di lavorazione: {ticket.working_hours}h
                  </p>
                )}

                {ticket.status !== 'closed' && (
                  <div className="mt-3 flex gap-2">
                    {ticket.status === 'open' && (
                      <>
                        <button
                          onClick={async () => {
                            await updateTicketStatus(ticket.id, 'in-progress');
                            await fetchTickets(searchTerm);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Inizia
                        </button>
                        <button
                          onClick={async () => {
                            await updateTicketStatus(ticket.id, 'paused');
                            await fetchTickets(searchTerm);
                          }}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                        >
                          Metti in pausa
                        </button>
                      </>
                    )}

                    {ticket.status === 'in-progress' && (
                      <>
                        <button
                          onClick={async () => {
                            await updateTicketStatus(ticket.id, 'paused');
                            await fetchTickets(searchTerm);
                          }}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                        >
                          Pausa
                        </button>

                        <button
                          onClick={async () => {
                            await updateTicketStatus(ticket.id, 'closed');
                            await fetchTickets(searchTerm);
                          }}
                          className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded"
                        >
                          Chiudi
                        </button>
                      </>
                    )}

                    {ticket.status === 'paused' && (
                      <button
                        onClick={async () => {
                          await updateTicketStatus(ticket.id, 'in-progress');
                          await fetchTickets(searchTerm);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Riprendi
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export default TicketList;
// This code defines a TicketList component that fetches and displays a list of tickets.
// It also includes a form to create new tickets, handling state and form submission.