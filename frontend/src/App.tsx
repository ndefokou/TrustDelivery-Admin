import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Deliveries from './pages/Deliveries'
import DeliveryDetails from './pages/DeliveryDetails'
import Carriers from './pages/Carriers'
import CarrierDetails from './pages/CarrierDetails'
import CarrierCollections from './pages/CarrierCollections'
import Merchants from './pages/Merchants'
import MerchantDetails from './pages/MerchantDetails'
import AssignmentEngine from './pages/AssignmentEngine'
import Zones from './pages/Zones'
import Pricing from './pages/Pricing'
import Disputes from './pages/Disputes'
import Reports from './pages/Reports'
import Payments from './pages/Payments'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="deliveries/:id" element={<DeliveryDetails />} />
          <Route path="carriers" element={<Carriers />} />
          <Route path="carriers/:id" element={<CarrierDetails />} />
          <Route path="carriers/collections" element={<CarrierCollections />} />
          <Route path="merchants" element={<Merchants />} />
          <Route path="merchants/:id" element={<MerchantDetails />} />
          <Route path="assignment-engine" element={<AssignmentEngine />} />
          <Route path="zones" element={<Zones />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="disputes" element={<Disputes />} />
          <Route path="reports" element={<Reports />} />
          <Route path="payments" element={<Payments />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </Router>
  )
}