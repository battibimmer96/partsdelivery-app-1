# Modello Dati - App Logistica Ricambi Auto

## Panoramica

Il modello dati dell'applicazione è progettato per supportare tutte le funzionalità richieste, garantendo efficienza, coerenza e scalabilità. Utilizziamo Firebase Firestore come database NoSQL per la sua capacità di gestire aggiornamenti in tempo reale e la sua integrazione con gli altri servizi Firebase.

## Collezioni e Documenti

### 1. Collezione `users`
Contiene tutti gli utenti del sistema (amministratori e corrieri).

```javascript
{
  id: "string", // UID generato da Firebase Auth
  email: "string",
  displayName: "string",
  phoneNumber: "string",
  role: "string", // "admin" o "courier"
  active: boolean,
  createdAt: timestamp,
  lastLogin: timestamp,
  fcmToken: "string", // Token per notifiche push
  settings: {
    // Preferenze utente
    language: "string",
    notifications: boolean,
    theme: "string"
  },
  // Solo per corrieri
  courierDetails: {
    vehicleType: "string",
    vehiclePlate: "string",
    maxCapacity: number,
    workingHours: {
      start: "string", // formato "HH:MM"
      end: "string"    // formato "HH:MM"
    },
    workingDays: [number], // 0-6 (domenica-sabato)
    currentStatus: "string" // "available", "busy", "offline"
  }
}
```

### 2. Collezione `clients`
Contiene i dati dei clienti con indirizzi e contatti.

```javascript
{
  id: "string", // ID generato automaticamente
  companyName: "string", // Può essere null per clienti privati
  firstName: "string",
  lastName: "string",
  email: "string",
  phoneNumber: "string",
  address: {
    street: "string",
    number: "string",
    city: "string",
    province: "string",
    postalCode: "string",
    country: "string",
    coordinates: {
      latitude: number,
      longitude: number
    }
  },
  notes: "string",
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: "string", // ID dell'admin che ha creato il cliente
  tags: [string], // Tag per categorizzare i clienti
  vatNumber: "string", // Partita IVA
  fiscalCode: "string" // Codice fiscale
}
```

### 3. Collezione `orders`
Contiene gli ordini con dettagli e stato.

```javascript
{
  id: "string", // ID generato automaticamente
  clientId: "string", // Riferimento al cliente
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: "string", // ID dell'admin che ha creato l'ordine
  status: "string", // "pending", "assigned", "in_progress", "completed", "cancelled"
  priority: "string", // "normal", "urgent", "scheduled"
  scheduledDelivery: {
    date: timestamp,
    timeWindow: {
      start: "string", // formato "HH:MM"
      end: "string"    // formato "HH:MM"
    }
  },
  items: [
    {
      description: "string",
      quantity: number,
      notes: "string"
    }
  ],
  totalItems: number,
  notes: "string",
  attachments: [string], // URL di eventuali allegati
  paymentMethod: "string", // "cash", "card", "invoice"
  paymentStatus: "string", // "pending", "completed"
  amount: number, // Importo totale
  trackingLink: "string" // Link univoco per il cliente
}
```

### 4. Collezione `deliveries`
Contiene le consegne assegnate ai corrieri.

```javascript
{
  id: "string", // ID generato automaticamente
  orderId: "string", // Riferimento all'ordine
  courierId: "string", // Riferimento al corriere
  status: "string", // "assigned", "in_progress", "arrived", "completed", "failed"
  assignedAt: timestamp,
  startedAt: timestamp, // Quando il corriere inizia la consegna
  arrivedAt: timestamp, // Quando il corriere arriva dal cliente
  completedAt: timestamp, // Quando la consegna è completata
  position: number, // Posizione nella sequenza di consegne del corriere
  estimatedArrival: timestamp, // ETA calcolato
  actualRoute: {
    distance: number, // in metri
    duration: number, // in secondi
    polyline: "string" // Encoded polyline del percorso
  },
  notes: "string",
  signature: "string", // URL dell'immagine della firma (opzionale)
  photos: [string], // URL delle foto scattate alla consegna (opzionale)
  deliveryProof: "string" // Codice o altro tipo di prova di consegna
}
```

### 5. Collezione `locations`
Contiene le posizioni in tempo reale dei corrieri.

```javascript
{
  id: "string", // ID del corriere
  timestamp: timestamp,
  coordinates: {
    latitude: number,
    longitude: number,
    accuracy: number, // Precisione in metri
    altitude: number, // Altitudine (opzionale)
    speed: number, // Velocità in m/s (opzionale)
    heading: number // Direzione in gradi (opzionale)
  },
  battery: {
    level: number, // Percentuale batteria
    isCharging: boolean
  },
  isMoving: boolean,
  provider: "string" // "gps", "network", "passive"
}
```

### 6. Collezione `routes`
Contiene i percorsi ottimizzati per i corrieri.

