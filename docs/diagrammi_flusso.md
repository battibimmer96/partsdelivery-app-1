# Diagrammi di Flusso - App Logistica Ricambi Auto

## Panoramica

Questo documento contiene i diagrammi di flusso principali che illustrano i processi chiave dell'applicazione di logistica per ricambi auto. I diagrammi sono rappresentati in formato testuale ASCII per facilitare la visualizzazione in qualsiasi ambiente.

## 1. Flusso di Creazione e Gestione Ordini

```
+----------------+     +----------------+     +----------------+     +----------------+
|                |     |                |     |                |     |                |
|  Admin accede  |---->|  Crea nuovo   |---->|  Seleziona     |---->|  Inserisce     |
|  alla web app  |     |  ordine       |     |  cliente       |     |  dettagli      |
|                |     |                |     |                |     |  ricambi       |
+----------------+     +----------------+     +----------------+     +----------------+
                                                                            |
                                                                            v
+----------------+     +----------------+     +----------------+     +----------------+
|                |     |                |     |                |     |                |
|  Ordine        |<----|  Sistema       |<----|  Admin         |<----|  Imposta       |
|  salvato in DB |     |  genera link   |     |  assegna       |     |  priorità e    |
|                |     |  tracking      |     |  corriere      |     |  data consegna |
+----------------+     +----------------+     +----------------+     +----------------+
        |
        v
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Notifica      |---->|  Corriere      |---->|  Corriere      |
|  inviata al    |     |  visualizza    |     |  accetta       |
|  corriere      |     |  nuovo ordine  |     |  consegna      |
|                |     |                |     |                |
+----------------+     +----------------+     +----------------+
```

## 2. Flusso di Tracking in Tempo Reale

```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Corriere      |---->|  App invia     |---->|  Dati salvati  |
|  avvia app     |     |  posizione     |     |  in Firestore  |
|  mobile        |     |  GPS           |     |                |
+----------------+     +----------------+     +----------------+
                                                      |
                                                      v
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Cliente       |     |  Admin         |     |  Firestore     |
|  visualizza    |<----|  monitora      |<----|  aggiorna in   |
|  posizione     |     |  posizioni     |     |  tempo reale   |
|  corriere      |     |  su mappa      |     |                |
+----------------+     +----------------+     +----------------+
        |
        v
+----------------+     +----------------+
|                |     |                |
|  Sistema       |---->|  Cliente       |
|  calcola ETA   |     |  visualizza    |
|  aggiornato    |     |  ETA           |
|                |     |                |
+----------------+     +----------------+
```

## 3. Flusso di Ottimizzazione Percorsi

```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Admin         |---->|  Sistema       |---->|  Sistema       |
|  richiede      |     |  raccoglie     |     |  interroga     |
|  ottimizzazione|     |  consegne      |     |  Google APIs   |
+----------------+     +----------------+     +----------------+
                                                      |
                                                      v
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Corriere      |     |  Admin         |     |  Algoritmo     |
|  riceve        |<----|  approva       |<----|  calcola       |
|  percorso      |     |  percorso      |     |  sequenza      |
|  ottimizzato   |     |  ottimizzato   |     |  ottimale      |
+----------------+     +----------------+     +----------------+
        |
        v
+----------------+     +----------------+
|                |     |                |
|  Corriere      |---->|  Sistema       |
|  segue         |     |  monitora      |
|  percorso      |     |  aderenza      |
|                |     |  al percorso   |
+----------------+     +----------------+
```

## 4. Flusso di Aggiornamento Stato Consegna

