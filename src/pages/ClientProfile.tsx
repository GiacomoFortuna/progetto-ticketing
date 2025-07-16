import { useClientAuth } from '../context/ClientAuthContext'; // Importa il context di autenticazione client
import { useState } from 'react'; // Importa lo useState di React

const baseUrl = import.meta.env.VITE_API_BASE_URL; // Ottiene la base URL dalle variabili d'ambiente

const ClientProfile = () => {
  const { clientUser } = useClientAuth(); // Recupera l'utente client autenticato dal context
  const [oldPassword, setOldPassword] = useState(''); // Stato per la vecchia password
  const [newPassword, setNewPassword] = useState(''); // Stato per la nuova password
  const [successMessage, setSuccessMessage] = useState(''); // Stato per il messaggio di successo
  const [errorMessage, setErrorMessage] = useState(''); // Stato per il messaggio di errore

  // Funzione per gestire il cambio password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene il comportamento di default del form
    setSuccessMessage(''); // Resetta il messaggio di successo
    setErrorMessage(''); // Resetta il messaggio di errore

    try {
      // Effettua la richiesta POST per cambiare la password
      const res = await fetch(`${baseUrl}/api/clientAuth/change-password`, {
        method: 'POST', // Metodo POST
        headers: {
          'Content-Type': 'application/json', // Indica che il body è in JSON
          Authorization: `Bearer ${localStorage.getItem('client_token')}`, // Invia il token JWT
        },
        body: JSON.stringify({
          oldPassword, // Vecchia password
          newPassword, // Nuova password
        }),
      });

      // Se la risposta non è ok, gestisce l'errore
      if (!res.ok) {
        const errorData = await res.json(); // Parsea la risposta di errore
        throw new Error(errorData.error || 'Errore nel cambio password'); // Lancia errore con messaggio
      }

      setSuccessMessage('Password aggiornata con successo!'); // Mostra messaggio di successo
      setOldPassword(''); // Resetta campo vecchia password
      setNewPassword(''); // Resetta campo nuova password
    } catch (err: any) {
      setErrorMessage(err.message); // Mostra messaggio di errore
    }
  };

  // Render della pagina profilo cliente
  return (
    <div className="bg-white p-8 rounded-2xl shadow max-w-2xl mx-auto mt-6">
      {/* Titolo */}
      <h2 className="text-3xl font-bold text-[#14532d] mb-6 text-center">Profilo Cliente</h2>

      {/* Info utente */}
      <div className="space-y-3 text-lg text-gray-800">
        <p><strong>Nome:</strong> {clientUser?.name}</p>
        <p><strong>Email:</strong> {clientUser?.email}</p>
        <p><strong>Ruolo:</strong> {clientUser?.role}</p>
        <p><strong>Azienda Cliente:</strong> {clientUser?.company_name || '—'}</p>
      </div>

      <hr className="my-6" /> {/* Separatore */}

      {/* Form cambio password */}
      <h3 className="text-xl font-semibold text-[#14532d] mb-2">Cambio password</h3>
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <input
          type="password"
          placeholder="Vecchia password"
          className="w-full border p-2 rounded"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Nuova password"
          className="w-full border p-2 rounded"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-[#14532d] text-white px-4 py-2 rounded hover:bg-green-800 transition"
        >
          Aggiorna Password
        </button>
        {/* Messaggio di successo */}
        {successMessage && <p className="text-green-600">{successMessage}</p>}
        {/* Messaggio di errore */}
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default ClientProfile; // Esporta il componente ClientProfile