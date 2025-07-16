import { useState } from 'react'; // Importa lo useState di React per gestire lo stato locale
import { useAuth } from '../context/AuthContext'; // Importa il context di autenticazione aziendale

function UserSettingsPopup({ onClose }: { onClose: () => void }) {
  const { user, updatePassword } = useAuth(); // Recupera l'utente e la funzione di aggiornamento password dal context
  const [newPassword, setNewPassword] = useState(''); // Stato per la nuova password
  const [confirmPassword, setConfirmPassword] = useState(''); // Stato per la conferma della nuova password
  const [message, setMessage] = useState(''); // Stato per il messaggio di feedback

  // Funzione per gestire il submit del form di cambio password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene il comportamento di default del form
    setMessage(''); // Resetta il messaggio

    if (newPassword !== confirmPassword) {
      // Se le password non corrispondono, mostra errore
      return setMessage('Le password non corrispondono.');
    }

    try {
      if (updatePassword) {
        // Se la funzione è disponibile, prova ad aggiornare la password
        await updatePassword(newPassword);
        setMessage('Password aggiornata con successo!'); // Mostra messaggio di successo
        setNewPassword(''); // Resetta campo nuova password
        setConfirmPassword(''); // Resetta campo conferma password
      } else {
        setMessage('Impossibile aggiornare la password. Riprova più tardi.'); // Mostra errore generico
      }
    } catch (err: any) {
      setMessage(err.message); // Mostra eventuale errore ricevuto
    }
  };

  // Render della popup
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Overlay scuro e centratura */}
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm relative">
        {/* Bottone di chiusura */}
        <button className="absolute top-2 right-2" onClick={onClose}>✕</button>
        {/* Titolo */}
        <h2 className="text-lg font-bold mb-4">Modifica password</h2>

        {/* Messaggio di feedback */}
        {message && <p className="mb-2 text-sm text-center">{message}</p>}

        {/* Form cambio password */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={user?.username || ''} // Mostra lo username (disabilitato)
            disabled
            className="w-full border p-2 rounded bg-gray-100"
          />
          <input
            type="password"
            placeholder="Nuova password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} // Aggiorna lo stato nuova password
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Conferma nuova password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // Aggiorna lo stato conferma password
            className="w-full border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Salva modifiche
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserSettingsPopup; // Esporta il componente UserSettingsPopup
// This component provides a popup for users to change their password.
// It includes fields for the new password and confirmation, and handles submission with validation.