import React, { useEffect, useState } from 'react'; // Importa React e gli hook useEffect/useState

// Definisce le proprietà accettate dalla modale di creazione ticket
interface NewClientTicketModalProps {
  isOpen: boolean; // Stato di apertura della modale
  onClose: () => void; // Funzione per chiudere la modale
  clientId: number; // ID del cliente
  onTicketCreated: (newTicket: any) => void; // Callback quando il ticket è creato
}

// Mappa le categorie di assistenza alle divisioni interne
const CATEGORY_TO_DIVISION: Record<string, string> = {
  'rete': 'networking', // Assistenza rete → divisione networking
  'vm': 'cloud',        // Assistenza VM → divisione cloud
  'tecnica': 'it-care', // Assistenza tecnica → divisione it-care
};

const baseUrl = import.meta.env.VITE_API_BASE_URL; // Ottiene la base URL dalle variabili d'ambiente

// Componente principale della modale nuovo ticket cliente
const NewClientTicketModal: React.FC<NewClientTicketModalProps> = ({
  isOpen,
  onClose,
  clientId,
  onTicketCreated
}) => {
  const [title, setTitle] = useState(''); // Stato per il titolo del ticket
  const [description, setDescription] = useState(''); // Stato per la descrizione
  const [projectId, setProjectId] = useState<number | null>(null); // Stato per il progetto selezionato
  const [attachment, setAttachment] = useState<File | null>(null); // Stato per il file allegato
  const [projects, setProjects] = useState([]); // Stato per la lista dei progetti del cliente
  const [category, setCategory] = useState<string>(''); // Stato per la categoria di assistenza

  // Effetto per caricare i progetti del cliente quando la modale si apre
  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch(`${baseUrl}/api/clientAuth/client-projects/${clientId}`); // Richiesta GET ai progetti del cliente
      const data = await res.json(); // Parsea la risposta JSON
      setProjects(data); // Aggiorna lo stato con i progetti ricevuti
    };

    if (isOpen) fetchProjects(); // Se la modale è aperta, carica i progetti
  }, [clientId, isOpen]); // Dipende da clientId e isOpen

  // Funzione per gestire il submit del form di creazione ticket
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene il comportamento di default del form

    const formData = new FormData(); // Crea un oggetto FormData per inviare dati multipart
    formData.append('title', title); // Aggiunge il titolo
    formData.append('description', description); // Aggiunge la descrizione
    if (projectId) formData.append('project_id', String(projectId)); // Aggiunge il progetto se selezionato
    formData.append('client_id', String(clientId)); // Aggiunge l'id cliente
    if (attachment) formData.append('attachment', attachment); // Aggiunge il file allegato se presente
    formData.append('division', CATEGORY_TO_DIVISION[category]); // Aggiunge la divisione in base alla categoria

    const token = localStorage.getItem('client_token'); // Recupera il token dal localStorage
    const res = await fetch(`${baseUrl}/api/clientAuth/client-tickets`, {
      method: 'POST', // Metodo POST
      headers: {
        'Authorization': `Bearer ${token}`, // Invia il token JWT
      },
      body: formData, // Invia i dati del form
    });

    if (res.ok) {
      const newTicket = await res.json(); // Parsea la risposta JSON
      onTicketCreated(newTicket); // Chiama la callback per notificare il ticket creato
      setTitle(''); // Resetta il titolo
      setDescription(''); // Resetta la descrizione
      setAttachment(null); // Resetta l'allegato
      setProjectId(null); // Resetta il progetto selezionato
      setCategory(''); // Resetta la categoria
    } else {
      alert('Errore nella creazione del ticket'); // Mostra errore se la richiesta fallisce
    }
  };

  if (!isOpen) return null; // Se la modale non è aperta, non renderizza nulla

  // Render della modale
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
            onChange={(e) => setTitle(e.target.value)} // Aggiorna lo stato titolo
            placeholder="Titolo"
            required
            className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)} // Aggiorna lo stato descrizione
            placeholder="Descrizione"
            required
            className="w-full border p-3 rounded-lg h-28 text-sm focus:ring-2 focus:ring-[#429d46] focus:border-[#429d46] transition"
          />

          <select
            value={projectId ?? ''}
            onChange={(e) => setProjectId(Number(e.target.value))} // Aggiorna lo stato progetto selezionato
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
            onChange={(e) => setCategory(e.target.value)} // Aggiorna lo stato categoria
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
            onChange={(e) => setAttachment(e.target.files?.[0] || null)} // Aggiorna lo stato allegato
            className="w-full border p-2 rounded-lg text-sm"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={onClose} // Chiude la modale al click
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

export default NewClientTicketModal; // Esporta il componente NewClientTicketModal
// This component allows clients to create a new ticket by filling out a form with title, description, project, category, and optional attachment.
// It fetches the client's projects and submits the ticket data to the server, handling file uploads and category selection.
// The modal can be opened and closed, and it calls a callback function to notify the parent component when a new ticket is created successfully.
// The component uses local state to manage form inputs and fetches projects from the server when the modal is opened.
// It also handles form submission, including file uploads and error handling.