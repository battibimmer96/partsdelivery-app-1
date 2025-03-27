# Documentazione Tecnica - PartsDelivery

## Panoramica del Sistema

PartsDelivery è un'applicazione completa per la gestione delle consegne di ricambi auto, composta da tre componenti principali:
1. Backend Firebase (autenticazione, database, notifiche)
2. Web Admin (interfaccia amministrativa)
3. App Mobile per Corrieri (React Native/Expo)

Questa documentazione tecnica fornisce dettagli sull'architettura, le tecnologie utilizzate e le implementazioni specifiche.

## Architettura del Sistema

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Web Admin     │◄────┤    Firebase     │────►│   App Mobile    │
│   (React.js)    │     │    Backend      │     │  (React Native) │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               ▲
                               │
                               ▼
                        ┌─────────────────┐
                        │  Google Maps    │
                        │     APIs        │
                        │                 │
                        └─────────────────┘
```

### Componenti Principali

#### Backend Firebase
- **Authentication**: Gestione utenti (admin e corrieri)
- **Firestore Database**: Database NoSQL per dati applicativi
- **Cloud Functions**: Logica server-side e automazioni
- **Cloud Messaging**: Notifiche push per corrieri
- **Hosting**: Hosting per web admin e pagine di tracking cliente

#### Web Admin (React.js)
- **Interfaccia Amministrativa**: Dashboard, gestione clienti, ordini, corrieri
- **Tracking in Tempo Reale**: Visualizzazione posizione corrieri su mappa
- **Ottimizzazione Percorsi**: Interfaccia per ottimizzare e gestire percorsi

#### App Mobile (React Native/Expo)
- **Interfaccia Corriere**: Lista consegne, dettagli, aggiornamento stato
- **Tracking GPS**: Invio posizione in tempo reale
- **Navigazione**: Integrazione con Google Maps per navigazione
- **Notifiche**: Ricezione notifiche push

## Tecnologie Utilizzate

### Backend
- **Firebase Authentication**: Autenticazione sicura con email/password
- **Firestore**: Database NoSQL scalabile
- **Firebase Cloud Functions**: Node.js 14
- **Firebase Cloud Messaging**: Notifiche push

### Web Admin
- **React.js 18**: Framework UI
- **Vite**: Build tool
- **React Router**: Routing client-side
- **TailwindCSS**: Framework CSS utility-first
- **Google Maps JavaScript API**: Visualizzazione mappe
- **Firebase SDK Web**: Integrazione con Firebase

### App Mobile
- **React Native**: Framework cross-platform
- **Expo**: Toolchain per React Native
- **React Navigation**: Navigazione tra schermate
- **Expo Location**: API per geolocalizzazione
- **Google Maps SDK**: Integrazione mappe
- **Firebase SDK React Native**: Integrazione con Firebase

### APIs Esterne
- **Google Maps Distance Matrix API**: Calcolo distanze e tempi
- **Google Maps Directions API**: Calcolo percorsi ottimali
- **Google Maps Geocoding API**: Conversione indirizzi in coordinate

## Modello Dati

### Collezioni Firestore

#### Users
```javascript
{
  uid: String,           // ID utente Firebase Auth
  email: String,         // Email utente
  firstName: String,     // Nome
  lastName: String,      // Cognome
  role: String,          // 'admin' o 'courier'
  phone: String,         // Numero telefono
  createdAt: Timestamp,  // Data creazione
  lastLogin: Timestamp,  // Ultimo accesso
  status: String         // 'active', 'inactive'
}
```

#### Clients
```javascript
{
  id: String,            // ID cliente
  name: String,          // Nome cliente
  address: String,       // Indirizzo completo
  location: {            // Coordinate geografiche
    latitude: Number,
    longitude: Number
  },
  contactName: String,   // Nome contatto
  contactPhone: String,  // Telefono contatto
  email: String,         // Email
  notes: String,         // Note aggiuntive
  createdAt: Timestamp,  // Data creazione
  updatedAt: Timestamp   // Ultimo aggiornamento
}
```

#### Orders
```javascript
{
  id: String,            // ID ordine
  clientId: String,      // Riferimento al cliente
  clientName: String,    // Nome cliente (denormalizzato)
  items: [               // Articoli ordinati
    {
      id: String,        // ID articolo
      name: String,      // Nome articolo
      quantity: Number,  // Quantità
      notes: String      // Note specifiche
    }
  ],
  totalItems: Number,    // Numero totale articoli
  status: String,        // 'pending', 'assigned', 'in_progress', 'completed'
  createdAt: Timestamp,  // Data creazione
  updatedAt: Timestamp,  // Ultimo aggiornamento
  notes: String          // Note ordine
}
```

#### Deliveries
```javascript
{
  id: String,            // ID consegna
  orderId: String,       // Riferimento all'ordine
  courierId: String,     // Riferimento al corriere
  clientId: String,      // Riferimento al cliente
  clientName: String,    // Nome cliente (denormalizzato)
  address: String,       // Indirizzo consegna
  destination: {         // Coordinate destinazione
    latitude: Number,
    longitude: Number
  },
  items: [               // Articoli da consegnare
    {
      id: String,
      name: String,
      quantity: Number
    }
  ],
  status: String,        // 'pending', 'in_progress', 'completed'
  eta: String,           // Tempo stimato arrivo (ISO string)
  estimatedTimeMinutes: Number, // Tempo stimato in minuti
  remainingDistanceKm: Number,  // Distanza rimanente in km
  courierLocation: {     // Ultima posizione corriere
    latitude: Number,
    longitude: Number,
    timestamp: Number
  },
  courierPath: [         // Percorso del corriere (array posizioni)
    {
      latitude: Number,
      longitude: Number,
      timestamp: Number
    }
  ],
  trackingToken: String, // Token per tracking pubblico
  trackingEnabled: Boolean, // Tracking abilitato
  createdAt: Timestamp,  // Data creazione
  updatedAt: Timestamp,  // Ultimo aggiornamento
  completedAt: Timestamp // Data completamento
}
```

#### Couriers
```javascript
{
  id: String,            // ID corriere (stesso di user.uid)
  firstName: String,     // Nome
  lastName: String,      // Cognome
  phone: String,         // Telefono
  email: String,         // Email
  vehicle: {             // Informazioni veicolo
    type: String,        // Tipo veicolo
    plate: String,       // Targa
    model: String        // Modello
  },
  location: {            // Posizione attuale
    latitude: Number,
    longitude: Number,
    heading: Number,     // Direzione
    speed: Number,       // Velocità
    accuracy: Number,    // Precisione
    timestamp: Number    // Timestamp
  },
  status: String,        // 'active', 'inactive', 'on_delivery'
  deliveryOrder: [String], // Ordine ottimizzato consegne (array ID)
  lastActive: Timestamp, // Ultimo aggiornamento posizione
  fcmToken: String       // Token per notifiche push
}
```

## Implementazioni Chiave

### Sistema di Autenticazione
```javascript
// Esempio di implementazione autenticazione in authService.js
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();

