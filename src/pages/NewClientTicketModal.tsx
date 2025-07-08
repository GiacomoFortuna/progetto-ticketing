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

    // Calcola division da categoria scelta
    const division = CATEGORY_TO_DIVISION[category];
    formData.append('division', division);

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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">Crea un nuovo ticket</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titolo"
            required
            className="w-full border p-2 rounded"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrizione"
            required
            className="w-full border p-2 rounded h-28"
          />

          <select
            value={projectId ?? ''}
            onChange={(e) => setProjectId(Number(e.target.value))}
            required
            className="w-full border p-2 rounded"
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
            className="w-full border p-2 rounded"
          >
            <option value="">Scegli il tipo di assistenza</option>
            <option value="rete">Assistenza rete</option>
            <option value="vm">Assistenza VM</option>
            <option value="tecnica">Assistenza tecnica</option>
          </select>

          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            className="w-full"
          />

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-600 underline"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Invia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClientTicketModal;
// Note: This component is used to create a new ticket for the client.
// It includes a form with fields for title, description, project selection, and file attachment.