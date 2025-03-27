import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

// Dati di esempio per i corrieri
const mockCouriers = [
  { 
    id: 'cou-001', 
    firstName: 'Luca', 
    lastName: 'Bianchi', 
    email: 'luca.bianchi@partsdelivery.it',
    phoneNumber: '3451234567',
    status: 'active',
    location: {
      latitude: 45.4642,
      longitude: 9.1900,
      lastUpdated: '2025-03-27T10:30:00Z'
    },
    vehicle: {
      type: 'van',
      licensePlate: 'AB123CD',
      model: 'Fiat Ducato'
    },
    deliveries: {
      today: 5,
      completed: 3,
      pending: 2
    }
  },
  { 
    id: 'cou-002', 
    firstName: 'Marco', 
    lastName: 'Verdi', 
    email: 'marco.verdi@partsdelivery.it',
    phoneNumber: '3467654321',
    status: 'active',
    location: {
      latitude: 45.4642,
      longitude: 9.1950,
      lastUpdated: '2025-03-27T10:25:00Z'
    },
    vehicle: {
      type: 'car',
      licensePlate: 'CD456EF',
      model: 'Fiat Panda'
    },
    deliveries: {
      today: 4,
      completed: 2,
      pending: 2
    }
  },
  { 
    id: 'cou-003', 
    firstName: 'Paolo', 
    lastName: 'Rossi', 
    email: 'paolo.rossi@partsdelivery.it',
    phoneNumber: '3489876543',
    status: 'active',
    location: {
      latitude: 45.4700,
      longitude: 9.1850,
      lastUpdated: '2025-03-27T10:28:00Z'
    },
    vehicle: {
      type: 'van',
      licensePlate: 'EF789GH',
      model: 'Renault Kangoo'
    },
    deliveries: {
      today: 6,
      completed: 4,
      pending: 2
    }
  },
  { 
    id: 'cou-004', 
    firstName: 'Giuseppe', 
    lastName: 'Neri', 
    email: 'giuseppe.neri@partsdelivery.it',
    phoneNumber: '3412345678',
    status: 'inactive',
    location: null,
    vehicle: {
      type: 'car',
      licensePlate: 'GH012IL',
      model: 'Fiat Tipo'
    },
    deliveries: {
      today: 0,
      completed: 0,
      pending: 0
    }
  },
  { 
    id: 'cou-005', 
    firstName: 'Antonio', 
    lastName: 'Gialli', 
    email: 'antonio.gialli@partsdelivery.it',
    phoneNumber: '3498765432',
    status: 'active',
    location: {
      latitude: 45.4650,
      longitude: 9.1920,
      lastUpdated: '2025-03-27T10:15:00Z'
    },
    vehicle: {
      type: 'van',
      licensePlate: 'IL345MN',
      model: 'Citroen Berlingo'
    },
    deliveries: {
      today: 3,
      completed: 1,
      pending: 2
    }
  }
];

