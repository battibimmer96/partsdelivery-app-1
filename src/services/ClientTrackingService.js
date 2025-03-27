// Implementazione del servizio di tracking lato client
// Questo file gestisce la visualizzazione del tracking per il cliente

import { firebaseConfig } from '../config';
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';

class ClientTrackingService {
  constructor() {
    this.db = getFirestore();
    this.listeners = [];
  }

  // Ottieni i dettagli di una consegna tramite token di tracking
  async getDeliveryByToken(trackingToken) {
    try {
      // Query per trovare la consegna con il token specificato
      const q = query(
        collection(this.db, 'deliveries'),
        where('trackingToken', '==', trackingToken),
        where('trackingEnabled', '==', true),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Link di tracking non valido o scaduto');
      }
      
      // Restituisci i dati della consegna
      const deliveryDoc = querySnapshot.docs[0];
      return {
        id: deliveryDoc.id,
        ...deliveryDoc.data()
      };
    } catch (error) {
      console.error('Errore durante il recupero della consegna:', error);
      throw error;
    }
  }

  // Ascolta gli aggiornamenti di una consegna tramite ID
  listenToDelivery(deliveryId, callback) {
    try {
      const deliveryRef = doc(this.db, 'deliveries', deliveryId);
      const unsubscribe = onSnapshot(deliveryRef, (doc) => {
        if (doc.exists()) {
          callback({
            id: doc.id,
            ...doc.data()
          });
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

  // Formatta l'ETA in un formato leggibile
  formatETA(etaString) {
    if (!etaString) return 'N/A';
    
    const eta = new Date(etaString);
    return eta.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Calcola il tempo rimanente in formato leggibile
  calculateRemainingTime(etaString) {
    if (!etaString) return 'N/A';
    
    const eta = new Date(etaString);
    const now = new Date();
    
    // Calcola la differenza in millisecondi
    const diffMs = eta - now;
    
    // Se l'ETA è nel passato
    if (diffMs < 0) {
      return 'In arrivo';
    }
    
    // Converti in minuti
    const diffMinutes = Math.floor(diffMs / 60000);
    
    // Formatta il tempo rimanente
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours} h ${minutes} min`;
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

export default new ClientTrackingService();
