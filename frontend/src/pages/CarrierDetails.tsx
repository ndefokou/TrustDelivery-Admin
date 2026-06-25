import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCarrier, useSuspendCarrier, useActivateCarrier, useUpdateCarrier } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { StatusBadge } from '../components/ui/Badge'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import { ArrowLeft, User, Phone, MapPin, Award, DollarSign, Package, XCircle, CheckCircle } from 'lucide-react'
import { AxiosError } from 'axios'

export default function CarrierDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: carrier, isLoading } = useCarrier(id!)
  const suspendCarrier = useSuspendCarrier()
  const activateCarrier = useActivateCarrier()
  const updateCarrier = useUpdateCarrier()

  const [showEditModal, setShowEditModal] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    company_name: '',
    phone: '',
    email: '',
    address: '',
  })

  useEffect(() => {
    if (carrier) {
      setEditForm({
        company_name: carrier.company_name,
        phone: carrier.phone,
        email: carrier.email || '',
        address: carrier.address || '',
      })
    }
  }, [carrier])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      await updateCarrier.mutateAsync({ id, carrier: editForm })
      setShowEditModal(false)
      setEditError(null)
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>
      const message = axiosError.response?.data?.error || 'Failed to update carrier'
      setEditError(message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    )
  }

  if (!carrier) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Carrier not found</p>
        <Button onClick={() => navigate('/carriers')} className="mt-4">Back to Carriers</Button>
      </div>
    )
  }

  const successRate = (carrier.total_deliveries || 0) > 0 
    ? (((carrier.completed_deliveries || 0) / (carrier.total_deliveries || 1)) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button variant="ghost" onClick={() => navigate('/carriers')} className="self-start">
          <ArrowLeft size={20} />
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{carrier.company_name}</h1>
          <StatusBadge status={carrier.is_active ? 'active' : 'suspended'} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Carrier Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="font-medium">{carrier.company_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone size={16} />
                    {carrier.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{carrier.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Verified</p>
                  <p className="font-medium">{carrier.is_verified ? 'Yes' : 'No'}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>{carrier.address || 'N/A'}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Customer</Th>
                    <Th>Address</Th>
                    <Th>Amount</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td colSpan={6} className="text-center py-8 text-gray-500">
                      No recent deliveries
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={20} className="text-secondary" />
                  <span>Total Deliveries</span>
                </div>
                <span className="font-bold text-xl">{carrier.total_deliveries || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-success" />
                  <span>Completed</span>
                </div>
                <span className="font-bold text-success">{carrier.completed_deliveries || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle size={20} className="text-danger" />
                  <span>Failed</span>
                </div>
                <span className="font-bold text-danger">{carrier.failed_deliveries || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award size={20} className="text-warning" />
                  <span>Success Rate</span>
                </div>
                <span className="font-bold text-xl">{successRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-success" />
                  <span>Revenue Generated</span>
                </div>
                <span className="font-bold text-success">{(carrier.total_revenue || 0).toLocaleString()} FCFA</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!carrier.is_active ? (
                <Button className="w-full" variant="success" onClick={() => activateCarrier.mutate(carrier.id)} disabled={activateCarrier.isPending}>
                  {activateCarrier.isPending ? 'Activating...' : 'Activate Carrier'}
                </Button>
              ) : (
                <Button className="w-full" variant="danger" onClick={() => suspendCarrier.mutate(carrier.id)} disabled={suspendCarrier.isPending}>
                  {suspendCarrier.isPending ? 'Suspending...' : 'Suspend Carrier'}
                </Button>
              )}
              <Button className="w-full" variant="secondary" onClick={() => setShowEditModal(true)}>Edit Profile</Button>
              <Button className="w-full" variant="secondary" onClick={() => navigate('/carriers?tab=expenses')}>View Expenses</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditError(null) }} title="Edit Carrier Profile" size="lg">
        <form onSubmit={handleUpdate} className="space-y-4">
          {editError && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-400 text-sm">
              {editError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={editForm.company_name}
              onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          <Input
            label="Address"
            value={editForm.address}
            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
          />
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={updateCarrier.isPending} className="w-full sm:w-auto">
              {updateCarrier.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}