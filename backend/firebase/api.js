// API RESTful per l'app di logistica ricambi auto
import express from 'express';
import cors from 'cors';
import authService from '../auth/authService.js';
import databaseService from '../database/databaseService.js';
import notificationService from '../functions/notificationService.js';

// Inizializza Express
const app = express();
app.use(cors());
app.use(express.json());

// Middleware per verificare l'autenticazione
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token di autenticazione mancante' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    // In una implementazione reale, verificheremmo il token con Firebase Admin SDK
    // Per ora, simuliamo la verifica
    
    // Simulazione di un utente autenticato
    req.user = {
      uid: 'user123',
      email: 'user@example.com',
      role: 'admin'
    };
    
    next();
  } catch (error) {
    console.error('Errore durante l\'autenticazione:', error);
    res.status(401).json({ error: 'Autenticazione fallita' });
  }
};

// Middleware per verificare il ruolo admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Accesso negato: richiesto ruolo admin' });
  }
};

// Middleware per verificare il ruolo corriere
const requireCourier = (req, res, next) => {
  if (req.user && req.user.role === 'courier') {
    next();
  } else {
    res.status(403).json({ error: 'Accesso negato: richiesto ruolo corriere' });
  }
};

// Rotte per l'autenticazione
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;
    
    if (!email || !password || !displayName || !role) {
      return res.status(400).json({ error: 'Dati mancanti' });
    }
    
    const user = await authService.registerUser(email, password, displayName, role);
    res.status(201).json({ uid: user.uid });
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password richieste' });
    }
    
    const user = await authService.loginUser(email, password);
    // In una implementazione reale, genereremmo un token JWT
    res.json({ 
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      token: 'sample-token-123' // Simulazione di un token
    });
  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(401).json({ error: 'Credenziali non valide' });
  }
});

