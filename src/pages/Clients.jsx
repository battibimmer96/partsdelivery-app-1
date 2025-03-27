import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

// Dati di esempio per i clienti
const mockClients = [
  { id: 'cli-001', companyName: 'Autoricambi Rossi', firstName: 'Mario', lastName: 'Rossi', email: 'mario.rossi@autoricambi.it', phoneNumber: '3451234567', address: { city: 'Milano', street: 'Via Roma 123' } },
  { id: 'cli-002', companyName: 'Officina Bianchi', firstName: 'Luigi', lastName: 'Bianchi', email: 'luigi.bianchi@officina.it', phoneNumber: '3467654321', address: { city: 'Roma', street: 'Via Milano 456' } },
  { id: 'cli-003', companyName: 'Carrozzeria Verdi', firstName: 'Giuseppe', lastName: 'Verdi', email: 'giuseppe.verdi@carrozzeria.it', phoneNumber: '3489876543', address: { city: 'Napoli', street: 'Via Torino 789' } },
  { id: 'cli-004', companyName: 'Autofficina Neri', firstName: 'Antonio', lastName: 'Neri', email: 'antonio.neri@autofficina.it', phoneNumber: '3412345678', address: { city: 'Torino', street: 'Via Napoli 321' } },
  { id: 'cli-005', companyName: 'Ricambi Auto Blu', firstName: 'Franco', lastName: 'Blu', email: 'franco.blu@ricambiauto.it', phoneNumber: '3498765432', address: { city: 'Firenze', street: 'Via Bologna 654' } }
];

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Italia'
    }
  });

  // In una implementazione reale, qui caricheremmo i dati dal backend
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        // Simuliamo una chiamata API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In una implementazione reale, qui chiameremmo le API
        // const response = await fetch('/api/clients');
        // const data = await response.json();
        // setClients(data);
        
        // Per ora usiamo i dati di esempio
        setClients(mockClients);
      } catch (error) {
        console.error('Errore durante il caricamento dei clienti:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Filtra i clienti in base al termine di ricerca
  const filteredClients = clients.filter(client => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      client.companyName?.toLowerCase().includes(searchTermLower) ||
      client.firstName.toLowerCase().includes(searchTermLower) ||
      client.lastName.toLowerCase().includes(searchTermLower) ||
      client.email.toLowerCase().includes(searchTermLower) ||
      client.phoneNumber.includes(searchTerm) ||
      client.address.city?.toLowerCase().includes(searchTermLower)
    );
  });

  // Gestisce il cambio dei campi del nuovo cliente
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewClient(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewClient(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Gestisce l'invio del form per aggiungere un nuovo cliente
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validazione base
    if (!newClient.firstName || !newClient.lastName || !newClient.email) {
      alert('I campi Nome, Cognome e Email sono obbligatori');
      return;
    }
    
    try {
      // Simuliamo una chiamata API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In una implementazione reale, qui chiameremmo le API
      // const response = await fetch('/api/clients', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(newClient),
      // });
      // const data = await response.json();
      
      // Aggiungiamo il nuovo cliente alla lista locale
      const newClientWithId = {
        ...newClient,
        id: `cli-00${clients.length + 1}`
      };
      
      setClients(prev => [...prev, newClientWithId]);
      
      // Resettiamo il form e chiudiamo il modal
      setNewClient({
        companyName: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: {
          street: '',
          city: '',
          province: '',
          postalCode: '',
          country: 'Italia'
        }
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Errore durante l\'aggiunta del cliente:', error);
    }
  };

  return (
    <Layout active="clients">
      <div className="space-y-6">
        {/* Header con ricerca e pulsante aggiungi */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Cerca clienti..."
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => setShowAddModal(true)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Aggiungi Cliente
          </button>
        </div>
        
        {/* Tabella clienti */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">Caricamento clienti...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">Nessun cliente trovato</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <li key={client.id}>
                  <Link to={`/clients/${client.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                            {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-primary">
                              {client.firstName} {client.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {client.companyName}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-sm text-gray-900">
                            {client.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.phoneNumber}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            {client.address.street}, {client.address.city}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                          Vedi dettagli
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Modal per aggiungere un nuovo cliente */}
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
                        Aggiungi Nuovo Cliente
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                            Azienda
                          </label>
                          <input
                            type="text"
                            name="companyName"
                            id="companyName"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newClient.companyName}
                            onChange={handleInputChange}
                          />
                        </div>
                        
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
                              value={newClient.firstName}
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
                              value={newClient.lastName}
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
                            value={newClient.email}
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
                            value={newClient.phoneNumber}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                            Indirizzo
                          </label>
                          <input
                            type="text"
                            name="address.street"
                            id="address.street"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={newClient.address.street}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                              Città
                            </label>
                            <input
                              type="text"
                              name="address.city"
                              id="address.city"
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newClient.address.city}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="address.province" className="block text-sm font-medium text-gray-700">
                              Provincia
                            </label>
                            <input
                              type="text"
                              name="address.province"
                              id="address.province"
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newClient.address.province}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700">
                              CAP
                            </label>
                            <input
                              type="text"
                              name="address.postalCode"
                              id="address.postalCode"
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newClient.address.postalCode}
                              onChange={handleInputChange}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                              Paese
                            </label>
                            <input
                              type="text"
                              name="address.country"
                              id="address.country"
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={newClient.address.country}
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
    </Layout>
  );
};

export default Clients;
