import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext'; // assicurati che sia importato

const ClientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useClientAuth(); // assicurati che sia usato

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/clientAuth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        alert('Login fallito');
        return;
      }

      const data = await res.json();
      localStorage.setItem('client_token', data.token);
      localStorage.setItem('client_user', JSON.stringify(data.user));
      login(data.user, data.token); // 👈 fondamentale
      navigate('/client-dashboard'); // 👈 reindirizza sempre dopo login OK
    } catch (err) {
      console.error(err);
      alert('Errore di rete');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login Cliente</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Accedi
        </button>
      </form>
    </div>
  );
};

export default ClientLogin;
// This component allows clients to log in to their account.
// It handles the login process by sending a POST request to the backend with the client's email and password.
// If successful, it stores the token and user data in localStorage and navigates to the client dashboard.
