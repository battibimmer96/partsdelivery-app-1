import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

// Dati di esempio per la dashboard
const mockData = {
  stats: {
    totalOrders: 24,
    pendingOrders: 8,
    inProgressOrders: 12,
    completedOrders: 4,
    activeCouriers: 5
  },
  recentOrders: [
    { id: 'ord-001', client: 'Autoricambi Rossi', status: 'in_progress', date: '2025-03-27T10:30:00Z', items: 3 },
    { id: 'ord-002', client: 'Officina Bianchi', status: 'pending', date: '2025-03-27T09:15:00Z', items: 2 },
    { id: 'ord-003', client: 'Carrozzeria Verdi', status: 'completed', date: '2025-03-26T16:45:00Z', items: 5 },
    { id: 'ord-004', client: 'Autofficina Neri', status: 'in_progress', date: '2025-03-26T14:20:00Z', items: 1 },
    { id: 'ord-005', client: 'Ricambi Auto Blu', status: 'pending', date: '2025-03-26T11:10:00Z', items: 4 }
  ]
};

const Dashboard = () => {
  const [stats, setStats] = useState(mockData.stats);
  const [recentOrders, setRecentOrders] = useState(mockData.recentOrders);
  const [loading, setLoading] = useState(false);

  // In una implementazione reale, qui caricheremmo i dati dal backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Simuliamo una chiamata API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In una implementazione reale, qui chiameremmo le API
        // const response = await fetch('/api/dashboard');
        // const data = await response.json();
        // setStats(data.stats);
        // setRecentOrders(data.recentOrders);
        
        // Per ora usiamo i dati di esempio
        setStats(mockData.stats);
        setRecentOrders(mockData.recentOrders);
      } catch (error) {
        console.error('Errore durante il caricamento dei dati della dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Funzione per formattare la data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funzione per ottenere il colore dello stato
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Funzione per tradurre lo stato
  const translateStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'In attesa';
      case 'in_progress':
        return 'In corso';
      case 'completed':
        return 'Completato';
      default:
        return status;
    }
  };

  return (
    <Layout active="dashboard">
      <div className="space-y-6">
        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Ordini Totali
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {loading ? '...' : stats.totalOrders}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                In Attesa
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-yellow-600">
                {loading ? '...' : stats.pendingOrders}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                In Corso
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">
                {loading ? '...' : stats.inProgressOrders}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Completati
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                {loading ? '...' : stats.completedOrders}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Corrieri Attivi
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-primary">
                {loading ? '...' : stats.activeCouriers}
              </dd>
            </div>
          </div>
        </div>
        
        {/* Mappa con corrieri (placeholder) */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Mappa Corrieri
            </h3>
            <div className="mt-4 bg-gray-100 h-64 rounded flex items-center justify-center">
              <p className="text-gray-500">
                Qui verrà visualizzata la mappa con i corrieri in tempo reale
              </p>
            </div>
          </div>
        </div>
        
        {/* Ordini recenti */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Ordini Recenti
              </h3>
              <Link to="/orders" className="text-primary hover:text-primary-dark text-sm font-medium">
                Vedi tutti
              </Link>
            </div>
            
            {loading ? (
              <p className="text-gray-500">Caricamento ordini...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stato
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Articoli
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Azioni</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.client}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {translateStatus(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.items}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/orders/${order.id}`} className="text-primary hover:text-primary-dark">
                            Dettagli
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
