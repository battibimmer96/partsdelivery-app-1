import React from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../utils/AuthContext';

const Layout = ({ children, active }) => {
  const { currentUser } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar active={active} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {active === 'dashboard' && 'Dashboard'}
              {active === 'clients' && 'Gestione Clienti'}
              {active === 'orders' && 'Gestione Ordini'}
              {active === 'couriers' && 'Gestione Corrieri'}
              {active === 'settings' && 'Impostazioni'}
            </h1>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">
                {currentUser?.email}
              </span>
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                {currentUser?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
