import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { googleMapsConfig } from '../../../backend/firebase/config';

// Componente per integrare Google Maps
const MapComponent = ({ couriers, selectedCourierId, onCourierSelect }) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Funzione per caricare lo script di Google Maps
  const loadGoogleMapsScript = useCallback(() => {
    if (window.google) {
      setGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsConfig.apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleMapsLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Carica lo script di Google Maps all'avvio del componente
  useEffect(() => {
    loadGoogleMapsScript();
  }, [loadGoogleMapsScript]);

  // Inizializza la mappa quando Google Maps è caricato
  useEffect(() => {
    if (!googleMapsLoaded) return;

    const mapOptions = {
      center: { lat: 45.4642, lng: 9.1900 }, // Milano come centro predefinito
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    };

    const mapInstance = new window.google.maps.Map(
      document.getElementById('google-map'),
      mapOptions
    );

    setMap(mapInstance);

    return () => {
      setMap(null);
    };
  }, [googleMapsLoaded]);

  // Aggiorna i marker quando cambiano i corrieri o la mappa
  useEffect(() => {
    if (!map || !couriers || couriers.length === 0) return;

    // Rimuovi i marker esistenti
    Object.values(markers).forEach(marker => marker.setMap(null));
    const newMarkers = {};

    // Crea i nuovi marker
    couriers.forEach(courier => {
      if (!courier.location) return;

      const position = {
        lat: courier.location.latitude,
        lng: courier.location.longitude
      };

      const isSelected = selectedCourierId === courier.id;
      
      // Crea l'icona del marker
      const markerIcon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: isSelected ? '#FF0000' : '#4285F4',
        fillOpacity: 0.9,
        strokeWeight: 2,
        strokeColor: '#FFFFFF',
        scale: 10
      };

      // Crea il marker
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: `${courier.firstName} ${courier.lastName}`,
        icon: markerIcon,
        animation: isSelected ? window.google.maps.Animation.BOUNCE : null
      });

      // Aggiungi l'evento click al marker
      marker.addListener('click', () => {
        if (onCourierSelect) {
          onCourierSelect(courier.id);
        }
      });

      // Aggiungi il marker all'oggetto markers
      newMarkers[courier.id] = marker;
    });

    setMarkers(newMarkers);

    // Centra la mappa sul corriere selezionato
    if (selectedCourierId && markers[selectedCourierId]) {
      const selectedCourier = couriers.find(c => c.id === selectedCourierId);
      if (selectedCourier && selectedCourier.location) {
        map.setCenter({
          lat: selectedCourier.location.latitude,
          lng: selectedCourier.location.longitude
        });
        map.setZoom(14);
      }
    } else if (couriers.some(c => c.location)) {
      // Calcola i bounds per includere tutti i corrieri
      const bounds = new window.google.maps.LatLngBounds();
      couriers.forEach(courier => {
        if (courier.location) {
          bounds.extend({
            lat: courier.location.latitude,
            lng: courier.location.longitude
          });
        }
      });
      map.fitBounds(bounds);
    }

    return () => {
      Object.values(newMarkers).forEach(marker => marker.setMap(null));
    };
  }, [map, couriers, selectedCourierId, onCourierSelect, markers]);

  return (
    <div id="google-map" className="w-full h-full rounded-md"></div>
  );
};

