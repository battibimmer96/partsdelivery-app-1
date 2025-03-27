// Servizio per la gestione del database Firestore per l'app di logistica ricambi auto
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { firebaseConfig } from '../config.js';

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Servizio per la gestione del database Firestore
 */
class DatabaseService {
  /**
   * Crea un nuovo cliente
   * @param {Object} clientData - Dati del cliente
   * @returns {Promise<string>} - ID del cliente creato
   */
  async createClient(clientData) {
    try {
      const clientsRef = collection(db, 'clients');
      const clientWithTimestamp = {
        ...clientData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(clientsRef, clientWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Errore durante la creazione del cliente:', error);
      throw error;
    }
  }
  
  /**
   * Aggiorna un cliente esistente
   * @param {string} clientId - ID del cliente
   * @param {Object} clientData - Dati aggiornati del cliente
   * @returns {Promise<void>}
   */
  async updateClient(clientId, clientData) {
    try {
      const clientRef = doc(db, 'clients', clientId);
      const clientWithTimestamp = {
        ...clientData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(clientRef, clientWithTimestamp);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del cliente:', error);
      throw error;
    }
  }
  
  /**
   * Ottiene un cliente per ID
   * @param {string} clientId - ID del cliente
   * @returns {Promise<Object|null>} - Dati del cliente o null se non trovato
   */
  async getClient(clientId) {
    try {
      const clientRef = doc(db, 'clients', clientId);
      const clientSnap = await getDoc(clientRef);
      
      if (clientSnap.exists()) {
        return { id: clientSnap.id, ...clientSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Errore durante il recupero del cliente:', error);
      throw error;
    }
  }
  
  /**
   * Ottiene tutti i clienti
   * @returns {Promise<Array>} - Array di clienti
   */
  async getAllClients() {
    try {
      const clientsRef = collection(db, 'clients');
      const querySnapshot = await getDocs(clientsRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Errore durante il recupero di tutti i clienti:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un cliente
   * @param {string} clientId - ID del cliente
   * @returns {Promise<void>}
   */
  async deleteClient(clientId) {
    try {
      const clientRef = doc(db, 'clients', clientId);
      await deleteDoc(clientRef);
    } catch (error) {
      console.error('Errore durante l\'eliminazione del cliente:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuovo ordine
   * @param {Object} orderData - Dati dell'ordine
   * @returns {Promise<string>} - ID dell'ordine creato
   */
  async createOrder(orderData) {
    try {
      const ordersRef = collection(db, 'orders');
      const orderWithTimestamp = {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: orderData.status || 'pending'
      };
      
      const docRef = await addDoc(ordersRef, orderWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Errore durante la creazione dell\'ordine:', error);
      throw error;
    }
  }
  
  /**
   * Aggiorna un ordine esistente
   * @param {string} orderId - ID dell'ordine
   * @param {Object} orderData - Dati aggiornati dell'ordine
   * @returns {Promise<void>}
   */
  async updateOrder(orderId, orderData) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderWithTimestamp = {
        ...orderData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(orderRef, orderWithTimestamp);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dell\'ordine:', error);
      throw error;
    }
  }
  
  /**
   * Ottiene un ordine per ID
   * @param {string} orderId - ID dell'ordine
   * @returns {Promise<Object|null>} - Dati dell'ordine o null se non trovato
   */
  async getOrder(orderId) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        return { id: orderSnap.id, ...orderSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Errore durante il recupero dell\'ordine:', error);
      throw error;
    }
  }
  
  /**
   * Ottiene tutti gli ordini
   * @returns {Promise<Array>} - Array di ordini
   */
  async getAllOrders() {
    try {
      const ordersRef = collection(db, 'orders');
      const querySnapshot = await getDocs(ordersRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Errore durante il recupero di tutti gli ordini:', error);
      throw error;
    }
  }
  
  /**
   * Ottiene gli ordini di un cliente specifico
   * @param {string} clientId - ID del cliente
   * @returns {Promise<Array>} - Array di ordini del cliente
   */
  async getClientOrders(clientId) {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Errore durante il recupero degli ordini del cliente:', error);
      throw error;
    }
  }
  
  /**
   * Crea una nuova consegna
   * @param {Object} deliveryData - Dati della consegna
   * @returns {Promise<string>} - ID della consegna creata
   */
  async createDelivery(deliveryData) {
    try {
      const deliveriesRef = collection(db, 'deliveries');
      const deliveryWithTimestamp = {
        ...deliveryData,
        assignedAt: serverTimestamp(),
        status: deliveryData.status || 'assigned'
      };
      
      const docRef = await addDoc(deliveriesRef, deliveryWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Errore durante la creazione della consegna:', error);
      throw error;
    }
  }
  
  /**
   * Aggiorna lo stato di una consegna
   * @param {string} deliveryId - ID della consegna
   * @param {string} status - Nuovo stato della consegna
   * @returns {Promise<void>}
   */
  async updateDeliveryStatus(deliveryId, status) {
    try {
      const deliveryRef = doc(db, 'deliveries', deliveryId);
      const updateData = { status };
      
      // Aggiungiamo timestamp specifici in base allo stato
      if (status === 'in_progress') {
        updateData.startedAt = serverTimestamp();
      } else if (status === 'arrived') {
        updateData.arrivedAt = serverTimestamp();
      } else if (status === 'completed') {
        updateData.completedAt = serverTimestamp();
      }
      
      await updateDoc(deliveryRef, updateData);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dello stato della consegna:', error);
      throw error;
    }
  }
  
  /**
   * Ottiene le consegne assegnate a un corriere
   * @param {string} courierId - ID del corriere
   * @returns {Promise<Array>} - Array di consegne del corriere
   */
  async getCourierDeliveries(courierId) {
    try {
      const deliveriesRef = collection(db, 'deliveries');
      const q = query(
        deliveriesRef, 
        where('courierId', '==', courierId),
        where('status', 'in', ['assigned', 'in_progress', 'arrived']),
        orderBy('position')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Errore durante il recupero delle consegne del corriere:', error);
      throw error;
    }
  }
  
  /**
   * Aggiorna la posizione di un corriere
   * @param {string} courierId - ID del corriere
   * @param {Object} coordinates - Coordinate GPS {latitude, longitude}
   * @param {Object} additionalData - Dati aggiuntivi (batteria, velocità, ecc.)
   * @returns {Promise<void>}
   */
  async updateCourierLocation(courierId, coordinates, additionalData = {}) {
    try {
      const locationRef = doc(db, 'locations', courierId);
      const locationData = {
        coordinates,
        timestamp: serverTimestamp(),
        ...additionalData
      };
      
      // Utilizziamo setDoc con merge: true per creare il documento se non esiste
      await setDoc(locationRef, locationData, { merge: true });
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della posizione del corriere:', error);
      throw error;
    }
  }
  
  /**
   * Ottiene la posizione corrente di un corriere
   * @param {string} courierId - ID del corriere
   * @returns {Promise<Object|null>} - Dati della posizione o null se non trovata
   */
  async getCourierLocation(courierId) {
    try {
      const locationRef = doc(db, 'locations', courierId);
      const locationSnap = await getDoc(locationRef);
      
      if (locationSnap.exists()) {
        return locationSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Errore durante il recupero della posizione del corriere:', error);
      throw error;
    }
  }
  
  /**
   * Registra un listener per le modifiche alla posizione di un corriere
   * @param {string} courierId - ID del corriere
   * @param {Function} callback - Funzione da chiamare quando la posizione cambia
   * @returns {Function} - Funzione per rimuovere il listener
   */
  onCourierLocationChange(courierId, callback) {
    const locationRef = doc(db, 'locations', courierId);
    return onSnapshot(locationRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  }
  
  /**
   * Crea un nuovo percorso per un corriere
   * @param {Object} routeData - Dati del percorso
   * @returns {Promise<string>} - ID del percorso creato
   */
  async createRoute(routeData) {
    try {
      const routesRef = collection(db, 'routes');
      const routeWithTimestamp = {
        ...routeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: routeData.status || 'planned'
      };
      
      const docRef = await addDoc(routesRef, routeWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Errore durante la creazione del percorso:', error);
      throw error;
    }
  }
  
  /**
   * Aggiorna un percorso esistente
   * @param {string} routeId - ID del percorso
   * @param {Object} routeData - Dati aggiornati del percorso
   * @returns {Promise<void>}
   */
  async updateRoute(routeId, routeData) {
    try {
      const routeRef = doc(db, 'routes', routeId);
      const routeWithTimestamp = {
        ...routeData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(routeRef, routeWithTimestamp);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del percorso:', error);
      throw error;
    }
  }
  
  /**
   * Ottiene il percorso corrente di un corriere
   * @param {string} courierId - ID del corriere
   * @param {string} date - Data del percorso (formato ISO)
   * @returns {Promise<Object|null>} - Dati del percorso o null se non trovato
   */
  async getCourierRoute(courierId, date) {
    try {
      const routesRef = collection(db, 'routes');
      const q = query(
        routesRef,
        where('courierId', '==', courierId),
        where('date', '==', date),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Errore durante il recupero del percorso del corriere:', error);
      throw error;
    }
  }
  
  /**
   * Crea una richiesta di scambio merce tra corrieri
   * @param {Object} exchangeData - Dati dello scambio
   * @returns {Promise<string>} - ID della richiesta di scambio creata
   */
  async createExchangeRequest(exchangeData) {
    try {
      const exchangesRef = collection(db, 'exchangeRequests');
      const exchangeWithTimestamp = {
        ...exchangeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending'
      };
      
      const docRef = await addDoc(exchangesRef, exchangeWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error('Errore durante la creazione della richiesta di scambio:', error);
      throw error;
    }
  }
  
  /**
   * Aggiorna lo stato di una richiesta di scambio
   * @param {string} exchangeId - ID della richiesta di scambio
   * @param {string} status - Nuovo stato della richiesta
   * @returns {Promise<void>}
   */
  async updateExchangeRequestStatus(exchangeId, status) {
    try {
      const exchangeRef = doc(db, 'exchangeRequests', exchangeId);
      const updateData = { 
        status,
        updatedAt: serverTimestamp()
      };
      
      if (status === 'completed') {
        updateData.completedAt = serverTimestamp();
      }
      
      await updateDoc(exchangeRef, updateData);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dello stato della richiesta di scambio:', error);
      throw error;
    }
  }
  
  /**
   * Ottiene le richieste di scambio per un corriere
   * @param {string} courierId - ID del corriere
   * @returns {Promise<Array>} - Array di richieste di scambio
   */
  async getCourierExchangeRequests(courierId) {
    try {
      const exchangesRef = collection(db, 'exchangeRequests');
      const q = query(
        exchangesRef,
        where('status', '==', 'pending'),
        where('toCourierId', '==', courierId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Errore durante il recupero delle richieste di scambio del corriere:', error);
      throw error;
    }
  }
}

export default new DatabaseService();
