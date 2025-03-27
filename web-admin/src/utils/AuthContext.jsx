import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "partsdelivery-app.firebaseapp.com",
  projectId: "partsdelivery-app",
  storageBucket: "partsdelivery-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef",
  measurementId: "G-XXXXXXXXXX"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Crea il contesto di autenticazione
const AuthContext = createContext();

// Hook personalizzato per utilizzare il contesto di autenticazione
export const useAuth = () => useContext(AuthContext);

// Provider di autenticazione
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Funzione di login
  const login = async (email, password) => {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      setError('Credenziali non valide. Riprova.');
      throw err;
    }
  };

  // Funzione di logout
  const logout = async () => {
    try {
      setError('');
      await signOut(auth);
    } catch (err) {
      setError('Errore durante il logout. Riprova.');
      throw err;
    }
  };

  // Effetto per monitorare lo stato di autenticazione
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Pulizia dell'effetto
    return unsubscribe;
  }, []);

  // Valore del contesto
  const value = {
    currentUser,
    login,
    logout,
    error,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
