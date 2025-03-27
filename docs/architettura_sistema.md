# Architettura del Sistema - App Logistica Ricambi Auto

## Panoramica dell'Architettura

L'architettura dell'applicazione è basata su un modello client-server con componenti distribuiti e comunicazione in tempo reale. Il sistema è composto da tre componenti principali:

1. **Web App Admin** (React.js)
2. **App Mobile Corriere** (React Native/Expo)
3. **Backend** (Node.js/Express + Firebase)

Questi componenti interagiscono tra loro attraverso API RESTful e connessioni in tempo reale tramite Firebase.

## Diagramma dell'Architettura

```
+----------------------------------+     +----------------------------------+
|                                  |     |                                  |
|        WEB APP ADMIN            |     |        APP MOBILE CORRIERE       |
|        (React.js)               |     |        (React Native/Expo)       |
|                                  |     |                                  |
+---------------+------------------+     +----------------+-----------------+
                |                                          |
                |                                          |
                v                                          v
+----------------------------------+     +----------------------------------+
|                                  |     |                                  |
|        FIREBASE AUTH             |     |        FIREBASE CLOUD           |
|                                  |     |        MESSAGING                |
|                                  |     |                                  |
+---------------+------------------+     +----------------+-----------------+
                |                                          |
                |                                          |
                v                                          v
+------------------------------------------------------------------+
|                                                                  |
|                       BACKEND (Node.js/Express)                  |
|                                                                  |
+------------------------+-------------------+--------------------+
                         |                   |
                         |                   |
                         v                   v
+------------------------+---+   +----------+----------------------+
|                            |   |                                 |
|      FIRESTORE DATABASE    |   |      GOOGLE MAPS APIS          |
|                            |   |      (Directions, Distance)     |
|                            |   |                                 |
+----------------------------+   +---------------------------------+
```

## Componenti del Sistema

### 1. Frontend Web (Admin)

- **Tecnologia**: React.js, TailwindCSS
- **Responsabilità**:
  - Interfaccia utente per amministratori
  - Gestione clienti e ordini
  - Visualizzazione mappa con posizioni corrieri
  - Ottimizzazione percorsi
  - Dashboard di monitoraggio

- **Componenti Principali**:
  - **AuthModule**: Gestione autenticazione e autorizzazione
  - **ClientModule**: CRUD operazioni per clienti
  - **OrderModule**: Gestione ordini e assegnazioni
  - **MapModule**: Visualizzazione mappa e tracking
  - **OptimizationModule**: Algoritmi di ottimizzazione percorsi
  - **NotificationModule**: Sistema di notifiche

### 2. Frontend Mobile (Corriere)

- **Tecnologia**: React Native via Expo
- **Responsabilità**:
  - Interfaccia utente per corrieri
  - Visualizzazione consegne assegnate
  - Navigazione integrata con Google Maps
  - Aggiornamento stato consegne
  - Invio posizione in tempo reale

- **Componenti Principali**:
  - **AuthModule**: Login e gestione sessione
  - **DeliveryModule**: Visualizzazione e gestione consegne
  - **NavigationModule**: Integrazione con Google Maps
  - **TrackingModule**: Invio posizione in background
  - **NotificationModule**: Ricezione notifiche push

### 3. Backend

- **Tecnologia**: Node.js, Express, Firebase
- **Responsabilità**:
  - API RESTful per operazioni CRUD
  - Logica di business
  - Autenticazione e autorizzazione
  - Algoritmi di ottimizzazione
  - Gestione notifiche

- **Componenti Principali**:
  - **AuthService**: Gestione autenticazione con Firebase Auth
  - **ClientService**: Operazioni su clienti
  - **OrderService**: Gestione ordini e assegnazioni
  - **CourierService**: Gestione corrieri e tracking
  - **OptimizationService**: Algoritmi di ottimizzazione percorsi
  - **NotificationService**: Invio notifiche push

### 4. Database (Firestore)

- **Tecnologia**: Firebase Firestore (NoSQL)
- **Responsabilità**:
  - Persistenza dati
  - Aggiornamenti in tempo reale
  - Sincronizzazione tra dispositivi

- **Collezioni Principali**:
  - **users**: Utenti del sistema (admin e corrieri)
  - **clients**: Clienti con indirizzi e contatti
  - **orders**: Ordini con dettagli e stato
  - **deliveries**: Consegne assegnate ai corrieri
  - **locations**: Posizioni in tempo reale dei corrieri
  - **routes**: Percorsi ottimizzati

### 5. Servizi Esterni

- **Firebase Authentication**: Gestione utenti e autenticazione
- **Firebase Cloud Messaging**: Notifiche push
- **Google Maps JavaScript API**: Mappe per web app
- **Google Maps SDK for iOS/Android**: Mappe per app mobile
- **Google Directions API**: Calcolo percorsi ottimali
- **Google Distance Matrix API**: Calcolo tempi e distanze

## Flusso di Dati

### 1. Autenticazione
```
Client -> Firebase Auth -> Backend -> Client (token JWT)
```

### 2. Creazione Ordine
```
Admin -> Backend -> Firestore -> Notifica Corriere
```

### 3. Tracking in Tempo Reale
```
App Corriere -> Firestore -> Web Admin (aggiornamento real-time)
                          -> Link Cliente (aggiornamento real-time)
```

### 4. Ottimizzazione Percorsi
```
Admin -> Backend -> Google Directions API -> Algoritmo Ottimizzazione -> Firestore -> Notifica Corriere
```

## Sicurezza

- **Autenticazione**: Firebase Authentication con JWT
- **Autorizzazione**: Regole Firestore per controllo accessi
- **Comunicazione**: HTTPS per tutte le API
- **Dati Sensibili**: Crittografia lato client e server

## Scalabilità

- **Orizzontale**: Firebase gestisce automaticamente la scalabilità
- **Verticale**: Ottimizzazione delle query e caching
- **Geografica**: Distribuzione globale tramite Firebase

## Considerazioni Tecniche

- **Offline First**: Supporto per operazioni offline nell'app mobile
- **Batteria**: Ottimizzazione del tracking per risparmio energetico
- **Connettività**: Gestione di connessioni instabili
- **Concorrenza**: Gestione conflitti in aggiornamenti simultanei
