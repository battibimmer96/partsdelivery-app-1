import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

// Dati di esempio per gli ordini
const mockOrders = [
  { 
    id: 'ord-001', 
    clientId: 'cli-001',
    clientName: 'Autoricambi Rossi', 
    status: 'in_progress', 
    createdAt: '2025-03-27T10:30:00Z',
    scheduledDelivery: {
      date: '2025-03-28T14:00:00Z',
    },
    priority: 'normal',
    items: [
      { description: 'Filtro olio motore', quantity: 2, notes: 'Compatibile con BMW Serie 3' },
      { description: 'Pastiglie freno anteriori', quantity: 1, notes: 'Marca Brembo' }
    ],
    courierId: 'cou-002',
    courierName: 'Marco Verdi'
  },
  { 
    id: 'ord-002', 
    clientId: 'cli-002',
    clientName: 'Officina Bianchi', 
    status: 'pending', 
    createdAt: '2025-03-27T09:15:00Z',
    scheduledDelivery: {
      date: '2025-03-27T16:30:00Z',
    },
    priority: 'urgent',
    items: [
      { description: 'Alternatore', quantity: 1, notes: 'Per Fiat Punto 1.2' }
    ],
    courierId: null,
    courierName: null
  },
  { 
    id: 'ord-003', 
    clientId: 'cli-003',
    clientName: 'Carrozzeria Verdi', 
    status: 'completed', 
    createdAt: '2025-03-26T16:45:00Z',
    scheduledDelivery: {
      date: '2025-03-27T10:00:00Z',
    },
    priority: 'normal',
    items: [
      { description: 'Paraurti anteriore', quantity: 1, notes: 'Colore nero, Audi A3' },
      { description: 'Faro anteriore sinistro', quantity: 1, notes: 'Audi A3 2020' },
      { description: 'Kit riparazione', quantity: 1, notes: '' }
    ],
    courierId: 'cou-001',
    courierName: 'Luca Bianchi'
  },
  { 
    id: 'ord-004', 
    clientId: 'cli-004',
    clientName: 'Autofficina Neri', 
    status: 'in_progress', 
    createdAt: '2025-03-26T14:20:00Z',
    scheduledDelivery: {
      date: '2025-03-27T15:45:00Z',
    },
    priority: 'normal',
    items: [
      { description: 'Pompa acqua', quantity: 1, notes: 'Mercedes Classe C' }
    ],
    courierId: 'cou-003',
    courierName: 'Paolo Rossi'
  },
  { 
    id: 'ord-005', 
    clientId: 'cli-005',
    clientName: 'Ricambi Auto Blu', 
    status: 'pending', 
    createdAt: '2025-03-26T11:10:00Z',
    scheduledDelivery: {
      date: '2025-03-28T09:30:00Z',
    },
    priority: 'scheduled',
    items: [
      { description: 'Kit distribuzione', quantity: 1, notes: 'Volkswagen Golf 1.6 TDI' },
      { description: 'Cinghia servizi', quantity: 1, notes: '' },
      { description: 'Pompa acqua', quantity: 1, notes: '' },
      { description: 'Liquido raffreddamento', quantity: 2, notes: 'Flacone 1L' }
    ],
    courierId: null,
    courierName: null
  }
];

