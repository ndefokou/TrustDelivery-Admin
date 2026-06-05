import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRiders, useCreateRider } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FloatingActionButton } from '../components/ui/FloatingActionButton'
import { Input, Select } from '../components/ui/Input'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { StatusBadge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Plus, Search, Eye, Edit, Ban, CheckCircle } from 'lucide-react'

export default function Riders() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ status: '', search: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRider, setNewRider] = useState({
    full_name: '',
    phone_number: '',
    national_id: '',
    address: '',
    motorbike_registration: '',
  })

  const { data: riders, isLoading } = useRiders(filters)
  const createRider = useCreateRider()

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createRider.mutateAsync(newRider)
      setShowAddModal(false)
      setNewRider({ full_name: '', phone_number: '', national_id: '', address: '', motorbike_registration: '' })
    } catch (error) {
      console.error('Failed to create rider:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Riders</h1>
        <Button onClick={() => setShowAddModal(true)} className="hidden sm:inline-flex">
          <Plus size={16} />
          Add Rider
        </Button>
      </div>

      <FloatingActionButton
        variant="primary"
        size="lg"
        onClick={() => setShowAddModal(true)}
        className="sm:hidden"
      >
        <Plus size={24} />
      </FloatingActionButton>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle>Rider List</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full sm:w-40"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="offline">Offline</option>
              <option value="busy">Busy</option>
              <option value="suspended">Suspended</option>
            </Select>
            <div className="relative flex-1 sm:flex-initial">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search riders..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <Tr>
                <Th>Rider</Th>
                <Th className="hidden sm:table-cell">Phone</Th>
                <Th>Status</Th>
                <Th className="hidden md:table-cell">Completed</Th>
                <Th className="hidden md:table-cell">Failed</Th>
                <Th className="hidden sm:table-cell">Score</Th>
                <Th className="hidden md:table-cell">Revenue</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <Tr>
                  <Td colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                    </div>
                  </Td>
                </Tr>
              ) : riders?.riders?.length === 0 ? (
                <Tr>
                  <Td colSpan={8} className="text-center py-8 text-gray-500">
                    No riders found
                  </Td>
                </Tr>
              ) : (
                riders?.riders?.map((rider: any) => (
                  <Tr key={rider.id} className="cursor-pointer" onClick={() => navigate(`/riders/${rider.id}`)}>
                    <Td>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                          {rider.full_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{rider.full_name}</p>
                          <p className="text-xs text-gray-500 hidden sm:block">{rider.motorbike_registration}</p>
                          <p className="text-xs text-gray-500 sm:hidden">{rider.phone_number}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="hidden sm:table-cell">{rider.phone_number}</Td>
                    <Td><StatusBadge status={rider.status} /></Td>
                    <Td className="hidden md:table-cell">{rider.completed_deliveries}</Td>
                    <Td className="hidden md:table-cell text-danger">{rider.failed_deliveries}</Td>
                    <Td className="hidden sm:table-cell">
                      <span className={`font-medium ${
                        rider.performance_score >= 90 ? 'text-success' :
                        rider.performance_score >= 70 ? 'text-warning' : 'text-danger'
                      }`}>
                        {rider.performance_score.toFixed(1)}%
                      </span>
                    </Td>
                    <Td className="hidden md:table-cell font-medium">{rider.total_revenue.toLocaleString()} FCFA</Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/riders/${rider.id}`) }}>
                          <Eye size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()} className="hidden sm:flex">
                          <Edit size={14} />
                        </Button>
                        {rider.status === 'suspended' ? (
                          <Button size="sm" variant="success" onClick={(e) => e.stopPropagation()}>
                            <CheckCircle size={14} />
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="text-danger" onClick={(e) => e.stopPropagation()}>
                            <Ban size={14} />
                          </Button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Rider" size="lg">
        <form onSubmit={handleCreateRider} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={newRider.full_name}
              onChange={(e) => setNewRider({ ...newRider, full_name: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={newRider.phone_number}
              onChange={(e) => setNewRider({ ...newRider, phone_number: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="National ID"
              value={newRider.national_id}
              onChange={(e) => setNewRider({ ...newRider, national_id: e.target.value })}
              required
            />
            <Input
              label="Motorbike Registration"
              value={newRider.motorbike_registration}
              onChange={(e) => setNewRider({ ...newRider, motorbike_registration: e.target.value })}
              required
            />
          </div>
          <Input
            label="Address"
            value={newRider.address}
            onChange={(e) => setNewRider({ ...newRider, address: e.target.value })}
            required
          />
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={createRider.isPending} className="w-full sm:w-auto">
              {createRider.isPending ? 'Creating...' : 'Create Rider'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}