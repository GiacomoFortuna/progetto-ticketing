// src/components/LayoutAziendale.tsx
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const LayoutAziendale: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="p-4 overflow-y-auto flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
};

export default LayoutAziendale;
// This component serves as a layout for the aziendale (corporate) section of the application.
// It includes a sidebar for navigation and a header, with the main content area for displaying child