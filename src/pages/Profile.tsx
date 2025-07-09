import { useAuth } from '../context/AuthContext';
import UserSettingsPopup from './UserSettingPopup';
import { useState } from 'react';

const Profile = () => {
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);

  if (!user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="text-gray-500 text-lg animate-pulse">Caricamento...</span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10">
      <h1 className="text-3xl font-extrabold text-[#429d46] mb-8 flex items-center gap-2">
        <svg className="inline-block" width="28" height="28" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#429d46" fillOpacity="0.15"/>
          <path d="M8 12l2 2 4-4" stroke="#429d46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Profilo utente
      </h1>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="font-semibold w-32 text-gray-600">Username:</label>
          <span className="text-gray-800 bg-gray-100 px-3 py-2 rounded-md">{user.username}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="font-semibold w-32 text-gray-600">Ruolo:</label>
          <span className="text-gray-800 bg-gray-100 px-3 py-2 rounded-md capitalize">
            {user.role === 'manager' ? 'Manager' : 'Utente'}
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="font-semibold w-32 text-gray-600">Divisione:</label>
          <span className="text-gray-800 bg-gray-100 px-3 py-2 rounded-md capitalize">{user.division}</span>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button
          onClick={() => setShowPopup(true)}
          className="bg-[#9CD700] text-black font-semibold px-6 py-2 rounded-lg shadow hover:bg-[#86bf00] transition"
        >
          Modifica password
        </button>
      </div>

      {showPopup && <UserSettingsPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
};

export default Profile;
// This component renders the user's profile information.
// It displays the username, role, and division, and includes a button to open a popup