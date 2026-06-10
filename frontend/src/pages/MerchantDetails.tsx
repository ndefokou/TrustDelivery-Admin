import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMerchant, useSuspendMerchant, useActivateMerchant, useUpdateMerchant } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { StatusBadge } from '../components/ui/Badge'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import { ArrowLeft, Store, Mail, Phone, MapPin, Package, DollarSign, TrendingUp } from 'lucide-react'
import { AxiosError } from 'axios'

export default function MerchantDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: merchant, isLoading } = useMerchant(id!)
  const suspendMerchant = useSuspendMerchant()
  const activateMerchant = useActivateMerchant()
  const updateMerchant = useUpdateMerchant()

  const [showEditModal, setShowEditModal] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    phone_number: '',
    address: '',
  })

  useEffect(() => {
    if (merchant) {
      setEditForm({
        business_name: merchant.business_name,
        owner_name: merchant.owner_name,
        email: merchant.email,
        phone_number: merchant.phone_number,
        address: merchant.address,
      })
    }
  }, [merchant])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      await updateMerchant.mutateAsync({ id, merchant: editForm })
      setShowEditModal(false)
      setEditError(null)
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>
      const message = axiosError.response?.data?.error || 'Failed to update merchant'
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

  if (!merchant) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Merchant not found</p>
        <Button onClick={() => navigate('/merchants')} className="mt-4">Back to Merchants</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button variant="ghost" onClick={() => navigate('/merchants')} className="self-start">
          <ArrowLeft size={20} />
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{merchant.business_name}</h1>
          <StatusBadge status={merchant.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store size={20} />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p className="font-medium">{merchant.business_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner Name</p>
                  <p className="font-medium">{merchant.owner_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail size={16} />
                    <span className="break-all">{merchant.email}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone size={16} />
                    {merchant.phone_number}
                  </p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>{merchant.address}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Customer</Th>
                    <Th>Amount</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td colSpan={5} className="text-center py-8 text-gray-500">
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
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={20} className="text-secondary" />
                  <span>Total Deliveries</span>
                </div>
                <span className="font-bold text-xl">{merchant.total_deliveries}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-warning" />
                  <span>Active Deliveries</span>
                </div>
                <span className="font-bold text-warning">{merchant.active_deliveries}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-success" />
                  <span>Total Revenue</span>
                </div>
                <span className="font-bold text-success">{merchant.total_revenue.toLocaleString()} FCFA</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {merchant.status === 'suspended' ? (
                <Button className="w-full" variant="success" onClick={() => activateMerchant.mutate(merchant.id)} disabled={activateMerchant.isPending}>
                  {activateMerchant.isPending ? 'Activating...' : 'Activate Merchant'}
                </Button>
              ) : (
                <Button className="w-full" variant="danger" onClick={() => suspendMerchant.mutate(merchant.id)} disabled={suspendMerchant.isPending}>
                  {suspendMerchant.isPending ? 'Suspending...' : 'Suspend Merchant'}
                </Button>
              )}
              <Button className="w-full" variant="secondary" onClick={() => setShowEditModal(true)}>Edit Profile</Button>
              <Button className="w-full" variant="secondary" onClick={() => navigate('/payments')}>View Payment History</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditError(null) }} title="Edit Merchant Profile" size="lg">
        {merchant && (
          <form onSubmit={handleUpdate} className="space-y-4">
            {editError && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-400 text-sm">
                {editError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business Name"
                value={editForm.business_name}
                onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                required
              />
              <Input
                label="Owner Name"
                value={editForm.owner_name}
                onChange={(e) => setEditForm({ ...editForm, owner_name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={editForm.phone_number}
                onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                required
              />
            </div>
            <Input
              label="Address"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              required
            />
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={updateMerchant.isPending} className="w-full sm:w-auto">
                {updateMerchant.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}