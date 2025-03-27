# Istruzioni per il Deployment su GitHub Pages

Questo documento fornisce istruzioni dettagliate per caricare e pubblicare l'applicazione PartsDelivery su GitHub Pages.

## Prerequisiti

- Un account GitHub
- Git installato sul tuo computer
- Node.js e npm installati sul tuo computer

## Passaggi per il Deployment

### 1. Creare un nuovo repository su GitHub

1. Accedi al tuo account GitHub
2. Clicca sul pulsante "+" nell'angolo in alto a destra e seleziona "New repository"
3. Assegna al repository il nome "partsdelivery-app"
4. Scegli se rendere il repository pubblico o privato
5. Non inizializzare il repository con README, .gitignore o licenza
6. Clicca su "Create repository"

### 2. Preparare i file locali

1. Estrai il contenuto dell'archivio `github-ready-final.zip` in una directory locale
2. Apri un terminale e naviga alla directory dove hai estratto i file

### 3. Inizializzare il repository Git locale e caricare i file

```bash
# Inizializza un nuovo repository Git
git init

# Aggiungi tutti i file al repository
git add .

# Crea il primo commit
git commit -m "Initial commit"

# Collega il repository locale al repository remoto su GitHub
git remote add origin https://github.com/TUO_USERNAME/partsdelivery-app.git

# Carica i file sul repository remoto
git push -u origin main
```

### 4. Configurare GitHub Pages

1. Vai alla pagina del tuo repository su GitHub
2. Clicca su "Settings" nella barra di navigazione in alto
3. Scorri verso il basso fino alla sezione "GitHub Pages"
4. In "Source", seleziona "GitHub Actions"
5. GitHub rileverà automaticamente il workflow di deployment che abbiamo configurato

### 5. Verifica il deployment

1. Il workflow GitHub Actions inizierà automaticamente dopo il push
2. Puoi monitorare lo stato del deployment nella scheda "Actions" del tuo repository
3. Una volta completato il deployment, il tuo sito sarà disponibile all'indirizzo:
   `https://TUO_USERNAME.github.io/partsdelivery-app/`

## Struttura del Progetto

Il progetto è stato ottimizzato per GitHub Pages con le seguenti modifiche:

- Utilizzo di HashRouter invece di BrowserRouter per la compatibilità con GitHub Pages
- Base path configurato correttamente in vite.config.js
- File .nojekyll per evitare l'elaborazione Jekyll
- Pagina 404.html personalizzata
- Workflow GitHub Actions per l'automazione del deployment

## Aggiornamenti Futuri

Per aggiornare l'applicazione in futuro:

1. Modifica i file locali
2. Esegui `git add .` per aggiungere le modifiche
3. Esegui `git commit -m "Descrizione delle modifiche"` per creare un nuovo commit
4. Esegui `git push` per caricare le modifiche su GitHub
5. Il workflow GitHub Actions si attiverà automaticamente e aggiornerà il sito

## Risoluzione dei Problemi

Se riscontri problemi durante il deployment:

1. Verifica che tutti i file siano stati caricati correttamente
2. Controlla i log del workflow GitHub Actions per eventuali errori
3. Assicurati che il repository sia configurato correttamente per GitHub Pages
4. Verifica che il nome del repository corrisponda a quello configurato nel file package.json (homepage)

Per ulteriori informazioni, consulta la [documentazione ufficiale di GitHub Pages](https://docs.github.com/en/pages).
