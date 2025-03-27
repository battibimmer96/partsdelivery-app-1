import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { firebaseConfig } from '../backend/firebase/config';

// Inizializzazione Firebase
// Nota: in una implementazione reale, questo verrebbe fatto in un file separato
// e importato qui
const initializeFirebase = () => {
  // Qui verrebbe inizializzato Firebase
  console.log('Firebase inizializzato con config:', firebaseConfig);
};

// Schermata di Login
const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    // Simuliamo un login
    setTimeout(() => {
      setLoading(false);
      // Per ora, accettiamo qualsiasi credenziale
      navigation.replace('Main');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <View style={styles.loginContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>PartsDelivery</Text>
          <Text style={styles.logoSubtext}>App Corriere</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Inserisci la tua email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Inserisci la tua password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Accedi</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Schermata Home/Dashboard
const HomeScreen = ({ navigation }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0
  });

  // Dati di esempio per le consegne
  const mockDeliveries = [
    {
      id: 'del-001',
      orderId: 'ord-001',
      clientName: 'Autoricambi Rossi',
      address: 'Via Roma 123, Milano',
      status: 'in_progress',
      eta: '2025-03-27T11:30:00Z',
      items: [
        { id: 'item-001', name: 'Filtro olio', quantity: 2 },
        { id: 'item-002', name: 'Pastiglie freno', quantity: 1 }
      ]
    },
    {
      id: 'del-002',
      orderId: 'ord-003',
      clientName: 'Carrozzeria Verdi',
      address: 'Via Torino 789, Milano',
      status: 'pending',
      eta: '2025-03-27T13:15:00Z',
      items: [
        { id: 'item-003', name: 'Paraurti anteriore', quantity: 1 },
        { id: 'item-004', name: 'Faro sinistro', quantity: 1 }
      ]
    },
    {
      id: 'del-003',
      orderId: 'ord-005',
      clientName: 'Ricambi Auto Blu',
      address: 'Via Bologna 654, Milano',
      status: 'completed',
      completedAt: '2025-03-27T09:45:00Z',
      items: [
        { id: 'item-005', name: 'Batteria 12V', quantity: 1 }
      ]
    }
  ];

  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      try {
        // Simuliamo una chiamata API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In una implementazione reale, qui chiameremmo le API
        // const response = await fetch('/api/courier/deliveries');
        // const data = await response.json();
        
        // Per ora usiamo i dati di esempio
        setDeliveries(mockDeliveries);
        
        // Calcoliamo le statistiche
        const total = mockDeliveries.length;
        const completed = mockDeliveries.filter(d => d.status === 'completed').length;
        const inProgress = mockDeliveries.filter(d => d.status === 'in_progress').length;
        const pending = mockDeliveries.filter(d => d.status === 'pending').length;
        
        setStats({
          total,
          completed,
          inProgress,
          pending
        });
      } catch (error) {
        console.error('Errore durante il caricamento delle consegne:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // Funzione per formattare la data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funzione per ottenere il colore dello stato
  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
        return '#3b82f6'; // blue-500
      case 'pending':
        return '#f59e0b'; // amber-500
      case 'completed':
        return '#10b981'; // emerald-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  // Funzione per tradurre lo stato
  const translateStatus = (status) => {
    switch (status) {
      case 'in_progress':
        return 'In corso';
      case 'pending':
        return 'In attesa';
      case 'completed':
        return 'Completato';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Caricamento consegne...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Statistiche */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Totali</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#10b981' }]}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completate</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#3b82f6' }]}>{stats.inProgress}</Text>
              <Text style={styles.statLabel}>In corso</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>{stats.pending}</Text>
              <Text style={styles.statLabel}>In attesa</Text>
            </View>
          </View>
          
          {/* Lista consegne */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Le tue consegne</Text>
            
            {deliveries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nessuna consegna assegnata</Text>
              </View>
            ) : (
              <View style={styles.deliveriesList}>
                {deliveries.map((delivery) => (
                  <TouchableOpacity
                    key={delivery.id}
                    style={styles.deliveryCard}
                    onPress={() => navigation.navigate('DeliveryDetails', { deliveryId: delivery.id })}
                  >
                    <View style={styles.deliveryHeader}>
                      <View style={styles.deliveryInfo}>
                        <Text style={styles.deliveryClient}>{delivery.clientName}</Text>
                        <Text style={styles.deliveryAddress}>{delivery.address}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(delivery.status) }]}>
                          {translateStatus(delivery.status)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.deliveryDetails}>
                      <View style={styles.deliveryDetail}>
                        <Ionicons name="cube-outline" size={16} color="#6b7280" />
                        <Text style={styles.deliveryDetailText}>{delivery.items.length} articoli</Text>
                      </View>
                      <View style={styles.deliveryDetail}>
                        <Ionicons name="time-outline" size={16} color="#6b7280" />
                        <Text style={styles.deliveryDetailText}>
                          {delivery.status === 'completed' 
                            ? `Completata: ${formatDate(delivery.completedAt)}` 
                            : `ETA: ${formatDate(delivery.eta)}`}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.deliveryActions}>
                      {delivery.status === 'pending' && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.startButton]}
                          onPress={() => {
                            // In una implementazione reale, qui aggiorneremmo lo stato
                            alert(`Avvio consegna ${delivery.id}`);
                          }}
                        >
                          <Text style={styles.actionButtonText}>Avvia</Text>
                        </TouchableOpacity>
                      )}
                      
                      {delivery.status === 'in_progress' && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.completeButton]}
                          onPress={() => {
                            // In una implementazione reale, qui aggiorneremmo lo stato
                            alert(`Completa consegna ${delivery.id}`);
                          }}
                        >
                          <Text style={styles.actionButtonText}>Completa</Text>
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity
                        style={[styles.actionButton, styles.navigateButton]}
                        onPress={() => navigation.navigate('Map', { deliveryId: delivery.id })}
                      >
                        <Text style={styles.actionButtonText}>Naviga</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// Schermata Dettagli Consegna
const DeliveryDetailsScreen = ({ route, navigation }) => {
  const { deliveryId } = route.params;
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dati di esempio per le consegne
  const mockDeliveries = [
    {
      id: 'del-001',
      orderId: 'ord-001',
      clientName: 'Autoricambi Rossi',
      address: 'Via Roma 123, Milano',
      status: 'in_progress',
      eta: '2025-03-27T11:30:00Z',
      contactName: 'Mario Rossi',
      contactPhone: '3451234567',
      notes: 'Citofonare al magazzino sul retro',
      items: [
        { id: 'item-001', name: 'Filtro olio', quantity: 2, code: 'FO-12345' },
        { id: 'item-002', name: 'Pastiglie freno', quantity: 1, code: 'PF-67890' }
      ]
    },
    {
      id: 'del-002',
      orderId: 'ord-003',
      clientName: 'Carrozzeria Verdi',
      address: 'Via Torino 789, Milano',
      status: 'pending',
      eta: '2025-03-27T13:15:00Z',
      contactName: 'Luigi Verdi',
      contactPhone: '3467654321',
      notes: 'Consegnare entro le 13:00',
      items: [
        { id: 'item-003', name: 'Paraurti anteriore', quantity: 1, code: 'PA-12345' },
        { id: 'item-004', name: 'Faro sinistro', quantity: 1, code: 'FS-67890' }
      ]
    },
    {
      id: 'del-003',
      orderId: 'ord-005',
      clientName: 'Ricambi Auto Blu',
      address: 'Via Bologna 654, Milano',
      status: 'completed',
      completedAt: '2025-03-27T09:45:00Z',
      contactName: 'Paolo Blu',
      contactPhone: '3489876543',
      notes: '',
      items: [
        { id: 'item-005', name: 'Batteria 12V', quantity: 1, code: 'BA-12345' }
      ]
    }
  ];

  useEffect(() => {
    const fetchDelivery = async () => {
      setLoading(true);
      try {
        // Simuliamo una chiamata API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In una implementazione reale, qui chiameremmo le API
        // const response = await fetch(`/api/courier/deliveries/${deliveryId}`);
        // const data = await response.json();
        
        // Per ora usiamo i dati di esempio
        const foundDelivery = mockDeliveries.find(d => d.id === deliveryId);
        setDelivery(foundDelivery);
      } catch (error) {
        console.error('Errore durante il caricamento della consegna:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, [deliveryId]);

  // Funzione per formattare la data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funzione per ottenere il colore dello stato
  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
        return '#3b82f6'; // blue-500
      case 'pending':
        return '#f59e0b'; // amber-500
      case 'completed':
        return '#10b981'; // emerald-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  // Funzione per tradurre lo stato
  const translateStatus = (status) => {
    switch (status) {
      case 'in_progress':
        return 'In corso';
      case 'pending':
        return 'In attesa';
      case 'completed':
        return 'Completato';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#4f46e5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dettagli Consegna</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Caricamento dettagli...</Text>
        </View>
      ) : delivery ? (
        <ScrollView style={styles.scrollView}>
          {/* Informazioni cliente */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Informazioni Cliente</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cliente:</Text>
                <Text style={styles.infoValue}>{delivery.clientName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Indirizzo:</Text>
                <Text style={styles.infoValue}>{delivery.address}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Contatto:</Text>
                <Text style={styles.infoValue}>{delivery.contactName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telefono:</Text>
                <TouchableOpacity
                  onPress={() => {
                    // In una implementazione reale, qui apriremmo il telefono
                    alert(`Chiamare ${delivery.contactPhone}`);
                  }}
                >
                  <Text style={[styles.infoValue, styles.phoneLink]}>{delivery.contactPhone}</Text>
                </TouchableOpacity>
              </View>
              {delivery.notes ? (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Note:</Text>
                  <Text style={styles.notesText}>{delivery.notes}</Text>
                </View>
              ) : null}
            </View>
          </View>
          
          {/* Stato consegna */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Stato Consegna</Text>
            <View style={styles.statusCard}>
              <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor(delivery.status) + '20' }]}>
                <Text style={[styles.statusTextLarge, { color: getStatusColor(delivery.status) }]}>
                  {translateStatus(delivery.status)}
                </Text>
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>
                  {delivery.status === 'completed' ? 'Completata il:' : 'ETA:'}
                </Text>
                <Text style={styles.statusTime}>
                  {delivery.status === 'completed' 
                    ? formatDate(delivery.completedAt) 
                    : formatDate(delivery.eta)}
                </Text>
              </View>
              
              {delivery.status !== 'completed' && (
                <View style={styles.statusActions}>
                  {delivery.status === 'pending' ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.startButton, styles.fullWidthButton]}
                      onPress={() => {
                        // In una implementazione reale, qui aggiorneremmo lo stato
                        alert(`Avvio consegna ${delivery.id}`);
                      }}
                    >
                      <Text style={styles.actionButtonText}>Avvia Consegna</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.completeButton, styles.fullWidthButton]}
                      onPress={() => {
                        // In una implementazione reale, qui aggiorneremmo lo stato
                        alert(`Completa consegna ${delivery.id}`);
                      }}
                    >
                      <Text style={styles.actionButtonText}>Completa Consegna</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
          
          {/* Articoli */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Articoli</Text>
            <View style={styles.itemsCard}>
              {delivery.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCode}>{item.code}</Text>
                  </View>
                  <View style={styles.itemQuantity}>
                    <Text style={styles.itemQuantityText}>x{item.quantity}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          
          {/* Azioni */}
          <View style={styles.sectionContainer}>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.navigateButton, styles.largeButton]}
                onPress={() => navigation.navigate('Map', { deliveryId: delivery.id })}
              >
                <Ionicons name="navigate" size={20} color="#ffffff" style={styles.actionIcon} />
                <Text style={styles.actionButtonText}>Naviga</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton, styles.largeButton]}
                onPress={() => {
                  // In una implementazione reale, qui condivideremmo il link di tracking
                  alert(`Condividi link di tracking per ${delivery.id}`);
                }}
              >
                <Ionicons name="share-outline" size={20} color="#ffffff" style={styles.actionIcon} />
                <Text style={styles.actionButtonText}>Condividi Tracking</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Consegna non trovata</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// Schermata Mappa
const MapScreen = ({ route, navigation }) => {
  const { deliveryId } = route.params;
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Dati di esempio per le consegne
  const mockDeliveries = [
    {
      id: 'del-001',
      orderId: 'ord-001',
      clientName: 'Autoricambi Rossi',
      address: 'Via Roma 123, Milano',
      coordinates: {
        latitude: 45.4642,
        longitude: 9.1900
      },
      status: 'in_progress',
      eta: '2025-03-27T11:30:00Z'
    },
    {
      id: 'del-002',
      orderId: 'ord-003',
      clientName: 'Carrozzeria Verdi',
      address: 'Via Torino 789, Milano',
      coordinates: {
        latitude: 45.4700,
        longitude: 9.1950
      },
      status: 'pending',
      eta: '2025-03-27T13:15:00Z'
    },
    {
      id: 'del-003',
      orderId: 'ord-005',
      clientName: 'Ricambi Auto Blu',
      address: 'Via Bologna 654, Milano',
      coordinates: {
        latitude: 45.4650,
        longitude: 9.1850
      },
      status: 'completed',
      completedAt: '2025-03-27T09:45:00Z'
    }
  ];

  useEffect(() => {
    const fetchDelivery = async () => {
      setLoading(true);
      try {
        // Simuliamo una chiamata API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In una implementazione reale, qui chiameremmo le API
        // const response = await fetch(`/api/courier/deliveries/${deliveryId}`);
        // const data = await response.json();
        
        // Per ora usiamo i dati di esempio
        const foundDelivery = mockDeliveries.find(d => d.id === deliveryId);
        setDelivery(foundDelivery);
      } catch (error) {
        console.error('Errore durante il caricamento della consegna:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, [deliveryId]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permesso di accesso alla posizione negato');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      // In una implementazione reale, qui invieremmo la posizione al backend
      console.log('Posizione corrente:', location);
      
      // Simuliamo l'invio periodico della posizione
      const locationInterval = setInterval(async () => {
        let newLocation = await Location.getCurrentPositionAsync({});
        setLocation(newLocation);
        
        // In una implementazione reale, qui invieremmo la posizione al backend
        console.log('Nuova posizione:', newLocation);
      }, 10000); // ogni 10 secondi
      
      return () => clearInterval(locationInterval);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#4f46e5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Navigazione</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Caricamento mappa...</Text>
        </View>
      ) : delivery ? (
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>
              Qui verrà visualizzata la mappa con la navigazione verso:
            </Text>
            <Text style={styles.mapPlaceholderDestination}>
              {delivery.clientName}
            </Text>
            <Text style={styles.mapPlaceholderAddress}>
              {delivery.address}
            </Text>
            
            {location ? (
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>La tua posizione:</Text>
                <Text style={styles.locationCoords}>
                  Lat: {location.coords.latitude.toFixed(6)}, Lng: {location.coords.longitude.toFixed(6)}
                </Text>
              </View>
            ) : errorMsg ? (
              <Text style={styles.errorText}>{errorMsg}</Text>
            ) : (
              <ActivityIndicator size="small" color="#4f46e5" />
            )}
          </View>
          
          <View style={styles.navigationActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton, styles.fullWidthButton]}
              onPress={() => {
                // In una implementazione reale, qui apriremmo Google Maps
                alert(`Avvia navigazione verso ${delivery.address}`);
              }}
            >
              <Ionicons name="navigate" size={20} color="#ffffff" style={styles.actionIcon} />
              <Text style={styles.actionButtonText}>Avvia Navigazione con Google Maps</Text>
            </TouchableOpacity>
            
            {delivery.status === 'in_progress' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton, styles.fullWidthButton, styles.marginTop]}
                onPress={() => {
                  // In una implementazione reale, qui aggiorneremmo lo stato
                  alert(`Completa consegna ${delivery.id}`);
                  navigation.goBack();
                }}
              >
                <Ionicons name="checkmark" size={20} color="#ffffff" style={styles.actionIcon} />
                <Text style={styles.actionButtonText}>Completa Consegna</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Consegna non trovata</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// Schermata Profilo
const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    id: 'cou-001',
    firstName: 'Luca',
    lastName: 'Bianchi',
    email: 'luca.bianchi@partsdelivery.it',
    phoneNumber: '3451234567',
    vehicle: {
      type: 'van',
      licensePlate: 'AB123CD',
      model: 'Fiat Ducato'
    },
    stats: {
      deliveriesToday: 5,
      deliveriesCompleted: 3,
      deliveriesPending: 2,
      totalDeliveries: 120
    }
  });

  const handleLogout = () => {
    // In una implementazione reale, qui effettueremmo il logout
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profilo</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</Text>
          </View>
          <Text style={styles.profileName}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Informazioni Personali</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID Corriere:</Text>
              <Text style={styles.infoValue}>{user.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telefono:</Text>
              <Text style={styles.infoValue}>{user.phoneNumber}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Veicolo</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo:</Text>
              <Text style={styles.infoValue}>{user.vehicle.type === 'van' ? 'Furgone' : 'Auto'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Modello:</Text>
              <Text style={styles.infoValue}>{user.vehicle.model}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Targa:</Text>
              <Text style={styles.infoValue}>{user.vehicle.licensePlate}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Statistiche</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>{user.stats.deliveriesToday}</Text>
              <Text style={styles.statItemLabel}>Consegne Oggi</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>{user.stats.deliveriesCompleted}</Text>
              <Text style={styles.statItemLabel}>Completate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>{user.stats.deliveriesPending}</Text>
              <Text style={styles.statItemLabel}>In Attesa</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>{user.stats.totalDeliveries}</Text>
              <Text style={styles.statItemLabel}>Totali</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Schermata Notifiche
const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dati di esempio per le notifiche
  const mockNotifications = [
    {
      id: 'not-001',
      type: 'exchange_request',
      title: 'Richiesta di scambio',
      message: 'Richiesta di scambio della consegna del-002 con il corriere Antonio Gialli',
      timestamp: '2025-03-27T10:15:00Z',
      read: false,
      data: {
        deliveryId: 'del-002',
        courierId: 'cou-005',
        courierName: 'Antonio Gialli'
      }
    },
    {
      id: 'not-002',
      type: 'new_delivery',
      title: 'Nuova consegna assegnata',
      message: 'Ti è stata assegnata una nuova consegna per Autoricambi Rossi',
      timestamp: '2025-03-27T09:30:00Z',
      read: true,
      data: {
        deliveryId: 'del-001'
      }
    },
    {
      id: 'not-003',
      type: 'route_optimization',
      title: 'Ottimizzazione percorso',
      message: 'Il tuo percorso è stato ottimizzato per risparmiare 15 minuti',
      timestamp: '2025-03-27T08:45:00Z',
      read: true,
      data: {
        savings: {
          time: 15, // minuti
          distance: 4.5 // km
        }
      }
    }
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Simuliamo una chiamata API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In una implementazione reale, qui chiameremmo le API
        // const response = await fetch('/api/courier/notifications');
        // const data = await response.json();
        
        // Per ora usiamo i dati di esempio
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Errore durante il caricamento delle notifiche:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Funzione per formattare la data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funzione per ottenere l'icona in base al tipo di notifica
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'exchange_request':
        return 'swap-horizontal';
      case 'new_delivery':
        return 'cube';
      case 'route_optimization':
        return 'navigate';
      default:
        return 'notifications';
    }
  };

  // Funzione per ottenere il colore in base al tipo di notifica
  const getNotificationColor = (type) => {
    switch (type) {
      case 'exchange_request':
        return '#8b5cf6'; // violet-500
      case 'new_delivery':
        return '#3b82f6'; // blue-500
      case 'route_optimization':
        return '#10b981'; // emerald-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  // Funzione per gestire il click su una notifica
  const handleNotificationPress = (notification) => {
    // In una implementazione reale, qui aggiorneremmo lo stato della notifica
    // e navigheremmo alla schermata appropriata
    
    switch (notification.type) {
      case 'exchange_request':
        alert(`Gestione richiesta di scambio per la consegna ${notification.data.deliveryId}`);
        break;
      case 'new_delivery':
        navigation.navigate('DeliveryDetails', { deliveryId: notification.data.deliveryId });
        break;
      case 'route_optimization':
        alert(`Ottimizzazione percorso: risparmi ${notification.data.savings.time} minuti e ${notification.data.savings.distance} km`);
        break;
      default:
        alert(`Notifica: ${notification.message}`);
    }
    
    // Segna la notifica come letta
    setNotifications(prev => prev.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifiche</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Caricamento notifiche...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Nessuna notifica</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.notificationUnread
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={[
                  styles.notificationIconContainer,
                  { backgroundColor: getNotificationColor(notification.type) + '20' }
                ]}>
                  <Ionicons
                    name={getNotificationIcon(notification.type)}
                    size={24}
                    color={getNotificationColor(notification.type)}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{formatDate(notification.timestamp)}</Text>
                </View>
                {!notification.read && (
                  <View style={styles.notificationBadge} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// Configurazione del Tab Navigator
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ title: 'Notifiche' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profilo' }}
      />
    </Tab.Navigator>
  );
};

// Configurazione dello Stack Navigator
const Stack = createStackNavigator();

const App = () => {
  // Inizializza Firebase all'avvio dell'app
  useEffect(() => {
    initializeFirebase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="DeliveryDetails" component={DeliveryDetailsScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Stili
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  
  // Login
  loginContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  logoSubtext: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#4f46e5',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  
  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  
  // Section
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  
  // Deliveries
  deliveriesList: {
    marginBottom: 16,
  },
  deliveryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deliveryDetails: {
    marginBottom: 12,
  },
  deliveryDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deliveryDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  deliveryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#3b82f6',
    marginRight: 8,
  },
  completeButton: {
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  navigateButton: {
    backgroundColor: '#4f46e5',
  },
  shareButton: {
    backgroundColor: '#8b5cf6',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  actionIcon: {
    marginRight: 4,
  },
  
  // Info Card
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  phoneLink: {
    color: '#4f46e5',
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#111827',
  },
  
  // Status Card
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusBadgeLarge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusInfo: {
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statusTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  statusActions: {
    marginTop: 8,
  },
  fullWidthButton: {
    width: '100%',
    paddingVertical: 12,
  },
  
  // Items
  itemsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  itemCode: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  itemQuantity: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  itemQuantityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
  },
  
  // Actions
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  largeButton: {
    flex: 1,
    paddingVertical: 12,
  },
  
  // Map
  mapContainer: {
    flex: 1,
    padding: 16,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  mapPlaceholderDestination: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  mapPlaceholderAddress: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  locationInfo: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 14,
    color: '#111827',
  },
  navigationActions: {
    marginTop: 16,
  },
  marginTop: {
    marginTop: 12,
  },
  
  // Profile
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statItemValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statItemLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
  },
  
  // Notifications
  notificationsList: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationUnread: {
    backgroundColor: '#f3f4f6',
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  notificationBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    position: 'absolute',
    top: 16,
    right: 16,
  },
});

export default App;
