import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function UserSettingsPopup({ onClose }: { onClose: () => void }) {
  const { user, updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (newPassword !== confirmPassword) {
      return setMessage('Le password non corrispondono.');
    }

    try {
      if (updatePassword) {
        await updatePassword(newPassword);
        setMessage('Password aggiornata con successo!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage('Impossibile aggiornare la password. Riprova più tardi.');
      }
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm relative">
        <button className="absolute top-2 right-2" onClick={onClose}>✕</button>
        <h2 className="text-lg font-bold mb-4">Modifica password</h2>

        {message && <p className="mb-2 text-sm text-center">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={user?.username || ''}
            disabled
            className="w-full border p-2 rounded bg-gray-100"
          />
          <input
            type="password"
            placeholder="Nuova password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Conferma nuova password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

export default UserSettingsPopup;
// This component provides a popup for users to change their password.
// It includes fields for the new password and confirmation, and handles submission with validation.