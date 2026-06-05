import { useParams, useNavigate } from 'react-router-dom'
import { useRider } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/Badge'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { ArrowLeft, User, Phone, MapPin, Bike, Award, DollarSign, Package, XCircle, CheckCircle } from 'lucide-react'

export default function RiderDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: rider, isLoading } = useRider(id!)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    )
  }

  if (!rider) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Rider not found</p>
        <Button onClick={() => navigate('/riders')} className="mt-4">Back to Riders</Button>
      </div>
    )
  }

  const successRate = rider.total_deliveries > 0 
    ? ((rider.completed_deliveries / rider.total_deliveries) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button variant="ghost" onClick={() => navigate('/riders')} className="self-start">
          <ArrowLeft size={20} />
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{rider.full_name}</h1>
          <StatusBadge status={rider.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{rider.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone size={16} />
                    {rider.phone_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">National ID</p>
                  <p className="font-mono">{rider.national_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Motorbike Registration</p>
                  <p className="flex items-center gap-2">
                    <Bike size={16} className="text-secondary" />
                    {rider.motorbike_registration}
                  </p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="text-secondary flex-shrink-0 mt-0.5" />
                    <span>{rider.address}</span>
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
                <span className="font-bold text-xl">{rider.total_deliveries}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-success" />
                  <span>Completed</span>
                </div>
                <span className="font-bold text-success">{rider.completed_deliveries}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle size={20} className="text-danger" />
                  <span>Failed</span>
                </div>
                <span className="font-bold text-danger">{rider.failed_deliveries}</span>
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
                <span className="font-bold text-success">{rider.total_revenue.toLocaleString()} FCFA</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rider.status === 'suspended' ? (
                <Button className="w-full" variant="success">Activate Rider</Button>
              ) : (
                <Button className="w-full" variant="danger">Suspend Rider</Button>
              )}
              <Button className="w-full" variant="secondary">Edit Profile</Button>
              <Button className="w-full" variant="secondary">View Expenses</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}