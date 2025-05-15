import { Link } from 'react-router-dom';

function Header() {
  return (
    <header style={{ padding: '1rem', backgroundColor: '#f5f5f5' }}>
      <nav>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
        <Link to="/ticket">Ticket</Link>
      </nav>
    </header>
  );
}

export default Header;
// This is a simple React component that renders a header with navigation links.
// It includes links to the Home, Login, and Ticket pages of the application.