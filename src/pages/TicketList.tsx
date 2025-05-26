import { useEffect, useState } from 'react';
import { getTickets, createTicket, updateTicketStatus } from '../services/api';

type Ticket = {
  id: number;
  title: string;
  description: string;
  division: string;
  client: string;
  project?: string;
  assigned_to?: string;
  status: string;
  created_at: string;
};

function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    division: '',
    client: '',
    project: '',
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
        division: '',
        client: '',
        project: '',
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
        <input
          name="client"
          value={newTicket.client}
          onChange={handleChange}
          placeholder="Cliente"
          required
          className="w-full border p-2 rounded"
        />
        <input
          name="project"
          value={newTicket.project}
          onChange={handleChange}
          placeholder="Progetto"
          className="w-full border p-2 rounded"
        />
        <input
          name="assigned_to"
          value={newTicket.assigned_to}
          onChange={handleChange}
          placeholder="Assegnato a"
          className="w-full border p-2 rounded"
        />

        <select
          name="division"
          value={newTicket.division}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Seleziona Divisione</option>
          <option value="cloud">Cloud</option>
          <option value="networking">Networking</option>
          <option value="it-care">IT-Care</option>
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
        <ul className="space-y-4">
          {tickets.map((ticket) => (
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
                Divisione: {ticket.division} – Cliente: {ticket.client}
              </p>

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
      )}
    </div>
  );
}

export default TicketList;
// This code defines a TicketList component that fetches and displays a list of tickets.
// It also includes a form to create new tickets, handling state and form submission.