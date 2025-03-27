import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import ClientTrackingService from '../services/ClientTrackingService';

// Componente per la pagina di tracking cliente
const ClientTrackingPage = ({ route }) => {
  const { trackingToken } = route.params;
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        setLoading(true);
        const deliveryData = await ClientTrackingService.getDeliveryByToken(trackingToken);
        setDelivery(deliveryData);
        
        // Inizia ad ascoltare gli aggiornamenti
        const unsubscribe = ClientTrackingService.listenToDelivery(deliveryData.id, (updatedDelivery) => {
          setDelivery(updatedDelivery);
        });
        
        return () => {
          unsubscribe();
        };
      } catch (err) {
        setError(err.message || 'Errore durante il caricamento del tracking');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDelivery();
  }, [trackingToken]);
  
  // Genera l'HTML per la pagina di tracking
  const generateTrackingHTML = () => {
    if (!delivery || !delivery.courierLocation) {
      return `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
              .container { max-width: 600px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 20px; }
              .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
              .message { text-align: center; margin: 40px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">PartsDelivery</div>
                <p>Tracking della consegna</p>
              </div>
              <div class="message">
                <p>Informazioni di tracking non disponibili al momento.</p>
                <p>Si prega di riprovare più tardi.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }
    
    const { courierLocation, destination, eta, estimatedTimeMinutes, remainingDistanceKm, status, items, orderId } = delivery;
    const formattedETA = ClientTrackingService.formatETA(eta);
    const remainingTime = ClientTrackingService.calculateRemainingTime(eta);
    
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #4f46e5; margin-bottom: 5px; }
            .subtitle { font-size: 16px; color: #6b7280; margin-top: 0; }
            .map-container { height: 300px; margin-bottom: 20px; border-radius: 8px; overflow: hidden; }
            .info-card { background-color: #fff; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .info-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #111827; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .info-label { color: #6b7280; }
            .info-value { font-weight: 500; color: #111827; }
            .status-badge { display: inline-block; padding: 4px 8px; border-radius: 16px; font-size: 12px; font-weight: 500; }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .status-in-progress { background-color: #dbeafe; color: #1e40af; }
            .status-completed { background-color: #d1fae5; color: #065f46; }
            .eta-highlight { font-size: 20px; font-weight: bold; color: #4f46e5; text-align: center; margin: 15px 0; }
            .items-list { list-style-type: none; padding: 0; }
            .item { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
            .item:last-child { border-bottom: none; }
          </style>
          <script src="https://maps.googleapis.com/maps/api/js?key=${googleMapsConfig.apiKey}"></script>
          <script>
            function initMap() {
              const courierLocation = {
                lat: ${courierLocation.latitude},
                lng: ${courierLocation.longitude}
              };
              
              const destination = {
                lat: ${destination.latitude},
                lng: ${destination.longitude}
              };
              
              const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 13,
                center: courierLocation,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                zoomControl: true,
              });
              
              // Marker per il corriere
              const courierMarker = new google.maps.Marker({
                position: courierLocation,
                map: map,
                title: "Posizione corriere",
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: "#4f46e5",
                  fillOpacity: 0.9,
                  strokeWeight: 2,
                  strokeColor: "#FFFFFF",
                  scale: 10
                },
                animation: google.maps.Animation.BOUNCE
              });
              
              // Marker per la destinazione
              const destinationMarker = new google.maps.Marker({
                position: destination,
                map: map,
                title: "Destinazione",
                icon: {
                  path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                  fillColor: "#ef4444",
                  fillOpacity: 0.9,
                  strokeWeight: 2,
                  strokeColor: "#FFFFFF",
                  scale: 6
                }
              });
              
              // Traccia il percorso
              const directionsService = new google.maps.DirectionsService();
              const directionsRenderer = new google.maps.DirectionsRenderer({
                map: map,
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#4f46e5",
                  strokeWeight: 5,
                  strokeOpacity: 0.7
                }
              });
              
              directionsService.route(
                {
                  origin: courierLocation,
                  destination: destination,
                  travelMode: google.maps.TravelMode.DRIVING
                },
                (response, status) => {
                  if (status === "OK") {
                    directionsRenderer.setDirections(response);
                  }
                }
              );
              
              // Adatta la mappa per mostrare entrambi i marker
              const bounds = new google.maps.LatLngBounds();
              bounds.extend(courierLocation);
              bounds.extend(destination);
              map.fitBounds(bounds);
            }
          </script>
        </head>
        <body onload="initMap()">
          <div class="container">
            <div class="header">
              <div class="logo">PartsDelivery</div>
              <p class="subtitle">Tracking della consegna #${orderId}</p>
            </div>
            
            <div class="map-container" id="map"></div>
            
            <div class="eta-highlight">
              Arrivo stimato: ${remainingTime}
            </div>
            
            <div class="info-card">
              <div class="info-title">Stato Consegna</div>
              <div class="info-row">
                <span class="info-label">Stato:</span>
                <span class="status-badge ${status === 'pending' ? 'status-pending' : status === 'in_progress' ? 'status-in-progress' : 'status-completed'}">
                  ${status === 'pending' ? 'In attesa' : status === 'in_progress' ? 'In corso' : 'Completato'}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">ETA:</span>
                <span class="info-value">${formattedETA}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tempo stimato:</span>
                <span class="info-value">${estimatedTimeMinutes} minuti</span>
              </div>
              <div class="info-row">
                <span class="info-label">Distanza rimanente:</span>
                <span class="info-value">${remainingDistanceKm} km</span>
              </div>
            </div>
            
            <div class="info-card">
              <div class="info-title">Dettagli Ordine</div>
              <div class="info-row">
                <span class="info-label">Numero ordine:</span>
                <span class="info-value">${orderId}</span>
              </div>
              <div class="info-title" style="margin-top: 15px;">Articoli</div>
              <ul class="items-list">
                ${items.map(item => `
                  <li class="item">
                    <div class="info-row">
                      <span class="info-value">${item.name}</span>
                      <span class="info-label">x${item.quantity}</span>
                    </div>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        </body>
      </html>
    `;
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Caricamento tracking...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Errore</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <WebView
        source={{ html: generateTrackingHTML() }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.webviewLoading}>
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
});

export default ClientTrackingPage;
