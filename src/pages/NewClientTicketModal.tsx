import React, { useEffect, useState } from 'react';

interface NewClientTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  onTicketCreated: (newTicket: any) => void;
}

const CATEGORY_TO_DIVISION: Record<string, string> = {
  'rete': 'networking',
  'vm': 'cloud',
  'tecnica': 'it-care',
};

const NewClientTicketModal: React.FC<NewClientTicketModalProps> = ({
  isOpen,
  onClose,
  clientId,
  onTicketCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [projects, setProjects] = useState([]);
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch(`http://localhost:3001/api/clientAuth/client-projects/${clientId}`);
      const data = await res.json();
      setProjects(data);
    };

    if (isOpen) fetchProjects();
  }, [clientId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (projectId) formData.append('project_id', String(projectId));
    formData.append('client_id', String(clientId));
    if (attachment) formData.append('attachment', attachment);
    formData.append('division', CATEGORY_TO_DIVISION[category]);

    const token = localStorage.getItem('client_token');
    const res = await fetch('http://localhost:3001/api/clientAuth/client-tickets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      const newTicket = await res.json();
      onTicketCreated(newTicket);
      setTitle('');
      setDescription('');
      setAttachment(null);
      setProjectId(null);
      setCategory('');
    } else {
      alert('Errore nella creazione del ticket');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-[#429d46]/10">
        <h2 className="text-2xl font-bold mb-6 text-[#429d46]">
          Crea un nuovo ticket
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titolo"
            required
            className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrizione"
            required
            className="w-full border p-3 rounded-lg h-28 text-sm focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
          />

          <select
            value={projectId ?? ''}
            onChange={(e) => setProjectId(Number(e.target.value))}
            required
            className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
          >
            <option value="">Seleziona un progetto</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
          >
            <option value="">Scegli il tipo di assistenza</option>
            <option value="rete">Assistenza rete</option>
            <option value="vm">Assistenza VM</option>
            <option value="tecnica">Assistenza tecnica</option>
          </select>

          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            className="w-full border p-2 rounded-lg text-sm"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-600 hover:underline"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="bg-[#429d46] text-white font-semibold px-5 py-2 rounded-lg shadow hover:bg-[#357a36] transition"
            >
              Invia richiesta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClientTicketModal;
// This component allows clients to create a new ticket by filling out a form with title, description, project, category, and optional attachment.
// It fetches the client's projects and submits the ticket data to the server, handling file uploads and category selection.
// The modal can be opened and closed, and it calls a callback function to notify the parent component when a new ticket is created successfully.
// The component uses local state to manage form inputs and fetches projects from the server when the modal is opened.
// It also handles form submission, including file uploads and error handling.