// Login utente
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(`Errore login: ${error.message}`);
  }
};

// Registrazione nuovo utente
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Salva dati utente aggiuntivi in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      uid: user.uid,
      email: user.email,
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    
    return user;
  } catch (error) {
    throw new Error(`Errore registrazione: ${error.message}`);
  }
};
```

### Tracking in Tempo Reale
```javascript
// Esempio di implementazione tracking in TrackingService.js
import * as Location from 'expo-location';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const db = getFirestore();

// Avvia tracking posizione
export const startTracking = async (courierId) => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permesso di accesso alla posizione negato');
    }
    
    // Configura opzioni tracking
    const locationOptions = {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,  // 5 secondi
      distanceInterval: 10 // 10 metri
    };
    
    // Avvia tracking e aggiorna Firestore
    return await Location.watchPositionAsync(locationOptions, (location) => {
      const { coords, timestamp } = location;
      
      // Aggiorna posizione corriere su Firestore
      updateCourierLocation(courierId, coords, timestamp);
    });
  } catch (error) {
    throw new Error(`Errore avvio tracking: ${error.message}`);
  }
};

// Aggiorna posizione corriere su Firestore
const updateCourierLocation = async (courierId, coords, timestamp) => {
  try {
    const courierRef = doc(db, 'couriers', courierId);
    
    await updateDoc(courierRef, {
      location: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        heading: coords.heading || 0,
        speed: coords.speed || 0,
        accuracy: coords.accuracy || 0,
        timestamp: timestamp
      },
      lastActive: new Date().toISOString()
    });
  } catch (error) {
    console.error('Errore aggiornamento posizione:', error);
  }
};
```

### Algoritmo di Ottimizzazione Percorsi
```javascript
// Esempio di implementazione algoritmo ottimizzazione in RouteOptimizationService.js
import axios from 'axios';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const db = getFirestore();
const googleMapsApiKey = 'YOUR_API_KEY';

// Calcola percorso ottimale
export const calculateOptimalRoute = async (courierId) => {
  try {
    // Ottieni consegne assegnate al corriere
    const deliveriesQuery = query(
      collection(db, 'deliveries'),
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
      return deliveries; // Niente da ottimizzare
    }
    
    // Ottieni posizione corriere
    const courierSnap = await getDoc(doc(db, 'couriers', courierId));
    const courier = courierSnap.data();
    const startLocation = courier.location;
    
    // Prepara destinazioni
    const destinations = deliveries.map(d => ({
      id: d.id,
      location: d.destination
    }));
    
    // Ottieni matrice distanze da Google Maps API
    const distanceMatrix = await getDistanceMatrix(startLocation, destinations);
    
    // Implementa algoritmo del vicino più prossimo
    const optimizedRoute = [];
    const remaining = [...deliveries];
    
    // Aggiungi prima le consegne in corso
    const inProgress = remaining.filter(d => d.status === 'in_progress');
    for (const delivery of inProgress) {
      optimizedRoute.push(delivery);
      const index = remaining.findIndex(d => d.id === delivery.id);
      remaining.splice(index, 1);
    }
    
    // Aggiungi la consegna più vicina alla posizione attuale
    if (remaining.length > 0 && optimizedRoute.length === 0) {
      let closestIndex = 0;
      let minDuration = Infinity;
      
      distanceMatrix.forEach((item, index) => {
        if (item.durationInTraffic < minDuration) {
          minDuration = item.durationInTraffic;
          closestIndex = index;
        }
      });
      
      optimizedRoute.push(remaining[closestIndex]);
      remaining.splice(closestIndex, 1);
    }
    
    // Aggiungi le consegne rimanenti in ordine di prossimità
    while (remaining.length > 0) {
      const lastDelivery = optimizedRoute[optimizedRoute.length - 1];
      
      // Calcola distanze dalla consegna corrente a tutte le rimanenti
      const nextDistances = await getDistanceMatrix(
        lastDelivery.destination,
        remaining.map(d => d.destination)
      );
      
      let closestIndex = 0;
      let minDuration = Infinity;
      
      nextDistances.forEach((item, index) => {
        if (item.durationInTraffic < minDuration) {
          minDuration = item.durationInTraffic;
          closestIndex = index;
        }
      });
      
      optimizedRoute.push(remaining[closestIndex]);
      remaining.splice(closestIndex, 1);
    }
    
    return optimizedRoute;
  } catch (error) {
    throw new Error(`Errore ottimizzazione percorso: ${error.message}`);
  }
};

