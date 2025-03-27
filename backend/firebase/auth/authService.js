// Servizio di autenticazione per l'app di logistica ricambi auto
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { firebaseConfig } from '../config.js';

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Servizio di autenticazione che gestisce tutte le operazioni relative agli utenti
 */
class AuthService {
  /**
   * Registra un nuovo utente (admin o corriere)
   * @param {string} email - Email dell'utente
   * @param {string} password - Password dell'utente
   * @param {string} displayName - Nome visualizzato dell'utente
   * @param {string} role - Ruolo dell'utente ('admin' o 'courier')
   * @returns {Promise<Object>} - Oggetto utente Firebase
   */
  async registerUser(email, password, displayName, role) {
    try {
      // Crea l'utente in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Aggiorna il profilo con il nome visualizzato
      await updateProfile(user, {
        displayName: displayName
      });
      
      // Qui in una implementazione completa salveremmo anche il ruolo in Firestore
      // Questo verrà implementato quando configureremo il database
      
      return user;
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      throw error;
    }
  }
  
  /**
   * Effettua il login di un utente
   * @param {string} email - Email dell'utente
   * @param {string} password - Password dell'utente
   * @returns {Promise<Object>} - Oggetto utente Firebase
   */
  async loginUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Errore durante il login:', error);
      throw error;
    }
  }
  
  /**
   * Effettua il logout dell'utente corrente
   * @returns {Promise<void>}
   */
  async logoutUser() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Errore durante il logout:', error);
      throw error;
    }
  }
  
  /**
   * Invia un'email per il reset della password
   * @param {string} email - Email dell'utente
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Errore durante l\'invio dell\'email di reset:', error);
      throw error;
    }
  }
  
  /**
   * Ottiene l'utente correntemente autenticato
   * @returns {Object|null} - Utente corrente o null se non autenticato
   */
  getCurrentUser() {
    return auth.currentUser;
  }
  
  /**
   * Registra un listener per i cambiamenti dello stato di autenticazione
   * @param {Function} callback - Funzione da chiamare quando cambia lo stato di autenticazione
   * @returns {Function} - Funzione per rimuovere il listener
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
}

export default new AuthService();