```javascript
{
  id: "string", // ID generato automaticamente
  courierId: "string", // Riferimento al corriere
  date: timestamp, // Data del percorso
  status: "string", // "planned", "in_progress", "completed"
  startLocation: {
    address: "string",
    coordinates: {
      latitude: number,
      longitude: number
    }
  },
  endLocation: {
    address: "string",
    coordinates: {
      latitude: number,
      longitude: number
    }
  },
  stops: [
    {
      deliveryId: "string", // Riferimento alla consegna
      position: number, // Posizione nella sequenza
      estimatedArrival: timestamp
    }
  ],
  totalDistance: number, // in metri
  totalDuration: number, // in secondi
  createdAt: timestamp,
  updatedAt: timestamp,
  optimizedAt: timestamp, // Ultima ottimizzazione
  trafficConditions: "string", // "light", "moderate", "heavy"
  polyline: "string" // Encoded polyline dell'intero percorso
}
```

### 7. Collezione `exchangeRequests`
Contiene le richieste di scambio merce tra corrieri.

```javascript
{
  id: "string", // ID generato automaticamente
  fromCourierId: "string", // Corriere che richiede lo scambio
  toCourierId: "string", // Corriere destinatario
  deliveryIds: [string], // Consegne da scambiare
  status: "string", // "pending", "accepted", "rejected", "completed"
  reason: "string", // Motivo dello scambio
  suggestedLocation: {
    address: "string",
    coordinates: {
      latitude: number,
      longitude: number
    }
  },
  suggestedTime: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
  completedAt: timestamp,
  notes: "string"
}
```

### 8. Collezione `notifications`
Contiene le notifiche inviate agli utenti.

```javascript
{
  id: "string", // ID generato automaticamente
  userId: "string", // Destinatario
  type: "string", // "new_order", "status_change", "exchange_request", ecc.
  title: "string",
  body: "string",
  data: {
    // Dati aggiuntivi specifici per tipo
  },
  read: boolean,
  createdAt: timestamp,
  expiresAt: timestamp
}
```

### 9. Collezione `routePatterns`
Contiene i pattern di percorsi ricorrenti identificati dal sistema.

```javascript
{
  id: "string", // ID generato automaticamente
  name: "string", // Nome del pattern (es. "Zona Nord Mattina")
  frequency: number, // Quante volte è stato rilevato
  stops: [
    {
      clientId: "string",
      frequency: number, // Quante volte questo cliente appare in questo pattern
      averagePosition: number // Posizione media nella sequenza
    }
  ],
  timeWindow: {
    start: "string", // formato "HH:MM"
    end: "string"    // formato "HH:MM"
  },
  daysOfWeek: [number], // 0-6 (domenica-sabato)
  averageDuration: number, // in secondi
  averageDistance: number, // in metri
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Relazioni tra Entità

```
users (courier) 1 ----> N routes
users (courier) 1 ----> 1 locations
users (admin)   1 ----> N orders
clients         1 ----> N orders
orders          1 ----> 1 deliveries
deliveries      N ----> 1 routes
users (courier) 1 ----> N deliveries
exchangeRequests N <---> N deliveries
users           1 ----> N notifications
```

## Indici

Per ottimizzare le query più frequenti, verranno creati i seguenti indici compositi:

1. `deliveries`: `courierId` + `status` + `position` (per ordinare le consegne di un corriere)
2. `orders`: `clientId` + `createdAt` (per visualizzare lo storico ordini di un cliente)
3. `deliveries`: `status` + `estimatedArrival` (per visualizzare le consegne imminenti)
4. `routes`: `courierId` + `date` (per visualizzare i percorsi di un corriere per data)
5. `notifications`: `userId` + `read` + `createdAt` (per visualizzare le notifiche non lette)

## Considerazioni sulla Sicurezza

Le regole di sicurezza di Firestore saranno configurate per garantire che:

1. Gli amministratori possano leggere e scrivere su tutte le collezioni
2. I corrieri possano:
   - Leggere i propri dati utente
   - Leggere i dati dei clienti associati alle proprie consegne
   - Leggere e aggiornare le proprie consegne
   - Leggere e aggiornare la propria posizione
   - Leggere e rispondere alle richieste di scambio
3. I clienti (tramite link) possano:
   - Leggere solo i dati relativi alla propria consegna
   - Leggere la posizione del corriere associato alla propria consegna

## Considerazioni sulla Performance

1. Utilizzo di sottocollezioni per dati frequentemente aggiornati (es. posizioni)
2. Denormalizzazione strategica per ridurre le query (es. dati cliente duplicati nell'ordine)
3. Limitazione delle dimensioni dei documenti per rispettare i limiti di Firestore (1MB)
4. Utilizzo di transazioni per operazioni che richiedono atomicità
5. Implementazione di caching lato client per ridurre le letture