// Dati di esempio per i corrieri
const mockCouriers = [
  { 
    id: 'cou-001', 
    firstName: 'Luca', 
    lastName: 'Bianchi', 
    status: 'active',
    location: {
      latitude: 45.4642,
      longitude: 9.1900,
      lastUpdated: '2025-03-27T10:30:00Z'
    },
    deliveries: [
      { id: 'del-001', orderId: 'ord-001', status: 'in_progress', eta: '2025-03-27T11:30:00Z' },
      { id: 'del-002', orderId: 'ord-003', status: 'pending', eta: '2025-03-27T13:15:00Z' }
    ]
  },
  { 
    id: 'cou-002', 
    firstName: 'Marco', 
    lastName: 'Verdi', 
    status: 'active',
    location: {
      latitude: 45.4742,
      longitude: 9.1950,
      lastUpdated: '2025-03-27T10:25:00Z'
    },
    deliveries: [
      { id: 'del-003', orderId: 'ord-002', status: 'in_progress', eta: '2025-03-27T11:45:00Z' }
    ]
  },
  { 
    id: 'cou-003', 
    firstName: 'Paolo', 
    lastName: 'Rossi', 
    status: 'active',
    location: {
      latitude: 45.4700,
      longitude: 9.1850,
      lastUpdated: '2025-03-27T10:28:00Z'
    },
    deliveries: [
      { id: 'del-004', orderId: 'ord-004', status: 'in_progress', eta: '2025-03-27T12:00:00Z' },
      { id: 'del-005', orderId: 'ord-005', status: 'pending', eta: '2025-03-27T14:30:00Z' }
    ]
  },
  { 
    id: 'cou-005', 
    firstName: 'Antonio', 
    lastName: 'Gialli', 
    status: 'active',
    location: {
      latitude: 45.4650,
      longitude: 9.1920,
      lastUpdated: '2025-03-27T10:15:00Z'
    },
    deliveries: [
      { id: 'del-006', orderId: 'ord-006', status: 'in_progress', eta: '2025-03-27T11:15:00Z' }
    ]
  }
];

// Dati di esempio per gli ordini
const mockOrders = [
  { id: 'ord-001', clientName: 'Autoricambi Rossi', address: 'Via Roma 123, Milano' },
  { id: 'ord-002', clientName: 'Officina Bianchi', address: 'Via Milano 456, Roma' },
  { id: 'ord-003', clientName: 'Carrozzeria Verdi', address: 'Via Torino 789, Napoli' },
  { id: 'ord-004', clientName: 'Autofficina Neri', address: 'Via Napoli 321, Torino' },
  { id: 'ord-005', clientName: 'Ricambi Auto Blu', address: 'Via Bologna 654, Firenze' },
  { id: 'ord-006', clientName: 'Autoricambi Gialli', address: 'Via Firenze 987, Bologna' }
];

