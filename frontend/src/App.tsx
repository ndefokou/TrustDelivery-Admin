import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Deliveries from './pages/Deliveries'
import DeliveryDetails from './pages/DeliveryDetails'
import AwaitingAssignment from './pages/AwaitingAssignment'
import Riders from './pages/Riders'
import RiderDetails from './pages/RiderDetails'
import RiderCollections from './pages/RiderCollections'
import Merchants from './pages/Merchants'
import MerchantDetails from './pages/MerchantDetails'
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
          <Route path="deliveries/awaiting" element={<AwaitingAssignment />} />
          <Route path="riders" element={<Riders />} />
          <Route path="riders/:id" element={<RiderDetails />} />
          <Route path="riders/collections" element={<RiderCollections />} />
          <Route path="merchants" element={<Merchants />} />
          <Route path="merchants/:id" element={<MerchantDetails />} />
          <Route path="reports" element={<Reports />} />
          <Route path="payments" element={<Payments />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </Router>
  )
}