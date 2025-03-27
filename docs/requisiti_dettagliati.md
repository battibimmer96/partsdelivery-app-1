# Requisiti Dettagliati - App Logistica Ricambi Auto

## Panoramica
Questa applicazione è progettata per ottimizzare la gestione delle consegne di ricambi auto, offrendo un sistema completo che include una web app per amministratori e un'app mobile per corrieri, con funzionalità di tracking in tempo reale e ottimizzazione dei percorsi.

## Contesto Aziendale
L'applicazione si inserisce nel contesto del settore automotive con focus sulla gestione di preventivi e ordini ricambi. Il flusso di lavoro attuale include:
1. Ricezione richieste via WhatsApp o telefono
2. Estrazione targa veicolo
3. Utilizzo di diversi programmi per ricavare il VIN e identificare il modello
4. Navigazione manuale nei software per trovare il ricambio corretto
5. Inserimento del codice in QRicambi per cercare presso fornitori ed eBay
6. Creazione di PR3 nel gestionale e invio screenshot del preventivo via WhatsApp
7. Utilizzo di messaggi rapidi predefiniti per verificare disponibilità

## Componenti del Sistema

### 1. Web App Admin
**Obiettivo**: Fornire un'interfaccia completa per la gestione di clienti, ordini e corrieri.

**Funzionalità dettagliate**:
- **Gestione Clienti**:
  - Creazione, modifica ed eliminazione di schede cliente
  - Campi: nome, cognome, azienda, indirizzo completo, telefono, email, note
  - Ricerca rapida e filtri avanzati
  - Storico ordini per cliente

- **Gestione Ordini**:
  - Creazione nuovo ordine con selezione cliente da rubrica
  - Dettagli ordine: descrizione ricambi, quantità, note speciali
  - Assegnazione priorità (normale, urgente, programmata)
  - Selezione data/ora di consegna prevista
  - Assegnazione a corriere specifico

- **Monitoraggio Consegne**:
  - Dashboard con panoramica stato consegne
  - Visualizzazione mappa interattiva con:
    - Posizione in tempo reale di ogni corriere
    - Percorso pianificato
    - Tappe completate e da completare
    - Indicatori di stato colorati (assegnato, in viaggio, consegnato)
  - Timeline delle consegne con orari stimati

- **Gestione Percorsi**:
  - Interfaccia drag & drop per riordinare tappe
  - Funzione di spostamento ordini tra corrieri
  - Visualizzazione tempi stimati per ogni percorso
  - Indicatori di efficienza del percorso

- **Algoritmo di Ottimizzazione**:
  - Calcolo automatico sequenza ottimale delle tappe
  - Considerazione del traffico in tempo reale
  - Analisi dei percorsi per identificare pattern ricorrenti
  - Suggerimento di scambi merce tra corrieri quando vantaggioso
  - Possibilità di override manuale delle decisioni algoritmiche

### 2. App Mobile Corriere
**Obiettivo**: Fornire ai corrieri uno strumento semplice ed efficace per gestire le consegne.

**Funzionalità dettagliate**:
- **Autenticazione**:
  - Login sicuro con credenziali personali
  - Persistenza della sessione
  - Recupero password

- **Gestione Consegne**:
  - Lista delle consegne assegnate con dettagli essenziali
  - Visualizzazione dettagli completi per ogni consegna
  - Interfaccia drag & drop per riordinare manualmente le tappe
  - Filtri per stato (da iniziare, in corso, completate)

- **Navigazione**:
  - Integrazione diretta con Google Maps
  - Avvio navigazione con un tocco
  - Visualizzazione dell'intero percorso pianificato
  - Indicazioni vocali

- **Gestione Stati**:
  - Aggiornamento stato consegna (in viaggio, arrivato, consegnato)
  - Possibilità di aggiungere note o foto
  - Firma digitale del cliente (opzionale)

- **Tracking**:
  - Invio automatico della posizione in background
  - Ottimizzazione batteria
  - Indicatore di stato tracking attivo

- **Notifiche**:
  - Ricezione notifiche push per nuove assegnazioni
  - Avvisi per modifiche al percorso
  - Notifiche per richieste di scambio merce

### 3. Interfaccia Cliente
**Obiettivo**: Fornire al cliente finale informazioni in tempo reale sulla sua consegna.

**Funzionalità dettagliate**:
- **Link Tracciabile**:
  - Generazione automatica di link unico per ogni consegna
  - Invio via SMS o email
  - Nessuna necessità di login o app

- **Pagina di Tracking**:
  - Visualizzazione mappa con posizione corriere
  - ETA aggiornato in tempo reale
  - Dettagli essenziali dell'ordine
  - Contatto diretto con l'azienda (opzionale)

## Requisiti Tecnici

### Architettura
- **Frontend Web**: Single Page Application (SPA) in React.js
- **Frontend Mobile**: App nativa cross-platform con React Native via Expo
- **Backend**: Node.js con Express, integrato con Firebase
- **Database**: Firestore (NoSQL) per dati e aggiornamenti in tempo reale
- **Autenticazione**: Firebase Authentication
- **Hosting**: Firebase Hosting per web app e backend
- **Notifiche**: Firebase Cloud Messaging

### API e Servizi Esterni
- **Google Maps JavaScript API**: Per visualizzazione mappe web
- **Google Maps SDK for iOS/Android**: Per integrazione mappe in app mobile
- **Google Directions API**: Per calcolo percorsi ottimali
- **Google Distance Matrix API**: Per calcolo tempi e distanze
- **Firebase Realtime Database/Firestore**: Per aggiornamenti in tempo reale
- **Fused Location Provider API**: Per tracking GPS efficiente su mobile

### UI/UX
- **Design System**: Coerente tra web e mobile
- **Palette Colori**: Definita con colori primari e secondari
- **Responsive Design**: Adattabile a tutti i dispositivi
- **Accessibilità**: Conformità agli standard WCAG 2.1
- **Performance**: Caricamento rapido e interazioni fluide

### Sicurezza
- **Autenticazione**: Multi-fattore per admin
- **Autorizzazione**: Controllo granulare degli accessi
- **Protezione Dati**: Crittografia in transito e a riposo
- **Audit Trail**: Registrazione delle attività sensibili

## Vincoli e Considerazioni
- L'app deve funzionare anche in aree con connettività limitata
- Ottimizzazione per il consumo di batteria nell'app mobile
- Conformità al GDPR per la gestione dei dati personali
- Scalabilità per gestire un numero crescente di corrieri e consegne
