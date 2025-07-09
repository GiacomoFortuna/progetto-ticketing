import { Link } from 'react-router-dom';

const ClientSidebar = () => {
  return (
    <aside className="w-64 bg-[#14532d] text-white h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Area Clienti</h2>
      <nav className="space-y-3">
        <Link to="/client-dashboard" className="block hover:underline">Dashboard</Link>
        <Link to="/client-profile" className="block hover:underline">Profilo</Link>
        {/* aggiungi altri link se servono */}
      </nav>
    </aside>
  );
};

export default ClientSidebar;
// Questo componente rappresenta la sidebar per l'area clienti.
// Include link per navigare tra le sezioni principali come Dashboard e Profilo.