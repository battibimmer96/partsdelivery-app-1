// Implementazione del servizio di tracking in tempo reale
// Questo file gestisce il tracking della posizione dei corrieri e l'aggiornamento in tempo reale su Firestore

import { firebaseConfig } from '../config';
import { getFirestore, collection, doc, setDoc, updateDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as Location from 'expo-location';
import haversine from 'haversine';

class TrackingService {
  constructor() {
    this.db = getFirestore();
    this.auth = getAuth();
    this.locationWatchId = null;
    this.currentDelivery = null;
    this.deliveryPath = [];
    this.listeners = [];
  }

  // Inizia il tracking della posizione del corriere
  async startTracking() {
    try {
      // Richiedi i permessi di localizzazione
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permesso di accesso alla posizione negato');
      }

      // Ottieni l'ID del corriere corrente
      const courierId = this.auth.currentUser?.uid;
      if (!courierId) {
        throw new Error('Utente non autenticato');
      }

      // Configura le opzioni di tracking
      const locationOptions = {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Aggiorna ogni 5 secondi
        distanceInterval: 10, // O ogni 10 metri
      };

      // Inizia a tracciare la posizione
      this.locationWatchId = await Location.watchPositionAsync(
        locationOptions,
        (location) => this.updateCourierLocation(courierId, location)
      );

      console.log('Tracking della posizione avviato');
      return true;
    } catch (error) {
      console.error('Errore durante l\'avvio del tracking:', error);
      throw error;
    }
  }

  // Ferma il tracking della posizione
  stopTracking() {
    if (this.locationWatchId) {
      this.locationWatchId.remove();
      this.locationWatchId = null;
      console.log('Tracking della posizione fermato');
    }
  }

  // Aggiorna la posizione del corriere su Firestore
  async updateCourierLocation(courierId, location) {
    try {
      const { coords, timestamp } = location;
      const { latitude, longitude, altitude, heading, speed, accuracy } = coords;

      // Crea l'oggetto posizione
      const locationData = {
        latitude,
        longitude,
        altitude: altitude || 0,
        heading: heading || 0,
        speed: speed || 0,
        accuracy: accuracy || 0,
        timestamp,
        updatedAt: new Date().toISOString()
      };

      // Aggiorna la posizione del corriere su Firestore
      const courierRef = doc(this.db, 'couriers', courierId);
      await updateDoc(courierRef, {
        location: locationData,
        lastActive: new Date().toISOString()
      });

      // Se c'è una consegna in corso, aggiorna anche il percorso
      if (this.currentDelivery) {
        this.updateDeliveryPath(locationData);
      }

      return locationData;
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della posizione:', error);
      throw error;
    }
  }

  // Imposta la consegna corrente e inizia a tracciare il percorso
  setCurrentDelivery(deliveryId) {
    this.currentDelivery = deliveryId;
    this.deliveryPath = [];
    console.log(`Consegna corrente impostata: ${deliveryId}`);
  }

  // Aggiorna il percorso della consegna corrente
  async updateDeliveryPath(locationData) {
    if (!this.currentDelivery) return;

    try {
      // Aggiungi la posizione al percorso locale
      this.deliveryPath.push(locationData);

      // Aggiorna il percorso su Firestore
      const deliveryRef = doc(this.db, 'deliveries', this.currentDelivery);
      await updateDoc(deliveryRef, {
        courierPath: this.deliveryPath,
        courierLocation: locationData,
        updatedAt: new Date().toISOString()
      });

      // Calcola e aggiorna l'ETA
      await this.updateETA(this.currentDelivery, locationData);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del percorso:', error);
      throw error;
    }
  }

  // Calcola e aggiorna l'ETA (Estimated Time of Arrival)
  async updateETA(deliveryId, currentLocation) {
    try {
      // Ottieni i dettagli della consegna
      const deliveryRef = doc(this.db, 'deliveries', deliveryId);
      const deliverySnap = await getDoc(deliveryRef);
      
      if (!deliverySnap.exists()) {
        throw new Error(`Consegna ${deliveryId} non trovata`);
      }
      
      const delivery = deliverySnap.data();
      
      // Se non ci sono coordinate di destinazione, non possiamo calcolare l'ETA
      if (!delivery.destination || !delivery.destination.latitude || !delivery.destination.longitude) {
        return;
      }
      
      // Calcola la distanza rimanente
      const start = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      };
      
      const end = {
        latitude: delivery.destination.latitude,
        longitude: delivery.destination.longitude
      };
      
      const distanceInKm = haversine(start, end, { unit: 'km' });
      
      // Stima la velocità media (in km/h)
      let averageSpeed = 30; // Velocità predefinita in città
      
      // Se abbiamo abbastanza punti nel percorso, calcoliamo la velocità media
      if (this.deliveryPath.length >= 2) {
        const recentPoints = this.deliveryPath.slice(-5); // Ultimi 5 punti
        let totalSpeed = 0;
        let validSpeedPoints = 0;
        
        for (const point of recentPoints) {
          if (point.speed > 0) {
            totalSpeed += point.speed;
            validSpeedPoints++;
          }
        }
        
        if (validSpeedPoints > 0) {
          // Converti da m/s a km/h
          averageSpeed = (totalSpeed / validSpeedPoints) * 3.6;
        }
      }
      
      // Calcola il tempo stimato in minuti
      const timeInMinutes = (distanceInKm / averageSpeed) * 60;
      
      // Aggiungi un fattore di correzione per il traffico (es. +20%)
      const adjustedTimeInMinutes = timeInMinutes * 1.2;
      
      // Calcola l'orario di arrivo stimato
      const now = new Date();
      const eta = new Date(now.getTime() + adjustedTimeInMinutes * 60000);
      
      // Aggiorna l'ETA su Firestore
      await updateDoc(deliveryRef, {
        eta: eta.toISOString(),
        estimatedTimeMinutes: Math.round(adjustedTimeInMinutes),
        remainingDistanceKm: distanceInKm.toFixed(2),
        updatedAt: now.toISOString()
      });
      
      console.log(`ETA aggiornato per la consegna ${deliveryId}: ${eta.toLocaleString()}`);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dell\'ETA:', error);
      throw error;
    }
  }

  // Genera un link di tracking per il cliente
  async generateTrackingLink(deliveryId) {
    try {
      // Genera un token univoco per il tracking
      const trackingToken = this.generateRandomToken();
      
      // Aggiorna la consegna con il token di tracking
      const deliveryRef = doc(this.db, 'deliveries', deliveryId);
      await updateDoc(deliveryRef, {
        trackingToken,
        trackingEnabled: true,
        trackingCreatedAt: new Date().toISOString()
      });
      
      // Costruisci e restituisci il link di tracking
      const trackingLink = `https://partsdelivery-45c01.web.app/tracking/${trackingToken}`;
      return trackingLink;
    } catch (error) {
      console.error('Errore durante la generazione del link di tracking:', error);
      throw error;
    }
  }

  // Genera un token casuale per il tracking
  generateRandomToken(length = 20) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Ascolta gli aggiornamenti della posizione di un corriere
  listenToCourierLocation(courierId, callback) {
    try {
      const courierRef = doc(this.db, 'couriers', courierId);
      const unsubscribe = onSnapshot(courierRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data.location) {
            callback(data.location);
          }
        }
      });
      
      // Aggiungi il listener alla lista
      this.listeners.push(unsubscribe);
      
      return unsubscribe;
    } catch (error) {
      console.error('Errore durante l\'ascolto della posizione del corriere:', error);
      throw error;
    }
  }

  // Ascolta gli aggiornamenti di una consegna
  listenToDelivery(deliveryId, callback) {
    try {
      const deliveryRef = doc(this.db, 'deliveries', deliveryId);
      const unsubscribe = onSnapshot(deliveryRef, (doc) => {
        if (doc.exists()) {
          callback(doc.data());
        }
      });
      
      // Aggiungi il listener alla lista
      this.listeners.push(unsubscribe);
      
      return unsubscribe;
    } catch (error) {
      console.error('Errore durante l\'ascolto della consegna:', error);
      throw error;
    }
  }

  // Rimuovi tutti i listener
  removeAllListeners() {
    for (const unsubscribe of this.listeners) {
      unsubscribe();
    }
    this.listeners = [];
    console.log('Tutti i listener rimossi');
  }
}

export default new TrackingService();
