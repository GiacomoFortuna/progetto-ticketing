import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  UserCircle,
  Info,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useClientAuth } from '../context/ClientAuthContext';

const ClientSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const { logout } = useClientAuth(); // 👈 importa il logout

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`bg-[#429d46] text-white h-screen fixed top-0 left-0 z-40 shadow-lg transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Header logo e toggle */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <span className="font-bold text-lg flex items-center gap-2">
          <Home className="text-white" />
          {isOpen && 'Area Clienti'}
        </span>
        <button
          onClick={toggleSidebar}
          className="text-white text-sm hover:text-lime-200"
        >
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-6 space-y-2 px-2">
        <Link
          to="/client-dashboard"
          className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
            isActive('/client-dashboard')
              ? 'bg-white/20 shadow font-bold'
              : 'hover:bg-lime-300/80 hover:text-[#14532d] hover:font-bold'
          }`}
        >
          <Home size={20} />
          {isOpen && <span>Dashboard</span>}
        </Link>

        <Link
          to="/client-profile"
          className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
            isActive('/client-profile')
              ? 'bg-white/20 shadow font-bold'
              : 'hover:bg-lime-300/80 hover:text-[#14532d] hover:font-bold'
          }`}
        >
          <UserCircle size={20} />
          {isOpen && <span>Profilo</span>}
        </Link>

        <Link
          to="/planetel-info"
          className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
            isActive('/planetel-info')
              ? 'bg-white/20 shadow font-bold'
              : 'hover:bg-lime-300/80 hover:text-[#14532d] hover:font-bold'
          }`}
        >
          <Info size={20} />
          {isOpen && <span>Planetel Info</span>}
        </Link>
      </nav>

      {/* Footer + Logout */}
      <div className="mt-auto mb-4 px-2 space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 p-3 rounded-lg font-medium text-sm hover:bg-red-600/80 transition-all"
        >
          <LogOut size={18} />
          {isOpen && <span>Logout</span>}
        </button>
        <div className={`text-xs text-white/60 px-1 ${!isOpen && 'hidden'}`}>
          &copy; {new Date().getFullYear()} Planetel Spa
        </div>
      </div>
    </aside>
  );
};

export default ClientSidebar;
// This component defines a sidebar for the client area of the application.
// It includes navigation links to the client dashboard, profile, and Planetel info.