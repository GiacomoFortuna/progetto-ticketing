import { useEffect, useState } from 'react';

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'closed';
  createdAt: string;
};

const initialTickets: Ticket[] = [
  {
    id: 1,
    title: 'Internet non funziona',
    description: 'La connessione è assente in sede di Bergamo',
    status: 'open',
    createdAt: '2025-05-16T09:00:00Z',
  },
  {
    id: 2,
    title: 'Problemi con l’email',
    description: 'Impossibile accedere alla webmail aziendale',
    status: 'closed',
    createdAt: '2025-05-14T14:30:00Z',
  },
];

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    // Simulazione caricamento iniziale
    setTimeout(() => {
      setTickets(initialTickets);
    }, 500);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newTicket: Ticket = {
      id: Date.now(),
      title,
      description,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    setTickets([newTicket, ...tickets]); // aggiunge in cima
    setTitle('');
    setDescription('');
  };

return (
  <div className="max-w-4xl mx-auto p-6">
    <h1 className="text-2xl font-bold mb-6">Gestione Ticket</h1>

    {/* Form creazione ticket */}
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
      <h2 className="text-lg font-semibold">Nuovo Ticket</h2>
      <div>
        <input
          type="text"
          placeholder="Titolo"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <textarea
          placeholder="Descrizione"
          className="w-full p-2 border rounded resize-none"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Crea Ticket
      </button>
    </form>

    {/* 🔥 Filtro stato */}
    <div className="flex gap-3 mb-6">
      {['all', 'open', 'closed'].map((status) => (
        <button
          key={status}
          onClick={() => setFilter(status as 'all' | 'open' | 'closed')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            filter === status
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {status === 'all' ? 'Tutti' : status === 'open' ? 'Aperti' : 'Chiusi'}
        </button>
      ))}
    </div>

    {/* 🔥 Lista filtrata */}
    {tickets
      .filter((ticket) =>
        filter === 'all' ? true : ticket.status === filter
      )
      .map((ticket) => (
        <div
          key={ticket.id}
          className="bg-white rounded-lg shadow p-4 mb-4 border-l-4 transition-all duration-300
            border-green-500 hover:scale-[1.01]"
        >
          <h2 className="text-lg font-semibold">{ticket.title}</h2>
          <p className="text-sm text-gray-600">{ticket.description}</p>
          <div className="text-sm mt-2 flex justify-between text-gray-500">
            <span>Stato: <strong>{ticket.status}</strong></span>
            <span>{new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
        </div>
      ))}
  </div>
);
}
