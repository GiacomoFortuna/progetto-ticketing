import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore di login');
      }

      const { token, user } = data;

      // ✅ Salva tutto correttamente nel localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); // deve contenere anche user.role
      login(user, token);

      navigate('/ticket');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full" autoComplete="off">
          <h2 className="text-xl font-semibold mb-4">Login</h2>
          {error && <p className="text-red-500 mb-3">{error}</p>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
            required
            autoComplete="new-username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
            required
            autoComplete="new-password"
          />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
            Accedi
          </button>
        </form>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm font-medium"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
// This code defines a Login component for a React application.
// It allows users to log in by entering their username and password.