// Ottieni matrice distanze da Google Maps API
const getDistanceMatrix = async (origin, destinations) => {
  try {
    const params = {
      origins: `${origin.latitude},${origin.longitude}`,
      destinations: destinations.map(d => `${d.location.latitude},${d.location.longitude}`).join('|'),
      mode: 'driving',
      departure_time: 'now',
      traffic_model: 'best_guess',
      key: googleMapsApiKey
    };
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', { params });
    
    if (response.data.status !== 'OK') {
      throw new Error(`Errore API: ${response.data.status}`);
    }
    
    return response.data.rows[0].elements.map((element, index) => ({
      destinationIndex: index,
      distance: element.distance.value,
      duration: element.duration.value,
      durationInTraffic: element.duration_in_traffic.value
    }));
  } catch (error) {
    throw new Error(`Errore Distance Matrix API: ${error.message}`);
  }
};
```

## Sicurezza

### Regole Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Funzioni helper
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isCourier() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'courier';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Regole per collezione users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create, update: if isAdmin() || isOwner(userId);
      allow delete: if isAdmin();
    }
    
    // Regole per collezione clients
    match /clients/{clientId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Regole per collezione orders
    match /orders/{orderId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
    
    // Regole per collezione deliveries
    match /deliveries/{deliveryId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();
      allow update: if isAdmin() || 
        (isCourier() && request.auth.uid == resource.data.courierId);
      allow delete: if isAdmin();
    }
    
    // Regole per collezione couriers
    match /couriers/{courierId} {
      allow read: if isAuthenticated();
      allow create, delete: if isAdmin();
      allow update: if isAdmin() || isOwner(courierId);
    }
  }
}
```

### Autenticazione e Autorizzazione
- Utilizzo di Firebase Authentication per gestire identità utenti
- Ruoli utente (admin, courier) memorizzati in Firestore
- Controllo accessi basato su ruoli implementato sia lato client che server
- Token JWT per autenticazione API

## Ottimizzazioni Performance

### Web Admin
- Code splitting per ridurre dimensione bundle iniziale
- Lazy loading componenti pesanti
- Memorizzazione risultati query frequenti
- Utilizzo di indici Firestore per query complesse

### App Mobile
- Ottimizzazione tracking GPS con intervalli adattivi
- Caching dati per funzionamento offline
- Compressione immagini e assets
- Gestione efficiente memoria per liste lunghe

### Backend
- Indici Firestore ottimizzati per query frequenti
- Utilizzo di transazioni per operazioni atomiche
- Rate limiting su funzioni cloud
- Caching risultati API esterne

## Deployment

### Firebase
1. Configurazione progetto Firebase
2. Deployment regole Firestore
3. Deployment Cloud Functions
4. Configurazione Firebase Hosting

### Web Admin
1. Build produzione: `npm run build`
2. Deployment su Firebase Hosting: `firebase deploy --only hosting`

### App Mobile
1. Build Expo: `expo build:android` e `expo build:ios`
2. Pubblicazione su App Store e Google Play Store

## Monitoraggio e Logging

### Firebase Analytics
- Tracciamento eventi chiave
- Funnel conversione
- Metriche engagement

### Logging
- Logging strutturato in Cloud Functions
- Gestione errori centralizzata
- Alerting per errori critici

## Estensioni Future

1. **Integrazione Magazzino**
   - Sincronizzazione con sistema gestione magazzino
   - Verifica disponibilità in tempo reale

2. **Analisi Predittiva**
   - Machine learning per previsione domanda
   - Ottimizzazione proattiva percorsi

3. **Supporto Veicoli Elettrici**
   - Considerazione autonomia batteria
   - Integrazione punti ricarica

4. **Integrazione Sistemi Pagamento**
   - Pagamento alla consegna
   - Fatturazione automatica

## Riferimenti

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Google Maps API Documentation](https://developers.google.com/maps/documentation)
