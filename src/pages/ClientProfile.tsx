import { useClientAuth } from '../context/ClientAuthContext';
import { useState } from 'react';

const ClientProfile = () => {
  const { clientUser } = useClientAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('http://localhost:3001/api/clientAuth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('client_token')}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Errore nel cambio password');
      }

      setSuccessMessage('Password aggiornata con successo!');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow max-w-2xl mx-auto mt-6">
      <h2 className="text-3xl font-bold text-[#14532d] mb-6 text-center">Profilo Cliente</h2>

      <div className="space-y-3 text-lg text-gray-800">
        <p><strong>Nome:</strong> {clientUser?.name}</p>
        <p><strong>Email:</strong> {clientUser?.email}</p>
        <p><strong>Ruolo:</strong> {clientUser?.role}</p>
        <p><strong>Azienda Cliente:</strong> {clientUser?.company_name || '—'}</p>
      </div>

      <hr className="my-6" />

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
        {successMessage && <p className="text-green-600">{successMessage}</p>}
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default ClientProfile;