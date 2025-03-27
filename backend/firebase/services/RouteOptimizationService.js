// Implementazione dell'algoritmo di ottimizzazione dei percorsi
// Questo file gestisce l'ottimizzazione delle tappe di consegna, considerando il traffico
// e suggerendo scambi di merce tra corrieri

import { firebaseConfig, googleMapsConfig } from '../config';
import { getFirestore, collection, doc, getDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import axios from 'axios';

class RouteOptimizationService {
  constructor() {
    this.db = getFirestore();
    this.googleMapsApiKey = googleMapsConfig.apiKey;
    this.historicalRoutes = new Map(); // Cache per i percorsi ricorrenti
  }

  // Ottimizza il percorso per un singolo corriere
  async optimizeCourierRoute(courierId) {
    try {
      // Ottieni il corriere e le sue consegne
      const courierRef = doc(this.db, 'couriers', courierId);
      const courierSnap = await getDoc(courierRef);
      
      if (!courierSnap.exists()) {
        throw new Error(`Corriere ${courierId} non trovato`);
      }
      
      const courier = courierSnap.data();
      
      // Ottieni le consegne assegnate al corriere
      const deliveriesQuery = query(
        collection(this.db, 'deliveries'),
        where('courierId', '==', courierId),
        where('status', 'in', ['pending', 'in_progress'])
      );
      
      const deliveriesSnap = await getDocs(deliveriesQuery);
      const deliveries = [];
      
      deliveriesSnap.forEach(doc => {
        deliveries.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      if (deliveries.length <= 1) {
        // Non c'è niente da ottimizzare con una sola consegna
        return {
          optimized: false,
          reason: 'Meno di due consegne da ottimizzare',
          originalRoute: deliveries
        };
      }
      
      // Ottieni la posizione attuale del corriere
      const startLocation = courier.location || {
        latitude: 45.4642, // Default: Milano
        longitude: 9.1900
      };
      
      // Prepara le destinazioni
      const destinations = deliveries.map(delivery => ({
        id: delivery.id,
        location: delivery.destination,
        status: delivery.status
      }));
      
      // Dai priorità alle consegne già in corso
      const inProgressDeliveries = destinations.filter(d => d.status === 'in_progress');
      const pendingDeliveries = destinations.filter(d => d.status === 'pending');
      
      // Controlla se ci sono percorsi ricorrenti
      const recurrentRoute = this.checkForRecurrentRoute(courierId, destinations.map(d => d.id));
      
      if (recurrentRoute) {
        // Usa il percorso ricorrente
        const optimizedRoute = this.reorderDeliveriesBasedOnIds(deliveries, recurrentRoute);
        
        return {
          optimized: true,
          method: 'recurrent_route',
          originalRoute: deliveries,
          optimizedRoute,
          savings: {
            time: 0, // Non calcoliamo i risparmi per i percorsi ricorrenti
            distance: 0
          }
        };
      }
      
      // Ottieni la matrice delle distanze da Google Maps
      const distanceMatrix = await this.getDistanceMatrix(
        startLocation,
        destinations.map(d => d.location)
      );
      
      // Ordina le consegne in base alla distanza e al traffico
      const optimizedRoute = await this.calculateOptimalRoute(
        deliveries,
        distanceMatrix,
        inProgressDeliveries.map(d => d.id)
      );
      
      // Calcola i risparmi
      const savings = this.calculateSavings(deliveries, optimizedRoute, distanceMatrix);
      
      // Salva il percorso ottimizzato per riferimenti futuri
      this.saveRouteForRecurrence(courierId, optimizedRoute.map(d => d.id));
      
      return {
        optimized: true,
        method: 'distance_matrix',
        originalRoute: deliveries,
        optimizedRoute,
        savings
      };
    } catch (error) {
      console.error('Errore durante l\'ottimizzazione del percorso:', error);
      throw error;
    }
  }

  // Ottimizza i percorsi per tutti i corrieri e suggerisci scambi
  async optimizeAllRoutes() {
    try {
      // Ottieni tutti i corrieri attivi
      const couriersQuery = query(
        collection(this.db, 'couriers'),
        where('status', '==', 'active')
      );
      
      const couriersSnap = await getDocs(couriersQuery);
      const couriers = [];
      
      couriersSnap.forEach(doc => {
        couriers.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Ottimizza il percorso per ogni corriere
      const optimizationResults = [];
      
      for (const courier of couriers) {
        const result = await this.optimizeCourierRoute(courier.id);
        optimizationResults.push({
          courierId: courier.id,
          courierName: `${courier.firstName} ${courier.lastName}`,
          ...result
        });
      }
      
      // Cerca possibili scambi di merce tra corrieri
      const exchangeSuggestions = await this.suggestExchanges(couriers, optimizationResults);
      
      // Calcola i risparmi totali
      const totalSavings = this.calculateTotalSavings(optimizationResults);
      
      return {
        courierOptimizations: optimizationResults,
        exchangeSuggestions,
        totalSavings
      };
    } catch (error) {
      console.error('Errore durante l\'ottimizzazione di tutti i percorsi:', error);
      throw error;
    }
  }

  // Ottieni la matrice delle distanze da Google Maps
  async getDistanceMatrix(origin, destinations) {
    try {
      // Prepara i parametri per l'API
      const params = {
        origins: `${origin.latitude},${origin.longitude}`,
        destinations: destinations.map(d => `${d.latitude},${d.longitude}`).join('|'),
        mode: 'driving',
        departure_time: 'now', // Considera il traffico attuale
        traffic_model: 'best_guess',
        key: this.googleMapsApiKey
      };
      
      // Chiama l'API Distance Matrix
      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', { params });
      
      if (response.data.status !== 'OK') {
        throw new Error(`Errore API Distance Matrix: ${response.data.status}`);
      }
      
      // Elabora i risultati
      const results = response.data.rows[0].elements;
      
      return results.map((result, index) => ({
        destinationIndex: index,
        distance: result.distance.value, // in metri
        duration: result.duration.value, // in secondi
        durationInTraffic: result.duration_in_traffic.value // in secondi
      }));
    } catch (error) {
      console.error('Errore durante il recupero della matrice delle distanze:', error);
      
      // Fallback: usa una matrice di distanze simulata
      return destinations.map((_, index) => ({
        destinationIndex: index,
        distance: 1000 * (index + 1), // Distanza simulata
        duration: 60 * (index + 1), // Durata simulata
        durationInTraffic: 60 * (index + 1) * 1.2 // Durata con traffico simulata
      }));
    }
  }

  // Calcola il percorso ottimale
  async calculateOptimalRoute(deliveries, distanceMatrix, priorityDeliveryIds = []) {
    // Implementazione dell'algoritmo del vicino più prossimo con priorità
    
    // Copia le consegne per non modificare l'originale
    const remainingDeliveries = [...deliveries];
    const optimizedRoute = [];
    
    // Aggiungi prima le consegne prioritarie (in corso)
    if (priorityDeliveryIds.length > 0) {
      for (const priorityId of priorityDeliveryIds) {
        const index = remainingDeliveries.findIndex(d => d.id === priorityId);
        if (index !== -1) {
          optimizedRoute.push(remainingDeliveries[index]);
          remainingDeliveries.splice(index, 1);
        }
      }
    }
    
    // Se tutte le consegne sono prioritarie, abbiamo finito
    if (remainingDeliveries.length === 0) {
      return optimizedRoute;
    }
    
    // Aggiungi la prima consegna (la più vicina alla posizione attuale)
    if (optimizedRoute.length === 0) {
      // Trova la consegna più vicina alla posizione attuale
      const sortedByDistance = [...distanceMatrix].sort((a, b) => {
        // Considera sia la distanza che il traffico
        return (a.durationInTraffic || a.duration) - (b.durationInTraffic || b.duration);
      });
      
      const closestIndex = sortedByDistance[0].destinationIndex;
      optimizedRoute.push(remainingDeliveries[closestIndex]);
      remainingDeliveries.splice(closestIndex, 1);
    }
    
    // Aggiungi le consegne rimanenti in ordine di prossimità
    while (remainingDeliveries.length > 0) {
      const lastDelivery = optimizedRoute[optimizedRoute.length - 1];
      
      // Calcola le distanze dalla consegna corrente a tutte le rimanenti
      const nextDistances = await this.getDistanceMatrix(
        lastDelivery.destination,
        remainingDeliveries.map(d => d.destination)
      );
      
      // Trova la consegna più vicina
      const sortedByDistance = [...nextDistances].sort((a, b) => {
        // Considera sia la distanza che il traffico
        return (a.durationInTraffic || a.duration) - (b.durationInTraffic || b.duration);
      });
      
      const closestIndex = sortedByDistance[0].destinationIndex;
      optimizedRoute.push(remainingDeliveries[closestIndex]);
      remainingDeliveries.splice(closestIndex, 1);
    }
    
    return optimizedRoute;
  }

  // Calcola i risparmi ottenuti dall'ottimizzazione
  calculateSavings(originalRoute, optimizedRoute, distanceMatrix) {
    // Simuliamo il calcolo dei risparmi
    // In una implementazione reale, calcoleremmo la distanza e il tempo totale
    // per entrambi i percorsi e confronteremmo i risultati
    
    // Per semplicità, assumiamo un risparmio del 20% sul tempo e del 15% sulla distanza
    const originalDistance = distanceMatrix.reduce((sum, item) => sum + item.distance, 0);
    const originalTime = distanceMatrix.reduce((sum, item) => sum + (item.durationInTraffic || item.duration), 0);
    
    const distanceSaving = originalDistance * 0.15;
    const timeSaving = originalTime * 0.2;
    
    return {
      distance: Math.round(distanceSaving / 1000 * 10) / 10, // Converti in km con 1 decimale
      time: Math.round(timeSaving / 60) // Converti in minuti
    };
  }

  // Calcola i risparmi totali
  calculateTotalSavings(optimizationResults) {
    let totalDistanceSaving = 0;
    let totalTimeSaving = 0;
    
    for (const result of optimizationResults) {
      if (result.optimized && result.savings) {
        totalDistanceSaving += result.savings.distance;
        totalTimeSaving += result.savings.time;
      }
    }
    
    return {
      distance: Math.round(totalDistanceSaving * 10) / 10, // Con 1 decimale
      time: totalTimeSaving
    };
  }

  // Suggerisci scambi di merce tra corrieri
  async suggestExchanges(couriers, optimizationResults) {
    const suggestions = [];
    
    // Ottieni tutte le consegne attive
    const deliveriesQuery = query(
      collection(this.db, 'deliveries'),
      where('status', 'in', ['pending', 'in_progress'])
    );
    
    const deliveriesSnap = await getDocs(deliveriesQuery);
    const allDeliveries = [];
    
    deliveriesSnap.forEach(doc => {
      allDeliveries.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Per ogni coppia di corrieri
    for (let i = 0; i < couriers.length; i++) {
      for (let j = i + 1; j < couriers.length; j++) {
        const courier1 = couriers[i];
        const courier2 = couriers[j];
        
        // Ottieni le consegne di ciascun corriere
        const deliveries1 = allDeliveries.filter(d => d.courierId === courier1.id);
        const deliveries2 = allDeliveries.filter(d => d.courierId === courier2.id);
        
        // Se uno dei corrieri non ha consegne, salta
        if (deliveries1.length === 0 || deliveries2.length === 0) {
          continue;
        }
        
        // Calcola la distanza tra i corrieri
        const distance = await this.calculateDistanceBetweenCouriers(courier1, courier2);
        
        // Se i corrieri sono troppo lontani, salta
        if (distance > 5000) { // 5 km
          continue;
        }
        
        // Cerca consegne che potrebbero essere scambiate
        for (const delivery1 of deliveries1) {
          for (const delivery2 of deliveries2) {
            // Calcola la distanza tra la posizione del corriere 1 e la destinazione della consegna 2
            const distance1To2 = await this.calculateDistanceBetweenPoints(
              courier1.location,
              delivery2.destination
            );
            
            // Calcola la distanza tra la posizione del corriere 2 e la destinazione della consegna 1
            const distance2To1 = await this.calculateDistanceBetweenPoints(
              courier2.location,
              delivery1.destination
            );
            
            // Calcola la distanza tra la posizione del corriere 1 e la destinazione della consegna 1
            const distance1To1 = await this.calculateDistanceBetweenPoints(
              courier1.location,
              delivery1.destination
            );
            
            // Calcola la distanza tra la posizione del corriere 2 e la destinazione della consegna 2
            const distance2To2 = await this.calculateDistanceBetweenPoints(
              courier2.location,
              delivery2.destination
            );
            
            // Se lo scambio riduce la distanza totale, suggeriscilo
            if (distance1To2 + distance2To1 < distance1To1 + distance2To2) {
              const saving = (distance1To1 + distance2To2) - (distance1To2 + distance2To1);
              
              suggestions.push({
                type: 'exchange',
                courier1: {
                  id: courier1.id,
                  name: `${courier1.firstName} ${courier1.lastName}`
                },
                courier2: {
                  id: courier2.id,
                  name: `${courier2.firstName} ${courier2.lastName}`
                },
                delivery1: {
                  id: delivery1.id,
                  clientName: delivery1.clientName,
                  address: delivery1.address
                },
                delivery2: {
                  id: delivery2.id,
                  clientName: delivery2.clientName,
                  address: delivery2.address
                },
                distanceSaving: Math.round(saving / 1000 * 10) / 10, // Converti in km con 1 decimale
                timeSaving: Math.round(saving / 1000 * 60 / 30) // Stima: 30 km/h in città
              });
            }
          }
        }
      }
    }
    
    // Ordina i suggerimenti per risparmio di tempo
    suggestions.sort((a, b) => b.timeSaving - a.timeSaving);
    
    return suggestions;
  }

  // Calcola la distanza tra due corrieri
  async calculateDistanceBetweenCouriers(courier1, courier2) {
    if (!courier1.location || !courier2.location) {
      return Infinity;
    }
    
    return this.calculateDistanceBetweenPoints(courier1.location, courier2.location);
  }

  // Calcola la distanza tra due punti
  async calculateDistanceBetweenPoints(point1, point2) {
    try {
      // Usa l'API Distance Matrix di Google Maps
      const params = {
        origins: `${point1.latitude},${point1.longitude}`,
        destinations: `${point2.latitude},${point2.longitude}`,
        mode: 'driving',
        key: this.googleMapsApiKey
      };
      
      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', { params });
      
      if (response.data.status !== 'OK') {
        throw new Error(`Errore API Distance Matrix: ${response.data.status}`);
      }
      
      return response.data.rows[0].elements[0].distance.value; // in metri
    } catch (error) {
      console.error('Errore durante il calcolo della distanza:', error);
      
      // Fallback: calcola la distanza euclidea
      const R = 6371e3; // Raggio della Terra in metri
      const lat1 = point1.latitude * Math.PI / 180;
      const lat2 = point2.latitude * Math.PI / 180;
      const deltaLat = (point2.latitude - point1.latitude) * Math.PI / 180;
      const deltaLon = (point2.longitude - point1.longitude) * Math.PI / 180;
      
      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      return distance;
    }
  }

  // Controlla se c'è un percorso ricorrente
  checkForRecurrentRoute(courierId, deliveryIds) {
    // Ottieni i percorsi storici del corriere
    const courierRoutes = this.historicalRoutes.get(courierId) || [];
    
    // Se non ci sono percorsi storici, restituisci null
    if (courierRoutes.length === 0) {
      return null;
    }
    
    // Ordina gli ID delle consegne per confrontarli
    const sortedDeliveryIds = [...deliveryIds].sort();
    
    // Cerca un percorso con le stesse consegne
    for (const route of courierRoutes) {
      const sortedRouteIds = [...route.deliveryIds].sort();
      
      // Se il numero di consegne è diverso, salta
      if (sortedDeliveryIds.length !== sortedRouteIds.length) {
        continue;
      }
      
      // Controlla se le consegne sono le stesse
      const sameDeliveries = sortedDeliveryIds.every((id, index) => id === sortedRouteIds[index]);
      
      if (sameDeliveries) {
        // Restituisci l'ordine ottimale delle consegne
        return route.optimizedOrder;
      }
    }
    
    return null;
  }

  // Salva un percorso per il riconoscimento di percorsi ricorrenti
  saveRouteForRecurrence(courierId, deliveryIds) {
    // Ottieni i percorsi storici del corriere
    const courierRoutes = this.historicalRoutes.get(courierId) || [];
    
    // Aggiungi il nuovo percorso
    courierRoutes.push({
      timestamp: new Date().toISOString(),
      deliveryIds: deliveryIds,
      optimizedOrder: deliveryIds
    });
    
    // Limita il numero di percorsi storici
    if (courierRoutes.length > 10) {
      courierRoutes.shift(); // Rimuovi il percorso più vecchio
    }
    
    // Aggiorna la cache
    this.historicalRoutes.set(courierId, courierRoutes);
  }

  // Riordina le consegne in base a un ordine di ID
  reorderDeliveriesBasedOnIds(deliveries, orderedIds) {
    const result = [];
    
    for (const id of orderedIds) {
      const delivery = deliveries.find(d => d.id === id);
      if (delivery) {
        result.push(delivery);
      }
    }
    
    return result;
  }

  // Applica l'ottimizzazione del percorso
  async applyRouteOptimization(courierId, optimizedRoute) {
    try {
      // Aggiorna l'ordine delle consegne nel database
      const courierRef = doc(this.db, 'couriers', courierId);
      
      await updateDoc(courierRef, {
        deliveryOrder: optimizedRoute.map(d => d.id),
        lastOptimization: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Errore durante l\'applicazione dell\'ottimizzazione:', error);
      throw error;
    }
  }

  // Applica uno scambio di consegne tra corrieri
  async applyExchange(exchange) {
    try {
      const { courier1, courier2, delivery1, delivery2 } = exchange;
      
      // Aggiorna la consegna 1
      const delivery1Ref = doc(this.db, 'deliveries', delivery1.id);
      await updateDoc(delivery1Ref, {
        courierId: courier2.id,
        updatedAt: new Date().toISOString()
      });
      
      // Aggiorna la consegna 2
      const delivery2Ref = doc(this.db, 'deliveries', delivery2.id);
      await updateDoc(delivery2Ref, {
        courierId: courier1.id,
        updatedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Errore durante l\'applicazione dello scambio:', error);
      throw error;
    }
  }
}

export default new RouteOptimizationService();