const LiveTracking = () => {
  const [couriers, setCouriers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourierId, setSelectedCourierId] = useState(null);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [optimizationInProgress, setOptimizationInProgress] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState(null);

  // In una implementazione reale, qui caricheremmo i dati dal backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simuliamo una chiamata API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In una implementazione reale, qui chiameremmo le API
        // const couriersResponse = await fetch('/api/couriers/active');
        // const couriersData = await couriersResponse.json();
        // const ordersResponse = await fetch('/api/orders/active');
        // const ordersData = await ordersResponse.json();
        
        // Per ora usiamo i dati di esempio
        setCouriers(mockCouriers);
        setOrders(mockOrders);
      } catch (error) {
        console.error('Errore durante il caricamento dei dati:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Simula aggiornamenti in tempo reale
    const interval = setInterval(() => {
      setCouriers(prev => prev.map(courier => {
        if (!courier.location) return courier;
        
        // Simula un piccolo movimento casuale
        const latChange = (Math.random() - 0.5) * 0.001;
        const lngChange = (Math.random() - 0.5) * 0.001;
        
        return {
          ...courier,
          location: {
            ...courier.location,
            latitude: courier.location.latitude + latChange,
            longitude: courier.location.longitude + lngChange,
            lastUpdated: new Date().toISOString()
          }
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Funzione per tradurre lo stato
  const translateStatus = (status) => {
    switch (status) {
      case 'in_progress':
        return 'In corso';
      case 'pending':
        return 'In attesa';
      case 'completed':
        return 'Completato';
      default:
        return status;
    }
  };

  // Funzione per ottenere i dettagli di un ordine
  const getOrderDetails = (orderId) => {
    return orders.find(order => order.id === orderId) || { clientName: 'N/A', address: 'N/A' };
  };

  // Funzione per ottimizzare i percorsi
  const optimizeRoutes = async () => {
    setOptimizationInProgress(true);
    
    try {
      // Simuliamo una chiamata API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In una implementazione reale, qui chiameremmo le API
      // const response = await fetch('/api/routes/optimize', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ couriers: couriers.map(c => c.id) }),
      // });
      // const data = await response.json();
      
      // Simuliamo i risultati dell'ottimizzazione
      const results = {
        savings: {
          time: 45, // minuti
          distance: 12.5 // km
        },
        suggestions: [
          {
            type: 'reorder',
            courierId: 'cou-001',
            oldOrder: ['del-001', 'del-002'],
            newOrder: ['del-002', 'del-001'],
            reason: 'Riduzione distanza di 5.2 km'
          },
          {
            type: 'exchange',
            fromCourierId: 'cou-003',
            toCourierId: 'cou-005',
            deliveryId: 'del-005',
            reason: 'Il corriere cou-005 sarà più vicino alla destinazione'
          }
        ]
      };
      
      setOptimizationResults(results);
      setShowOptimizeModal(true);
    } catch (error) {
      console.error('Errore durante l\'ottimizzazione dei percorsi:', error);
    } finally {
      setOptimizationInProgress(false);
    }
  };

  // Funzione per applicare le ottimizzazioni suggerite
  const applyOptimizations = async () => {
    try {
      // Simuliamo una chiamata API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In una implementazione reale, qui chiameremmo le API
      // const response = await fetch('/api/routes/apply-optimizations', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ suggestions: optimizationResults.suggestions }),
      // });
      
      // Simuliamo l'applicazione delle ottimizzazioni
      setCouriers(prev => {
        const updated = [...prev];
        
        // Applica il riordino
        const reorderSuggestion = optimizationResults.suggestions.find(s => s.type === 'reorder');
        if (reorderSuggestion) {
          const courierIndex = updated.findIndex(c => c.id === reorderSuggestion.courierId);
          if (courierIndex !== -1) {
            const newDeliveries = [];
            reorderSuggestion.newOrder.forEach(delId => {
              const delivery = updated[courierIndex].deliveries.find(d => d.id === delId);
              if (delivery) newDeliveries.push(delivery);
            });
            updated[courierIndex] = {
              ...updated[courierIndex],
              deliveries: newDeliveries
            };
          }
        }
        
        // Applica lo scambio
        const exchangeSuggestion = optimizationResults.suggestions.find(s => s.type === 'exchange');
        if (exchangeSuggestion) {
          const fromCourierIndex = updated.findIndex(c => c.id === exchangeSuggestion.fromCourierId);
          const toCourierIndex = updated.findIndex(c => c.id === exchangeSuggestion.toCourierId);
          
          if (fromCourierIndex !== -1 && toCourierIndex !== -1) {
            const deliveryIndex = updated[fromCourierIndex].deliveries.findIndex(d => d.id === exchangeSuggestion.deliveryId);
            
            if (deliveryIndex !== -1) {
              const delivery = updated[fromCourierIndex].deliveries[deliveryIndex];
              
              // Rimuovi la consegna dal corriere di origine
              updated[fromCourierIndex] = {
                ...updated[fromCourierIndex],
                deliveries: updated[fromCourierIndex].deliveries.filter(d => d.id !== exchangeSuggestion.deliveryId)
              };
              
              // Aggiungi la consegna al corriere di destinazione
              updated[toCourierIndex] = {
                ...updated[toCourierIndex],
                deliveries: [...updated[toCourierIndex].deliveries, delivery]
              };
            }
          }
        }
        
        return updated;
      });
      
      setShowOptimizeModal(false);
      setOptimizationResults(null);
    } catch (error) {
      console.error('Errore durante l\'applicazione delle ottimizzazioni:', error);
    }
  };

  // Ottieni il corriere selezionato
  const selectedCourier = couriers.find(c => c.id === selectedCourierId);

  return (
    <Layout active="dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-800">Tracking in Tempo Reale</h2>
          <div className="flex space-x-2">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={optimizeRoutes}
              disabled={optimizationInProgress}
            >
              {optimizationInProgress ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ottimizzazione in corso...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Ottimizza Percorsi
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista corrieri */}
          <div className="lg:col-span-1 bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Corrieri Attivi
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {couriers.filter(c => c.status === 'active').length} corrieri in servizio
              </p>
            </div>
            
            {loading ? (
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">Caricamento corrieri...</p>
              </div>
            ) : couriers.length === 0 ? (
              <div className="px-4 py-5 sm:p-6 text-center">
                <p className="text-gray-500">Nessun corriere attivo</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {couriers.filter(c => c.status === 'active').map((courier) => (
                  <li 
                    key={courier.id}
                    className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${selectedCourierId === courier.id ? 'bg-primary-light' : ''}`}
                    onClick={() => setSelectedCourierId(courier.id === selectedCourierId ? null : courier.id)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                        {courier.firstName.charAt(0)}{courier.lastName.charAt(0)}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {courier.firstName} {courier.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {courier.deliveries.length} consegne assegnate
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-xs text-gray-500">
                              Ultimo aggiornamento:
                            </div>
                            <div className="text-xs font-medium">
                              {courier.location ? formatDate(courier.location.lastUpdated) : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Mappa */}
          <div className="lg:col-span-2 bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Mappa Corrieri
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Posizione in tempo reale
              </p>
            </div>
            
            <div className="h-96">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">Caricamento mappa...</p>
                </div>
              ) : (
                <MapComponent 
                  couriers={couriers.filter(c => c.status === 'active')} 
                  selectedCourierId={selectedCourierId}
                  onCourierSelect={setSelectedCourierId}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Dettagli corriere selezionato */}
        {selectedCourier && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Dettagli Corriere: {selectedCourier.firstName} {selectedCourier.lastName}
                </h3>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary bg-primary-light hover:bg-primary-lighter focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={() => setSelectedCourierId(null)}
                >
                  Chiudi
                </button>
              </div>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Consegne Assegnate</h4>
              
              {selectedCourier.deliveries.length === 0 ? (
                <p className="text-gray-500">Nessuna consegna assegnata</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ordine
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Indirizzo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stato
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ETA
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedCourier.deliveries.map((delivery) => {
                        const order = getOrderDetails(delivery.orderId);
                        return (
                          <tr key={delivery.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {delivery.orderId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.clientName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.address}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                                {translateStatus(delivery.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(delivery.eta)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={() => {
                    // In una implementazione reale, qui apriremmo un modal per riordinare le tappe
                    alert('Funzionalità di riordino tappe in sviluppo');
                  }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                  </svg>
                  Riordina Tappe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal per l'ottimizzazione dei percorsi */}
      {showOptimizeModal && optimizationResults && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Risultati Ottimizzazione
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        L'ottimizzazione dei percorsi può portare a un risparmio di tempo e distanza.
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <div className="bg-green-50 p-4 rounded-md">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Risparmi Stimati</h3>
                            <div className="mt-2 text-sm text-green-700">
                              <ul className="list-disc pl-5 space-y-1">
                                <li>Tempo: {optimizationResults.savings.time} minuti</li>
                                <li>Distanza: {optimizationResults.savings.distance} km</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900">Suggerimenti</h4>
                      <ul className="mt-2 divide-y divide-gray-200">
                        {optimizationResults.suggestions.map((suggestion, index) => (
                          <li key={index} className="py-2">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mt-0.5">
                                {suggestion.type === 'reorder' ? (
                                  <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                                  </svg>
                                )}
                              </div>
                              <div className="ml-3 text-sm">
                                <p className="font-medium text-gray-900">
                                  {suggestion.type === 'reorder' ? 'Riordina tappe' : 'Scambia consegna'}
                                </p>
                                <p className="text-gray-500">
                                  {suggestion.type === 'reorder' ? (
                                    `Corriere ${suggestion.courierId}: cambia ordine delle tappe`
                                  ) : (
                                    `Sposta consegna da ${suggestion.fromCourierId} a ${suggestion.toCourierId}`
                                  )}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {suggestion.reason}
                                </p>
                              </div>
                            </div>
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
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={applyOptimizations}
                >
                  Applica Ottimizzazioni
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowOptimizeModal(false);
                    setOptimizationResults(null);
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

export default LiveTracking;
