import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  ClipboardList,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const { role } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`bg-[#429d46] text-white h-screen fixed top-0 left-0 z-40 shadow-lg transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Toggle Button and Logo */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <span className="font-bold text-lg flex items-center gap-2">
          <ClipboardList className="text-white" />
          {isOpen ? 'Ticketing Planetel' : ''}
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
          to="/"
          className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
            isActive('/')
              ? 'bg-white/20 shadow font-bold'
              : 'hover:bg-lime-300/80 hover:text-[#429d46] hover:font-bold'
          }`}
        >
          <Home size={20} />
          {isOpen && <span>Home</span>}
        </Link>

        <Link
          to="/ticket"
          className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
            isActive('/ticket')
              ? 'bg-white/20 shadow font-bold'
              : 'hover:bg-lime-300/80 hover:text-[#429d46] hover:font-bold'
          }`}
        >
          <ClipboardList size={20} />
          {isOpen && <span>Ticket</span>}
        </Link>

        {role === 'manager' && (
          <>
            <Link
              to="/dashboard-stats"
              className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
                isActive('/dashboard-stats')
                  ? 'bg-white/20 shadow font-bold'
                  : 'hover:bg-lime-300/80 hover:text-[#429d46] hover:font-bold'
              }`}
            >
              <ClipboardList size={20} />
              {isOpen && <span>Dashboard</span>}
            </Link>
            <Link
              to="/register"
              className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
                isActive('/register')
                  ? 'bg-white/20 shadow font-bold'
                  : 'hover:bg-lime-300/80 hover:text-[#429d46] hover:font-bold'
              }`}
            >
              <UserCircle size={20} />
              {isOpen && <span>Registra utente</span>}
            </Link>
          </>
        )}

        <Link
          to="/profile"
          className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
            isActive('/profile')
              ? 'bg-white/20 shadow font-bold'
              : 'hover:bg-lime-300/80 hover:text-[#429d46] hover:font-bold'
          }`}
        >
          <UserCircle size={20} />
          {isOpen && <span>Profilo</span>}
        </Link>
      </nav>

      {/* Footer */}
      <div className={`mt-auto mb-4 px-4 text-xs text-white/60 ${!isOpen && 'hidden'}`}>
        &copy; {new Date().getFullYear()} Planetel Spa
      </div>
    </aside>
  );
};

export default Sidebar;
// This component renders a sidebar with navigation links for the application.
// It includes links to Home, Ticket, Register User (for managers), and Profile.