app.post('/api/auth/logout', authenticateUser, async (req, res) => {
  try {
    await authService.logoutUser();
    res.json({ success: true });
  } catch (error) {
    console.error('Errore durante il logout:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email richiesta' });
    }
    
    await authService.resetPassword(email);
    res.json({ success: true });
  } catch (error) {
    console.error('Errore durante il reset della password:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rotte per i clienti
app.get('/api/clients', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const clients = await databaseService.getAllClients();
    res.json(clients);
  } catch (error) {
    console.error('Errore durante il recupero dei clienti:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clients/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const client = await databaseService.getClient(req.params.id);
    
    if (!client) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Errore durante il recupero del cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const clientData = req.body;
    
    if (!clientData.firstName || !clientData.lastName || !clientData.address) {
      return res.status(400).json({ error: 'Dati cliente incompleti' });
    }
    
    const clientId = await databaseService.createClient(clientData);
    res.status(201).json({ id: clientId });
  } catch (error) {
    console.error('Errore durante la creazione del cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/clients/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const clientId = req.params.id;
    const clientData = req.body;
    
    await databaseService.updateClient(clientId, clientData);
    res.json({ success: true });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/clients/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const clientId = req.params.id;
    
    await databaseService.deleteClient(clientId);
    res.json({ success: true });
  } catch (error) {
    console.error('Errore durante l\'eliminazione del cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rotte per gli ordini
app.get('/api/orders', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const orders = await databaseService.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Errore durante il recupero degli ordini:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id', authenticateUser, async (req, res) => {
  try {
    const order = await databaseService.getOrder(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Ordine non trovato' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Errore durante il recupero dell\'ordine:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clients/:id/orders', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const clientId = req.params.id;
    const orders = await databaseService.getClientOrders(clientId);
    
    res.json(orders);
  } catch (error) {
    console.error('Errore durante il recupero degli ordini del cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const orderData = req.body;
    
    if (!orderData.clientId || !orderData.items) {
      return res.status(400).json({ error: 'Dati ordine incompleti' });
    }
    
    const orderId = await databaseService.createOrder(orderData);
    
    // Genera link di tracking
    const trackingLink = notificationService.generateTrackingLink(orderId);
    
    // Aggiorna l'ordine con il link di tracking
    await databaseService.updateOrder(orderId, { trackingLink });
    
    res.status(201).json({ id: orderId, trackingLink });
  } catch (error) {
    console.error('Errore durante la creazione dell\'ordine:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderData = req.body;
    
    await databaseService.updateOrder(orderId, orderData);
    res.json({ success: true });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dell\'ordine:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rotte per le consegne
app.post('/api/deliveries', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const deliveryData = req.body;
    
    if (!deliveryData.orderId || !deliveryData.courierId) {
      return res.status(400).json({ error: 'Dati consegna incompleti' });
    }
    
    const deliveryId = await databaseService.createDelivery(deliveryData);
    res.status(201).json({ id: deliveryId });
  } catch (error) {
    console.error('Errore durante la creazione della consegna:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/deliveries/:id/status', authenticateUser, async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Stato consegna richiesto' });
    }
    
    await databaseService.updateDeliveryStatus(deliveryId, status);
    res.json({ success: true });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dello stato della consegna:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/couriers/:id/deliveries', authenticateUser, async (req, res) => {
  try {
    const courierId = req.params.id;
    
    // Verifica che l'utente sia il corriere stesso o un admin
    if (req.user.role !== 'admin' && req.user.uid !== courierId) {
      return res.status(403).json({ error: 'Accesso negato' });
    }
    
    const deliveries = await databaseService.getCourierDeliveries(courierId);
    res.json(deliveries);
  } catch (error) {
    console.error('Errore durante il recupero delle consegne del corriere:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rotte per la posizione dei corrieri
app.post('/api/couriers/:id/location', authenticateUser, async (req, res) => {
  try {
    const courierId = req.params.id;
    const { coordinates, ...additionalData } = req.body;
    
    // Verifica che l'utente sia il corriere stesso o un admin
    if (req.user.role !== 'admin' && req.user.uid !== courierId) {
      return res.status(403).json({ error: 'Accesso negato' });
    }
    
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      return res.status(400).json({ error: 'Coordinate richieste' });
    }
    
    await databaseService.updateCourierLocation(courierId, coordinates, additionalData);
    res.json({ success: true });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento della posizione del corriere:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/couriers/:id/location', async (req, res) => {
  try {
    const courierId = req.params.id;
    const location = await databaseService.getCourierLocation(courierId);
    
    if (!location) {
      return res.status(404).json({ error: 'Posizione non trovata' });
    }
    
    res.json(location);
  } catch (error) {
    console.error('Errore durante il recupero della posizione del corriere:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rotte per i percorsi
app.post('/api/routes', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const routeData = req.body;
    
    if (!routeData.courierId || !routeData.date || !routeData.stops) {
      return res.status(400).json({ error: 'Dati percorso incompleti' });
    }
    
    const routeId = await databaseService.createRoute(routeData);
    res.status(201).json({ id: routeId });
  } catch (error) {
    console.error('Errore durante la creazione del percorso:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/routes/:id', authenticateUser, async (req, res) => {
  try {
    const routeId = req.params.id;
    const routeData = req.body;
    
    await databaseService.updateRoute(routeId, routeData);
    res.json({ success: true });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del percorso:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/couriers/:id/routes', authenticateUser, async (req, res) => {
  try {
    const courierId = req.params.id;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Data richiesta' });
    }
    
    const route = await databaseService.getCourierRoute(courierId, date);
    
    if (!route) {
      return res.status(404).json({ error: 'Percorso non trovato' });
    }
    
    res.json(route);
  } catch (error) {
    console.error('Errore durante il recupero del percorso del corriere:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rotte per le richieste di scambio
app.post('/api/exchange-requests', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const exchangeData = req.body;
    
    if (!exchangeData.fromCourierId || !exchangeData.toCourierId || !exchangeData.deliveryIds) {
      return res.status(400).json({ error: 'Dati richiesta di scambio incompleti' });
    }
    
    const exchangeId = await databaseService.createExchangeRequest(exchangeData);
    res.status(201).json({ id: exchangeId });
  } catch (error) {
    console.error('Errore durante la creazione della richiesta di scambio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/exchange-requests/:id/status', authenticateUser, async (req, res) => {
  try {
    const exchangeId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Stato richiesto' });
    }
    
    await databaseService.updateExchangeRequestStatus(exchangeId, status);
    res.json({ success: true });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dello stato della richiesta di scambio:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/couriers/:id/exchange-requests', authenticateUser, async (req, res) => {
  try {
    const courierId = req.params.id;
    
    // Verifica che l'utente sia il corriere stesso o un admin
    if (req.user.role !== 'admin' && req.user.uid !== courierId) {
      return res.status(403).json({ error: 'Accesso negato' });
    }
    
    const exchangeRequests = await databaseService.getCourierExchangeRequests(courierId);
    res.json(exchangeRequests);
  } catch (error) {
    console.error('Errore durante il recupero delle richieste di scambio del corriere:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rotta per il calcolo dell'ETA
app.post('/api/calculate-eta', async (req, res) => {
  try {
    const { origin, destination, mode } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origine e destinazione richieste' });
    }
    
    const eta = await notificationService.calculateETA(origin, destination, mode);
    res.json(eta);
  } catch (error) {
    console.error('Errore durante il calcolo dell\'ETA:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rotta per il tracking pubblico (accessibile senza autenticazione)
app.get('/api/tracking/:trackingId', async (req, res) => {
  try {
    const trackingId = req.params.trackingId;
    const orderId = Buffer.from(trackingId, 'base64').toString();
    
    const order = await databaseService.getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Ordine non trovato' });
    }
    
    // Ottieni la consegna associata all'ordine
    const deliveriesRef = collection(db, 'deliveries');
    const q = query(deliveriesRef, where('orderId', '==', orderId), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'Consegna non trovata' });
    }
    
    const delivery = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    
    // Ottieni la posizione del corriere
    const courierLocation = await databaseService.getCourierLocation(delivery.courierId);
    
    // Restituisci solo le informazioni necessarie per il tracking pubblico
    res.json({
      orderId: order.id,
      status: delivery.status,
      estimatedArrival: delivery.estimatedArrival,
      courierLocation: courierLocation ? courierLocation.coordinates : null
    });
  } catch (error) {
    console.error('Errore durante il recupero delle informazioni di tracking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Esporta l'app Express per l'utilizzo con Firebase Cloud Functions
export default app;
