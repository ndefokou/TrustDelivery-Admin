import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDelivery, useRiders, useAssignRider, useCancelDelivery, useRider, useMerchant } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import { StatusBadge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ArrowLeft, MapPin, Phone, User, Package, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function DeliveryDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: delivery, isLoading } = useDelivery(id!)
  const { data: riders } = useRiders()
  const { data: merchant } = useMerchant(delivery?.merchant_id || '')
  const { data: rider } = useRider(delivery?.assigned_rider_id || '')
  const assignRider = useAssignRider()
  const cancelDelivery = useCancelDelivery()

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedRider, setSelectedRider] = useState('')

  const handleAssign = async () => {
    if (!id || !selectedRider) return
    try {
      await assignRider.mutateAsync({ deliveryId: id, riderId: selectedRider })
      setShowAssignModal(false)
      setSelectedRider('')
    } catch (error) {
      console.error('Failed to assign rider:', error)
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

  if (!delivery) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Delivery not found</p>
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
                  <p className="text-sm sm:text-base">{delivery.distance_km.toFixed(2)} km</p>
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
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-sm text-gray-500">Delivery Address</p>
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>{delivery.delivery_address}</span>
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
          <Card>
            <CardHeader>
              <CardTitle>Merchant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{merchant?.business_name || 'Merchant Name'}</p>
              <p className="text-sm text-gray-500">{merchant?.email || 'merchant@example.com'}</p>
              <p className="text-sm text-gray-500">{merchant?.phone_number || '+237 6XX XXX XXX'}</p>
            </CardContent>
          </Card>

          {delivery.assigned_rider_id && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Rider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{rider?.full_name || 'Rider Name'}</p>
                    <p className="text-sm text-gray-500">{rider?.phone_number || '+237 6XX XXX XXX'}</p>
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
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {delivery.status === 'awaiting_assignment' && (
                <Button className="w-full" onClick={() => setShowAssignModal(true)}>Assign Rider</Button>
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
        onClose={() => { setShowAssignModal(false); setSelectedRider('') }}
        title="Assign Rider"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Select a rider to assign to this delivery.
          </p>
          <Select
            label="Select Rider"
            value={selectedRider}
            onChange={(e) => setSelectedRider(e.target.value)}
          >
            <option value="">Choose a rider...</option>
            {riders?.riders?.filter((r: any) => r.status === 'active').map((rider: any) => (
              <option key={rider.id} value={rider.id}>
                {rider.full_name} - {rider.completed_deliveries} completed
              </option>
            ))}
          </Select>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!selectedRider || assignRider.isPending}>
              {assignRider.isPending ? 'Assigning...' : 'Assign Rider'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}