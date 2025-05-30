import { useEffect, useState } from 'react';
import { getTickets, createTicket, updateTicketStatus } from '../services/api';

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
  working_hours?: number; // Add working_hours to the Ticket type
};

function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [clients, setClients] = useState<any[]>([]);
  const [infrastructures, setInfrastructures] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedInfrastructure, setSelectedInfrastructure] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);



  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    client: '',
    project_id: '',
    division: '',
    assigned_to: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setNewTicket({ ...newTicket, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket(newTicket);
      const updated = await getTickets();
      setTickets(updated);
      setNewTicket({
        title: '',
        description: '',
        client: '',
        project_id: '',
        division: '',
        assigned_to: '',
      });
    } catch (err) {
      alert('Errore nel salvataggio ticket');
    }
  };

  useEffect(() => {
    getTickets()
      .then(setTickets)
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Load clients on mount
  useEffect(() => {
    fetch('http://localhost:3001/api/tickets/clients')
      .then((res) => res.json())
      .then(setClients)
      .catch(() => alert('Errore nel caricamento clienti'));
  }, []);

  // Load infrastructures when selectedClient changes
  useEffect(() => {
    if (!selectedClient) return;
    fetch(`http://localhost:3001/api/tickets/infrastructures?client_id=${selectedClient}`)
      .then((res) => res.json())
      .then(setInfrastructures)
      .catch(() => alert('Errore nel caricamento infrastrutture'));
  }, [selectedClient]);

  // Load projects when selectedInfrastructure changes
  useEffect(() => {
    if (!selectedInfrastructure) return;
    fetch(`http://localhost:3001/api/tickets/projects?infrastructure_id=${selectedInfrastructure}`)
      .then((res) => res.json())
      .then(setProjects)
      .catch(() => alert('Errore nel caricamento progetti'));
  }, [selectedInfrastructure]);

  return (
    <div className="max-w-4xl mx-auto mt-20 p-4">
      <h1 className="text-2xl font-bold mb-6">Ticket in gestione</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 space-y-4">
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

      {/* LISTA */}
      {loading ? (
        <p>Caricamento...</p>
      ) : error ? (
        <p className="text-red-600">Errore: {error}</p>
      ) : (
        <>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Filtra per stato:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border px-3 py-2 rounded w-full md:w-64"
            >
              <option value="all">Tutti</option>
              <option value="open">Aperti</option>
              <option value="in-progress">In lavorazione</option>
              <option value="paused">In pausa</option>
              <option value="closed">Chiusi</option>
            </select>
          </div>
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

                  {/* New Details */}
                  <p className="text-sm text-gray-600 mt-1">
                    Cliente: {ticket.client_name} – Infrastruttura: {ticket.infrastructure_name} – Progetto: {ticket.project_name}
                  </p>

                  {/* Working Hours */}
                  {ticket.status === 'closed' && ticket.working_hours !== null && (
                    <p className="text-sm text-gray-500 mt-1">
                      Tempo di lavorazione: {ticket.working_hours}h
                    </p>
                  )}

                  {/* BOTTONE CAMBIA STATO */}
                  {ticket.status !== 'closed' && (
                    <div className="mt-3 flex gap-2">
                      {ticket.status === 'open' && (
                        <>
                          <button
                            onClick={async () => {
                              await updateTicketStatus(ticket.id, 'in-progress');
                              const updated = await getTickets();
                              setTickets(updated);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            Inizia
                          </button>
                          <button
                            onClick={async () => {
                              await updateTicketStatus(ticket.id, 'paused');
                              const updated = await getTickets();
                              setTickets(updated);
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
                              const updated = await getTickets();
                              setTickets(updated);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                          >
                            Pausa
                          </button>

                          <button
                            onClick={async () => {
                              await updateTicketStatus(ticket.id, 'closed');
                              const updated = await getTickets();
                              setTickets(updated);
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
                            const updated = await getTickets();
                            setTickets(updated);
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
        </>
      )}
    </div>
  );
}

export default TicketList;
// This code defines a TicketList component that fetches and displays a list of tickets.
// It also includes a form to create new tickets, handling state and form submission.