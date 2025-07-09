import React from 'react';
import ClientSidebar from './ClientSidebar'; // da creare


const LayoutCliente = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-[#f9f9f9] min-h-screen flex">
      <ClientSidebar />
      <main className="flex-1 pt-4 px-6">{children}</main>
    </div>
  );
};

export default LayoutCliente;
// Questo componente serve come layout per la sezione cliente dell'applicazione.
// Include una sidebar per la navigazione e un'area principale per visualizzare i contenuti