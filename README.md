# PartsDelivery App

Applicazione completa per la gestione delle consegne di ricambi auto con tracking in tempo reale e ottimizzazione dei percorsi.

## Struttura del Progetto

- `/backend`: Backend Firebase (autenticazione, database, notifiche)
- `/web-admin`: Interfaccia amministrativa web (React.js)
- `/mobile-app`: App per corrieri (React Native/Expo)
- `/docs`: Documentazione completa del progetto

## Funzionalità Principali

### Admin (Web App)
- Gestione rubrica clienti con indirizzi e note
- Creazione ordini e assegnazione a corrieri
- Visualizzazione in tempo reale dei corrieri su mappa
- Stato di ogni consegna aggiornato
- Ottimizzazione percorsi

### Corriere (App Mobile)
- Login sicuro
- Visualizzazione consegne assegnate
- Riordinamento tappe (drag & drop)
- Navigazione integrata con Google Maps
- Aggiornamento stato consegne
- Invio posizione in tempo reale

### Cliente
- Link di tracking con posizione corriere
- Tempo stimato di arrivo (ETA)
- Dettagli ordine

## Tecnologie Utilizzate

- **Frontend Web**: React.js, TailwindCSS, Google Maps API
- **App Mobile**: React Native (Expo)
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **Tracking**: Fused Location Provider API, Firestore
- **Ottimizzazione**: Google Directions API, Distance Matrix API

## Installazione

### Web Admin
```bash
cd web-admin
npm install
npm run dev
```

### App Mobile
```bash
cd mobile-app
npm install
npx expo start
```

## Deployment

Per pubblicare l'applicazione su GitHub Pages:

```bash
cd web-admin
npm install
npm run deploy
```

## Documentazione

La documentazione completa è disponibile nella cartella `/docs`:
- Manuale utente
- Documentazione tecnica
- Report di test

## Licenza

MIT