const Couriers = () => {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [newCourier, setNewCourier] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    status: 'active',
    vehicle: {
      type: 'car',
      licensePlate: '',
      model: ''
    }
  });

  // In una implementazione reale, qui caricheremmo i dati dal backend
  useEffect(() => {
    const fetchCouriers = async () => {
      setLoading(true);
      try {
        // Simuliamo una chiamata API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In una implementazione reale, qui chiameremmo le API
        // const response = await fetch('/api/couriers');
        // const data = await response.json();
        // setCouriers(data);
        
        // Per ora usiamo i dati di esempio
        setCouriers(mockCouriers);
      } catch (error) {
        console.error('Errore durante il caricamento dei corrieri:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCouriers();
  }, []);

  // Filtra i corrieri in base al termine di ricerca e al filtro di stato
  const filteredCouriers = couriers.filter(courier => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = (
      courier.firstName.toLowerCase().includes(searchTermLower) ||
      courier.lastName.toLowerCase().includes(searchTermLower) ||
      courier.email.toLowerCase().includes(searchTermLower) ||
      courier.phoneNumber.includes(searchTerm) ||
      (courier.vehicle && courier.vehicle.licensePlate.toLowerCase().includes(searchTermLower))
    );
    
    const matchesStatus = statusFilter === 'all' || courier.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Funzione per formattare la data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
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
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Funzione per tradurre lo stato
  const translateStatus = (status) => {
    switch (status) {
      case 'active':
        return 'Attivo';
      case 'inactive':
        return 'Inattivo';
      default:
        return status;
    }
  };

  // Funzione per tradurre il tipo di veicolo
  const translateVehicleType = (type) => {
    switch (type) {
      case 'car':
        return 'Auto';
      case 'van':
        return 'Furgone';
      case 'motorcycle':
        return 'Moto';
      default:
        return type;
    }
  };

  // Gestisce il cambio dei campi del nuovo corriere
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewCourier(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewCourier(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Gestisce l'invio del form per aggiungere un nuovo corriere
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validazione base
    if (!newCourier.firstName || !newCourier.lastName || !newCourier.email) {
      alert('I campi Nome, Cognome e Email sono obbligatori');
      return;
    }
    
    try {
      // Simuliamo una chiamata API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In una implementazione reale, qui chiameremmo le API
      // const response = await fetch('/api/couriers', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(newCourier),
      // });
      // const data = await response.json();
      
      // Aggiungiamo il nuovo corriere alla lista locale
      const newCourierWithId = {
        ...newCourier,
        id: `cou-00${couriers.length + 1}`,
        location: null,
        deliveries: {
          today: 0,
          completed: 0,
          pending: 0
        }
      };
      
      setCouriers(prev => [...prev, newCourierWithId]);
      
      // Resettiamo il form e chiudiamo il modal
      setNewCourier({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        status: 'active',
        vehicle: {
          type: 'car',
          licensePlate: '',
          model: ''
        }
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Errore durante l\'aggiunta del corriere:', error);
    }
  };

  return (
    <Layout active="couriers">
      <div className="space-y-6">
        {/* Header con ricerca, filtri e pulsante aggiungi */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Cerca corrieri..."
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
                <option value="active">Attivi</option>
                <option value="inactive">Inattivi</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={() => {
                setSelectedCourier(null);
                setShowMapModal(true);
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
              Mappa
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={() => setShowAddModal(true)}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Nuovo Corriere
            </button>
          </div>
        </div>
        
        {/* Tabella corrieri */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">Caricamento corrieri...</p>
            </div>
          ) : filteredCouriers.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">Nessun corriere trovato</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Corriere
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contatti
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Veicolo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consegne Oggi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ultima Posizione
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Azioni</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCouriers.map((courier) => (
                    <tr key={courier.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                            {courier.firstName.charAt(0)}{courier.lastName.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {courier.firstName} {courier.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {courier.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{courier.email}</div>
                        <div className="text-sm text-gray-500">{courier.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(courier.status)}`}>
                          {translateStatus(courier.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {courier.vehicle ? translateVehicleType(courier.vehicle.type) : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {courier.vehicle ? `${courier.vehicle.model} - ${courier.vehicle.licensePlate}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="mr-2 font-medium">{courier.deliveries ? courier.deliveries.today : 0}</span>
                          <div className="flex items-center text-xs">
                            <span className="text-green-600 mr-1">{courier.deliveries ? courier.deliveries.completed : 0} completate</span>
                            <span className="text-yellow-600">{courier.deliveries ? courier.deliveries.pending : 0} in corso</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {courier.location ? (
                          <div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-primary mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                              <button
                                type="button"
                                className="text-primary hover:text-primary-dark"
                                onClick={() => {
                                  setSelectedCourier(courier);
                                  setShowMapModal(true);
                                }}
                              >
                                Visualizza
                              </button>
                            </div>
                            <div className="text-xs text-gray-400">
                              Aggiornata: {formatDate(courier.location.lastUpdated)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Non disponibile</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/couriers/${courier.id}`} className="text-primary hover:text-primary-dark">
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
      
      {/* Modal per aggiungere un nuovo corriere */}
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
                        Nuovo Corriere
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                              Nome *
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              id="firstName"
                              required
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newCourier.firstName}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                              Cognome *
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              id="lastName"
                              required
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newCourier.lastName}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newCourier.email}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                            Telefono
                          </label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            id="phoneNumber"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newCourier.phoneNumber}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Stato
                          </label>
                          <select
                            name="status"
                            id="status"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newCourier.status}
                            onChange={handleInputChange}
                          >
                            <option value="active">Attivo</option>
                            <option value="inactive">Inattivo</option>
                          </select>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Veicolo</h4>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label htmlFor="vehicle.type" className="block text-sm font-medium text-gray-700">
                                Tipo
                              </label>
                              <select
                                name="vehicle.type"
                                id="vehicle.type"
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={newCourier.vehicle.type}
                                onChange={handleInputChange}
                              >
                                <option value="car">Auto</option>
                                <option value="van">Furgone</option>
                                <option value="motorcycle">Moto</option>
                              </select>
                            </div>
                            
                            <div>
                              <label htmlFor="vehicle.licensePlate" className="block text-sm font-medium text-gray-700">
                                Targa
                              </label>
                              <input
                                type="text"
                                name="vehicle.licensePlate"
                                id="vehicle.licensePlate"
                                className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={newCourier.vehicle.licensePlate}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <label htmlFor="vehicle.model" className="block text-sm font-medium text-gray-700">
                              Modello
                            </label>
                            <input
                              type="text"
                              name="vehicle.model"
                              id="vehicle.model"
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newCourier.vehicle.model}
                              onChange={handleInputChange}
                            />
                          </div>
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
      
      {/* Modal per visualizzare la mappa */}
      {showMapModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {selectedCourier ? `Posizione di ${selectedCourier.firstName} ${selectedCourier.lastName}` : 'Mappa Corrieri'}
                    </h3>
                    <div className="mt-4">
                      <div className="bg-gray-100 h-96 rounded flex items-center justify-center">
                        <p className="text-gray-500">
                          Qui verrà visualizzata la mappa con {selectedCourier ? 'il corriere selezionato' : 'tutti i corrieri'} in tempo reale
                        </p>
                      </div>
                      
                      {selectedCourier && selectedCourier.location && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700">Dettagli Posizione</h4>
                          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-xs text-gray-500">Latitudine:</span>
                              <p className="text-sm font-medium">{selectedCourier.location.latitude}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-xs text-gray-500">Longitudine:</span>
                              <p className="text-sm font-medium">{selectedCourier.location.longitude}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded sm:col-span-2">
                              <span className="text-xs text-gray-500">Ultimo aggiornamento:</span>
                              <p className="text-sm font-medium">{formatDate(selectedCourier.location.lastUpdated)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowMapModal(false);
                    setSelectedCourier(null);
                  }}
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Couriers;
