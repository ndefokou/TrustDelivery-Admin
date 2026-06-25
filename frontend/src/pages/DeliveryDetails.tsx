import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDelivery, useCarriers, useAssignCarrier, useCancelDelivery } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import { StatusBadge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ArrowLeft, MapPin, Phone, User, Package, CheckCircle, Clock, Truck, Store } from 'lucide-react'
import { format } from 'date-fns'

export default function DeliveryDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: deliveryData, isLoading, error } = useDelivery(id!)
  const { data: carriers } = useCarriers()
  
  const delivery = deliveryData?.delivery
  const merchant = deliveryData?.merchant
  const carrier = deliveryData?.carrier
  
  const assignCarrier = useAssignCarrier()
  const cancelDelivery = useCancelDelivery()

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedCarrier, setSelectedCarrier] = useState('')

  const handleAssign = async () => {
    if (!id || !selectedCarrier) return
    try {
      await assignCarrier.mutateAsync({ deliveryId: id, carrierId: selectedCarrier })
      setShowAssignModal(false)
      setSelectedCarrier('')
    } catch (error) {
      console.error('Failed to assign carrier:', error)
    }
  }

  const handleCancel = async () => {
    if (!id) return
    if (!confirm('Are you sure you want to cancel this delivery?')) return
    try {
      await cancelDelivery.mutateAsync(id)
      navigate('/deliveries')
    } catch (error) {
      console.error('Failed to cancel delivery:', error)
      alert('Failed to cancel delivery')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    )
  }

  if (error || !delivery?.id) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{error ? 'Error loading delivery' : 'Delivery not found'}</p>
        <Button onClick={() => navigate('/deliveries')} className="mt-4">Back to Deliveries</Button>
      </div>
    )
  }

  const statusTimeline = [
    { status: 'created', label: 'Created', date: delivery.created_at, icon: Clock },
    { status: 'paid', label: 'Paid', date: delivery.paid_at, icon: CheckCircle },
    { status: 'assigned', label: 'Assigned', date: delivery.assigned_at, icon: User },
    { status: 'in_transit', label: 'In Transit', date: delivery.picked_up_at, icon: Package },
    { status: 'delivered', label: 'Delivered', date: delivery.delivered_at, icon: CheckCircle },
  ]

  const currentStatusIndex = statusTimeline.findIndex(s => s.status === delivery.status)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button variant="ghost" onClick={() => navigate('/deliveries')} className="self-start">
          <ArrowLeft size={20} />
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Delivery #{delivery.id.slice(0, 8)}</h1>
          <StatusBadge status={delivery.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Delivery ID</p>
                  <p className="font-mono text-xs sm:text-sm break-all">{delivery.id}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Status</p>
                  <StatusBadge status={delivery.status} />
                </div>
                <div className="col-span-2 sm:col-span-2">
                  <p className="text-xs sm:text-sm text-gray-500">Product Description</p>
                  <p className="text-sm sm:text-base">{delivery.product_description}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Product Value</p>
                  <p className="font-semibold text-sm sm:text-base">{delivery.product_value.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Delivery Cost</p>
                  <p className="font-semibold text-secondary text-sm sm:text-base">{delivery.delivery_cost.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Distance</p>
                  <p className="text-sm sm:text-base">
                    {delivery.distance_km > 0 ? `${delivery.distance_km.toFixed(2)} km` : 'Calculating...'}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">OTP Code</p>
                  <p className="font-mono text-sm sm:text-lg">{delivery.otp_code}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store size={20} />
                Pickup Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Merchant</p>
                  <p className="font-medium">{merchant?.business_name || 'Unknown Merchant'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>{merchant?.address || 'Address not available'}</span>
                  </p>
                </div>
                {merchant?.dispatch_latitude && merchant?.dispatch_longitude && (
                  <div>
                    <p className="text-sm text-gray-500">Coordinates</p>
                    <p className="text-sm font-mono">
                      {merchant.dispatch_latitude.toFixed(6)}, {merchant.dispatch_longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck size={20} />
                Delivery Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>{delivery.delivery_address}</span>
                  </p>
                </div>
                {delivery.delivery_lat && delivery.delivery_lng && (
                  <div>
                    <p className="text-sm text-gray-500">Coordinates</p>
                    <p className="text-sm font-mono">
                      {delivery.delivery_lat.toFixed(6)}, {delivery.delivery_lng.toFixed(6)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Distance from Pickup</p>
                  <p className="font-medium text-secondary">
                    {delivery.distance_km > 0 ? `${delivery.distance_km.toFixed(2)} km` : 'Not calculated'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{delivery.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone size={16} />
                    {delivery.customer_phone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {statusTimeline.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex
                  const Icon = step.icon
                  return (
                    <div key={step.status} className="flex items-start gap-4 mb-6 last:mb-0">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        isCompleted ? 'bg-success text-white' : 'bg-gray-200 dark:bg-primary-700 text-gray-400'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isCompleted ? 'text-success' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="text-sm text-gray-500">
                            {format(new Date(step.date), 'MMM dd, yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {delivery.assigned_carrier_id && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Carrier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{carrier?.company_name || 'Unknown Carrier'}</p>
                    <p className="text-sm text-gray-500">{carrier?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Assigned At</p>
                  <p className="font-medium">
                    {delivery.assigned_at && format(new Date(delivery.assigned_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {delivery.status === 'awaiting_assignment' && (
                <Button className="w-full" onClick={() => setShowAssignModal(true)}>Assign Carrier</Button>
              )}
              <Button className="w-full" variant="secondary" onClick={() => window.print()}>Print Receipt</Button>
              <Button className="w-full" variant="danger" disabled={delivery.status === 'delivered' || cancelDelivery.isPending} onClick={handleCancel}>
                {cancelDelivery.isPending ? 'Cancelling...' : 'Cancel Delivery'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showAssignModal}
        onClose={() => { setShowAssignModal(false); setSelectedCarrier('') }}
        title="Assign Carrier"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Select a carrier to assign to this delivery.
          </p>
          <Select
            label="Select Carrier"
            value={selectedCarrier}
            onChange={(e) => setSelectedCarrier(e.target.value)}
          >
            <option value="">Choose a carrier...</option>
            {carriers?.carriers.filter((r: any) => r.is_active).map((carrier: any) => (
              <option key={carrier.id} value={carrier.id}>
                {carrier.company_name} - {carrier.completed_deliveries || 0} completed
              </option>
            ))}
          </Select>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!selectedCarrier || assignCarrier.isPending}>
              {assignCarrier.isPending ? 'Assigning...' : 'Assign Carrier'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}