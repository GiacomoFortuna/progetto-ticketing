import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

function UserRegister() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    division: '',
    role: 'employee',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (user?.role !== 'manager') {
    return <p className="text-red-600">Non sei autorizzato a visualizzare questa pagina.</p>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await registerUser(formData);
      setMessage('Utente registrato con successo');
      setFormData({ username: '', password: '', division: '', role: 'employee' });
    } catch {
      setError('Errore nella registrazione');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-6 shadow rounded">
        <h2 className="text-xl font-bold mb-4">Registra nuovo utente</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        {message && <p className="text-green-600 mb-2">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            autoComplete="new-username"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            autoComplete="new-password"
          />
          <select name="division" value={formData.division} onChange={handleChange} required className="w-full p-2 border rounded">
            <option value="">Seleziona divisione</option>
            <option value="cloud">Cloud</option>
            <option value="networking">Networking</option>
            <option value="it-care">IT-Care</option>
          </select>
          <select name="role" value={formData.role} onChange={handleChange} required className="w-full p-2 border rounded">
            <option value="employee">Dipendente</option>
            <option value="manager">Manager</option>
          </select>
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Registra</button>
        </form>
        <button
          type="button"
          className="mt-4 w-full bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300"
          onClick={() => navigate('/ticket')}
        >
          Torna ai ticket
        </button>
      </div>
    </div>
  );
}

export default UserRegister;
// This code defines a UserRegister component that allows managers to register new users.
// It includes a form for entering user details and handles submission with error and success messages.