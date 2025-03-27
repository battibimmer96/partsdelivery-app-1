// Servizio per la gestione delle notifiche e funzioni cloud per l'app di logistica ricambi auto
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseConfig } from '../config.js';

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
let messaging = null;

// Inizializza Firebase Cloud Messaging solo in ambiente browser
if (typeof window !== 'undefined' && window.navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Errore durante l\'inizializzazione di Firebase Cloud Messaging:', error);
  }
}

/**
 * Servizio per la gestione delle notifiche e funzioni cloud
 */
class NotificationService {
  /**
   * Richiede il permesso per le notifiche push e ottiene il token FCM
   * @returns {Promise<string|null>} - Token FCM o null se non disponibile
   */
  async requestNotificationPermission() {
    if (!messaging) return null;
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Ottieni il token FCM
        const token = await getToken(messaging, {
          vapidKey: 'YOUR_VAPID_KEY' // Da sostituire con la chiave VAPID reale
        });
        
        return token;
      } else {
        console.log('Permesso notifiche negato');
        return null;
      }
    } catch (error) {
      console.error('Errore durante la richiesta del permesso per le notifiche:', error);
      return null;
    }
  }
  
  /**
   * Registra un handler per le notifiche in foreground
   * @param {Function} callback - Funzione da chiamare quando arriva una notifica
   * @returns {Function|null} - Funzione per rimuovere il listener o null se non disponibile
   */
  onForegroundMessage(callback) {
    if (!messaging) return null;
    
    return onMessage(messaging, (payload) => {
      callback(payload);
    });
  }
  
  /**
   * Calcola l'ETA (Estimated Time of Arrival) per una consegna
   * @param {Object} originCoords - Coordinate di origine {latitude, longitude}
   * @param {Object} destinationCoords - Coordinate di destinazione {latitude, longitude}
   * @param {string} mode - Modalità di trasporto ('driving', 'walking', 'bicycling', 'transit')
   * @returns {Promise<Object>} - Oggetto con durata e distanza
   */
  async calculateETA(originCoords, destinationCoords, mode = 'driving') {
    try {
      // In una implementazione reale, questa funzione chiamerebbe Google Distance Matrix API
      // tramite Cloud Functions. Per ora, simuliamo una risposta.
      
      // Simulazione di una risposta
      const distance = this._calculateHaversineDistance(
        originCoords.latitude, 
        originCoords.longitude, 
        destinationCoords.latitude, 
        destinationCoords.longitude
      );
      
      // Velocità media in km/h per modalità di trasporto
      const speeds = {
        driving: 50,
        walking: 5,
        bicycling: 15,
        transit: 30
      };
      
      // Calcolo durata in secondi
      const speedKmH = speeds[mode] || speeds.driving;
      const durationSeconds = (distance / speedKmH) * 3600;
      
      return {
        distance: {
          value: distance * 1000, // Conversione in metri
          text: `${distance.toFixed(1)} km`
        },
        duration: {
          value: durationSeconds,
          text: this._formatDuration(durationSeconds)
        }
      };
    } catch (error) {
      console.error('Errore durante il calcolo dell\'ETA:', error);
      throw error;
    }
  }
  
  /**
   * Calcola la distanza tra due punti usando la formula dell'emisenoverso
   * @private
   */
  _calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raggio della Terra in km
    const dLat = this._deg2rad(lat2 - lat1);
    const dLon = this._deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this._deg2rad(lat1)) * Math.cos(this._deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distanza in km
    return distance;
  }
  
  /**
   * Converte gradi in radianti
   * @private
   */
  _deg2rad(deg) {
    return deg * (Math.PI/180);
  }
  
  /**
   * Formatta la durata in secondi in un formato leggibile
   * @private
   */
  _formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    } else {
      return `${minutes} min`;
    }
  }
  
  /**
   * Genera un link di tracking univoco per un ordine
   * @param {string} orderId - ID dell'ordine
   * @returns {string} - Link di tracking
   */
  generateTrackingLink(orderId) {
    // In una implementazione reale, genereremmo un token sicuro
    // e lo salveremmo nel database associato all'ordine
    const baseUrl = 'https://partsdelivery-45c01.web.app/tracking';
    const trackingId = Buffer.from(orderId).toString('base64');
    return `${baseUrl}/${trackingId}`;
  }
}

export default new NotificationService();