```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Corriere      |---->|  Corriere      |---->|  Corriere      |
|  arriva a      |     |  aggiorna      |     |  completa      |
|  destinazione  |     |  stato a       |     |  consegna      |
|                |     |  "arrivato"    |     |                |
+----------------+     +----------------+     +----------------+
                                                      |
                                                      v
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Cliente       |     |  Admin         |     |  Sistema       |
|  riceve        |<----|  visualizza    |<----|  aggiorna      |
|  notifica      |     |  stato         |     |  stato in DB   |
|  completamento |     |  aggiornato    |     |                |
+----------------+     +----------------+     +----------------+
        |
        v
+----------------+     +----------------+
|                |     |                |
|  Sistema       |---->|  Corriere      |
|  propone       |     |  procede alla  |
|  prossima      |     |  prossima      |
|  consegna      |     |  consegna      |
+----------------+     +----------------+
```

## 5. Flusso di Scambio Merce tra Corrieri

```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Sistema       |---->|  Admin         |---->|  Admin         |
|  identifica    |     |  valuta        |     |  approva       |
|  opportunità   |     |  opportunità   |     |  scambio       |
|  di scambio    |     |  di scambio    |     |                |
+----------------+     +----------------+     +----------------+
                                                      |
                                                      v
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Corriere B    |     |  Corriere A    |     |  Sistema       |
|  riceve        |<----|  riceve        |<----|  invia         |
|  notifica      |     |  notifica      |     |  notifiche     |
|  scambio       |     |  scambio       |     |  ai corrieri   |
+----------------+     +----------------+     +----------------+
        |                     |
        v                     v
+----------------+     +----------------+
|                |     |                |
|  Corrieri      |---->|  Sistema       |
|  effettuano    |     |  aggiorna      |
|  scambio       |     |  assegnazioni  |
|                |     |                |
+----------------+     +----------------+
```

## 6. Flusso di Autenticazione Utente

```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Utente        |---->|  Sistema       |---->|  Firebase      |
|  inserisce     |     |  invia         |     |  Auth verifica |
|  credenziali   |     |  credenziali   |     |  credenziali   |
+----------------+     +----------------+     +----------------+
                                                      |
                                                      v
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Utente        |     |  Sistema       |     |  Firebase      |
|  accede        |<----|  genera        |<----|  Auth genera   |
|  all'app       |     |  sessione      |     |  token JWT     |
|                |     |                |     |                |
+----------------+     +----------------+     +----------------+
```

## 7. Flusso di Generazione Link Cliente

```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Ordine        |---->|  Sistema       |---->|  Sistema       |
|  creato e      |     |  genera        |     |  salva link    |
|  assegnato     |     |  link unico    |     |  in database   |
+----------------+     +----------------+     +----------------+
                                                      |
                                                      v
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Cliente       |     |  Sistema       |     |  Admin         |
|  riceve        |<----|  invia link    |<----|  seleziona     |
|  link via      |     |  via SMS/email |     |  metodo invio  |
|  SMS/email     |     |                |     |                |
+----------------+     +----------------+     +----------------+
        |
        v
+----------------+     +----------------+
|                |     |                |
|  Cliente       |---->|  Cliente       |
|  apre link     |     |  visualizza    |
|                |     |  tracking      |
|                |     |                |
+----------------+     +----------------+
```

## 8. Flusso di Riordino Tappe da parte del Corriere

```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Corriere      |---->|  Corriere      |---->|  Corriere      |
|  visualizza    |     |  trascina      |     |  rilascia      |
|  lista tappe   |     |  tappa         |     |  in nuova      |
|                |     |                |     |  posizione     |
+----------------+     +----------------+     +----------------+
                                                      |
                                                      v
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Corriere      |     |  Sistema       |     |  Sistema       |
|  visualizza    |<----|  aggiorna      |<----|  salva nuovo   |
|  percorso      |     |  percorso      |     |  ordine in DB  |
|  aggiornato    |     |  su mappa      |     |                |
+----------------+     +----------------+     +----------------+
        |
        v
+----------------+     +----------------+
|                |     |                |
|  Admin         |---->|  Admin         |
|  riceve        |     |  visualizza    |
|  notifica      |     |  modifica      |
|  modifica      |     |                |
+----------------+     +----------------+
```
