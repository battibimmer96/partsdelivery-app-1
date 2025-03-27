import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import './index.css';

// Importazione pagine
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Orders from './pages/Orders';
import Couriers from './pages/Couriers';
import LiveTracking from './pages/LiveTracking';
import ClientTracking from './pages/ClientTracking';
import RouteOptimization from './pages/RouteOptimization';

// Componente per le rotte protette
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Caricamento...</div>;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/clients" element={
              <PrivateRoute>
                <Clients />
              </PrivateRoute>
            } />
            
            <Route path="/orders" element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            } />
            
            <Route path="/couriers" element={
              <PrivateRoute>
                <Couriers />
              </PrivateRoute>
            } />
            
            <Route path="/live-tracking" element={
              <PrivateRoute>
                <LiveTracking />
              </PrivateRoute>
            } />
            
            <Route path="/client-tracking" element={
              <PrivateRoute>
                <ClientTracking />
              </PrivateRoute>
            } />
            
            <Route path="/route-optimization" element={
              <PrivateRoute>
                <RouteOptimization />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
