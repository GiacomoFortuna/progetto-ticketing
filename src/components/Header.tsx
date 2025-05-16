import { Link } from 'react-router-dom';
import logo from '../assets/logo-planetel.svg';

function Header() {
  return (
    <header className="w-full bg-white shadow fixed top-0 left-0 z-50">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center mb-2 md:mb-0">
          <img src={logo} alt="Planetel" className="h-10" />
        </Link>
        <nav>
          <ul className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
            <li>
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/ticket" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Ticket</Link>
            </li>
            <li>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Login</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;