// Dati di esempio per i corrieri
const mockCouriers = [
  { id: 'cou-001', name: 'Luca Bianchi', available: true },
  { id: 'cou-002', name: 'Marco Verdi', available: true },
  { id: 'cou-003', name: 'Paolo Rossi', available: true },
  { id: 'cou-004', name: 'Giuseppe Neri', available: false },
  { id: 'cou-005', name: 'Antonio Gialli', available: true }
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({
    clientId: '',
    clientName: '',
    status: 'pending',
    priority: 'normal',
    scheduledDelivery: {
      date: new Date().toISOString().split('T')[0],
      timeWindow: {
        start: '09:00',
        end: '18:00'
      }
    },
    items: [
      { description: '', quantity: 1, notes: '' }
    ]
  });

  // In una implementazione reale, qui caricheremmo i dati dal backend
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Simuliamo una chiamata API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In una implementazione reale, qui chiameremmo le API
        // const response = await fetch('/api/orders');
        // const data = await response.json();
        // setOrders(data);
        
        // Per ora usiamo i dati di esempio
        setOrders(mockOrders);
        setCouriers(mockCouriers);
      } catch (error) {
        console.error('Errore durante il caricamento degli ordini:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filtra gli ordini in base al termine di ricerca e al filtro di stato
  const filteredOrders = orders.filter(order => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = (
      order.id.toLowerCase().includes(searchTermLower) ||
      order.clientName.toLowerCase().includes(searchTermLower) ||
      (order.courierName && order.courierName.toLowerCase().includes(searchTermLower))
    );
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  // Funzione per tradurre la priorità
  const translatePriority = (priority) => {
    switch (priority) {
      case 'normal':
        return 'Normale';
      case 'urgent':
        return 'Urgente';
      case 'scheduled':
        return 'Programmata';
      default:
        return priority;
    }
  };

  // Funzione per ottenere il colore della priorità
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'normal':
        return 'bg-gray-100 text-gray-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Gestisce il cambio dei campi del nuovo ordine
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setNewOrder(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts;
        setNewOrder(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: value
            }
          }
        }));
      }
    } else {
      setNewOrder(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Gestisce il cambio dei campi degli articoli
  const handleItemChange = (index, field, value) => {
    setNewOrder(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  // Aggiunge un nuovo articolo
  const addItem = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, notes: '' }]
    }));
  };

  // Rimuove un articolo
  const removeItem = (index) => {
    if (newOrder.items.length > 1) {
      setNewOrder(prev => {
        const updatedItems = [...prev.items];
        updatedItems.splice(index, 1);
        return {
          ...prev,
          items: updatedItems
        };
      });
    }
  };

  // Gestisce l'invio del form per aggiungere un nuovo ordine
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validazione base
    if (!newOrder.clientId || !newOrder.clientName || newOrder.items.some(item => !item.description)) {
      alert('I campi Cliente e Descrizione articoli sono obbligatori');
      return;
    }
    
    try {
      // Simuliamo una chiamata API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In una implementazione reale, qui chiameremmo le API
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(newOrder),
      // });
      // const data = await response.json();
      
      // Aggiungiamo il nuovo ordine alla lista locale
      const newOrderWithId = {
        ...newOrder,
        id: `ord-00${orders.length + 1}`,
        createdAt: new Date().toISOString(),
        courierId: null,
        courierName: null
      };
      
      setOrders(prev => [...prev, newOrderWithId]);
      
      // Resettiamo il form e chiudiamo il modal
      setNewOrder({
        clientId: '',
        clientName: '',
        status: 'pending',
        priority: 'normal',
        scheduledDelivery: {
          date: new Date().toISOString().split('T')[0],
          timeWindow: {
            start: '09:00',
            end: '18:00'
          }
        },
        items: [
          { description: '', quantity: 1, notes: '' }
        ]
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Errore durante l\'aggiunta dell\'ordine:', error);
    }
  };

  // Gestisce l'assegnazione di un ordine a un corriere
  const handleAssignOrder = async (courierId) => {
    if (!selectedOrder || !courierId) return;
    
    try {
      // Simuliamo una chiamata API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In una implementazione reale, qui chiameremmo le API
      // const response = await fetch(`/api/orders/${selectedOrder.id}/assign`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ courierId }),
      // });
      
      // Aggiorniamo l'ordine nella lista locale
      const selectedCourier = couriers.find(c => c.id === courierId);
      
      setOrders(prev => prev.map(order => {
        if (order.id === selectedOrder.id) {
          return {
            ...order,
            status: 'in_progress',
            courierId,
            courierName: selectedCourier.name
          };
        }
        return order;
      }));
      
      setShowAssignModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Errore durante l\'assegnazione dell\'ordine:', error);
    }
  };

  return (
    <Layout active="orders">
      <div className="space-y-6">
        {/* Header con ricerca, filtri e pulsante aggiungi */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Cerca ordini..."
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tutti gli stati</option>
                <option value="pending">In attesa</option>
                <option value="in_progress">In corso</option>
                <option value="completed">Completati</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => setShowAddModal(true)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Nuovo Ordine
          </button>
        </div>
        
        {/* Tabella ordini */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">Caricamento ordini...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">Nessun ordine trovato</p>
            </div>
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
                      Priorità
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Consegna
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Corriere
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
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {translateStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                          {translatePriority(order.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.scheduledDelivery.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.courierName ? (
                          order.courierName
                        ) : (
                          <button
                            type="button"
                            className="text-primary hover:text-primary-dark"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowAssignModal(true);
                            }}
                          >
                            Assegna
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items.length}
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
      
      {/* Modal per aggiungere un nuovo ordine */}
      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Nuovo Ordine
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                            Cliente *
                          </label>
                          <input
                            type="text"
                            name="clientName"
                            id="clientName"
                            required
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newOrder.clientName}
                            onChange={handleInputChange}
                          />
                          <input
                            type="hidden"
                            name="clientId"
                            value="cli-temp"
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                              Priorità
                            </label>
                            <select
                              name="priority"
                              id="priority"
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newOrder.priority}
                              onChange={handleInputChange}
                            >
                              <option value="normal">Normale</option>
                              <option value="urgent">Urgente</option>
                              <option value="scheduled">Programmata</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="scheduledDelivery.date" className="block text-sm font-medium text-gray-700">
                              Data Consegna
                            </label>
                            <input
                              type="date"
                              name="scheduledDelivery.date"
                              id="scheduledDelivery.date"
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newOrder.scheduledDelivery.date}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="scheduledDelivery.timeWindow.start" className="block text-sm font-medium text-gray-700">
                              Ora Inizio
                            </label>
                            <input
                              type="time"
                              name="scheduledDelivery.timeWindow.start"
                              id="scheduledDelivery.timeWindow.start"
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newOrder.scheduledDelivery.timeWindow.start}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="scheduledDelivery.timeWindow.end" className="block text-sm font-medium text-gray-700">
                              Ora Fine
                            </label>
                            <input
                              type="time"
                              name="scheduledDelivery.timeWindow.end"
                              id="scheduledDelivery.timeWindow.end"
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newOrder.scheduledDelivery.timeWindow.end}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700">
                              Articoli *
                            </label>
                            <button
                              type="button"
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                              onClick={addItem}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                              </svg>
                              Aggiungi
                            </button>
                          </div>
                          
                          {newOrder.items.map((item, index) => (
                            <div key={index} className="mt-2 p-2 border border-gray-200 rounded-md">
                              <div className="flex justify-between items-start">
                                <div className="w-full">
                                  <div className="mb-2">
                                    <label htmlFor={`item-${index}-description`} className="block text-xs font-medium text-gray-700">
                                      Descrizione *
                                    </label>
                                    <input
                                      type="text"
                                      id={`item-${index}-description`}
                                      required
                                      className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-xs border-gray-300 rounded-md"
                                      value={item.description}
                                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label htmlFor={`item-${index}-quantity`} className="block text-xs font-medium text-gray-700">
                                        Quantità
                                      </label>
                                      <input
                                        type="number"
                                        id={`item-${index}-quantity`}
                                        min="1"
                                        className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-xs border-gray-300 rounded-md"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                      />
                                    </div>
                                    
                                    <div>
                                      <label htmlFor={`item-${index}-notes`} className="block text-xs font-medium text-gray-700">
                                        Note
                                      </label>
                                      <input
                                        type="text"
                                        id={`item-${index}-notes`}
                                        className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-xs border-gray-300 rounded-md"
                                        value={item.notes}
                                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                {newOrder.items.length > 1 && (
                                  <button
                                    type="button"
                                    className="ml-2 text-red-500 hover:text-red-700"
                                    onClick={() => removeItem(index)}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Salva
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal per assegnare un ordine a un corriere */}
      {showAssignModal && selectedOrder && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Assegna Ordine a Corriere
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Ordine: <span className="font-medium">{selectedOrder.id}</span> - Cliente: <span className="font-medium">{selectedOrder.clientName}</span>
                      </p>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="courier" className="block text-sm font-medium text-gray-700">
                        Seleziona Corriere
                      </label>
                      <ul className="mt-2 divide-y divide-gray-200 max-h-60 overflow-y-auto">
                        {couriers.filter(c => c.available).map((courier) => (
                          <li key={courier.id}>
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none"
                              onClick={() => handleAssignOrder(courier.id)}
                            >
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                                  {courier.name.charAt(0)}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{courier.name}</p>
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedOrder(null);
                  }}
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Orders;
