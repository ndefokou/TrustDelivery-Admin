import { useParams, useNavigate } from 'react-router-dom'
import { useMerchant } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/Badge'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { ArrowLeft, Store, Mail, Phone, MapPin, Package, DollarSign, TrendingUp } from 'lucide-react'

export default function MerchantDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: merchant, isLoading } = useMerchant(id!)

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
                <Button className="w-full" variant="success">Activate Merchant</Button>
              ) : (
                <Button className="w-full" variant="danger">Suspend Merchant</Button>
              )}
              <Button className="w-full" variant="secondary">Edit Profile</Button>
              <Button className="w-full" variant="secondary">View Payment History</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}