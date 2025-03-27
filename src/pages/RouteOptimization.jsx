import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import RouteOptimizationService from '../../backend/firebase/services/RouteOptimizationService';
import { googleMapsConfig } from '../../backend/firebase/config';

const RouteOptimization = () => {
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [selectedCourierId, setSelectedCourierId] = useState(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [applyingChanges, setApplyingChanges] = useState(false);

  // Funzione per ottimizzare tutti i percorsi
  const optimizeAllRoutes = async () => {
    try {
      setOptimizing(true);
      
      // Chiama il servizio di ottimizzazione
      const results = await RouteOptimizationService.optimizeAllRoutes();
      
      setOptimizationResults(results);
    } catch (error) {
      console.error('Errore durante l\'ottimizzazione dei percorsi:', error);
      alert('Si è verificato un errore durante l\'ottimizzazione dei percorsi.');
    } finally {
      setOptimizing(false);
    }
  };

  // Funzione per applicare l'ottimizzazione per un corriere
  const applyOptimization = async (courierId, optimizedRoute) => {
    try {
      setApplyingChanges(true);
      
      // Applica l'ottimizzazione
      await RouteOptimizationService.applyRouteOptimization(courierId, optimizedRoute);
      
      // Aggiorna i risultati
      setOptimizationResults(prev => {
        if (!prev) return null;
        
        const updatedResults = {
          ...prev,
          courierOptimizations: prev.courierOptimizations.map(result => {
            if (result.courierId === courierId) {
              return {
                ...result,
                applied: true
              };
            }
            return result;
          })
        };
        
        return updatedResults;
      });
      
      alert('Ottimizzazione applicata con successo!');
    } catch (error) {
      console.error('Errore durante l\'applicazione dell\'ottimizzazione:', error);
      alert('Si è verificato un errore durante l\'applicazione dell\'ottimizzazione.');
    } finally {
      setApplyingChanges(false);
    }
  };

  // Funzione per applicare uno scambio
  const applyExchange = async (exchange) => {
    try {
      setApplyingChanges(true);
      
      // Applica lo scambio
      await RouteOptimizationService.applyExchange(exchange);
      
      // Aggiorna i risultati
      setOptimizationResults(prev => {
        if (!prev) return null;
        
        const updatedExchanges = prev.exchangeSuggestions.filter(e => 
          !(e.courier1.id === exchange.courier1.id && 
            e.courier2.id === exchange.courier2.id && 
            e.delivery1.id === exchange.delivery1.id && 
            e.delivery2.id === exchange.delivery2.id)
        );
        
        return {
          ...prev,
          exchangeSuggestions: updatedExchanges
        };
      });
      
      setShowExchangeModal(false);
      setSelectedExchange(null);
      
      alert('Scambio applicato con successo!');
    } catch (error) {
      console.error('Errore durante l\'applicazione dello scambio:', error);
      alert('Si è verificato un errore durante l\'applicazione dello scambio.');
    } finally {
      setApplyingChanges(false);
    }
  };

  // Funzione per visualizzare i dettagli di un corriere
  const viewCourierDetails = (courierId) => {
    setSelectedCourierId(courierId === selectedCourierId ? null : courierId);
  };

  // Funzione per visualizzare i dettagli di uno scambio
  const viewExchangeDetails = (exchange) => {
    setSelectedExchange(exchange);
    setShowExchangeModal(true);
  };

  return (
    <Layout active="optimization">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-800">Ottimizzazione Percorsi</h2>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={optimizeAllRoutes}
            disabled={optimizing}
          >
            {optimizing ? (
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
                Ottimizza Tutti i Percorsi
              </>
            )}
          </button>
        </div>
        
        {optimizationResults && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Risultati Ottimizzazione
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Risparmi totali stimati: {optimizationResults.totalSavings.time} minuti e {optimizationResults.totalSavings.distance} km
              </p>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Ottimizzazioni per Corriere</h4>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Corriere
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stato
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Metodo
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risparmi
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Azioni</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {optimizationResults.courierOptimizations.map((result) => (
                      <tr key={result.courierId} className={selectedCourierId === result.courierId ? 'bg-primary-light' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {result.courierName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {result.courierId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {result.optimized ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Ottimizzato
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Non ottimizzato
                            </span>
                          )}
                          {result.applied && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Applicato
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.optimized ? (
                            result.method === 'recurrent_route' ? 'Percorso ricorrente' : 'Matrice distanze'
                          ) : (
                            result.reason || 'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.optimized && result.savings ? (
                            <div>
                              <div className="text-green-600">
                                {result.savings.time} minuti
                              </div>
                              <div className="text-green-600">
                                {result.savings.distance} km
                              </div>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            className="text-primary hover:text-primary-dark mr-4"
                            onClick={() => viewCourierDetails(result.courierId)}
                          >
                            {selectedCourierId === result.courierId ? 'Nascondi' : 'Dettagli'}
                          </button>
                          
                          {result.optimized && !result.applied && (
                            <button
                              type="button"
                              className="text-green-600 hover:text-green-800"
                              onClick={() => applyOptimization(result.courierId, result.optimizedRoute)}
                              disabled={applyingChanges}
                            >
                              {applyingChanges ? 'Applicando...' : 'Applica'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {selectedCourierId && (
                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                  <h5 className="text-md font-medium text-gray-900 mb-2">
                    Dettagli Ottimizzazione
                  </h5>
                  
                  {(() => {
                    const result = optimizationResults.courierOptimizations.find(r => r.courierId === selectedCourierId);
                    
                    if (!result || !result.optimized) {
                      return (
                        <p className="text-sm text-gray-500">
                          Nessun dettaglio disponibile per questo corriere.
                        </p>
                      );
                    }
                    
                    return (
                      <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-1">
                          Percorso Originale:
                        </h6>
                        <div className="mb-4 overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  #
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Cliente
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Indirizzo
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Stato
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {result.originalRoute.map((delivery, index) => (
                                <tr key={delivery.id}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {index + 1}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {delivery.clientName}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {delivery.address}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                      delivery.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {delivery.status === 'pending' ? 'In attesa' : 
                                       delivery.status === 'in_progress' ? 'In corso' : 
                                       'Completato'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <h6 className="text-sm font-medium text-gray-700 mb-1">
                          Percorso Ottimizzato:
                        </h6>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  #
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Cliente
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Indirizzo
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Stato
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {result.optimizedRoute.map((delivery, index) => (
                                <tr key={delivery.id}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {index + 1}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {delivery.clientName}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {delivery.address}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                      delivery.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {delivery.status === 'pending' ? 'In attesa' : 
                                       delivery.status === 'in_progress' ? 'In corso' : 
                                       'Completato'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              {optimizationResults.exchangeSuggestions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Suggerimenti di Scambio</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Corrieri
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Consegne
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Risparmi
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Azioni</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {optimizationResults.exchangeSuggestions.map((exchange, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {exchange.courier1.name} ↔ {exchange.courier2.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {exchange.delivery1.clientName} ↔ {exchange.delivery2.clientName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {exchange.delivery1.address} ↔ {exchange.delivery2.address}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="text-green-600">
                                {exchange.timeSaving} minuti
                              </div>
                              <div className="text-green-600">
                                {exchange.distanceSaving} km
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                type="button"
                                className="text-primary hover:text-primary-dark mr-4"
                                onClick={() => viewExchangeDetails(exchange)}
                              >
                                Dettagli
                              </button>
                              
                              <button
                                type="button"
                                className="text-green-600 hover:text-green-800"
                                onClick={() => applyExchange(exchange)}
                                disabled={applyingChanges}
                              >
                                {applyingChanges ? 'Applicando...' : 'Applica'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!optimizationResults && !optimizing && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun risultato di ottimizzazione</h3>
              <p className="mt-1 text-sm text-gray-500">
                Clicca sul pulsante "Ottimizza Tutti i Percorsi" per iniziare.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal per i dettagli dello scambio */}
      {showExchangeModal && selectedExchange && (
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Dettagli Scambio
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Questo scambio può portare a un risparmio di {selectedExchange.timeSaving} minuti e {selectedExchange.distanceSaving} km.
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Corrieri coinvolti:</h4>
                      <div className="bg-gray-50 p-3 rounded-md mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-gray-900">
                            {selectedExchange.courier1.name}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedExchange.courier2.name}
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                          </svg>
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Consegne da scambiare:</h4>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="mb-2">
                          <div className="text-sm font-medium text-gray-900">
                            {selectedExchange.delivery1.clientName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedExchange.delivery1.address}
                          </div>
                        </div>
                        <div className="flex items-center justify-center my-2">
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedExchange.delivery2.clientName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedExchange.delivery2.address}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => applyExchange(selectedExchange)}
                  disabled={applyingChanges}
                >
                  {applyingChanges ? 'Applicando...' : 'Applica Scambio'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowExchangeModal(false);
                    setSelectedExchange(null);
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

export default RouteOptimization;
