import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/jticket3.png';
import UserSettingsPopup from '../pages/UserSettingPopup';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b shadow fixed w-full left-0 top-0 h-16 flex items-center justify-between px-4 md:pl-72 z-40">
      <div className="flex items-center gap-4">
        <img src={logo} alt="Planetel Logo" className="h-10 w-auto" />
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:inline">{user.username}</span>


          <button
            onClick={handleLogout}
            className="bg-[#9CD700] hover:bg-[#86bf00] text-black font-semibold px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      )}

      {/* Popup modifica password */}
      {showPopup && <UserSettingsPopup onClose={() => setShowPopup(false)} />}
    </header>
  );
};

export default Header;
// This component renders the header with the Planetel logo, user information, and a logout button.
// It also includes a button to open a popup for changing the user's password.
// No changes needed here for notes functionality